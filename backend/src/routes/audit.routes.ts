import { Router } from 'express';
import { z } from 'zod';
import { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { AuditService } from '../services/audit.service';
import { withTenant } from '../config/database';
import PDFDocument from 'pdfkit';
import { isIP } from 'node:net';
import { documentHash } from '../core/identity-crypto';

const router = Router();
router.use(authenticateJwt, requirePermission('audit:read'));

router.get('/verify-chain', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await AuditService.verifyChain(req.user!.tenantId, req.user!.id);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ success: false, error: { code: 'AUDIT_UNAVAILABLE', message: 'No se pudo verificar la auditoría.' }, timestamp: new Date().toISOString() });
  }
});

router.get('/logs', async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    modulo: z.string().max(50).optional(),
    usuarioId: z.string().uuid().optional(),
    dni: z.string().regex(/^\d{8}$/).optional(),
    ip: z.string().refine(value=>isIP(value)>0).optional(),
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional(),
  }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: 'Filtros inválidos.' }, timestamp: new Date().toISOString() });
    return;
  }
  const { limit, offset, modulo, usuarioId, dni, ip, desde, hasta } = parsed.data;
  if(desde && hasta && desde>hasta){
    res.status(400).json({success:false,error:{code:'VALIDATION_FAILED',message:'Rango de fechas inválido.'},timestamp:new Date().toISOString()});return;
  }
  const dniHash=dni?documentHash(dni):null;
  try {
    const data = await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      const result = await client.query(
        `SELECT id, usuario_id, modulo, accion, tabla_afectada, registro_id,
                ip_origen, user_agent, payload_anterior, payload_nuevo, timestamp_utc,
                count(*) OVER()::int AS total
           FROM logs_auditoria l
          WHERE tenant_id = $1 AND ($2::varchar IS NULL OR modulo = $2)
            AND ($3::timestamptz IS NULL OR timestamp_utc >= $3)
            AND ($4::timestamptz IS NULL OR timestamp_utc <= $4)
            AND ($5::uuid IS NULL OR usuario_id = $5)
            AND ($6::char(64) IS NULL OR EXISTS (
              SELECT 1 FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
              WHERE u.id=l.usuario_id AND u.tenant_id=l.tenant_id AND p.documento_hash=$6))
            AND ($7::inet IS NULL OR ip_origen=$7)
          ORDER BY id DESC LIMIT $8 OFFSET $9`,
        [req.user!.tenantId, modulo ?? null, desde ?? null, hasta ?? null, usuarioId ?? null,dniHash,ip??null,limit,offset]
      );
      const total=result.rows.length ? Number(result.rows[0].total) : Number((await client.query(
        `SELECT count(*)::int AS total FROM logs_auditoria l WHERE tenant_id=$1
          AND ($2::varchar IS NULL OR modulo=$2)
          AND ($3::timestamptz IS NULL OR timestamp_utc >= $3)
          AND ($4::timestamptz IS NULL OR timestamp_utc <= $4)
          AND ($5::uuid IS NULL OR usuario_id=$5)
          AND ($6::char(64) IS NULL OR EXISTS (
            SELECT 1 FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
            WHERE u.id=l.usuario_id AND u.tenant_id=l.tenant_id AND p.documento_hash=$6))
          AND ($7::inet IS NULL OR ip_origen=$7)`,
        [req.user!.tenantId,modulo??null,desde??null,hasta??null,usuarioId??null,dniHash,ip??null])).rows[0].total);
      await AuditService.record({tenantId:req.user!.tenantId,usuarioId:req.user!.id,
        accion:'READ_AUDIT_LOGS',entidad:'logs_auditoria',
        datosNuevos:{modulo,usuarioId,dniUltimos4:dni?.slice(-4),ip,
          desde:desde?.toISOString(),hasta:hasta?.toISOString(),limit,offset,total},
        ipOrigen:req.ip},client);
      return {logs:result.rows.map(({total:ignored,...row})=>{void ignored;return row;}),count:total};
    });
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ success: false, error: { code: 'AUDIT_UNAVAILABLE', message: 'No se pudo consultar la auditoría.' }, timestamp: new Date().toISOString() });
  }
});

