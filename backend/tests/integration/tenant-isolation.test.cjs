const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { startCapture } = require('./smtp-capture.cjs');
const WebSocket = require('ws');
const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');
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
let guardianAccess;
let guardianPersonId;
let studentPersonId;

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
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.GUARDIAN_CONSENT_TEXT = 'Texto ficticio exclusivo de CI para probar la aceptación explícita del vínculo familiar. ' +
    'No representa un consentimiento institucional ni habilita datos de personas reales.';
  const { createApp } = require('../../dist/app');
  const database = require('../../dist/config/database');
  runtime = database;
  redisClient = require('../../dist/config/redis').redisClient;
  await database.assertRuntimeRole();
  await redisClient.connect();
  await require('../../dist/services/notifications.service').NotificationService.startPubsub();
  const suffix = Date.now().toString().slice(-6);
  a = await createInstitution(`1${suffix}`);
  b = await createInstitution(`2${suffix}`);
  const app = createApp();
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  require('../../dist/services/realtime.service').attachRealtime(server);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await require('../../dist/services/notifications.service').NotificationService.stopPubsub();
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
    assertContract('/auth/login', 'post', result);
    assert.equal(result.body.data.user.tenantId, fixture.tenantId);
    assert.ok(result.body.data.accessToken);
    if (assign === 'a') {
      accessA = result.body.data.accessToken;
      refreshA = result.headers.get('set-cookie');
    } else accessB = result.body.data.accessToken;
  }
});

test('S5: avisos A/B, correo verificado, preferencia obligatoria y reintento SMTP', async () => {
  const json = { 'Content-Type': 'application/json' };
  const reject = await call('/notifications/preferences/SEGURIDAD', { method:'PUT',
    headers:bearer(accessA,json),body:JSON.stringify({porCorreo:false}) });
  assert.equal(reject.status,409,JSON.stringify(reject.body));
  assert.equal(reject.body.error.code,'SECURITY_PREFERENCE_REQUIRED');
  const send=(token,userId,categoria,titulo,prioridad)=>call('/notifications',{method:'POST',
    headers:bearer(token,json),body:JSON.stringify({userId,categoria,titulo,
      mensaje:'Aviso ficticio de CI',prioridad})});
  const unverified=await send(accessA,a.userId,'SEGURIDAD','Solo bandeja sin verificar');
  assert.equal(unverified.status,201,JSON.stringify(unverified.body));
  assertContract('/notifications','post',unverified);
  const noVerifiedEmail=await admin.query('SELECT id FROM envios_correo WHERE notificacion_id=$1',
    [unverified.body.data.id]);
  assert.equal(noVerifiedEmail.rowCount,0);
  await admin.query('UPDATE usuarios SET email_verificado_en=now() WHERE id=$1',[a.userId]);
  const security=await send(accessA,a.userId,'SEGURIDAD','Seguridad ficticia A');
  assert.equal(security.status,201,JSON.stringify(security.body));
  const unread=await call('/notifications/unread-count',{headers:bearer(accessA)});
  assert.equal(unread.status,200,JSON.stringify(unread.body));
  assert.equal(unread.body.data.count,2);
  assertContract('/notifications/unread-count','get',unread);
  const marked=await call(`/notifications/${security.body.data.id}/read`,{
    method:'PATCH',headers:bearer(accessA)});
  assert.equal(marked.status,200,JSON.stringify(marked.body));
  assertContract('/notifications/{id}/read','patch',marked);
  const afterRead=await call('/notifications/unread-count',{headers:bearer(accessA)});
  assert.equal(afterRead.body.data.count,1);
  const cross=await send(accessB,a.userId,'SEGURIDAD','Cruce B');
  assert.equal(cross.status,409,JSON.stringify(cross.body));
  const inboxB=await call('/notifications',{headers:bearer(accessB)});
  assert.equal(inboxB.status,200);
  assertContract('/notifications','get',inboxB);
  assert.ok(!JSON.stringify(inboxB.body.data).includes('Seguridad ficticia A'));
  const pending=await admin.query(`SELECT id FROM envios_correo WHERE tenant_id=$1
    AND notificacion_id=$2`,[a.tenantId,security.body.data.id]);
  assert.equal(pending.rowCount,1);
  await admin.query(`UPDATE envios_correo SET proximo_intento_en=now()+interval '1 day'
    WHERE id<>$1 AND estado='PENDIENTE' AND proximo_intento_en<=now()`,[pending.rows[0].id]);
  const {NotificationService}=require('../../dist/services/notifications.service');
  smtp.rejectOnce();
  await NotificationService.processEmailQueue();
  const failed=await admin.query('SELECT estado,intentos FROM envios_correo WHERE id=$1',[pending.rows[0].id]);
  assert.equal(failed.rows[0].estado,'PENDIENTE');
  assert.equal(failed.rows[0].intentos,1);
  await admin.query("UPDATE envios_correo SET proximo_intento_en=now()-interval '1 second' WHERE id=$1",[pending.rows[0].id]);
  await NotificationService.processEmailQueue();
  const sent=await admin.query('SELECT estado,intentos FROM envios_correo WHERE id=$1',[pending.rows[0].id]);
  assert.equal(sent.rows[0].estado,'ENVIADO');
  assert.equal(sent.rows[0].intentos,2);
  assert.ok(smtp.messages.some(message=>message.includes('Seguridad ficticia A')));
  const optional=await call('/notifications/preferences/RECORDATORIO',{method:'PUT',
    headers:bearer(accessA,json),body:JSON.stringify({porCorreo:false})});
  assert.equal(optional.status,200,JSON.stringify(optional.body));
  assertContract('/notifications/preferences/{category}','put',optional);
  const noEmail=await send(accessA,a.userId,'RECORDATORIO','Solo bandeja A');
  assert.equal(noEmail.status,201,JSON.stringify(noEmail.body));
  const skipped=await admin.query('SELECT id FROM envios_correo WHERE notificacion_id=$1',[noEmail.body.data.id]);
  assert.equal(skipped.rowCount,0);
  const low1=await send(accessA,a.userId,'NOTAS','Resumen bajo uno','BAJA');
  const low2=await send(accessA,a.userId,'NOTAS','Resumen bajo dos','BAJA');
  assert.equal(low1.status,201,JSON.stringify(low1.body));
  assert.equal(low2.status,201,JSON.stringify(low2.body));
  const beforeDigest=smtp.messages.length;
  await NotificationService.processEmailQueue();
  assert.equal(smtp.messages.length,beforeDigest,'prioridad BAJA no envía correos individuales');
  await admin.query(`UPDATE notificaciones SET created_at=now()-interval '2 days'
    WHERE id=ANY($1::uuid[])`,[[low1.body.data.id,low2.body.data.id]]);
  await NotificationService.processDailyDigest();
  assert.equal(smtp.messages.length,beforeDigest+1);
  assert.ok(smtp.messages.at(-1).includes('Resumen bajo uno'));
  assert.ok(smtp.messages.at(-1).includes('Resumen bajo dos'));
  const digestSent=await admin.query(`SELECT estado FROM envios_correo
    WHERE notificacion_id=ANY($1::uuid[])`,[[low1.body.data.id,low2.body.data.id]]);
  assert.equal(digestSent.rowCount,2);
  assert.ok(digestSent.rows.every(row=>row.estado==='ENVIADO'));
});

