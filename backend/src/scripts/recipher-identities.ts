import { assertRuntimeRole, pool, withTenant } from '../config/database';
import { assertIdentityKeys, decryptDocument, documentHash,
  encryptDocument, encryptionKeyVersion } from '../core/identity-crypto';

type IdentityRow={id:string;documento_hash:string;documento_cifrado:Buffer};

async function main():Promise<void>{
  const tenantId=process.env.TENANT_ID;
  const version=Number(process.env.ENCRYPTION_ACTIVE_KEY_ID);
  const apply=process.argv.includes('--apply');
  if(process.argv.slice(2).some(arg=>arg!=='--apply'))throw new Error('Argumento no reconocido.');
  if(!tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId))
    throw new Error('TENANT_ID UUID es obligatorio.');
  if(!Number.isInteger(version) || version<2 || version>255)
    throw new Error('Configure ENCRYPTION_ACTIVE_KEY_ID con una versión nueva.');
  assertIdentityKeys();
  await assertRuntimeRole();
  const systemId=await withTenant(tenantId,'',async client=>{
    const found=await client.query<{id:string}>(`SELECT id FROM usuarios
      WHERE tenant_id=$1 AND username='sistema'`,[tenantId]);
    if(found.rowCount!==1)throw new Error('El tenant no tiene usuario de sistema.');
    return found.rows[0].id;
  });
  let cursor='00000000-0000-0000-0000-000000000000';
  let inspected=0;
  let changed=0;
  for(;;){
    const batch=await withTenant(tenantId,systemId,async client=>{
      const selected=await client.query<IdentityRow>(`SELECT id,documento_hash,documento_cifrado
        FROM personas WHERE tenant_id=$1 AND id>$2 AND documento_cifrado IS NOT NULL
        ORDER BY id LIMIT 100 FOR UPDATE`,[tenantId,cursor]);
      let updated=0;
      for(const row of selected.rows){
        const clear=decryptDocument(row.documento_cifrado);
        if(documentHash(clear)!==row.documento_hash.trim())
          throw new Error(`Índice ciego discordante en persona ${row.id}.`);
        if(encryptionKeyVersion(row.documento_cifrado)===version)continue;
        if(apply){
          const result=await client.query(`UPDATE personas SET documento_cifrado=$1
            WHERE tenant_id=$2 AND id=$3 AND documento_cifrado=$4`,
          [encryptDocument(clear),tenantId,row.id,row.documento_cifrado]);
          if(result.rowCount!==1)throw new Error(`Recifrado concurrente en persona ${row.id}.`);
        }
        updated++;
      }
      if(apply && updated){
        await client.query(`SELECT fn_registrar_auditoria($1,$2,$3::inet,$4,$5,$6::jsonb,$7::jsonb)`,
          ['core','RECIPHER_IDENTITIES','127.0.0.1','personas',null,null,
            JSON.stringify({count:updated,keyVersion:version})]);
      }
      return {count:selected.rows.length,lastId:selected.rows.at(-1)?.id,updated};
    });
    if(!batch.count)break;
    inspected+=batch.count;
    changed+=batch.updated;
    cursor=batch.lastId!;
  }
  process.stdout.write(`${apply?'Recifradas':'Pendientes'}: ${changed}; inspeccionadas: ${inspected}; tenant: ${tenantId}; versión: ${version}.\n`);
}

main().catch(cause=>{console.error(cause);process.exitCode=1;})
  .finally(async()=>{await pool.end();});
