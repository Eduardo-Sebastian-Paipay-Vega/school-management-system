const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Pool, Client } = require('pg');
const { randomUUID, randomBytes } = require('node:crypto');
const { startCapture } = require('./smtp-capture.cjs');

// Solo tenants/datos ficticios. El rol de operador no es el dueño ni sms_app.
test('S6: provisión A/B, invitación explícita, suspensión y reactivación', async () => {
  const admin=new Pool({connectionString:process.env.INTEGRATION_DATABASE_URL});
  const role=`op_s6_${randomBytes(4).toString('hex')}`;
  const password=`Test_${randomBytes(12).toString('hex')}`;
  const url=new URL(process.env.INTEGRATION_DATABASE_URL);
  url.username=role;url.password=password;
  let control;
  let operator;
  let smtp;
  let redis;
  let runtime;
  try {
    await admin.query(`CREATE ROLE ${role} LOGIN INHERIT PASSWORD '${password}'`);
    await admin.query(`GRANT sms_operator TO ${role}`);
    process.env.OPERATOR_DATABASE_URL=url.toString();
    process.env.OPERATOR_ID=role;
    smtp=await startCapture();
    process.env.SMTP_HOST='127.0.0.1';
    process.env.SMTP_PORT=String(smtp.port);
    process.env.SMTP_USER='capture';
    process.env.SMTP_PASSWORD='capture-only';
    process.env.SMTP_FROM='core@example.invalid';
    process.env.PUBLIC_APP_URL='http://localhost:3000';
    process.env.SMTP_TEST_PLAINTEXT='1';
    const {TenantControlService}=require('../../dist/services/tenant-control.service');
    const {AuthService}=require('../../dist/services/auth.service');
    runtime=require('../../dist/config/database');
    redis=require('../../dist/config/redis').redisClient;
    await runtime.assertRuntimeRole();
    await redis.connect();
    control=await TenantControlService.connect();
    operator=new Client({connectionString:url.toString()});
    await operator.connect();
    await assert.rejects(operator.query('SELECT id FROM personas LIMIT 1'),/permission denied/i);
    await assert.rejects(operator.query('SELECT id FROM logs_auditoria LIMIT 1'),/permission denied/i);
    const codeA=`6${Date.now().toString().slice(-6)}`;
    const codeB=`7${Date.now().toString().slice(-6)}`;
    const reason='Ensayo ficticio de provisión y aislamiento SaaS';
    const fixture=(code,dni)=>({requestId:randomUUID(),code,name:`Institución ficticia ${code}`,
      reason,firstAdmin:{firstName:'Prueba',lastName:'Operador',email:`admin-${code}@example.invalid`,dni}});
    const inputA=fixture(codeA,'80000001');
    const inputB=fixture(codeB,'80000002');
    const a=await control.provision(inputA);
    assert.equal(await control.provision(inputA),a);
    const b=await control.provision(inputB);
    assert.notEqual(a,b);
    assert.equal(smtp.messages.length,0,'provisión no envía invitación');
    const pending=await admin.query(`SELECT i.estado_tenant,u.estado,
      (SELECT count(*)::int FROM enlaces_acceso e WHERE e.tenant_id=i.id) AS links
      FROM instituciones i JOIN usuarios u ON u.tenant_id=i.id AND u.username='admin_'||i.codigo_modular
      WHERE i.id=$1`,[a]);
    assert.deepEqual([pending.rows[0].estado_tenant,pending.rows[0].estado,pending.rows[0].links],
      ['APROVISIONANDO','PENDIENTE_CAMBIO_CLAVE',0]);
    assert.equal(await AuthService.login(codeA,`admin_${codeA}`,'ClavePrueba2026','127.0.0.1','CI'),null);
    await assert.rejects(operator.query(
      `SELECT fn_operador_cambiar_estado($1,'ACTIVO','identidad_falsa',$2)`,[a,reason]),
    /cambio de estado inválido/i);
    await control.inviteAdmin(a,codeA,reason,inputA.firstAdmin);
    await control.inviteAdmin(b,codeB,reason,inputB.firstAdmin);
    assert.equal(smtp.messages.length,2);
    const tokenFrom=(message)=>{
      const body=message.replace(/=\r?\n/g,'').replace(/=3D/gi,'=');
      const found=/token=([A-Za-z0-9_-]+)/.exec(body);
      assert.ok(found,'correo de activación con token');
      return found[1];
    };
    assert.equal(await AuthService.consumeAccessLink(codeA,tokenFrom(smtp.messages[0]),
      'ClavePrueba2026','ACTIVACION','127.0.0.1'),true);
    assert.equal(await AuthService.consumeAccessLink(codeB,tokenFrom(smtp.messages[1]),
      'ClavePrueba2026','ACTIVACION','127.0.0.1'),true);
    const sessionA=await AuthService.login(codeA,`admin_${codeA}`,'ClavePrueba2026','127.0.0.1','CI');
    const sessionB=await AuthService.login(codeB,`admin_${codeB}`,'ClavePrueba2026','127.0.0.1','CI');
    assert.ok(sessionA&&sessionB);
    const claimsA=AuthService.accessClaims(sessionA.accessToken);
    const claimsB=AuthService.accessClaims(sessionB.accessToken);
    assert.ok(await AuthService.validateAccess(claimsA));
    assert.ok(await AuthService.validateAccess(claimsB));
    assert.equal(await control.suspend(a,reason),true);
    assert.equal(await control.suspend(a,reason),false);
    assert.equal(await AuthService.validateAccess(claimsA),null);
    assert.equal(await AuthService.refresh(sessionA.refreshToken,'127.0.0.1','CI'),null);
    assert.equal(await AuthService.login(codeA,`admin_${codeA}`,'ClavePrueba2026','127.0.0.1','CI'),null);
    assert.ok(await AuthService.validateAccess(claimsB));
    assert.equal(await control.reactivate(a,reason),true);
    assert.ok(await AuthService.login(codeA,`admin_${codeA}`,'ClavePrueba2026','127.0.0.1','CI'));
    assert.equal(await AuthService.validateAccess(claimsA),null,'sesión anterior permanece revocada');
    const operations=await admin.query(`SELECT accion,actor_operador FROM operaciones_tenant
      WHERE tenant_id=$1 ORDER BY registrado_en`,[a]);
    assert.ok(operations.rows.some(row=>row.accion==='SUSPENDIDO'));
    assert.ok(operations.rows.every(row=>row.actor_operador===role));
  } finally {
    if(control)await control.close();
    if(operator)await operator.end();
    if(redis?.isOpen)await redis.quit();
    if(runtime)await runtime.pool.end();
    if(smtp)await smtp.close();
    await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(()=>{});
    await admin.end();
  }
});
