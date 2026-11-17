import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { randomToken, tokenHash } from '../core/identity-crypto';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notifications.service';

const router = Router();
router.use(authenticateJwt);

const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

async function notifyGuardiansOnAttendance(
  client: import('pg').PoolClient,
  tenantId: string,
  asistenciaId: string,
  estudianteId: string,
  estudianteNombre: string,
  estado: string,
  fecha: string,
  tipoAviso: 'AVISO' | 'RECTIFICACION'
) {
  const guardians = await client.query<{ usuario_id: string }>(
    `SELECT u.id AS usuario_id
       FROM apoderados_estudiantes ae
       JOIN usuarios u ON u.persona_id = ae.apoderado_id AND u.tenant_id = ae.tenant_id
      WHERE ae.tenant_id = $1 AND ae.estudiante_id = $2 AND ae.activo = true AND u.estado = 'ACTIVO'`,
    [tenantId, estudianteId]
  );

  for (const g of guardians.rows) {
    const titulo =
      tipoAviso === 'RECTIFICACION'
        ? `Rectificación de asistencia — ${estudianteNombre}`
        : `Alerta de asistencia (${estado}) — ${estudianteNombre}`;
    const mensaje =
      tipoAviso === 'RECTIFICACION'
        ? `La asistencia del estudiante ${estudianteNombre} para la fecha ${fecha} fue actualizada a ${estado}.`
        : `Se registró ${estado} para el estudiante ${estudianteNombre} en la fecha ${fecha}.`;

    const notif = await NotificationService.create(client, tenantId, g.usuario_id, {
      categoria: 'ASISTENCIA',
      prioridad: estado.includes('INJUSTIFICADA') ? 'ALTA' : 'NORMAL',
      titulo,
      mensaje,
    });

    await client.query(
      `INSERT INTO avisos_inasistencia (asistencia_id, apoderado_id, tipo, notificacion_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (asistencia_id, apoderado_id, tipo) DO NOTHING`,
      [asistenciaId, g.usuario_id, tipoAviso, notif.id]
    );

    await NotificationService.publish(tenantId, g.usuario_id, {
      type: 'ATTENDANCE_ALERT',
      asistenciaId,
      estudianteId,
      estado,
      fecha,
      tipoAviso,
    });
  }
}

// RF-26: Emitir o rotar carné escolar con token QR de 64 caracteres
router.post(
  '/qr/issue',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'AUXILIAR']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ estudianteId: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Identificador de estudiante inválido.');
      return;
    }
    try {
      const card = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const student = await client.query<{ id: string; nombres: string; apellido_paterno: string }>(
          `SELECT id, nombres, apellido_paterno FROM personas WHERE id = $1 AND tenant_id = $2`,
          [parsed.data.estudianteId, req.user!.tenantId]
        );
        if (!student.rowCount) return null;

        await client.query(`UPDATE carnes_escolares SET activo = false WHERE estudiante_id = $1 AND activo = true`, [
          parsed.data.estudianteId,
        ]);

        const qrToken = tokenHash(`${req.user!.tenantId}:${parsed.data.estudianteId}:${randomToken()}`);
        const ins = await client.query(
          `INSERT INTO carnes_escolares (estudiante_id, codigo_qr_token, activo)
           VALUES ($1, $2, true)
           RETURNING id, estudiante_id, codigo_qr_token, fecha_emision, activo`,
          [parsed.data.estudianteId, qrToken]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'ISSUE_QR_CARD',
            entidad: 'carnes_escolares',
            entidadId: ins.rows[0].id,
            datosNuevos: { estudianteId: parsed.data.estudianteId },
            ipOrigen: req.ip,
          },
          client
        );

        return {
          ...ins.rows[0],
          estudiante_nombre: `${student.rows[0].nombres} ${student.rows[0].apellido_paterno}`,
        };
      });

      if (!card) {
        fail(res, 404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado en la institución.');
        return;
      }
      ok(res, card, 201);
    } catch {
      fail(res, 500, 'QR_ISSUE_ERROR', 'No se pudo emitir el carné escolar QR.');
    }
  }
);

