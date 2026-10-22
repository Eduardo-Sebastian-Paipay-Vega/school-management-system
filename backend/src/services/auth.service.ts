import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redisClient } from '../config/redis';
import { pool } from '../config/database';
import { AuditService } from './audit.service';
import { JWT_SECRET, JWT_REFRESH_SECRET as REFRESH_SECRET } from '../config/jwt';

export interface UserPayload {
  id: string;
  tenantId: string;
  username: string;
  dni: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export class AuthService {
  /**
   * Genera el par de tokens (Access 15m + Refresh 7d)
   */
  static generateTokens(user: UserPayload) {
    const jti = crypto.randomUUID();

    const accessToken = jwt.sign(
      {
        sub: user.id,
        jti,
        tenantId: user.tenantId,
        username: user.username,
        dni: user.dni,
        roles: user.roles,
        permissions: user.permissions,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        jti,
        tenantId: user.tenantId,
      },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken, jti };
  }

  /**
   * Autenticación de credenciales contra `usuarios.password_hash` (RF-01, RNF-07).
   * El hash es bcrypt generado con pgcrypto: crypt(clave, gen_salt('bf', 12)).
   * Devuelve null si las credenciales no son válidas; nunca concede acceso por respaldo.
   */
  static async login(username: string, passwordPlain: string, tenantId: string, ip: string, userAgent: string) {
    const res = await pool.query(
      `SELECT u.id, u.tenant_id, u.username, u.nombres, u.apellidos, u.dni, u.email,
              ARRAY_AGG(r.codigo) as roles
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id
       WHERE u.username = $1 AND u.tenant_id = $2 AND u.activo = true
         AND u.password_hash = crypt($3, u.password_hash)
       GROUP BY u.id`,
      [username, tenantId, passwordPlain]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    const roles: string[] = row.roles.filter(Boolean);
    const user: UserPayload = {
      id: row.id,
      tenantId: row.tenant_id,
      username: row.username,
      dni: row.dni,
      fullName: `${row.nombres} ${row.apellidos}`,
      email: row.email,
      roles,
      permissions: this.getPermissionsForRoles(roles),
    };

    const { accessToken, refreshToken, jti } = this.generateTokens(user);

    // Registro de auditoría (RF-66)
    await AuditService.record({
      tenantId,
      usuarioId: user.id,
      accion: 'LOGIN',
      entidad: 'auth',
      entidadId: user.id,
      datosNuevos: { username: user.username, roles: user.roles },
      ipOrigen: ip,
      userAgent,
    });

    return { user, accessToken, refreshToken, jti };
  }

  /**
   * Revoca un token añadiendo su JTI a la lista negra en Redis
   */
  static async revokeToken(jti: string, ttlSeconds: number = 900) {
    if (redisClient.isReady) {
      await redisClient.set(`blacklist:${jti}`, 'revoked', { EX: ttlSeconds });
    }
  }

  /**
   * Mapea roles institucionales a permisos RBAC transversales
   */
  private static getPermissionsForRoles(roles: string[]): string[] {
    if (roles.includes('DIRECTIVO') || roles.includes('SUPERADMIN')) {
      return ['*'];
    }
    const perms = new Set<string>();
    if (roles.includes('DOCENTE')) {
      perms.add('grades:edit');
      perms.add('grades:read');
      perms.add('attendance:record');
      perms.add('reports:read');
    }
    if (roles.includes('ESTUDIANTE') || roles.includes('APODERADO')) {
      perms.add('grades:read');
      perms.add('attendance:read');
    }
    return Array.from(perms);
  }
}
