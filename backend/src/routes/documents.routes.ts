import crypto from 'crypto';
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

export function generateTenantBoundToken(tenantId: string): string {
  const cleanTenant = tenantId.replace(/-/g, '').toLowerCase();
  const randomSuffix = crypto.randomBytes(16).toString('hex');
  return `${cleanTenant}${randomSuffix}`;
}

export function extractTenantFromToken(token: string): string | null {
  if (!/^[a-fA-F0-9]{64}$/.test(token)) return null;
  const hex = token.slice(0, 32).toLowerCase();
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const documentTypeEnum = z.enum([
  'BOLETA_NOTAS',
  'CERTIFICADO_ESTUDIOS',
  'CONSTANCIA_MATRICULA',
  'ACTA_OFICIAL',
  'CARNE_ESCOLAR',
  'CONSTANCIA_CONDUCTA',
  'CONSTANCIA_NOTAS',
]);

// RF-59, RF-61: Emitir documento oficial con firma SHA-256 inmutable y token QR de verificación
router.post(
  '/issue',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        tipo: documentTypeEnum,
        estudianteId: z.string().uuid(),
        periodoId: z.string().uuid().optional(),
        metadataAdicional: z.record(z.string(), z.unknown()).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de emisión de documento inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const issued = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const instRes = await client.query<{
          nombre: string;
          codigo_modular: string;
          nivel_educativo: string;
          membrete_texto: string | null;
          escudo_url: string | null;
        }>(
          `SELECT i.nombre, i.codigo_modular, i.nivel_educativo, c.membrete_texto, c.escudo_url
             FROM instituciones i
             LEFT JOIN configuracion_institucional c ON c.tenant_id = i.id
            WHERE i.id = $1`,
          [req.user!.tenantId]
        );

        const studentRes = await client.query<{
          id: string;
          nombres: string;
          apellido_paterno: string;
          apellido_materno: string | null;
          codigo_siagie: string | null;
          documento_ultimos4: string | null;
        }>(
          `SELECT id, nombres, apellido_paterno, apellido_materno, codigo_siagie, documento_ultimos4
             FROM personas
            WHERE id = $1 AND tenant_id = $2`,
          [d.estudianteId, req.user!.tenantId]
        );
        if (!studentRes.rowCount) return null;
        const student = studentRes.rows[0];

        const gradesSnapshot = await client.query(
          `SELECT ev.nombre AS evaluacion, c.nota_vigesimal::float, c.nota_literal,
                  ev.periodo_id
             FROM calificaciones c
             JOIN matriculas m ON m.id = c.matricula_id
             JOIN evaluaciones ev ON ev.id = c.evaluacion_id
            WHERE m.tenant_id = $1
              AND m.estudiante_id = $2
              AND ($3::uuid IS NULL OR ev.periodo_id = $3::uuid)
            ORDER BY ev.created_at ASC`,
          [req.user!.tenantId, student.id, d.periodoId ?? null]
        );

        const snapshot = {
          institucion: instRes.rows[0],
          estudiante: {
            id: student.id,
            nombreCompleto: `${student.nombres} ${student.apellido_paterno} ${student.apellido_materno ?? ''}`.trim(),
            codigoSiagie: student.codigo_siagie,
            documentoUltimos4: student.documento_ultimos4,
          },
          tipoDocumento: d.tipo,
          periodoId: d.periodoId ?? null,
          calificaciones: gradesSnapshot.rows,
          metadataAdicional: d.metadataAdicional ?? {},
          emitidoEnIso: new Date().toISOString(),
        };

        const tokenVerificacion = generateTenantBoundToken(req.user!.tenantId);
        const hashSha256 = crypto
          .createHash('sha256')
          .update(JSON.stringify({ tokenVerificacion, snapshot }))
          .digest('hex');

        const ins = await client.query(
          `INSERT INTO documentos_emitidos (
             tenant_id, tipo, estudiante_id, token_verificacion, hash_sha256,
             metadata_snapshot_json, emitido_por, activo
           ) VALUES ($1, $2::tipo_documento_escolar_enum, $3, $4, $5, $6::jsonb, $7, true)
           RETURNING id, tipo, estudiante_id, token_verificacion, hash_sha256,
                     metadata_snapshot_json, fecha_emision, activo`,
          [
            req.user!.tenantId,
            d.tipo,
            student.id,
            tokenVerificacion,
            hashSha256,
            JSON.stringify(snapshot),
            req.user!.id,
          ]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'ISSUE_OFFICIAL_DOCUMENT',
            entidad: 'documentos_emitidos',
            entidadId: ins.rows[0].id,
            datosNuevos: { tipo: d.tipo, estudianteId: student.id, hashSha256 },
            ipOrigen: req.ip,
          },
          client
        );

        return {
          ...ins.rows[0],
          urlVerificacionPublica: `/api/v1/public/verify/${tokenVerificacion}`,
        };
      });

      if (!issued) {
        fail(res, 404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado en la institución.');
        return;
      }
      ok(res, issued, 201);
    } catch {
      fail(res, 500, 'DOCUMENT_ISSUE_ERROR', 'No se pudo emitir el documento oficial.');
    }
  }
);

