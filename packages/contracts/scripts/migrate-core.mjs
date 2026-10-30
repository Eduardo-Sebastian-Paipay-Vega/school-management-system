import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../openapi/', import.meta.url);
const source = readFileSync(new URL('core.yaml', root), 'utf8');
const lines = source.split(/\r?\n/);
const pathStart = lines.indexOf('paths:');
const componentStart = lines.indexOf('components:');
if (pathStart < 0 || componentStart < 0) throw new Error('core.yaml is not in the expected format');
const header = lines.slice(0, pathStart);
const pathLines = lines.slice(pathStart + 1, componentStart);
const componentLines = lines.slice(componentStart + 1);

function blocks(input, prefix) {
  const result = [];
  let current = null;
  for (const line of input) {
    const match = line.match(prefix);
    if (match) {
      if (current) result.push(current);
      current = { name: match[1], lines: [line] };
    } else if (current) current.lines.push(line);
  }
  if (current) result.push(current);
  return result;
}

const paths = blocks(pathLines, /^  (\/[^:]+):$/);
const groups = new Map();
const manifest = {};
for (const block of paths) {
  const group = block.name.split('/')[1];
  const operations = block.lines.flatMap(line => [...line.matchAll(/operationId:\s*([A-Za-z0-9_]+)/g)].map(x => x[1]));
  manifest[block.name] = operations;
  const content = block.lines.map(line => line.slice(2)).join('\n')
    .replaceAll(/#\/components\/(schemas|responses|parameters)\/([A-Za-z0-9_]+)/g,
      (_, kind, name) => `../components/${kind}.yaml#/${name}`);
  groups.set(group, [...(groups.get(group) ?? []), content]);
}

const sections = blocks(componentLines, /^  (parameters|securitySchemes|schemas|responses):$/);
const componentRefs = [];
for (const section of sections) {
  const items = blocks(section.lines.slice(1), /^    ([A-Za-z][A-Za-z0-9_]*):/);
  const content = items.map(item => item.lines.map(line => line.slice(4)).join('\n')).join('\n')
    .replaceAll(/#\/components\/(schemas|responses|parameters|securitySchemes)\/([A-Za-z0-9_]+)/g,
      (_, kind, name) => `./${kind}.yaml#/${name}`);
  const path = new URL(`components/${section.name}.yaml`, root);
  mkdirSync(dirname(fileURLToPath(path)), { recursive: true });
  writeFileSync(path, `${content.trimEnd()}\n`);
  componentRefs.push(`  ${section.name}:`, ...items.flatMap(item => [
    `    ${item.name}:`,
    `      $ref: './components/${section.name}.yaml#/${item.name}'`,
  ]));
}

for (const [group, items] of groups) {
  const path = new URL(`paths/${group}.yaml`, root);
  mkdirSync(dirname(fileURLToPath(path)), { recursive: true });
  writeFileSync(path, `${items.join('\n').trimEnd()}\n`);
}

const pathRefs = paths.flatMap(block => [
  `  ${block.name}:`,
  `    $ref: './paths/${block.name.split('/')[1]}.yaml#/${block.name.replaceAll('~', '~0').replaceAll('/', '~1')}'`,
]);
writeFileSync(new URL('openapi.yaml', root), `${header.join('\n')}\npaths:\n${pathRefs.join('\n')}\ncomponents:\n${componentRefs.join('\n')}\n`);
writeFileSync(new URL('operation-inventory.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${paths.length} paths, ${Object.values(manifest).flat().length} operations`);
