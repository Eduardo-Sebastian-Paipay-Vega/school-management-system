/**
 * Read-only browser evidence collector for a LOCAL marketing landing.
 * Run from the repository root: node .claude/skills/landing-design-guardian/scripts/capture-landing.mjs
 * Requires project-local `playwright` and installed Chromium.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const configPath = path.join(root, '.claude', 'landing-design', 'scope.json');
const outputBase = path.join(root, '.claude', 'landing-design', 'evidence');

const fail = (message) => { console.error(`ERROR: ${message}`); process.exit(1); };
const validName = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 80) || 'home';

let config;
try {
  config = JSON.parse(await fs.readFile(configPath, 'utf8'));
} catch (error) {
  fail(`No se pudo leer scope.json: ${error.message}`);
}
const base = new URL(config.baseUrl || 'http://localhost:3000');
if (!['http:', 'https:'].includes(base.protocol)) fail('baseUrl debe ser HTTP o HTTPS.');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
  fail('Por seguridad esta captura acepta solo localhost. Inicia el servidor del repo y actualiza baseUrl.');
}
const excluded = config.excludedRoutes || [];
const routes = [...new Set([config.referenceRoute, ...(config.publicRoutes || [])])];
if (!routes.length || routes.some(r => typeof r !== 'string' || !r.startsWith('/') || r.startsWith('//'))) {
  fail('Las rutas deben ser paths locales que comiencen con /, sin // inicial.');
}
const forbidden = routes.filter(r => excluded.some(ex => r === ex || r.startsWith(`${ex}/`)));
if (forbidden.length) fail(`Rutas protegidas en alcance: ${forbidden.join(', ')}`);
if (routes.length > 24) fail('Limita publicRoutes a 24 páginas por ejecución.');
const viewports = config.viewports || [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
for (const vp of viewports) {
  if (!Number.isInteger(vp.width) || vp.width < 240 || vp.width > 4000 ||
      !Number.isInteger(vp.height) || vp.height < 240 || vp.height > 4000) {
    fail(`Viewport inválido: ${JSON.stringify(vp)}`);
  }
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  fail('Playwright no está disponible. Reutiliza o instala la dependencia en el proyecto; luego ejecuta npx playwright install chromium.');
}

await fs.mkdir(outputBase, { recursive: true });
const browser = await chromium.launch({ headless: true });
const manifest = { capturedAt: new Date().toISOString(), baseUrl: base.origin, routeCount: routes.length, viewports, results: [] };
try {
  for (const route of routes) {
    const url = new URL(route, base);
    if (url.origin !== base.origin) fail(`Ruta fuera del origen permitido: ${route}`);
    const pageKey = validName(route === '/' ? 'home' : route);
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        colorScheme: 'light',
      });
      const page = await context.newPage();
      const filenameBase = `${pageKey}-${validName(vp.name || `${vp.width}x${vp.height}`)}`;
      try {
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
        const finalPath = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
        const requestedPath = url.pathname.replace(/\/$/, '') || '/';
        if (excluded.some(ex => finalPath === ex || finalPath.startsWith(`${ex}/`))) {
          throw new Error(`Redirección a ruta protegida: ${finalPath}`);
        }
        if (finalPath !== requestedPath) {
          throw new Error(`La ruta ${requestedPath} redirigió a ${finalPath}; no se presume identidad visual de otra página.`);
        }
        await page.waitForLoadState('networkidle', { timeout: 4500 }).catch(() => {});
        await page.evaluate(async () => {
          if (document.fonts?.ready) {
            await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]);
          }
        });
        const data = await page.evaluate(() => {
          const tags = 'html,body,header,nav,main,section,article,aside,footer,h1,h2,h3,h4,p,a,button,input,textarea,select,label,img,svg,figure,ul,ol,li,[role="button"],[data-testid]';
          const properties = [
            'display', 'position', 'top', 'right', 'bottom', 'left', 'zIndex',
            'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'textAlign',
            'color', 'backgroundColor', 'backgroundImage', 'opacity', 'border', 'borderRadius', 'boxShadow',
            'width', 'height', 'maxWidth', 'minWidth', 'padding', 'margin', 'gap', 'rowGap', 'columnGap',
            'gridTemplateColumns', 'alignItems', 'justifyContent', 'flexDirection', 'objectFit',
            'transform', 'transition', 'animation', 'backdropFilter', 'overflow',
          ];
          const getSelector = (el) => {
            const pieces = [];
            let current = el;
            for (let i = 0; i < 5 && current && current.nodeType === Node.ELEMENT_NODE; i++) {
              let part = current.tagName.toLowerCase();
              if (current.id) { part += `#${CSS.escape(current.id)}`; pieces.unshift(part); break; }
              const classes = [...current.classList].filter(c => c.length < 60).slice(0, 2);
              if (classes.length) part += '.' + classes.map(c => CSS.escape(c)).join('.');
              const siblings = [...(current.parentElement?.children || [])].filter(e => e.tagName === current.tagName);
              if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
              pieces.unshift(part);
              current = current.parentElement;
            }
            return pieces.join(' > ');
          };
          const elements = [];
          const colors = new Map();
          for (const el of [...document.querySelectorAll(tags)].slice(0, 1000)) {
            const rect = el.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const styles = {};
            for (const prop of properties) styles[prop] = cs[prop];
            for (const colorProp of ['color', 'backgroundColor', 'borderTopColor']) {
              const c = cs[colorProp];
              if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') colors.set(c, (colors.get(c) || 0) + 1);
            }
            elements.push({
              selector: getSelector(el), tag: el.tagName.toLowerCase(),
              role: el.getAttribute('role'), text: (el.innerText || el.getAttribute('alt') || '').trim().slice(0, 120),
              rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
              styles,
            });
          }
          const variableNames = new Set();
          function collectRules(rules) {
            if (!rules) return;
            for (const rule of rules) {
              if (rule.style) for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style.item(i);
                if (prop.startsWith('--')) variableNames.add(prop);
              }
              try { if (rule.cssRules) collectRules(rule.cssRules); } catch { /* cross-origin stylesheet */ }
            }
          }
          for (const sheet of document.styleSheets) {
            try { collectRules(sheet.cssRules); } catch { /* external/blocked stylesheets */ }
          }
          const rootStyle = getComputedStyle(document.documentElement);
          const variables = {};
          for (const variable of [...variableNames].slice(0, 300)) {
            const raw = rootStyle.getPropertyValue(variable).trim();
            if (raw) variables[variable] = raw;
          }
          return {
            pageTitle: document.title,
            renderedUrl: location.href,
            viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
            document: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, lang: document.documentElement.lang },
            rootVariables: variables,
            colorsObserved: [...colors].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([value, count]) => ({ value, count })),
            loadedFonts: document.fonts ? [...document.fonts].map(f => ({ family: f.family, style: f.style, weight: f.weight, status: f.status })).slice(0, 80) : [],
            assets: [...document.querySelectorAll('img,video,source')].slice(0, 100).map(e => ({ tag: e.tagName.toLowerCase(), src: e.currentSrc || e.getAttribute('src') || '', alt: e.getAttribute('alt') || '' })),
            elements,
          };
        });
        const screenshot = path.join(outputBase, `${filenameBase}.png`);
        const jsonFile = path.join(outputBase, `${filenameBase}.json`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled', caret: 'hide' });
        await fs.writeFile(jsonFile, `${JSON.stringify({ capturedAt: new Date().toISOString(), requestedRoute: route, ...data }, null, 2)}\n`);
        manifest.results.push({ route, viewport: vp.name, screenshot: path.relative(root, screenshot), styles: path.relative(root, jsonFile), status: 'OK' });
        console.log(`OK ${route} @ ${vp.width}x${vp.height}: ${filenameBase}`);
      } catch (error) {
        manifest.results.push({ route, viewport: vp.name, status: 'FAILED', error: error.message });
        console.error(`FAILED ${route} @ ${vp.width}x${vp.height}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(outputBase, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
if (manifest.results.some(x => x.status !== 'OK')) process.exitCode = 2;