// RF-59: Consultar listado de documentos oficiales emitidos
router.get('/', async (req: AuthenticatedRequest, res) => {
  const estudianteId = typeof req.query.estudianteId === 'string' ? req.query.estudianteId : null;
  const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT de.id, de.tipo, de.estudiante_id, de.token_verificacion, de.hash_sha256,
                de.fecha_emision, de.activo,
                p.nombres AS estudiante_nombres, p.apellido_paterno AS estudiante_apellido
           FROM documentos_emitidos de
           LEFT JOIN personas p ON p.id = de.estudiante_id AND p.tenant_id = de.tenant_id
          WHERE de.tenant_id = $1
            AND ($2::uuid IS NULL OR de.estudiante_id = $2::uuid)
            AND ($3::text IS NULL OR de.tipo::text = $3::text)
          ORDER BY de.fecha_emision DESC
          LIMIT 100`,
        [req.user!.tenantId, estudianteId, tipo]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'DOCUMENTS_FETCH_ERROR', 'No se pudieron consultar los documentos emitidos.');
  }
});

// RF-87: Solicitudes de certificados y constancias en línea
router.get('/requests/list', async (req: AuthenticatedRequest, res) => {
  const estado = typeof req.query.estado === 'string' ? req.query.estado : null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT sc.id, sc.tipo, sc.estudiante_id, sc.motivo, sc.solicitante_dni,
                sc.solicitante_email, sc.estado, sc.observacion, sc.documento_id,
                sc.emitido_en, sc.descarga_expira_en, sc.created_at,
                p.nombres AS estudiante_nombres, p.apellido_paterno AS estudiante_apellido
           FROM solicitudes_certificado sc
           JOIN personas p ON p.id = sc.estudiante_id AND p.tenant_id = sc.tenant_id
          WHERE sc.tenant_id = $1
            AND ($2::text IS NULL OR sc.estado = $2::text)
          ORDER BY sc.created_at DESC
          LIMIT 100`,
        [req.user!.tenantId, estado]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'CERTIFICATE_REQUESTS_ERROR', 'No se pudieron consultar las solicitudes de certificados.');
  }
});

router.post('/requests', async (req: AuthenticatedRequest, res) => {
  const parsed = z
    .object({
      tipo: documentTypeEnum,
      estudianteId: z.string().uuid(),
      periodos: z.array(z.string().uuid()).default([]),
      motivo: z.string().min(5).max(500),
      solicitanteDni: z.string().regex(/^\d{8}$/),
      solicitanteEmail: z.string().email().max(100),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    fail(res, 400, 'VALIDATION_FAILED', 'Datos de solicitud de certificado inválidos.');
    return;
  }

  try {
    const d = parsed.data;
    const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const ins = await client.query(
        `INSERT INTO solicitudes_certificado (
           tenant_id, tipo, estudiante_id, periodos, motivo,
           solicitante_usuario_id, solicitante_dni, solicitante_email, estado
         ) VALUES ($1, $2::tipo_documento_escolar_enum, $3, $4::uuid[], $5, $6, $7, $8, 'SOLICITADO')
         RETURNING id, tipo, estudiante_id, estado, created_at`,
        [
          req.user!.tenantId,
          d.tipo,
          d.estudianteId,
          d.periodos,
          d.motivo.trim(),
          req.user!.id,
          d.solicitanteDni,
          d.solicitanteEmail,
        ]
      );

      await AuditService.record(
        {
          tenantId: req.user!.tenantId,
          usuarioId: req.user!.id,
          accion: 'REQUEST_CERTIFICATE',
          entidad: 'solicitudes_certificado',
          entidadId: ins.rows[0].id,
          datosNuevos: { tipo: d.tipo, estudianteId: d.estudianteId },
          ipOrigen: req.ip,
        },
        client
      );

      return ins.rows[0];
    });

    ok(res, created, 201);
  } catch {
    fail(res, 500, 'CERTIFICATE_REQUEST_CREATE_ERROR', 'No se pudo registrar la solicitud de certificado.');
  }
});

