# F1-A — Plan de ejecución segura: higiene Git, protección de secretos y línea base

**Estado:** PLAN. **No ejecutado.** Requiere autorización explícita del líder de proyecto (ver §0).
**Base:** `dev` @ `06ddee3` · checkout principal `C:/2026 - 2/zapatex/school-management-system`
**Referencias:** [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md) §0 y §C4 · [`F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md`](F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md) Anexo B (D-03)

**Alcance de F1-A:**
- **Incluye:** ignorar secretos y artefactos; que `.env.example` deje de contener valores reutilizables; rastrear el lockfile del backend común; versionar la documentación F0/F1-A; medir la línea base de pruebas.
- **Excluye:** Flutter, React, Expo, base de datos, backend funcional, `.gitattributes` global, CI y workspaces (todo eso es F1-B o posterior).

---

## 0. Dictamen y condiciones

| Ámbito | Dictamen |
|---|---|
| Preparación técnica | **APTO CON CONDICIONES** |
| Autorización institucional | No se requiere el acta D-01: F1-A es neutral respecto del stack. **Sí se requiere la autorización del líder de proyecto** para crear la rama, confirmar y abrir el PR |

**Condiciones previas, todas obligatorias:**

| # | Condición | Quién |
|---|---|---|
| K-1 | Autorizar expresamente la ejecución de F1-A: rama temporal, commits, push y PR a `dev` | Líder de proyecto |
| K-2 | Aprobar D-03 (acta, Anexo B) | Líder de proyecto |
| K-3 | Decidir el tratamiento de `backend/.env.example` (paso 3): opción **A** (placeholders, recomendada) o **B** (sin cambios en F1-A) | Líder + Squad 1 |
| K-4 | Decidir si se versionan `docs/` y la auditoría `AUDITORIA_ARQUITECTURA_WEB_MOBILE_OFFLINE.md`, y dónde (paso 5) | Líder de proyecto |
| K-5 | Autorizar `npm ci` **en directorios temporales fuera del repositorio** y la ejecución de `flutter analyze`/`flutter test` (generan cachés ya ignorados: `.dart_tool/`, `build/`) | Líder de proyecto |
| K-6 | Ejecutar en el **checkout principal**, no en un worktree nuevo: `backend/package-lock.json` y `docs/` existen solo ahí, sin rastrear | Ejecutor |

**Estado de las condiciones (Revisión 2):**

| # | Propuesta | Estado |
|---|---|---|
| K-1 | — | ⛔ **Pendiente de autorización expresa del líder.** Sin ella no se ejecuta ningún paso |
| K-2 (D-03) | Recomendar aprobación | 🟡 Recomendada, pendiente de firma (acta, Anexo B) |
| K-2 bis | Declaración de reutilización y rotación de los secretos publicados (paso 3) | 🟡 Requerida en el PR |
| K-3 | **Opción A**: placeholders en `backend/.env.example` | 🟡 Propuesta |
| K-4 | Versionar `docs/` **tras** `verificar-secretos.cjs --files docs/*.md` = OK (resultado F0: OK). La auditoría queda fuera salvo indicación expresa | 🟡 Propuesta |
| K-5 | Pruebas controladas: `npm ci` solo en copias temporales fuera del repositorio; `flutter analyze`/`test` en la raíz sin confirmar ningún archivo que generen; sin alterar archivos funcionales | 🟡 Propuesta |
| K-6 | Checkout principal, previa verificación de la "foto F0" (paso 1) | 🟡 Propuesta |

---

## 1. Inventario exacto de archivos

### Afectados por F1-A

| Archivo | Operación | Paso | Reversión |
|---|---|---|---|
| `.gitignore` | **Modificar** (añadir un bloque al final; no se borra ninguna línea) | 2 | `git revert` del commit |
| `backend/.env.example` | **Modificar** (opción A: valores de secretos → placeholders) | 3 | `git revert` |
| `backend/package-lock.json` | **Rastrear** (archivo existente, sin editar) | 4 | `git rm --cached backend/package-lock.json` (el archivo se conserva) |
| `docs/F0_PLAN_MIGRACION_TYPESCRIPT.md`, `docs/F0_MATRIZ_PARIDAD_FLUTTER_REACT.md`, `docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`, `docs/F0_CIERRE_OBSERVACIONES.md`, `docs/F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md`, `docs/F1A_PLAN_EJECUCION_SEGURA.md` | **Rastrear** | 5 | `git rm --cached` |
| `docs/F1A_LINEA_BASE.md` | **Crear y rastrear** (resultados del paso 7) | 7 | `git revert` |
| `AUDITORIA_ARQUITECTURA_WEB_MOBILE_OFFLINE.md` | **Solo si K-4 lo autoriza**: rastrear en su ubicación actual o en `docs/` | 5 | `git rm --cached` |

