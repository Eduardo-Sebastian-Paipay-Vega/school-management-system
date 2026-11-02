const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { startCapture } = require('./smtp-capture.cjs');
const { documentHash } = require('../../dist/core/identity-crypto');

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
let invitedUsername;
let invitedUserId;

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
  process.env.GUARDIAN_CONSENT_VERSION = 'ci-ficticio-1';
  process.env.GUARDIAN_CONSENT_TEXT = 'Texto ficticio exclusivo de CI para probar la aceptación explícita del vínculo familiar. ' +
    'No representa un consentimiento institucional ni habilita datos de personas reales.';
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
  invitedUsername = username;
  const created = await call('/users', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tipoDocumento: 'DNI', documento: suffix,
      nombres: 'Invitada', apellidoPaterno: 'Ficticia',
      email: `${username}@example.invalid`, username, rol: 'DOCENTE' }) });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const userId = created.body.data.userId;
  invitedUserId = userId;
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

test('recuperación no enumera, invalida fallo SMTP y consume enlace una vez', async () => {
  const request = (identifier) => call('/auth/forgot-password', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, identifier }) });
  const beforeMessages = smtp.messages.length;
  const absent = await request('no-existe@example.invalid');
  assert.equal(absent.status, 202);
  assert.equal(smtp.messages.length, beforeMessages);
  smtp.rejectOnce();
  const failed = await request(invitedUsername);
  assert.equal(failed.status, 202);
  assert.deepEqual(failed.body.data, absent.body.data);
  const stale = await admin.query(`SELECT count(*)::int AS n FROM enlaces_acceso
    WHERE tenant_id=$1 AND usuario_id=$2 AND proposito='RECUPERACION' AND usado_en IS NULL`,
  [a.tenantId, invitedUserId]);
  assert.equal(stale.rows[0].n, 0);
  const sent = await request(invitedUsername);
  assert.equal(sent.status, 202);
  assert.deepEqual(sent.body.data, absent.body.data);
  assert.equal(smtp.messages.length, beforeMessages + 1);
  const decodedMail = smtp.messages.at(-1).replace(/=\n/g, '').replace(/=3D/gi, '=');
  const match = decodedMail.match(/https?:\/\/[^\s]+/);
  assert.ok(match);
  const token = new URL(match[0]).searchParams.get('token');
  const otherTenant = await call('/auth/reset-password', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: b.code, token, password: 'NuevaClave2026' }) });
  assert.equal(otherTenant.status, 400);
  const reset = await call('/auth/reset-password', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: 'NuevaClave2026' }) });
  assert.equal(reset.status, 200, JSON.stringify(reset.body));
  const reuse = await call('/auth/reset-password', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: 'NuevaClave2026' }) });
  assert.equal(reuse.status, 400);
  assert.equal(reuse.body.error.code, 'INVALID_LINK');
});

test('importación revierte el lote ante conflicto de usuario', async () => {
  const prefix = Date.now().toString().slice(-7);
  const username = `batch_${prefix}`;
  const rows = ['1', '2'].map((end) => ({ tipoDocumento: 'DNI',
    documento: `${prefix}${end}`, nombres: 'Lote', apellidoPaterno: 'Ficticio',
    email: `batch-${prefix}-${end}@example.invalid`, username, rol: 'DOCENTE' }));
  const preview = await call('/users/import/preview', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rows }) });
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.equal(preview.body.data.summary.nuevos, 2);
  const commit = await call('/users/import/commit', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rows }) });
  assert.equal(commit.status, 409, JSON.stringify(commit.body));
  const left = await admin.query(`SELECT count(*)::int AS n FROM personas
    WHERE tenant_id=$1 AND documento_hash=ANY($2::char(64)[])`,
  [a.tenantId, rows.map((row) => documentHash(row.documento))]);
  assert.equal(left.rows[0].n, 0, 'la primera fila no debe sobrevivir al conflicto de la segunda');
});

test('apoderado ficticio requiere vínculo, invitación y consentimiento en su tenant', async () => {
  const suffix = Date.now().toString().slice(-8);
  const guardian = await call('/users', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tipoDocumento: 'DNI', documento: suffix,
      nombres: 'Apoderada', apellidoPaterno: 'Ficticia',
      email: `guardian-${suffix}@example.invalid` }) });
  assert.equal(guardian.status, 201, JSON.stringify(guardian.body));
  const student = await call('/users', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tipoDocumento: 'SIN_DOCUMENTO', codigoSiagie: `CI-${suffix}`,
      nombres: 'Escolar', apellidoPaterno: 'Ficticio' }) });
  assert.equal(student.status, 201, JSON.stringify(student.body));
  const guardianId = guardian.body.data.personId;
  const studentId = student.body.data.personId;
  const foreign = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessB, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId, parentesco: 'MADRE',
      verificacion: 'Verificación ficticia CI' }) });
  assert.equal(foreign.status, 409);
  const link = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId, parentesco: 'MADRE',
      verificacion: 'Verificación ficticia CI' }) });
  assert.equal(link.status, 201, JSON.stringify(link.body));
  const consent = await call('/guardians/consent');
  assert.equal(consent.status, 200);
  assert.equal(consent.body.data.version, 'ci-ficticio-1');
  const invite = await call('/guardians/invitations', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId }) });
  assert.equal(invite.status, 200, JSON.stringify(invite.body));
  const decodedMail = smtp.messages.at(-1).replace(/=\n/g, '').replace(/=3D/gi, '=');
  const match = decodedMail.match(/https?:\/\/[^\s]+/);
  assert.ok(match);
  const token = new URL(match[0]).searchParams.get('token');
  const activation = await call('/guardians/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD,
      consentimiento: true, versionTexto: 'ci-ficticio-1' }) });
  assert.equal(activation.status, 200, JSON.stringify(activation.body));
  const repeat = await call('/guardians/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD,
      consentimiento: true, versionTexto: 'ci-ficticio-1' }) });
  assert.equal(repeat.status, 400);
  const account = await admin.query('SELECT username FROM usuarios WHERE tenant_id=$1 AND persona_id=$2',
    [a.tenantId, guardianId]);
  const login = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code,
      identifier: account.rows[0].username, password: PASSWORD }) });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  const students = await call('/guardians/students', {
    headers: bearer(login.body.data.accessToken) });
  assert.equal(students.status, 200, JSON.stringify(students.body));
  assert.ok(students.body.data.some((row) => row.id === studentId));
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
  const recovery = await call('/auth/forgot-password', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, identifier: invitedUsername }) });
  assert.equal(recovery.status, 503);
  assert.equal(recovery.body.error.code, 'AUTH_UNAVAILABLE');
});
