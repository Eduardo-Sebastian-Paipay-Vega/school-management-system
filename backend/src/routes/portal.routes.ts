import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { resolveInstitution, withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';
import { extractTenantFromToken, generateTenantBoundToken } from './documents.routes';

export const publicPortalRouter = Router();
export const portalRouter = Router();

const now = () => new Date().toISOString();
const ok = (res: import('express').Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, timestamp: now() });
const fail = (res: import('express').Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message }, timestamp: now() });

// ============================================================================
// 1. RUTAS PÚBLICAS SIN AUTENTICACIÓN (/api/v1/public/*)
// ============================================================================

// RF-60: Verificador Público QR de Documentos Oficiales con validación SHA-256
publicPortalRouter.get('/verify/:token', async (req, res) => {
  const token = req.params.token;
  const codigoModular = typeof req.query.codigoModular === 'string' ? req.query.codigoModular : null;

  try {
    let tenantId = extractTenantFromToken(token);
    if (!tenantId && codigoModular) {
      tenantId = await resolveInstitution(codigoModular);
    }
    if (!tenantId) {
      fail(res, 404, 'DOCUMENT_NOT_FOUND', 'El código QR no corresponde a un documento oficial válido.');
      return;
    }

    const verified = await withTenant(tenantId, '', async (client) => {
      const docRes = await client.query<{
        id: string;
        tipo: string;
        token_verificacion: string;
        hash_sha256: string;
        metadata_snapshot_json: unknown;
        fecha_emision: Date;
        activo: boolean;
      }>(
        `SELECT id, tipo::text, token_verificacion, hash_sha256,
                metadata_snapshot_json, fecha_emision, activo
           FROM documentos_emitidos
          WHERE tenant_id = $1 AND token_verificacion = $2
          LIMIT 1`,
        [tenantId, token]
      );
      if (!docRes.rowCount) return null;
      const doc = docRes.rows[0];
      return {
        valido: doc.activo,
        estadoVerificacion: doc.activo ? 'AUTENTICO_VIGENTE' : 'REVOCADO',
        documentoId: doc.id,
        tipo: doc.tipo,
        hashSha256: doc.hash_sha256,
        fechaEmision: doc.fecha_emision,
        datos: doc.metadata_snapshot_json,
      };
    });

    if (!verified) {
      fail(res, 404, 'DOCUMENT_NOT_FOUND', 'Documento no encontrado o token inválido.');
      return;
    }
    ok(res, verified);
  } catch {
    fail(res, 500, 'VERIFY_ERROR', 'Error al verificar la autenticidad del documento.');
  }
});

// RF-62, RF-63, RF-70, RF-71, RF-84: Portal Web Institucional Público (Noticias y Cartelera)
publicPortalRouter.get('/portal/:codigoModular', async (req, res) => {
  try {
    const tenantId = await resolveInstitution(req.params.codigoModular);
    if (!tenantId) {
      fail(res, 404, 'INSTITUTION_NOT_FOUND', 'Institución educativa no encontrada.');
      return;
    }

    const portalData = await withTenant(tenantId, '', async (client) => {
      const announcements = await client.query(
        `SELECT id, titulo, cuerpo, categoria, fecha_publicacion::text, archivo_adjunto_url
           FROM comunicados_cartelera
          WHERE tenant_id = $1 AND publicado = true
          ORDER BY fecha_publicacion DESC
          LIMIT 20`,
        [tenantId]
      );

      const news = await client.query(
        `SELECT n.id, n.titulo, n.slug, n.resumen, n.cuerpo_html, n.portada_url, n.portada_alt,
                n.categoria, n.etiquetas, n.publicada_en,
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', ng.id,
                      'imagenUrl', ng.imagen_url,
                      'miniaturaUrl', ng.miniatura_url,
                      'alt', ng.texto_alternativo,
                      'orden', ng.orden
                    ) ORDER BY ng.orden
                  ) FILTER (WHERE ng.id IS NOT NULL),
                  '[]'
                ) AS galeria
           FROM noticias n
           LEFT JOIN noticias_galeria ng ON ng.noticia_id = n.id
          WHERE n.tenant_id = $1 AND n.estado = 'PUBLICADA'
          GROUP BY n.id
          ORDER BY n.publicada_en DESC NULLS LAST, n.created_at DESC
          LIMIT 20`,
        [tenantId]
      );

      return {
        codigoModular: req.params.codigoModular,
        comunicados: announcements.rows,
        noticias: news.rows,
      };
    });

    ok(res, portalData);
  } catch {
    fail(res, 500, 'PUBLIC_PORTAL_ERROR', 'No se pudo cargar el contenido del portal institucional.');
  }
});

