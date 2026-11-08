const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Pool}=require('pg');
const {execFileSync}=require('node:child_process');
const {resolve}=require('node:path');
const {documentHash,encryptDocument,decryptDocument,encryptionKeyVersion}=require('../../dist/core/identity-crypto');
const {NotificationService}=require('../../dist/services/notifications.service');
const runtime=require('../../dist/config/database');

const admin=new Pool({connectionString:process.env.INTEGRATION_DATABASE_URL});

function recipher(tenantId,apply=false){
  return execFileSync(process.execPath,[resolve(__dirname,'../../dist/scripts/recipher-identities.js'),
    ...(apply?['--apply']:[])],{cwd:resolve(__dirname,'../..'),encoding:'utf8',
    env:{...process.env,TENANT_ID:tenantId,ENCRYPTION_ACTIVE_KEY_ID:'2',
      ENCRYPTION_KEYS_JSON:JSON.stringify({2:'e'.repeat(64)})}});
}

test('S7: bitácora HTTP no registra DNI de filtros forenses',async()=>{
  const app=require('../../dist/app').createApp();
  const server=await new Promise(resolve=>{
    const listening=app.listen(0,()=>resolve(listening));
  });
  const captured=[];
  const original=process.stdout.write;
  process.stdout.write=function(chunk,...args){captured.push(String(chunk));return true;};
  try{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/v1/audit/logs?dni=12345678`);
    assert.equal(response.status,401);
    await response.arrayBuffer();
  }finally{
    process.stdout.write=original;
    await new Promise(resolve=>server.close(resolve));
  }
  assert.ok(captured.some(line=>line.includes('GET')&&line.includes('401')));
  assert.ok(!captured.join('').includes('12345678'));
});

test('S7: recifrado versionado conserva índice y no cambia otro tenant',async()=>{
  assert.ok(process.env.INTEGRATION_DATABASE_URL);
  const suffix=Date.now().toString().slice(-8);
  const a=await admin.query(`INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo)
    VALUES($1,'S7 ficticia A','PRIMARIA') RETURNING id`,[`7${suffix}`]);
  const b=await admin.query(`INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo)
    VALUES($1,'S7 ficticia B','PRIMARIA') RETURNING id`,[`8${suffix}`]);
  const tenantA=a.rows[0].id,tenantB=b.rows[0].id;
  try{
    const inserted=[];
    for(const [tenantId,document] of [[tenantA,'76543210'],[tenantB,'87654320']]){
      const system=await admin.query(`SELECT id FROM usuarios WHERE tenant_id=$1 AND username='sistema'`,[tenantId]);
      assert.equal(system.rowCount,1);
      const person=await admin.query(`INSERT INTO personas
        (tenant_id,tipo_documento,documento_hash,documento_cifrado,documento_ultimos4,
          nombres,apellido_paterno,created_by)
        VALUES($1,'DNI',$2,$3,$4,'Prueba','Ficticia',$5)
        RETURNING id,documento_cifrado`,[tenantId,documentHash(document),encryptDocument(document),
          document.slice(-4),system.rows[0].id]);
      inserted.push(person.rows[0]);
    }
    assert.match(recipher(tenantA),/Pendientes: 1/);
    const afterDryRun=await admin.query(`SELECT documento_cifrado FROM personas WHERE id=$1`,[inserted[0].id]);
    assert.deepEqual(afterDryRun.rows[0].documento_cifrado,inserted[0].documento_cifrado);
    assert.match(recipher(tenantA,true),/Recifradas: 1/);
    assert.match(recipher(tenantA,true),/Recifradas: 0/);
    const changed=await admin.query(`SELECT documento_cifrado,documento_hash FROM personas WHERE id=$1`,[inserted[0].id]);
    assert.equal(encryptionKeyVersion(changed.rows[0].documento_cifrado),2);
    process.env.ENCRYPTION_KEYS_JSON=JSON.stringify({2:'e'.repeat(64)});
    try{
      assert.equal(decryptDocument(changed.rows[0].documento_cifrado),'76543210');
      assert.equal(changed.rows[0].documento_hash.trim(),documentHash('76543210'));
    }finally{delete process.env.ENCRYPTION_KEYS_JSON;}
    const foreign=await admin.query(`SELECT documento_cifrado FROM personas WHERE id=$1`,[inserted[1].id]);
    assert.deepEqual(foreign.rows[0].documento_cifrado,inserted[1].documento_cifrado);
    const audit=await admin.query(`SELECT count(*)::int AS n FROM logs_auditoria
      WHERE tenant_id=$1 AND accion='RECIPHER_IDENTITIES'`,[tenantA]);
    assert.equal(audit.rows[0].n,1);
    const aEvents=[],bEvents=[];
    const unsubscribeA=NotificationService.subscribe(tenantA,'receiver',event=>aEvents.push(event));
    const unsubscribeB=NotificationService.subscribe(tenantB,'receiver',event=>bEvents.push(event));
    try{
      await admin.query(`UPDATE instituciones SET estado_tenant='SUSPENDIDO',activo=false WHERE id=$1`,[tenantA]);
      await NotificationService.publish(tenantA,'receiver',{type:'ficticio'});
      await NotificationService.publish(tenantB,'receiver',{type:'ficticio'});
      assert.equal(aEvents.length,0);
      assert.equal(bEvents.length,1);
    }finally{unsubscribeA();unsubscribeB();}
  }finally{await runtime.pool.end();await admin.end();}
});
