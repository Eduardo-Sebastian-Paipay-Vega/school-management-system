# F0 — Decisiones de arquitectura: tomadas, propuestas y bloqueadas

**Fecha de corte:** 17/10/2026 · **Base:** `dev` @ `06ddee3`
**Documentos relacionados:** [`F0_PLAN_MIGRACION_TYPESCRIPT.md`](F0_PLAN_MIGRACION_TYPESCRIPT.md) · [`F0_MATRIZ_PARIDAD_FLUTTER_REACT.md`](F0_MATRIZ_PARIDAD_FLUTTER_REACT.md)

> **Revisión 1 (17/10/2026):** ver [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md).
> - **D-01:** borrador de acta en [`F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md`](F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md). **Sin aprobación institucional.**
> - **D-03, D-11, D-12, D-13, D-18 y D-20:** registro de aprobación en el Anexo B del acta (pendiente de firma).
> - **D-06 y D-07:** revisadas. Rol activo explícito y tokens por audiencia; se **retira** la selección automática del rol más privilegiado.
> - **D-04/K1:** precisada (C2).
> - **D-08:** sigue pendiente de verificar propiedad, procedencia de las imágenes y autorización.
> - **F1:** se divide en F1-A (no requiere D-01 ni D-08) y F1-B (requiere D-01).

## Leyenda

| Estado | Significado |
|---|---|
| ✅ **Tomada** | Decidida por el usuario o la dirección del proyecto. No se reabre aquí. |
| 🟡 **Propuesta** | Recomendación de F0 pendiente de aprobación. Tiene una opción por defecto. |
| ⛔ **Bloqueada** | No puede resolverse sin una autoridad externa al equipo técnico, o bloquea a otras decisiones. |

**Bloquea F1:** sí o no indica si la decisión debe cerrarse antes de ejecutar F1.

---

## Resumen

| ID | Decisión | Estado | Bloquea F1 | Responsable sugerido |
|---|---|---|---|---|
| D-00 | Stack objetivo: React/Next + RN/Expo + Node/TS + PostgreSQL + SQLite; un repositorio; Flutter conservado hasta el reemplazo | ✅ Tomada | — | Usuario (líder del proyecto) |
| D-01 | Actualizar alcance, stack, DoD y `AGENTS.md` para reflejar D-00 | ⛔ Bloqueada | **Sí** | Líder de proyecto + docente asesor SSU |
| D-02 | Registrar que D-00 sustituye la recomendación "Flutter móvil" de la auditoría | 🟡 Propuesta | Sí (trámite) | Líder de proyecto |
| D-03 | Política de higiene Git y secretos | 🟡 Propuesta | **Sí** | Líder de proyecto |
| D-04 | Autoridad del esquema y tipo de `tenant_id` | ⛔ Bloqueada | No (bloquea F2) | Squads 1 y 3 + líder |
| D-05 | M8: gateway, módulo o reescritura | 🟡 Propuesta | No (bloquea F2) | Squad 3 + Squad 1 |
| D-06 | Vocabulario canónico de roles | 🟡 Propuesta | No (bloquea F2) | Squad 1 |
| D-07 | Transporte de tokens web y móvil | 🟡 Propuesta | No (bloquea F2) | Squad 1 |
| D-08 | Estatus del portal `las-condes-replica/` | ⛔ Bloqueada | **Sí** (afecta qué se rastrea) | Squad 5 + autor del portal |
| D-09 | PrimeNG en un stack React | 🟡 Propuesta | No | Líder + Squad 3 |
| D-10 | Grilla de la planilla Modo Excel en React | 🟡 Propuesta | No (bloquea F3) | Squad 3 |
| D-11 | Runner de pruebas TS | 🟡 Propuesta | Sí | Líder |
| D-12 | Gestor de workspaces | 🟡 Propuesta | Sí | Líder |
| D-13 | Protección de ramas y CI en GitHub | 🟡 Propuesta | Sí | Dueño del repositorio |
| D-14 | Persistencia móvil (SQLite, cifrado, ORM) | 🟡 Propuesta | No (F8) | Squad 2 |
| D-15 | Política de datos offline (Ley 29733) | ⛔ Bloqueada | No (F5/F8) | Dirección del plantel + responsable de datos |
| D-16 | Escala CNEB canónica y fronteras decimales | ⛔ Bloqueada | No (F3) | Coordinación académica |
| D-17 | Bibliotecas de gráficos y PDF en TS | 🟡 Propuesta | No (F6) | Squads 4 y 5 |
| D-18 | Forma del sobre de API y códigos de error | 🟡 Propuesta | Sí (contratos F1) | Squads 1 y 3 |
| D-19 | Despliegue de Next y de los backends | 🟡 Propuesta | No (F3) | Líder |
| D-20 | Congelar features nuevas en Flutter durante la migración | 🟡 Propuesta | Sí | Líder + squads |

