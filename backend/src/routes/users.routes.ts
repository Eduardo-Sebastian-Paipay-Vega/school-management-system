import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requirePermission, requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { decryptDocument, documentHash } from '../core/identity-crypto';
import { AuditService } from '../services/audit.service';
import { AuthService } from '../services/auth.service';
import { sendAccessLink } from '../services/mail.service';
import { commitUsers, previewUsers, userInput } from '../services/users.service';
import { parseImportFile } from '../services/user-import.service';

const router = Router();
router.use(authenticateJwt);
const now = () => new Date().toISOString();
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });

async function rowsFromRequest(body: unknown) {
  const parsed = userInput.parse(body);
  if (parsed.rows) return parsed.rows;
  if (parsed.filename && parsed.contentBase64) return parseImportFile(parsed.filename, parsed.contentBase64);
  throw new Error('Adjunte filas o un archivo CSV/XLSX.');
}

router.get('/roles', requirePermission('roles:read'), async (req: AuthenticatedRequest, res) => {
  const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
    (await client.query(`SELECT r.id,r.codigo,r.nombre,r.descripcion,
      COALESCE(array_agg(rp.permiso_codigo) FILTER (WHERE rp.permiso_codigo IS NOT NULL),ARRAY[]::varchar[]) AS permisos
      FROM roles r LEFT JOIN rol_permisos_core rp ON rp.rol_id=r.id AND rp.tenant_id=$1
      GROUP BY r.id ORDER BY r.nombre`, [req.user!.tenantId])).rows);
  ok(res, data);
});

router.get('/permissions', requirePermission('roles:read'), async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query('SELECT codigo,descripcion FROM permisos_core ORDER BY codigo')).rows);
    ok(res, data);
  } catch { fail(res, 500, 'ROLES_ERROR', 'No se pudieron consultar los permisos.'); }
});

router.put('/roles/:id/permissions', requirePermission('roles:manage'), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ permissions: z.array(z.string().min(1).max(80)).max(30),
    motivo: z.string().min(10).max(500) }).safeParse(req.body);
  if (!parsed.success || new Set(parsed.data.permissions).size !== parsed.data.permissions.length) {
    fail(res, 400, 'VALIDATION_FAILED', 'Permisos o motivo inválidos.'); return;
  }
  const protectedPermissions = ['roles:manage','users:assign-roles','users:unmask','audit:read','audit:export'];
  try {
    const changed = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const role = await client.query<{ id: number; codigo: string }>('SELECT id,codigo::text FROM roles WHERE id=$1', [req.params.id]);
      if (!role.rowCount || role.rows[0].codigo === 'SUPERADMIN') return false;
      const valid = await client.query<{ codigo: string }>('SELECT codigo FROM permisos_core WHERE codigo=ANY($1::varchar[])', [parsed.data.permissions]);
      if (valid.rowCount !== parsed.data.permissions.length) throw new Error('UNKNOWN_PERMISSION');
      const old = await client.query<{ permiso_codigo: string }>('SELECT permiso_codigo FROM rol_permisos_core WHERE tenant_id=$1 AND rol_id=$2',
        [req.user!.tenantId,role.rows[0].id]);
      const previouslyProtected=old.rows.map((r)=>r.permiso_codigo).filter((p)=>protectedPermissions.includes(p)).sort();
      const requestedProtected=parsed.data.permissions.filter((p)=>protectedPermissions.includes(p)).sort();
      if (JSON.stringify(previouslyProtected)!==JSON.stringify(requestedProtected)) throw new Error('PROTECTED_PERMISSION');
      await client.query('DELETE FROM rol_permisos_core WHERE tenant_id=$1 AND rol_id=$2', [req.user!.tenantId,role.rows[0].id]);
      for (const permission of parsed.data.permissions) await client.query(
        'INSERT INTO rol_permisos_core(tenant_id,rol_id,permiso_codigo,created_by) VALUES($1,$2,$3,$4)',
        [req.user!.tenantId,role.rows[0].id,permission,req.user!.id]);
      await client.query(`UPDATE usuarios SET auth_version=auth_version+1 WHERE id IN
        (SELECT usuario_id FROM usuario_roles WHERE tenant_id=$1 AND rol_id=$2 AND activo)`,
        [req.user!.tenantId,role.rows[0].id]);
      await client.query(`UPDATE sesiones_usuario SET revocada_en=now() WHERE tenant_id=$1 AND usuario_id IN
        (SELECT usuario_id FROM usuario_roles WHERE tenant_id=$1 AND rol_id=$2 AND activo) AND revocada_en IS NULL`,
        [req.user!.tenantId,role.rows[0].id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'UPDATE_ROLE_PERMISSIONS', entidad: 'rol_permisos_core',
        datosAnteriores: old.rows.map((r) => r.permiso_codigo),
        datosNuevos: { permisos: parsed.data.permissions, motivo: parsed.data.motivo },
        ipOrigen: req.ip }, client);
      return true;
    });
    if (!changed) { fail(res, 404, 'ROLE_NOT_FOUND', 'Rol no encontrado o inmutable.'); return; }
    ok(res, { message: 'Matriz actualizada. Las sesiones afectadas deben iniciar sesión nuevamente.' });
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'UNKNOWN_PERMISSION') {
      fail(res, 400, 'UNKNOWN_PERMISSION', 'El permiso no existe.'); return;
    }
    if (cause instanceof Error && cause.message === 'PROTECTED_PERMISSION') {
      fail(res, 403, 'PROTECTED_PERMISSION', 'Los permisos protegidos no se pueden modificar desde esta operación.'); return;
    }
    fail(res, 500, 'ROLES_ERROR', 'No se pudo actualizar la matriz.');
  }
});