### Explícitamente **no** tocados

| Archivo o ruta | Motivo |
|---|---|
| `backend/.env` | Secreto local. No se lee, no se edita y no se borra; solo queda ignorado |
| `backend/dist/`, `backend/node_modules/` | Artefactos existentes; `npm start` depende de `dist/`. Solo se ignoran |
| 7 registrantes de plugins (`linux/flutter/*`, `macos/Flutter/GeneratedPluginRegistrant.swift`, `windows/flutter/*`) | Cambio preexistente, solo de finales de línea. No se restablecen ni se confirman (§4) |
| `las-condes-replica/` | D-08 pendiente. No se mueve, no se borra y **no se añade** al índice |
| `lib/`, `test/`, `backend/src/`, `backend/squad_3_calificaciones/`, `database/`, `docker-compose.yml`, `vercel.json` | Fuera del alcance de F1-A |
| `D - Base 1 - 01092026/Fase 1/limitaciones.md` (CRLF en el índice) | No se renormaliza (§4) |

---

## 2. Secuencia

Cada paso indica el comando previsto, la verificación y la reversión. Los comandos están escritos para Git Bash en Windows.

### Paso 1 — Verificar el estado y abrir una rama temporal

```bash
cd "C:/2026 - 2/zapatex/school-management-system"
git fetch origin
git status --short                   # debe coincidir EXACTAMENTE con la "foto F0" (abajo)
git rev-parse HEAD origin/dev         # ambos 06ddee3… (si difieren: DETENER y reevaluar)
git switch -c temp/f1a-higiene        # los cambios preexistentes viajan sin tocarse
```

**Foto F0 esperada** (`git status --short`):

```text
 M linux/flutter/generated_plugin_registrant.cc
 M linux/flutter/generated_plugin_registrant.h
 M linux/flutter/generated_plugins.cmake
 M macos/Flutter/GeneratedPluginRegistrant.swift
 M windows/flutter/generated_plugin_registrant.cc
 M windows/flutter/generated_plugin_registrant.h
 M windows/flutter/generated_plugins.cmake
?? AUDITORIA_ARQUITECTURA_WEB_MOBILE_OFFLINE.md
?? backend/.env
?? backend/dist/
?? backend/node_modules/
?? backend/package-lock.json
?? docs/
?? las-condes-replica/
```

- **Detener si** aparece cualquier otra entrada: sería trabajo ajeno no inventariado.
- **Reversión:** `git switch dev && git branch -D temp/f1a-higiene` (no hay commits todavía).
- **Protección local opcional** contra un `git add .` accidental del portal: añadir `las-condes-replica/` a `.git/info/exclude`. Es local, no versionado y reversible borrando la línea.

### Paso 2 — Proteger `.env` y artefactos (`.gitignore`)

Añadir al **final** del `.gitignore` raíz, sin modificar las líneas existentes:

```gitignore

# --- F1-A: secretos y artefactos Node/TypeScript ---
# Variables de entorno: nunca versionar valores reales
.env
.env.*
!.env.example

# Dependencias y salidas de compilación
node_modules/
dist/
out/
.next/
*.tsbuildinfo
coverage/

# Herramientas
.vercel/
.turbo/
npm-debug.log*

# Material criptográfico
*.pem
```

**Verificaciones** (todas realizadas en seco en F0, con resultado conforme):

```bash
git ls-files -ci --exclude-standard          # debe imprimir NADA: ningún archivo rastreado queda ignorado
git check-ignore -v backend/.env backend/dist backend/node_modules \
  las-condes-replica/node_modules las-condes-replica/.next     # los 5 deben aparecer como ignorados
git check-ignore -v backend/.env.example     # NO debe aparecer (exclusión con !)
git status --short                           # desaparecen .env, dist/ y node_modules/; los demás siguen
```

Por qué no oculta fuentes:
- `dist/`, `out/` y `coverage/` no tienen archivos rastreados (verificado).
- `/build/` ya estaba ignorado por Flutter.
- `.env.*` excluye explícitamente `.env.example`.
- `*.pem`: ningún archivo rastreado.

**Commit:**

```text
chore(git): ignore env files and Node/TS build artifacts (F1-A)
```

**Reversión:** `git revert <sha>`.

### Paso 3 — Verificar credenciales y neutralizar `.env.example`

**Hecho verificable en F0 sin acceder a `backend/.env`:**
- El historial versionado de `backend/.env.example` contiene valores reutilizables en `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET` y `ENCRYPTION_MASTER_KEY`.
- Además, `docker-compose.yml:9`, `backend/src/config/database.ts:10` y `auth.middleware.ts:35` contienen literales versionados.

