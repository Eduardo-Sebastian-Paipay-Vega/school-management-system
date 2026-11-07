// S6-02 (hallazgo H2 de docs/core/PLAN_IMPLEMENTACION_S6_S9.md): toda consulta del
// plano de datos debe pasar por withTenant(), que fija app.tenant_id y app.user_id en
// una transacción. Esta guarda estática falla si aparece un acceso nuevo al pool, o una
// conexión propia, fuera de los usos revisados que se enumeran aquí.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const { join, relative, sep } = require('node:path');

const SRC = join(__dirname, '..', 'src');

// Usos revisados de pool.query/pool.connect fuera de withTenant(). Cada entrada fija la
// cantidad exacta: añadir uno exige revisarlo y actualizar esta lista.
const POOL_PERMITIDO = {
  // Define pool, withTenant(), assertRuntimeRole() y resolveInstitution() (antes del login).
  'config/database.ts': null,
  // SELECT NOW() y existencia de particiones por nombre: sin filas de ningún tenant.
  'routes/health.routes.ts': 2,
  // Workers de correo: fn_tenants_correo_pendiente() (SECURITY DEFINER) solo devuelve
  // identificadores de tenant; cada tenant se procesa luego dentro de withTenant().
  'services/notifications.service.ts': 2,
};
// Comandos operativos que usan DATABASE_URL del rol migrador, fuera de la API.
const CLIENTE_PROPIO_PERMITIDO = /^scripts\//;

function fuentes(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return fuentes(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

function sinComentarios(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

const archivos = fuentes(SRC).map((path) => ({
  rel: relative(SRC, path).split(sep).join('/'),
  code: sinComentarios(readFileSync(path, 'utf8')),
}));

test('pool.query y pool.connect solo aparecen en los usos revisados', () => {
  const hallazgos = [];
  for (const { rel, code } of archivos) {
    const usos = (code.match(/\bpool\s*\.\s*(query|connect)\s*[<(]/g) ?? []).length;
    if (!usos) continue;
    if (!(rel in POOL_PERMITIDO)) hallazgos.push(`${rel}: ${usos} uso(s) no revisado(s)`);
    else if (POOL_PERMITIDO[rel] !== null && POOL_PERMITIDO[rel] !== usos) {
      hallazgos.push(`${rel}: ${usos} uso(s); la lista revisada admite ${POOL_PERMITIDO[rel]}`);
    }
  }
  assert.deepEqual(hallazgos, [], 'Use withTenant() o revise y documente el uso en POOL_PERMITIDO.');
});

// Importar el pool (incluso con alias: `pool as db`) ya es un acceso fuera de withTenant().
const IMPORTA_POOL = /import\s*\{[^}]*\bpool\b[^}]*\}\s*from\s*['"][./]*config\/database['"]|require\(\s*['"][./]*config\/database['"]\s*\)\s*\.\s*pool\b|\{[^}]*\bpool\b[^}]*\}\s*=\s*require\(\s*['"][./]*config\/database['"]/;

test('solo los usos revisados importan el pool', () => {
  const hallazgos = archivos
    .filter(({ rel, code }) => !(rel in POOL_PERMITIDO) && IMPORTA_POOL.test(code))
    .map(({ rel }) => rel);
  assert.deepEqual(hallazgos, [], 'Use withTenant() o revise y documente el uso en POOL_PERMITIDO.');
});

test('ninguna ruta o servicio abre su propio Pool o Client de pg', () => {
  const hallazgos = archivos
    .filter(({ rel, code }) => rel !== 'config/database.ts' && /\bnew\s+Pool\s*\(/.test(code))
    .map(({ rel }) => `${rel}: new Pool`)
    .concat(archivos
      .filter(({ rel, code }) => !CLIENTE_PROPIO_PERMITIDO.test(rel) && /\bnew\s+Client\s*\(/.test(code))
      .map(({ rel }) => `${rel}: new Client`));
  assert.deepEqual(hallazgos, []);
});

test('la guarda detecta un acceso directo nuevo', () => {
  const simulado = sinComentarios("router.get('/x', async () => { await pool.query('SELECT 1'); });");
  assert.equal((simulado.match(/\bpool\s*\.\s*(query|connect)\s*[<(]/g) ?? []).length, 1);
  assert.equal(sinComentarios('// pool.query(fuera de uso)').match(/\bpool\s*\.\s*query/), null);
  assert.ok(IMPORTA_POOL.test("import { pool as db } from '../config/database';"));
  assert.ok(IMPORTA_POOL.test("import { withTenant, pool } from '../../config/database';"));
  assert.ok(IMPORTA_POOL.test("const { pool } = require('../config/database');"));
  assert.ok(!IMPORTA_POOL.test("import { withTenant } from '../config/database';"));
});
