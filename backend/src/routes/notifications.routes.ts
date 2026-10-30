import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateJwt } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notifications.service';

const router=Router();
router.use(authenticateJwt);
const ok=(res:import('express').Response,data:unknown,status=200)=>res.status(status).json({success:true,data,timestamp:new Date().toISOString()});
const fail=(res:import('express').Response,status:number,code:string,message:string)=>res.status(status).json({success:false,error:{code,message},timestamp:new Date().toISOString()});

router.get('/',async(req:AuthenticatedRequest,res)=>{
  const parsed=z.object({limit:z.coerce.number().int().min(1).max(100).default(30),
    offset:z.coerce.number().int().min(0).default(0)}).safeParse(req.query);
  if(!parsed.success){fail(res,400,'VALIDATION_FAILED','Paginación inválida.');return;}
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>
      (await client.query(`SELECT id,categoria,prioridad,titulo,mensaje,enlace,leida_en,created_at
        FROM notificaciones WHERE tenant_id=$1 AND usuario_id=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
        [req.user!.tenantId,req.user!.id,parsed.data.limit,parsed.data.offset])).rows);
    ok(res,data);
  }catch{fail(res,500,'NOTIFICATIONS_ERROR','No se pudo cargar la bandeja.');}
});

router.patch('/:id/read',async(req:AuthenticatedRequest,res)=>{
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>
      (await client.query(`UPDATE notificaciones SET leida_en=COALESCE(leida_en,now())
        WHERE id=$1 AND tenant_id=$2 AND usuario_id=$3 RETURNING id,leida_en`,
        [req.params.id,req.user!.tenantId,req.user!.id])).rows[0]);
    if(!data){fail(res,404,'NOT_FOUND','Aviso no encontrado.');return;}
    ok(res,data);
  }catch{fail(res,500,'NOTIFICATIONS_ERROR','No se pudo marcar el aviso.');}
});

router.get('/preferences',async(req:AuthenticatedRequest,res)=>{
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>
      (await client.query(`SELECT categoria,por_correo FROM preferencias_notificacion
        WHERE tenant_id=$1 AND usuario_id=$2 ORDER BY categoria`,[req.user!.tenantId,req.user!.id])).rows);
    ok(res,data);
  }catch{fail(res,500,'NOTIFICATIONS_ERROR','No se pudieron cargar las preferencias.');}
});

router.put('/preferences/:category',async(req:AuthenticatedRequest,res)=>{
  const parsed=z.object({porCorreo:z.boolean()}).safeParse(req.body);
  if(!parsed.success || !/^[A-Z_]{3,40}$/.test(req.params.category)){
    fail(res,400,'VALIDATION_FAILED','Preferencia inválida.');return;
  }
  try{
    await withTenant(req.user!.tenantId,req.user!.id,async(client)=>{
      await client.query(`INSERT INTO preferencias_notificacion(tenant_id,usuario_id,categoria,por_correo)
        VALUES($1,$2,$3,$4) ON CONFLICT(usuario_id,categoria) DO UPDATE SET por_correo=EXCLUDED.por_correo`,
        [req.user!.tenantId,req.user!.id,req.params.category,parsed.data.porCorreo]);
      await AuditService.record({tenantId:req.user!.tenantId,usuarioId:req.user!.id,
        accion:'NOTIFICATION_PREFERENCE',entidad:'preferencias_notificacion',
        datosNuevos:{categoria:req.params.category,porCorreo:parsed.data.porCorreo},ipOrigen:req.ip},client);
    });
    ok(res,{categoria:req.params.category,porCorreo:parsed.data.porCorreo});
  }catch{fail(res,500,'NOTIFICATIONS_ERROR','No se pudo guardar la preferencia.');}
});

router.post('/',requirePermission('notifications:send'),async(req:AuthenticatedRequest,res)=>{
  const parsed=z.object({userId:z.string().uuid(),categoria:z.string().regex(/^[A-Z_]{3,40}$/),
    prioridad:z.enum(['ALTA','NORMAL','BAJA']).optional(),titulo:z.string().min(1).max(150),
    mensaje:z.string().min(1).max(3000),enlace:z.string().startsWith('/').max(500).optional()}).safeParse(req.body);
  if(!parsed.success){fail(res,400,'VALIDATION_FAILED','Aviso inválido.');return;}
  try{
    const data=await withTenant(req.user!.tenantId,req.user!.id,async(client)=>{
      const created=await NotificationService.create(client,req.user!.tenantId,parsed.data.userId,
        {...parsed.data});
      await AuditService.record({tenantId:req.user!.tenantId,usuarioId:req.user!.id,
        accion:'SEND_NOTIFICATION',entidad:'notificaciones',entidadId:created.id,
        datosNuevos:{categoria:parsed.data.categoria,destinatario:parsed.data.userId},ipOrigen:req.ip},client);
      return created;
    });
    await NotificationService.publish(req.user!.tenantId,parsed.data.userId,{type:'notification',id:data.id})
      .catch((error)=>console.error('No se pudo difundir el aviso en tiempo real:',error));
    ok(res,data,201);
  }catch{fail(res,409,'NOTIFICATIONS_ERROR','No se pudo crear el aviso.');}
});

export default router;
