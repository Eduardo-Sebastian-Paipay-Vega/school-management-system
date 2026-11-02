const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { startCapture } = require('./smtp-capture.cjs');

// This file is run only by `npm run test:integration` with PostgreSQL 16 and
// Redis 7. Never seed real school data: the fixtures below are fictitious.
const admin = new Pool({ connectionString: process.env.INTEGRATION_DATABASE_URL });
const PASSWORD = 'PruebaSegura2026';
let runtime;
let redisClient;
let server;
let base;
let a;
let b;
let accessA;
let accessB;
let refreshA;
let smtp;
let accessDocente;
let refreshDocente;

async function createInstitution(code) {
  const result = await admin.query(
    `INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo)
     VALUES($1,$2,'PRIMARIA') RETURNING id`, [code, `Institución ficticia ${code}`]);
  const tenantId = result.rows[0].id;
  const system = await admin.query(
    "SELECT id FROM usuarios WHERE tenant_id=$1 AND username='sistema'", [tenantId]);
  const systemId = system.rows[0].id;
  const client = await admin.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
      [tenantId, systemId]);
    const person = await client.query(
      `INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno,email)
       VALUES($1,'SIN_DOCUMENTO','Prueba','Aislamiento',$2) RETURNING id`,
      [tenantId, `test-${code}@example.invalid`]);
    const account = await client.query(
      `INSERT INTO usuarios(tenant_id,persona_id,username,password_hash,estado)
       VALUES($1,$2,$3,crypt($4,gen_salt('bf',12)),'ACTIVO') RETURNING id`,
      [tenantId, person.rows[0].id, `admin_${code}`, PASSWORD]);
    await client.query(
      `INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
       SELECT $1,$2,id FROM roles WHERE codigo::text='SUPERADMIN'`,
      [tenantId, account.rows[0].id]);
    await client.query('COMMIT');
    return { tenantId, userId: account.rows[0].id, code };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function call(path, init = {}) {
  const response = await fetch(`${base}/api/v1${path}`, init);
  const body = await response.json();
  return { status: response.status, body, headers: response.headers };
}

function bearer(token, extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

before(async () => {
  assert.ok(process.env.INTEGRATION_DATABASE_URL, 'Falta INTEGRATION_DATABASE_URL');
  smtp = await startCapture();
  process.env.SMTP_HOST = '127.0.0.1';
  process.env.SMTP_PORT = String(smtp.port);
  process.env.SMTP_USER = 'capture';
  process.env.SMTP_PASSWORD = 'capture-only';
  process.env.SMTP_FROM = 'core@example.invalid';
  process.env.PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.SMTP_TEST_PLAINTEXT = '1';
  const { createApp } = require('../../dist/app');
  const database = require('../../dist/config/database');
  runtime = database;
  redisClient = require('../../dist/config/redis').redisClient;
  await database.assertRuntimeRole();
  await redisClient.connect();
  const suffix = Date.now().toString().slice(-6);
  a = await createInstitution(`1${suffix}`);
  b = await createInstitution(`2${suffix}`);
  const app = createApp();
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (redisClient?.isOpen) await redisClient.quit();
  if (runtime) await runtime.pool.end();
  await admin.end();
  if (smtp) await smtp.close();
});

test('login de cada tenant emite una sesión propia', async () => {
  for (const [fixture, assign] of [[a, 'a'], [b, 'b']]) {
    const result = await call('/auth/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoModular: fixture.code,
        identifier: `admin_${fixture.code}`, password: PASSWORD }) });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(result.body.data.user.tenantId, fixture.tenantId);
    assert.ok(result.body.data.accessToken);
    if (assign === 'a') {
      accessA = result.body.data.accessToken;
      refreshA = result.headers.get('set-cookie');
    } else accessB = result.body.data.accessToken;
  }
});

