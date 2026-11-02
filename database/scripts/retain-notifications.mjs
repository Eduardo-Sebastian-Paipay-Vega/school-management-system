import { Client } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL del propietario de migraciones es obligatorio.');
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
let total=0;
try {
  for (;;) {
    await client.query('BEGIN');
    const old = await client.query(`SELECT id FROM notificaciones
      WHERE created_at < now() - interval '180 days'
      ORDER BY created_at,id LIMIT 1000 FOR UPDATE SKIP LOCKED`);
    if (!old.rowCount) { await client.query('COMMIT'); break; }
    const ids=old.rows.map(row=>row.id);
    await client.query(`UPDATE avisos_inasistencia SET notificacion_id=NULL
      WHERE notificacion_id=ANY($1::uuid[])`,[ids]);
    const removed=await client.query(`DELETE FROM notificaciones WHERE id=ANY($1::uuid[])`,[ids]);
    total+=removed.rowCount??0;
    await client.query('COMMIT');
  }
  process.stdout.write(`Notificaciones vencidas eliminadas: ${total}\n`);
} catch(error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
