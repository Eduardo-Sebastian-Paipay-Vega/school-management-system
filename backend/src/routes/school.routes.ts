import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requirePermission, requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';

const router = Router();
router.use(authenticateJwt);
router.use(requirePermission('school:read'));
router.use((req: AuthenticatedRequest, res, next) => {
  if (req.method === 'GET') { next(); return; }
  requirePermission('school:manage')(req, res, next);
});
const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

async function mutate<T>(req: AuthenticatedRequest, fn: (client: import('pg').PoolClient) => Promise<T>,
  action: string, entity: string, payload: unknown) {
  return withTenant(req.user!.tenantId, req.user!.id, async (client) => {
    const value = await fn(client);
    await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
      accion: action, entidad: entity, datosNuevos: payload, ipOrigen: req.ip }, client);
    return value;
  });
}

router.get('/institution', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(`SELECT i.id,i.codigo_modular,i.nombre,i.nivel_educativo,
        i.direccion,i.telefono,c.escudo_url,c.membrete_texto,c.zona_horaria,
        c.minutos_inactividad_sesion FROM instituciones i
        JOIN configuracion_institucional c ON c.tenant_id=i.id WHERE i.id=$1`, [req.user!.tenantId]);
      return result.rows[0];
    });
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudo consultar la institución.'); }
});

router.patch('/institution', requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ nombre: z.string().min(1).max(150).optional(),
    direccion: z.string().max(500).optional(), telefono: z.string().max(20).optional(),
    membreteTexto: z.string().max(2000).optional(), escudoUrl: z.string().url().max(1000).optional() }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Parámetros inválidos.'); return; }
  try {
    await mutate(req, async (client) => {
      const d = parsed.data;
      await client.query(`UPDATE instituciones SET nombre=coalesce($1,nombre),direccion=coalesce($2,direccion),
        telefono=coalesce($3,telefono) WHERE id=$4`,
      [d.nombre ?? null,d.direccion ?? null,d.telefono ?? null,req.user!.tenantId]);
      await client.query(`UPDATE configuracion_institucional SET membrete_texto=coalesce($1,membrete_texto),
        escudo_url=coalesce($2,escudo_url) WHERE tenant_id=$3`,
      [d.membreteTexto ?? null,d.escudoUrl ?? null,req.user!.tenantId]);
    }, 'UPDATE_INSTITUTION', 'configuracion_institucional', parsed.data);
    ok(res, { message: 'Institución actualizada.' });
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudo actualizar la institución.'); }
});

router.get('/sites', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query('SELECT id,nombre,direccion,activo FROM sedes WHERE tenant_id=$1 ORDER BY nombre', [req.user!.tenantId])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudieron consultar las sedes.'); }
});

router.post('/sites', requireRoles(['SUPERADMIN']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ nombre: z.string().min(2).max(120), direccion: z.string().max(500).optional() }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Sede inválida.'); return; }
  try {
    const data = await mutate(req, async (client) =>
      (await client.query('INSERT INTO sedes(tenant_id,nombre,direccion) VALUES($1,$2,$3) RETURNING id,nombre',
      [req.user!.tenantId,parsed.data.nombre,parsed.data.direccion ?? null])).rows[0],
    'CREATE_SITE', 'sedes', parsed.data);
    ok(res, data, 201);
  } catch { fail(res, 409, 'SITE_CONFLICT', 'La sede ya existe o es inválida.'); }
});

router.get('/years', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query('SELECT id,anio,fecha_inicio,fecha_fin,activo FROM anios_lectivos WHERE tenant_id=$1 ORDER BY anio DESC',
      [req.user!.tenantId])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudieron consultar los años.'); }
});

router.post('/years', requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ anio: z.number().int().min(2020).max(2100),
    fechaInicio: z.string().date(), fechaFin: z.string().date() }).safeParse(req.body);
  if (!parsed.success || parsed.data.fechaInicio >= parsed.data.fechaFin) {
    fail(res, 400, 'VALIDATION_FAILED', 'Fechas del año inválidas.'); return;
  }
  try {
    const data = await mutate(req, async (client) =>
      (await client.query(`INSERT INTO anios_lectivos(tenant_id,anio,fecha_inicio,fecha_fin,activo)
        VALUES($1,$2,$3,$4,false) RETURNING id,anio`,
      [req.user!.tenantId,parsed.data.anio,parsed.data.fechaInicio,parsed.data.fechaFin])).rows[0],
    'CREATE_YEAR', 'anios_lectivos', parsed.data);
    ok(res, data, 201);
  } catch { fail(res, 409, 'YEAR_CONFLICT', 'El año ya existe o las fechas son inválidas.'); }
});

