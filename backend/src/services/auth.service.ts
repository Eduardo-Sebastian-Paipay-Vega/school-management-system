import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PoolClient } from 'pg';
import { resolveInstitution, withTenant } from '../config/database';
import { redisClient } from '../config/redis';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/jwt';
import { documentHash, randomToken, tokenHash } from '../core/identity-crypto';
import { AuditService } from './audit.service';

export interface UserPayload {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  email: string | null;
  roles: string[];
  permissions: string[];
}

export interface AuthClaims extends JwtPayload {
  sub: string;
  tenantId: string;
  sid: string;
  jti: string;
  version: number;
}

type AccountRow = {
  id: string; tenant_id: string; username: string; nombres: string;
  apellido_paterno: string; apellido_materno: string | null; email: string | null;
  estado: string; auth_version: number; roles: string[]; permissions: string[];
};

function toUser(row: AccountRow): UserPayload {
  const roles = row.roles.filter(Boolean);
  return {
    id: row.id, tenantId: row.tenant_id, username: row.username,
    fullName: [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(' '),
    email: row.email, roles, permissions: row.permissions.filter(Boolean),
  };
}

async function account(client: PoolClient, userId: string): Promise<AccountRow | null> {
  const result = await client.query<AccountRow>(
    `SELECT u.id,u.tenant_id,u.username,u.estado,u.auth_version,
            p.nombres,p.apellido_paterno,p.apellido_materno,p.email,
            COALESCE(array_agg(DISTINCT r.codigo::text) FILTER (WHERE ur.activo AND r.codigo IS NOT NULL), ARRAY[]::text[]) AS roles,
            COALESCE(array_agg(DISTINCT rp.permiso_codigo::text) FILTER (WHERE ur.activo AND rp.permiso_codigo IS NOT NULL), ARRAY[]::text[]) AS permissions
       FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
       LEFT JOIN usuario_roles ur ON ur.usuario_id=u.id AND ur.tenant_id=u.tenant_id AND ur.activo
       LEFT JOIN roles r ON r.id=ur.rol_id
       LEFT JOIN rol_permisos_core rp ON rp.tenant_id=u.tenant_id AND rp.rol_id=r.id
      WHERE u.id=$1 GROUP BY u.id,p.id`, [userId]
  );
  return result.rows[0] ?? null;
}

function issueTokens(user: UserPayload, sid: string, version: number, jti: string) {
  const accessToken = jwt.sign({ tenantId: user.tenantId, sid, jti, version }, JWT_SECRET,
    { subject: user.id, expiresIn: '15m', issuer: 'sms-core', audience: 'sms-web', algorithm: 'HS256' });
  const refreshToken = jwt.sign({ tenantId: user.tenantId, sid, jti, version }, JWT_REFRESH_SECRET,
    { subject: user.id, expiresIn: '7d', issuer: 'sms-core', audience: 'sms-refresh', algorithm: 'HS256' });
  return { accessToken, refreshToken };
}

function decode(token: string, secret: string, audience: string): AuthClaims {
  const claims = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'sms-core', audience }) as AuthClaims;
  if (!claims.sub || !claims.tenantId || !claims.sid || !claims.jti || !claims.version) {
    throw new Error('Token incompleto');
  }
  return claims;
}

export class AuthService {
  static accessClaims(token: string): AuthClaims { return decode(token, JWT_SECRET, 'sms-web'); }