---

## Decisiones tomadas

### D-00 ✅ Stack objetivo

- **Decisión (del usuario):**
  - Web administrativa en React + Next.js + TypeScript.
  - Móvil futura en React Native + Expo + TypeScript.
  - Backend compartido en Node.js + TypeScript.
  - PostgreSQL como base central y SQLite protegido en el móvil.
  - Sincronización offline-first futura.
  - Un solo repositorio con desarrollo modular.
  - Flutter/Dart deja de ser objetivo, pero se conserva hasta que su reemplazo esté verificado.
- **Hechos que la respaldan:**
  - El backend ya es Node/TS (`backend/`, `backend/squad_3_calificaciones/`).
  - El dominio más maduro está en TS (`domain.ts`).
  - Existe un proyecto Next 15/React 19 (`las-condes-replica/`).
  - Compartir contratos y validaciones entre servidor, web y móvil en un solo lenguaje elimina la duplicación Dart↔TS que la auditoría marcó como "alto riesgo de deriva" (§7, fila D).
- **Costes reconocidos:**
  - Se reescribe la UI de Squad 1 (28 archivos de presentación) y de Squad 3 (≈1 450 líneas de UI y controlador).
  - Se pierde la ventaja de render canvas de Flutter para la planilla (ver D-10).

---

## Decisiones bloqueadas

### D-01 ⛔ Actualizar el marco normativo del proyecto

**Conflicto verificado:** D-00 contradice estos documentos vigentes del repositorio.

| Documento | Texto en conflicto |
|---|---|
| `D - Base 1 - 01092026/Fase 2/limites_y_alcance_proyecto.md:59` | Plataforma "Web Responsive (Flutter Web)… (PWA)"; prohíbe apps móviles nativas publicadas en tiendas |
| ídem `:39` | "❌ Apps Móviles Nativas (Play Store / App Store)" |
| ídem `:83` | Kiosco con "IndexedDB/Hive" |
| ídem `:127-128` (DoD) | `flutter analyze` 0/0 y `flutter test` como criterio de terminado |
| `.../stack_tecnologico_proyecto.md:18-19, 42, 59-79, 170, 186-199` | Flutter como frontend, con su justificación y paquetes por squad |
| `AGENTS.md` §0 paso 4, §3 | Código en `lib/features/squad_[X]_…` y calidad Flutter obligatoria |
| `AGENTS.md` §5 | Preferencia PrimeNG adaptada a Flutter |

**Por qué bloquea:**
- El alcance declara un "Scope Freeze" (`limites_y_alcance_proyecto.md:16`).
- Sin actualizarlo, cualquier PR React incumple la DoD y las reglas de agentes del propio repositorio.
- RN/Expo **no** es Kotlin/Swift, pero una app publicada en una tienda sigue fuera de alcance.

**Opciones:**
1. *(Recomendada)* Emitir un acta de cambio que:
   - autorice React/Next para la web y Node/TS como capa compartida;
   - posponga la app móvil a una fase posterior al piloto, con su propia aprobación;
   - redefina la DoD como "CI verde: `flutter analyze` + `flutter test` mientras exista Flutter, + `tsc --noEmit` + pruebas TS + lint".
2. Mantener Flutter para la web y usar TS solo en el backend. Contradice D-00.

**Requiere:** aprobación del líder de proyecto y del docente asesor del SSU IS-480. Después, un PR documental que actualice los cuatro documentos. Ese PR forma parte de F1 o la precede; **no se ejecuta en F0**.

### D-04 ⛔ Autoridad del esquema y tipo de `tenant_id`

**Hechos:**
- Hay dos modelos de notas: el relacional del consolidado y el agregado JSONB de M8.
- `tenant_id` es `UUID` con FK en uno y `VARCHAR(50)` sin FK en el otro.
- `.../Squad 3.../esquema_datos.sql` se autodeclara "DDL canónico único".
- En la semilla Flutter, **la sede actúa como tenant** (`seed_data.dart`: `gradingScalesByTenantId[sedeSecundaria.id]`), mientras el DDL usa `instituciones`. Ver el detalle en el plan, §4.2.

