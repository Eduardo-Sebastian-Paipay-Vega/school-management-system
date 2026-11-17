import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { documentHash, encryptDocument, randomToken, tokenHash } from '../core/identity-crypto';
import { AuditService } from '../services/audit.service';

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

// RF-15: Consultar secciones con conteo de matriculados, vacantes disponibles y tutor
router.get('/sections', async (req: AuthenticatedRequest, res) => {
  const yearId = typeof req.query.anioLectivoId === 'string' ? req.query.anioLectivoId : undefined;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(
        `SELECT gs.id, gs.anio_lectivo_id, gs.nivel, gs.grado, gs.seccion, gs.aforo_maximo,
                gs.sede_id, gs.tutor_id,
                tp.nombres AS tutor_nombres, tp.apellido_paterno AS tutor_apellido,
                COUNT(m.id) FILTER (WHERE m.estado IN ('REGULAR', 'EXTEMPORANEA'))::int AS matriculados_activos,
                GREATEST(gs.aforo_maximo - COUNT(m.id) FILTER (WHERE m.estado IN ('REGULAR', 'EXTEMPORANEA'))::int, 0) AS vacantes_disponibles
           FROM grados_secciones gs
           LEFT JOIN usuarios tu ON tu.id = gs.tutor_id AND tu.tenant_id = gs.tenant_id
           LEFT JOIN personas tp ON tp.id = tu.persona_id AND tp.tenant_id = tu.tenant_id
           LEFT JOIN matriculas m ON m.seccion_id = gs.id AND m.tenant_id = gs.tenant_id
          WHERE gs.tenant_id = $1
            AND ($2::uuid IS NULL OR gs.anio_lectivo_id = $2::uuid)
          GROUP BY gs.id, tp.nombres, tp.apellido_paterno
          ORDER BY gs.nivel, gs.grado, gs.seccion`,
        [req.user!.tenantId, yearId ?? null]
      );
      return result.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'SECTIONS_FETCH_ERROR', 'No se pudieron consultar las secciones académicas.');
  }
});

// RF-15: Asignar tutor de aula a una sección
router.patch(
  '/sections/:id/tutor',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ tutorId: z.string().uuid().nullable() }).safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Identificador de tutor inválido.');
      return;
    }
    try {
      const data = await mutate(
        req,
        async (client) => {
          const updated = await client.query(
            `UPDATE grados_secciones
                SET tutor_id = $1
              WHERE id = $2 AND tenant_id = $3
              RETURNING id, nivel, grado, seccion, tutor_id`,
            [parsed.data.tutorId, req.params.id, req.user!.tenantId]
          );
          return updated.rows[0] ?? null;
        },
        'ASSIGN_SECTION_TUTOR',
        'grados_secciones',
        { sectionId: req.params.id, tutorId: parsed.data.tutorId }
      );
      if (!data) {
        fail(res, 404, 'SECTION_NOT_FOUND', 'Sección no encontrada.');
        return;
      }
      ok(res, data);
    } catch {
      fail(res, 409, 'TUTOR_ASSIGN_CONFLICT', 'No se pudo asignar el tutor a la sección.');
    }
  }
);

// RF-16, RF-20: Listar matrículas con filtro por año, sección, estado y búsqueda por nombre/código
router.get('/enrollments', async (req: AuthenticatedRequest, res) => {
  const anioLectivoId = typeof req.query.anioLectivoId === 'string' ? req.query.anioLectivoId : null;
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const estado = typeof req.query.estado === 'string' ? req.query.estado : null;
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(
        `SELECT m.id, m.anio_lectivo_id, m.estudiante_id, m.seccion_id, m.estado,
                m.fecha_matricula, m.fecha_retiro, m.motivo_retiro,
                p.nombres, p.apellido_paterno, p.apellido_materno,
                p.tipo_documento, p.documento_ultimos4, p.codigo_siagie, p.foto_url,
                gs.nivel, gs.grado, gs.seccion,
                ce.codigo_qr_token, ce.activo AS carne_activo
           FROM matriculas m
           JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
           JOIN grados_secciones gs ON gs.id = m.seccion_id AND gs.tenant_id = m.tenant_id
           LEFT JOIN carnes_escolares ce ON ce.estudiante_id = p.id AND ce.activo = true
          WHERE m.tenant_id = $1
            AND ($2::uuid IS NULL OR m.anio_lectivo_id = $2::uuid)
            AND ($3::uuid IS NULL OR m.seccion_id = $3::uuid)
            AND ($4::text IS NULL OR m.estado::text = $4::text)
            AND ($5::text IS NULL OR (p.nombres || ' ' || p.apellido_paterno || ' ' || COALESCE(p.apellido_materno, '')) ILIKE '%' || $5 || '%' OR p.codigo_siagie = $5)
          ORDER BY p.apellido_paterno, p.apellido_materno, p.nombres`,
        [req.user!.tenantId, anioLectivoId, seccionId, estado, search]
      );
      return result.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'ENROLLMENTS_FETCH_ERROR', 'No se pudo consultar el padrón de matrículas.');
  }
});