router.get('/me', async (req: AuthenticatedRequest, res) => { ok(res, req.user); });

router.get('/persons', requirePermission('guardians:manage'), async (req: AuthenticatedRequest, res) => {
  const parsed=z.object({search:z.string().trim().min(2).max(100)}).safeParse(req.query);
  if(!parsed.success){fail(res,400,'VALIDATION_FAILED','Indique al menos dos caracteres.');return;}
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>
      (await client.query(`SELECT id,nombres,apellido_paterno,apellido_materno,documento_ultimos4
        FROM personas WHERE tenant_id=$1 AND concat_ws(' ',nombres,apellido_paterno,apellido_materno)
        ILIKE '%'||$2||'%' ORDER BY apellido_paterno,nombres LIMIT 30`,[req.user!.tenantId,parsed.data.search])).rows);
    ok(res,data);
  }catch{fail(res,500,'PERSONS_ERROR','No se pudieron consultar las personas.');}
});

router.post('/:id/document', requirePermission('users:unmask'), async (req: AuthenticatedRequest, res) => {
  const parsed=z.object({motivo:z.string().min(10).max(500)}).safeParse(req.body);
  if(!parsed.success){fail(res,400,'VALIDATION_FAILED','Indique un motivo de al menos diez caracteres.');return;}
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>{
      const result=await client.query<{documento_cifrado:Buffer;tipo_documento:string}>(
        `SELECT p.documento_cifrado,p.tipo_documento FROM usuarios u
         JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
         WHERE u.id=$1 AND u.tenant_id=$2`,[req.params.id,req.user!.tenantId]);
      if(!result.rowCount||!result.rows[0].documento_cifrado)return null;
      await AuditService.record({tenantId:req.user!.tenantId,usuarioId:req.user!.id,
        accion:'UNMASK_DOCUMENT',entidad:'personas',entidadId:req.params.id,
        datosNuevos:{motivo:parsed.data.motivo},ipOrigen:req.ip},client);
      return {tipo:result.rows[0].tipo_documento,documento:decryptDocument(result.rows[0].documento_cifrado)};
    });
    if(!data){fail(res,404,'DOCUMENT_NOT_FOUND','Documento no encontrado.');return;}
    res.setHeader('Cache-Control','no-store');ok(res,data);
  }catch{fail(res,500,'DOCUMENT_ERROR','No se pudo consultar el documento.');}
});