**Consecuencia:** esos valores ya son públicos. Se declaran **comprometidos y solo válidos para desarrollo local**; nunca deben usarse en un entorno compartido o productivo.

**Opción A (recomendada):** en `backend/.env.example`, sustituir el **valor** de:
- `JWT_SECRET`, `JWT_REFRESH_SECRET` y `ENCRYPTION_MASTER_KEY` por `CHANGE_ME_generate_with_openssl_rand_hex_32`;
- `DB_PASSWORD` por `CHANGE_ME_must_match_docker_compose_local_only`.

Añadir encima de cada uno un comentario que indique cómo generarlo. **No se toca `backend/.env`**: el entorno local de quien ya lo tiene sigue funcionando igual.

- **Efecto para nuevos desarrolladores:** deben generar sus propios secretos. El backend común conserva hoy valores por defecto en el código (`database.ts:10`, `auth.middleware.ts:35`), que se eliminan en F2, no en F1-A.
- **Opción B:** no modificar `.env.example` en F1-A y documentar el riesgo. No recomendada.

**Verificación sin imprimir secretos** (antes de confirmar; corregida en la Revisión 2, ver §2.1):

```bash
node "$F1A_TOOLS/verificar-secretos.cjs" --staged    # debe terminar con "RESULTADO: OK" (exit 0)
```

> **Revisión 2:** el verificador anterior (`git diff --cached` + `includes`) producía un **falso positivo** con la sustitución correcta, porque el diff contiene las líneas **retiradas** con los valores antiguos. Además, solo detectaba coincidencias exactas. Queda sustituido por el verificador de §2.1.

- **Detener si** el resultado es `BLOQUEAR` (exit 1).
- Si es `REVISIÓN HUMANA REQUERIDA` (exit 2), el líder revisa cada `archivo:línea` señalado y registra en el PR que no es un secreto, **sin copiar el contenido** de la línea. Solo entonces se continúa.

**Secretos publicados: tratamiento como comprometidos y rotación obligatoria.**

Los valores que contuvieron `backend/.env.example` en cualquier versión del historial, más los literales de `docker-compose.yml:9`, `backend/src/config/database.ts:10`, `backend/src/middlewares/auth.middleware.ts:35`, `lib/.../auth_repository_impl.dart:33` y `lib/.../data_protection_service.dart:19`, son **públicos y comprometidos**. Sustituirlos por placeholders **no** los vuelve secretos otra vez.

| Si alguno se reutilizó fuera del desarrollo local… | Rotación obligatoria | Efecto colateral |
|---|---|---|
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Generar nuevos (≥ 32 bytes aleatorios) y desplegar | Invalida todas las sesiones emitidas: comunicar el cierre de sesión forzado |
| `ENCRYPTION_MASTER_KEY` | Nueva clave + **re-cifrado** de los datos cifrados con la anterior (descifrar con la vieja y cifrar con la nueva) en una ventana controlada; destruir la clave vieja al terminar | Requiere un procedimiento de migración de datos (fuera de F1-A, sin ejecutar) |
| `DB_PASSWORD` y contraseña de `docker-compose.yml` | `ALTER ROLE … PASSWORD` + actualizar los secretos del entorno | Reinicio de los servicios conectados |
| Secretos demo de Flutter (literales de `auth_repository_impl.dart:33` y `data_protection_service.dart:19`) | No deben usarse en ningún servidor | Ninguno si solo existen en la demo |

**Registro obligatorio (K-2 bis):** el líder declara en el PR de F1-A, para cada valor de la tabla, **"no reutilizado fuera de desarrollo local"** o **"reutilizado: rotación programada en <fecha>"**. F0 no puede verificarlo, porque no existe evidencia de despliegues en el repositorio. Si hay reutilización, la rotación es un requisito previo de F2, no de F1-A.
- **Commit:** `chore(security): replace reusable secret values in .env.example with placeholders (F1-A)`
- **Reversión:** `git revert <sha>`.
- **Fuera de F1-A**, registrado para después:
  - limpiar el historial: no es necesario, porque ningún `.env` fue confirmado nunca y los valores del example se tratan como comprometidos, no como secretos;
  - sacar la contraseña de `docker-compose.yml` a una variable (F1-B);
  - eliminar los valores por defecto del código (F2).

### 2.1 Verificador de secretos (Revisión 2)

**Ubicación:** fuera del repositorio. El ejecutor lo guarda en un directorio temporal (`F1A_TOOLS=$(mktemp -d)`) y lo invoca desde la raíz del repositorio. **No se versiona en F1-A**; su incorporación a CI se evalúa en F1-B junto con gitleaks (D-13).

**Garantías de diseño:**