// RF-16, RF-19, RF-26: Registrar matrícula (regular o extemporánea) validando aforo y emitiendo carné QR
router.post(
  '/enrollments',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        anioLectivoId: z.string().uuid(),
        seccionId: z.string().uuid(),
        estado: z.enum(['REGULAR', 'EXTEMPORANEA']).default('REGULAR'),
        estudianteId: z.string().uuid().optional(),
        estudianteNuevo: z
          .object({
            tipoDocumento: z.enum(['DNI', 'CE', 'PASAPORTE', 'PTP']).default('DNI'),
            numeroDocumento: z.string().min(6).max(20),
            nombres: z.string().min(2).max(100),
            apellidoPaterno: z.string().min(2).max(100),
            apellidoMaterno: z.string().max(100).optional(),
            fechaNacimiento: z.string().date().optional(),
            sexo: z.enum(['M', 'F']).optional(),
            codigoSiagie: z.string().max(20).optional(),
          })
          .optional(),
      })
      .refine((d) => Boolean(d.estudianteId || d.estudianteNuevo), {
        message: 'Debe proporcionar estudianteId o estudianteNuevo.',
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de matrícula inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const result = await mutate(
        req,
        async (client) => {
          // 1. Verificar sección y control de aforo con bloqueo pesimista FOR UPDATE
          const secRes = await client.query<{ id: string; aforo_maximo: number; anio_lectivo_id: string }>(
            `SELECT id, aforo_maximo, anio_lectivo_id
               FROM grados_secciones
              WHERE id = $1 AND tenant_id = $2 AND anio_lectivo_id = $3
              FOR UPDATE`,
            [d.seccionId, req.user!.tenantId, d.anioLectivoId]
          );
          if (!secRes.rowCount) throw new Error('SECTION_NOT_FOUND');

          const countRes = await client.query<{ total: number }>(
            `SELECT COUNT(*)::int AS total
               FROM matriculas
              WHERE tenant_id = $1 AND seccion_id = $2 AND estado IN ('REGULAR', 'EXTEMPORANEA')`,
            [req.user!.tenantId, d.seccionId]
          );
          if (countRes.rows[0].total >= secRes.rows[0].aforo_maximo) {
            throw new Error('CAPACITY_EXCEEDED');
          }

          // 2. Resolver o crear persona del estudiante
          let studentPersonId = d.estudianteId;
          if (!studentPersonId && d.estudianteNuevo) {
            const est = d.estudianteNuevo;
            const docHash = documentHash(est.numeroDocumento);
            const existing = await client.query<{ id: string }>(
              `SELECT id FROM personas WHERE tenant_id = $1 AND tipo_documento = $2 AND documento_hash = $3`,
              [req.user!.tenantId, est.tipoDocumento, docHash]
            );
            if (existing.rowCount) {
              studentPersonId = existing.rows[0].id;
            } else {
              const created = await client.query<{ id: string }>(
                `INSERT INTO personas (
                   tenant_id, tipo_documento, documento_cifrado, documento_hash, documento_ultimos4,
                   nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, codigo_siagie
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 RETURNING id`,
                [
                  req.user!.tenantId,
                  est.tipoDocumento,
                  encryptDocument(est.numeroDocumento),
                  docHash,
                  est.numeroDocumento.slice(-4),
                  est.nombres.trim(),
                  est.apellidoPaterno.trim(),
                  est.apellidoMaterno?.trim() ?? null,
                  est.fechaNacimiento ?? null,
                  est.sexo ?? null,
                  est.codigoSiagie?.trim() ?? null,
                ]
              );
              studentPersonId = created.rows[0].id;
            }
          }

          // 3. Insertar matrícula
          const enrollment = await client.query(
            `INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id, estado)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, anio_lectivo_id, estudiante_id, seccion_id, estado, fecha_matricula`,
            [req.user!.tenantId, d.anioLectivoId, studentPersonId, d.seccionId, d.estado]
          );

          // 4. Emitir automáticamente carné escolar QR si no posee uno activo (RF-26)
          const existingQr = await client.query(
            `SELECT codigo_qr_token FROM carnes_escolares WHERE estudiante_id = $1 AND activo = true`,
            [studentPersonId]
          );
          let qrToken: string;
          if (existingQr.rowCount) {
            qrToken = existingQr.rows[0].codigo_qr_token;
          } else {
            qrToken = tokenHash(`${req.user!.tenantId}:${studentPersonId}:${randomToken()}`);
            await client.query(
              `INSERT INTO carnes_escolares (estudiante_id, codigo_qr_token, activo)
               VALUES ($1, $2, true)`,
              [studentPersonId, qrToken]
            );
          }

          return { ...enrollment.rows[0], codigo_qr_token: qrToken };
        },
        'CREATE_ENROLLMENT',
        'matriculas',
        { anioLectivoId: d.anioLectivoId, seccionId: d.seccionId, estado: d.estado }
      );

      ok(res, result, 201);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'SECTION_NOT_FOUND') {
          fail(res, 404, 'SECTION_NOT_FOUND', 'La sección no existe o no pertenece al año lectivo.');
          return;
        }
        if (err.message === 'CAPACITY_EXCEEDED') {
          fail(res, 409, 'CAPACITY_EXCEEDED', 'La sección ha alcanzado su aforo máximo permitido.');
          return;
        }
      }
      fail(res, 409, 'ENROLLMENT_CONFLICT', 'El estudiante ya se encuentra matriculado en este año lectivo.');
    }
  }
);