// RF-26: Consultar carné QR activo de un estudiante
router.get('/qr/:studentId', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const resQuery = await client.query(
        `SELECT ce.id, ce.estudiante_id, ce.codigo_qr_token, ce.fecha_emision, ce.activo,
                p.nombres, p.apellido_paterno, p.apellido_materno, p.codigo_siagie
           FROM carnes_escolares ce
           JOIN personas p ON p.id = ce.estudiante_id
          WHERE ce.estudiante_id = $1 AND p.tenant_id = $2 AND ce.activo = true
          LIMIT 1`,
        [req.params.studentId, req.user!.tenantId]
      );
      return resQuery.rows[0] ?? null;
    });
    if (!data) {
      fail(res, 404, 'QR_NOT_FOUND', 'El estudiante no posee un carné QR activo.');
      return;
    }
    ok(res, data);
  } catch {
    fail(res, 500, 'QR_FETCH_ERROR', 'Error al consultar el carné QR.');
  }
});

// RF-23, RF-24, RF-27, RF-77: Escaneo rápido en Kiosco de Portería (<200ms)
router.post(
  '/scan',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'PORTERIA', 'AUXILIAR', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        codigoQrToken: z.string().min(16).max(64),
        fecha: z.string().date().optional(),
        horaRegistro: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/)
          .optional(),
        horaLimitePuntual: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/)
          .default('08:00:00'),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Token QR o parámetros de hora inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const currentDate = d.fecha ?? new Date().toISOString().slice(0, 10);
      const currentTime = d.horaRegistro ?? new Date().toTimeString().slice(0, 8);
      const normalizedTime = currentTime.length === 5 ? `${currentTime}:00` : currentTime;
      const normalizedCutoff = d.horaLimitePuntual.length === 5 ? `${d.horaLimitePuntual}:00` : d.horaLimitePuntual;
      const computedState = normalizedTime <= normalizedCutoff ? 'PRESENTE' : 'TARDANZA_INJUSTIFICADA';

      const scanResult = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const enrollmentQuery = await client.query<{
          matricula_id: string;
          estudiante_id: string;
          nombres: string;
          apellido_paterno: string;
          nivel: string;
          grado: number;
          seccion: string;
        }>(
          `SELECT m.id AS matricula_id, p.id AS estudiante_id, p.nombres, p.apellido_paterno,
                  gs.nivel, gs.grado, gs.seccion
             FROM carnes_escolares ce
             JOIN personas p ON p.id = ce.estudiante_id
             JOIN matriculas m ON m.estudiante_id = p.id AND m.tenant_id = p.tenant_id
             JOIN anios_lectivos al ON al.id = m.anio_lectivo_id AND al.tenant_id = m.tenant_id
             JOIN grados_secciones gs ON gs.id = m.seccion_id AND gs.tenant_id = m.tenant_id
            WHERE ce.codigo_qr_token = $1
              AND ce.activo = true
              AND p.tenant_id = $2
              AND al.activo = true
              AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
            LIMIT 1`,
          [d.codigoQrToken, req.user!.tenantId]
        );

        if (!enrollmentQuery.rowCount) return null;
        const student = enrollmentQuery.rows[0];

        const attendanceRes = await client.query<{
          id: string;
          fecha: string;
          hora_registro: string;
          estado: string;
          origen: string;
        }>(
          `INSERT INTO asistencias_alumnos (matricula_id, fecha, hora_registro, estado, origen)
           VALUES ($1, $2, $3, $4::estado_asistencia_enum, 'KIOSCO_PORTERIA')
           ON CONFLICT (matricula_id, fecha)
           DO UPDATE SET hora_registro = EXCLUDED.hora_registro,
                         estado = EXCLUDED.estado
           RETURNING id, fecha::text, hora_registro::text, estado::text, origen::text`,
          [student.matricula_id, currentDate, normalizedTime, computedState]
        );

        const record = attendanceRes.rows[0];
        const fullName = `${student.nombres} ${student.apellido_paterno}`;

        if (computedState !== 'PRESENTE') {
          await notifyGuardiansOnAttendance(
            client,
            req.user!.tenantId,
            record.id,
            student.estudiante_id,
            fullName,
            computedState,
            currentDate,
            'AVISO'
          );
        }

        await NotificationService.publish(req.user!.tenantId, req.user!.id, {
          type: 'KIOSCO_SCAN',
          asistenciaId: record.id,
          estudiante: fullName,
          nivel: student.nivel,
          grado: student.grado,
          seccion: student.seccion,
          hora: record.hora_registro,
          estado: record.estado,
        });

        return {
          ...record,
          estudiante_id: student.estudiante_id,
          estudiante_nombre: fullName,
          nivel: student.nivel,
          grado: student.grado,
          seccion: student.seccion,
        };
      });

      if (!scanResult) {
        fail(res, 404, 'QR_INVALID_OR_UNENROLLED', 'Carné QR inválido o sin matrícula activa en el año lectivo.');
        return;
      }
      ok(res, scanResult, 201);
    } catch {
      fail(res, 500, 'SCAN_ERROR', 'No se pudo procesar la lectura del carné QR.');
    }
  }
);