test('S5: WebSocket entrega solo al tenant y cierra la sesión revocada', async () => {
  const openSocket=async(token)=>{
    const ws=new WebSocket(base.replace('http','ws')+'/api/v1/notifications/ws',
      ['bearer',token],{origin:'http://localhost:3000'});
    const events=[];
    ws.on('message',raw=>events.push(JSON.parse(raw.toString())));
    await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
    return {ws,events};
  };
  const aSocket=await openSocket(accessA);
  const bSocket=await openSocket(accessB);
  try{
    const event=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('WebSocket A no recibió el aviso')),2000);
      aSocket.ws.on('message',raw=>{
        const parsed=JSON.parse(raw.toString());
        if(parsed.type==='notification'){clearTimeout(timeout);resolve(parsed);}
      });
    });
    const notice=await call('/notifications',{method:'POST',
      headers:bearer(accessA,{'Content-Type':'application/json'}),
      body:JSON.stringify({userId:a.userId,categoria:'ASISTENCIA',
        titulo:'Evento WebSocket ficticio A',mensaje:'Solo A'})});
    assert.equal(notice.status,201,JSON.stringify(notice.body));
    assert.equal((await event).id,notice.body.data.id);
    await new Promise(resolve=>setTimeout(resolve,50));
    assert.ok(!bSocket.events.some(item=>item.type==='notification'));

    const login=await call('/auth/login',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({
        codigoModular:a.code,identifier:`admin_${a.code}`,password:PASSWORD})});
    assert.equal(login.status,200,JSON.stringify(login.body));
    const stale=await openSocket(login.body.data.accessToken);
    try{
      const closed=new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('WebSocket revocado permaneció abierto')),2000);
        stale.ws.once('close',code=>{clearTimeout(timeout);resolve(code);});
      });
      const logout=await call('/auth/logout',{method:'POST',
        headers:bearer(login.body.data.accessToken)});
      assert.equal(logout.status,200,JSON.stringify(logout.body));
      const trigger=await call('/notifications',{method:'POST',
        headers:bearer(accessA,{'Content-Type':'application/json'}),
        body:JSON.stringify({userId:a.userId,categoria:'ASISTENCIA',
          titulo:'Evento tras revocación',mensaje:'Solo sesión vigente'})});
      assert.equal(trigger.status,201,JSON.stringify(trigger.body));
      assert.equal(await closed,1008);
      assert.ok(!stale.events.some(item=>item.type==='notification'));
    }finally{stale.ws.terminate();}
  }finally{aSocket.ws.terminate();bSocket.ws.terminate();}
});

test('alta, fallo SMTP, reintento y activación de uso único', async () => {
  const beforeMessages = smtp.messages.length;
  const suffix = Date.now().toString().slice(-8);
  const username = `invite_${suffix}`;
  invitedUsername = username;
  const created = await call('/users', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tipoDocumento: 'DNI', documento: suffix,
      nombres: 'Invitada', apellidoPaterno: 'Ficticia',
      email: `${username}@example.invalid`, username, rol: 'DOCENTE' }) });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assertContract('/users', 'post', created);
  const userId = created.body.data.userId;
  invitedUserId = userId;
  assert.ok(userId);
  assert.equal(smtp.messages.length, beforeMessages, 'el alta no envía correo automáticamente');
  const pendingLogin = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, identifier: username, password: PASSWORD }) });
  assert.equal(pendingLogin.status, 401);

  smtp.rejectOnce();
  const failed = await call(`/users/${userId}/invite`, { method: 'POST', headers: bearer(accessA) });
  assert.equal(failed.status, 503, JSON.stringify(failed.body));
  assertContract('/users/{id}/invite', 'post', failed);
  const stale = await admin.query(`SELECT count(*)::int AS n FROM enlaces_acceso
    WHERE tenant_id=$1 AND usuario_id=$2 AND proposito='ACTIVACION' AND usado_en IS NULL`,
  [a.tenantId, userId]);
  assert.equal(stale.rows[0].n, 0, 'el enlace no entregado queda invalidado');

  const sent = await call(`/users/${userId}/invite`, { method: 'POST', headers: bearer(accessA) });
  assert.equal(sent.status, 200, JSON.stringify(sent.body));
  assertContract('/users/{id}/invite', 'post', sent);
  assert.equal(smtp.messages.length, beforeMessages + 1);
  const decodedMail = smtp.messages.at(-1).replace(/=\n/g, '').replace(/=3D/gi, '=');
  const match = decodedMail.match(/https?:\/\/[^\s]+/);
  assert.ok(match, 'se capturó el enlace');
  const link = new URL(match[0]);
  const token = link.searchParams.get('token');
  assert.ok(token);
  const activation = await call('/auth/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD }) });
  assert.equal(activation.status, 200, JSON.stringify(activation.body));
  assertContract('/auth/activate', 'post', activation);
  const reused = await call('/auth/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD }) });
  assert.equal(reused.status, 400);
  assertContract('/auth/activate', 'post', reused);
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
  assertContract('/auth/forgot-password', 'post', sent);
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
  assertContract('/auth/reset-password', 'post', reset);
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
  assertContract('/users/import/preview', 'post', preview);
  assert.equal(preview.body.data.summary.nuevos, 2);
  const commit = await call('/users/import/commit', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rows }) });
  assert.equal(commit.status, 409, JSON.stringify(commit.body));
  assertContract('/users/import/commit', 'post', commit);
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
  guardianPersonId = guardianId;
  const studentId = student.body.data.personId;
  studentPersonId = studentId;
  const unavailable = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId, parentesco: 'MADRE',
      verificacion: 'Texto libre sin ficha' }) });
  assert.equal(unavailable.status, 409, JSON.stringify(unavailable.body));
  assert.equal(unavailable.body.error.code, 'FICHA_LINK_NOT_VERIFIED');
  const ficha = await admin.query(`INSERT INTO fichas_apoderados_verificados
    (tenant_id,fuente_ficha_id,estudiante_id,apoderado_documento_hash,parentesco,verificado_en)
    VALUES($1,gen_random_uuid(),$2,$3,'MADRE',now()) RETURNING id`,
    [a.tenantId,studentId,documentHash(suffix)]);
  await assert.rejects(runtime.withTenant(a.tenantId,a.userId,client=>client.query(
    `UPDATE fichas_apoderados_verificados SET revocado_en=now() WHERE id=$1`,
    [ficha.rows[0].id])),/permission denied/i);
  const foreign = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessB, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId, parentesco: 'MADRE',
      verificacion: 'Verificación ficticia CI' }) });
  assert.equal(foreign.status, 409);
  assertContract('/guardians/links', 'post', foreign);
  const link = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId, parentesco: 'MADRE',
      verificacion: 'Verificación ficticia CI' }) });
  assert.equal(link.status, 201, JSON.stringify(link.body));
  assertContract('/guardians/links', 'post', link);
  const consent = await call('/guardians/consent');
  assert.equal(consent.status, 200);
  assertContract('/guardians/consent', 'get', consent);
  assert.equal(consent.body.data.version, 'ci-ficticio-1');
  const invite = await call('/guardians/invitations', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId, studentId }) });
  assert.equal(invite.status, 200, JSON.stringify(invite.body));
  assertContract('/guardians/invitations', 'post', invite);
  const decodedMail = smtp.messages.at(-1).replace(/=\n/g, '').replace(/=3D/gi, '=');
  const match = decodedMail.match(/https?:\/\/[^\s]+/);
  assert.ok(match);
  const token = new URL(match[0]).searchParams.get('token');
  const activation = await call('/guardians/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD,
      consentimiento: true, versionTexto: 'ci-ficticio-1' }) });
  assert.equal(activation.status, 200, JSON.stringify(activation.body));
  assertContract('/guardians/activate', 'post', activation);
  const repeat = await call('/guardians/activate', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code, token, password: PASSWORD,
      consentimiento: true, versionTexto: 'ci-ficticio-1' }) });
  assert.equal(repeat.status, 400);
  assertContract('/guardians/activate', 'post', repeat);
  const account = await admin.query('SELECT username FROM usuarios WHERE tenant_id=$1 AND persona_id=$2',
    [a.tenantId, guardianId]);
  const login = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigoModular: a.code,
      identifier: account.rows[0].username, password: PASSWORD }) });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  guardianAccess = login.body.data.accessToken;
  const students = await call('/guardians/students', {
    headers: bearer(login.body.data.accessToken) });
  assert.equal(students.status, 200, JSON.stringify(students.body));
  assertContract('/guardians/students', 'get', students);
  assert.ok(students.body.data.some((row) => row.id === studentId));
  await admin.query('UPDATE fichas_apoderados_verificados SET revocado_en=now() WHERE id=$1',
    [ficha.rows[0].id]);
  const sourceRevoked = await call('/guardians/students', {
    headers: bearer(login.body.data.accessToken) });
  assert.equal(sourceRevoked.status,200,JSON.stringify(sourceRevoked.body));
  assert.deepEqual(sourceRevoked.body.data,[]);
  await admin.query('UPDATE fichas_apoderados_verificados SET revocado_en=NULL WHERE id=$1',
    [ficha.rows[0].id]);
});

