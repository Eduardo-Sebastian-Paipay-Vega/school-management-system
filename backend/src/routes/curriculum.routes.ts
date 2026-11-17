import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notifications.service';

const router = Router();
router.use(authenticateJwt);

const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

async function mutate<T>(
  req: AuthenticatedRequest,
  fn: (client: import('pg').PoolClient) => Promise<T>,
  action: string,
  entity: string,
  payload: unknown
) {
  return withTenant(req.user!.tenantId, req.user!.id, async (client) => {
    const value = await fn(client);
    if (value === null || value === undefined) return value;
    await AuditService.record(
      {
        tenantId: req.user!.tenantId,
        usuarioId: req.user!.id,
        accion: action,
        entidad: entity,
        datosNuevos: payload,
        ipOrigen: req.ip,
      },
      client
    );
    return value;
  });
}

// RF-17: Listar cursos / áreas curriculares CNEB
router.get('/courses', async (req: AuthenticatedRequest, res) => {
  const nivel = typeof req.query.nivel === 'string' ? req.query.nivel : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(
        `SELECT c.id, c.nivel, c.nombre, c.codigo_cneb, c.es_taller, c.activo,
                COALESCE(
                  json_agg(
                    json_build_object('id', comp.id, 'nombre', comp.nombre, 'orden', comp.orden, 'activo', comp.activo)
                    ORDER BY comp.orden
                  ) FILTER (WHERE comp.id IS NOT NULL),
                  '[]'
                ) AS competencias
           FROM cursos c
           LEFT JOIN competencias comp ON comp.curso_id = c.id AND comp.tenant_id = c.tenant_id
          WHERE c.tenant_id = $1
            AND ($2::text IS NULL OR c.nivel = $2::text)
          GROUP BY c.id
          ORDER BY c.nivel, c.nombre`,
        [req.user!.tenantId, nivel]
      );
      return result.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'COURSES_FETCH_ERROR', 'No se pudo consultar el catálogo de cursos.');
  }
});

// RF-17: Crear curso o área curricular CNEB
router.post(
  '/courses',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        nivel: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA']),
        nombre: z.string().min(2).max(100),
        codigoCneb: z.string().min(2).max(20).optional(),
        esTaller: z.boolean().default(false),
      })
      .refine((d) => d.esTaller || Boolean(d.codigoCneb), {
        message: 'Las áreas oficiales CNEB requieren código CNEB.',
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de curso o área curricular inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          const ins = await client.query(
            `INSERT INTO cursos (tenant_id, nivel, nombre, codigo_cneb, es_taller)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nivel, nombre, codigo_cneb, es_taller, activo`,
            [req.user!.tenantId, d.nivel, d.nombre.trim(), d.codigoCneb ?? null, d.esTaller]
          );
          return ins.rows[0];
        },
        'CREATE_COURSE',
        'cursos',
        d
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'COURSE_CONFLICT', 'El curso ya existe en este nivel educativo.');
    }
  }
);

// RF-17: Registrar competencia asociada a un curso CNEB
router.post(
  '/courses/:courseId/competencies',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        nombre: z.string().min(3).max(200),
        orden: z.number().int().min(1).max(20),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de competencia inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          const ins = await client.query(
            `INSERT INTO competencias (tenant_id, curso_id, nombre, orden)
             VALUES ($1, $2, $3, $4)
             RETURNING id, curso_id, nombre, orden, activo`,
            [req.user!.tenantId, req.params.courseId, d.nombre.trim(), d.orden]
          );
          return ins.rows[0];
        },
        'CREATE_COMPETENCY',
        'competencias',
        { courseId: req.params.courseId, ...d }
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'COMPETENCY_CONFLICT', 'El orden de competencia ya existe o el curso no es válido.');
    }
  }
);

