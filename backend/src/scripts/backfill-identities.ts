import { Client } from 'pg';
import { documentHash, encryptDocument } from '../core/identity-crypto';

async function main(){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL de administración es obligatorio.');
  const apply=process.argv.includes('--apply');
  const client=new Client({connectionString:process.env.DATABASE_URL});
  await client.connect();
  try{
    const tenants=await client.query<{id:string;codigo_modular:string}>(
      'SELECT id,codigo_modular FROM instituciones ORDER BY codigo_modular');
    for(const tenant of tenants.rows){
      await client.query('BEGIN');
      try{
        const system=await client.query<{id:string}>(
          "SELECT id FROM usuarios WHERE tenant_id=$1 AND username='sistema'",[tenant.id]);
        if(!system.rowCount)throw new Error(`Falta usuario sistema en ${tenant.codigo_modular}`);
        await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
          [tenant.id,system.rows[0].id]);
        const pending=await client.query<{id:string;dni:string}>(
          `SELECT p.id,btrim(u.dni) AS dni FROM usuarios u JOIN personas p
           ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
           WHERE u.tenant_id=$1 AND u.username<>'sistema' AND p.documento_hash IS NULL
             AND u.dni IS NOT NULL FOR UPDATE OF p`,[tenant.id]);
        for(const row of pending.rows){
          if(!/^\d{8}$/.test(row.dni))throw new Error(`DNI legado inválido en persona ${row.id}`);
          if(apply)await client.query(`UPDATE personas SET tipo_documento='DNI',documento_hash=$1,
            documento_cifrado=$2,documento_ultimos4=$3 WHERE id=$4`,
            [documentHash(row.dni),encryptDocument(row.dni),row.dni.slice(-4),row.id]);
        }
        if(apply&&pending.rowCount)await client.query(
          `SELECT fn_registrar_auditoria('core','BACKFILL_DOCUMENTS','127.0.0.1'::inet,
            'personas',NULL,NULL,$1::jsonb)`,[JSON.stringify({count:pending.rowCount})]);
        await client.query(apply?'COMMIT':'ROLLBACK');
        process.stdout.write(`${tenant.codigo_modular}: ${pending.rowCount} identidades ${apply?'cifradas':'por cifrar'}\n`);
      }catch(cause){await client.query('ROLLBACK');throw cause;}
    }
  }finally{await client.end();}
}
main().catch((cause)=>{console.error(cause);process.exitCode=1;});