| Requisito | Cómo se cumple |
|---|---|
| Inspeccionar valores **nuevos**, no retirados | Solo analiza líneas `+` de `git diff -U0` (las `-` se descartan) |
| Verificar el **contenido final** | Lee el blob preparado (`git show :ruta`), el blob de `HEAD` (modo rango) o el archivo en disco (modo `--files`) |
| Distinguir **publicado** de **nuevo** | "Publicado" = cualquier valor de **cualquier versión histórica versionada** de `backend/.env.example` en cualquier ref. "Nuevo potencial" = valor no publicado detectado en líneas añadidas o en el contenido final versionable por asignación sensible, formato de credencial, codificación o alta entropía; nunca se usa `backend/.env` como fuente |
| No imprimir credenciales | Solo imprime `nivel regla archivo:línea (clave: NOMBRE_VARIABLE)`. Nunca valores, fragmentos ni la línea |
| Detectar filtraciones no exactas | Para valores publicados: variantes base64, base64url, hex (sin distinguir caja), URL-encoding, escape JSON y **fragmentos de 16 caracteres**. Para valores nuevos potenciales: clave PEM, JWT completo, URL con credencial, asignaciones sensibles, cadenas codificadas y alta entropía |
| No acceder a `backend/.env` | El verificador **jamás abre, lee, copia, modifica ni revela** `backend/.env`; si ese archivo aparece entre los candidatos a versionar, bloquea por nombre antes de intentar leer contenido |
| Bloquear filtraciones reales | `COMPROMETIDO_REINTRODUCIDO`, `ARCHIVO_ENV`, `CLAVE_PRIVADA_PEM`, `JWT_COMPLETO`, `URL_CON_CREDENCIAL`, `SECRETO_POTENCIAL_NUEVO` y `ALTA_ENTROPIA` → exit 1. `COMPROMETIDO_PREEXISTENTE` es el único aviso automático → exit 2 |

**Reglas y niveles:**
- **R0** `ARCHIVO_ENV` → BLOQUEO: se prepara un `.env` real.
- **R1** sobre el contenido final:
  - `COMPROMETIDO_REINTRODUCIDO` → BLOQUEO: un valor publicado aparece en una **línea añadida**.
  - `COMPROMETIDO_PREEXISTENTE` → AVISO: un valor previamente publicado permanece solo en una línea no modificada del contenido final de un archivo candidato. Requiere revisión registrada sin copiar el contenido; no se confunde con un secreto nuevo ni con una reintroducción.
- **R2** sobre líneas añadidas y el contenido final versionable: BLOQUEO para PEM, JWT completo, URL con credencial, asignaciones sensibles sin placeholder y alta entropía. Un hallazgo que la revisión humana demuestre que es un falso positivo se documenta por `archivo:línea` y regla, sin copiar el contenido; una filtración real nunca se degrada a aviso.
- Solo las claves con nombre sensible (`SECRET`, `PASSWORD`, `KEY`, `TOKEN`…) son valores de referencia. `DB_USER`, `DB_HOST` o `NODE_ENV` no lo son.

**Validación realizada en F0** (repositorio sintético desechable, valores aleatorios generados para la prueba):

| Caso | Esperado | Obtenido |
|---|---|---|
| `.env.example`: valor publicado → placeholder (`--staged` y `--range`) | OK, sin falso positivo | OK |
| Valor publicado reintroducido en otro archivo | BLOQUEO `COMPROMETIDO_REINTRODUCIDO` | BLOQUEO |
| Ídem con el hex en mayúsculas | BLOQUEO | BLOQUEO |
| Asignación sensible nueva o codificada dentro de contenido versionable | BLOQUEO `SECRETO_POTENCIAL_NUEVO` o `ALTA_ENTROPIA` | BLOQUEO |
| Fragmento de 16 caracteres de un valor publicado, reintroducido | BLOQUEO | BLOQUEO |
| `backend/.env` preparado con `git add -f` | BLOQUEO `ARCHIVO_ENV` | BLOQUEO |
| JWT completo (tres segmentos) y URL de base de datos con usuario y contraseña incrustados | BLOQUEO | BLOQUEO |
| Secreto desconocido de alta entropía | BLOQUEO `ALTA_ENTROPIA` | BLOQUEO (detección del 99,9 % en 5 000 muestras aleatorias base64, base64url y hex de 30–32 bytes) |
| Texto normal (`PostgreSQL`, rutas, SHA de commit) | OK | OK |
| **Repositorio real:** `--files docs/*.md AUDITORIA_…md` (solo lectura) | — | **OK: 0 bloqueos, 0 avisos** (4 valores publicados de referencia) |