test('S5: revocar consentimiento y desvincular corta acceso del apoderado', async () => {
  const revoked = await call('/guardians/consent', { method: 'DELETE',
    headers: bearer(guardianAccess) });
  assert.equal(revoked.status, 200, JSON.stringify(revoked.body));
  assertContract('/guardians/consent', 'delete', revoked);
  const stale = await call('/guardians/students', { headers: bearer(guardianAccess) });
  assert.equal(stale.status, 401, JSON.stringify(stale.body));
  const guardianUser = await admin.query('SELECT username FROM usuarios WHERE persona_id=$1', [guardianPersonId]);
  const relogin = await call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      codigoModular: a.code, identifier: guardianUser.rows[0].username, password: PASSWORD }) });
  assert.equal(relogin.status, 200, JSON.stringify(relogin.body));
  const noConsent = await call('/guardians/students', { headers: bearer(relogin.body.data.accessToken) });
  assert.equal(noConsent.status, 200, JSON.stringify(noConsent.body));
  assert.deepEqual(noConsent.body.data, []);
  const foreign = await call(`/guardians/links/${guardianPersonId}/${studentPersonId}`, {
    method: 'DELETE', headers: bearer(accessB) });
  assert.equal(foreign.status, 404, JSON.stringify(foreign.body));
  const unlinked = await call(`/guardians/links/${guardianPersonId}/${studentPersonId}`, {
    method: 'DELETE', headers: bearer(accessA) });
  assert.equal(unlinked.status, 200, JSON.stringify(unlinked.body));
  assertContract('/guardians/links/{guardianId}/{studentId}', 'delete', unlinked);
  const invalidated = await call('/guardians/students', { headers: bearer(relogin.body.data.accessToken) });
  assert.equal(invalidated.status, 401, JSON.stringify(invalidated.body));
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
  assertContract('/school/institution', 'get', own);
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
  assertContract('/users', 'get', users);
  assert.ok(!JSON.stringify(users.body.data).includes(`admin_${b.code}`));
  const logs = await call('/audit/logs', { headers: bearer(accessA) });
  assert.equal(logs.status, 200, JSON.stringify(logs.body));
  assertContract('/audit/logs', 'get', logs);
  assert.ok(!JSON.stringify(logs.body.data).includes(b.userId));
  const page = await call('/audit/logs?limit=1', { headers: bearer(accessA) });
  assert.equal(page.status,200,JSON.stringify(page.body));
  assert.equal(page.body.data.logs.length,1);
  assert.ok(page.body.data.count>=page.body.data.logs.length);
  const noForeignUser = await call(`/audit/logs?usuarioId=${b.userId}`,
    { headers: bearer(accessA) });
  assert.equal(noForeignUser.status,200,JSON.stringify(noForeignUser.body));
  assert.equal(noForeignUser.body.data.count,0);
  const invitedDni=invitedUsername.split('_')[1];
  const byDni=await call(`/audit/logs?dni=${invitedDni}`,
    {headers:bearer(accessA)});
  assert.equal(byDni.status,200,JSON.stringify(byDni.body));
  assert.ok(byDni.body.data.count>=1);
  assert.ok(byDni.body.data.logs.every(row=>row.usuario_id===invitedUserId));
  const foreignDni=await call(`/audit/logs?dni=${invitedDni}`,
    {headers:bearer(accessB)});
  assert.equal(foreignDni.status,200,JSON.stringify(foreignDni.body));
  assert.equal(foreignDni.body.data.count,0);
  const sourceIp=await admin.query(`SELECT host(ip_origen) AS ip FROM logs_auditoria
    WHERE tenant_id=$1 AND usuario_id=$2 ORDER BY id DESC LIMIT 1`,
    [a.tenantId,invitedUserId]);
  const byIp=await call(`/audit/logs?ip=${encodeURIComponent(sourceIp.rows[0].ip)}`,
    {headers:bearer(accessA)});
  assert.equal(byIp.status,200,JSON.stringify(byIp.body));
  assert.ok(byIp.body.data.count>=1);
  const auditPayload=await admin.query(`SELECT payload_nuevo::text AS payload FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='READ_AUDIT_LOGS'
      AND payload_nuevo ? 'dniUltimos4' ORDER BY id DESC LIMIT 1`,
    [a.tenantId]);
  assert.ok(!auditPayload.rows[0].payload.includes(invitedDni));
  const auditRead=await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='READ_AUDIT_LOGS'`,[a.tenantId]);
  assert.ok(auditRead.rows[0].n>=5);
  const chain = await call('/audit/verify-chain', { headers: bearer(accessA) });
  assert.equal(chain.status, 200, JSON.stringify(chain.body));
  assertContract('/audit/verify-chain', 'get', chain);
  assert.equal(chain.body.data.valid, true);
});

test('S5: historial M8 y cadena Core comparten transacción y tenant', async () => {
  const bookId=require('node:crypto').randomUUID();
  const firstState={id:bookId,tenantId:a.tenantId,revision:1,grades:{}};
  const historyId=await runtime.withTenant(a.tenantId,a.userId,async(client)=>{
    await client.query(`INSERT INTO squad3.gradebooks
      (id,tenant_id,revision,state,created_by) VALUES($1,$2,1,$3,$4)`,
      [bookId,a.tenantId,JSON.stringify(firstState),a.userId]);
    const history=await client.query(`INSERT INTO squad3.grade_audit_history
      (tenant_id,book_id,action,after_state,created_by)
      VALUES($1,$2,'provision',$3,$4) RETURNING id`,
      [a.tenantId,bookId,JSON.stringify(firstState),a.userId]);
    return history.rows[0].id;
  });
  const linked=await admin.query(`SELECT usuario_id,registro_id FROM logs_auditoria
    WHERE tenant_id=$1 AND modulo='grades' AND accion='GRADE_HISTORY' AND registro_id=$2`,
    [a.tenantId,historyId]);
  assert.equal(linked.rowCount,1);
  assert.equal(linked.rows[0].usuario_id,a.userId);
  await assert.rejects(runtime.withTenant(a.tenantId,a.userId,client=>client.query(
    `INSERT INTO squad3.grade_audit_history
      (tenant_id,book_id,action,after_state,created_by)
      VALUES($1,$2,'provision',$3,$4)`,
    [a.tenantId,bookId,JSON.stringify(firstState),b.userId])),
  /autor del historial no coincide/i);
  const secondState={...firstState,revision:2,grades:{ficticia:'A'}};
  await assert.rejects(runtime.withTenant(a.tenantId,a.userId,async(client)=>{
    await client.query(`UPDATE squad3.gradebooks SET state=$1,revision=2
      WHERE tenant_id=$2 AND id=$3`,[JSON.stringify(secondState),a.tenantId,bookId]);
    await client.query(`INSERT INTO squad3.grade_audit_history
      (tenant_id,book_id,action,before_state,after_state,created_by)
      VALUES($1,$2,'batch',$3,$4,$5)`,
      [a.tenantId,bookId,JSON.stringify(firstState),JSON.stringify(secondState),a.userId]);
    throw new Error('rollback ficticio');
  }),/rollback ficticio/);
  const rolledBack=await admin.query(`SELECT revision FROM squad3.gradebooks WHERE id=$1`,[bookId]);
  assert.equal(rolledBack.rows[0].revision,1);
  const history=await admin.query(`SELECT count(*)::int AS n FROM squad3.grade_audit_history
    WHERE tenant_id=$1 AND book_id=$2`,[a.tenantId,bookId]);
  assert.equal(history.rows[0].n,1);
  const audit=await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND modulo='grades' AND accion='GRADE_HISTORY'
      AND payload_nuevo->>'bookId'=$2`,[a.tenantId,bookId]);
  assert.equal(audit.rows[0].n,1);
  const chain=await call('/audit/verify-chain',{headers:bearer(accessA)});
  assert.equal(chain.status,200,JSON.stringify(chain.body));
  assert.equal(chain.body.data.valid,true);
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

