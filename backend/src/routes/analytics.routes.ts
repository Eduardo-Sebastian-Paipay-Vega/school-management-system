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

// RF-47, RF-48, RF-49: Mapa de calor de rendimiento académico por sección y periodo (Drill-Down)
router.get('/academic/heatmap', async (req: AuthenticatedRequest, res) => {
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;
  const nivel = typeof req.query.nivel === 'string' ? req.query.nivel : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT gs.id AS seccion_id, gs.nivel, gs.grado, gs.seccion, ev.periodo_id,
                ROUND(AVG(c.nota_vigesimal), 2)::float AS promedio_seccion_vigesimal,
                COUNT(CASE WHEN c.nota_vigesimal < 11 THEN 1 END)::int AS total_desaprobados,
                COUNT(CASE WHEN c.nota_vigesimal >= 14 THEN 1 END)::int AS total_destacados,
                CASE
                  WHEN AVG(c.nota_vigesimal) >= 16 THEN 'OPTIMO'
                  WHEN AVG(c.nota_vigesimal) >= 13 THEN 'ESPERADO'
                  WHEN AVG(c.nota_vigesimal) >= 11 THEN 'EN_PROCESO'
                  ELSE 'EN_RIESGO'
                END AS semaforo_calor
           FROM grados_secciones gs
           JOIN evaluaciones ev ON ev.seccion_id = gs.id
           JOIN calificaciones c ON c.evaluacion_id = ev.id
          WHERE gs.tenant_id = $1
            AND ($2::uuid IS NULL OR ev.periodo_id = $2::uuid)
            AND ($3::text IS NULL OR gs.nivel = $3::text)
          GROUP BY gs.tenant_id, gs.id, gs.nivel, gs.grado, gs.seccion, ev.periodo_id
          ORDER BY gs.nivel, gs.grado, gs.seccion`,
        [req.user!.tenantId, periodoId, nivel]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'HEATMAP_ERROR', 'No se pudo generar el mapa de calor académico.');
  }
});

// RF-50, RF-51: Cuadro de mérito estudiantil por sección o grado
router.get('/academic/merit-ranking', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT m.id AS matricula_id, p.id AS estudiante_id,
                p.nombres, p.apellido_paterno, p.apellido_materno,
                gs.nivel, gs.grado, gs.seccion,
                ROUND(AVG(c.nota_vigesimal), 2)::float AS promedio_ponderado,
                COUNT(c.id)::int AS evaluaciones_calificadas,
                RANK() OVER (PARTITION BY gs.id ORDER BY AVG(c.nota_vigesimal) DESC) AS puesto_seccion
           FROM matriculas m
           JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
           JOIN grados_secciones gs ON gs.id = m.seccion_id AND gs.tenant_id = m.tenant_id
           JOIN calificaciones c ON c.matricula_id = m.id
           JOIN evaluaciones ev ON ev.id = c.evaluacion_id
          WHERE m.tenant_id = $1
            AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
            AND ($2::uuid IS NULL OR m.seccion_id = $2::uuid)
            AND ($3::uuid IS NULL OR ev.periodo_id = $3::uuid)
          GROUP BY m.id, p.id, gs.id
          ORDER BY gs.nivel, gs.grado, gs.seccion, promedio_ponderado DESC
          LIMIT 100`,
        [req.user!.tenantId, seccionId, periodoId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'MERIT_RANKING_ERROR', 'No se pudo calcular el cuadro de mérito.');
  }
});