**Limitaciones declaradas:** las heurísticas no sustituyen a un escáner dedicado (gitleaks en F1-B). Sin leer fuentes locales de secretos, un valor nuevo transformado por cifrado, compresión o partido en trozos pequeños puede no ser reconocible por coincidencia; se mitiga bloqueando formatos de credencial, asignaciones sensibles y alta entropía en contenido versionable. Las capas en conjunto son: `.gitignore`, `ARCHIVO_ENV`, bloqueo heurístico, revisión humana de falsos positivos y el escáner en CI.

**Código** (`verificar-secretos.cjs`, Node ≥ 18, sin dependencias):

```js
'use strict';
// F1-A: verificador de secretos. Solo lee contenido versionable; jamás abre backend/.env.
// Nunca imprime valores, fragmentos ni líneas sensibles.
// Uso (desde la raíz del repositorio):
//   node verificar-secretos.cjs --staged                 contenido preparado (índice)
//   node verificar-secretos.cjs --range dev...HEAD       contenido final de HEAD para los archivos del rango
//   node verificar-secretos.cjs --files <ruta>...        archivos en disco aún no preparados (todas sus líneas cuentan como añadidas)
// Salida: 0 = OK · 1 = BLOQUEO · 2 = solo avisos (requiere revisión humana registrada) · 64 = uso incorrecto.
const fs = require('fs');
const cp = require('child_process');

const mode = process.argv[2];
const range = process.argv[3] || 'dev...HEAD';
if (!['--staged', '--range', '--files'].includes(mode)) { console.error('Uso: --staged | --range <base>...HEAD | --files <ruta>...'); process.exit(64); }
const git = (args) => cp.execFileSync('git', ['-c', 'core.quotepath=off', ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const NL = '\n';
const PLACEHOLDER = /^(CHANGE_ME|<|\$\{|process\.env|example|xxx|redacted|\*{3,})/i;
// Solo claves cuyo nombre indica secreto (DB_USER, DB_HOST, NODE_ENV… no lo son).
const SENSITIVE_KEY = /(SECRET|PASSWORD|PASSWD|PRIVATE|API_KEY|ACCESS_KEY|MASTER_KEY|ENCRYPTION|TOKEN|CREDENTIAL)/i;

function parseEnv(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || !SENSITIVE_KEY.test(m[1])) continue;
    const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (v.length >= 8 && !PLACEHOLDER.test(v)) out.push([m[1], v]);
  }
  return out;
}

// Valores PUBLICADOS: los de cualquier versión histórica de backend/.env.example en cualquier ref.
const publishedValues = new Set();
const reference = []; // pares publicados [clave, valor]; no se colapsan por clave
let exampleCommits = [];
try { exampleCommits = git(['log', '--all', '--format=%H', '--', 'backend/.env.example']).split(/\r?\n/).filter(Boolean); } catch { /* sin historial */ }
for (const c of exampleCommits) {
  let t; try { t = git(['show', c + ':backend/.env.example']); } catch { continue; }
  for (const [k, v] of parseEnv(t)) if (!publishedValues.has(v)) { publishedValues.add(v); reference.push([k, v]); }
}
function variants(v) {
  const b = Buffer.from(v, 'utf8');
  const s = new Set([v, b.toString('base64'), b.toString('base64url'), b.toString('hex'), encodeURIComponent(v), JSON.stringify(v).slice(1, -1)]);
  if (v.length >= 24) for (let i = 0; i + 16 <= v.length; i += 4) s.add(v.slice(i, i + 16)); // fragmentos de 16 caracteres
  return [...s].filter((x) => x.length >= 8);
}
// Coincidencia sensible a mayúsculas, salvo para variantes hexadecimales (el hex puede cambiar de caja).
const contains = (text, v) => { const low = text.toLowerCase(); return variants(v).some((x) => text.includes(x) || (/^[0-9a-f]+$/i.test(x) && low.includes(x.toLowerCase()))); };

let files, readFinal, diffText;
if (mode === '--staged') {
  files = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split(/\r?\n/).filter(Boolean);
  readFinal = (f) => git(['show', ':' + f]);
  diffText = git(['diff', '--cached', '-U0', '--no-color', '--no-ext-diff']);
} else if (mode === '--files') {
  files = process.argv.slice(3);
  readFinal = (f) => fs.readFileSync(f, 'utf8');
  diffText = files.map((f) => ['+++ b/' + f, '@@ -0,0 +1 @@', ...readFinal(f).split(/\r?\n/).map((l) => '+' + l)].join(NL)).join(NL);
} else {
  files = git(['diff', '--name-only', '--diff-filter=ACMR', range]).split(/\r?\n/).filter(Boolean);
  readFinal = (f) => git(['show', 'HEAD:' + f]);
  diffText = git(['diff', '-U0', '--no-color', '--no-ext-diff', range]);
}

// Solo líneas AÑADIDAS: las retiradas (p. ej., valores antiguos de .env.example) no cuentan.
const added = [];
let cur = null;
let ln = 0;
for (const line of diffText.split(/\r?\n/)) {
  if (line.startsWith('+++ ')) { cur = line === '+++ /dev/null' ? null : line.slice(4).replace(/^"?b\//, '').replace(/"$/, ''); continue; }
  const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
  if (h) { ln = Number(h[1]); continue; }
  if (cur && line.startsWith('+')) { added.push({ file: cur, line: ln, text: line.slice(1) }); ln++; }
}

const findings = [];
const report = (level, rule, where, key = '') => findings.push({ level, rule, where, key });
const isRealEnv = (f) => /(^|\/)\.env(\.[^/]+)?$/.test(f) && !/\.env\.example$/.test(f);

// R0: bloquear por nombre antes de cualquier lectura del contenido.
for (const f of files) if (isRealEnv(f)) report('BLOQUEO', 'ARCHIVO_ENV', f);

// R1: contenido FINAL versionable frente a valores publicados (exacto, codificado o fragmento).
const finalVersionable = [];
for (const f of files) {
  if (isRealEnv(f)) continue; // garantía: backend/.env y equivalentes jamás se abren
  let content;
  try { content = readFinal(f); } catch { continue; }
  content.split(/\r?\n/).forEach((text, i) => finalVersionable.push({ file: f, line: i + 1, text }));
  const addedHere = added.filter((a) => a.file === f);
  for (const [key, v] of reference) {
    if (!contains(content, v)) continue;
    const hit = addedHere.find((a) => contains(a.text, v));
    if (hit) report('BLOQUEO', 'COMPROMETIDO_REINTRODUCIDO', f + ':' + hit.line, key);
    else report('AVISO', 'COMPROMETIDO_PREEXISTENTE', f, key);
  }
}

// R2: heurísticas sobre todo el contenido final versionable (secretos nuevos no conocidos de antemano).
const entropy = (s) => { const c = {}; for (const ch of s) c[ch] = (c[ch] || 0) + 1; return Object.values(c).reduce((e, n) => e - (n / s.length) * Math.log2(n / s.length), 0); };
for (const a of finalVersionable) {
  const where = a.file + ':' + a.line;
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(a.text)) report('BLOQUEO', 'CLAVE_PRIVADA_PEM', where);
  if (/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(a.text)) report('BLOQUEO', 'JWT_COMPLETO', where);
  if (/(postgres(ql)?|redis|mysql|mongodb(\+srv)?):\/\/[^\s:/@]+:[^\s@]{4,}@/i.test(a.text)) report('BLOQUEO', 'URL_CON_CREDENCIAL', where);
  const m = /\b([A-Z0-9_]*(SECRET|PASSWORD|PASSWD|PRIVATE_KEY|API_KEY|ACCESS_KEY|TOKEN|MASTER_KEY))\b["']?\s*[:=]\s*["']?([^\s"'#,;]{8,})/i.exec(a.text);
  if (m && !PLACEHOLDER.test(m[3])) report('BLOQUEO', 'SECRETO_POTENCIAL_NUEVO', where, m[1]);
  for (const t of a.text.match(/[A-Za-z0-9+/_-]{32,}={0,2}/g) || []) {
    if (/^[0-9a-f]{40}$/i.test(t) || PLACEHOLDER.test(t)) continue; // SHA de commit o placeholder
    if ((t.match(/\//g) || []).length >= 2 && !/[A-Z]/.test(t)) continue; // rutas de archivos (minúsculas)
    if (t.includes('/') && t.includes('_')) continue; // ruta o identificador: base64 usa '/', base64url usa '_', nunca ambos
    const mixed = /[0-9]/.test(t) && /[a-z]/.test(t) && /[A-Z]/.test(t);
    const longHex = /^[0-9a-f]{48,}$/i.test(t);
    // El hex aleatorio tiene como máximo 4 bits/carácter, de ahí su umbral menor.
    if ((mixed && entropy(t) >= 4.0) || (longHex && entropy(t) >= 3.5)) { report('BLOQUEO', 'ALTA_ENTROPIA', where); break; }
  }
}

const block = findings.filter((x) => x.level === 'BLOQUEO');
const warn = findings.filter((x) => x.level === 'AVISO');
for (const x of findings) console.log(x.level + ' ' + x.rule + ' ' + x.where + (x.key ? ' (clave: ' + x.key + ')' : ''));
console.log('Archivos revisados: ' + files.length + ' · líneas añadidas: ' + added.length + ' · valores de referencia: ' + reference.length + ' (publicados: ' + publishedValues.size + ') · bloqueos: ' + block.length + ' · avisos: ' + warn.length);
console.log(block.length ? 'RESULTADO: BLOQUEAR' : warn.length ? 'RESULTADO: REVISIÓN HUMANA REQUERIDA' : 'RESULTADO: OK');
process.exit(block.length ? 1 : warn.length ? 2 : 0);
```

