import crypto from 'crypto';
import { PoolClient } from 'pg';
import { z } from 'zod';
import { withTenant } from '../config/database';
import { documentHash, encryptDocument } from '../core/identity-crypto';
import { importRow, ImportRow } from './user-import.service';
import { AuditService } from './audit.service';
import { issueMessages } from '../core/validation';

export type ValidatedRow = { line: number; row: ImportRow; personId?: string;
  status: 'NUEVO' | 'ACTUALIZADO' | 'SIN_CAMBIOS' };
export type RejectedRow = { line: number; reason: string };

async function findPerson(client: PoolClient, tenantId: string, row: ImportRow) {
  const hash = row.documento ? documentHash(row.documento) : null;
  const found = await client.query<{ id: string; nombres: string; apellido_paterno: string;
    apellido_materno: string | null; email: string | null; telefono: string | null }>(
    `SELECT id,nombres,apellido_paterno,apellido_materno,email,telefono FROM personas
      WHERE tenant_id=$1 AND (($2::char(64) IS NOT NULL AND documento_hash=$2)
        OR ($3::varchar IS NOT NULL AND codigo_siagie=$3)) LIMIT 2`,
    [tenantId, hash, row.codigoSiagie || null]
  );
  if (found.rows.length > 1) throw new Error('El documento y código SIAGIE identifican personas distintas.');
  return found.rows[0] ?? null;
}

async function existingAccount(client: PoolClient, personId: string) {
  const found = await client.query<{ id: string; is_admin: boolean }>(
    `SELECT u.id,coalesce(bool_or(r.codigo='SUPERADMIN' AND ur.activo),false) AS is_admin
     FROM usuarios u LEFT JOIN usuario_roles ur ON ur.usuario_id=u.id
     LEFT JOIN roles r ON r.id=ur.rol_id WHERE u.persona_id=$1 GROUP BY u.id`, [personId]);
  return found.rows[0] ?? null;
}

export async function previewUsers(tenantId: string, actorId: string, actorRoles: string[], rawRows: unknown[]) {
  if (rawRows.length > 1000) throw new Error('Máximo 1000 filas por lote.');
  return withTenant(tenantId, actorId, async (client) => {
    const valid: ValidatedRow[] = [];
    const rejected: RejectedRow[] = [];
    const seen = new Set<string>();
    for (const [index, raw] of rawRows.entries()) {
      const line = index + 2;
      const result = importRow.safeParse(raw);
      if (!result.success) {
        rejected.push({ line, reason: issueMessages(result.error) });
        continue;
      }
      const row = result.data;
      if (row.rol === 'SUPERADMIN' && !actorRoles.includes('SUPERADMIN')) {
        rejected.push({ line, reason: 'Solo Administración TI asigna ese rol.' }); continue;
      }
      if (actorRoles.includes('SECRETARIA') && !actorRoles.includes('SUPERADMIN') &&
          !actorRoles.includes('DIRECTIVO') && row.rol && row.rol !== 'ESTUDIANTE') {
        rejected.push({ line, reason: 'Secretaría solo puede activar cuentas de estudiantes.' }); continue;
      }
      const keys = [row.documento && `doc:${row.tipoDocumento}:${row.documento}`,
        row.codigoSiagie && `siagie:${row.codigoSiagie}`].filter((key): key is string => !!key);
      if (keys.some((key) => seen.has(key))) {
        rejected.push({ line, reason: 'Duplicado en el mismo archivo.' }); continue;
      }
      keys.forEach((key) => seen.add(key));
      if (row.rol) {
        const role = await client.query('SELECT id FROM roles WHERE codigo::text=$1', [row.rol]);
        if (!role.rowCount) { rejected.push({ line, reason: 'Rol inexistente.' }); continue; }
      }
      let existing;
      try { existing = await findPerson(client, tenantId, row); }
      catch (cause) {
        rejected.push({ line, reason: cause instanceof Error ? cause.message : 'Identidad ambigua.' }); continue;
      }
      const currentAccount = existing && await existingAccount(client, existing.id);
      if (currentAccount?.is_admin && !actorRoles.includes('SUPERADMIN')) {
        rejected.push({ line, reason: 'No puede modificar una cuenta administradora.' }); continue;
      }
      if (currentAccount?.is_admin && row.email && row.email.toLowerCase() !== existing?.email?.toLowerCase()) {
        rejected.push({ line, reason: 'El correo de Administración TI no puede cambiarse por importación.' }); continue;
      }
      const changed = existing && (existing.nombres !== row.nombres ||
        existing.apellido_paterno !== row.apellidoPaterno ||
        existing.apellido_materno !== (row.apellidoMaterno || null) ||
        (!!row.email && existing.email !== row.email) || (!!row.telefono && existing.telefono !== row.telefono));
      valid.push({ line, row, personId: existing?.id,
        status: !existing ? 'NUEVO' : changed ? 'ACTUALIZADO' : 'SIN_CAMBIOS' });
    }
    return { valid, rejected, summary: {
      nuevos: valid.filter((x) => x.status === 'NUEVO').length,
      actualizados: valid.filter((x) => x.status === 'ACTUALIZADO').length,
      sinCambios: valid.filter((x) => x.status === 'SIN_CAMBIOS').length,
      rechazados: rejected.length,
    } };
  });
}