router.post('/years/:id/activate', requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  try {
    const data = await mutate(req, async (client) => {
      const found = await client.query('SELECT id FROM anios_lectivos WHERE id=$1 FOR UPDATE', [req.params.id]);
      if (!found.rowCount) return null;
      await client.query('UPDATE anios_lectivos SET activo=false WHERE tenant_id=$1 AND activo', [req.user!.tenantId]);
      return (await client.query('UPDATE anios_lectivos SET activo=true WHERE id=$1 RETURNING id,anio,activo', [req.params.id])).rows[0];
    }, 'ACTIVATE_YEAR', 'anios_lectivos', { id: req.params.id });
    if (!data) { fail(res, 404, 'YEAR_NOT_FOUND', 'Año no encontrado.'); return; }
    ok(res, data);
  } catch { fail(res, 409, 'YEAR_CONFLICT', 'No se pudo activar el año.'); }
});

router.get('/years/:id/periods', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query(`SELECT id,tipo,numero,fecha_inicio,fecha_fin,fecha_limite_notas,cerrado
        FROM periodos_academicos WHERE anio_lectivo_id=$1 ORDER BY numero`, [req.params.id])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudieron consultar los periodos.'); }
});

router.post('/years/:id/periods', requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ tipo: z.enum(['BIMESTRE', 'TRIMESTRE']), numero: z.number().int().min(1).max(4),
      fechaInicio: z.string().date(), fechaFin: z.string().date(), fechaLimiteNotas: z.string().datetime() }).safeParse(req.body);
    if (!parsed.success || parsed.data.fechaInicio >= parsed.data.fechaFin) {
      fail(res, 400, 'VALIDATION_FAILED', 'Periodo inválido.'); return;
    }
    if (parsed.data.tipo === 'TRIMESTRE' && parsed.data.numero > 3) {
      fail(res, 400, 'VALIDATION_FAILED', 'Un año trimestral admite hasta tres periodos.'); return;
    }
    try {
      const data = await mutate(req, async (client) => {
        const year=await client.query<{fecha_inicio:string;fecha_fin:string}>(
          'SELECT fecha_inicio,fecha_fin FROM anios_lectivos WHERE id=$1 FOR UPDATE',[req.params.id]);
        if(!year.rowCount || parsed.data.fechaInicio<year.rows[0].fecha_inicio ||
          parsed.data.fechaFin>year.rows[0].fecha_fin)throw new Error('OUT_OF_YEAR');
        const overlap=await client.query(`SELECT 1 FROM periodos_academicos WHERE anio_lectivo_id=$1
          AND (tipo<>$2 OR (fecha_inicio<=$4 AND fecha_fin>=$3)) LIMIT 1`,
          [req.params.id,parsed.data.tipo,parsed.data.fechaInicio,parsed.data.fechaFin]);
        if(overlap.rowCount)throw new Error('PERIOD_OVERLAP');
        return (await client.query(`INSERT INTO periodos_academicos
          (tenant_id,anio_lectivo_id,tipo,numero,fecha_inicio,fecha_fin,fecha_limite_notas)
          VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,numero`,
        [req.user!.tenantId,req.params.id,parsed.data.tipo,parsed.data.numero,
          parsed.data.fechaInicio,parsed.data.fechaFin,parsed.data.fechaLimiteNotas])).rows[0];
      },
      'CREATE_PERIOD', 'periodos_academicos', parsed.data);
      ok(res, data, 201);
    } catch { fail(res, 409, 'PERIOD_CONFLICT', 'El periodo es inválido o se superpone.'); }
  });

