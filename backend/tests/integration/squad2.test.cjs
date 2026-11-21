// Squad 2: corrección auditada de asistencia (RF-22/RF-66), matrícula (RF-16) y
// publicación de la filiación verificada (RF-15 -> RF-75) sobre PostgreSQL 16 y Redis 7.
// Autocontenida: crea sus propias instituciones ficticias A/B y su propio servidor.
// Nunca usar datos reales: todas las personas y documentos de este archivo son ficticios.
const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');
const { startCapture } = require('./smtp-capture.cjs');
const { documentHash } = require('../../dist/core/identity-crypto');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const openapi = require('./.openapi-bundle.json');
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

function assertContract(path, method, response) {
  const schema = openapi.paths[path][method].responses[String(response.status)]
    .content['application/json'].schema;
  const valid = ajv.compile(schema);
  assert.ok(valid(response.body), JSON.stringify(valid.errors));
}

const admin = new Pool({ connectionString: process.env.INTEGRATION_DATABASE_URL });
const PASSWORD = 'PruebaSegura2026';
const MOTIVO = 'Constancia médica ficticia presentada por el apoderado';
let runtime;
let redisClient;
let server;
let base;
let smtp;
let a;
let b;
const tokens = {};

async function inTenant(fixture, fn) {
  const client = await admin.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
      [fixture.tenantId, fixture.systemId]);
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

async function createAccount(fixture, role, username) {
  return inTenant(fixture, async (client) => {
    const person = await client.query(
      `INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno,email)
       VALUES($1,'SIN_DOCUMENTO','Cuenta',$2,$3) RETURNING id`,
      [fixture.tenantId, role, `${username}@example.invalid`]);
    const account = await client.query(
      `INSERT INTO usuarios(tenant_id,persona_id,username,password_hash,estado)
       VALUES($1,$2,$3,crypt($4,gen_salt('bf',12)),'ACTIVO') RETURNING id`,
      [fixture.tenantId, person.rows[0].id, username, PASSWORD]);
    await client.query(`INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
      SELECT $1,$2,id FROM roles WHERE codigo::text=$3`, [fixture.tenantId, account.rows[0].id, role]);
    return account.rows[0].id;
  });
}

async function createInstitution(code) {
  const result = await admin.query(
    `INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo)
     VALUES($1,$2,'PRIMARIA') RETURNING id`, [code, `Institución ficticia S2 ${code}`]);
  const tenantId = result.rows[0].id;
  const system = await admin.query("SELECT id FROM usuarios WHERE tenant_id=$1 AND username='sistema'", [tenantId]);
  const fixture = { tenantId, systemId: system.rows[0].id, code, users: {} };
  for (const role of ['SUPERADMIN', 'AUXILIAR', 'COORDINADOR_ACADEMICO', 'SECRETARIA', 'DIRECTIVO', 'DOCENTE']) {
    fixture.users[role] = await createAccount(fixture, role, `s2_${role.toLowerCase()}_${code}`);
  }
  return fixture;
}

async function call(path, init = {}) {
  const response = await fetch(`${base}/api/v1${path}`, init);
  const body = await response.json();
  return { status: response.status, body };
}

