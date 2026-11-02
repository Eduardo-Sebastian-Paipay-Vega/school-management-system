import { Client } from 'pg';
import { assertIdentityKeys, decryptDocument, documentHash } from '../core/identity-crypto';

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL de administración es obligatorio.');
  assertIdentityKeys();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const legacy = await client.query<{ present: boolean }>(`SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='usuarios' AND column_name='dni'
    ) AS present`);
    if (!legacy.rows[0].present) throw new Error('La identidad legada ya fue retirada.');
    let cursor = '00000000-0000-0000-0000-000000000000';
    let verified = 0;
    for (;;) {
      const batch = await client.query<{ id: string; dni: string | null; tipo_documento: string;
        documento_hash: string | null; documento_cifrado: Buffer | null;
        documento_ultimos4: string | null }>(
        `SELECT u.id,btrim(u.dni) AS dni,p.tipo_documento,p.documento_hash,
          p.documento_cifrado,p.documento_ultimos4
         FROM usuarios u JOIN personas p ON p.id=u.persona_id AND p.tenant_id=u.tenant_id
         WHERE u.id>$1 ORDER BY u.id LIMIT 500`, [cursor]);
      if (!batch.rowCount) break;
      for (const row of batch.rows) {
        cursor = row.id;
        if (row.dni === null) continue;
        if (!/^\d{8}$/.test(row.dni) || row.tipo_documento !== 'DNI' ||
            !row.documento_hash || !row.documento_cifrado ||
            row.documento_ultimos4?.trim() !== row.dni.slice(-4)) {
          throw new Error(`Identidad legada incompleta en usuario ${row.id}`);
        }
        try {
          if (decryptDocument(row.documento_cifrado) !== row.dni ||
              documentHash(row.dni) !== row.documento_hash.trim()) {
            throw new Error('Documento o índice ciego discordante');
          }
        } catch {
          throw new Error(`Identidad cifrada discordante en usuario ${row.id}`);
        }
        verified++;
      }
    }
    process.stdout.write(`Preflight de contract: ${verified} identidades legadas verificadas.\n`);
  } finally { await client.end(); }
}

main().catch((cause) => { console.error(cause); process.exitCode = 1; });