// RF-17: Consultar y registrar plan de estudios
router.get('/study-plans', async (req: AuthenticatedRequest, res) => {
  const anioLectivoId = typeof req.query.anioLectivoId === 'string' ? req.query.anioLectivoId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT pe.id, pe.anio_lectivo_id, pe.nivel, pe.grado, pe.curso_id, pe.horas_semanales,
                c.nombre AS curso_nombre, c.codigo_cneb
           FROM plan_estudios pe
           JOIN cursos c ON c.id = pe.curso_id AND c.tenant_id = pe.tenant_id
          WHERE pe.tenant_id = $1
            AND ($2::uuid IS NULL OR pe.anio_lectivo_id = $2::uuid)
          ORDER BY pe.nivel, pe.grado, c.nombre`,
        [req.user!.tenantId, anioLectivoId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'STUDY_PLAN_ERROR', 'No se pudo consultar el plan de estudios.');
  }
});

router.post(
  '/study-plans',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        anioLectivoId: z.string().uuid(),
        nivel: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA']),
        grado: z.number().int().min(1).max(6),
        cursoId: z.string().uuid(),
        horasSemanales: z.number().int().min(1).max(20),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de plan de estudios inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          const ins = await client.query(
            `INSERT INTO plan_estudios (tenant_id, anio_lectivo_id, nivel, grado, curso_id, horas_semanales)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, anio_lectivo_id, nivel, grado, curso_id, horas_semanales`,
            [req.user!.tenantId, d.anioLectivoId, d.nivel, d.grado, d.cursoId, d.horasSemanales]
          );
          return ins.rows[0];
        },
        'CREATE_STUDY_PLAN_ITEM',
        'plan_estudios',
        d
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'STUDY_PLAN_CONFLICT', 'El curso ya está asignado a ese grado y año lectivo.');
    }
  }
);

// RF-18: Consultar y asignar carga lectiva docente
router.get('/teaching-loads', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const docenteId = typeof req.query.docenteId === 'string' ? req.query.docenteId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT cl.id, cl.seccion_id, cl.curso_id, cl.docente_id, cl.horas_semanales, cl.activo,
                c.nombre AS curso_nombre, c.codigo_cneb,
                gs.nivel, gs.grado, gs.seccion,
                p.nombres AS docente_nombres, p.apellido_paterno AS docente_apellido
           FROM carga_lectiva cl
           JOIN cursos c ON c.id = cl.curso_id AND c.tenant_id = cl.tenant_id
           JOIN grados_secciones gs ON gs.id = cl.seccion_id AND gs.tenant_id = cl.tenant_id
           JOIN usuarios u ON u.id = cl.docente_id AND u.tenant_id = cl.tenant_id
           JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
          WHERE cl.tenant_id = $1
            AND cl.activo = true
            AND ($2::uuid IS NULL OR cl.seccion_id = $2::uuid)
            AND ($3::uuid IS NULL OR cl.docente_id = $3::uuid)
          ORDER BY gs.nivel, gs.grado, gs.seccion, c.nombre`,
        [req.user!.tenantId, seccionId, docenteId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'TEACHING_LOAD_ERROR', 'No se pudo consultar la carga lectiva.');
  }
});

router.post(
  '/teaching-loads',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        seccionId: z.string().uuid(),
        cursoId: z.string().uuid(),
        docenteId: z.string().uuid(),
        horasSemanales: z.number().int().min(1).max(20),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de carga lectiva inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          // Desactivar asignación previa si existe para permitir reemplazo con historial
          await client.query(
            `UPDATE carga_lectiva SET activo = false WHERE tenant_id = $1 AND seccion_id = $2 AND curso_id = $3 AND activo = true`,
            [req.user!.tenantId, d.seccionId, d.cursoId]
          );
          const ins = await client.query(
            `INSERT INTO carga_lectiva (tenant_id, seccion_id, curso_id, docente_id, horas_semanales, activo)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING id, seccion_id, curso_id, docente_id, horas_semanales, activo`,
            [req.user!.tenantId, d.seccionId, d.cursoId, d.docenteId, d.horasSemanales]
          );
          return ins.rows[0];
        },
        'ASSIGN_TEACHING_LOAD',
        'carga_lectiva',
        d
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'TEACHING_LOAD_CONFLICT', 'No se pudo asignar la carga lectiva.');
    }
  }
);

