import { PoolClient } from 'pg';
import { pool, withTenant } from '../config/database';
import { sendNotificationEmail } from './mail.service';
import { redisClient } from '../config/redis';

type Listener = (event: object) => void;
const listeners = new Map<string, Set<Listener>>();
const key = (tenantId: string, userId: string) => `${tenantId}:${userId}`;

export class NotificationService {
  static async startPubsub(): Promise<void> {
    if(!redisClient.isReady)return;
    const subscriber=redisClient.duplicate();
    subscriber.on('error',(error)=>console.error('Suscripción de avisos:',error));
    await subscriber.connect();
    await subscriber.pSubscribe('sms:notice:*',(payload,channel)=>{
      const parts=channel.split(':');
      if(parts.length!==4)return;
      try{
        const event=JSON.parse(payload) as object;
        for(const listener of listeners.get(key(parts[2],parts[3]))??[])listener(event);
      }catch(error){console.warn('Evento de aviso inválido:',error);}
    });
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
      SELECT $1,$2 WHERE COALESCE((SELECT por_correo FROM preferencias_notificacion
        WHERE tenant_id=$1 AND usuario_id=$3 AND categoria=$4),true)`,
      [tenantId,result.rows[0].id,userId,input.categoria]);
    return result.rows[0];
  }

  static async publish(tenantId: string, userId: string, event: object): Promise<void> {
    if(redisClient.isReady)await redisClient.publish(`sms:notice:${tenantId}:${userId}`,JSON.stringify(event));
    else for (const listener of listeners.get(key(tenantId,userId)) ?? []) listener(event);
  }

  static async processEmailQueue(): Promise<void> {
    const tenants = await pool.query<{ tenant_id: string }>(
      'SELECT fn_tenants_correo_pendiente() AS tenant_id');
    for (const { tenant_id: tenantId } of tenants.rows) {
      await withTenant(tenantId,'',async (client) => {
        const jobs = await client.query<{ id: string; email: string | null; titulo: string; mensaje: string; intentos: number }>(
          `SELECT e.id,p.email,n.titulo,n.mensaje,e.intentos FROM envios_correo e
           JOIN notificaciones n ON n.id=e.notificacion_id AND n.tenant_id=e.tenant_id
           JOIN usuarios u ON u.id=n.usuario_id AND u.tenant_id=n.tenant_id
           JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
           WHERE e.tenant_id=$1 AND e.estado='PENDIENTE' AND e.proximo_intento_en<=now()
           ORDER BY e.created_at LIMIT 20 FOR UPDATE OF e SKIP LOCKED`,[tenantId]);
        for (const job of jobs.rows) {
          if (!job.email) {
            await client.query("UPDATE envios_correo SET estado='FALLIDO',ultimo_error='Sin correo' WHERE id=$1",[job.id]);
            continue;
          }
          try {
            await sendNotificationEmail(job.email,job.titulo,job.mensaje);
            await client.query("UPDATE envios_correo SET estado='ENVIADO',enviado_en=now(),intentos=intentos+1,ultimo_error=NULL WHERE id=$1",[job.id]);
          } catch (cause) {
            const attempts=job.intentos+1;
            await client.query(`UPDATE envios_correo SET estado=$1,intentos=$2,ultimo_error=$3,
              proximo_intento_en=now()+($4::int * interval '1 minute') WHERE id=$5`,
              [attempts>=5?'FALLIDO':'PENDIENTE',attempts,
                cause instanceof Error?cause.message.slice(0,500):'Error de correo',2**attempts,job.id]);
          }
        }
      });
    }
  }
}