const json = (token, body, method = 'POST') => ({ method,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

async function login(fixture, username, password = PASSWORD) {
  const result = await call('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: fixture.code, identifier: username, password }) });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  return result.body.data.accessToken;
}

async function auditLogs(token, modulo) {
  const logs = await call(`/audit/logs?modulo=${modulo}&limit=100`, auth(token));
  assert.equal(logs.status, 200, JSON.stringify(logs.body));
  assertContract('/audit/logs', 'get', logs);
  return logs.body.data.logs;
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
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  // Mismo consentimiento ficticio de CI que tenant-isolation.test.cjs.
  process.env.GUARDIAN_CONSENT_VERSION = 'ci-ficticio-1';
  process.env.GUARDIAN_CONSENT_TEXT = 'Texto ficticio exclusivo de CI para probar la aceptación explícita del vínculo familiar. ' +
    'No representa un consentimiento institucional ni habilita datos de personas reales.';
  const { createApp } = require('../../dist/app');
  runtime = require('../../dist/config/database');
  redisClient = require('../../dist/config/redis').redisClient;
  await runtime.assertRuntimeRole();
  await redisClient.connect();
  const suffix = Date.now().toString().slice(-6);
  a = await createInstitution(`3${suffix}`);
  b = await createInstitution(`4${suffix}`);
  const app = createApp();
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
  for (const [key, fixture] of [['a', a], ['b', b]]) {
    tokens[key] = {};
    for (const role of Object.keys(fixture.users)) {
      tokens[key][role] = await login(fixture, `s2_${role.toLowerCase()}_${fixture.code}`);
    }
  }
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (redisClient?.isOpen) await redisClient.quit();
  if (runtime) await runtime.pool.end();
  await admin.end();
  if (smtp) await smtp.close();
});

// Año activo, secciones y personas ficticias del tenant.
async function academicFixture(fixture, aforos) {
  return inTenant(fixture, async (client) => {
    let year = await client.query('SELECT id FROM anios_lectivos WHERE tenant_id=$1 AND activo', [fixture.tenantId]);
    if (!year.rowCount) {
      year = await client.query(`INSERT INTO anios_lectivos(tenant_id,anio,fecha_inicio,fecha_fin,activo)
        VALUES($1,2032,'2032-03-01','2032-12-20',true) RETURNING id`, [fixture.tenantId]);
    }
    const sections = [];
    for (const [letra, aforo] of aforos) {
      sections.push((await client.query(`INSERT INTO grados_secciones
        (tenant_id,anio_lectivo_id,nivel,grado,seccion,aforo_maximo)
        VALUES($1,$2,'PRIMARIA',2,$3,$4) RETURNING id`, [fixture.tenantId, year.rows[0].id, letra, aforo])).rows[0].id);
    }
    const student = async (name) => (await client.query(`INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno)
      VALUES($1,'SIN_DOCUMENTO',$2,'Ficticio') RETURNING id`, [fixture.tenantId, name])).rows[0].id;
    return { yearId: year.rows[0].id, sections, student };
  });
}

test('S2 RF-22/RF-66: corrección auditada de asistencia, con permiso y aislada por tenant', async () => {
  const attendanceId = await inTenant(a, async (client) => {
    const year = await client.query(`INSERT INTO anios_lectivos(tenant_id,anio,fecha_inicio,fecha_fin,activo)
      VALUES($1,2032,'2032-03-01','2032-12-20',true) RETURNING id`, [a.tenantId]);
    const section = await client.query(`INSERT INTO grados_secciones(tenant_id,anio_lectivo_id,nivel,grado,seccion,aforo_maximo)
      VALUES($1,$2,'PRIMARIA',1,'A',30) RETURNING id`, [a.tenantId, year.rows[0].id]);
    const person = await client.query(`INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno)
      VALUES($1,'SIN_DOCUMENTO','Asistencia','Ficticia') RETURNING id`, [a.tenantId]);
    const enrollment = await client.query(`INSERT INTO matriculas(tenant_id,anio_lectivo_id,estudiante_id,seccion_id)
      VALUES($1,$2,$3,$4) RETURNING id`, [a.tenantId, year.rows[0].id, person.rows[0].id, section.rows[0].id]);
    return (await client.query(`INSERT INTO asistencias_alumnos(matricula_id,fecha,hora_registro,estado,origen)
      VALUES($1,'2032-04-05','08:20','FALTA_INJUSTIFICADA','AULA_DOCENTE') RETURNING id`,
    [enrollment.rows[0].id])).rows[0].id;
  });
  const path = `/attendance/${attendanceId}/correction`;
  const body = { estado: 'FALTA_JUSTIFICADA', justificada: true, motivo: MOTIVO };

  const unauthenticated = await call(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body) });
  assert.equal(unauthenticated.status, 401);
  assertContract('/attendance/{id}/correction', 'patch', unauthenticated);

  const forbidden = await call(path, json(tokens.a.DOCENTE, body, 'PATCH'));
  assert.equal(forbidden.status, 403, JSON.stringify(forbidden.body));
  assert.equal(forbidden.body.error.code, 'ACCESS_DENIED');
  assertContract('/attendance/{id}/correction', 'patch', forbidden);

  const invalid = await call(path, json(tokens.a.AUXILIAR, { ...body, estado: 'AUSENTE' }, 'PATCH'));
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_FAILED');
  assertContract('/attendance/{id}/correction', 'patch', invalid);

  const shortReason = await call(path, json(tokens.a.AUXILIAR, { ...body, motivo: '   corto   ' }, 'PATCH'));
  assert.equal(shortReason.status, 400, JSON.stringify(shortReason.body));
  assert.equal(shortReason.body.error.code, 'ATTENDANCE_REASON_REQUIRED');
  assertContract('/attendance/{id}/correction', 'patch', shortReason);

  const foreign = await call(path, json(tokens.b.SUPERADMIN, body, 'PATCH'));
  assert.equal(foreign.status, 404, JSON.stringify(foreign.body));
  assert.equal(foreign.body.error.code, 'ATTENDANCE_NOT_FOUND');
  assertContract('/attendance/{id}/correction', 'patch', foreign);

  const corrected = await call(path, json(tokens.a.AUXILIAR, body, 'PATCH'));
  assert.equal(corrected.status, 200, JSON.stringify(corrected.body));
  assertContract('/attendance/{id}/correction', 'patch', corrected);
  assert.deepEqual(corrected.body.data, { id: attendanceId, matriculaId: corrected.body.data.matriculaId,
    fecha: '2032-04-05', estado: 'FALTA_JUSTIFICADA', justificada: true });

  const repeated = await call(path, json(tokens.a.COORDINADOR_ACADEMICO, body, 'PATCH'));
  assert.equal(repeated.status, 409, JSON.stringify(repeated.body));
  assert.equal(repeated.body.error.code, 'ATTENDANCE_NO_CHANGE');
  assertContract('/attendance/{id}/correction', 'patch', repeated);

  const logs = await auditLogs(tokens.a.SUPERADMIN, 'attendance');
  const event = logs.find((log) => log.accion === 'ATTENDANCE_CORRECTED' && log.registro_id === attendanceId);
  assert.ok(event, 'El evento de corrección debe verse en /audit/logs');
  assert.equal(event.usuario_id, a.users.AUXILIAR);
  assert.equal(event.payload_anterior.estado, 'FALTA_INJUSTIFICADA');
  assert.equal(event.payload_nuevo.motivo, MOTIVO);
  const foreignLogs = await auditLogs(tokens.b.SUPERADMIN, 'attendance');
  assert.ok(!foreignLogs.some((log) => log.registro_id === attendanceId));
});