// RF-79: Calendario de tareas, exámenes y actividades evaluativas
router.get('/activities', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT ae.id, ae.evaluacion_id, ae.seccion_id, ae.curso_id, ae.docente_id, ae.periodo_id,
                ae.tipo, ae.titulo, ae.descripcion, ae.competencia, ae.fecha_programada,
                ae.adjunto_url, ae.estado, ae.motivo_anulacion,
                gs.nivel, gs.grado, gs.seccion
           FROM actividades_evaluativas ae
           JOIN grados_secciones gs ON gs.id = ae.seccion_id AND gs.tenant_id = ae.tenant_id
          WHERE ae.tenant_id = $1
            AND ($2::uuid IS NULL OR ae.seccion_id = $2::uuid)
            AND ($3::uuid IS NULL OR ae.periodo_id = $3::uuid)
          ORDER BY ae.fecha_programada ASC`,
        [req.user!.tenantId, seccionId, periodoId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'ACTIVITIES_FETCH_ERROR', 'No se pudo consultar el calendario de actividades.');
  }
});

router.post(
  '/activities',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE', 'DOCENTE_CONTRATADO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        seccionId: z.string().uuid(),
        cursoId: z.string().uuid(),
        periodoId: z.string().uuid(),
        tipo: z.enum(['TAREA', 'EXAMEN', 'PRACTICA', 'EXPOSICION', 'PROYECTO']),
        titulo: z.string().min(3).max(150),
        descripcion: z.string().max(1000).optional(),
        competencia: z.string().min(3).max(150),
        fechaProgramada: z.string().datetime(),
        peso: z.number().min(0.1).max(5).default(1.0),
        adjuntoUrl: z.string().url().max(1000).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de actividad evaluativa inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          const ev = await client.query<{ id: string }>(
            `INSERT INTO evaluaciones (seccion_id, curso_id, docente_id, periodo_id, nombre, peso)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [d.seccionId, d.cursoId, req.user!.id, d.periodoId, d.titulo.trim(), d.peso]
          );

          const act = await client.query(
            `INSERT INTO actividades_evaluativas (
               tenant_id, evaluacion_id, seccion_id, curso_id, docente_id, periodo_id,
               tipo, titulo, descripcion, competencia, fecha_programada, adjunto_url, estado
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PROGRAMADA')
             RETURNING id, evaluacion_id, seccion_id, curso_id, periodo_id, tipo, titulo, competencia, fecha_programada, estado`,
            [
              req.user!.tenantId,
              ev.rows[0].id,
              d.seccionId,
              d.cursoId,
              req.user!.id,
              d.periodoId,
              d.tipo,
              d.titulo.trim(),
              d.descripcion ?? null,
              d.competencia.trim(),
              d.fechaProgramada,
              d.adjuntoUrl ?? null,
            ]
          );

          return act.rows[0];
        },
        'CREATE_EVALUATIVE_ACTIVITY',
        'actividades_evaluativas',
        d
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'ACTIVITY_CONFLICT', 'No se pudo programar la actividad evaluativa.');
    }
  }
);