// RF-52, RF-53, RF-54: Detección temprana de ausentismo crónico y alerta de deserción
router.get('/attendance/risk-dropout', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT m.id AS matricula_id, p.id AS estudiante_id,
                p.nombres, p.apellido_paterno, p.apellido_materno,
                gs.nivel, gs.grado, gs.seccion,
                COUNT(aa.id)::int AS total_registros,
                COUNT(aa.id) FILTER (WHERE aa.estado = 'FALTA_INJUSTIFICADA')::int AS faltas_injustificadas,
                COUNT(aa.id) FILTER (WHERE aa.estado = 'TARDANZA_INJUSTIFICADA')::int AS tardanzas_injustificadas,
                CASE
                  WHEN COUNT(aa.id) = 0 THEN 0
                  ELSE ROUND(
                    100.0 * COUNT(aa.id) FILTER (WHERE aa.estado IN ('FALTA_INJUSTIFICADA', 'FALTA_JUSTIFICADA')) / COUNT(aa.id),
                    2
                  )::float
                END AS tasa_inasistencia_pct,
                CASE
                  WHEN COUNT(aa.id) FILTER (WHERE aa.estado = 'FALTA_INJUSTIFICADA') >= 5 THEN 'RIESGO_ALTO'
                  WHEN COUNT(aa.id) FILTER (WHERE aa.estado = 'FALTA_INJUSTIFICADA') >= 3
                    OR COUNT(aa.id) FILTER (WHERE aa.estado = 'TARDANZA_INJUSTIFICADA') >= 5 THEN 'RIESGO_MODERADO'
                  ELSE 'SIN_RIESGO'
                END AS nivel_riesgo_desercion
           FROM matriculas m
           JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
           JOIN grados_secciones gs ON gs.id = m.seccion_id AND gs.tenant_id = m.tenant_id
           LEFT JOIN asistencias_alumnos aa ON aa.matricula_id = m.id
          WHERE m.tenant_id = $1
            AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
            AND ($2::uuid IS NULL OR m.seccion_id = $2::uuid)
          GROUP BY m.id, p.id, gs.id
          ORDER BY faltas_injustificadas DESC, tardanzas_injustificadas DESC`,
        [req.user!.tenantId, seccionId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'DROPOUT_RISK_ERROR', 'No se pudo calcular la analítica de riesgo de deserción.');
  }
});

// RF-55, RF-83: Tablero de cumplimiento de registro de notas docente
router.get('/compliance/teachers', async (req: AuthenticatedRequest, res) => {
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT v.evaluacion_id, v.docente_id, v.seccion_id, v.curso_id, v.periodo_id,
                v.estudiantes_esperados::int, v.notas_registradas::int, v.avance_porcentaje::float,
                p.nombres AS docente_nombres, p.apellido_paterno AS docente_apellido,
                gs.nivel, gs.grado, gs.seccion
           FROM v_avance_registro_notas v
           JOIN usuarios u ON u.id = v.docente_id AND u.tenant_id = v.tenant_id
           JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
           JOIN grados_secciones gs ON gs.id = v.seccion_id AND gs.tenant_id = v.tenant_id
          WHERE v.tenant_id = $1
            AND ($2::uuid IS NULL OR v.periodo_id = $2::uuid)
          ORDER BY v.avance_porcentaje ASC, p.apellido_paterno ASC`,
        [req.user!.tenantId, periodoId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'TEACHER_COMPLIANCE_ERROR', 'No se pudo consultar el avance de registro docente.');
  }
});