test('S4: reimportar la misma identidad no duplica persona ni cuenta', async () => {
  const suffix = Date.now().toString().slice(-8);
  const row = { tipoDocumento: 'DNI', documento: suffix, nombres: 'Importada',
    apellidoPaterno: 'Ficticia', email: `import-${suffix}@example.invalid`,
    username: `import_${suffix}`, rol: 'DOCENTE' };
  const commit = () => call('/users/import/commit', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rows: [row] }) });
  const first = await commit();
  const second = await commit();
  assert.equal(first.status, 200, JSON.stringify(first.body));
  assert.equal(second.status, 200, JSON.stringify(second.body));
  assert.equal(first.body.data.nuevos, 1);
  assert.equal(second.body.data.sinCambios, 1);
  assert.equal(first.body.data.registros[0].personId, second.body.data.registros[0].personId);
  assert.equal(first.body.data.registros[0].userId, second.body.data.registros[0].userId);
  const count = await admin.query(`SELECT count(*)::int AS n FROM personas
    WHERE tenant_id=$1 AND documento_hash=$2`, [a.tenantId, documentHash(suffix)]);
  assert.equal(count.rows[0].n, 1);
  const state = await admin.query('SELECT estado FROM usuarios WHERE id=$1', [first.body.data.registros[0].userId]);
  assert.equal(state.rows[0].estado, 'PENDIENTE_CAMBIO_CLAVE');
});

