import 'dotenv/config';
import { Client } from 'pg';
import { assertIdentityKeys, documentHash, encryptDocument, randomToken, tokenHash } from '../core/identity-crypto';
import { sendAccessLink } from '../services/mail.service';

async function main(){
  const url=process.env.DATABASE_URL;
  const code=process.env.BOOTSTRAP_INSTITUTION_CODE?.trim();
  const name=process.env.BOOTSTRAP_INSTITUTION_NAME?.trim();
  const first=process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim();
  const last=process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim();
  const email=process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const dni=process.env.BOOTSTRAP_ADMIN_DNI?.trim();
  if(!url||!code||!name||!first||!last||!email||!dni||!/^[0-9]{8}$/.test(dni)||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new Error('Configure DATABASE_URL, institución y nombre/correo/DNI del primer administrador.');
  assertIdentityKeys();
  const client=new Client({connectionString:url});
  await client.connect();
  let accessToken:string|undefined;
  try{
    await client.query('BEGIN');
    let institution=await client.query<{id:string}>(
      'SELECT id FROM instituciones WHERE codigo_modular=$1 FOR UPDATE',[code]);
    if(!institution.rowCount)institution=await client.query<{id:string}>(
      `INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo)
       VALUES($1,$2,'INICIAL, PRIMARIA Y SECUNDARIA') RETURNING id`,[code,name]);
    const tenantId=institution.rows[0].id;
    const system=await client.query<{id:string}>(
      "SELECT id FROM usuarios WHERE tenant_id=$1 AND username='sistema'",[tenantId]);
    if(!system.rowCount)throw new Error('Falta el usuario interno del plantel.');
    await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
      [tenantId,system.rows[0].id]);
    const existing=await client.query<{id:string;estado:string;email:string|null;is_admin:boolean}>(
      `SELECT u.id,u.estado,p.email,EXISTS(SELECT 1 FROM usuario_roles ur JOIN roles r ON r.id=ur.rol_id
        WHERE ur.usuario_id=u.id AND ur.activo AND r.codigo='SUPERADMIN') AS is_admin
       FROM usuarios u JOIN personas p ON p.id=u.persona_id
       WHERE u.tenant_id=$1 AND p.documento_hash=$2 FOR UPDATE`,[tenantId,documentHash(dni)]);
    let userId:string;
    if(existing.rowCount){
      userId=existing.rows[0].id;
      if(existing.rows[0].email?.toLowerCase()!==email||!existing.rows[0].is_admin)
        throw new Error('La persona ya existe pero no coincide con el administrador pendiente.');
      if(existing.rows[0].estado==='ACTIVO')throw new Error('El administrador ya está activo; no se emitió otra invitación.');
    }else{
      const person=await client.query<{id:string}>(
        `INSERT INTO personas(tenant_id,tipo_documento,documento_hash,documento_cifrado,
          documento_ultimos4,nombres,apellido_paterno,email)
         VALUES($1,'DNI',$2,$3,$4,$5,$6,$7) RETURNING id`,
        [tenantId,documentHash(dni),encryptDocument(dni),dni.slice(-4),first,last,email]);
      const user=await client.query<{id:string}>(
        `INSERT INTO usuarios(tenant_id,persona_id,username,password_hash,estado)
         VALUES($1,$2,$3,crypt(gen_random_uuid()::text,gen_salt('bf',12)),'PENDIENTE_CAMBIO_CLAVE') RETURNING id`,
        [tenantId,person.rows[0].id,`admin_${code}`]);
      userId=user.rows[0].id;
    }
    await client.query(`INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
      SELECT $1,$2,r.id FROM roles r WHERE r.codigo='SUPERADMIN'
        AND NOT EXISTS(SELECT 1 FROM usuario_roles ur WHERE ur.usuario_id=$2 AND ur.rol_id=r.id AND ur.activo)`,
      [tenantId,userId]);
    await client.query(`UPDATE enlaces_acceso SET usado_en=now()
      WHERE tenant_id=$1 AND usuario_id=$2 AND proposito='ACTIVACION' AND usado_en IS NULL`,[tenantId,userId]);
    accessToken=randomToken();
    await client.query(`INSERT INTO enlaces_acceso(tenant_id,usuario_id,proposito,token_hash,expira_en)
      VALUES($1,$2,'ACTIVACION',$3,now()+interval '72 hours')`,[tenantId,userId,tokenHash(accessToken)]);
    await client.query(`SELECT fn_registrar_auditoria('core','BOOTSTRAP_ADMIN','127.0.0.1'::inet,
      'usuarios',$1,NULL,$2::jsonb)`,[userId,JSON.stringify({source:'bootstrap-admin'})]);
    await client.query('COMMIT');
  }catch(cause){await client.query('ROLLBACK');throw cause;}
  finally{await client.end();}
  await sendAccessLink(email,code,accessToken!,'ACTIVACION');
  process.stdout.write('Administrador pendiente creado o reutilizado; invitación enviada.\n');
}
main().catch((cause)=>{console.error(cause);process.exitCode=1;});
