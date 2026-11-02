const assert = require('node:assert/strict');
const { Pool } = require('pg');
const { decryptDocument, documentHash } = require('../../dist/core/identity-crypto');
const runtime = require('../../dist/config/database');
const { AuditService } = require('../../dist/services/audit.service');

async function main() {
  assert.ok(process.env.INTEGRATION_DATABASE_URL);
  assert.ok(process.env.RESTORED_DATABASE_URL);
  const source = new Pool({ connectionString: process.env.INTEGRATION_DATABASE_URL });
  const restored = new Pool({ connectionString: process.env.RESTORED_DATABASE_URL });
  try {
    for (const table of ['instituciones', 'personas', 'usuarios', 'logs_auditoria']) {
      const sql = `SELECT count(*)::int AS n FROM ${table}`;
      const original = await source.query(sql);
      const copy = await restored.query(sql);
      assert.equal(copy.rows[0].n, original.rows[0].n, `${table}: conteo diferente`);
    }
    const people = await restored.query(`SELECT id,tenant_id,documento_hash,documento_cifrado
      FROM personas WHERE documento_cifrado IS NOT NULL ORDER BY id`);
    assert.ok(people.rowCount > 0, 'se necesita al menos una identidad cifrada ficticia');
    for (const person of people.rows) {
      const clear = decryptDocument(person.documento_cifrado);
      assert.equal(documentHash(clear), person.documento_hash.trim());
      const original = await source.query('SELECT documento_cifrado FROM personas WHERE id=$1', [person.id]);
      assert.deepEqual(person.documento_cifrado, original.rows[0].documento_cifrado);
    }
    await runtime.assertRuntimeRole();
    const noContext = await runtime.pool.query('SELECT count(*)::int AS n FROM personas');
    assert.equal(noContext.rows[0].n, 0, 'RLS debe fallar cerrado sin contexto');
    const tenants = await restored.query(`SELECT i.id, u.id AS system_id FROM instituciones i
      JOIN usuarios u ON u.tenant_id=i.id AND u.username='sistema' ORDER BY i.id`);
    assert.ok(tenants.rowCount >= 2, 'se requieren dos instituciones ficticias');
    for (const tenant of tenants.rows) {
      const scoped = await runtime.withTenant(tenant.id, tenant.system_id, async (client) => {
        const own = await client.query('SELECT count(*)::int AS n FROM personas WHERE tenant_id=$1', [tenant.id]);
        const foreign = await client.query('SELECT count(*)::int AS n FROM personas WHERE tenant_id<>$1', [tenant.id]);
        return { own: own.rows[0].n, foreign: foreign.rows[0].n };
      });
      assert.ok(scoped.own > 0);
      assert.equal(scoped.foreign, 0, 'RLS permite leer otro tenant');
      const chain = await AuditService.verifyChain(tenant.id, tenant.system_id);
      assert.equal(chain.valid, true, 'cadena de auditoría inválida');
    }
    process.stdout.write(`Restauración verificada: ${tenants.rowCount} tenants, ` +
      `${people.rowCount} identidades cifradas; RLS y auditoría íntegros.\n`);
  } finally {
    await source.end();
    await restored.end();
    await runtime.pool.end();
  }
}

main().catch((cause) => { console.error(cause); process.exitCode = 1; });