router.patch('/me', async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ telefono: z.string().max(20).optional(), fotoUrl: z.string().url().max(1000).optional() }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Datos de perfil inválidos.'); return; }
  try {
    await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const old = await client.query('SELECT telefono,foto_url FROM personas WHERE id=(SELECT persona_id FROM usuarios WHERE id=$1)', [req.user!.id]);
      await client.query(`UPDATE personas SET telefono=coalesce($1,telefono),foto_url=coalesce($2,foto_url)
        WHERE id=(SELECT persona_id FROM usuarios WHERE id=$3)`,
        [parsed.data.telefono ?? null, parsed.data.fotoUrl ?? null, req.user!.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'UPDATE_PROFILE', entidad: 'personas', entidadId: req.user!.id,
        datosAnteriores: old.rows[0] ?? null, datosNuevos: parsed.data, ipOrigen: req.ip }, client);
    });
    ok(res, { message: 'Perfil actualizado.' });
  } catch { fail(res, 500, 'PROFILE_ERROR', 'No se pudo actualizar el perfil.'); }
});

router.post('/me/change-password', async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ actual: z.string().min(1), nueva: z.string().min(8).max(72)
    .refine((x) => /[A-Za-z]/.test(x) && /\d/.test(x)) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Contraseña nueva inválida.'); return; }
  try {
    const changed = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(`UPDATE usuarios SET password_hash=crypt($1,gen_salt('bf',12)),auth_version=auth_version+1
        WHERE id=$2 AND password_hash=crypt($3,password_hash) RETURNING id`,
        [parsed.data.nueva, req.user!.id, parsed.data.actual]);
      if (!result.rowCount) return false;
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [req.user!.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'CHANGE_PASSWORD', entidad: 'usuarios', entidadId: req.user!.id, ipOrigen: req.ip }, client);
      return true;
    });
    if (!changed) { fail(res, 400, 'INVALID_PASSWORD', 'La contraseña actual no coincide.'); return; }
    ok(res, { message: 'Contraseña actualizada. Inicie sesión otra vez.' });
  } catch { fail(res, 500, 'PASSWORD_ERROR', 'No se pudo cambiar la contraseña.'); }
});

router.get('/', requirePermission('users:read'),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ search: z.string().max(100).default(''),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
      role: z.string().max(40).optional(), estado: z.string().max(40).optional() }).safeParse(req.query);
    if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Filtros inválidos.'); return; }
    try {
      const { search, limit, offset, role, estado } = parsed.data;
      const hash = /^\d{8}$/.test(search) ? documentHash(search) : null;
      const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const result = await client.query(`SELECT u.id,u.username,u.estado,p.id AS persona_id,
          p.nombres,p.apellido_paterno,p.apellido_materno,p.email,p.documento_ultimos4,
          COALESCE(array_agg(r.codigo::text) FILTER (WHERE ur.activo AND r.codigo IS NOT NULL),ARRAY[]::text[]) AS roles
          FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
          LEFT JOIN usuario_roles ur ON ur.usuario_id=u.id AND ur.activo
          LEFT JOIN roles r ON r.id=ur.rol_id
          WHERE u.tenant_id=$1 AND u.username<>'sistema'
            AND ($2='' OR concat_ws(' ',p.nombres,p.apellido_paterno,p.apellido_materno) ILIKE '%'||$2||'%'
                 OR u.username ILIKE '%'||$2||'%' OR p.email ILIKE '%'||$2||'%'
                 OR ($3::char(64) IS NOT NULL AND p.documento_hash=$3))
            AND ($4::varchar IS NULL OR u.estado::text=$4)
            AND ($5::varchar IS NULL OR EXISTS(SELECT 1 FROM usuario_roles x JOIN roles y ON y.id=x.rol_id
                WHERE x.usuario_id=u.id AND x.activo AND y.codigo::text=$5))
          GROUP BY u.id,p.id ORDER BY p.apellido_paterno,p.nombres LIMIT $6 OFFSET $7`,
          [req.user!.tenantId,search,hash,estado ?? null,role ?? null,limit,offset]);
        return result.rows;
      });
      ok(res, { users: data, count: data.length });
    } catch { fail(res, 500, 'USERS_ERROR', 'No se pudo consultar el directorio.'); }
  });

