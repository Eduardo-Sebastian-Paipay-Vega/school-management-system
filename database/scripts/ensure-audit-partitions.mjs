import { Client } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL del propietario de migraciones es obligatorio.');
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  const result = await client.query(`SELECT fn_crear_particion_auditoria(
    (date_trunc('month', now() AT TIME ZONE 'UTC') + (n || ' months')::interval)::date) AS name
    FROM generate_series(0,12) AS n`);
  await client.query('COMMIT');
  process.stdout.write(`Particiones de auditoría disponibles: ${result.rows.map(row=>row.name).join(', ')}\n`);
} catch(error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