test('alta, fallo SMTP, reintento y activación de uso único', async () => {
  const suffix = Date.now().toString().slice(-8);
  const username = `invite_${suffix}`;
  const created = await call('/users', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tipoDocumento: 'DNI', documento: suffix,
      nombres: 'Invitada', apellidoPaterno: 'Ficticia',
      email: `${username}@example.invalid`, username, rol: 'DOCENTE' }) });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const userId = created.body.data.userId;
  assert.ok(userId);
  assert.equal(smtp.messages.length, 0, 'el alta no envía correo automáticamente');
  const pendingLogin = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, identifier: username, password: PASSWORD }) });
  assert.equal(pendingLogin.status, 401);

  smtp.rejectOnce();
  const failed = await call(`/users/${userId}/invite`, { method: 'POST', headers: bearer(accessA) });
  assert.equal(failed.status, 503, JSON.stringify(failed.body));
  const stale = await admin.query(`SELECT count(*)::int AS n FROM enlaces_acceso
    WHERE tenant_id=$1 AND usuario_id=$2 AND proposito='ACTIVACION' AND usado_en IS NULL`,
  [a.tenantId, userId]);
  assert.equal(stale.rows[0].n, 0, 'el enlace no entregado queda invalidado');

  const sent = await call(`/users/${userId}/invite`, { method: 'POST', headers: bearer(accessA) });
  assert.equal(sent.status, 200, JSON.stringify(sent.body));
  assert.equal(smtp.messages.length, 1);
  const decodedMail = smtp.messages[0].replace(/=\n/g, '').replace(/=3D/gi, '=');
  const match = decodedMail.match(/https?:\/\/[^\s]+/);
  assert.ok(match, 'se capturó el enlace');
  const link = new URL(match[0]);
  const token = link.searchParams.get('token');
  assert.ok(token);
  const activation = await call('/auth/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD }) });
  assert.equal(activation.status, 200, JSON.stringify(activation.body));
  const reused = await call('/auth/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD }) });
  assert.equal(reused.status, 400);
  assert.equal(reused.body.error.code, 'INVALID_LINK');
  const activeLogin = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, identifier: username, password: PASSWORD }) });
  assert.equal(activeLogin.status, 200, JSON.stringify(activeLogin.body));
  accessDocente = activeLogin.body.data.accessToken;
  refreshDocente = activeLogin.headers.get('set-cookie');
});

test('RBAC denegado se registra en auditoría del tenant', async () => {
  const denied = await call('/users', { headers: bearer(accessDocente) });
  assert.equal(denied.status, 403, JSON.stringify(denied.body));
  assert.equal(denied.body.error.code, 'ACCESS_DENIED');
  const log = await admin.query(`SELECT tenant_id,accion FROM logs_auditoria
    WHERE tenant_id=$1 AND usuario_id=(SELECT id FROM usuarios WHERE tenant_id=$1 AND username LIKE 'invite_%')
      AND accion='ACCESS_DENIED' ORDER BY id DESC LIMIT 1`, [a.tenantId]);
  assert.equal(log.rows[0]?.tenant_id, a.tenantId);
});