// RF-25, RF-28: Sincronización masiva Offline-First desde IndexedDB (Kiosco / Aula)
router.post(
  '/sync-batch',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'PORTERIA', 'AUXILIAR', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const itemSchema = z.object({
      matriculaId: z.string().uuid().optional(),
      codigoQrToken: z.string().min(16).max(64).optional(),
      fecha: z.string().date(),
      horaRegistro: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
      estado: z.enum([
        'PRESENTE',
        'TARDANZA_JUSTIFICADA',
        'TARDANZA_INJUSTIFICADA',
        'FALTA_JUSTIFICADA',
        'FALTA_INJUSTIFICADA',
      ]),
      origen: z.enum(['KIOSCO_PORTERIA', 'AULA_DOCENTE', 'REGULARIZACION_MANUAL']).default('KIOSCO_PORTERIA'),
      observacion: z.string().max(300).optional(),
    });

    const parsed = z
      .object({
        registros: z.array(itemSchema).min(1).max(500),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Lote de sincronización offline inválido.');
      return;
    }

    try {
      const result = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        let sincronizados = 0;
        let omitidos = 0;
        const detalles: Array<{ index: number; status: 'SYNCED' | 'SKIPPED'; id?: string }> = [];

        for (let i = 0; i < parsed.data.registros.length; i++) {
          const item = parsed.data.registros[i];
          let targetMatriculaId = item.matriculaId ?? null;
          let studentPersonId: string | null = null;
          let studentName = 'Estudiante';

          if (!targetMatriculaId && item.codigoQrToken) {
            const qrLookup = await client.query<{ matricula_id: string; estudiante_id: string; nombre: string }>(
              `SELECT m.id AS matricula_id, p.id AS estudiante_id,
                      (p.nombres || ' ' || p.apellido_paterno) AS nombre
                 FROM carnes_escolares ce
                 JOIN personas p ON p.id = ce.estudiante_id
                 JOIN matriculas m ON m.estudiante_id = p.id AND m.tenant_id = p.tenant_id
                 JOIN anios_lectivos al ON al.id = m.anio_lectivo_id AND al.tenant_id = m.tenant_id
                WHERE ce.codigo_qr_token = $1 AND ce.activo = true AND p.tenant_id = $2 AND al.activo = true
                LIMIT 1`,
              [item.codigoQrToken, req.user!.tenantId]
            );
            if (qrLookup.rowCount) {
              targetMatriculaId = qrLookup.rows[0].matricula_id;
              studentPersonId = qrLookup.rows[0].estudiante_id;
              studentName = qrLookup.rows[0].nombre;
            }
          } else if (targetMatriculaId) {
            const matLookup = await client.query<{ id: string; estudiante_id: string; nombre: string }>(
              `SELECT m.id, p.id AS estudiante_id, (p.nombres || ' ' || p.apellido_paterno) AS nombre
                 FROM matriculas m
                 JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
                WHERE m.id = $1 AND m.tenant_id = $2`,
              [targetMatriculaId, req.user!.tenantId]
            );
            if (matLookup.rowCount) {
              studentPersonId = matLookup.rows[0].estudiante_id;
              studentName = matLookup.rows[0].nombre;
            } else {
              targetMatriculaId = null;
            }
          }

          if (!targetMatriculaId) {
            omitidos++;
            detalles.push({ index: i, status: 'SKIPPED' });
            continue;
          }

          const upserted = await client.query<{ id: string }>(
            `INSERT INTO asistencias_alumnos (matricula_id, fecha, hora_registro, estado, origen, observacion)
             VALUES ($1, $2, $3, $4::estado_asistencia_enum, $5::origen_asistencia_enum, $6)
             ON CONFLICT (matricula_id, fecha)
             DO UPDATE SET hora_registro = EXCLUDED.hora_registro,
                           estado = EXCLUDED.estado,
                           origen = EXCLUDED.origen,
                           observacion = COALESCE(EXCLUDED.observacion, asistencias_alumnos.observacion)
             RETURNING id`,
            [targetMatriculaId, item.fecha, item.horaRegistro, item.estado, item.origen, item.observacion ?? null]
          );

          sincronizados++;
          detalles.push({ index: i, status: 'SYNCED', id: upserted.rows[0].id });

          if (studentPersonId && item.estado !== 'PRESENTE') {
            await notifyGuardiansOnAttendance(
              client,
              req.user!.tenantId,
              upserted.rows[0].id,
              studentPersonId,
              studentName,
              item.estado,
              item.fecha,
              'AVISO'
            );
          }
        }

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'ATTENDANCE_SYNC_BATCH',
            entidad: 'asistencias_alumnos',
            datosNuevos: { totalRecibidos: parsed.data.registros.length, sincronizados, omitidos },
            ipOrigen: req.ip,
          },
          client
        );

        return { totalRecibidos: parsed.data.registros.length, sincronizados, omitidos, detalles };
      });

      ok(res, result);
    } catch {
      fail(res, 500, 'SYNC_BATCH_ERROR', 'No se pudo completar la sincronización por lotes.');
    }
  }
);