router.post('/periods/:id/close', requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data = await mutate(req, async (client) =>
        (await client.query(`UPDATE periodos_academicos SET cerrado=true,cerrado_por=$1,fecha_cierre=now()
          WHERE id=$2 AND cerrado=false RETURNING id,cerrado`, [req.user!.id,req.params.id])).rows[0],
      'CLOSE_PERIOD', 'periodos_academicos', { id: req.params.id });
      if (!data) { fail(res, 404, 'PERIOD_NOT_FOUND', 'Periodo no encontrado o ya cerrado.'); return; }
      ok(res, data);
    } catch { fail(res, 500, 'PERIOD_ERROR', 'No se pudo cerrar el periodo.'); }
  });

router.get('/years/:id/non-school-days', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query('SELECT id,fecha,tipo,motivo FROM dias_no_lectivos WHERE anio_lectivo_id=$1 ORDER BY fecha',
      [req.params.id])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudo consultar el calendario.'); }
});

router.post('/years/:id/non-school-days', requireRoles(['SUPERADMIN', 'DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ fecha: z.string().date(), tipo: z.enum(['FERIADO','VACACIONES','SUSPENSION','INSTITUCIONAL']),
    motivo: z.string().min(2).max(150) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Día no lectivo inválido.'); return; }
  try {
    const data = await mutate(req, async (client) => {
      const year=await client.query<{fecha_inicio:string;fecha_fin:string}>(
        'SELECT fecha_inicio,fecha_fin FROM anios_lectivos WHERE id=$1',[req.params.id]);
      if(!year.rowCount || parsed.data.fecha<year.rows[0].fecha_inicio ||
        parsed.data.fecha>year.rows[0].fecha_fin)throw new Error('OUT_OF_YEAR');
      return (await client.query(`INSERT INTO dias_no_lectivos(tenant_id,anio_lectivo_id,fecha,tipo,motivo)
        VALUES($1,$2,$3,$4,$5) RETURNING id,fecha`,
      [req.user!.tenantId,req.params.id,parsed.data.fecha,parsed.data.tipo,parsed.data.motivo])).rows[0];
    },
    'CREATE_NON_SCHOOL_DAY', 'dias_no_lectivos', parsed.data);
    ok(res, data, 201);
  } catch { fail(res, 409, 'DAY_CONFLICT', 'La fecha ya existe o no pertenece al año.'); }
});

router.get('/years/:id/sections', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query(`SELECT id,nivel,grado,seccion,aforo_maximo,sede_id,tutor_id
        FROM grados_secciones WHERE anio_lectivo_id=$1 ORDER BY nivel,grado,seccion`, [req.params.id])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCHOOL_ERROR', 'No se pudieron consultar las secciones.'); }
});

router.post('/years/:id/sections', requireRoles(['SUPERADMIN','DIRECTIVO','COORDINADOR_ACADEMICO','SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ nivel: z.enum(['INICIAL','PRIMARIA','SECUNDARIA']), grado: z.number().int().min(1).max(6),
      seccion: z.string().length(1), aforoMaximo: z.number().int().min(1).max(100),
      sedeId: z.string().uuid().optional() }).safeParse(req.body);
    if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Sección inválida.'); return; }
    try {
      const d = parsed.data;
      const data = await mutate(req, async (client) =>
        (await client.query(`INSERT INTO grados_secciones
          (tenant_id,anio_lectivo_id,nivel,grado,seccion,aforo_maximo,sede_id)
          VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,nivel,grado,seccion`,
        [req.user!.tenantId,req.params.id,d.nivel,d.grado,d.seccion.toUpperCase(),d.aforoMaximo,d.sedeId ?? null])).rows[0],
      'CREATE_SECTION', 'grados_secciones', d);
      ok(res, data, 201);
    } catch { fail(res, 409, 'SECTION_CONFLICT', 'La sección ya existe o es inválida.'); }
  });

router.get('/years/:id/scales', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) =>
      (await client.query(`SELECT e.id,e.nivel,e.modalidad,e.estado,e.aprobada_en,
         COALESCE(json_agg(json_build_object('nivel',r.nivel_logro,'min',r.nota_minima,'max',r.nota_maxima,
           'descripcion',r.descripcion)) FILTER (WHERE r.id IS NOT NULL),'[]') AS rangos
         FROM escalas_calificacion e LEFT JOIN rangos_escala r ON r.escala_id=e.id
         WHERE e.anio_lectivo_id=$1 GROUP BY e.id ORDER BY e.nivel`, [req.params.id])).rows);
    ok(res, data);
  } catch { fail(res, 500, 'SCALE_ERROR', 'No se pudieron consultar las escalas.'); }
});