**Regla general:** `--staged` antes de **cada** commit de F1-A; `--files` antes de preparar documentación nueva (paso 5); `--range dev...HEAD` antes del push (paso 8).

### Paso 4 — Reproducibilidad de dependencias y lockfiles

Hecho verificado en F0: `backend/package-lock.json` es lockfile v3 y es coherente con `backend/package.json` (sin discrepancias en dependencies ni devDependencies).

**Verificación de instalación limpia sin tocar `backend/node_modules/` ni `backend/dist/`** (requiere K-5):

```bash
T=$(mktemp -d)
cp backend/package.json backend/package-lock.json backend/tsconfig.json "$T"/
cp -r backend/src "$T"/src
( cd "$T" && npm ci --ignore-scripts && npx tsc --noEmit ) ; echo "exit=$?"
git status --short backend            # NO debe cambiar respecto del paso anterior
rm -rf "$T"
```

- **Criterio:** `npm ci` termina sin errores (el lockfile es suficiente para reproducir). `tsc --noEmit` se registra en la línea base aunque falle: su resultado es informativo, no se corrige en F1-A.
- **Rastreo:** `git add backend/package-lock.json`.
- **Commit:** `chore(backend): track package-lock.json for reproducible installs (F1-A)`
- **Reversión:** `git rm --cached backend/package-lock.json` + commit (el archivo permanece en disco).
- **Detener si** `npm ci` falla por incoherencia del lockfile. En ese caso, **no** regenerarlo en F1-A: se registra y se decide en F1-B.