test('S4: reasignar roles con motivo revoca sesión y no cruza tenants', async () => {
  // La prueba tiene su propio presupuesto de intentos; Redis es exclusivo de CI.
  await redisClient.flushDb();
  const signIn = () => call('/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      codigoModular: a.code, identifier: invitedUsername, password: 'NuevaClave2026' }) });
  const old = await signIn();
  assert.equal(old.status, 200, JSON.stringify(old.body));
  const foreign = await call(`/users/${invitedUserId}/roles`, { method: 'PUT',
    headers: bearer(accessB, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ roles: ['SECRETARIA'], motivo: 'Prueba de cambio de rol' }) });
  assert.equal(foreign.status, 404, JSON.stringify(foreign.body));
  const changed = await call(`/users/${invitedUserId}/roles`, { method: 'PUT',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ roles: ['SECRETARIA'], motivo: 'Prueba de cambio de rol' }) });
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  assertContract('/users/{id}/roles', 'put', changed);
  const stale = await call('/users/me', { headers: bearer(old.body.data.accessToken) });
  assert.equal(stale.status, 401, JSON.stringify(stale.body));
  const fresh = await signIn();
  assert.equal(fresh.status, 200, JSON.stringify(fresh.body));
  assert.deepEqual(fresh.body.data.user.roles, ['SECRETARIA']);
  const audit = await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='CHANGE_ROLES' AND usuario_id=$2`, [a.tenantId, a.userId]);
  assert.ok(audit.rows[0].n >= 1);
});

test('S4: directorio paginado, perfil propio y último administrador protegido', async () => {
  const page = await call('/users?limit=1&offset=0', { headers: bearer(accessA) });
  assert.equal(page.status, 200, JSON.stringify(page.body));
  assert.equal(page.body.data.users.length, 1);
  assert.ok(page.body.data.count >= 2, 'el total no debe ser el tamaño de la página');
  assert.ok(!JSON.stringify(page.body.data).includes(`admin_${b.code}`));

  const profile = await call('/users/me', { headers: bearer(accessA) });
  assert.equal(profile.status, 200, JSON.stringify(profile.body));
  assertContract('/users/me', 'get', profile);
  assert.equal(profile.body.data.username, `admin_${a.code}`);
  const updated = await call('/users/me', { method: 'PATCH',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ telefono: '999000111' }) });
  assert.equal(updated.status, 200, JSON.stringify(updated.body));
  assertContract('/users/me', 'patch', updated);
  const refreshed = await call('/users/me', { headers: bearer(accessA) });
  assert.equal(refreshed.body.data.telefono, '999000111');
  const other = await call('/users/me', { headers: bearer(accessB) });
  assert.notEqual(other.body.data.telefono, '999000111');

  const edited = await call(`/users/${invitedUserId}`, { method: 'PATCH',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ nombres: 'Invitada Editada', telefono: '999222333' }) });
  assert.equal(edited.status, 200, JSON.stringify(edited.body));
  assertContract('/users/{id}', 'patch', edited);
  const found = await call('/users?search=Invitada%20Editada', { headers: bearer(accessA) });
  assert.equal(found.body.data.count, 1);
  assert.equal(found.body.data.users[0].telefono_enmascarado, '***2333');
  assert.ok(!JSON.stringify(found.body.data).includes('999222333'));
  const storedPhone = await admin.query(`SELECT p.telefono FROM usuarios u
    JOIN personas p ON p.id=u.persona_id WHERE u.id=$1`, [invitedUserId]);
  assert.equal(storedPhone.rows[0].telefono, '999222333');
  const nameOnly = await call(`/users/${invitedUserId}`, { method: 'PATCH',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ nombres: 'Invitada Final' }) });
  assert.equal(nameOnly.status, 200, JSON.stringify(nameOnly.body));
  const unchangedPhone = await admin.query(`SELECT p.telefono FROM usuarios u
    JOIN personas p ON p.id=u.persona_id WHERE u.id=$1`, [invitedUserId]);
  assert.equal(unchangedPhone.rows[0].telefono, '999222333');
  const foreignEdit = await call(`/users/${invitedUserId}`, { method: 'PATCH',
    headers: bearer(accessB, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ nombres: 'Acceso ajeno' }) });
  assert.equal(foreignEdit.status, 404, JSON.stringify(foreignEdit.body));

  const self = await call(`/users/${a.userId}/deactivate`, { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ motivo: 'Prueba de último administrador' }) });
  assert.equal(self.status, 409, JSON.stringify(self.body));
  const demote = await call(`/users/${a.userId}/roles`, { method: 'PUT',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ roles: ['DOCENTE'], motivo: 'Prueba de último administrador' }) });
  assert.equal(demote.status, 409, JSON.stringify(demote.body));
});

test('S4: año nuevo conserva cuentas, configuración aislada y D-16 bloquea escala numérica', async () => {
  const json = { 'Content-Type': 'application/json' };
  const institution = await call('/school/institution', { method: 'PATCH',
    headers: bearer(accessA, json), body: JSON.stringify({ membreteTexto: 'Plantel ficticio A',
      escudoUrl: 'https://example.invalid/escudo-a.png' }) });
  assert.equal(institution.status, 200, JSON.stringify(institution.body));
  assertContract('/school/institution', 'patch', institution);
  const ownInstitution = await call('/school/institution', { headers: bearer(accessA) });
  const foreignInstitution = await call('/school/institution', { headers: bearer(accessB) });
  assert.equal(ownInstitution.body.data.membrete_texto, 'Plantel ficticio A');
  assert.notEqual(foreignInstitution.body.data.membrete_texto, 'Plantel ficticio A');

  const site = await call('/school/sites', { method: 'POST', headers: bearer(accessA, json),
    body: JSON.stringify({ nombre: 'Sede ficticia A' }) });
  assert.equal(site.status, 201, JSON.stringify(site.body));
  assertContract('/school/sites', 'post', site);
  const siteId = site.body.data.id;
  const changedSite = await call(`/school/sites/${siteId}`, { method: 'PATCH',
    headers: bearer(accessA, json), body: JSON.stringify({ nombre: 'Sede A actualizada', activo: false }) });
  assert.equal(changedSite.status, 200, JSON.stringify(changedSite.body));
  assertContract('/school/sites/{id}', 'patch', changedSite);
  assert.equal(changedSite.body.data.activo, false);
  const beforeForeignAudit = await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='UPDATE_SITE'`, [b.tenantId]);
  const foreignSite = await call(`/school/sites/${siteId}`, { method: 'PATCH',
    headers: bearer(accessB, json), body: JSON.stringify({ activo: true }) });
  assert.equal(foreignSite.status, 404, JSON.stringify(foreignSite.body));
  assertContract('/school/sites/{id}', 'patch', foreignSite);
  const afterForeignAudit = await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
    WHERE tenant_id=$1 AND accion='UPDATE_SITE'`, [b.tenantId]);
  assert.equal(afterForeignAudit.rows[0].n, beforeForeignAudit.rows[0].n);

  const createYear = (token) => call('/school/years', { method: 'POST',
    headers: bearer(token, json), body: JSON.stringify({ anio: 2027,
      fechaInicio: '2027-03-01', fechaFin: '2027-12-15' }) });
  const yearA = await createYear(accessA);
  const yearB = await createYear(accessB);
  assert.equal(yearA.status, 201, JSON.stringify(yearA.body));
  assert.equal(yearB.status, 201, JSON.stringify(yearB.body));
  assertContract('/school/years', 'post', yearA);
  const yearId = yearA.body.data.id;
  assert.notEqual(yearId, yearB.body.data.id);

  const period = await call(`/school/years/${yearId}/periods`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ tipo: 'BIMESTRE', numero: 1,
      fechaInicio: '2027-03-01', fechaFin: '2027-05-01', fechaLimiteNotas: '2027-05-05T00:00:00.000Z' }) });
  assert.equal(period.status, 201, JSON.stringify(period.body));
  assertContract('/school/years/{id}/periods', 'post', period);
  const duplicatePeriod = await call(`/school/years/${yearId}/periods`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ tipo: 'BIMESTRE', numero: 2,
      fechaInicio: '2027-04-01', fechaFin: '2027-06-01', fechaLimiteNotas: '2027-06-05T00:00:00.000Z' }) });
  assert.equal(duplicatePeriod.status, 409, JSON.stringify(duplicatePeriod.body));
  const foreignPeriods = await call(`/school/years/${yearId}/periods`, { headers: bearer(accessB) });
  assert.equal(foreignPeriods.status, 200);
  assert.deepEqual(foreignPeriods.body.data, []);
  assertContract('/school/years/{id}/periods', 'get', foreignPeriods);

  const section = await call(`/school/years/${yearId}/sections`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ nivel: 'PRIMARIA', grado: 1,
      seccion: 'A', aforoMaximo: 35 }) });
  assert.equal(section.status, 201, JSON.stringify(section.body));
  assertContract('/school/years/{id}/sections', 'post', section);
  const duplicateSection = await call(`/school/years/${yearId}/sections`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ nivel: 'PRIMARIA', grado: 1,
      seccion: 'A', aforoMaximo: 35 }) });
  assert.equal(duplicateSection.status, 409, JSON.stringify(duplicateSection.body));
  const foreignSections = await call(`/school/years/${yearId}/sections`, { headers: bearer(accessB) });
  assert.equal(foreignSections.status, 200);
  assert.deepEqual(foreignSections.body.data, []);
  assertContract('/school/years/{id}/sections', 'get', foreignSections);

  const numeric = await call(`/school/years/${yearId}/scales`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ nivel: 'PRIMARIA',
      modalidad: 'DUAL_VIGESIMAL', rangos: [
        { nivel: 'AD', min: 18, max: 20, descripcion: 'Solo fixture de CI' },
        { nivel: 'A', min: 14, max: 17, descripcion: 'Solo fixture de CI' },
        { nivel: 'B', min: 11, max: 13, descripcion: 'Solo fixture de CI' },
        { nivel: 'C', min: 0, max: 10, descripcion: 'Solo fixture de CI' },
      ] }) });
  assert.equal(numeric.status, 201, JSON.stringify(numeric.body));
  assertContract('/school/years/{id}/scales', 'post', numeric);
  const blocked = await call(`/school/scales/${numeric.body.data.id}/approve`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ fuenteAprobacion: 'Referencia ficticia CI' }) });
  assert.equal(blocked.status, 409, JSON.stringify(blocked.body));
  assert.equal(blocked.body.error.code, 'CNEB_D16_PENDING');
  const stillDraft = await admin.query('SELECT estado FROM escalas_calificacion WHERE id=$1', [numeric.body.data.id]);
  assert.equal(stillDraft.rows[0].estado, 'BORRADOR');

  const literalDraft = () => call(`/school/years/${yearId}/scales`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ nivel: 'SECUNDARIA', modalidad: 'LITERAL',
      rangos: ['AD', 'A', 'B', 'C'].map((nivel) => ({ nivel, min: null, max: null,
        descripcion: `Descripción ficticia ${nivel}` })) }) });
  const approve = (id) => call(`/school/scales/${id}/approve`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ fuenteAprobacion: 'Acta ficticia CI 2027' }) });
  const firstLiteral = await literalDraft();
  assert.equal(firstLiteral.status, 201, JSON.stringify(firstLiteral.body));
  const firstApproved = await approve(firstLiteral.body.data.id);
  assert.equal(firstApproved.status, 200, JSON.stringify(firstApproved.body));
  assertContract('/school/scales/{id}/approve', 'post', firstApproved);
  const secondLiteral = await literalDraft();
  assert.equal(secondLiteral.status, 201, JSON.stringify(secondLiteral.body));
  const secondApproved = await approve(secondLiteral.body.data.id);
  assert.equal(secondApproved.status, 200, JSON.stringify(secondApproved.body));
  const versions = await admin.query('SELECT id,estado FROM escalas_calificacion WHERE id=ANY($1::uuid[])',
    [[firstLiteral.body.data.id, secondLiteral.body.data.id]]);
  assert.equal(versions.rows.find((row) => row.id === firstLiteral.body.data.id).estado, 'REEMPLAZADA');
  assert.equal(versions.rows.find((row) => row.id === secondLiteral.body.data.id).estado, 'VIGENTE');

  const active = await call(`/school/years/${yearId}/activate`, { method: 'POST', headers: bearer(accessA) });
  assert.equal(active.status, 200, JSON.stringify(active.body));
  assertContract('/school/years/{id}/activate', 'post', active);
  const account = await admin.query('SELECT id FROM usuarios WHERE id=$1 AND tenant_id=$2', [a.userId, a.tenantId]);
  assert.equal(account.rowCount, 1, 'activar 2027 no recrea ni elimina cuentas');
});

test('intentos de acceso tienen límite por tenant sin enumerar cuentas', async () => {
  await redisClient.flushDb();
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

test('logout revoca inmediatamente el access token', async () => {
  const logout = await call('/auth/logout', { method: 'POST', headers: bearer(accessB) });
  assert.equal(logout.status, 200, JSON.stringify(logout.body));
  assertContract('/auth/logout', 'post', logout);
  const revoked = await call('/school/institution', { headers: bearer(accessB) });
  assert.equal(revoked.status, 401);
  assert.equal(revoked.body.error.code, 'UNAUTHENTICATED');
});

test('S6-00: el claim heredado tenantId ya no abre sesión, ni solo ni junto al canónico', async () => {
  const original = jwt.decode(accessA);
  const sign = (payload) => jwt.sign({ sid: original.sid, jti: original.jti,
    version: original.version, ...payload }, process.env.JWT_SECRET,
  { subject: original.sub, expiresIn: '15m', issuer: 'sms-core', audience: 'sms-web', algorithm: 'HS256' });
  for (const payload of [{ tenantId: a.tenantId }, { tenant_id: a.tenantId, tenantId: a.tenantId }]) {
    const response = await call('/users/me', { headers: bearer(sign(payload)) });
    assert.equal(response.status, 401, JSON.stringify(response.body));
    assert.equal(response.body.error.code, 'UNAUTHENTICATED');
  }
  const canonical = await call('/users/me', { headers: bearer(accessA) });
  assert.equal(canonical.status, 200, JSON.stringify(canonical.body));
});

test('S6-06: matrículas concurrentes no superan el aforo de la sección', async () => {
  const ctx = (fn) => runtime.withTenant(a.tenantId, a.userId, fn);
  const { yearId, sectionId, students } = await ctx(async (client) => {
    let year = await client.query('SELECT id FROM anios_lectivos WHERE tenant_id=$1 AND activo', [a.tenantId]);
    if (!year.rowCount) {
      year = await client.query(`INSERT INTO anios_lectivos(tenant_id,anio,fecha_inicio,fecha_fin,activo)
        VALUES($1,2031,'2031-03-01','2031-12-20',true) RETURNING id`, [a.tenantId]);
    }
    const section = await client.query(`INSERT INTO grados_secciones
      (tenant_id,anio_lectivo_id,nivel,grado,seccion,aforo_maximo)
      VALUES($1,$2,'SECUNDARIA',5,'Z',1) RETURNING id`, [a.tenantId, year.rows[0].id]);
    const people = [];
    for (const name of ['Aforo Uno', 'Aforo Dos']) {
      people.push((await client.query(`INSERT INTO personas(tenant_id,tipo_documento,nombres,apellido_paterno)
        VALUES($1,'SIN_DOCUMENTO',$2,'Ficticio') RETURNING id`, [a.tenantId, name])).rows[0].id);
    }
    return { yearId: year.rows[0].id, sectionId: section.rows[0].id, students: people };
  });
  const enroll = (studentId, holdMs) => ctx(async (client) => {
    await client.query(`INSERT INTO matriculas(tenant_id,anio_lectivo_id,estudiante_id,seccion_id)
      VALUES($1,$2,$3,$4)`, [a.tenantId, yearId, studentId, sectionId]);
    // Mantiene abierta la primera transacción: sin el bloqueo de la sección, la segunda
    // contaría 0 matrículas confirmadas y también entraría.
    if (holdMs) await client.query('SELECT pg_sleep($1)', [holdMs / 1000]);
  });
  const first = enroll(students[0], 400);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const results = await Promise.allSettled([first, enroll(students[1], 0)]);
  assert.equal(results[0].status, 'fulfilled', String(results[0].reason));
  assert.equal(results[1].status, 'rejected');
  assert.match(String(results[1].reason?.message), /SECTION_FULL/);
  const count = await ctx((client) => client.query(
    'SELECT count(*)::int AS n FROM matriculas WHERE seccion_id=$1', [sectionId]));
  assert.equal(count.rows[0].n, 1);
});

test('S6-07: /health avisa si falta la partición de auditoría del mes siguiente', async () => {
  const month = (offset) => `(date_trunc('month', now() AT TIME ZONE 'UTC') + interval '${offset} month')::date`;
  await admin.query(`SELECT fn_crear_particion_auditoria(${month(0)}), fn_crear_particion_auditoria(${month(1)})`);
  const healthy = await call('/health');
  assert.equal(healthy.status, 200, JSON.stringify(healthy.body));
  assert.equal(healthy.body.services.auditPartitions, 'OK');
  assertContract('/health', 'get', healthy);

  const next = (await admin.query(
    `SELECT 'logs_auditoria_' || to_char(${month(1)}, 'YYYY_MM') AS name`)).rows[0].name;
  const rows = await admin.query(`SELECT count(*)::int AS n FROM ${next}`);
  assert.equal(rows.rows[0].n, 0, 'La partición futura debe estar vacía para retirarla en la prueba');
  await admin.query(`ALTER TABLE logs_auditoria DETACH PARTITION ${next}`);
  await admin.query(`DROP TABLE ${next}`);
  try {
    const warning = await call('/health');
    assert.equal(warning.status, 200, 'La partición futura ausente no saca la instancia de servicio');
    assert.equal(warning.body.services.auditPartitions, 'MISSING_NEXT_MONTH');
    assertContract('/health', 'get', warning);
  } finally {
    await admin.query(`SELECT fn_crear_particion_auditoria(${month(1)})`);
  }
  const restored = await call('/health');
  assert.equal(restored.body.services.auditPartitions, 'OK');
});

test('S7: columnas DATE salen como YYYY-MM-DD y se comparan como día de calendario', async () => {
  const json = { 'Content-Type': 'application/json' };
  const created = await call('/school/years', { method: 'POST', headers: bearer(accessA, json),
    body: JSON.stringify({ anio: 2028, fechaInicio: '2028-03-01', fechaFin: '2028-12-15' }) });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const yearId = created.body.data.id;
  const years = await call('/school/years', { headers: bearer(accessA) });
  assert.equal(years.status, 200, JSON.stringify(years.body));
  assertContract('/school/years', 'get', years);
  const year = years.body.data.find((row) => row.id === yearId);
  assert.equal(year.fecha_inicio, '2028-03-01');
  assert.equal(year.fecha_fin, '2028-12-15');

  const period = await call(`/school/years/${yearId}/periods`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ tipo: 'BIMESTRE', numero: 1,
      fechaInicio: '2028-03-01', fechaFin: '2028-05-10', fechaLimiteNotas: '2028-05-15T05:00:00.000Z' }) });
  assert.equal(period.status, 201, JSON.stringify(period.body));
  const periods = await call(`/school/years/${yearId}/periods`, { headers: bearer(accessA) });
  assert.equal(periods.status, 200, JSON.stringify(periods.body));
  assertContract('/school/years/{id}/periods', 'get', periods);
  assert.equal(periods.body.data[0].fecha_inicio, '2028-03-01');
  assert.equal(periods.body.data[0].fecha_fin, '2028-05-10');
  assert.equal(periods.body.data[0].fecha_limite_notas, '2028-05-15T05:00:00.000Z', 'TIMESTAMPTZ sigue siendo instante');
  // Con DATE como Date, comparar el texto de la petición contra el año daba siempre false
  // y estas validaciones de rango no rechazaban nada.
  const outOfYearPeriod = await call(`/school/years/${yearId}/periods`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ tipo: 'BIMESTRE', numero: 4,
      fechaInicio: '2028-11-01', fechaFin: '2028-12-31', fechaLimiteNotas: '2029-01-05T05:00:00.000Z' }) });
  assert.equal(outOfYearPeriod.status, 409, JSON.stringify(outOfYearPeriod.body));

  const day = await call(`/school/years/${yearId}/non-school-days`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ fecha: '2028-07-28', tipo: 'FERIADO',
      motivo: 'Feriado ficticio CI' }) });
  assert.equal(day.status, 201, JSON.stringify(day.body));
  assertContract('/school/years/{id}/non-school-days', 'post', day);
  assert.equal(day.body.data.fecha, '2028-07-28');
  const days = await call(`/school/years/${yearId}/non-school-days`, { headers: bearer(accessA) });
  assert.equal(days.status, 200, JSON.stringify(days.body));
  assertContract('/school/years/{id}/non-school-days', 'get', days);
  assert.deepEqual(days.body.data.map((row) => row.fecha), ['2028-07-28']);
  const outOfYearDay = await call(`/school/years/${yearId}/non-school-days`, { method: 'POST',
    headers: bearer(accessA, json), body: JSON.stringify({ fecha: '2029-01-02', tipo: 'FERIADO',
      motivo: 'Fuera del año ficticio' }) });
  assert.equal(outOfYearDay.status, 409, JSON.stringify(outOfYearDay.body));
  assert.equal(outOfYearDay.body.error.code, 'DAY_CONFLICT');
});

test('S7: GET /users/roles responde 500 en vez de quedar colgada si falla la consulta', async () => {
  const original = runtime.withTenant;
  runtime.withTenant = (tenantId, userId, fn) => original(tenantId, userId, (client) => fn({
    query: (sql, ...rest) => /FROM roles r LEFT JOIN rol_permisos_core/.test(String(sql))
      ? Promise.reject(new Error('fallo simulado de CI')) : client.query(sql, ...rest),
  }));
  let failed;
  try {
    failed = await call('/users/roles', { headers: bearer(accessA), signal: AbortSignal.timeout(5000) });
  } finally {
    runtime.withTenant = original;
  }
  assert.equal(failed.status, 500, JSON.stringify(failed.body));
  assert.equal(failed.body.success, false);
  assert.equal(failed.body.error.code, 'ROLES_ERROR');
  assert.ok(!JSON.stringify(failed.body).includes('fallo simulado'), 'no expone el detalle técnico');
  assert.ok(failed.body.timestamp);
  const roles = await call('/users/roles', { headers: bearer(accessA) });
  assert.equal(roles.status, 200, JSON.stringify(roles.body));
  assertContract('/users/roles', 'get', roles);
});

test('S7: PUT y GET de preferencias de aviso devuelven la misma forma', async () => {
  const saved = await call('/notifications/preferences/AVISOS', { method: 'PUT',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }), body: JSON.stringify({ porCorreo: false }) });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assertContract('/notifications/preferences/{category}', 'put', saved);
  assert.deepEqual(saved.body.data, { categoria: 'AVISOS', por_correo: false });
  const listed = await call('/notifications/preferences', { headers: bearer(accessA) });
  assert.equal(listed.status, 200, JSON.stringify(listed.body));
  assertContract('/notifications/preferences', 'get', listed);
  const row = listed.body.data.find((item) => item.categoria === 'AVISOS');
  assert.deepEqual(Object.keys(row).sort(), Object.keys(saved.body.data).sort());
  assert.deepEqual(row, saved.body.data);
});

test('S7: vínculos familiares listan solo activos salvo estado=todos y DELETE repetido es 404', async () => {
  // El vínculo de la prueba S5 ya está revocado.
  const repeated = await call(`/guardians/links/${guardianPersonId}/${studentPersonId}`, {
    method: 'DELETE', headers: bearer(accessA) });
  assert.equal(repeated.status, 404, JSON.stringify(repeated.body));
  assert.equal(repeated.body.error.code, 'LINK_NOT_FOUND');
  assertContract('/guardians/links/{guardianId}/{studentId}', 'delete', repeated);

  const active = await call('/guardians/links', { headers: bearer(accessA) });
  assert.equal(active.status, 200, JSON.stringify(active.body));
  assertContract('/guardians/links', 'get', active);
  assert.ok(active.body.data.every((row) => row.activo === true));
  assert.ok(!active.body.data.some((row) => row.apoderado_id === guardianPersonId));
  const history = await call('/guardians/links?estado=todos', { headers: bearer(accessA) });
  assert.equal(history.status, 200, JSON.stringify(history.body));
  assertContract('/guardians/links', 'get', history);
  const revoked = history.body.data.find((row) => row.apoderado_id === guardianPersonId);
  assert.equal(revoked?.activo, false);
  const invalid = await call('/guardians/links?estado=revocados', { headers: bearer(accessA) });
  assert.equal(invalid.status, 400, JSON.stringify(invalid.body));
  assertContract('/guardians/links', 'get', invalid);

  const relinked = await call('/guardians/links', { method: 'POST',
    headers: bearer(accessA, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ guardianId: guardianPersonId, studentId: studentPersonId, parentesco: 'MADRE' }) });
  assert.equal(relinked.status, 201, JSON.stringify(relinked.body));
  const again = await call('/guardians/links', { headers: bearer(accessA) });
  assert.equal(again.body.data.find((row) => row.apoderado_id === guardianPersonId)?.activo, true);
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

test('S5: retención elimina avisos mayores de 180 días y conserva los recientes', async () => {
  const old=await admin.query(`INSERT INTO notificaciones
    (tenant_id,usuario_id,created_by,categoria,titulo,mensaje,created_at)
    VALUES($1,$2,$2,'RECORDATORIO','Aviso vencido ficticio','Prueba',now()-interval '181 days')
    RETURNING id`,[a.tenantId,a.userId]);
  const recent=await admin.query(`INSERT INTO notificaciones
    (tenant_id,usuario_id,created_by,categoria,titulo,mensaje,created_at)
    VALUES($1,$2,$2,'RECORDATORIO','Aviso reciente ficticio','Prueba',now()-interval '179 days')
    RETURNING id`,[a.tenantId,a.userId]);
  await admin.query(`INSERT INTO envios_correo(tenant_id,notificacion_id,created_by)
    VALUES($1,$2,$3)`,[a.tenantId,old.rows[0].id,a.userId]);
  const script=resolve(__dirname,'../../../database/scripts/retain-notifications.mjs');
  execFileSync(process.execPath,[script],{env:{...process.env,
    DATABASE_URL:process.env.INTEGRATION_DATABASE_URL},stdio:'pipe'});
  const rows=await admin.query('SELECT id FROM notificaciones WHERE id=ANY($1::uuid[])',
    [[old.rows[0].id,recent.rows[0].id]]);
  assert.deepEqual(rows.rows.map(row=>row.id),[recent.rows[0].id]);
  const queue=await admin.query('SELECT id FROM envios_correo WHERE notificacion_id=$1',
    [old.rows[0].id]);
  assert.equal(queue.rowCount,0);
});