// RF-21, RF-22: Actualizar estado de matrícula (Retiro, Traslado o cambio de sección)
router.patch(
  '/enrollments/:id/status',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        estado: z.enum(['REGULAR', 'EXTEMPORANEA', 'RETIRADO', 'TRASLADADO']).optional(),
        seccionId: z.string().uuid().optional(),
        motivoRetiro: z.string().min(5).max(500).optional(),
      })
      .refine((v) => Boolean(v.estado || v.seccionId))
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de actualización inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const updated = await mutate(
        req,
        async (client) => {
          const isWithdrawal = d.estado === 'RETIRADO' || d.estado === 'TRASLADADO';
          if (isWithdrawal && !d.motivoRetiro) {
            throw new Error('REASON_REQUIRED');
          }
          const resQuery = await client.query(
            `UPDATE matriculas
                SET estado = COALESCE($1::estado_matricula_enum, estado),
                    seccion_id = COALESCE($2::uuid, seccion_id),
                    fecha_retiro = CASE
                      WHEN $1::text IN ('RETIRADO', 'TRASLADADO') THEN CURRENT_DATE
                      WHEN $1::text IN ('REGULAR', 'EXTEMPORANEA') THEN NULL
                      ELSE fecha_retiro
                    END,
                    motivo_retiro = CASE
                      WHEN $1::text IN ('RETIRADO', 'TRASLADADO') THEN $3
                      WHEN $1::text IN ('REGULAR', 'EXTEMPORANEA') THEN NULL
                      ELSE motivo_retiro
                    END
              WHERE id = $4 AND tenant_id = $5
              RETURNING id, estudiante_id, seccion_id, estado, fecha_retiro, motivo_retiro`,
            [d.estado ?? null, d.seccionId ?? null, d.motivoRetiro ?? null, req.params.id, req.user!.tenantId]
          );
          return resQuery.rows[0] ?? null;
        },
        'UPDATE_ENROLLMENT_STATUS',
        'matriculas',
        { id: req.params.id, ...d }
      );

      if (!updated) {
        fail(res, 404, 'ENROLLMENT_NOT_FOUND', 'Matrícula no encontrada.');
        return;
      }
      ok(res, updated);
    } catch (err) {
      if (err instanceof Error && err.message === 'REASON_REQUIRED') {
        fail(res, 400, 'REASON_REQUIRED', 'El retiro o traslado exige especificar un motivo.');
        return;
      }
      fail(res, 409, 'ENROLLMENT_UPDATE_CONFLICT', 'No se pudo actualizar la matrícula.');
    }
  }
);