router.post('/import/preview', requirePermission('users:import'), async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await rowsFromRequest(req.body);
    ok(res, await previewUsers(req.user!.tenantId, req.user!.id, req.user!.roles, rows));
  } catch (cause) { fail(res, 400, 'IMPORT_INVALID', cause instanceof Error ? cause.message : 'Archivo inválido.'); }
});

router.post('/import/commit', requirePermission('users:import'), async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await rowsFromRequest(req.body);
    ok(res, await commitUsers(req.user!.tenantId, req.user!.id, req.user!.roles, rows, req.ip ?? '127.0.0.1'));
  } catch (cause) { fail(res, 409, 'IMPORT_FAILED', cause instanceof Error ? cause.message : 'No se pudo importar.'); }
});

router.post('/', requirePermission('users:manage'), requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  try {
    const result = await commitUsers(req.user!.tenantId, req.user!.id, req.user!.roles, [req.body], req.ip ?? '127.0.0.1');
    if (result.rechazados.length) { fail(res, 400, 'VALIDATION_FAILED', result.rechazados[0].reason); return; }
    ok(res, result.registros[0], 201);
  } catch (cause) { fail(res, 409, 'USER_CREATE_FAILED', cause instanceof Error ? cause.message : 'No se pudo crear.'); }
});

router.post('/:id/invite', requirePermission('users:manage'), requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  try {
    const found = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query<{ email: string; codigo_modular: string }>(
        `SELECT p.email,i.codigo_modular FROM usuarios u
          JOIN personas p ON p.id=u.persona_id JOIN instituciones i ON i.id=u.tenant_id
          WHERE u.id=$1 AND u.tenant_id=$2 AND u.estado='PENDIENTE_CAMBIO_CLAVE' AND p.email IS NOT NULL`,
        [req.params.id,req.user!.tenantId]);
      return result.rows[0];
    });
    if (!found) { fail(res, 404, 'USER_NOT_FOUND', 'Cuenta pendiente sin correo no encontrada.'); return; }
    const token = await AuthService.createAccessLink(req.user!.tenantId, req.params.id, req.user!.id, 'ACTIVACION');
    await sendAccessLink(found.email, found.codigo_modular, token, 'ACTIVACION');
    ok(res, { message: 'Invitación enviada.' });
  } catch { fail(res, 503, 'INVITE_FAILED', 'No se pudo enviar la invitación.'); }
});