// RF-30, RF-77: Justificar inasistencia o tardanza y enviar rectificación al apoderado
router.patch(
  '/:id/justify',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'AUXILIAR', 'TUTOR_AULA', 'SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        estado: z.enum(['TARDANZA_JUSTIFICADA', 'FALTA_JUSTIFICADA', 'PRESENTE']),
        observacion: z.string().min(5).max(500),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Debe indicar el nuevo estado justificado y la observación.');
      return;
    }

    try {
      const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const resUpdate = await client.query<{
          id: string;
          matricula_id: string;
          fecha: string;
          estado: string;
          estudiante_id: string;
          nombre: string;
        }>(
          `UPDATE asistencias_alumnos aa
              SET estado = $1::estado_asistencia_enum,
                  justificada = true,
                  origen = 'REGULARIZACION_MANUAL',
                  observacion = $2
             FROM matriculas m
             JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
            WHERE aa.id = $3
              AND aa.matricula_id = m.id
              AND m.tenant_id = $4
            RETURNING aa.id, aa.matricula_id, aa.fecha::text, aa.estado::text,
                      p.id AS estudiante_id, (p.nombres || ' ' || p.apellido_paterno) AS nombre`,
          [parsed.data.estado, parsed.data.observacion, req.params.id, req.user!.tenantId]
        );

        if (!resUpdate.rowCount) return null;
        const row = resUpdate.rows[0];

        await notifyGuardiansOnAttendance(
          client,
          req.user!.tenantId,
          row.id,
          row.estudiante_id,
          row.nombre,
          row.estado,
          row.fecha,
          'RECTIFICACION'
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'JUSTIFY_ATTENDANCE',
            entidad: 'asistencias_alumnos',
            entidadId: row.id,
            datosNuevos: parsed.data,
            ipOrigen: req.ip,
          },
          client
        );

        return row;
      });

      if (!updated) {
        fail(res, 404, 'ATTENDANCE_NOT_FOUND', 'Registro de asistencia no encontrado.');
        return;
      }
      ok(res, updated);
    } catch {
      fail(res, 500, 'JUSTIFY_ERROR', 'No se pudo justificar el registro de asistencia.');
    }
  }
);