`backend/squad_3_calificaciones/package-lock.json` ya está rastreado y se verifica en el paso 7. `las-condes-replica/package-lock.json` no se toca (D-08).

### Paso 5 — Versionar la documentación (según K-4)

**Comprobación previa obligatoria (Revisión 2):** verificar el contenido en disco **antes** de prepararlo.

```bash
node "$F1A_TOOLS/verificar-secretos.cjs" --files docs/*.md   # debe ser "RESULTADO: OK"
```

Resultado en F0 (solo lectura): **OK, 0 bloqueos, 0 avisos.** Tras preparar los archivos, se repite con `--staged`.

```bash
git add docs/F0_PLAN_MIGRACION_TYPESCRIPT.md docs/F0_MATRIZ_PARIDAD_FLUTTER_REACT.md \
        docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md docs/F0_CIERRE_OBSERVACIONES.md \
        docs/F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md docs/F1A_PLAN_EJECUCION_SEGURA.md
# Auditoría: solo si K-4 lo autoriza (rastrear en su lugar, o copiar a docs/ y mantener el original)
```

**Commit:** `docs: add F0 migration analysis and F1-A plan`

**Reversión:** `git revert <sha>`.

> El acta es un **borrador**. Versionarlo no implica su aprobación; el encabezado lo declara.

### Paso 6 — `.gitattributes`: evaluación, **sin aplicar** en F1-A

| Hecho | Consecuencia |
|---|---|
| `core.autocrlf=true` a nivel de sistema (`C:/Program Files/Git/etc/gitconfig`) | En el índice todo está en LF salvo un archivo |
| 444 archivos con `i/lf w/crlf` | Estado normal con autocrlf |
| 7 registrantes con `i/lf w/lf` | Flutter los regeneró con LF; Git los marca modificados aunque `git diff` está vacío. No es un cambio de contenido |
| `D - Base 1 - 01092026/Fase 1/limitaciones.md` con `i/crlf` | Un `* text=auto` lo marcaría modificado y obligaría a renormalizarlo |
| 36 archivos binarios (`-text`) | Correctamente detectados (imágenes, `.jar`) |

**Decisión para F1-A:** **no** añadir `.gitattributes`. Una regla global cambiaría la forma de comparar archivos para todo el equipo y podría producir diffs masivos en clones con otra configuración.

**Propuesta para F1-B** (con su propia validación):

```gitattributes
* text=auto
*.png binary
*.jpg binary
*.jar binary
*.keystore binary
"D - Base 1 - 01092026/Fase 1/limitaciones.md" -text
```

- La excepción explícita evita renormalizar `limitaciones.md`.
- **Validación previa en una copia descartable:** `git clone` → aplicar el archivo → `git status --short` debe quedar vacío.
- **Los 7 registrantes:** se dejan como están. Si el equipo quiere limpiar el estado, la acción no destructiva es `git update-index --refresh` y comprobar `git diff --quiet`. **No se ejecuta en F1-A sin autorización expresa**, porque afecta el estado preexistente.

