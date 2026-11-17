import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';

const router = Router();
router.use(authenticateJwt);

const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

export type CnebLiteral = 'AD' | 'A' | 'B' | 'C';

// RF-40, RF-46: Motor de conversión dual Vigesimal <-> Literal CNEB (MINEDU)
export function vigesimalToLiteral(score: number): CnebLiteral {
  if (score >= 18) return 'AD';
  if (score >= 14) return 'A';
  if (score >= 11) return 'B';
  return 'C';
}

export function literalToRepresentativeVigesimal(literal: CnebLiteral): number {
  switch (literal) {
    case 'AD':
      return 19;
    case 'A':
      return 16;
    case 'B':
      return 12;
    case 'C':
      return 9;
  }
}

export function computeTemplateHmac(tenantId: string, seccionId: string, cursoId: string, periodoId: string): string {
  const key = process.env.DOCUMENT_HMAC_KEY || 'default_unsch_hmac_key_2026';
  return crypto
    .createHmac('sha256', key)
    .update(`${tenantId}:${seccionId}:${cursoId}:${periodoId}`)
    .digest('hex');
}

// RF-36, RF-37: Listar evaluaciones de una sección, curso y periodo
router.get('/evaluations', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const cursoId = typeof req.query.cursoId === 'string' ? req.query.cursoId : null;
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT ev.id, ev.seccion_id, ev.curso_id, ev.docente_id, ev.periodo_id,
                ev.nombre, ev.peso, ev.cerrada, ev.created_at
           FROM evaluaciones ev
           JOIN grados_secciones gs ON gs.id = ev.seccion_id
          WHERE gs.tenant_id = $1
            AND ($2::uuid IS NULL OR ev.seccion_id = $2::uuid)
            AND ($3::uuid IS NULL OR ev.curso_id = $3::uuid)
            AND ($4::uuid IS NULL OR ev.periodo_id = $4::uuid)
          ORDER BY ev.created_at ASC`,
        [req.user!.tenantId, seccionId, cursoId, periodoId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'EVALUATIONS_FETCH_ERROR', 'No se pudieron consultar las evaluaciones.');
  }
});

// RF-36: Crear evaluación en la planilla de un curso
router.post(
  '/evaluations',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE', 'DOCENTE_CONTRATADO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        seccionId: z.string().uuid(),
        cursoId: z.string().uuid(),
        periodoId: z.string().uuid(),
        nombre: z.string().min(2).max(100),
        peso: z.number().min(0.1).max(5).default(1.0),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de evaluación inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const secCheck = await client.query(
          `SELECT id FROM grados_secciones WHERE id = $1 AND tenant_id = $2`,
          [d.seccionId, req.user!.tenantId]
        );
        if (!secCheck.rowCount) return null;

        const ins = await client.query(
          `INSERT INTO evaluaciones (seccion_id, curso_id, docente_id, periodo_id, nombre, peso, cerrada)
           VALUES ($1, $2, $3, $4, $5, $6, false)
           RETURNING id, seccion_id, curso_id, docente_id, periodo_id, nombre, peso, cerrada, created_at`,
          [d.seccionId, d.cursoId, req.user!.id, d.periodoId, d.nombre.trim(), d.peso]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'CREATE_EVALUATION',
            entidad: 'evaluaciones',
            entidadId: ins.rows[0].id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return ins.rows[0];
      });

      if (!created) {
        fail(res, 404, 'SECTION_NOT_FOUND', 'La sección no pertenece a la institución.');
        return;
      }
      ok(res, created, 201);
    } catch {
      fail(res, 409, 'EVALUATION_CONFLICT', 'No se pudo registrar la evaluación.');
    }
  }
);

// RF-38: Obtener la planilla "Modo Excel" completa (alumnos, evaluaciones, notas duales y conclusiones)
router.get('/sheet', async (req: AuthenticatedRequest, res) => {
  const seccionId = typeof req.query.seccionId === 'string' ? req.query.seccionId : null;
  const cursoId = typeof req.query.cursoId === 'string' ? req.query.cursoId : null;
  const periodoId = typeof req.query.periodoId === 'string' ? req.query.periodoId : null;

  if (!seccionId || !cursoId || !periodoId) {
    fail(res, 400, 'VALIDATION_FAILED', 'Se requiere seccionId, cursoId y periodoId.');
    return;
  }

  try {
    const isGuardianOrStudent =
      req.user!.roles.includes('APODERADO') || req.user!.roles.includes('ESTUDIANTE');

    const sheet = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const evaluations = await client.query(
        `SELECT id, nombre, peso::float, cerrada
           FROM evaluaciones
          WHERE seccion_id = $1 AND curso_id = $2 AND periodo_id = $3
          ORDER BY created_at ASC`,
        [seccionId, cursoId, periodoId]
      );

      const students = await client.query(
        `SELECT m.id AS matricula_id, p.id AS estudiante_id,
                p.nombres, p.apellido_paterno, p.apellido_materno, p.codigo_siagie
           FROM matriculas m
           JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
          WHERE m.tenant_id = $1 AND m.seccion_id = $2 AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
          ORDER BY p.apellido_paterno, p.apellido_materno, p.nombres`,
        [req.user!.tenantId, seccionId]
      );

      const grades = await client.query(
        `SELECT c.id, c.evaluacion_id, c.matricula_id,
                c.nota_vigesimal::float, c.nota_literal, c.version_lock,
                c.publicada, c.publicada_en, c.updated_at
           FROM calificaciones c
           JOIN evaluaciones ev ON ev.id = c.evaluacion_id
          WHERE ev.seccion_id = $1 AND ev.curso_id = $2 AND ev.periodo_id = $3
            AND ($4::boolean = false OR c.publicada = true)`,
        [seccionId, cursoId, periodoId, isGuardianOrStudent]
      );

      const conclusions = await client.query(
        `SELECT cd.id, cd.matricula_id, cd.conclusion_texto, cd.es_banco, cd.updated_at
           FROM conclusiones_descriptivas cd
           JOIN matriculas m ON m.id = cd.matricula_id
          WHERE m.tenant_id = $1 AND m.seccion_id = $2 AND cd.curso_id = $3 AND cd.periodo_id = $4`,
        [req.user!.tenantId, seccionId, cursoId, periodoId]
      );

      return {
        seccionId,
        cursoId,
        periodoId,
        firmaPlantillaHmac: computeTemplateHmac(req.user!.tenantId, seccionId, cursoId, periodoId),
        evaluaciones: evaluations.rows,
        estudiantes: students.rows,
        calificaciones: grades.rows,
        conclusiones: conclusions.rows,
      };
    });

    ok(res, sheet);
  } catch {
    fail(res, 500, 'SHEET_FETCH_ERROR', 'No se pudo cargar la planilla de calificaciones.');
  }
});

// RF-38, RF-40, RF-41, RF-42: Guardado en lote (Debounce 400ms / 60 FPS) con conversión dual y bloqueo optimista
router.patch(
  '/batch',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE', 'DOCENTE_CONTRATADO']),
  async (req: AuthenticatedRequest, res) => {
    const cellSchema = z
      .object({
        evaluacionId: z.string().uuid(),
        matriculaId: z.string().uuid(),
        notaVigesimal: z.number().min(0).max(20).optional(),
        notaLiteral: z.enum(['AD', 'A', 'B', 'C']).optional(),
        versionLock: z.number().int().min(1).optional(),
      })
      .refine((c) => c.notaVigesimal !== undefined || c.notaLiteral !== undefined, {
        message: 'Cada celda debe incluir notaVigesimal o notaLiteral.',
      });

    const parsed = z
      .object({
        celdas: z.array(cellSchema).min(1).max(500),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Lote de calificaciones inválido.');
      return;
    }

    try {
      const result = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const procesadas: Array<{
          id: string;
          evaluacion_id: string;
          matricula_id: string;
          nota_vigesimal: number;
          nota_literal: CnebLiteral;
          version_lock: number;
        }> = [];
        const conflictos: Array<{ evaluacionId: string; matriculaId: string; motivo: string }> = [];

        for (const cell of parsed.data.celdas) {
          // Verificar que la evaluación pertenezca al tenant y no esté cerrada
          const evCheck = await client.query<{ cerrada: boolean; periodo_cerrado: boolean }>(
            `SELECT ev.cerrada, pa.cerrado AS periodo_cerrado
               FROM evaluaciones ev
               JOIN grados_secciones gs ON gs.id = ev.seccion_id
               JOIN periodos_academicos pa ON pa.id = ev.periodo_id
              WHERE ev.id = $1 AND gs.tenant_id = $2`,
            [cell.evaluacionId, req.user!.tenantId]
          );

          if (!evCheck.rowCount) {
            conflictos.push({
              evaluacionId: cell.evaluacionId,
              matriculaId: cell.matriculaId,
              motivo: 'EVALUATION_NOT_FOUND',
            });
            continue;
          }

          if (evCheck.rows[0].cerrada || evCheck.rows[0].periodo_cerrado) {
            conflictos.push({
              evaluacionId: cell.evaluacionId,
              matriculaId: cell.matriculaId,
              motivo: 'PERIOD_OR_EVALUATION_CLOSED',
            });
            continue;
          }

          const finalVigesimal =
            cell.notaVigesimal !== undefined
              ? Number(cell.notaVigesimal.toFixed(2))
              : literalToRepresentativeVigesimal(cell.notaLiteral!);

          const finalLiteral: CnebLiteral =
            cell.notaLiteral !== undefined ? cell.notaLiteral : vigesimalToLiteral(finalVigesimal);

          const existing = await client.query<{ id: string; version_lock: number }>(
            `SELECT id, version_lock FROM calificaciones WHERE evaluacion_id = $1 AND matricula_id = $2 FOR UPDATE`,
            [cell.evaluacionId, cell.matriculaId]
          );

          if (existing.rowCount) {
            if (cell.versionLock !== undefined && existing.rows[0].version_lock !== cell.versionLock) {
              conflictos.push({
                evaluacionId: cell.evaluacionId,
                matriculaId: cell.matriculaId,
                motivo: 'OPTIMISTIC_LOCK_CONFLICT',
              });
              continue;
            }

            const upd = await client.query(
              `UPDATE calificaciones
                  SET nota_vigesimal = $1,
                      nota_literal = $2::nivel_logro_cneb_enum,
                      version_lock = version_lock + 1,
                      registrado_por = $3,
                      updated_at = now()
                WHERE id = $4
                RETURNING id, evaluacion_id, matricula_id, nota_vigesimal::float, nota_literal, version_lock`,
              [finalVigesimal, finalLiteral, req.user!.id, existing.rows[0].id]
            );
            procesadas.push(upd.rows[0]);
          } else {
            const ins = await client.query(
              `INSERT INTO calificaciones (
                 evaluacion_id, matricula_id, nota_vigesimal, nota_literal, version_lock, registrado_por
               ) VALUES ($1, $2, $3, $4::nivel_logro_cneb_enum, 1, $5)
               RETURNING id, evaluacion_id, matricula_id, nota_vigesimal::float, nota_literal, version_lock`,
              [cell.evaluacionId, cell.matriculaId, finalVigesimal, finalLiteral, req.user!.id]
            );
            procesadas.push(ins.rows[0]);
          }
        }

        if (procesadas.length > 0) {
          await AuditService.record(
            {
              tenantId: req.user!.tenantId,
              usuarioId: req.user!.id,
              accion: 'BATCH_UPDATE_GRADES',
              entidad: 'calificaciones',
              datosNuevos: { actualizadas: procesadas.length, conflictos: conflictos.length },
              ipOrigen: req.ip,
            },
            client
          );
        }

        return { actualizadas: procesadas.length, conflictos, calificaciones: procesadas };
      });

      ok(res, result);
    } catch {
      fail(res, 500, 'GRADE_BATCH_ERROR', 'No se pudo procesar el guardado en lote de calificaciones.');
    }
  }
);

// RF-82: Publicar notas de una evaluación para que sean visibles a apoderados y estudiantes
router.post(
  '/publish',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z.object({ evaluacionId: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Identificador de evaluación inválido.');
      return;
    }

    try {
      const published = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const resPub = await client.query(
          `UPDATE calificaciones c
              SET publicada = true,
                  publicada_en = now()
             FROM evaluaciones ev
             JOIN grados_secciones gs ON gs.id = ev.seccion_id
            WHERE c.evaluacion_id = $1
              AND ev.id = c.evaluacion_id
              AND gs.tenant_id = $2
            RETURNING c.id`,
          [parsed.data.evaluacionId, req.user!.tenantId]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'PUBLISH_GRADES',
            entidad: 'calificaciones',
            entidadId: parsed.data.evaluacionId,
            datosNuevos: { evaluacionId: parsed.data.evaluacionId, totalPublicadas: resPub.rowCount },
            ipOrigen: req.ip,
          },
          client
        );

        return { evaluacionId: parsed.data.evaluacionId, totalPublicadas: resPub.rowCount ?? 0 };
      });

      ok(res, published);
    } catch {
      fail(res, 500, 'PUBLISH_GRADES_ERROR', 'No se pudieron publicar las calificaciones.');
    }
  }
);

// RF-39, RF-44: Banco oficial de conclusiones descriptivas CNEB y asignación a estudiantes
router.get('/conclusions/bank', async (req: AuthenticatedRequest, res) => {
  const area = typeof req.query.area === 'string' ? req.query.area : null;
  const nivelLogro = typeof req.query.nivelLogro === 'string' ? req.query.nivelLogro : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT id, area_curricular, competencia, nivel_logro, texto_plantilla
           FROM banco_conclusiones_cneb
          WHERE ($1::text IS NULL OR area_curricular ILIKE '%' || $1 || '%')
            AND ($2::text IS NULL OR nivel_logro::text = $2::text)
          ORDER BY area_curricular, nivel_logro`,
        [area, nivelLogro]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'CONCLUSIONS_BANK_ERROR', 'No se pudo consultar el banco de conclusiones CNEB.');
  }
});