**Opciones:** K1 coexistencia con frontera explícita *(recomendada)*, K2 normalizar M8 o K3 agregado M8 canónico.

**Subdecisiones:**
1. ¿Tenant = institución o sede? Recomendación: tenant = institución, con la sede como atributo (el alcance limita el piloto a un plantel).
2. Tipo canónico de `tenant_id`: recomendación `UUID`.
3. ¿Quién es dueño de las migraciones? Recomendación: una sola carpeta `database/migrations/` versionada con una herramienta (por decidir en F2), que absorba `database/init/` y `squad3/001_grades.sql` **sin reescribirlos**.

**Por qué bloquea:** decide los datos que verá la analítica (S4) y si M8 cambia. Requiere acuerdo entre los Squads 1 y 3.

### D-08 ⛔ Estatus del portal `las-condes-replica/`

**Hechos:**
- Toda la carpeta está sin rastrear.
- El README la describe como "réplica de estudio" de `https://www.lascondes.cl/` con advertencia de derechos de terceros, aunque el contenido actual de `app/` ya está adaptado a Guamán Poma/UNSCH.
- Contiene 4 PNG (≈ 8 MB) de origen no documentado y su propia carpeta `.agents/skills`.
- Dependencias Angular (PrimeNG) inutilizables en React.

**Opciones:**
1. *(Recomendada)* Oficializar como `apps/portal` para RF-71, previa revisión de las imágenes y del README.
2. Mover a otro repositorio.
3. Descartar. Requiere respaldo y consentimiento del autor; **nunca borrarlo sin ellos**.

**Requiere:** el autor del portal y el líder del Squad 5. Bloquea F1 porque determina qué entra al `.gitignore` y al workspace.

### D-15 ⛔ Política de datos estudiantiles offline (Ley 29733)

Es necesario definir:
- qué campos pueden residir en el dispositivo o navegador;
- la ventana máxima offline;
- la reautenticación;
- el borrado remoto;
- la retención de la outbox;
- quién responde ante una pérdida del dispositivo.

Sin esta política no puede diseñarse el esquema local (F5 kiosco web, F8 móvil). **Requiere:** dirección del plantel y responsable de datos personales. No hay respaldo técnico que la sustituya.

### D-16 ⛔ Escala CNEB canónica

**Hechos:**
- S1 Flutter: 15,6 → A; 18–20 AD; 11–13 B; 0–10 C; mínimo aprobatorio 11.
- S3 Flutter usa por defecto AD ≥ 17,5, A ≥ 13,5 y B ≥ 10,5.
- M8 recibe la escala del proveedor S1 y valida `0 < b < a < ad ≤ 20`.
- Las fronteras decimales (17,6; 13,5; 10,5) difieren según la implementación.
- `parseGrade` traduce AD/A/B/C a los representativos 19/15/12/8, lo que afecta a los promedios en secundaria.

**Requiere:** que la coordinación académica fije la tabla oficial, incluidos los representativos de los literales. Bloquea el fixture único de escala del que dependen las pruebas de paridad S1.14 y S3.6.

---

## Decisiones propuestas

### D-02 🟡 Registrar la sustitución de la recomendación de la auditoría

La auditoría (§8) recomendó Flutter móvil y desaconsejó RN/Expo "salvo decisión organizacional de abandonar Flutter". D-00 es esa decisión. Propuesta: anexar a la auditoría una nota de superación que referencie este F0, sin reescribir su contenido histórico.

### D-03 🟡 Higiene Git y secretos (primer paso de F1)

1. Crear un `.gitignore` raíz que cubra `.env`, `.env.*` (excepto `!.env.example`), `node_modules/`, `dist/`, `.next/`, `*.tsbuildinfo` y `coverage/`.
2. Crear `.gitattributes` con `* text=auto eol=lf` para Dart, TS, SQL, C/C++ y Swift. Elimina el ruido de los 7 registrantes (A4).
3. Rastrear `backend/package-lock.json` tras verificar una instalación limpia.
4. Escaneo de secretos en CI (gitleaks o equivalente) **en modo reporte** sobre el historial. Los valores demo ya publicados (`docker-compose.yml:9`, `database.ts:10`, `auth.middleware.ts:35`, `auth_repository_impl.dart:33`, `data_protection_service.dart:19`) se documentan como **no productivos** y se rotan si se usaron en otro entorno.
5. **No** borrar ni restablecer `backend/.env`, `dist/` ni `node_modules/`; solo ignorarlos.