  static async login(codigoModular: string, identifier: string, password: string, ip: string, userAgent: string) {
    if (!redisClient.isReady) throw new Error('AUTH_RATE_LIMIT_UNAVAILABLE');
    const tenantId = await resolveInstitution(codigoModular);
    if (!tenantId) return null;
    const normalized = identifier.trim().toLowerCase();
    const rateKeys = [`login:id:${tenantId}:${tokenHash(normalized)}`,
      `login:ip:${tenantId}:${tokenHash(ip)}`];
    for (const key of rateKeys) {
      const attempts = await redisClient.incr(key);
      if (attempts === 1) await redisClient.expire(key, 900);
      if (attempts > 5) throw new Error('TOO_MANY_ATTEMPTS');
    }
    const docHash = /^\d{8}$/.test(normalized) ? documentHash(normalized) : null;
    return withTenant(tenantId, '', async (client) => {
      const result = await client.query<{ id: string }>(
        `SELECT u.id FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
          WHERE u.tenant_id=$1 AND u.estado='ACTIVO'
            AND (lower(u.username)=$2 OR lower(p.email)=$2 OR p.documento_hash=$3)
            AND u.password_hash=crypt($4,u.password_hash) LIMIT 1`,
        [tenantId, normalized, docHash, password]
      );
      const userId = result.rows[0]?.id;
      if (!userId) {
        await AuditService.record({ tenantId, accion: 'LOGIN_FAILED', entidad: 'usuarios',
          datosNuevos: { identificador_hash: tokenHash(normalized) }, ipOrigen: ip, userAgent }, client);
        return null;
      }
      await client.query("SELECT set_config('app.user_id',$1,true)", [userId]);
      const row = await account(client, userId);
      if (!row || row.estado !== 'ACTIVO') return null;
      const user = toUser(row);
      const sid = crypto.randomUUID();
      const jti = crypto.randomUUID();
      const { accessToken, refreshToken } = issueTokens(user, sid, row.auth_version, jti);
      await client.query(
        `INSERT INTO sesiones_usuario(id,tenant_id,usuario_id,refresh_hash,access_jti,version_auth,expira_en)
         VALUES($1,$2,$3,$4,$5,$6,now()+interval '7 days')`,
        [sid, tenantId, userId, tokenHash(refreshToken), jti, row.auth_version]
      );
      await client.query('UPDATE usuarios SET ultimo_acceso_en=now() WHERE id=$1', [userId]);
      await AuditService.record({ tenantId, usuarioId: userId, accion: 'LOGIN', entidad: 'usuarios',
        entidadId: userId, ipOrigen: ip, userAgent }, client);
      await redisClient.del(rateKeys);
      return { user, accessToken, refreshToken };
    });
  }

  static async refresh(token: string, ip: string, userAgent: string) {
    if (!redisClient.isReady) throw new Error('AUTH_REVOCATION_UNAVAILABLE');
    const claims = decode(token, JWT_REFRESH_SECRET, 'sms-refresh');
    return withTenant(claims.tenantId, claims.sub, async (client) => {
      const session = await client.query<{ refresh_hash: string; revocada_en: Date | null;
        expira_en: Date; ultima_actividad_en: Date; version_auth: number }>(
        'SELECT * FROM sesiones_usuario WHERE id=$1 AND usuario_id=$2 FOR UPDATE', [claims.sid, claims.sub]
      );
      const current = session.rows[0];
      if (!current || current.revocada_en || current.expira_en <= new Date() ||
          Date.now() - current.ultima_actividad_en.getTime() > 30 * 60_000) return null;
      if (current.refresh_hash !== tokenHash(token)) {
        await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE familia_id=(SELECT familia_id FROM sesiones_usuario WHERE id=$1)', [claims.sid]);
        await AuditService.record({ tenantId: claims.tenantId, usuarioId: claims.sub,
          accion: 'REFRESH_REUSE', entidad: 'sesiones_usuario', entidadId: claims.sid, ipOrigen: ip, userAgent }, client);
        return null;
      }
      const row = await account(client, claims.sub);
      if (!row || row.estado !== 'ACTIVO' || row.auth_version !== claims.version) return null;
      const user = toUser(row);
      const jti = crypto.randomUUID();
      const next = issueTokens(user, claims.sid, row.auth_version, jti);
      await client.query(
        `UPDATE sesiones_usuario SET refresh_hash=$1,access_jti=$2,ultima_actividad_en=now()
          WHERE id=$3`, [tokenHash(next.refreshToken), jti, claims.sid]
      );
      return { user, ...next };
    });
  }

  static async validateAccess(claims: AuthClaims, touch = true): Promise<UserPayload | null> {
    if (!redisClient.isReady) throw new Error('AUTH_REVOCATION_UNAVAILABLE');
    if (await redisClient.exists(`blacklist:${claims.jti}`)) return null;
    return withTenant(claims.tenantId, claims.sub, async (client) => {
      const session = await client.query<{ revocada_en: Date | null; expira_en: Date;
        ultima_actividad_en: Date; access_jti: string; version_auth: number }>(
        'SELECT * FROM sesiones_usuario WHERE id=$1 AND usuario_id=$2', [claims.sid, claims.sub]
      );
      const s = session.rows[0];
      if (!s || s.revocada_en || s.expira_en <= new Date() || s.access_jti !== claims.jti ||
          s.version_auth !== claims.version || Date.now() - s.ultima_actividad_en.getTime() > 30 * 60_000) return null;
      const row = await account(client, claims.sub);
      if (!row || row.estado !== 'ACTIVO' || row.auth_version !== claims.version) return null;
      if (touch) await client.query('UPDATE sesiones_usuario SET ultima_actividad_en=now() WHERE id=$1', [claims.sid]);
      return toUser(row);
    });
  }

