import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requirePermission, requireRoles } from '../middlewares/rbac.middleware';
import { resolveInstitution, withTenant } from '../config/database';
import { randomToken, tokenHash } from '../core/identity-crypto';
import { AuditService } from '../services/audit.service';
import { sendGuardianLink } from '../services/mail.service';

const router = Router();
const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

function consentDocument() {
  const version = process.env.GUARDIAN_CONSENT_VERSION?.trim();
  const text = process.env.GUARDIAN_CONSENT_TEXT?.trim();
  return version && version.length <= 20 && text && text.length >= 100 ? { version, text } : null;
}

router.get('/consent', (_req, res) => {
  const document = consentDocument();
  if (!document) { fail(res, 503, 'CONSENT_NOT_CONFIGURED', 'El consentimiento oficial aún no está disponible.'); return; }
  ok(res, document);
});

router.post('/activate', async (req, res) => {
  const document = consentDocument();
  if (!document) { fail(res, 503, 'CONSENT_NOT_CONFIGURED', 'El consentimiento oficial aún no está disponible.'); return; }
  const parsed = z.object({ codigoModular: z.string().min(1).max(10), token: z.string().min(32),
    password: z.string().max(72).optional(),
    consentimiento: z.literal(true), versionTexto: z.literal(document.version) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Debe definir la clave y aceptar el consentimiento.'); return; }
  try {
    const tenantId = await resolveInstitution(parsed.data.codigoModular);
    if (!tenantId) { fail(res, 400, 'INVALID_LINK', 'Enlace inválido.'); return; }
    const applied = await withTenant(tenantId, '', async (client) => {
      const found = await client.query<{ id: string; apoderado_id: string; estudiante_id: string }>(
        `SELECT id,apoderado_id,estudiante_id FROM invitaciones_apoderado
          WHERE tenant_id=$1 AND token_hash=$2 AND usada_en IS NULL AND expira_en>now() FOR UPDATE`,
        [tenantId,tokenHash(parsed.data.token)]);
      const invite = found.rows[0];
      if (!invite) return false;
      const link = await client.query(`SELECT 1 FROM apoderados_estudiantes WHERE tenant_id=$1
        AND apoderado_id=$2 AND estudiante_id=$3 AND activo FOR UPDATE`,
        [tenantId,invite.apoderado_id,invite.estudiante_id]);
      if (!link.rowCount) return false;
      const account = await client.query<{ id: string; estado: string }>('SELECT id,estado FROM usuarios WHERE persona_id=$1 FOR UPDATE', [invite.apoderado_id]);
      if (!account.rowCount) return false;
      const userId = account.rows[0].id;
      await client.query("SELECT set_config('app.user_id',$1,true)", [userId]);
      if (account.rows[0].estado === 'PENDIENTE_CAMBIO_CLAVE') {
        const password=parsed.data.password;
        if(!password || Buffer.byteLength(password,'utf8')>72 || password.length<8 ||
           !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('PASSWORD_REQUIRED');
        await client.query(`UPDATE usuarios SET password_hash=crypt($1,gen_salt('bf',12)),estado='ACTIVO',
          auth_version=auth_version+1,email_verificado_en=now() WHERE id=$2`, [password,userId]);
      } else if (account.rows[0].estado !== 'ACTIVO') return false;
      await client.query(`INSERT INTO consentimientos_datos
        (tenant_id,persona_id,version_texto,ip_origen) VALUES($1,$2,$3,$4)`,
        [tenantId,invite.apoderado_id,parsed.data.versionTexto,req.ip ?? '127.0.0.1']);
      await client.query(`INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
        SELECT $1,$2,id FROM roles WHERE codigo='APODERADO'
        ON CONFLICT DO NOTHING`, [tenantId,userId]);
      await client.query('UPDATE usuarios SET auth_version=auth_version+1 WHERE id=$1', [userId]);
      await client.query('UPDATE sesiones_usuario SET revocada_en=now() WHERE usuario_id=$1 AND revocada_en IS NULL', [userId]);
      await client.query(`UPDATE apoderados_estudiantes SET confirmado_en=now()
        WHERE tenant_id=$1 AND apoderado_id=$2 AND estudiante_id=$3 AND activo`,
        [tenantId,invite.apoderado_id,invite.estudiante_id]);
      await client.query('UPDATE invitaciones_apoderado SET usada_en=now() WHERE id=$1', [invite.id]);
      await AuditService.record({ tenantId, usuarioId: userId, accion: 'GUARDIAN_CONSENT',
        entidad: 'consentimientos_datos', entidadId: invite.apoderado_id,
        datosNuevos: { version: parsed.data.versionTexto }, ipOrigen: req.ip }, client);
      return account.rows[0].estado === 'PENDIENTE_CAMBIO_CLAVE' ? 'ACTIVATED' : 'LINKED';
    });
    if (!applied) { fail(res, 400, 'INVALID_LINK', 'Enlace vencido o ya usado.'); return; }
    ok(res, { message: applied==='ACTIVATED'?'Acceso activado.':'Vínculo confirmado. Ingrese con su contraseña actual.' });
  } catch(cause) {
    if(cause instanceof Error && cause.message==='PASSWORD_REQUIRED') {
      fail(res,400,'PASSWORD_REQUIRED','La cuenta nueva requiere una contraseña válida.');return;
    }
    fail(res, 503, 'GUARDIAN_ACTIVATION_FAILED', 'No se pudo activar el acceso.');
  }
});

router.use(authenticateJwt);

router.get('/students', requireRoles(['APODERADO']), async (req: AuthenticatedRequest, res) => {
  const document = consentDocument();
  if (!document) { fail(res, 503, 'CONSENT_NOT_CONFIGURED', 'El consentimiento oficial no está disponible.'); return; }
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(`SELECT s.id,s.nombres,s.apellido_paterno,s.apellido_materno,
          l.parentesco FROM usuarios u JOIN apoderados_estudiantes l ON l.apoderado_id=u.persona_id
          JOIN personas s ON s.id=l.estudiante_id AND s.tenant_id=l.tenant_id
          WHERE u.id=$1 AND l.tenant_id=$2 AND l.activo AND l.confirmado_en IS NOT NULL
          AND EXISTS(SELECT 1 FROM consentimientos_datos c WHERE c.persona_id=u.persona_id
            AND c.tenant_id=$2 AND c.version_texto=$3 AND c.revocado_en IS NULL)`,
        [req.user!.id,req.user!.tenantId,document.version]);
      return result.rows;
    });
    ok(res, data);
  } catch { fail(res, 500, 'GUARDIAN_ERROR', 'No se pudieron consultar los estudiantes.'); }
});