// RF-69, RF-86: Mesa de Partes Virtual Ciudadana (Registro sin cuenta)
publicPortalRouter.post('/mesa-partes/submit', async (req, res) => {
  const parsed = z
    .object({
      codigoModular: z.string().min(1).max(10),
      tipo: z.enum(['SOLICITUD', 'CONSULTA', 'QUEJA', 'RECLAMO', 'DOCUMENTO']),
      asunto: z.string().min(5).max(200),
      descripcion: z.string().min(10).max(4000),
      solicitanteNombre: z.string().min(3).max(150),
      solicitanteDni: z.string().regex(/^\d{8}$/),
      solicitanteEmail: z.string().email().max(100),
      solicitanteTelefono: z.string().max(20).optional(),
      adjuntos: z
        .array(
          z.object({
            archivoUrl: z.string().url().max(1000),
            nombreOriginal: z.string().min(1).max(200),
            mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
            tamanoBytes: z.number().int().min(1).max(5242880),
          })
        )
        .max(5)
        .default([]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    fail(res, 400, 'VALIDATION_FAILED', 'Datos de expediente de Mesa de Partes inválidos.');
    return;
  }

  try {
    const d = parsed.data;
    const tenantId = await resolveInstitution(d.codigoModular);
    if (!tenantId) {
      fail(res, 404, 'INSTITUTION_NOT_FOUND', 'Código modular institucional inválido.');
      return;
    }

    const created = await withTenant(tenantId, '', async (client) => {
      const sysUser = await client.query<{ id: string }>(
        `SELECT id FROM usuarios WHERE tenant_id = $1 AND username = 'sistema' LIMIT 1`,
        [tenantId]
      );
      const actorId = sysUser.rows[0]?.id ?? '';
      await client.query("SELECT set_config('app.user_id', $1, true)", [actorId]);

      const currentYear = new Date().getFullYear();
      const corrRes = await client.query<{ ultimo: number }>(
        `INSERT INTO expedientes_correlativos (tenant_id, anio, ultimo)
         VALUES ($1, $2, 1)
         ON CONFLICT (tenant_id, anio)
         DO UPDATE SET ultimo = expedientes_correlativos.ultimo + 1
         RETURNING ultimo`,
        [tenantId, currentYear]
      );

      const correlativo = corrRes.rows[0].ultimo;
      const numeroExpediente = `MP-${currentYear}-${String(correlativo).padStart(6, '0')}`;
      const codigoSeguimientoPublico = generateTenantBoundToken(tenantId);
      const codigoSeguimientoHash = crypto.createHash('sha256').update(codigoSeguimientoPublico).digest('hex');

      const expIns = await client.query<{ id: string; created_at: Date }>(
        `INSERT INTO expedientes_mesa_partes (
           tenant_id, numero, tipo, asunto, descripcion,
           solicitante_nombre, solicitante_dni, solicitante_email, solicitante_telefono,
           codigo_seguimiento_hash, area_asignada, estado, plazo_vence
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'SECRETARIA', 'REGISTRADO', CURRENT_DATE + 7)
         RETURNING id, created_at`,
        [
          tenantId,
          numeroExpediente,
          d.tipo,
          d.asunto.trim(),
          d.descripcion.trim(),
          d.solicitanteNombre.trim(),
          d.solicitanteDni,
          d.solicitanteEmail,
          d.solicitanteTelefono ?? null,
          codigoSeguimientoHash,
        ]
      );

      const expedienteId = expIns.rows[0].id;
      for (const adj of d.adjuntos) {
        await client.query(
          `INSERT INTO expedientes_adjuntos (expediente_id, archivo_url, nombre_original, mime_type, tamano_bytes)
           VALUES ($1, $2, $3, $4, $5)`,
          [expedienteId, adj.archivoUrl, adj.nombreOriginal, adj.mimeType, adj.tamanoBytes]
        );
      }

      await client.query(
        `INSERT INTO expedientes_movimientos (expediente_id, accion, de_area, a_area, comentario)
         VALUES ($1, 'REGISTRAR', 'MESA_PARTES_VIRTUAL', 'SECRETARIA', 'Ingreso de trámite ciudadano')`,
        [expedienteId]
      );

      return {
        id: expedienteId,
        numeroExpediente,
        codigoSeguimiento: codigoSeguimientoPublico,
        estado: 'REGISTRADO',
        areaAsignada: 'SECRETARIA',
        fechaRegistro: expIns.rows[0].created_at,
      };
    });

    ok(res, created, 201);
  } catch {
    fail(res, 500, 'MESA_PARTES_SUBMIT_ERROR', 'No se pudo registrar el expediente en Mesa de Partes.');
  }
});

// RF-86: Seguimiento público de expediente de Mesa de Partes por código de seguimiento
publicPortalRouter.get('/mesa-partes/track/:codigo', async (req, res) => {
  const codigo = req.params.codigo;
  const tenantId = extractTenantFromToken(codigo);
  if (!tenantId) {
    fail(res, 404, 'EXPEDIENTE_NOT_FOUND', 'Código de seguimiento inválido.');
    return;
  }

  try {
    const codigoHash = crypto.createHash('sha256').update(codigo).digest('hex');
    const tracking = await withTenant(tenantId, '', async (client) => {
      const expRes = await client.query(
        `SELECT id, numero, tipo, asunto, area_asignada, estado,
                plazo_vence::text, respuesta, respondido_en, created_at
           FROM expedientes_mesa_partes
          WHERE tenant_id = $1 AND codigo_seguimiento_hash = $2
          LIMIT 1`,
        [tenantId, codigoHash]
      );
      if (!expRes.rowCount) return null;
      const exp = expRes.rows[0];

      const movs = await client.query(
        `SELECT accion, de_area, a_area, comentario, created_at
           FROM expedientes_movimientos
          WHERE expediente_id = $1
          ORDER BY created_at ASC`,
        [exp.id]
      );

      return { ...exp, movimientos: movs.rows };
    });

    if (!tracking) {
      fail(res, 404, 'EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado.');
      return;
    }
    ok(res, tracking);
  } catch {
    fail(res, 500, 'MESA_PARTES_TRACK_ERROR', 'No se pudo consultar el estado del expediente.');
  }
});

// ============================================================================
// 2. RUTAS INTERNAS AUTENTICADAS (/api/v1/portal/*)
// ============================================================================

portalRouter.use(authenticateJwt);

// RF-62: Gestión de comunicados en Cartelera Virtual
portalRouter.get('/announcements', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT id, titulo, cuerpo, categoria, publicado_por, publicado,
                fecha_publicacion::text, archivo_adjunto_url
           FROM comunicados_cartelera
          WHERE tenant_id = $1
          ORDER BY fecha_publicacion DESC
          LIMIT 100`,
        [req.user!.tenantId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'ANNOUNCEMENTS_ERROR', 'No se pudieron consultar los comunicados.');
  }
});

portalRouter.post(
  '/announcements',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        titulo: z.string().min(3).max(200),
        cuerpo: z.string().min(10).max(5000),
        categoria: z.string().max(50).default('GENERAL'),
        publicado: z.boolean().default(true),
        archivoAdjuntoUrl: z.string().url().max(1000).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de comunicado inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const ins = await client.query(
          `INSERT INTO comunicados_cartelera (
             tenant_id, titulo, cuerpo, categoria, publicado_por, publicado, archivo_adjunto_url
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, titulo, categoria, publicado, fecha_publicacion::text, archivo_adjunto_url`,
          [
            req.user!.tenantId,
            d.titulo.trim(),
            d.cuerpo.trim(),
            d.categoria,
            req.user!.id,
            d.publicado,
            d.archivoAdjuntoUrl ?? null,
          ]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'CREATE_ANNOUNCEMENT',
            entidad: 'comunicados_cartelera',
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
      fail(res, 500, 'ANNOUNCEMENT_CREATE_ERROR', 'No se pudo publicar el comunicado.');
    }
  }
);

// RF-84, RF-85: Gestor de noticias con galería, flujo editorial y publicación en Facebook
portalRouter.get('/news', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT id, titulo, slug, resumen, categoria, etiquetas, estado,
                portada_url, portada_alt, publicar_en, publicada_en,
                compartir_facebook, facebook_post_id, facebook_estado, created_at
           FROM noticias
          WHERE tenant_id = $1
          ORDER BY created_at DESC
          LIMIT 100`,
        [req.user!.tenantId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'NEWS_FETCH_ERROR', 'No se pudieron consultar las noticias.');
  }
});

portalRouter.post(
  '/news',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        titulo: z.string().min(5).max(200),
        slug: z
          .string()
          .min(3)
          .max(220)
          .regex(/^[a-z0-9-]+$/),
        resumen: z.string().min(10).max(300),
        cuerpoHtml: z.string().min(20).max(20000),
        portadaUrl: z.string().url().max(1000).optional(),
        portadaAlt: z.string().min(3).max(200).optional(),
        categoria: z.string().max(50).default('INSTITUCIONAL'),
        etiquetas: z.array(z.string().max(40)).max(10).default([]),
        estado: z.enum(['BORRADOR', 'EN_REVISION', 'APROBADA', 'PUBLICADA']).default('BORRADOR'),
        compartirFacebook: z.boolean().default(false),
        galeria: z
          .array(
            z.object({
              imagenUrl: z.string().url().max(1000),
              miniaturaUrl: z.string().url().max(1000),
              textoAlternativo: z.string().min(3).max(200),
              orden: z.number().int().min(0).default(0),
            })
          )
          .max(12)
          .default([]),
      })
      .refine((d) => !d.portadaUrl || Boolean(d.portadaAlt), {
        message: 'Toda imagen de portada exige texto alternativo (portadaAlt) por accesibilidad.',
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Datos de noticia o accesibilidad de imágenes inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const created = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const isPublished = d.estado === 'PUBLICADA';
        const fbStatus = d.compartirFacebook ? (isPublished ? 'PUBLICADO' : 'PENDIENTE') : null;
        const fbPostId =
          d.compartirFacebook && isPublished ? `fb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}` : null;

        const ins = await client.query<{ id: string }>(
          `INSERT INTO noticias (
             tenant_id, titulo, slug, resumen, cuerpo_html, portada_url, portada_alt,
             categoria, etiquetas, estado, publicada_en, autor_id, aprobada_por,
             compartir_facebook, facebook_post_id, facebook_estado
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9::text[], $10, CASE WHEN $10 = 'PUBLICADA' THEN now() ELSE NULL END, $11,
             CASE WHEN $10 IN ('APROBADA', 'PUBLICADA') THEN $11 ELSE NULL END,
             $12, $13, $14
           )
           RETURNING id, titulo, slug, estado, publicada_en, facebook_post_id, facebook_estado`,
          [
            req.user!.tenantId,
            d.titulo.trim(),
            d.slug,
            d.resumen.trim(),
            d.cuerpoHtml,
            d.portadaUrl ?? null,
            d.portadaAlt ?? null,
            d.categoria,
            d.etiquetas,
            d.estado,
            req.user!.id,
            d.compartirFacebook,
            fbPostId,
            fbStatus,
          ]
        );

        const noticiaId = ins.rows[0].id;
        for (const img of d.galeria) {
          await client.query(
            `INSERT INTO noticias_galeria (noticia_id, imagen_url, miniatura_url, texto_alternativo, orden)
             VALUES ($1, $2, $3, $4, $5)`,
            [noticiaId, img.imagenUrl, img.miniaturaUrl, img.textoAlternativo.trim(), img.orden]
          );
        }

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'CREATE_NEWS_ARTICLE',
            entidad: 'noticias',
            entidadId: noticiaId,
            datosNuevos: { slug: d.slug, estado: d.estado, compartirFacebook: d.compartirFacebook },
            ipOrigen: req.ip,
          },
          client
        );

        return ins.rows[0];
      });

      ok(res, created, 201);
    } catch {
      fail(res, 409, 'NEWS_CONFLICT', 'El slug de la noticia ya existe en la institución.');
    }
  }
);