async function upsertRow(client: PoolClient, tenantId: string, row: ImportRow, actorRoles: string[]) {
  const existing = await findPerson(client, tenantId, row);
  const hash = row.documento ? documentHash(row.documento) : null;
  const encrypted = row.documento ? encryptDocument(row.documento) : null;
  let personId = existing?.id;
  if (existing) {
    const currentAccount = await existingAccount(client, existing.id);
    if (currentAccount?.is_admin && !actorRoles.includes('SUPERADMIN')) throw new Error('Cuenta administradora protegida.');
    const emailChanged = !!row.email && row.email.toLowerCase() !== existing.email?.toLowerCase();
    if (currentAccount?.is_admin && emailChanged) throw new Error('Correo de Administración TI protegido.');
    await client.query(`UPDATE personas SET nombres=$1,apellido_paterno=$2,apellido_materno=$3,
      email=coalesce($4,email),telefono=coalesce($5,telefono),codigo_siagie=coalesce($6,codigo_siagie),
      tipo_documento=CASE WHEN $7::char(64) IS NULL THEN tipo_documento ELSE $8 END,
      documento_hash=coalesce($7,documento_hash),documento_cifrado=coalesce($9,documento_cifrado),
      documento_ultimos4=coalesce($10,documento_ultimos4)
      WHERE id=$11`, [row.nombres,row.apellidoPaterno,row.apellidoMaterno || null,row.email || null,
      row.telefono || null,row.codigoSiagie || null,hash,row.tipoDocumento,encrypted,
      row.documento?.slice(-4) || null,existing.id]);
    if (emailChanged && currentAccount) {
      await client.query(`UPDATE usuarios SET estado='PENDIENTE_CAMBIO_CLAVE',
        email_verificado_en=NULL,auth_version=auth_version+1 WHERE id=$1`, [currentAccount.id]);
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [currentAccount.id]);
    }
  } else {
    const inserted = await client.query<{ id: string }>(`INSERT INTO personas
      (tenant_id,tipo_documento,documento_hash,documento_cifrado,documento_ultimos4,
       nombres,apellido_paterno,apellido_materno,email,telefono,codigo_siagie)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [tenantId,row.tipoDocumento,hash,encrypted,row.documento?.slice(-4) || null,
       row.nombres,row.apellidoPaterno,row.apellidoMaterno || null,row.email || null,
       row.telefono || null,row.codigoSiagie || null]);
    personId = inserted.rows[0].id;
  }
  let userId: string | undefined;
  if (row.rol) {
    const found = await client.query<{ id: string }>('SELECT id FROM usuarios WHERE persona_id=$1', [personId]);
    userId = found.rows[0]?.id ?? await createPendingAccount(client, tenantId, personId!, row);
  }
  return { personId, userId };
}

/** Cuenta PENDIENTE_CAMBIO_CLAVE sin contraseña conocida y con su rol inicial (RF-05, pasos 2 y 3). */
async function createPendingAccount(client: PoolClient, tenantId: string, personId: string, row: ImportRow) {
  const username = row.username || `u_${crypto.randomBytes(8).toString('hex')}`;
  const created = await client.query<{ id: string }>(`INSERT INTO usuarios
    (tenant_id,persona_id,username,password_hash,estado)
    VALUES($1,$2,$3,crypt(gen_random_uuid()::text,gen_salt('bf',12)),'PENDIENTE_CAMBIO_CLAVE')
    RETURNING id`, [tenantId,personId,username]);
  await client.query(`INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
    SELECT $1,$2,id FROM roles WHERE codigo::text=$3`, [tenantId,created.rows[0].id,row.rol]);
  return created.rows[0].id;
}

/** Conflicto de identidad en el alta individual; `code` es el código estable del sobre. */
export class IdentityConflictError extends Error {
  constructor(readonly code: 'USER_EXISTS' | 'PERSON_EXISTS' | 'EMAIL_EXISTS', message: string) {
    super(message);
    this.name = 'IdentityConflictError';
  }
}

/**
 * Alta individual (POST /users, RF-05 y CU-USR-01). A diferencia de la importación masiva,
 * que es idempotente y actualiza la persona, aquí un DNI o correo ya registrado no se
 * sobrescribe: «Dado un DNI ya existente en el sistema, cuando el administrador intenta
 * registrarlo nuevamente, el sistema detiene el proceso y alerta sobre la duplicidad».
 * Solo se «vincula» (RF-05, paso 2) una persona existente sin cuenta cuando se pide un rol
 * y su correo registrado está vacío o coincide; no se modifican sus datos personales.
 */
export async function createUser(tenantId: string, actorId: string, actorRoles: string[], raw: unknown, ip: string) {
  const preview = await previewUsers(tenantId, actorId, actorRoles, [raw]);
  if (preview.rejected.length) return { rejected: preview.rejected[0].reason };
  const row = preview.valid[0].row;
  return withTenant(tenantId, actorId, async (client) => {
    const existing = await findPerson(client, tenantId, row);
    if (row.email) {
      const sameEmail = await client.query<{ id: string }>(
        'SELECT id FROM personas WHERE tenant_id=$1 AND lower(email)=lower($2) AND ($3::uuid IS NULL OR id<>$3) LIMIT 1',
        [tenantId, row.email, existing?.id ?? null]);
      if (sameEmail.rowCount) throw new IdentityConflictError('EMAIL_EXISTS',
        'El correo ya pertenece a otra persona de la institución.');
    }
    let personId: string;
    let userId: string | undefined;
    let linked = false;
    if (existing) {
      if (await existingAccount(client, existing.id)) throw new IdentityConflictError('USER_EXISTS',
        'La persona ya tiene una cuenta en la institución. Búsquela en el directorio en lugar de registrarla otra vez.');
      if (!row.rol) throw new IdentityConflictError('PERSON_EXISTS',
        'La persona ya está registrada en la institución.');
      if (existing.email && existing.email.toLowerCase() !== row.email!.toLowerCase()) {
        throw new IdentityConflictError('PERSON_EXISTS',
          'La persona ya está registrada con otro correo. Verifique el correo antes de crear la cuenta.');
      }
      await client.query(`UPDATE personas SET email=coalesce(email,$1),telefono=coalesce(telefono,$2)
        WHERE id=$3`, [row.email, row.telefono ?? null, existing.id]);
      personId = existing.id;
      linked = true;
    } else {
      personId = (await upsertRow(client, tenantId, row, actorRoles)).personId!;
    }
    if (row.rol) {
      const found = await client.query<{ id: string }>('SELECT id FROM usuarios WHERE persona_id=$1', [personId]);
      userId = found.rows[0]?.id ?? await createPendingAccount(client, tenantId, personId, row);
    }
    await AuditService.record({ tenantId, usuarioId: actorId, accion: 'CREATE_USER', entidad: 'personas',
      entidadId: personId, datosNuevos: { rol: row.rol ?? null, cuenta: !!userId, vinculada: linked }, ipOrigen: ip }, client);
    return { line: preview.valid[0].line, personId, userId };
  });
}

export async function commitUsers(tenantId: string, actorId: string, actorRoles: string[], rawRows: unknown[], ip: string) {
  const preview = await previewUsers(tenantId, actorId, actorRoles, rawRows);
  return withTenant(tenantId, actorId, async (client) => {
    const created: Array<{ line: number; personId: string; userId?: string }> = [];
    for (const item of preview.valid) {
      const result = await upsertRow(client, tenantId, item.row, actorRoles);
      created.push({ line: item.line, personId: result.personId!, userId: result.userId });
    }
    await AuditService.record({ tenantId, usuarioId: actorId, accion: 'IMPORT_USERS',
      entidad: 'personas', datosNuevos: preview.summary, ipOrigen: ip }, client);
    return { ...preview.summary, rechazados: preview.rejected, registros: created };
  });
}

export const userInput = z.object({ rows: z.array(z.unknown()).min(1).max(1000).optional(),
  filename: z.string().max(255).optional(), contentBase64: z.string().optional() });
