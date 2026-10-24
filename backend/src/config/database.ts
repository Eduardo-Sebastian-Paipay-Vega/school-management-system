import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
if (!dbUser || !dbPassword || dbUser === 'postgres') {
  throw new Error('DB_USER y DB_PASSWORD deben configurar un rol de aplicación sin BYPASSRLS (no postgres).');
}

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: dbUser,
  password: dbPassword,
  database: process.env.DB_NAME || 'school_management',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function assertRuntimeRole(): Promise<void> {
  const result = await pool.query<{ is_member: boolean; rolsuper: boolean;
    rolbypassrls: boolean; rolinherit: boolean; owns_tables: boolean;
    other_membership: boolean }>(`SELECT
    pg_has_role(current_user,'sms_app','member') AS is_member,
    r.rolsuper,r.rolbypassrls,r.rolinherit,
    EXISTS(SELECT 1 FROM pg_class c WHERE c.relowner=r.oid
      AND c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p')) AS owns_tables,
    EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles parent ON parent.oid=m.roleid
      WHERE m.member=r.oid AND parent.rolname<>'sms_app') AS other_membership
    FROM pg_roles r WHERE r.rolname=current_user`);
  const role = result.rows[0];
  if (!role || !role.is_member || role.rolsuper || role.rolbypassrls ||
      !role.rolinherit || role.owns_tables || role.other_membership) {
    throw new Error('El rol de aplicación no cumple las restricciones RLS.');
  }
}

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

export async function withTenant<T>(tenantId: string, userId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true), set_config('app.user_id', $2, true)", [tenantId, userId]);
    const value = await fn(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function resolveInstitution(codigoModular: string): Promise<string | null> {
  const result = await pool.query<{ id: string }>('SELECT fn_resolver_institucion($1) AS id', [codigoModular]);
  return result.rows[0]?.id ?? null;
}