router.patch('/:id', requirePermission('users:manage'), requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ nombres: z.string().min(1).max(100).optional(),
    apellidoPaterno: z.string().min(1).max(100).optional(),
    apellidoMaterno: z.string().max(100).optional(), email: z.string().email().max(254).optional(),
    telefono: z.string().max(20).optional() }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Datos inválidos.'); return; }
  if (parsed.data.email && !req.user!.roles.includes('SUPERADMIN')) {
    fail(res, 403, 'EMAIL_PROTECTED', 'Solo Administración TI puede cambiar el correo de acceso.'); return;
  }
  try {
    const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const old = await client.query(`SELECT p.id,p.nombres,p.apellido_paterno,p.apellido_materno,p.email,p.telefono
        FROM usuarios u JOIN personas p ON p.id=u.persona_id WHERE u.id=$1`, [req.params.id]);
      if (!old.rowCount) return false;
      const targetRoles = await client.query<{ codigo: string }>(
        `SELECT r.codigo::text FROM usuario_roles ur JOIN roles r ON r.id=ur.rol_id
         WHERE ur.usuario_id=$1 AND ur.activo`, [req.params.id]);
      const targetIsAdmin = targetRoles.rows.some((role) => role.codigo === 'SUPERADMIN');
      if (targetIsAdmin && !req.user!.roles.includes('SUPERADMIN')) throw new Error('PROTECTED_ADMIN');
      const d = parsed.data;
      const emailChanged = !!d.email && d.email.toLowerCase() !== String(old.rows[0].email ?? '').toLowerCase();
      if (emailChanged && targetIsAdmin) throw new Error('PROTECTED_ADMIN_EMAIL');
      await client.query(`UPDATE personas SET nombres=coalesce($1,nombres),
        apellido_paterno=coalesce($2,apellido_paterno),apellido_materno=coalesce($3,apellido_materno),
        email=coalesce($4,email),telefono=coalesce($5,telefono) WHERE id=$6`,
      [d.nombres ?? null,d.apellidoPaterno ?? null,d.apellidoMaterno ?? null,d.email ?? null,d.telefono ?? null,old.rows[0].id]);
      if (emailChanged) {
        await client.query(`UPDATE usuarios SET estado='PENDIENTE_CAMBIO_CLAVE',
          email_verificado_en=NULL,auth_version=auth_version+1 WHERE id=$1`, [req.params.id]);
        await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [req.params.id]);
      }
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'UPDATE_USER', entidad: 'personas', entidadId: old.rows[0].id,
        datosAnteriores: { nombres: old.rows[0].nombres, apellido_paterno: old.rows[0].apellido_paterno },
        datosNuevos: { nombres: d.nombres, apellidoPaterno: d.apellidoPaterno }, ipOrigen: req.ip }, client);
      return { emailChanged };
    });
    if (!updated) { fail(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado.'); return; }
    ok(res, { message: updated.emailChanged
      ? 'Usuario actualizado. Envíe una nueva invitación para verificar el correo y reactivar el acceso.'
      : 'Usuario actualizado.' });
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'PROTECTED_ADMIN') {
      fail(res, 403, 'PROTECTED_ADMIN', 'No puede editar una cuenta administradora.'); return;
    }
    if (cause instanceof Error && cause.message === 'PROTECTED_ADMIN_EMAIL') {
      fail(res, 403, 'PROTECTED_ADMIN_EMAIL', 'El correo de una cuenta administradora requiere un procedimiento de seguridad independiente.'); return;
    }
    fail(res, 500, 'USER_UPDATE_FAILED', 'No se pudo actualizar.');
  }
});