// RF-56: Ficha 360° del Estudiante con Radar Chart de 5 Dimensiones
router.get('/student/:studentId/radar-360', async (req: AuthenticatedRequest, res) => {
  try {
    const profile360 = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const studentRes = await client.query<{
        id: string;
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string | null;
        codigo_siagie: string | null;
      }>(
        `SELECT id, nombres, apellido_paterno, apellido_materno, codigo_siagie
           FROM personas
          WHERE id = $1 AND tenant_id = $2`,
        [req.params.studentId, req.user!.tenantId]
      );
      if (!studentRes.rowCount) return null;
      const student = studentRes.rows[0];

      // 1. Dimensión Académica (0..100)
      const gradesRes = await client.query<{ avg_score: number | null; total: number }>(
        `SELECT ROUND(AVG(c.nota_vigesimal), 2)::float AS avg_score, COUNT(c.id)::int AS total
           FROM calificaciones c
           JOIN matriculas m ON m.id = c.matricula_id
          WHERE m.tenant_id = $1 AND m.estudiante_id = $2`,
        [req.user!.tenantId, student.id]
      );
      const avgVigesimal = gradesRes.rows[0]?.avg_score ?? 14;
      const dimAcademica = Math.min(100, Math.round((avgVigesimal / 20) * 100));

      // 2. Dimensión Asistencia y Puntualidad (0..100)
      const attRes = await client.query<{ total: number; puntuales: number; faltas: number }>(
        `SELECT COUNT(aa.id)::int AS total,
                COUNT(aa.id) FILTER (WHERE aa.estado = 'PRESENTE')::int AS puntuales,
                COUNT(aa.id) FILTER (WHERE aa.estado = 'FALTA_INJUSTIFICADA')::int AS faltas
           FROM asistencias_alumnos aa
           JOIN matriculas m ON m.id = aa.matricula_id
          WHERE m.tenant_id = $1 AND m.estudiante_id = $2`,
        [req.user!.tenantId, student.id]
      );
      const totalAtt = attRes.rows[0]?.total ?? 0;
      const dimAsistencia =
        totalAtt === 0 ? 100 : Math.max(0, Math.round((attRes.rows[0].puntuales / totalAtt) * 100));

      // 3. Dimensión Conclusiones y Progreso CNEB (0..100)
      const concRes = await client.query<{ total: number }>(
        `SELECT COUNT(cd.id)::int AS total
           FROM conclusiones_descriptivas cd
           JOIN matriculas m ON m.id = cd.matricula_id
          WHERE m.tenant_id = $1 AND m.estudiante_id = $2`,
        [req.user!.tenantId, student.id]
      );
      const dimCompetencias = Math.min(100, 75 + (concRes.rows[0]?.total ?? 0) * 5);

      // 4. Dimensión Vinculación Familiar y Apoderados (0..100)
      const guardRes = await client.query<{ vinculados: number; citas: number }>(
        `SELECT
           (SELECT COUNT(*)::int FROM apoderados_estudiantes WHERE tenant_id = $1 AND estudiante_id = $2 AND activo = true) AS vinculados,
           (SELECT COUNT(*)::int FROM citas_apoderados WHERE tenant_id = $1 AND estudiante_id = $2 AND estado = 'REALIZADA') AS citas`,
        [req.user!.tenantId, student.id]
      );
      const dimParticipacionFamiliar =
        (guardRes.rows[0]?.vinculados ?? 0) > 0
          ? Math.min(100, 80 + (guardRes.rows[0]?.citas ?? 0) * 10)
          : 50;

      // 5. Dimensión Convivencia y Conducta (0..100)
      const dimConvivencia = Math.max(60, 100 - (attRes.rows[0]?.faltas ?? 0) * 8);

      return {
        estudiante: {
          id: student.id,
          nombreCompleto: `${student.nombres} ${student.apellido_paterno} ${student.apellido_materno ?? ''}`.trim(),
          codigoSiagie: student.codigo_siagie,
        },
        resumenMetricas: {
          promedioVigesimal: avgVigesimal,
          evaluacionesRegistradas: gradesRes.rows[0]?.total ?? 0,
          asistenciasTotales: totalAtt,
          faltasInjustificadas: attRes.rows[0]?.faltas ?? 0,
        },
        radarDimensiones: [
          { dimension: 'Rendimiento Académico', valor: dimAcademica, maximo: 100 },
          { dimension: 'Asistencia y Puntualidad', valor: dimAsistencia, maximo: 100 },
          { dimension: 'Logro de Competencias CNEB', valor: dimCompetencias, maximo: 100 },
          { dimension: 'Participación Familiar', valor: dimParticipacionFamiliar, maximo: 100 },
          { dimension: 'Convivencia Escolar', valor: dimConvivencia, maximo: 100 },
        ],
      };
    });

    if (!profile360) {
      fail(res, 404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado.');
      return;
    }
    ok(res, profile360);
  } catch {
    fail(res, 500, 'RADAR_360_ERROR', 'No se pudo construir la Ficha 360° del estudiante.');
  }
});

// RF-57, RF-58: Métricas de Impacto del Servicio Social Universitario IS-480 (UNSCH)
router.get('/ssu/impact', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const members = await client.query(
        `SELECT id, integrante_nombre, horas_acumuladas::float, meta_horas::float,
                ROUND(100.0 * horas_acumuladas / NULLIF(meta_horas, 0), 2)::float AS porcentaje_avance,
                modulo_responsable, updated_at
           FROM metricas_impacto_ssu
          ORDER BY id ASC`
      );
      return members.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'SSU_IMPACT_ERROR', 'No se pudieron consultar las métricas de impacto SSU IS-480.');
  }
});