  static async logout(claims: AuthClaims, ip: string, userAgent: string): Promise<void> {
    await withTenant(claims.tenantId, claims.sub, async (client) => {
      await client.query('UPDATE sesiones_usuario SET revocada_en=coalesce(revocada_en,now()) WHERE id=$1 AND usuario_id=$2', [claims.sid, claims.sub]);
      await AuditService.record({ tenantId: claims.tenantId, usuarioId: claims.sub, accion: 'LOGOUT',
        entidad: 'sesiones_usuario', entidadId: claims.sid, ipOrigen: ip, userAgent }, client);
    });
    if (!redisClient.isReady) throw new Error('AUTH_REVOCATION_UNAVAILABLE');
    const ttl = Math.max(1, (claims.exp ?? 0) - Math.floor(Date.now() / 1000));
    await redisClient.set(`blacklist:${claims.jti}`, '1', { EX: ttl });
  }

  static async createAccessLink(tenantId: string, userId: string, creatorId: string,
    purpose: 'ACTIVACION' | 'RECUPERACION') {
    const raw = randomToken();
    await withTenant(tenantId, creatorId, async (client) => {
      await client.query(`UPDATE enlaces_acceso SET usado_en=now()
        WHERE tenant_id=$1 AND usuario_id=$2 AND proposito=$3 AND usado_en IS NULL`, [tenantId, userId, purpose]);
      await client.query(`INSERT INTO enlaces_acceso(tenant_id,usuario_id,proposito,token_hash,expira_en)
        VALUES($1,$2,$3,$4,now()+($5::int * interval '1 minute'))`,
      [tenantId, userId, purpose, tokenHash(raw), purpose === 'ACTIVACION' ? 4320 : 30]);
    });
    return raw;
  }

  static async consumeAccessLink(codigoModular: string, token: string, password: string,
    purpose: 'ACTIVACION' | 'RECUPERACION', ip: string) {
    const tenantId = await resolveInstitution(codigoModular);
    if (!tenantId) return false;
    return withTenant(tenantId, '', async (client) => {
      const found = await client.query<{ id: string; usuario_id: string }>(
        `SELECT id,usuario_id FROM enlaces_acceso WHERE tenant_id=$1 AND token_hash=$2
           AND proposito=$3 AND usado_en IS NULL AND expira_en>now() FOR UPDATE`,
        [tenantId, tokenHash(token), purpose]
      );
      const link = found.rows[0];
      if (!link) return false;
      const accountState = await client.query<{ estado: string }>(
        'SELECT estado FROM usuarios WHERE id=$1 FOR UPDATE', [link.usuario_id]);
      if (!accountState.rowCount || accountState.rows[0].estado !==
          (purpose === 'ACTIVACION' ? 'PENDIENTE_CAMBIO_CLAVE' : 'ACTIVO')) return false;
      await client.query("SELECT set_config('app.user_id',$1,true)", [link.usuario_id]);
      await client.query(`UPDATE usuarios SET password_hash=crypt($1,gen_salt('bf',12)),
        estado='ACTIVO',auth_version=auth_version+1,email_verificado_en=coalesce(email_verificado_en,now())
        WHERE id=$2`, [password, link.usuario_id]);
      await client.query('UPDATE enlaces_acceso SET usado_en=now() WHERE id=$1', [link.id]);
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [link.usuario_id]);
      await AuditService.record({ tenantId, usuarioId: link.usuario_id, accion: purpose,
        entidad: 'usuarios', entidadId: link.usuario_id, ipOrigen: ip }, client);
      return true;
    });
  }

  static async requestRecovery(codigoModular: string, identifier: string) {
    const tenantId = await resolveInstitution(codigoModular);
    if (!tenantId) return null;
    return withTenant(tenantId, '', async (client) => {
      const found = await client.query<{ id: string; email: string }>(
        `SELECT u.id,p.email FROM usuarios u JOIN personas p ON p.id=u.persona_id
          WHERE u.tenant_id=$1 AND u.estado='ACTIVO' AND u.email_verificado_en IS NOT NULL
            AND (lower(u.username)=$2 OR lower(p.email)=$2) AND p.email IS NOT NULL LIMIT 1`,
        [tenantId, identifier.trim().toLowerCase()]
      );
      return found.rows[0] ?? null;
    });
  }
}
