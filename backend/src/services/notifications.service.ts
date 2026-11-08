import { PoolClient } from 'pg';
import { pool, withTenant } from '../config/database';
import { sendNotificationEmail } from './mail.service';
import { redisClient } from '../config/redis';

type Listener = (event: object) => void;
const listeners = new Map<string, Set<Listener>>();
const key = (tenantId: string, userId: string) => `${tenantId}:${userId}`;

export class NotificationService {
  private static subscriber: ReturnType<typeof redisClient.duplicate> | null = null;
  private static async tenantIsActive(tenantId:string):Promise<boolean>{
    return withTenant(tenantId,'',async client=>{
      const found=await client.query(`SELECT 1 FROM instituciones
        WHERE id=$1 AND activo IS TRUE AND estado_tenant='ACTIVO'`,[tenantId]);
      return found.rowCount===1;
    });
  }
  static async startPubsub(): Promise<void> {
    if(!redisClient.isReady || this.subscriber)return;
    const subscriber=redisClient.duplicate();
    subscriber.on('error',(error)=>console.error('Suscripción de avisos:',error));
    await subscriber.connect();
    this.subscriber=subscriber;
    await subscriber.pSubscribe('sms:notice:*',(payload,channel)=>{
      const parts=channel.split(':');
      if(parts.length!==4)return;
      try{
        const event=JSON.parse(payload) as object;
        for(const listener of listeners.get(key(parts[2],parts[3]))??[])listener(event);
      }catch(error){console.warn('Evento de aviso inválido:',error);}
    });
  }
  static async stopPubsub(): Promise<void> {
    if(this.subscriber){await this.subscriber.quit();this.subscriber=null;}
  }
  static subscribe(tenantId: string, userId: string, listener: Listener): () => void {
    const id = key(tenantId,userId);
    const set = listeners.get(id) ?? new Set<Listener>();
    set.add(listener);
    listeners.set(id,set);
    return () => { set.delete(listener); if (!set.size) listeners.delete(id); };
  }

  static async create(client: PoolClient, tenantId: string, userId: string,
    input: { categoria: string; prioridad?: 'ALTA'|'NORMAL'|'BAJA'; titulo: string; mensaje: string; enlace?: string }) {
    const result = await client.query<{ id: string; created_at: Date }>(
      `INSERT INTO notificaciones(tenant_id,usuario_id,categoria,prioridad,titulo,mensaje,enlace)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at`,
      [tenantId,userId,input.categoria,input.prioridad ?? 'NORMAL',input.titulo,input.mensaje,input.enlace ?? null]);
    await client.query(`INSERT INTO envios_correo(tenant_id,notificacion_id)
      SELECT $1,$2 FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
      WHERE u.tenant_id=$1 AND u.id=$3 AND u.email_verificado_en IS NOT NULL AND p.email IS NOT NULL
        AND COALESCE((SELECT por_correo FROM preferencias_notificacion
          WHERE tenant_id=$1 AND usuario_id=$3 AND categoria=$4),true)`,
      [tenantId,result.rows[0].id,userId,input.categoria]);
    return result.rows[0];
  }

  static async publish(tenantId: string, userId: string, event: object): Promise<void> {
    if(!await this.tenantIsActive(tenantId))return;
    if(redisClient.isReady)await redisClient.publish(`sms:notice:${tenantId}:${userId}`,JSON.stringify(event));
    else for (const listener of listeners.get(key(tenantId,userId)) ?? []) listener(event);
  }