router.get('/export.pdf', async (req: AuthenticatedRequest, res) => {
  if (!req.user!.permissions.includes('audit:export')) {
    res.status(403).json({ success: false, error: { code: 'ACCESS_DENIED', message: 'No tiene permiso de exportación.' },
      timestamp: new Date().toISOString() }); return;
  }
  const parsed = z.object({ desde: z.coerce.date().optional(), hasta: z.coerce.date().optional(),
    modulo: z.string().max(50).optional(),usuarioId:z.string().uuid().optional(),
    dni:z.string().regex(/^\d{8}$/).optional(),ip:z.string().refine(value=>isIP(value)>0).optional() }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: 'Filtros inválidos.' }, timestamp: new Date().toISOString() }); return; }
  if(parsed.data.desde && parsed.data.hasta && parsed.data.desde>parsed.data.hasta){
    res.status(400).json({success:false,error:{code:'VALIDATION_FAILED',message:'Rango de fechas inválido.'},timestamp:new Date().toISOString()});return;
  }
  const dniHash=parsed.data.dni?documentHash(parsed.data.dni):null;
  try {
    const logs = await withTenant(req.user!.tenantId,req.user!.id,async(client)=>{
      const result=await client.query<{ id:string; timestamp_utc:Date; modulo:string; accion:string;
        tabla_afectada:string|null; usuario_id:string|null; hash_registro:string }>(
        `SELECT id,timestamp_utc,modulo,accion,tabla_afectada,usuario_id,hash_registro
         FROM logs_auditoria l WHERE tenant_id=$1
          AND ($2::timestamptz IS NULL OR timestamp_utc >= $2)
          AND ($3::timestamptz IS NULL OR timestamp_utc <= $3)
          AND ($4::varchar IS NULL OR modulo=$4)
          AND ($5::uuid IS NULL OR usuario_id=$5)
          AND ($6::char(64) IS NULL OR EXISTS (
            SELECT 1 FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
            WHERE u.id=l.usuario_id AND u.tenant_id=l.tenant_id AND p.documento_hash=$6))
          AND ($7::inet IS NULL OR ip_origen=$7)
         ORDER BY id DESC LIMIT 2001`,
        [req.user!.tenantId,parsed.data.desde??null,parsed.data.hasta??null,parsed.data.modulo??null,
          parsed.data.usuarioId??null,dniHash,parsed.data.ip??null]);
      await AuditService.record({tenantId:req.user!.tenantId,usuarioId:req.user!.id,
        accion:'EXPORT_AUDIT_PDF',entidad:'logs_auditoria',datosNuevos:{count:result.rows.length,
          excedeLimite:result.rows.length>2000,
          desde:parsed.data.desde?.toISOString(),hasta:parsed.data.hasta?.toISOString(),modulo:parsed.data.modulo,
          usuarioId:parsed.data.usuarioId,dniUltimos4:parsed.data.dni?.slice(-4),ip:parsed.data.ip},
        ipOrigen:req.ip},client);
      return result.rows;
    });
    if(logs.length>2000){res.status(409).json({success:false,error:{code:'AUDIT_EXPORT_LIMIT',message:'La exportación supera 2000 registros; acote el período.'},timestamp:new Date().toISOString()});return;}
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="auditoria-core.pdf"');
    const pdf=new PDFDocument({size:'A4',margin:42});
    pdf.pipe(res);
    pdf.fontSize(17).text('Registro de auditoría institucional');
    pdf.moveDown(0.3).fontSize(9).text(`Generado: ${new Date().toISOString()} · Registros: ${logs.length}`);
    pdf.moveDown();
    for(const log of logs){
      const line=`#${log.id} · ${log.timestamp_utc.toISOString()} · ${log.modulo}/${log.accion}`;
      pdf.fontSize(8).text(line,{continued:false});
      pdf.fontSize(7).text(`Tabla: ${log.tabla_afectada??'—'} · Usuario: ${log.usuario_id??'sistema'}`);
      pdf.fontSize(6).text(`SHA-256: ${log.hash_registro}`);
      pdf.moveDown(0.4);
    }
    pdf.end();
  } catch {
    if(!res.headersSent)res.status(500).json({success:false,error:{code:'AUDIT_EXPORT_FAILED',message:'No se pudo exportar la auditoría.'},timestamp:new Date().toISOString()});
    else res.end();
  }
});

export default router;
