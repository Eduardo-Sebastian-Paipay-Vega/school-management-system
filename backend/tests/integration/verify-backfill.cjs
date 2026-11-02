const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { Pool } = require('pg');
const { decryptDocument, documentHash } = require('../../dist/core/identity-crypto');

async function main() {
  const url = process.env.RESTORED_DATABASE_URL;
  assert.ok(url, 'La prueba solo opera en una copia restaurada');
  assert.ok(url.endsWith('/school_management_restore'), 'Destino de backfill inesperado');
  const pool = new Pool({ connectionString: url });
  try {
    const tenants = await pool.query(`SELECT i.id,u.id AS system_id FROM instituciones i
      JOIN usuarios u ON u.tenant_id=i.id AND u.username='sistema' ORDER BY i.id LIMIT 2`);
    assert.equal(tenants.rowCount, 2);
    const seeded = [];
    for (const [index, tenant] of tenants.rows.entries()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.tenant_id',$1,true),set_config('app.user_id',$2,true)",
          [tenant.id, tenant.system_id]);
        const person = await client.query(`INSERT INTO personas
          (tenant_id,tipo_documento,nombres,apellido_paterno,email)
          VALUES($1,'SIN_DOCUMENTO','Legado','Ficticio',$2) RETURNING id`,
          [tenant.id, `legacy-${index}@example.invalid`]);
        const dni = index === 0 ? '12345678' : 'INVALIDO';
        const user = await client.query(`INSERT INTO usuarios
          (tenant_id,persona_id,username,dni,password_hash,estado)
          VALUES($1,$2,$3,$4,crypt(gen_random_uuid()::text,gen_salt('bf',12)),'INACTIVO') RETURNING id`,
          [tenant.id, person.rows[0].id, `legacy_s3_${index}`, dni]);
        await client.query('COMMIT');
        seeded.push({ tenantId: tenant.id, personId: person.rows[0].id, userId: user.rows[0].id });
      } catch (cause) {
        await client.query('ROLLBACK'); throw cause;
      } finally { client.release(); }
    }
    const run = (...args) => spawnSync(process.execPath,
      ['dist/scripts/backfill-identities.js', ...args],
      { cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8' });
    const invalidPreview = run();
    assert.notEqual(invalidPreview.status, 0, 'el conteo también debe detectar DNI inválido');
    const contractScript = path.resolve(__dirname, '../../../database/scripts/apply-identity-contract.mjs');
    const blockedContract = spawnSync(process.execPath, [contractScript], {
      cwd: path.resolve(__dirname, '../../../database'),
      env: { ...process.env, DATABASE_URL: url,
        CORE_IDENTITY_CONTRACT_ACK: 'backup-restore-backfill-verified' }, encoding: 'utf8',
    });
    assert.notEqual(blockedContract.status, 0, 'contract debe rechazar identidades pendientes');
    assert.match(blockedContract.stderr, /IDENTITY_BACKFILL_INCOMPLETE/);
    const invalid = run('--apply');
    assert.notEqual(invalid.status, 0, 'el DNI inválido debe detener el backfill');
    for (const row of seeded) {
      const rolledBack = await pool.query('SELECT documento_hash FROM personas WHERE id=$1', [row.personId]);
      assert.equal(rolledBack.rows[0].documento_hash, null, 'el lote completo debe revertirse');
    }
    await pool.query('UPDATE usuarios SET dni=$1 WHERE id=$2', ['87654321', seeded[1].userId]);
    const preview = run();
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(preview.stdout.split('\n').filter((line) => /: 1 identidades por cifrar$/.test(line)).length,
      2, 'ambos tenants deben figurar en el conteo');
    const applied = run('--apply');
    assert.equal(applied.status, 0, applied.stderr);
    const twice = run('--apply');
    assert.equal(twice.status, 0, twice.stderr);
    assert.ok(twice.stdout.split('\n').filter(Boolean).every((line) => /: 0 identidades cifradas$/.test(line)),
      'la segunda aplicación debe ser idempotente');
    for (const [index, row] of seeded.entries()) {
      const person = await pool.query(`SELECT tenant_id,tipo_documento,documento_hash,documento_cifrado
        FROM personas WHERE id=$1`, [row.personId]);
      assert.equal(person.rows[0].tenant_id, row.tenantId);
      assert.equal(person.rows[0].tipo_documento, 'DNI');
      const clear = decryptDocument(person.rows[0].documento_cifrado);
      assert.equal(clear, index === 0 ? '12345678' : '87654321');
      assert.equal(person.rows[0].documento_hash.trim(), documentHash(clear));
    }
    await pool.query('UPDATE personas SET documento_hash=$1 WHERE id=$2',
      [documentHash('99999999'), seeded[0].personId]);
    const preflight = spawnSync(process.execPath,
      ['dist/scripts/verify-identity-contract.js'],
      { cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8' });
    assert.notEqual(preflight.status, 0, 'el preflight debe detectar un índice ciego discordante');
    assert.match(preflight.stderr, /Identidad cifrada discordante/);
    await pool.query('UPDATE personas SET documento_hash=$1 WHERE id=$2',
      [documentHash('12345678'), seeded[0].personId]);
    process.stdout.write('Backfill verificado en copia: rollback por DNI inválido, cifrado e idempotencia.\n');
  } finally { await pool.end(); }
}

main().catch((cause) => { console.error(cause); process.exitCode = 1; });