router.post('/years/:id/scales', requireRoles(['SUPERADMIN','DIRECTIVO','COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ nivel: z.enum(['INICIAL','PRIMARIA','SECUNDARIA']),
      modalidad: z.enum(['LITERAL','DUAL_VIGESIMAL']), rangos: z.array(z.object({
        nivel: z.enum(['AD','A','B','C']), min: z.number().min(0).max(20).nullable(),
        max: z.number().min(0).max(20).nullable(), descripcion: z.string().min(1).max(150),
      })).length(4) }).safeParse(req.body);
    if (!parsed.success || new Set(parsed.data.rangos.map((r) => r.nivel)).size !== 4) {
      fail(res, 400, 'VALIDATION_FAILED', 'La escala requiere AD, A, B y C.'); return;
    }
    if(parsed.data.rangos.some(r=>parsed.data.modalidad==='LITERAL'
      ? r.min!==null||r.max!==null : r.min===null||r.max===null)){
      fail(res,400,'VALIDATION_FAILED','Rangos incompatibles con la modalidad.');return;
    }
    try {
      const d = parsed.data;
      const data = await mutate(req, async (client) => {
        const scale = (await client.query<{ id: string }>(`INSERT INTO escalas_calificacion
          (tenant_id,anio_lectivo_id,nivel,modalidad) VALUES($1,$2,$3,$4) RETURNING id`,
          [req.user!.tenantId,req.params.id,d.nivel,d.modalidad])).rows[0];
        for (const r of d.rangos) await client.query(`INSERT INTO rangos_escala
          (tenant_id,escala_id,nivel_logro,nota_minima,nota_maxima,descripcion)
          VALUES($1,$2,$3,$4,$5,$6)`,
          [req.user!.tenantId,scale.id,r.nivel,r.min,r.max,r.descripcion]);
        return scale;
      }, 'CREATE_SCALE', 'escalas_calificacion', { nivel: d.nivel, modalidad: d.modalidad });
      ok(res, data, 201);
    } catch { fail(res, 409, 'SCALE_CONFLICT', 'No se pudo crear la escala.'); }
  });

router.post('/scales/:id/approve', requireRoles(['SUPERADMIN','DIRECTIVO']), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ fuenteAprobacion: z.string().min(5).max(500) }).safeParse(req.body);
  if (!parsed.success) { fail(res, 400, 'VALIDATION_FAILED', 'Indique la aprobación académica.'); return; }
  try {
    const data = await mutate(req, async (client) => {
      const found = await client.query<{ id: string; anio_lectivo_id: string; nivel: string; estado: string }>(
        'SELECT id,anio_lectivo_id,nivel,estado FROM escalas_calificacion WHERE id=$1 FOR UPDATE', [req.params.id]);
      const scale = found.rows[0];
      if (!scale || scale.estado !== 'BORRADOR') return null;
      await client.query(`UPDATE escalas_calificacion SET estado='REEMPLAZADA'
        WHERE tenant_id=$1 AND anio_lectivo_id=$2 AND nivel=$3 AND estado='VIGENTE'`,
        [req.user!.tenantId,scale.anio_lectivo_id,scale.nivel]);
      return (await client.query(`UPDATE escalas_calificacion SET estado='VIGENTE',aprobada_por=$1,
        aprobada_en=now() WHERE id=$2 RETURNING id,estado`, [req.user!.id,scale.id])).rows[0];
    }, 'APPROVE_SCALE', 'escalas_calificacion', { id: req.params.id, fuenteAprobacion: parsed.data.fuenteAprobacion });
    if (!data) { fail(res, 404, 'SCALE_NOT_FOUND', 'Escala borrador no encontrada.'); return; }
    ok(res, data);
  } catch { fail(res, 409, 'SCALE_INVALID', 'La escala no puede publicarse sin rangos válidos.'); }
});

export default router;