test('S2 RF-16: matrícula con aforo, una por año, auditada y sin cruzar tenants', async () => {
  const { sections, student } = await academicFixture(a, [['B', 1], ['C', 3]]);
  const [full, other] = sections;
  const first = await inTenant(a, () => student('Matrícula Uno'));
  const second = await inTenant(a, () => student('Matrícula Dos'));

  const forbidden = await call('/enrollments', json(tokens.a.DOCENTE, { estudianteId: first, seccionId: full }));
  assert.equal(forbidden.status, 403);
  assertContract('/enrollments', 'post', forbidden);

  const invalid = await call('/enrollments', json(tokens.a.SECRETARIA, { estudianteId: first, seccionId: full,
    estado: 'RETIRADO' }));
  assert.equal(invalid.status, 400);
  assertContract('/enrollments', 'post', invalid);

  const created = await call('/enrollments', json(tokens.a.SECRETARIA, { estudianteId: first, seccionId: full }));
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assertContract('/enrollments', 'post', created);
  assert.equal(created.body.data.estado, 'REGULAR');
  assert.equal(created.body.data.vacantesDisponibles, 0);

  const duplicate = await call('/enrollments', json(tokens.a.SECRETARIA, { estudianteId: first, seccionId: other }));
  assert.equal(duplicate.status, 409, JSON.stringify(duplicate.body));
  assert.equal(duplicate.body.error.code, 'ENROLLMENT_DUPLICATE');
  assertContract('/enrollments', 'post', duplicate);

  const sectionFull = await call('/enrollments', json(tokens.a.SECRETARIA, { estudianteId: second, seccionId: full,
    estado: 'EXTEMPORANEA' }));
  assert.equal(sectionFull.status, 409, JSON.stringify(sectionFull.body));
  assert.equal(sectionFull.body.error.code, 'SECTION_FULL');
  assertContract('/enrollments', 'post', sectionFull);
  assert.deepEqual(sectionFull.body.error.details.alternativas, [{ id: other, seccion: 'C', vacantesDisponibles: 3 }]);

  const foreignSection = await call('/enrollments', json(tokens.b.SUPERADMIN, { estudianteId: second, seccionId: other }));
  assert.equal(foreignSection.status, 404, JSON.stringify(foreignSection.body));
  assert.equal(foreignSection.body.error.code, 'SECTION_NOT_FOUND');
  assertContract('/enrollments', 'post', foreignSection);

  const foreignStudent = await inTenant(b, async (client) => (await client.query(
    `INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno)
     VALUES($1,'SIN_DOCUMENTO','Ajeno','Ficticio') RETURNING id`, [b.tenantId])).rows[0].id);
  const crossStudent = await call('/enrollments', json(tokens.a.SECRETARIA, { estudianteId: foreignStudent, seccionId: other }));
  assert.equal(crossStudent.status, 404, JSON.stringify(crossStudent.body));
  assert.equal(crossStudent.body.error.code, 'STUDENT_NOT_FOUND');
  assertContract('/enrollments', 'post', crossStudent);

  const count = await admin.query('SELECT count(*)::int AS n FROM matriculas WHERE estudiante_id = ANY($1::uuid[])',
    [[first, second, foreignStudent]]);
  assert.equal(count.rows[0].n, 1);
  const logs = await auditLogs(tokens.a.SUPERADMIN, 'academics');
  const event = logs.find((log) => log.accion === 'ENROLLMENT_CREATED' && log.registro_id === created.body.data.id);
  assert.ok(event);
  assert.equal(event.usuario_id, a.users.SECRETARIA);
});