### D-05 🟡 Integración del servicio M8

**Recomendación:** (a) **gateway** en F2: el backend común hace de proxy de `/api/v1/grades/*` y del WS. Más adelante, (b) módulo si se unifica ESM.

**Rechazada:** (c) reescritura.

**Motivos:** M8 tiene 16 pruebas, RLS y transacciones probadas; el backend común es CommonJS y M8 es ESM. Ver el plan, §4.1.

### D-06 🟡 Vocabulario canónico de roles

**Propuesta:** el enum canónico es `rol_usuario_enum` del DDL (11 códigos en español), porque es la fuente persistente. Mapeos:

| DDL | Flutter S1 | M8 |
|---|---|---|
| `SUPERADMIN` | `superadmin` | — |
| `DIRECTIVO` | `directivo` | `director` |
| `COORDINADOR_ACADEMICO` | — | `coordinator` |
| `DOCENTE`, `DOCENTE_CONTRATADO`, `TUTOR_AULA` | `docente` | `teacher` |
| `PRACTICANTE` | — | `practitioner` |
| `ESTUDIANTE` | `estudiante` | `student` |
| `PORTERIA`, `AUXILIAR` | `porteria` | — |
| `SECRETARIA` | — | — |

**Abierto:**
- ¿`TUTOR_AULA` es un rol o una asignación?
- Un usuario con varios roles frente a M8, que acepta un único `role`. ~~Propuesta: el token lleva `roles[]` y el gateway selecciona el rol M8 de mayor privilegio aplicable a la planilla.~~ **Revisión 1:** retirada por escalada implícita. El usuario elige un **rol activo**; el token M8 se emite por intercambio con el rol M8 mapeado de ese rol activo. `SUPERADMIN`, `SECRETARIA`, `AUXILIAR` y `PORTERIA` no obtienen token M8 (ver Cierre §C1.3).

### D-07 🟡 Transporte de tokens

> **Revisión 1:** se añaden tokens separados por audiencia (`sms-core`, `sms-grades`, `sms-refresh`) con secretos distintos por servicio (Cierre §C1.3).

- **Web (Next):** refresh token en cookie `HttpOnly; Secure; SameSite=Strict` (ya en el contrato S1); access token de vida corta en memoria o en una cookie gestionada por el servidor Next. Usar el patrón BFF de Next solo si no expone secretos al cliente.
- **Móvil (Expo, futuro):** el refresh token **en el cuerpo** de la respuesta para `client_type=mobile`, guardado en `expo-secure-store`, rotativo y vinculado a `device_id`.
- **Requiere:** ampliar el contrato `/auth/refresh-token`. No se implementa hasta F2.

### D-09 🟡 PrimeNG en un stack React

**Hechos:**
- `AGENTS.md` §5 prefiere PrimeNG, adaptado a Flutter.
- PrimeNG es exclusivamente Angular y está instalado sin uso en el portal React.

**Opciones:**
1. *(Recomendada)* Adoptar **PrimeReact**, el equivalente React del mismo autor con un catálogo de componentes análogo. Respeta la intención de §5. Su DataTable es candidato para D-10.
2. Adoptar otra biblioteca (shadcn/ui + Radix, ya mencionadas en `las-condes-replica/.agents/skills`). Requiere modificar §5.

En ambos casos, retirar `primeng` y `@primeuix/themes` del portal (en F1 o F3, con build verificado). **No sustituir sin evaluación:** comparar accesibilidad, peso del bundle, soporte de teclado en tablas y compatibilidad con React 19.

### D-10 🟡 Grilla de la planilla Modo Excel

**Requisito:**
- RF-38 a 60 FPS.
- Flutter demostró la virtualización con 5 000 estudiantes (`integration_test/squad_3_performance_test.dart`).
- Debe admitir teclado completo, pegado TSV, estados por celda y ARIA grid.

**Candidatos a evaluar** con un prototipo en una rama temporal de F3, **no** en F0:
1. Grilla propia con TanStack Virtual (control total, más trabajo).
2. PrimeReact DataTable con virtual scroll (coherente con D-09).
3. AG Grid Community (maduro; revisar licencia y peso).
4. Glide Data Grid (canvas; rendimiento similar a Flutter, con accesibilidad más difícil).

**Criterio de decisión:** benchmark de 5 000 × 40 en el hardware objetivo del aula, más la batería S3.2–S3.5 de la matriz.

