import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (!process.env.DATABASE_URL ||
    process.env.CORE_IDENTITY_CONTRACT_ACK !== 'backup-restore-backfill-verified') {
  throw new Error('Contract bloqueado: configure DATABASE_URL y confirme respaldo, restauración y backfill.');
}

const databaseDir = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/node-pg-migrate/bin/node-pg-migrate.js', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'up', '--migrations-dir', 'migrations/contract',
  '--migration-file-language', 'sql', '--no-check-order'],
{ cwd: databaseDir, env: process.env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