router.patch(
  '/ssu/impact/:id',
  requireRoles(['SUPERADMIN', 'DIRECTIVO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ horasAcumuladas: z.number().min(0).max(200) }).safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Cantidad de horas SSU inválida.');
      return;
    }

    try {
      const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const upd = await client.query(
          `UPDATE metricas_impacto_ssu
              SET horas_acumuladas = $1, updated_at = now()
            WHERE id = $2
            RETURNING id, integrante_nombre, horas_acumuladas::float, meta_horas::float, modulo_responsable, updated_at`,
          [parsed.data.horasAcumuladas, Number(req.params.id)]
        );
        if (!upd.rowCount) return null;

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'UPDATE_SSU_METRICS',
            entidad: 'metricas_impacto_ssu',
            entidadId: String(req.params.id),
            datosNuevos: parsed.data,
            ipOrigen: req.ip,
          },
          client
        );

        return upd.rows[0];
      });

      if (!updated) {
        fail(res, 404, 'SSU_MEMBER_NOT_FOUND', 'Integrante SSU no encontrado.');
        return;
      }
      ok(res, updated);
    } catch {
      fail(res, 500, 'SSU_UPDATE_ERROR', 'No se pudo actualizar el avance de horas SSU.');
    }
  }
);

// RF-89: Agenda de citas entre apoderados y docentes tutores (Franjas y Reservas)
router.get('/appointments/slots', async (req: AuthenticatedRequest, res) => {
  const docenteId = typeof req.query.docenteId === 'string' ? req.query.docenteId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT fa.id, fa.docente_id, fa.inicio, fa.fin, fa.modalidad, fa.lugar_o_enlace,
                p.nombres AS docente_nombres, p.apellido_paterno AS docente_apellido,
                NOT EXISTS (
                  SELECT 1 FROM citas_apoderados ca
                   WHERE ca.franja_id = fa.id AND ca.estado IN ('RESERVADA', 'REALIZADA')
                ) AS disponible
           FROM franjas_atencion fa
           JOIN usuarios u ON u.id = fa.docente_id AND u.tenant_id = fa.tenant_id
           JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
          WHERE fa.tenant_id = $1
            AND ($2::uuid IS NULL OR fa.docente_id = $2::uuid)
          ORDER BY fa.inicio ASC`,
        [req.user!.tenantId, docenteId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'SLOTS_FETCH_ERROR', 'No se pudieron consultar las franjas de atención.');
  }
});

router.post(
  '/appointments/slots',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'TUTOR_AULA', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        inicio: z.string().datetime(),
        fin: z.string().datetime(),
        modalidad: z.enum(['PRESENCIAL', 'VIRTUAL']),
        lugarOEnlace: z.string().max(500).optional(),
      })
      .refine((d) => new Date(d.fin).getTime() > new Date(d.inicio).getTime(), {
        message: 'La hora de fin debe ser posterior al inicio.',
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Rango de franja horaria inválido.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const ins = await client.query(
          `INSERT INTO franjas_atencion (tenant_id, docente_id, inicio, fin, modalidad, lugar_o_enlace)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, docente_id, inicio, fin, modalidad, lugar_o_enlace`,
          [req.user!.tenantId, req.user!.id, d.inicio, d.fin, d.modalidad, d.lugarOEnlace ?? null]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'CREATE_APPOINTMENT_SLOT',
            entidad: 'franjas_atencion',
            entidadId: ins.rows[0].id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return ins.rows[0];
      });
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'SLOT_CONFLICT', 'No se pudo registrar la franja de atención.');
    }
  }
);

router.get('/appointments', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT ca.id, ca.franja_id, ca.apoderado_id, ca.estudiante_id, ca.motivo,
                ca.convocada_por_docente, ca.estado, ca.acuerdos, ca.created_at,
                fa.inicio, fa.fin, fa.modalidad, fa.lugar_o_enlace,
                pe.nombres AS estudiante_nombres, pe.apellido_paterno AS estudiante_apellido
           FROM citas_apoderados ca
           JOIN franjas_atencion fa ON fa.id = ca.franja_id AND fa.tenant_id = ca.tenant_id
           JOIN personas pe ON pe.id = ca.estudiante_id AND pe.tenant_id = ca.tenant_id
          WHERE ca.tenant_id = $1
          ORDER BY fa.inicio DESC
          LIMIT 100`,
        [req.user!.tenantId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'APPOINTMENTS_FETCH_ERROR', 'No se pudieron consultar las citas.');
  }
});