// RF-31: Consultar registros de asistencia por sección, fecha o estudiante
router.get('/records', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const fecha = typeof req.query.fecha === 'string' ? req.query.fecha : null;
  const estudianteId = typeof req.query.estudianteId === 'string' ? req.query.estudianteId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const resQuery = await client.query(
        `SELECT aa.id, aa.matricula_id, aa.fecha::text, aa.hora_registro::text,
                aa.estado, aa.origen, aa.justificada, aa.observacion,
                p.id AS estudiante_id, p.nombres, p.apellido_paterno, p.apellido_materno,
                gs.id AS seccion_id, gs.nivel, gs.grado, gs.seccion
           FROM asistencias_alumnos aa
           JOIN matriculas m ON m.id = aa.matricula_id
           JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
           JOIN grados_secciones gs ON gs.id = m.seccion_id AND gs.tenant_id = m.tenant_id
          WHERE m.tenant_id = $1
            AND ($2::uuid IS NULL OR m.seccion_id = $2::uuid)
            AND ($3::date IS NULL OR aa.fecha = $3::date)
            AND ($4::uuid IS NULL OR m.estudiante_id = $4::uuid)
          ORDER BY aa.fecha DESC, p.apellido_paterno, p.nombres
          LIMIT 300`,
        [req.user!.tenantId, seccionId, fecha, estudianteId]
      );
      return resQuery.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'ATTENDANCE_RECORDS_ERROR', 'No se pudieron consultar los registros de asistencia.');
  }
});

// RF-32, RF-33: Registro de ingreso y salida de practicantes de educación UNSCH
router.post(
  '/internships/check-in',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'PRACTICANTE', 'TUTOR_AULA', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        practicanteId: z.string().uuid().optional(),
        tutorDocenteId: z.string().uuid(),
        fecha: z.string().date().optional(),
        horaIngreso: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        horaSalida: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/)
          .optional(),
        observaciones: z.string().max(400).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de asistencia de practicante inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const targetPracticanteId = d.practicanteId ?? req.user!.id;
      const targetDate = d.fecha ?? new Date().toISOString().slice(0, 10);

      let horasComputadas = 0;
      if (d.horaSalida) {
        const [inH, inM] = d.horaIngreso.split(':').map(Number);
        const [outH, outM] = d.horaSalida.split(':').map(Number);
        const diffMinutes = outH * 60 + outM - (inH * 60 + inM);
        if (diffMinutes > 0) {
          horasComputadas = Number((diffMinutes / 60).toFixed(2));
        }
      }

      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const validUsers = await client.query(
          `SELECT id FROM usuarios WHERE tenant_id = $1 AND id IN ($2, $3)`,
          [req.user!.tenantId, targetPracticanteId, d.tutorDocenteId]
        );
        if (validUsers.rowCount !== 2 && targetPracticanteId !== d.tutorDocenteId) {
          return null;
        }

        const ins = await client.query(
          `INSERT INTO asistencias_practicantes (
             practicante_id, tutor_docente_id, fecha, hora_ingreso, hora_salida,
             horas_computadas, observaciones, estado_validacion
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE')
           RETURNING id, practicante_id, tutor_docente_id, fecha::text,
                     hora_ingreso::text, hora_salida::text, horas_computadas, estado_validacion`,
          [
            targetPracticanteId,
            d.tutorDocenteId,
            targetDate,
            d.horaIngreso,
            d.horaSalida ?? null,
            horasComputadas,
            d.observaciones ?? null,
          ]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'INTERNSHIP_CHECK_IN',
            entidad: 'asistencias_practicantes',
            entidadId: ins.rows[0].id,
            datosNuevos: ins.rows[0],
            ipOrigen: req.ip,
          },
          client
        );

        return ins.rows[0];
      });

      if (!created) {
        fail(res, 404, 'USER_NOT_FOUND', 'Practicante o docente tutor no pertenece a la institución.');
        return;
      }
      ok(res, created, 201);
    } catch {
      fail(res, 500, 'INTERNSHIP_CHECKIN_ERROR', 'No se pudo registrar la asistencia del practicante.');
    }
  }
);