router.patch(
  '/requests/:id/resolve',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        estado: z.enum(['EN_REVISION', 'OBSERVADO', 'EMITIDO', 'RECHAZADO']),
        observacion: z.string().max(500).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Estado de resolución inválido.');
      return;
    }

    try {
      const d = parsed.data;
      const resolved = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const reqRow = await client.query<{
          id: string;
          tipo: string;
          estudiante_id: string;
          solicitante_usuario_id: string | null;
        }>(
          `SELECT id, tipo::text, estudiante_id, solicitante_usuario_id
             FROM solicitudes_certificado
            WHERE id = $1 AND tenant_id = $2
            FOR UPDATE`,
          [req.params.id, req.user!.tenantId]
        );
        if (!reqRow.rowCount) return null;
        const current = reqRow.rows[0];

        let documentoId: string | null = null;
        if (d.estado === 'EMITIDO') {
          const tokenVerificacion = generateTenantBoundToken(req.user!.tenantId);
          const snapshot = {
            solicitudId: current.id,
            tipo: current.tipo,
            estudianteId: current.estudiante_id,
            emitidoEnIso: new Date().toISOString(),
          };
          const hashSha256 = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

          const docIns = await client.query<{ id: string }>(
            `INSERT INTO documentos_emitidos (
               tenant_id, tipo, estudiante_id, token_verificacion, hash_sha256,
               metadata_snapshot_json, emitido_por, activo
             ) VALUES ($1, $2::tipo_documento_escolar_enum, $3, $4, $5, $6::jsonb, $7, true)
             RETURNING id`,
            [
              req.user!.tenantId,
              current.tipo,
              current.estudiante_id,
              tokenVerificacion,
              hashSha256,
              JSON.stringify(snapshot),
              req.user!.id,
            ]
          );
          documentoId = docIns.rows[0].id;
        }

        const upd = await client.query(
          `UPDATE solicitudes_certificado
              SET estado = $1,
                  observacion = COALESCE($2, observacion),
                  documento_id = COALESCE($3, documento_id),
                  aprobado_por = $4,
                  emitido_en = CASE WHEN $1 = 'EMITIDO' THEN now() ELSE emitido_en END,
                  descarga_expira_en = CASE WHEN $1 = 'EMITIDO' THEN now() + interval '30 days' ELSE descarga_expira_en END
            WHERE id = $5 AND tenant_id = $6
            RETURNING id, tipo, estado, observacion, documento_id, emitido_en, descarga_expira_en`,
          [d.estado, d.observacion ?? null, documentoId, req.user!.id, req.params.id, req.user!.tenantId]
        );

        if (current.solicitante_usuario_id) {
          await NotificationService.create(client, req.user!.tenantId, current.solicitante_usuario_id, {
            categoria: 'TRAMITES',
            prioridad: 'NORMAL',
            titulo: `Solicitud de ${current.tipo}: ${d.estado}`,
            mensaje: d.observacion ?? `Su solicitud de documento ha cambiado al estado ${d.estado}.`,
          });
        }

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'RESOLVE_CERTIFICATE_REQUEST',
            entidad: 'solicitudes_certificado',
            entidadId: req.params.id,
            datosNuevos: { estado: d.estado, documentoId },
            ipOrigen: req.ip,
          },
          client
        );

        return upd.rows[0];
      });

      if (!resolved) {
        fail(res, 404, 'REQUEST_NOT_FOUND', 'Solicitud de certificado no encontrada.');
        return;
      }
      ok(res, resolved);
    } catch {
      fail(res, 500, 'REQUEST_RESOLVE_ERROR', 'No se pudo actualizar la solicitud de certificado.');
    }
  }
);

export default router;