router.put(
  '/conclusions',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE', 'TUTOR_AULA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        matriculaId: z.string().uuid(),
        cursoId: z.string().uuid(),
        periodoId: z.string().uuid(),
        conclusionTexto: z.string().min(10).max(1000),
        esBanco: z.boolean().default(false),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'La conclusión descriptiva debe tener entre 10 y 1000 caracteres.');
      return;
    }

    try {
      const d = parsed.data;
      const saved = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const matCheck = await client.query(
          `SELECT id FROM matriculas WHERE id = $1 AND tenant_id = $2`,
          [d.matriculaId, req.user!.tenantId]
        );
        if (!matCheck.rowCount) return null;

        const upserted = await client.query(
          `INSERT INTO conclusiones_descriptivas (matricula_id, curso_id, periodo_id, conclusion_texto, es_banco)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (matricula_id, curso_id, periodo_id)
           DO UPDATE SET conclusion_texto = EXCLUDED.conclusion_texto,
                         es_banco = EXCLUDED.es_banco,
                         updated_at = now()
           RETURNING id, matricula_id, curso_id, periodo_id, conclusion_texto, es_banco, updated_at`,
          [d.matriculaId, d.cursoId, d.periodoId, d.conclusionTexto.trim(), d.esBanco]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'UPSERT_DESCRIPTIVE_CONCLUSION',
            entidad: 'conclusiones_descriptivas',
            entidadId: upserted.rows[0].id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return upserted.rows[0];
      });

      if (!saved) {
        fail(res, 404, 'ENROLLMENT_NOT_FOUND', 'La matrícula no pertenece a la institución.');
        return;
      }
      ok(res, saved);
    } catch {
      fail(res, 500, 'CONCLUSION_SAVE_ERROR', 'No se pudo guardar la conclusión descriptiva.');
    }
  }
);