### D-11 🟡 Runner de pruebas TS

- **Propuesta:** Vitest para `packages/*` y `apps/*` (temporizadores falsos, que la paridad de debounce necesita, y jsdom) y Playwright para E2E.
- M8 conserva `node:test` + `tsx`: **no se migran sus pruebas**.
- El backend común elimina el script `jest` huérfano o instala un runner real en F1.

### D-12 🟡 Gestor de workspaces

**npm workspaces** (los tres proyectos ya usan npm), con raíz `apps/*` y `packages/*`. `backend/` se incorpora en F2. Reevaluar pnpm o Turborepo si el build de CI supera el umbral acordado. Ver el plan, §5.4.

### D-13 🟡 CI y protección de ramas

- **Workflow GitHub Actions:**
  - job Flutter (`analyze`, `test`);
  - job M8 (`npm ci`, `check`, `test`);
  - job workspace TS (`tsc`, `vitest`, lint);
  - escaneo de secretos.
- **Protección de `dev` y `main`:** CI requerido, sin push directo a `main` (ya es política en `AGENTS.md` §4, pero no está aplicada técnicamente).
- **Requiere:** permisos de administración del repositorio en GitHub.

### D-14 🟡 Persistencia móvil (futuro)

`expo-sqlite` + SQLCipher (verificar el soporte en la versión de Expo de F8), clave en `expo-secure-store` y Drizzle ORM opcional. Alternativa: `op-sqlite` (requiere un dev client). Decidir en F8; solo se registra aquí.

### D-17 🟡 Gráficos y PDF en TS

- **Gráficos (S4):** evaluar Recharts, ECharts o Visx frente a los requisitos de heatmap con drill-down y radar.
- **PDF (S5):** generación en el servidor con pdfmake, `@react-pdf/renderer` o Puppeteer/Playwright HTML→PDF. El criterio clave es un PDF determinista para el hash SHA-256 de RF-60.

### D-18 🟡 Sobre de API y errores

- **Propuesta:** adoptar el sobre de M8 `{success, data | error{code, message}, timestamp}` como canónico y tratar `statusCode` del contrato S1 como opcional o retirado.
- **Catálogo de errores** estable en `packages/contracts`, sembrado con los códigos de M8: `UNAUTHENTICATED`, `ACCESS_DENIED`, `VERSION_CONFLICT`, `PERIOD_CLOSED`, `INVALID_GRADE`, etc.

### D-19 🟡 Despliegue

- `vercel.json` raíz sirve la SPA Flutter y **no se toca**.
- Next (panel y portal) en proyectos Vercel independientes con *root directory* `apps/admin` y `apps/portal`.
- Los backends necesitan un host con WebSocket persistente (Vercel Functions no mantiene WS de larga duración): contenedor en Render, Railway, Fly o un VPS universitario. Pendiente de presupuesto.
- Ni Dockerfiles ni compose de aplicación existen hoy.

### D-20 🟡 Congelamiento de Flutter

Durante la migración, Flutter solo recibe correcciones de defectos y cambios de contrato necesarios para seguir funcionando contra el backend. Las features nuevas se escriben solo en React. Así se evita una paridad móvil (un objetivo que se desplaza).

---

## Dependencias entre decisiones

```text
D-00 ──► D-01 ──► (F1 autorizada)
            │
D-03, D-08, D-11, D-12, D-13, D-18, D-20 ──► F1
            │
D-04, D-05, D-06, D-07 ──► F2 (autoridad backend)
            │
D-09, D-10, D-16, D-19 ──► F3 (web + calificaciones)
            │
D-15 ──► F5 (kiosco offline) ──► D-14 ──► F8 (móvil)
D-17 ──► F6
```

## Acción solicitada

Para autorizar F1 se necesita:
1. resolver **D-01** (acta de cambio de alcance);
2. resolver **D-08** (estatus del portal);
3. aprobar o ajustar D-02, D-03, D-11, D-12, D-13, D-18 y D-20.

Las demás decisiones pueden cerrarse en paralelo durante F1.

> **Revisión 1: requisitos vigentes.**
> - **F1-A:** aprobación de D-03 y condiciones K-1…K-6 de [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md). No depende de D-01 ni de D-08.
> - **F1-B:** D-01 aprobada institucionalmente, más D-11, D-12, D-13 y D-18.

**F0 finalizada. A la espera de aprobación para ejecutar F1.**