async function setActive(req: AuthenticatedRequest, res: import('express').Response, active: boolean) {
  const parsed = z.object({ motivo: z.string().min(3).max(500) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Indique el motivo.'); return; }
  if (req.params.id === req.user!.id && !active) { fail(res, 409, 'SELF_DEACTIVATION', 'No puede desactivar su propia cuenta.'); return; }
  try {
    const changed = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      await client.query('SELECT id FROM instituciones WHERE id=$1 FOR UPDATE', [req.user!.tenantId]);
      const found = await client.query('SELECT id,estado FROM usuarios WHERE id=$1 FOR UPDATE', [req.params.id]);
      if (!found.rowCount) return false;
      const targetRoles = await client.query<{ codigo: string }>(
        `SELECT r.codigo::text FROM usuario_roles ur JOIN roles r ON r.id=ur.rol_id
         WHERE ur.usuario_id=$1 AND ur.activo`, [req.params.id]);
      const isAdmin = targetRoles.rows.some((role) => role.codigo === 'SUPERADMIN');
      if (isAdmin && !req.user!.roles.includes('SUPERADMIN')) throw new Error('PROTECTED_ADMIN');
      if (isAdmin && !active && found.rows[0].estado === 'ACTIVO') {
        const admins = await client.query<{ total: number }>(
          `SELECT count(DISTINCT u.id)::int AS total FROM usuarios u
           JOIN usuario_roles ur ON ur.usuario_id=u.id AND ur.activo
           JOIN roles r ON r.id=ur.rol_id
           WHERE u.tenant_id=$1 AND u.estado='ACTIVO' AND r.codigo='SUPERADMIN'`,
          [req.user!.tenantId]);
        if (admins.rows[0].total <= 1) throw new Error('LAST_ADMIN');
      }
      await client.query(`UPDATE usuarios SET estado=$1,auth_version=auth_version+1,
        fecha_baja=$2,motivo_baja=$3,baja_por=$4 WHERE id=$5`,
        [active ? 'PENDIENTE_CAMBIO_CLAVE' : 'INACTIVO',active ? null : new Date(),
          active ? null : parsed.data.motivo,active ? null : req.user!.id,req.params.id]);
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [req.params.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: active ? 'REACTIVATE_USER' : 'DEACTIVATE_USER', entidad: 'usuarios',
        entidadId: req.params.id, datosAnteriores: { estado: found.rows[0].estado },
        datosNuevos: { motivo: parsed.data.motivo }, ipOrigen: req.ip }, client);
      return true;
    });
    if (!changed) { fail(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado.'); return; }
    ok(res, { message: active ? 'Cuenta pendiente de reactivación.' : 'Cuenta desactivada.' });
  } catch (cause) {
    if (cause instanceof Error && ['PROTECTED_ADMIN', 'LAST_ADMIN'].includes(cause.message)) {
      fail(res, 403, cause.message, 'No se puede cambiar el estado de esa cuenta administradora.'); return;
    }
    fail(res, 500, 'USER_STATUS_FAILED', 'No se pudo cambiar el estado.');
  }
}
router.post('/:id/deactivate', requirePermission('users:manage'), requireRoles(['SUPERADMIN', 'DIRECTIVO']), (req: AuthenticatedRequest, res) => { void setActive(req, res, false); });
router.post('/:id/reactivate', requirePermission('users:manage'), requireRoles(['SUPERADMIN', 'DIRECTIVO']), (req: AuthenticatedRequest, res) => { void setActive(req, res, true); });

router.put('/:id/roles', requirePermission('users:assign-roles'), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ roles: z.array(z.string().min(1)).min(1), motivo: z.string().min(3).max(500) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Roles y motivo requeridos.'); return; }
  try {
    await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      await client.query('SELECT id FROM instituciones WHERE id=$1 FOR UPDATE', [req.user!.tenantId]);
      const target = await client.query('SELECT id FROM usuarios WHERE id=$1 AND estado=\'ACTIVO\' FOR UPDATE', [req.params.id]);
      if (!target.rowCount) throw new Error('USER_NOT_FOUND');
      const roleRows = await client.query<{ id: number; codigo: string }>('SELECT id,codigo::text FROM roles WHERE codigo::text=ANY($1::text[])', [parsed.data.roles]);
      if (roleRows.rowCount !== new Set(parsed.data.roles).size) throw new Error('UNKNOWN_ROLE');
      const before = await client.query<{ codigo: string }>(`SELECT r.codigo::text FROM usuario_roles ur
        JOIN roles r ON r.id=ur.rol_id WHERE ur.usuario_id=$1 AND ur.activo`, [req.params.id]);
      const wasAdmin = before.rows.some((x) => x.codigo === 'SUPERADMIN');
      if (wasAdmin && !parsed.data.roles.includes('SUPERADMIN')) {
        const admins = await client.query(`SELECT count(DISTINCT u.id)::int AS total FROM usuarios u
          JOIN usuario_roles ur ON ur.usuario_id=u.id AND ur.activo
          JOIN roles r ON r.id=ur.rol_id WHERE u.tenant_id=$1 AND u.estado='ACTIVO' AND r.codigo='SUPERADMIN'`,
          [req.user!.tenantId]);
        if (req.params.id === req.user!.id || admins.rows[0].total <= 1) throw new Error('LAST_ADMIN');
      }
      await client.query(`UPDATE usuario_roles SET activo=false,revocado_en=now()
        WHERE usuario_id=$1 AND activo`, [req.params.id]);
      for (const role of roleRows.rows) {
        await client.query(`INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
          VALUES($1,$2,$3)`, [req.user!.tenantId,req.params.id,role.id]);
      }
      await client.query('UPDATE usuarios SET auth_version=auth_version+1 WHERE id=$1', [req.params.id]);
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [req.params.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'CHANGE_ROLES', entidad: 'usuario_roles', entidadId: req.params.id,
        datosAnteriores: before.rows.map((x) => x.codigo),
        datosNuevos: { roles: parsed.data.roles, motivo: parsed.data.motivo }, ipOrigen: req.ip }, client);
    });
    ok(res, { message: 'Roles actualizados.' });
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : 'ROLE_ERROR';
    fail(res, code === 'USER_NOT_FOUND' ? 404 : 409, code, 'No se pudo reasignar los roles.');
  }
});

export default router;