router.get('/links', requirePermission('guardians:manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>
      (await client.query(`SELECT l.id,l.apoderado_id,l.estudiante_id,l.parentesco,l.activo,l.confirmado_en,
        concat_ws(' ',g.nombres,g.apellido_paterno) AS apoderado,
        concat_ws(' ',s.nombres,s.apellido_paterno) AS estudiante
        FROM apoderados_estudiantes l
        JOIN personas g ON g.id=l.apoderado_id AND g.tenant_id=l.tenant_id
        JOIN personas s ON s.id=l.estudiante_id AND s.tenant_id=l.tenant_id
        WHERE l.tenant_id=$1 ORDER BY l.created_at DESC LIMIT 100`,[req.user!.tenantId])).rows);
    ok(res,data);
  } catch { fail(res,500,'GUARDIAN_ERROR','No se pudieron consultar los vínculos.'); }
});

router.post('/links', requirePermission('guardians:manage'), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ guardianId: z.string().uuid(), studentId: z.string().uuid(),
    parentesco: z.enum(['PADRE','MADRE','TUTOR_LEGAL']),
    verificacion: z.string().min(5).max(500) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Indique el vínculo y su verificación.'); return; }
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const guardian = await client.query('SELECT id FROM personas WHERE id=$1 AND documento_hash IS NOT NULL', [parsed.data.guardianId]);
      const student = await client.query('SELECT id FROM personas WHERE id=$1', [parsed.data.studentId]);
      if (!guardian.rowCount || !student.rowCount) throw new Error('PERSON_NOT_FOUND');
      const result = await client.query(`INSERT INTO apoderados_estudiantes
        (tenant_id,apoderado_id,estudiante_id,parentesco,vinculado_por)
        VALUES($1,$2,$3,$4,$5)
        ON CONFLICT (apoderado_id,estudiante_id)
        DO UPDATE SET activo=true,parentesco=EXCLUDED.parentesco,vinculado_por=EXCLUDED.vinculado_por,
          confirmado_en=NULL
        RETURNING id`, [req.user!.tenantId,parsed.data.guardianId,parsed.data.studentId,
          parsed.data.parentesco,req.user!.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'VERIFY_GUARDIAN_LINK', entidad: 'apoderados_estudiantes',
        entidadId: result.rows[0].id, datosNuevos: { verificacion: parsed.data.verificacion,
          parentesco: parsed.data.parentesco }, ipOrigen: req.ip }, client);
      return result.rows[0];
    });
    ok(res, data, 201);
  } catch { fail(res, 409, 'GUARDIAN_LINK_FAILED', 'No se pudo verificar el vínculo.'); }
});

