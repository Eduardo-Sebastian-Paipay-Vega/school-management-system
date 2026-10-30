import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const temp = mkdtempSync(join(tmpdir(), 'sms-openapi-'));
try {
  const output = join(temp, 'generated.d.ts');
  execFileSync(process.execPath, [resolve(root, 'node_modules/openapi-typescript/bin/cli.js'),
    resolve(root, 'openapi/openapi.yaml'), '-o', output], { cwd: root, stdio: 'pipe' });
  const current = readFileSync(resolve(root, 'src/generated.d.ts'), 'utf8');
  const expected = readFileSync(output, 'utf8');
  if (current !== expected) throw new Error('Los tipos generados difieren de OpenAPI. Ejecute npm run generate.');
  console.log('Tipos generados reproducibles.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