// RF-78: Importación masiva de nómina oficial SIAGIE con trazabilidad SHA-256
router.post(
  '/enrollments/import-siagie',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const rowSchema = z.object({
      dni: z.string().regex(/^\d{8}$/),
      codigoSiagie: z.string().min(4).max(20).optional(),
      nombres: z.string().min(2).max(100),
      apellidoPaterno: z.string().min(2).max(100),
      apellidoMaterno: z.string().max(100).optional(),
      sexo: z.enum(['M', 'F']).optional(),
      fechaNacimiento: z.string().date().optional(),
    });

    const parsed = z
      .object({
        anioLectivoId: z.string().uuid(),
        seccionId: z.string().uuid(),
        archivoNombre: z.string().min(3).max(200),
        filas: z.array(z.record(z.string(), z.unknown())).min(1).max(200),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Estructura de nómina SIAGIE inválida.');
      return;
    }

    try {
      const d = parsed.data;
      const archivoHash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ seccionId: d.seccionId, filas: d.filas }))
        .digest('hex');

      const summary = await mutate(
        req,
        async (client) => {
          let creados = 0;
          let actualizados = 0;
          let rechazados = 0;
          const detalleRechazos: Array<{ fila: number; motivo: string }> = [];

          for (let idx = 0; idx < d.filas.length; idx++) {
            const check = rowSchema.safeParse(d.filas[idx]);
            if (!check.success) {
              rechazados++;
              detalleRechazos.push({ fila: idx + 1, motivo: 'Formato de DNI o nombres inválido' });
              continue;
            }
            const row = check.data;
            const dHash = documentHash(row.dni);
            const existingPerson = await client.query<{ id: string }>(
              `SELECT id FROM personas WHERE tenant_id = $1 AND tipo_documento = 'DNI' AND documento_hash = $2`,
              [req.user!.tenantId, dHash]
            );

            let personId: string;
            if (existingPerson.rowCount) {
              personId = existingPerson.rows[0].id;
              await client.query(
                `UPDATE personas
                    SET nombres = $1, apellido_paterno = $2, apellido_materno = COALESCE($3, apellido_materno),
                        codigo_siagie = COALESCE($4, codigo_siagie)
                  WHERE id = $5 AND tenant_id = $6`,
                [
                  row.nombres.trim(),
                  row.apellidoPaterno.trim(),
                  row.apellidoMaterno?.trim() ?? null,
                  row.codigoSiagie ?? null,
                  personId,
                  req.user!.tenantId,
                ]
              );
              actualizados++;
            } else {
              const ins = await client.query<{ id: string }>(
                `INSERT INTO personas (
                   tenant_id, tipo_documento, documento_cifrado, documento_hash, documento_ultimos4,
                   nombres, apellido_paterno, apellido_materno, sexo, fecha_nacimiento, codigo_siagie
                 ) VALUES ($1, 'DNI', $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id`,
                [
                  req.user!.tenantId,
                  encryptDocument(row.dni),
                  dHash,
                  row.dni.slice(-4),
                  row.nombres.trim(),
                  row.apellidoPaterno.trim(),
                  row.apellidoMaterno?.trim() ?? null,
                  row.sexo ?? null,
                  row.fechaNacimiento ?? null,
                  row.codigoSiagie ?? null,
                ]
              );
              personId = ins.rows[0].id;
              creados++;
            }

            await client.query(
              `INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id, estado)
               VALUES ($1, $2, $3, $4, 'REGULAR')
               ON CONFLICT (tenant_id, anio_lectivo_id, estudiante_id)
               DO UPDATE SET seccion_id = EXCLUDED.seccion_id`,
              [req.user!.tenantId, d.anioLectivoId, personId, d.seccionId]
            );

            const qrToken = tokenHash(`${req.user!.tenantId}:${personId}:${randomToken()}`);
            await client.query(
              `INSERT INTO carnes_escolares (estudiante_id, codigo_qr_token, activo)
               SELECT $1, $2, true
               WHERE NOT EXISTS (SELECT 1 FROM carnes_escolares WHERE estudiante_id = $1 AND activo = true)`,
              [personId, qrToken]
            );
          }

          const record = await client.query(
            `INSERT INTO importaciones_nomina (
               tenant_id, anio_lectivo_id, archivo_nombre, archivo_hash,
               total_filas, creados, actualizados, rechazados, detalle_rechazos, importado_por
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
             RETURNING id, archivo_nombre, archivo_hash, total_filas, creados, actualizados, rechazados, detalle_rechazos, created_at`,
            [
              req.user!.tenantId,
              d.anioLectivoId,
              d.archivoNombre,
              archivoHash,
              d.filas.length,
              creados,
              actualizados,
              rechazados,
              JSON.stringify(detalleRechazos),
              req.user!.id,
            ]
          );

          return record.rows[0];
        },
        'IMPORT_SIAGIE_ROSTER',
        'importaciones_nomina',
        { archivoNombre: d.archivoNombre, totalFilas: d.filas.length }
      );

      ok(res, summary, 201);
    } catch {
      fail(res, 500, 'SIAGIE_IMPORT_ERROR', 'Error al procesar la nómina SIAGIE.');
    }
  }
);

// RF-78: Historial de importaciones de nómina SIAGIE
router.get('/enrollments/imports', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const resQuery = await client.query(
        `SELECT id, anio_lectivo_id, archivo_nombre, archivo_hash,
                total_filas, creados, actualizados, rechazados, detalle_rechazos, created_at
           FROM importaciones_nomina
          WHERE tenant_id = $1
          ORDER BY created_at DESC
          LIMIT 50`,
        [req.user!.tenantId]
      );
      return resQuery.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'SIAGIE_HISTORY_ERROR', 'No se pudo consultar el historial de importaciones.');
  }
});

export default router;