test('refresh rota token, detecta reuso y revoca la familia', async () => {
  const original = refreshDocente.split(';')[0];
  const rotated = await call('/auth/refresh-token', { method: 'POST',
    headers: { Cookie: original } });
  assert.equal(rotated.status, 200, JSON.stringify(rotated.body));
  const nextCookie = rotated.headers.get('set-cookie').split(';')[0];
  assert.notEqual(nextCookie, original);
  const reuse = await call('/auth/refresh-token', { method: 'POST',
    headers: { Cookie: original } });
  assert.equal(reuse.status, 401, JSON.stringify(reuse.body));
  const family = await call('/auth/refresh-token', { method: 'POST',
    headers: { Cookie: nextCookie } });
  assert.equal(family.status, 401, JSON.stringify(family.body));
  const audit = await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='REFRESH_REUSE'`, [a.tenantId]);
  assert.ok(audit.rows[0].n >= 1);
});

test('rutas reales rechazan ausencia de sesión y tenant discordante', async () => {
  const invalid = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_FAILED');
  const missing = await call('/school/institution');
  assert.equal(missing.status, 401);
  assert.equal(missing.body.error.code, 'UNAUTHENTICATED');

  const mismatch = await call('/school/institution', {
    headers: bearer(accessA, { 'X-Tenant-ID': b.tenantId }),
  });
  assert.equal(mismatch.status, 403);
  assert.equal(mismatch.body.error.code, 'TENANT_MISMATCH');
  assert.ok(!Number.isNaN(Date.parse(mismatch.body.timestamp)));

  const own = await call('/school/institution', { headers: bearer(accessA) });
  assert.equal(own.status, 200, JSON.stringify(own.body));
  assert.equal(own.body.data.id, a.tenantId);
  const other = await call('/school/institution', { headers: bearer(accessB) });
  assert.equal(other.status, 200, JSON.stringify(other.body));
  assert.equal(other.body.data.id, b.tenantId);
});

test('un JWT firmado con tenant B y sesión A no atraviesa el aislamiento', async () => {
  const original = jwt.decode(accessA);
  assert.equal(original.tenant_id, a.tenantId);
  assert.equal(original.tenantId, undefined);
  const forged = jwt.sign({ tenant_id: b.tenantId, sid: original.sid,
    jti: original.jti, version: original.version }, process.env.JWT_SECRET,
  { subject: original.sub, expiresIn: '15m', issuer: 'sms-core',
    audience: 'sms-web', algorithm: 'HS256' });
  const response = await call('/school/institution', { headers: bearer(forged) });
  assert.equal(response.status, 401, JSON.stringify(response.body));
  assert.equal(response.body.error.code, 'UNAUTHENTICATED');
});

test('errores HTTP transversales conservan código, estado y timestamp', async () => {
  const missing = await call('/ruta-inexistente');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
  const invalidJson = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(invalidJson.status, 400);
  assert.equal(invalidJson.body.error.code, 'INVALID_JSON');
  const tooLarge = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filler: 'x'.repeat(11 * 1024 * 1024) }) });
  assert.equal(tooLarge.status, 413);
  assert.equal(tooLarge.body.error.code, 'BODY_TOO_LARGE');
  for (const result of [missing, invalidJson, tooLarge]) {
    assert.equal(result.body.success, false);
    assert.ok(!Number.isNaN(Date.parse(result.body.timestamp)));
  }
});

test('rutas de usuarios y auditoría no muestran datos de otro tenant', async () => {
  const users = await call('/users', { headers: bearer(accessA) });
  assert.equal(users.status, 200, JSON.stringify(users.body));
  assert.ok(!JSON.stringify(users.body.data).includes(`admin_${b.code}`));
  const logs = await call('/audit/logs', { headers: bearer(accessA) });
  assert.equal(logs.status, 200, JSON.stringify(logs.body));
  assert.ok(!JSON.stringify(logs.body.data).includes(b.userId));
});

test('intentos de acceso tienen límite por tenant sin enumerar cuentas', async () => {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const result = await call('/auth/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoModular: a.code,
        identifier: 'cuenta-inexistente', password: PASSWORD }) });
    assert.equal(result.status, attempt <= 5 ? 401 : 429);
    assert.equal(result.body.error.code, attempt <= 5 ? 'UNAUTHENTICATED' : 'RATE_LIMITED');
    assert.ok(!JSON.stringify(result.body).includes('cuenta-inexistente'));
  }
});

test('sms_runtime aplica RLS, falla sin contexto y limpia el contexto del pool', async () => {
  const role = await runtime.pool.query(
    `SELECT r.rolbypassrls, r.rolsuper,
      pg_has_role(current_user,'sms_app','member') AS is_member
     FROM pg_roles r WHERE r.rolname=current_user`);
  assert.deepEqual(role.rows[0], { rolbypassrls: false, rolsuper: false, is_member: true });
  const noContext = await runtime.pool.query('SELECT count(*)::int AS n FROM personas');
  assert.equal(noContext.rows[0].n, 0);
  const foreign = await runtime.withTenant(a.tenantId, a.userId, (client) =>
    client.query('SELECT id FROM personas WHERE tenant_id=$1', [b.tenantId]));
  assert.equal(foreign.rowCount, 0);
  await assert.rejects(() => runtime.withTenant(a.tenantId, a.userId, (client) =>
    client.query('INSERT INTO sedes(tenant_id,nombre) VALUES($1,$2)',
      [b.tenantId, 'Sede ajena'])), /row-level security|policy/i);

  // Use the *same* physical connection across transactions to detect leaked
  // SET LOCAL state after COMMIT, rollback and tenant switch.
  const client = await runtime.pool.connect();
  try {
    for (const [tenant, visible, hidden] of [[a,b.tenantId,a.tenantId], [b,a.tenantId,b.tenantId]]) {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
        [tenant.tenantId, tenant.userId]);
      const own = await client.query('SELECT id FROM instituciones WHERE id=$1', [hidden]);
      const other = await client.query('SELECT id FROM instituciones WHERE id=$1', [visible]);
      assert.equal(own.rowCount, 1);
      assert.equal(other.rowCount, 0);
      await client.query('COMMIT');
      const afterCommit = await client.query('SELECT count(*)::int AS n FROM personas');
      assert.equal(afterCommit.rows[0].n, 0);
    }
  } finally {
    client.release();
  }
});

test('Redis indisponible falla cerrado en petición protegida y refresh', async () => {
  await redisClient.quit();
  const protectedRoute = await call('/school/institution', { headers: bearer(accessA) });
  assert.equal(protectedRoute.status, 503);
  assert.equal(protectedRoute.body.error.code, 'AUTH_UNAVAILABLE');
  const refresh = await call('/auth/refresh-token', { method: 'POST',
    headers: { Cookie: refreshA.split(';')[0] } });
  assert.equal(refresh.status, 503);
  assert.equal(refresh.body.error.code, 'AUTH_UNAVAILABLE');
});