// RF-80: Importación masiva de notas desde plantilla Excel con validación criptográfica HMAC
router.post(
  '/import-excel',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'COORDINADOR_ACADEMICO', 'DOCENTE']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        seccionId: z.string().uuid(),
        cursoId: z.string().uuid(),
        periodoId: z.string().uuid(),
        evaluacionId: z.string().uuid(),
        firmaPlantilla: z.string().length(64),
        filas: z
          .array(
            z.object({
              matriculaId: z.string().uuid(),
              notaVigesimal: z.number().min(0).max(20),
            })
          )
          .min(1)
          .max(200),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Estructura de plantilla Excel inválida.');
      return;
    }

    const d = parsed.data;
    const expectedHmac = computeTemplateHmac(req.user!.tenantId, d.seccionId, d.cursoId, d.periodoId);
    if (d.firmaPlantilla !== expectedHmac) {
      fail(res, 403, 'INVALID_TEMPLATE_SIGNATURE', 'La firma HMAC de la plantilla no coincide con la sección y curso.');
      return;
    }

    try {
      const archivoHash = crypto.createHash('sha256').update(JSON.stringify(d.filas)).digest('hex');

      const summary = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        let nuevas = 0;
        let modificadas = 0;
        let rechazadas = 0;
        const detalleRechazos: Array<{ fila: number; motivo: string }> = [];

        for (let i = 0; i < d.filas.length; i++) {
          const item = d.filas[i];
          const mat = await client.query(
            `SELECT id FROM matriculas WHERE id = $1 AND tenant_id = $2 AND seccion_id = $3`,
            [item.matriculaId, req.user!.tenantId, d.seccionId]
          );
          if (!mat.rowCount) {
            rechazadas++;
            detalleRechazos.push({ fila: i + 1, motivo: 'Matrícula no pertenece a la sección' });
            continue;
          }

          const literal = vigesimalToLiteral(item.notaVigesimal);
          const existing = await client.query(
            `SELECT id FROM calificaciones WHERE evaluacion_id = $1 AND matricula_id = $2`,
            [d.evaluacionId, item.matriculaId]
          );

          if (existing.rowCount) {
            await client.query(
              `UPDATE calificaciones
                  SET nota_vigesimal = $1, nota_literal = $2::nivel_logro_cneb_enum,
                      version_lock = version_lock + 1, registrado_por = $3, updated_at = now()
                WHERE id = $4`,
              [item.notaVigesimal, literal, req.user!.id, existing.rows[0].id]
            );
            modificadas++;
          } else {
            await client.query(
              `INSERT INTO calificaciones (evaluacion_id, matricula_id, nota_vigesimal, nota_literal, version_lock, registrado_por)
               VALUES ($1, $2, $3, $4::nivel_logro_cneb_enum, 1, $5)`,
              [d.evaluacionId, item.matriculaId, item.notaVigesimal, literal, req.user!.id]
            );
            nuevas++;
          }
        }

        const logRes = await client.query(
          `INSERT INTO importaciones_notas (
             tenant_id, seccion_id, curso_id, periodo_id, docente_id,
             firma_plantilla, archivo_hash, nuevas, modificadas, rechazadas, detalle_rechazos
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
           RETURNING id, firma_plantilla, archivo_hash, nuevas, modificadas, rechazadas, detalle_rechazos, created_at`,
          [
            req.user!.tenantId,
            d.seccionId,
            d.cursoId,
            d.periodoId,
            req.user!.id,
            d.firmaPlantilla,
            archivoHash,
            nuevas,
            modificadas,
            rechazadas,
            JSON.stringify(detalleRechazos),
          ]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'IMPORT_EXCEL_GRADES',
            entidad: 'importaciones_notas',
            entidadId: logRes.rows[0].id,
            datosNuevos: { nuevas, modificadas, rechazadas },
            ipOrigen: req.ip,
          },
          client
        );

        return logRes.rows[0];
      });

      ok(res, summary, 201);
    } catch {
      fail(res, 500, 'EXCEL_IMPORT_ERROR', 'No se pudo procesar la importación de notas Excel.');
    }
  }
);

export default router;