### Paso 7 — Línea base de pruebas (antes de cualquier cambio funcional)

Se ejecuta **sin modificar código** y se registra en `docs/F1A_LINEA_BASE.md`: comando, fecha, versión de la herramienta, resultado y número de pruebas.

| Suite | Comando | Lugar | Notas |
|---|---|---|---|
| Flutter análisis | `flutter analyze` | Raíz | DoD vigente: 0 errores, 0 warnings |
| Flutter pruebas | `flutter test` | Raíz | Excluye `integration_test/` (requiere dispositivo o driver) |
| M8 tipos | `npm ci && npm run check` | **Copia temporal** de `backend/squad_3_calificaciones` | `npm ci` crearía `node_modules/` dentro del repositorio; hacerlo en una copia temporal deja el árbol intacto |
| M8 pruebas | `npm test` | Misma copia | 16 casos esperados (`node:test` + PGlite) |
| Backend común | `npx tsc --noEmit` | Copia del paso 4 | Informativo; `npm test` no aplica (`jest` no instalado) |

**Reglas:**
- Si alguna suite falla, **se registra el fallo como línea base y no se corrige en F1-A**.
- Si Flutter genera cambios en archivos rastreados (por ejemplo, registrantes), se registran y **no se confirman**.

**Commit:** `docs: record F1-A test baseline`

**Reversión:** `git revert <sha>`.

### Paso 8 — Revisión final, PR e integración

```bash
git diff --stat dev...HEAD          # SOLO los archivos del inventario §1
git diff --cached --name-only       # vacío (todo confirmado)
git status --short                  # quedan exactamente: 7 registrantes M, las-condes-replica/ ??,
                                    # AUDITORIA ?? (si K-4 no la incluyó)
```

1. Ejecutar `node "$F1A_TOOLS/verificar-secretos.cjs" --range dev...HEAD`. Debe dar `RESULTADO: OK`. Revisa el **contenido final** en `HEAD` de cada archivo del rango y solo las líneas **añadidas**; los valores retirados de `.env.example` no producen falso positivo (§2.1). Cualquier `BLOQUEO` detiene el push.
2. `git push -u origin temp/f1a-higiene` y abrir un PR hacia `dev` con el inventario §1 y la línea base.
3. Fusionar tras la revisión del líder. Borrar `temp/f1a-higiene` después del merge (política de ramas efímeras de `AGENTS.md` §4).
4. **Punto de reversión global:** el commit `06ddee3` (opcionalmente con la etiqueta `pre-f1a`). Revertir el merge de F1-A deja el repositorio en su estado F0 sin pérdida, porque ningún paso borra archivos del disco.

---

## 3. Criterios de aceptación de F1-A

- [ ] `git ls-files` no contiene ningún `.env`, `node_modules/`, `dist/`, `.next/` ni `*.tsbuildinfo`.
- [ ] `backend/.env` existe en disco **sin cambios** y aparece como ignorado.
- [ ] `verificar-secretos.cjs --range dev...HEAD` da `RESULTADO: OK`: ni secretos nuevos ni valores comprometidos reintroducidos en el contenido final (§2.1). Los avisos, si los hay, están revisados y registrados en el PR sin copiar contenido.
- [ ] El PR incluye la declaración de reutilización y rotación de secretos publicados (paso 3, registro K-2 bis).
- [ ] `backend/package-lock.json` rastreado y `npm ci` limpio verificado.
- [ ] `docs/F1A_LINEA_BASE.md` registra las 5 suites con su resultado real.
- [ ] Los 7 registrantes y `las-condes-replica/` quedan exactamente como estaban.
- [ ] No hay cambios en `lib/`, `test/`, `backend/src/`, `backend/squad_3_calificaciones/`, `database/`, `docker-compose.yml` ni `vercel.json`.
- [ ] PR revisado y fusionado en `dev`; rama temporal eliminada.

## 4. Condiciones de detención

- El estado inicial difiere de la foto F0.
- `git ls-files -ci --exclude-standard` imprime algo tras el paso 2.
- El verificador de secretos da `BLOQUEAR`, o da avisos sin revisión registrada.
- `npm ci` falla por el lockfile (no se regenera en F1-A).
- Cualquier paso requiere tocar código funcional, Flutter o el portal.

## 5. Después de F1-A

F1-B queda **bloqueada** hasta:
1. aprobar D-01 (acta institucional);
2. aprobar D-11, D-12, D-13 y D-18.

Su plan se redactará cuando F1-A esté fusionada.

**Fin del plan. No se ha ejecutado ningún paso.**
