// Genera el tema PrimeReact institucional a partir de Lara Light (PrimeReact 10).
// Los temas v10 traen los colores en hexadecimal, así que se reemplaza la paleta
// azul por los tokens de app/globals.css. Ejecutar tras actualizar primereact:
//   npm run theme:prime
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const source = require.resolve('primereact/resources/themes/lara-light-blue/theme.css');
const target = resolve(here, '../modules/shared/prime/theme/unsch-lara.css');

const replacements = [
  // Primario y estados hover/active
  [/#3b82f6/gi, 'var(--primary-colors-primary-brand)'],
  [/#2563eb/gi, 'var(--secondary-colors-primary-brand-dark)'],
  [/#1d4ed8/gi, 'var(--secondary-colors-primary-brand-dark)'],
  // Anillo de foco y fondo de elementos seleccionados
  [/#bfdbfe/gi, 'var(--prime-focus-ring)'],
  [/#eff6ff/gi, 'var(--prime-highlight-bg)'],
  [/rgba\(59, 130, 246, /g, 'rgba(80, 0, 0, '],
  // Tipografía del sitio en lugar de Inter (sus fuentes no se copian)
  [/@font-face\s*\{[^}]*\}\s*/g, ''],
  [
    /"Inter var", sans-serif/g,
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  ],
];

let css = readFileSync(source, 'utf8');
for (const [pattern, value] of replacements) css = css.replace(pattern, value);

const header = `/* Generado por scripts/generate-prime-theme.mjs desde primereact lara-light-blue. No editar a mano. */
:root {
  --prime-focus-ring: #e3c4c4;
  --prime-highlight-bg: #f7ebeb;
}
`;

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, header + css);
console.log(`Tema PrimeReact generado en ${target}`);