// RF-34, RF-74: Validación y conformidad de horas de práctica por docente tutor
router.patch(
  '/internships/:id/validate',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'TUTOR_AULA', 'DOCENTE', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        estadoValidacion: z.enum(['VALIDADA', 'OBSERVADA']),
        comentarioTutor: z.string().max(500).optional(),
        horasComputadas: z.number().min(0).max(16).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de validación de horas inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const resUpdate = await client.query(
          `UPDATE asistencias_practicantes ap
              SET estado_validacion = $1,
                  validado_por_tutor = ($1 = 'VALIDADA'),
                  comentario_tutor = COALESCE($2, ap.comentario_tutor),
                  horas_computadas = COALESCE($3, ap.horas_computadas),
                  validado_por = $4,
                  validado_en = now()
             FROM usuarios u
            WHERE ap.id = $5
              AND u.id = ap.practicante_id
              AND u.tenant_id = $6
            RETURNING ap.id, ap.practicante_id, ap.tutor_docente_id, ap.fecha::text,
                      ap.horas_computadas, ap.estado_validacion, ap.comentario_tutor, ap.validado_en`,
          [
            d.estadoValidacion,
            d.comentarioTutor ?? null,
            d.horasComputadas ?? null,
            req.user!.id,
            req.params.id,
            req.user!.tenantId,
          ]
        );

        if (!resUpdate.rowCount) return null;

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'VALIDATE_INTERNSHIP_HOURS',
            entidad: 'asistencias_practicantes',
            entidadId: req.params.id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return resUpdate.rows[0];
      });

      if (!updated) {
        fail(res, 404, 'INTERNSHIP_RECORD_NOT_FOUND', 'Registro de práctica no encontrado.');
        return;
      }
      ok(res, updated);
    } catch {
      fail(res, 500, 'INTERNSHIP_VALIDATE_ERROR', 'No se pudo validar el registro de horas.');
    }
  }
);

// RF-35, RF-74: Listar asistencias y acumulado de horas de practicantes UNSCH
router.get('/internships', async (req: AuthenticatedRequest, res) => {
  const practicanteId = typeof req.query.practicanteId === 'string' ? req.query.practicanteId : null;
  const estadoValidacion = typeof req.query.estado === 'string' ? req.query.estado : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT ap.id, ap.practicante_id, ap.tutor_docente_id, ap.fecha::text,
                ap.hora_ingreso::text, ap.hora_salida::text, ap.horas_computadas,
                ap.estado_validacion, ap.comentario_tutor, ap.observaciones, ap.validado_en,
                pp.nombres AS practicante_nombres, pp.apellido_paterno AS practicante_apellido,
                pt.nombres AS tutor_nombres, pt.apellido_paterno AS tutor_apellido
           FROM asistencias_practicantes ap
           JOIN usuarios up ON up.id = ap.practicante_id
           JOIN personas pp ON pp.id = up.persona_id AND pp.tenant_id = up.tenant_id
           JOIN usuarios ut ON ut.id = ap.tutor_docente_id
           JOIN personas pt ON pt.id = ut.persona_id AND pt.tenant_id = ut.tenant_id
          WHERE up.tenant_id = $1
            AND ($2::uuid IS NULL OR ap.practicante_id = $2::uuid)
            AND ($3::text IS NULL OR ap.estado_validacion = $3::text)
          ORDER BY ap.fecha DESC, ap.created_at DESC
          LIMIT 200`,
        [req.user!.tenantId, practicanteId, estadoValidacion]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'INTERNSHIPS_FETCH_ERROR', 'No se pudieron consultar las horas de práctica.');
  }
});

export default router;