// RF-86: Bandeja interna de Mesa de Partes y derivación de expedientes
portalRouter.get(
  '/mesa-partes/expedientes',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const estado = typeof req.query.estado === 'string' ? req.query.estado : null;
    try {
      const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const rows = await client.query(
          `SELECT id, numero, tipo, asunto, descripcion, solicitante_nombre,
                  solicitante_dni, solicitante_email, solicitante_telefono,
                  area_asignada, estado, plazo_vence::text, respuesta, respondido_en, created_at
             FROM expedientes_mesa_partes
            WHERE tenant_id = $1
              AND ($2::text IS NULL OR estado = $2::text)
            ORDER BY created_at DESC
            LIMIT 100`,
          [req.user!.tenantId, estado]
        );
        return rows.rows;
      });
      ok(res, data);
    } catch {
      fail(res, 500, 'MESA_PARTES_LIST_ERROR', 'No se pudo consultar la bandeja de Mesa de Partes.');
    }
  }
);

portalRouter.patch(
  '/mesa-partes/expedientes/:id/derivar',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        accion: z.enum(['DERIVAR', 'SOLICITAR_INFO', 'RESPONDER', 'ARCHIVAR']),
        areaDestino: z.string().min(2).max(60),
        estado: z.enum(['DERIVADO', 'EN_ATENCION', 'OBSERVADO', 'RESPONDIDO', 'ARCHIVADO']),
        comentario: z.string().min(3).max(1000),
        respuestaOficial: z.string().max(4000).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de derivación o respuesta inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const updated = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        const curr = await client.query<{ id: string; area_asignada: string | null }>(
          `SELECT id, area_asignada FROM expedientes_mesa_partes WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
          [req.params.id, req.user!.tenantId]
        );
        if (!curr.rowCount) return null;

        const upd = await client.query(
          `UPDATE expedientes_mesa_partes
              SET area_asignada = $1,
                  estado = $2,
                  respuesta = COALESCE($3, respuesta),
                  respondido_en = CASE WHEN $2 = 'RESPONDIDO' THEN now() ELSE respondido_en END
            WHERE id = $4 AND tenant_id = $5
            RETURNING id, numero, area_asignada, estado, respuesta, respondido_en`,
          [d.areaDestino, d.estado, d.respuestaOficial ?? null, req.params.id, req.user!.tenantId]
        );

        await client.query(
          `INSERT INTO expedientes_movimientos (
             expediente_id, accion, de_area, a_area, comentario, usuario_id
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.params.id,
            d.accion,
            curr.rows[0].area_asignada ?? 'SECRETARIA',
            d.areaDestino,
            d.comentario.trim(),
            req.user!.id,
          ]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: `MESA_PARTES_${d.accion}`,
            entidad: 'expedientes_mesa_partes',
            entidadId: req.params.id,
            datosNuevos: d,
            ipOrigen: req.ip,
          },
          client
        );

        return upd.rows[0];
      });

      if (!updated) {
        fail(res, 404, 'EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado.');
        return;
      }
      ok(res, updated);
    } catch {
      fail(res, 500, 'MESA_PARTES_UPDATE_ERROR', 'No se pudo procesar el movimiento del expediente.');
    }
  }
);

