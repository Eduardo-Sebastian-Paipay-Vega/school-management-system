import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'openapi');
const inventory = JSON.parse(readFileSync(resolve(root, 'operation-inventory.json'), 'utf8'));
const spec = readFileSync(resolve(root, 'openapi.yaml'), 'utf8');
const refs = [...spec.matchAll(/^  (\/[^:]+):\r?\n    \$ref: '\.\/paths\/([^']+)'/gm)];
const actualPaths = refs.map(match => match[1]);
const expectedPaths = Object.keys(inventory);
if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
  throw new Error('El inventario de rutas difiere de la línea base de 46 paths.');
}
const operations = [];
for (const group of new Set(refs.map(match => match[2].split('.yaml')[0]))) {
  const file = readFileSync(resolve(root, 'paths', `${group}.yaml`), 'utf8');
  operations.push(...[...file.matchAll(/operationId:\s*([A-Za-z0-9_]+)/g)].map(match => match[1]));
}
const expected = Object.values(inventory).flat();
if (operations.length !== expected.length ||
    JSON.stringify([...operations].sort()) !== JSON.stringify([...expected].sort())) {
  throw new Error('El inventario de operationId difiere de la línea base de 57 operaciones.');
}
console.log(`${actualPaths.length} paths y ${operations.length} operaciones preservados.`);