  static async processEmailQueue(): Promise<void> {
    const tenants = await pool.query<{ tenant_id: string }>(
      'SELECT fn_tenants_correo_pendiente() AS tenant_id');
    for (const { tenant_id: tenantId } of tenants.rows) {
      if(!await this.tenantIsActive(tenantId))continue;
      const jobs = await withTenant(tenantId,'',async (client) => {
        const claimed = await client.query<{ id: string; email: string | null; titulo: string; mensaje: string; intentos: number }>(
          `SELECT e.id,CASE WHEN u.email_verificado_en IS NOT NULL
             AND COALESCE(pref.por_correo,true) THEN p.email ELSE NULL END AS email,
             n.titulo,n.mensaje,e.intentos FROM envios_correo e
           JOIN notificaciones n ON n.id=e.notificacion_id AND n.tenant_id=e.tenant_id
           JOIN usuarios u ON u.id=n.usuario_id AND u.tenant_id=n.tenant_id
           JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
           LEFT JOIN preferencias_notificacion pref ON pref.tenant_id=e.tenant_id
             AND pref.usuario_id=u.id AND pref.categoria=n.categoria
           WHERE e.tenant_id=$1 AND e.estado='PENDIENTE' AND e.proximo_intento_en<=now()
             AND n.prioridad<>'BAJA'
           ORDER BY e.created_at LIMIT 20 FOR UPDATE OF e SKIP LOCKED`,[tenantId]);
        for(const job of claimed.rows)await client.query(`UPDATE envios_correo
          SET intentos=intentos+1,proximo_intento_en=now()+interval '10 minutes'
          WHERE id=$1 AND tenant_id=$2`,[job.id,tenantId]);
        return claimed.rows;
      });
      for (const job of jobs) {
          if(!await this.tenantIsActive(tenantId)){
            await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo
              SET intentos=greatest(intentos-1,0),proximo_intento_en=now()
              WHERE id=$1 AND tenant_id=$2 AND estado='PENDIENTE'`,[job.id,tenantId]));
            continue;
          }
          if (!job.email) {
            await withTenant(tenantId,'',client=>client.query("UPDATE envios_correo SET estado='FALLIDO',ultimo_error='Correo no verificado o preferencia desactivada' WHERE id=$1 AND tenant_id=$2",[job.id,tenantId]));
            continue;
          }
          try {
            await sendNotificationEmail(job.email,job.titulo,job.mensaje);
            await withTenant(tenantId,'',client=>client.query("UPDATE envios_correo SET estado='ENVIADO',enviado_en=now(),ultimo_error=NULL WHERE id=$1 AND tenant_id=$2",[job.id,tenantId]));
          } catch (cause) {
            const attempts=job.intentos+1;
            await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo SET estado=$1,ultimo_error=$2,
              proximo_intento_en=now()+($3::int * interval '1 minute') WHERE id=$4 AND tenant_id=$5`,
              [attempts>=5?'FALLIDO':'PENDIENTE',
                cause instanceof Error?cause.message.slice(0,500):'Error de correo',2**attempts,job.id,tenantId]));
          }
      }
    }
  }

  static async processDailyDigest(): Promise<void> {
    const tenants=await pool.query<{tenant_id:string}>(
      'SELECT fn_tenants_correo_pendiente() AS tenant_id');
    for(const {tenant_id:tenantId} of tenants.rows){
      if(!await this.tenantIsActive(tenantId))continue;
      const jobs=await withTenant(tenantId,'',async(client)=>{
        const claimed=await client.query<{id:string;usuario_id:string;email:string|null;
          titulo:string;mensaje:string;intentos:number}>(`SELECT e.id,n.usuario_id,
            CASE WHEN u.email_verificado_en IS NOT NULL
              AND COALESCE(pref.por_correo,true) THEN p.email ELSE NULL END AS email,
            n.titulo,n.mensaje,e.intentos
          FROM envios_correo e
          JOIN notificaciones n ON n.id=e.notificacion_id AND n.tenant_id=e.tenant_id
          JOIN usuarios u ON u.id=n.usuario_id AND u.tenant_id=n.tenant_id
          JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
          LEFT JOIN preferencias_notificacion pref ON pref.tenant_id=e.tenant_id
            AND pref.usuario_id=u.id AND pref.categoria=n.categoria
          WHERE e.tenant_id=$1 AND e.estado='PENDIENTE' AND e.proximo_intento_en<=now()
            AND n.prioridad='BAJA'
            AND n.created_at < (date_trunc('day',now() AT TIME ZONE 'America/Lima')
              AT TIME ZONE 'America/Lima')
          ORDER BY n.usuario_id,n.created_at LIMIT 100 FOR UPDATE OF e SKIP LOCKED`,[tenantId]);
        for(const job of claimed.rows)await client.query(`UPDATE envios_correo
          SET intentos=intentos+1,proximo_intento_en=now()+interval '10 minutes'
          WHERE id=$1 AND tenant_id=$2`,[job.id,tenantId]);
        return claimed.rows;
      });
      const groups=new Map<string,typeof jobs>();
      for(const job of jobs){const group=groups.get(job.usuario_id)??[];group.push(job);groups.set(job.usuario_id,group);}
      for(const group of groups.values()){
        if(!await this.tenantIsActive(tenantId)){
          await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo
            SET intentos=greatest(intentos-1,0),proximo_intento_en=now()
            WHERE tenant_id=$1 AND id=ANY($2::uuid[]) AND estado='PENDIENTE'`,
          [tenantId,group.map(job=>job.id)]));
          continue;
        }
        const inactive=group.filter(job=>!job.email);
        if(inactive.length){
          await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo
            SET estado='FALLIDO',ultimo_error='Correo no verificado o preferencia desactivada'
            WHERE tenant_id=$1 AND id=ANY($2::uuid[])`,[tenantId,inactive.map(job=>job.id)]));
        }
        const active=group.filter(job=>job.email);
        if(!active.length)continue;
        const ids=active.map(job=>job.id);
        try{
          const body=active.map(job=>`• ${job.titulo}\n${job.mensaje}`).join('\n\n');
          await sendNotificationEmail(active[0].email!,'Resumen diario de avisos escolares',body);
          await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo
            SET estado='ENVIADO',enviado_en=now(),ultimo_error=NULL
            WHERE tenant_id=$1 AND id=ANY($2::uuid[])`,[tenantId,ids]));
        }catch(cause){
          for(const job of active){
            const attempts=job.intentos+1;
            await withTenant(tenantId,'',client=>client.query(`UPDATE envios_correo
              SET estado=$1,ultimo_error=$2,
                proximo_intento_en=now()+($3::int * interval '1 minute')
              WHERE tenant_id=$4 AND id=$5`,[attempts>=5?'FALLIDO':'PENDIENTE',
                cause instanceof Error?cause.message.slice(0,500):'Error de correo',
                2**attempts,tenantId,job.id]));
          }
        }
      }
    }
  }
}