router.post('/invitations', requirePermission('guardians:manage'), async (req: AuthenticatedRequest, res) => {
  if (!consentDocument()) {
    fail(res, 503, 'CONSENT_NOT_CONFIGURED', 'Configure el consentimiento oficial antes de invitar.'); return;
  }
  const parsed = z.object({ guardianId: z.string().uuid(), studentId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Identificadores inválidos.'); return; }
  try {
    const raw = randomToken();
    const prepared = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const found = await client.query<{ email: string; codigo_modular: string }>(
        `SELECT p.email,i.codigo_modular FROM apoderados_estudiantes l
          JOIN personas p ON p.id=l.apoderado_id JOIN instituciones i ON i.id=l.tenant_id
          WHERE l.tenant_id=$1 AND l.apoderado_id=$2 AND l.estudiante_id=$3 AND l.activo
            AND p.email IS NOT NULL`, [req.user!.tenantId,parsed.data.guardianId,parsed.data.studentId]);
      if (!found.rowCount) return null;
      let account = await client.query<{ id: string }>('SELECT id FROM usuarios WHERE persona_id=$1', [parsed.data.guardianId]);
      if (!account.rowCount) {
        account = await client.query<{ id: string }>(`INSERT INTO usuarios
          (tenant_id,persona_id,username,password_hash,estado)
          VALUES($1,$2,$3,crypt(gen_random_uuid()::text,gen_salt('bf',12)),'PENDIENTE_CAMBIO_CLAVE') RETURNING id`,
          [req.user!.tenantId,parsed.data.guardianId,`g_${crypto.randomBytes(8).toString('hex')}`]);
      }
      await client.query(`UPDATE invitaciones_apoderado SET usada_en=now()
        WHERE tenant_id=$1 AND apoderado_id=$2 AND estudiante_id=$3 AND usada_en IS NULL`,
        [req.user!.tenantId,parsed.data.guardianId,parsed.data.studentId]);
      await client.query(`INSERT INTO invitaciones_apoderado
        (tenant_id,apoderado_id,estudiante_id,token_hash,expira_en,creada_por)
        VALUES($1,$2,$3,$4,now()+interval '72 hours',$5)`,
        [req.user!.tenantId,parsed.data.guardianId,parsed.data.studentId,tokenHash(raw),req.user!.id]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'INVITE_GUARDIAN', entidad: 'invitaciones_apoderado',
        entidadId: parsed.data.guardianId, ipOrigen: req.ip }, client);
      return found.rows[0];
    });
    if (!prepared) { fail(res, 404, 'GUARDIAN_LINK_NOT_FOUND', 'Vínculo verificado con correo no encontrado.'); return; }
    await sendGuardianLink(prepared.email, prepared.codigo_modular, raw);
    ok(res, { message: 'Invitación enviada.' });
  } catch { fail(res, 503, 'GUARDIAN_INVITE_FAILED', 'No se pudo enviar la invitación.'); }
});

router.delete('/links/:guardianId/:studentId', requirePermission('guardians:manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const changed = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(`UPDATE apoderados_estudiantes SET activo=false,confirmado_en=NULL
        WHERE tenant_id=$1 AND apoderado_id=$2 AND estudiante_id=$3 AND activo RETURNING id`,
        [req.user!.tenantId,req.params.guardianId,req.params.studentId]);
      if (!result.rowCount) return false;
      const remaining = await client.query<{ count: number }>(`SELECT count(*)::int AS count
        FROM apoderados_estudiantes WHERE tenant_id=$1 AND apoderado_id=$2
          AND activo AND confirmado_en IS NOT NULL`, [req.user!.tenantId,req.params.guardianId]);
      if (remaining.rows[0].count === 0) {
        await client.query(`UPDATE usuario_roles SET activo=false,revocado_en=now()
          WHERE usuario_id=(SELECT id FROM usuarios WHERE persona_id=$1)
            AND rol_id=(SELECT id FROM roles WHERE codigo='APODERADO') AND activo`,
          [req.params.guardianId]);
      }
      await client.query(`UPDATE usuarios SET auth_version=auth_version+1
        WHERE persona_id=$1`, [req.params.guardianId]);
      await client.query(`UPDATE sesiones_usuario SET revocada_en=now()
        WHERE usuario_id=(SELECT id FROM usuarios WHERE persona_id=$1) AND revocada_en IS NULL`,
        [req.params.guardianId]);
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'REVOKE_GUARDIAN_LINK', entidad: 'apoderados_estudiantes',
        entidadId: result.rows[0].id, ipOrigen: req.ip }, client);
      return true;
    });
    if (!changed) { fail(res, 404, 'LINK_NOT_FOUND', 'Vínculo no encontrado.'); return; }
    ok(res, { message: 'Vínculo revocado.' });
  } catch { fail(res, 500, 'GUARDIAN_ERROR', 'No se pudo revocar el vínculo.'); }
});

export default router;
