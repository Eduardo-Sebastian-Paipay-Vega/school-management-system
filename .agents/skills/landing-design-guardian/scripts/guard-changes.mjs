/**
 * Repo-local scope guard. Takes a before/after file-content snapshot and
 * rejects edits outside explicit public-marketing allowlists.
 * Usage: node .../guard-changes.mjs snapshot|verify
 * Does not revert, stage, commit or mutate source files.
 */
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dir = path.join(root, '.claude', 'landing-design');
const configPath = path.join(dir, 'scope.json');
const manifestPath = path.join(dir, 'change-baseline.json');
const action = process.argv[2];
const fail = msg => { console.error(`ERROR: ${msg}`); process.exit(1); };
if (!['snapshot', 'verify'].includes(action)) fail('Uso: guard-changes.mjs snapshot|verify');

let config;
try { config = JSON.parse(await fs.readFile(configPath, 'utf8')); }
catch (e) { fail(`No se pudo leer scope.json: ${e.message}`); }
const normalize = value => String(value).replaceAll('\\', '/').replace(/^\.\//, '').toLowerCase();
const validPrefixes = (config.allowedSourcePaths || []).map(normalize).filter(Boolean);
const protectedPrefixes = (config.protectedSourcePaths || []).map(normalize).filter(Boolean);
const documentationPath = '.claude/landing-design/';
if (validPrefixes.some(p => p === '/' || p === '.' || p === 'src/' || p === 'src' || p === 'app/' || p === 'app')) {
  fail('No se permiten allowlists demasiado amplias (src/, app/, raíz). Indica archivos o carpetas SOLO públicas.');
}
const git = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
if (git.error || git.status !== 0) fail('Se requiere ejecutar desde un repositorio Git con git disponible.');
const paths = [...new Set(git.stdout.toString('utf8').split('\0').filter(Boolean))].sort();
const hash = async (filepath) => {
  const abs = path.join(root, filepath);
  let stat;
  try { stat = await fs.lstat(abs); } catch { return null; }
  if (stat.isSymbolicLink()) {
    const target = await fs.readlink(abs);
    return createHash('sha256').update(`LINK:${target}`).digest('hex');
  }
  if (!stat.isFile()) return null;
  const h = createHash('sha256');
  for await (const chunk of createReadStream(abs)) h.update(chunk);
  return h.digest('hex');
};
const hashes = {};
for (const file of paths) {
  const rel = normalize(file);
  if (rel.startsWith(documentationPath)) continue; // reports/evidence are intentionally ephemeral
  const digest = await hash(file);
  if (digest !== null) hashes[rel] = digest;
}
if (action === 'snapshot') {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify({ timestamp: new Date().toISOString(), fileHashes: hashes }, null, 2) + '\n');
  console.log(`SNAPSHOT: ${Object.keys(hashes).length} archivos. Aún NO se han autorizado cambios: revisa allowedSourcePaths.`);
  process.exit(0);
}
if (!validPrefixes.length) fail('allowedSourcePaths está vacío. Configura el alcance público ANTES de aplicar cambios.');
let baseline;
try { baseline = JSON.parse(await fs.readFile(manifestPath, 'utf8')); }
catch { fail('Falta change-baseline.json. Ejecuta snapshot ANTES de modificar archivos.'); }
const oldHashes = baseline.fileHashes || {};
const keys = new Set([...Object.keys(oldHashes), ...Object.keys(hashes)]);
const changed = [...keys].filter(file => oldHashes[file] !== hashes[file]).sort();
const matches = (rel, prefix) => rel === prefix || rel.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`);
const forbidden = changed.filter(rel =>
  protectedPrefixes.some(p => matches(rel, p)) || !validPrefixes.some(p => matches(rel, p))
);
console.log(`CAMBIOS DESDE SNAPSHOT: ${changed.length}`);
for (const file of changed) {
  const ok = !forbidden.includes(file);
  console.log(`${ok ? 'ALLOW' : 'BLOCK'} ${file}`);
}
if (forbidden.length) {
  console.error(`RECHAZADO: ${forbidden.length} archivo(s) modificados fuera de alcance. No se realizó ningún revert automático.`);
  process.exitCode = 2;
} else {
  console.log('PASS: todos los cambios de archivos están dentro de la allowlist.');
  console.log('IMPORTANTE: revisar por separado impacto indirecto de CSS global e imports compartidos.');
}