test('S2 RF-15 -> RF-75: la filiación publicada habilita al apoderado y su revocación corta el acceso', async () => {
  const dni = `7${Date.now().toString().slice(-7)}`;
  const guardian = await call('/users', json(tokens.a.SUPERADMIN, { tipoDocumento: 'DNI', documento: dni,
    nombres: 'Apoderado', apellidoPaterno: 'Ficticio', email: `s2-guardian-${dni}@example.invalid` }));
  assert.equal(guardian.status, 201, JSON.stringify(guardian.body));
  const studentRes = await call('/users', json(tokens.a.SUPERADMIN, { tipoDocumento: 'SIN_DOCUMENTO',
    codigoSiagie: `S2-${dni}`, nombres: 'Escolar', apellidoPaterno: 'Ficticio' }));
  assert.equal(studentRes.status, 201, JSON.stringify(studentRes.body));
  const guardianId = guardian.body.data.personId;
  const studentId = studentRes.body.data.personId;
  const record = { fuenteFichaId: '6f1c9a52-2a3e-4c1b-9d55-6a0c3d1e2f40', estudianteId: studentId,
    apoderadoDni: dni, parentesco: 'PADRE' };
  const link = { guardianId, studentId, parentesco: 'PADRE' };

  const before = await call('/guardians/links', json(tokens.a.SUPERADMIN, link));
  assert.equal(before.status, 409);
  assert.equal(before.body.error.code, 'FICHA_LINK_NOT_VERIFIED');

  const forbidden = await call('/enrollments/guardian-records', json(tokens.a.DOCENTE, record));
  assert.equal(forbidden.status, 403);
  assertContract('/enrollments/guardian-records', 'post', forbidden);
  // Separación de funciones: SECRETARIA vincula (guardians:manage) pero no publica la fuente.
  const secretary = await call('/enrollments/guardian-records', json(tokens.a.SECRETARIA, record));
  assert.equal(secretary.status, 403);
  assertContract('/enrollments/guardian-records', 'post', secretary);
  const invalid = await call('/enrollments/guardian-records', json(tokens.a.DIRECTIVO, { ...record, apoderadoDni: '123' }));
  assert.equal(invalid.status, 400);
  assertContract('/enrollments/guardian-records', 'post', invalid);
  const foreign = await call('/enrollments/guardian-records', json(tokens.b.SUPERADMIN, record));
  assert.equal(foreign.status, 404, JSON.stringify(foreign.body));
  assert.equal(foreign.body.error.code, 'STUDENT_NOT_FOUND');
  assertContract('/enrollments/guardian-records', 'post', foreign);

  const published = await call('/enrollments/guardian-records', json(tokens.a.DIRECTIVO, record));
  assert.equal(published.status, 201, JSON.stringify(published.body));
  assertContract('/enrollments/guardian-records', 'post', published);
  assert.equal(published.body.data.revocadoEn, null);
  assert.ok(!JSON.stringify(published.body).includes(dni));
  assert.ok(!JSON.stringify(published.body).includes(documentHash(dni)));
  const stored = await admin.query('SELECT tenant_id,apoderado_documento_hash FROM fichas_apoderados_verificados WHERE id=$1',
    [published.body.data.id]);
  assert.equal(stored.rows[0].tenant_id, a.tenantId);
  assert.equal(stored.rows[0].apoderado_documento_hash, documentHash(dni));

  const duplicate = await call('/enrollments/guardian-records', json(tokens.a.DIRECTIVO, record));
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, 'GUARDIAN_RECORD_DUPLICATE');
  assertContract('/enrollments/guardian-records', 'post', duplicate);

  // Core acepta el vínculo, invita y activa al apoderado sobre la fila publicada.
  const linked = await call('/guardians/links', json(tokens.a.SUPERADMIN, link));
  assert.equal(linked.status, 201, JSON.stringify(linked.body));
  assertContract('/guardians/links', 'post', linked);
  const invite = await call('/guardians/invitations', json(tokens.a.SUPERADMIN, { guardianId, studentId }));
  assert.equal(invite.status, 200, JSON.stringify(invite.body));
  const mail = smtp.messages.at(-1).replace(/=\n/g, '').replace(/=3D/gi, '=');
  const token = new URL(mail.match(/https?:\/\/[^\s]+/)[0]).searchParams.get('token');
  const activation = await call('/guardians/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD, consentimiento: true,
      versionTexto: 'ci-ficticio-1' }) });
  assert.equal(activation.status, 200, JSON.stringify(activation.body));
  const account = await admin.query('SELECT username FROM usuarios WHERE tenant_id=$1 AND persona_id=$2', [a.tenantId, guardianId]);
  const guardianToken = await login(a, account.rows[0].username);
  const visible = await call('/guardians/students', auth(guardianToken));
  assert.equal(visible.status, 200, JSON.stringify(visible.body));
  assert.ok(visible.body.data.some((row) => row.id === studentId));

  const revokePath = `/enrollments/guardian-records/${published.body.data.id}/revoke`;
  const revokeForbidden = await call(revokePath, json(tokens.a.DOCENTE, { motivo: MOTIVO }));
  assert.equal(revokeForbidden.status, 403);
  assertContract('/enrollments/guardian-records/{id}/revoke', 'post', revokeForbidden);
  const revokeShort = await call(revokePath, json(tokens.a.DIRECTIVO, { motivo: 'corto' }));
  assert.equal(revokeShort.status, 400);
  assert.equal(revokeShort.body.error.code, 'GUARDIAN_RECORD_REASON_REQUIRED');
  assertContract('/enrollments/guardian-records/{id}/revoke', 'post', revokeShort);
  const revokeForeign = await call(revokePath, json(tokens.b.SUPERADMIN, { motivo: MOTIVO }));
  assert.equal(revokeForeign.status, 404);
  assert.equal(revokeForeign.body.error.code, 'GUARDIAN_RECORD_NOT_FOUND');
  assertContract('/enrollments/guardian-records/{id}/revoke', 'post', revokeForeign);

  const revoked = await call(revokePath, json(tokens.a.DIRECTIVO, { motivo: MOTIVO }));
  assert.equal(revoked.status, 200, JSON.stringify(revoked.body));
  assertContract('/enrollments/guardian-records/{id}/revoke', 'post', revoked);
  assert.equal(revoked.body.data.id, published.body.data.id);
  assert.ok(revoked.body.data.revocadoEn);
  const again = await call(revokePath, json(tokens.a.DIRECTIVO, { motivo: MOTIVO }));
  assert.equal(again.status, 409);
  assert.equal(again.body.error.code, 'GUARDIAN_RECORD_ALREADY_REVOKED');
  assertContract('/enrollments/guardian-records/{id}/revoke', 'post', again);

  const cut = await call('/guardians/students', auth(guardianToken));
  assert.equal(cut.status, 200, JSON.stringify(cut.body));
  assert.deepEqual(cut.body.data, []);
  const relink = await call('/guardians/links', json(tokens.a.SUPERADMIN, link));
  assert.equal(relink.status, 409);
  assert.equal(relink.body.error.code, 'FICHA_LINK_NOT_VERIFIED');

  const logs = await auditLogs(tokens.a.SUPERADMIN, 'academics');
  const events = logs.filter((log) => log.registro_id === published.body.data.id).map((log) => log.accion).sort();
  assert.deepEqual(events, ['GUARDIAN_RECORD_PUBLISHED', 'GUARDIAN_RECORD_REVOKED']);
  const serialized = JSON.stringify(logs);
  assert.ok(!serialized.includes(dni) && !serialized.includes(documentHash(dni)), 'La auditoría no guarda el DNI ni su hash');
});