// RF-81: Plazos de registro de notas y alertas escalonadas a docentes
router.get('/deadlines', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT id, periodo_id, evaluacion_id, fecha_limite, dias_recordatorio, umbral_llamado_dias, created_at
           FROM plazos_registro_notas
          WHERE tenant_id = $1
          ORDER BY fecha_limite DESC`,
        [req.user!.tenantId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'DEADLINES_ERROR', 'No se pudieron consultar los plazos de registro de notas.');
  }
});

router.post(
  '/deadlines',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        periodoId: z.string().uuid(),
        evaluacionId: z.string().uuid().optional(),
        fechaLimite: z.string().datetime(),
        diasRecordatorio: z.number().int().min(0).max(15).default(3),
        umbralLlamadoDias: z.number().int().min(0).max(15).default(2),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de plazo inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await mutate(
        req,
        async (client) => {
          const ins = await client.query(
            `INSERT INTO plazos_registro_notas (
               tenant_id, periodo_id, evaluacion_id, fecha_limite,
               dias_recordatorio, umbral_llamado_dias, creado_por
             ) VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, periodo_id, evaluacion_id, fecha_limite, dias_recordatorio, umbral_llamado_dias`,
            [
              req.user!.tenantId,
              d.periodoId,
              d.evaluacionId ?? null,
              d.fechaLimite,
              d.diasRecordatorio,
              d.umbralLlamadoDias,
              req.user!.id,
            ]
          );
          return ins.rows[0];
        },
        'CREATE_GRADE_DEADLINE',
        'plazos_registro_notas',
        d
      );
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'DEADLINE_CONFLICT', 'No se pudo configurar el plazo de registro de notas.');
    }
  }
);

// RF-81: Evaluar cumplimiento de plazos y emitir alertas escalonadas a docentes
router.post(
  '/alerts/evaluate',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ plazoId: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Debe indicar el identificador del plazo.');
      return;
    }

    try {
      const summary = await mutate(
        req,
        async (client) => {
          const plazoRes = await client.query<{
            id: string;
            periodo_id: string;
            fecha_limite: Date;
            dias_recordatorio: number;
            umbral_llamado_dias: number;
          }>(
            `SELECT id, periodo_id, fecha_limite, dias_recordatorio, umbral_llamado_dias
               FROM plazos_registro_notas
              WHERE id = $1 AND tenant_id = $2`,
            [parsed.data.plazoId, req.user!.tenantId]
          );
          if (!plazoRes.rowCount) return null;
          const plazo = plazoRes.rows[0];

          const nowMs = Date.now();
          const deadlineMs = new Date(plazo.fecha_limite).getTime();
          const diffDays = (nowMs - deadlineMs) / (1000 * 60 * 60 * 24);

          let nivelAlerta: 'RECORDATORIO' | 'AVISO' | 'LLAMADO_ATENCION' = 'RECORDATORIO';
          if (diffDays >= plazo.umbral_llamado_dias) {
            nivelAlerta = 'LLAMADO_ATENCION';
          } else if (diffDays >= 0) {
            nivelAlerta = 'AVISO';
          }

          const pending = await client.query<{
            docente_id: string;
            seccion_id: string;
            curso_id: string;
            avance_porcentaje: number;
          }>(
            `SELECT docente_id, seccion_id, curso_id, avance_porcentaje::float
               FROM v_avance_registro_notas
              WHERE tenant_id = $1 AND periodo_id = $2 AND avance_porcentaje < 100`,
            [req.user!.tenantId, plazo.periodo_id]
          );

          let emitidas = 0;
          for (const row of pending.rows) {
            const ins = await client.query<{ id: string }>(
              `INSERT INTO alertas_docentes (
                 tenant_id, plazo_id, docente_id, seccion_id, curso_id, nivel, avance_porcentaje
               ) VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (plazo_id, docente_id, seccion_id, curso_id, nivel) DO NOTHING
               RETURNING id`,
              [
                req.user!.tenantId,
                plazo.id,
                row.docente_id,
                row.seccion_id,
                row.curso_id,
                nivelAlerta,
                row.avance_porcentaje,
              ]
            );
            if (ins.rowCount) {
              emitidas++;
              await NotificationService.create(client, req.user!.tenantId, row.docente_id, {
                categoria: 'RECORDATORIO',
                prioridad: nivelAlerta === 'LLAMADO_ATENCION' ? 'ALTA' : 'NORMAL',
                titulo: `Alerta de registro de notas: ${nivelAlerta}`,
                mensaje: `Su avance de calificación es de ${row.avance_porcentaje}%. Complete el registro correspondiente.`,
              });
            }
          }

          return { plazoId: plazo.id, nivelDeterminado: nivelAlerta, alertasEmitidas: emitidas };
        },
        'EVALUATE_TEACHER_ALERTS',
        'alertas_docentes',
        parsed.data
      );

      if (!summary) {
        fail(res, 404, 'DEADLINE_NOT_FOUND', 'Plazo no encontrado.');
        return;
      }
      ok(res, summary);
    } catch {
      fail(res, 500, 'ALERTS_EVALUATE_ERROR', 'Error al evaluar alertas de cumplimiento docente.');
    }
  }
);

router.get('/alerts', async (req: AuthenticatedRequest, res) => {
  const docenteId = typeof req.query.docenteId === 'string' ? req.query.docenteId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT ad.id, ad.plazo_id, ad.docente_id, ad.seccion_id, ad.curso_id,
                ad.nivel, ad.avance_porcentaje, ad.emitida_en, ad.cerrada_en,
                p.nombres AS docente_nombres, p.apellido_paterno AS docente_apellido,
                gs.nivel AS nivel_educativo, gs.grado, gs.seccion
           FROM alertas_docentes ad
           JOIN usuarios u ON u.id = ad.docente_id AND u.tenant_id = ad.tenant_id
           JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
           JOIN grados_secciones gs ON gs.id = ad.seccion_id AND gs.tenant_id = ad.tenant_id
          WHERE ad.tenant_id = $1
            AND ($2::uuid IS NULL OR ad.docente_id = $2::uuid)
          ORDER BY ad.emitida_en DESC
          LIMIT 100`,
        [req.user!.tenantId, docenteId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'ALERTS_FETCH_ERROR', 'No se pudieron consultar las alertas docentes.');
  }
});

export default router;
