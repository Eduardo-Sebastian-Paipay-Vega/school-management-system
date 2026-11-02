const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { Pool } = require('pg');
const { decryptDocument, documentHash } = require('../../dist/core/identity-crypto');

async function main() {
  const url = process.env.RESTORED_DATABASE_URL;
  assert.ok(url?.endsWith('/school_management_restore'), 'Contract solo se verifica en la copia');
  const pool = new Pool({ connectionString: url });
  try {
    const columns = await pool.query(`SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='usuarios'`);
    const present = new Set(columns.rows.map((row) => row.column_name));
    for (const legacy of ['dni', 'nombres', 'apellidos', 'email', 'telefono', 'foto_url', 'codigo_siagie']) {
      assert.ok(!present.has(legacy), `columna legada aún presente: ${legacy}`);
    }
    const people = await pool.query(`SELECT documento_hash,documento_cifrado FROM personas
      WHERE documento_cifrado IS NOT NULL`);
    assert.ok(people.rowCount >= 2);
    for (const person of people.rows) {
      assert.equal(documentHash(decryptDocument(person.documento_cifrado)), person.documento_hash.trim());
    }
    const backfill = spawnSync(process.execPath, ['dist/scripts/backfill-identities.js'], {
      cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8',
    });
    assert.equal(backfill.status, 0, backfill.stderr);
    assert.match(backfill.stdout, /ya retirada/);
    process.stdout.write('Contract verificado en copia: columnas retiradas e identidades descifrables.\n');
  } finally { await pool.end(); }
}

main().catch((cause) => { console.error(cause); process.exitCode = 1; });