router.post(
  '/appointments',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'TUTOR_AULA', 'DOCENTE', 'APODERADO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        franjaId: z.string().uuid(),
        apoderadoUsuarioId: z.string().uuid().optional(),
        estudianteId: z.string().uuid(),
        motivo: z.string().min(5).max(500),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de reserva de cita inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const isTeacher = req.user!.roles.some((r) => ['TUTOR_AULA', 'DOCENTE', 'DIRECTIVO', 'SUPERADMIN'].includes(r));
      const targetGuardianUserId = d.apoderadoUsuarioId ?? req.user!.id;

      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const slot = await client.query<{ id: string; docente_id: string }>(
          `SELECT id, docente_id FROM franjas_atencion WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
          [d.franjaId, req.user!.tenantId]
        );
        if (!slot.rowCount) return null;

        const ins = await client.query(
          `INSERT INTO citas_apoderados (
             tenant_id, franja_id, apoderado_id, estudiante_id, motivo, convocada_por_docente, estado
           ) VALUES ($1, $2, $3, $4, $5, $6, 'RESERVADA')
           RETURNING id, franja_id, apoderado_id, estudiante_id, motivo, convocada_por_docente, estado, created_at`,
          [req.user!.tenantId, d.franjaId, targetGuardianUserId, d.estudianteId, d.motivo.trim(), isTeacher]
        );

        await NotificationService.create(
          client,
          req.user!.tenantId,
          isTeacher ? targetGuardianUserId : slot.rows[0].docente_id,
          {
            categoria: 'CITAS',
            prioridad: 'NORMAL',
            titulo: 'Nueva cita de tutoría programada',
            mensaje: `Motivo: ${d.motivo.trim()}`,
          }
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'BOOK_APPOINTMENT',
            entidad: 'citas_apoderados',
            entidadId: ins.rows[0].id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return ins.rows[0];
      });

      if (!created) {
        fail(res, 404, 'SLOT_NOT_FOUND', 'Franja horaria no encontrada.');
        return;
      }
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'APPOINTMENT_CONFLICT', 'La franja horaria ya se encuentra reservada.');
    }
  }
);

router.patch(
  '/appointments/:id',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'TUTOR_AULA', 'DOCENTE', 'APODERADO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        estado: z.enum(['CANCELADA', 'CANCELACION_TARDIA', 'REALIZADA']),
        acuerdos: z.string().max(2000).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Estado o acuerdos de cita inválidos.');
      return;
    }

    try {
      const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const upd = await client.query(
          `UPDATE citas_apoderados
              SET estado = $1,
                  acuerdos = COALESCE($2, acuerdos)
            WHERE id = $3 AND tenant_id = $4
            RETURNING id, franja_id, estado, acuerdos`,
          [parsed.data.estado, parsed.data.acuerdos ?? null, req.params.id, req.user!.tenantId]
        );
        if (!upd.rowCount) return null;

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'UPDATE_APPOINTMENT',
            entidad: 'citas_apoderados',
            entidadId: req.params.id,
            datosNuevos: parsed.data,
            ipOrigen: req.ip,
          },
          client
        );

        return upd.rows[0];
      });

      if (!updated) {
        fail(res, 404, 'APPOINTMENT_NOT_FOUND', 'Cita no encontrada.');
        return;
      }
      ok(res, updated);
    } catch {
      fail(res, 500, 'APPOINTMENT_UPDATE_ERROR', 'No se pudo actualizar la cita.');
    }
  }
);

export default router;
