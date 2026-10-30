import pg from 'pg';

const name = process.env.APP_DB_USER;
const password = process.env.APP_DB_PASSWORD;
if (!name || !/^[a-z_][a-z0-9_]*$/.test(name) || name === 'postgres' ||
    !password || password.length < 24 || !process.env.DATABASE_URL) {
  throw new Error('Configure DATABASE_URL de administración, APP_DB_USER válido y APP_DB_PASSWORD de 24+ caracteres.');
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const existing = await client.query(`SELECT r.rolsuper,r.rolbypassrls,r.rolcreatedb,r.rolcreaterole,
    r.rolreplication,r.rolinherit,
    EXISTS(SELECT 1 FROM pg_class c WHERE c.relowner=r.oid
      AND c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p')) AS owns_tables,
    EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles parent ON parent.oid=m.roleid
      WHERE m.member=r.oid AND parent.rolname<>'sms_app') AS other_membership
    FROM pg_roles r WHERE r.rolname=$1`, [name]);
  if (existing.rowCount && (existing.rows[0].rolsuper || existing.rows[0].rolbypassrls ||
      existing.rows[0].rolcreatedb || existing.rows[0].rolcreaterole ||
      existing.rows[0].rolreplication || !existing.rows[0].rolinherit ||
      existing.rows[0].owns_tables || existing.rows[0].other_membership)) {
    throw new Error('El rol existente tiene privilegios incompatibles con RLS; utilice un rol dedicado.');
  }
  const statement = await client.query('SELECT format($1::text, $2::text, $3::text) AS sql', [
    existing.rowCount ? 'ALTER ROLE %I PASSWORD %L' : 'CREATE ROLE %I LOGIN NOBYPASSRLS PASSWORD %L',
    name, password,
  ]);
  await client.query(statement.rows[0].sql);
  const grant = await client.query('SELECT format($1::text,$2::text) AS sql', ['GRANT sms_app TO %I', name]);
  await client.query(grant.rows[0].sql);
  process.stdout.write(`Rol ${name} preparado como miembro de sms_app.\n`);
} finally {
  await client.end();
}