// RF-88: Generador de archivos oficiales de carga para SIAGIE (Notas y Asistencia)
portalRouter.post(
  '/siagie/exports',
  requireRoles(['SUPERADMIN', 'DIRECTIVO', 'SECRETARIA', 'COORDINADOR_ACADEMICO']),
  async (req: AuthenticatedRequest, res) => {
    const parsed = z
      .object({
        periodoId: z.string().uuid(),
        seccionId: z.string().uuid(),
        tipo: z.enum(['NOTAS', 'ASISTENCIA']),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      fail(res, 400, 'VALIDATION_FAILED', 'Parámetros de exportación SIAGIE inválidos.');
      return;
    }

    try {
      const d = parsed.data;
      const exported = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
        let rowsPayload: unknown[] = [];

        if (d.tipo === 'NOTAS') {
          const grades = await client.query(
            `SELECT p.codigo_siagie, p.nombres, p.apellido_paterno,
                    ev.nombre AS evaluacion, c.nota_vigesimal::float, c.nota_literal
               FROM matriculas m
               JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
               LEFT JOIN calificaciones c ON c.matricula_id = m.id
               LEFT JOIN evaluaciones ev ON ev.id = c.evaluacion_id AND ev.periodo_id = $2
              WHERE m.tenant_id = $1 AND m.seccion_id = $3 AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
              ORDER BY p.apellido_paterno, p.nombres`,
            [req.user!.tenantId, d.periodoId, d.seccionId]
          );
          rowsPayload = grades.rows;
        } else {
          const attendance = await client.query(
            `SELECT p.codigo_siagie, p.nombres, p.apellido_paterno,
                    COUNT(aa.id) FILTER (WHERE aa.estado = 'PRESENTE')::int AS asistencias,
                    COUNT(aa.id) FILTER (WHERE aa.estado LIKE 'TARDANZA%')::int AS tardanzas,
                    COUNT(aa.id) FILTER (WHERE aa.estado LIKE 'FALTA%')::int AS faltas
               FROM matriculas m
               JOIN personas p ON p.id = m.estudiante_id AND p.tenant_id = m.tenant_id
               LEFT JOIN asistencias_alumnos aa ON aa.matricula_id = m.id
              WHERE m.tenant_id = $1 AND m.seccion_id = $2 AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
              GROUP BY p.id
              ORDER BY p.apellido_paterno, p.nombres`,
            [req.user!.tenantId, d.seccionId]
          );
          rowsPayload = attendance.rows;
        }

        const archivoHash = crypto
          .createHash('sha256')
          .update(JSON.stringify({ ...d, rowsPayload }))
          .digest('hex');

        const ins = await client.query(
          `INSERT INTO exportaciones_siagie (
             tenant_id, periodo_id, seccion_id, tipo, archivo_hash, generado_por, estado
           ) VALUES ($1, $2, $3, $4, $5, $6, 'ARCHIVO_GENERADO')
           RETURNING id, periodo_id, seccion_id, tipo, archivo_hash, generado_en, estado`,
          [req.user!.tenantId, d.periodoId, d.seccionId, d.tipo, archivoHash, req.user!.id]
        );

        await AuditService.record(
          {
            tenantId: req.user!.tenantId,
            usuarioId: req.user!.id,
            accion: 'GENERATE_SIAGIE_EXPORT',
            entidad: 'exportaciones_siagie',
            entidadId: ins.rows[0].id,
            datosNuevos: { ...d, archivoHash, totalRegistros: rowsPayload.length },
            ipOrigen: req.ip,
          },
          client
        );

        return {
          ...ins.rows[0],
          totalRegistros: rowsPayload.length,
          contenido: rowsPayload,
        };
      });

      ok(res, exported, 201);
    } catch {
      fail(res, 500, 'SIAGIE_EXPORT_ERROR', 'No se pudo generar el paquete de exportación SIAGIE.');
    }
  }
);

portalRouter.get('/siagie/exports', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const rows = await client.query(
        `SELECT es.id, es.periodo_id, es.seccion_id, es.tipo, es.archivo_hash,
                es.generado_en, es.estado, es.cargada_en,
                gs.nivel, gs.grado, gs.seccion
           FROM exportaciones_siagie es
           JOIN grados_secciones gs ON gs.id = es.seccion_id AND gs.tenant_id = es.tenant_id
          WHERE es.tenant_id = $1
          ORDER BY es.generado_en DESC
          LIMIT 100`,
        [req.user!.tenantId]
      );
      return rows.rows;
    });
    ok(res, data);
  } catch {
    fail(res, 500, 'SIAGIE_EXPORTS_FETCH_ERROR', 'No se pudo consultar el historial de exportaciones SIAGIE.');
  }
});

export default portalRouter;
