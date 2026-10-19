# F0 — Plan de migración progresiva a TypeScript

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Fecha de corte:** 17 de octubre de 2026
**Base inspeccionada:** checkout principal `C:/2026 - 2/zapatex/school-management-system`, rama `dev` @ `06ddee3` (idéntica a `origin/dev`)
**Modalidad:** inspección estática de solo lectura. No se ejecutaron builds, pruebas, instalaciones, migraciones ni cambios de Git. Este documento y sus compañeros residen en `docs/` (sin rastrear hasta F1-A).

Documentos relacionados:
- [`F0_MATRIZ_PARIDAD_FLUTTER_REACT.md`](F0_MATRIZ_PARIDAD_FLUTTER_REACT.md): paridad funcionalidad por funcionalidad.
- [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](F0_DECISIONES_ARQUITECTURA_PENDIENTES.md): decisiones tomadas, propuestas y bloqueadas.

> **Revisión 1 (17/10/2026):** las observaciones de revisión se cierran en [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md). Cambios en este documento:
> - §4.1 punto 3: la propuesta de claims superconjunto se sustituye por tokens por audiencia (C1).
> - §4.2: K1 se precisa con proyecciones de lectura (C2).
> - §6.2: F1 se divide en F1-A y F1-B (C4).
> - §9: el alcance de F1 se reemplaza por [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md).
>
> El texto original se conserva tachado o anotado como trazabilidad.

---

## 1. Resumen ejecutivo

1. **La migración es viable y de bajo riesgo si se hace por módulos**, porque la mayor parte del producto Flutter es demostrativo. Solo dos piezas tienen comportamiento real que hay que preservar con rigor: **Squad 3 (calificaciones)**, que tiene cliente Flutter y backend TypeScript, y la **lógica de dominio de Squad 1**, que hoy es una demo en memoria.
2. **El activo más valioso para TypeScript ya está escrito en TypeScript**: `backend/squad_3_calificaciones/src/domain.ts` (218 líneas, dominio puro y probado). El cliente React de calificaciones puede consumir la misma API REST/WS que hoy consume Flutter, **sin modificar el backend**. Es el candidato natural al primer módulo migrado.
3. **El backend común (`backend/src/`) no implementa ningún RF**: solo expone `GET /api/v1/health`. Antes de migrar Squads 1, 2, 4 y 5 a React hay que construir sus endpoints. Esto es trabajo nuevo, no una migración.
4. **Existe un bloqueo de gobierno.** La decisión de adoptar React, Next.js, React Native y Expo contradice cuatro documentos vigentes: `limites_y_alcance_proyecto.md`, `stack_tecnologico_proyecto.md`, la DoD (`flutter analyze`/`flutter test`) y `AGENTS.md` §3. Además, la auditoría base recomendaba Flutter móvil. Hay que actualizar esos documentos formalmente antes de F1 (ver D-01 en el documento de decisiones).
5. **Hay tres vocabularios de roles y dos formas de JWT incompatibles.** Hay que unificarlos antes de que cualquier cliente React se autentique contra más de un servicio.
6. **Flutter se conserva íntegro** como implementación de referencia hasta que cada módulo React demuestre paridad. Ningún archivo Dart se retira en este plan sin un acta de equivalencia.

---

## 2. Verificación de la auditoría base

Contraste de `AUDITORIA_ARQUITECTURA_WEB_MOBILE_OFFLINE.md`, que sigue sin rastrear en la raíz, contra el estado actual.

| # | Afirmación de la auditoría | Estado | Evidencia actual |
|---|---|---|---|
| A1 | `dev` @ `06ddee3`, sigue a `origin/dev` sin divergencia | **Vigente** | `git status --branch` → `## dev...origin/dev` |
| A2 | `origin/main` @ `41b14e8`, incluido en `dev` | **Vigente** | `git merge-base --is-ancestor origin/main origin/dev` = verdadero; `dev` va 8 commits por delante, `main` 0 |
| A3 | Un solo worktree | **Desactualizado** | Ahora hay dos: la raíz y el worktree de orquestación AO (`ao/school-manag-orchestrator`, mismo commit). No afecta al código |
| A4 | 7 registrantes de plugins modificados, sin diff textual | **Vigente y explicado** | `git diff --ignore-cr-at-eol` vacío; `core.autocrlf=true`. Solo son finales de línea LF↔CRLF |
| A5 | Sin rastrear: `backend/.env`, `dist/`, `node_modules/`, `package-lock.json` y `las-condes-replica/` | **Vigente** | `git status --short` |
| A6 | `.gitignore` no ignora `.env`, `node_modules`, `dist`, `.next` | **Vigente** | `git check-ignore` → NOT-ignored para los seis casos probados. Solo `backend/squad_3_calificaciones/.gitignore` protege su propio `.env` y `node_modules/` |
| A7 | Squad 1: 6 751 líneas; Squad 3: 2 027 | **Aproximado** | `wc -l` total: Squad 1 = 7 315 (68 archivos), Squad 3 = 2 082 (8 archivos). La diferencia probablemente se debe a la métrica (líneas no vacías). No cambia conclusiones |
| A8 | Squads 2/4/5 son prototipos de 2 archivos | **Vigente** | 258, 228 y 221 líneas; estado local y valores literales (`_localQueueCount = 42`, `'QR-EST-2026-0842'`) |
| A9 | Backend común solo monta `/api/v1/health` | **Vigente** | `backend/src/server.ts:35` |
| A10 | M8: REST + WS + JWT + revisión optimista + RLS + pruebas | **Vigente** | `app.ts`, `store.ts`, `migrations/001_grades.sql`, 16 casos en `test/*.test.ts` |
| A11 | Dos modelos de calificaciones incompatibles | **Vigente y agravado** | Ver §5. Además, `.../Squad 3.../esquema_datos.sql` se declara "DDL canónico único" e incluye la migración M8 con `\ir`, en contradicción con el consolidado |
| A12 | Sin persistencia offline | **Vigente** | `pubspec.yaml` no contiene hive, sqflite, drift ni connectivity |
| A13 | Portal Next: formularios sin API | **Vigente**, con matiz | Sin `fetch`/axios. El contenido ya fue adaptado a "Guamán Poma"/UNSCH (10 archivos `app/`), pero `README.md` aún lo describe como réplica de `lascondes.cl` |
| A14 | `primeng`, `@primeuix/themes`, `next-themes` y `class-variance-authority` sin uso | **Vigente y agravado** | Sin imports. Además, **PrimeNG es una biblioteca Angular**: no puede usarse en React (ver D-09) |
| A15 | Sin CI ni Dockerfiles | **Vigente** | No existe `.github/`; no hay `Dockerfile` |
| A16 | Recomendación: Flutter móvil, no React Native | **Superada por decisión del usuario** | La decisión vigente es React Native + Expo. Ver D-01 y D-02 |

### Hallazgos nuevos, no presentes en la auditoría

| # | Hallazgo | Evidencia | Impacto en la migración |
|---|---|---|---|
| N1 | El CORS del backend común **acepta cualquier origen** | `backend/src/server.ts:25` retorna `callback(null, true)` en la rama de rechazo; además compara por `origin.includes(pattern)` | Hay que corregirlo antes de exponer cualquier endpoint al cliente React |
| N2 | **Tres vocabularios de roles** | Flutter S1: 5 roles (`role.dart:2-7`); DDL: 11 (`01_esquema_consolidado.sql:18-30`); M8: 5 en inglés (`domain.ts:3`) con alias `ROLE_*` (`app.ts:13`) | Un mapa canónico es requisito previo de los tipos compartidos |
| N3 | **Dos formas de JWT** | Backend común: `tenantId`, `roles[]`, sin `iss`/`aud` (`auth.middleware.ts:39-45`). M8: `tenant_id`, `role` singular, `iss`, `aud`, `maxTokenAge 30m` (`app.ts:11`). Contrato S1: `roles[]`, `tenantId` (`contratos_api.md` S1) | Un token emitido por S1 según su contrato es **rechazado por M8** |
| N4 | Squad 3 se ejecuta en **modo demo** dentro del shell | `main.dart:47` no pasa `accessToken`; `squad_3_screen.dart:44-54` solo usa la API si hay `--dart-define=GRADES_API_URL` | La paridad debe probarse contra la API, no contra la demo |
| N5 | `vm_asistencia_mensual` **no existe** | Ni en el DDL ni en el código; `AGENTS.md` §1 la declara como entrada de Squad 4 | Hay que crearla antes de migrar la analítica |
| N6 | `evaluaciones.peso NUMERIC(3,2)` (máx. 9,99) frente a M8, que acepta pesos de 0 a 100 | DDL `:277`; `domain.ts:108` | Convergencia de esquema: una carga directa fallaría |
| N7 | `uq_asistencia_diaria (matricula_id, fecha)` | DDL `:247` | Impide varios eventos diarios (ingreso y aula) y la reconciliación offline sin pérdida |
| N8 | Endpoint de sincronización con **dos nombres** y sin idempotencia | `AGENTS.md`: `sync-batch`; contrato S2: `POST /attendance/sync-bulk` sin `operationId`/`idempotency_key` | Hay que corregir el contrato antes del kiosco y la app móvil |
| N9 | El contrato S1 entrega el refresh token en una cookie `HttpOnly` | `contratos_api.md` S1, `Set-Cookie: refreshToken=...` | Es adecuado para Next.js, pero **no sirve para Expo**: se necesita una variante móvil (D-07) |
| N10 | Numeración RF incoherente en código | `grading_scale_service.dart` cita RF-13 para la escala; según `requisitos_funcionales.md`, RF-13 = plan de estudios y RF-14 = escalas | Corregir la trazabilidad en la matriz de paridad |
| N11 | Escalas por defecto distintas | Flutter S3: `ad 17.5 / a 13.5 / b 10.5` (`gradebook.dart:25`); S1 usa `GradingScale.cnebDefault` con mínimo aprobatorio 11 | Fijar fixtures canónicos antes de las pruebas de equivalencia |

---

## 3. Inventario de migración

Categorías:
- **C**: conservar sin cambios.
- **R**: reutilizar desde TypeScript.
- **W**: reescribir conservando comportamiento.
- **E**: reestructurar.
- **X**: retirar después de su reemplazo.

### 3.1 Flutter (raíz)

| Ruta | Estado real | Dependencias | Pruebas existentes | Cat. | Destino TypeScript |
|---|---|---|---|---|---|
| `lib/main.dart` | Shell con 6 pestañas por squad, sin autenticación global | 5 barrels de squads | `test/widget_test.dart`, `test/squad_3/navigation_test.dart` | **X** (tras F6) | Layout Next con navegación por rol y middleware de sesión |
| `lib/core/theme/app_theme.dart`, `core/constants/` | Tokens Material 3 | — | — | **W** | Tokens CSS/Tailwind (`packages/ui-tokens`), mismos valores hex |
| `lib/core/widgets/squad_card.dart` | Navegación de desarrollo | — | — | **X** | No se migra: no es funcionalidad de producto |
| `squad_1/domain/models/*` (13 archivos) | Modelos puros | — | Indirectas | **W** | Esquemas Zod/OpenAPI en `packages/contracts` |
| `squad_1/domain/services/access_control_service.dart`, `models/role.dart` | Matriz RBAC en cliente | `AuditService` | `access_control_service_test.dart` | **W** | Autorización **en el servidor**; el cliente solo oculta UI (tipo `Permission` compartido) |
| `squad_1/domain/services/audit_service.dart` | Cadena hash SHA-256 en memoria | `AuditRepository` | `audit_service_test.dart` | **W** | Servidor: inserción en `logs_auditoria` con `hash_previo`/`hash_registro` |
| `squad_1/domain/services/data_protection_service.dart` | AES-256-CBC con **clave literal** en cliente | `encrypt` | `data_protection_service_test.dart` | **W** (solo en servidor) | Cifrado en el backend con `ENCRYPTION_MASTER_KEY`; el cliente solo enmascara |
| `squad_1/domain/services/grading_scale_service.dart`, `academic_calendar_service.dart` | Reglas puras | Modelos | `grading_scale_service_test.dart` | **R/W** | `packages/domain` (funciones puras TS) |
| `squad_1/shared/jwt_codec.dart`, `password_hasher.dart` | **Simulación** de JWT y hash en cliente (comentados como demo) | `crypto` | `jwt_codec_test.dart`, `password_hasher_test.dart` | **X** | **No se migran.** El servidor emite JWT y usa bcrypt |
| `squad_1/shared/validators.dart`, `failures.dart` | Validadores DNI, correo y contraseña | — | `validators_test.dart` | **W** | `packages/contracts` (Zod), compartible con móvil |
| `squad_1/data/datasources/in_memory_store.dart`, `data/seed/seed_data.dart` | Almacén demo con credenciales semilla | — | Vía repositorios | **X** | Semillas SQL de desarrollo en el servidor |
| `squad_1/data/repositories/*_impl.dart` | Implementaciones en memoria | `InMemoryStore` | 3 archivos de pruebas | **E** | Los contratos `domain/repositories/*.dart` se convierten en especificaciones de endpoints |
| `squad_1/data/import/user_import_parser.dart` | Parseo CSV/XLSX | `csv`, `excel` | — | **W** | Importación en el servidor (`multipart`) con validación; vista previa en el cliente |
| `squad_1/data/export/pdf_exporter.dart` | PDF de auditoría en cliente | `pdf`, `printing` | — | **W** | Generación en el servidor, compartida con Squad 5 |
| `squad_1/presentation/**` (28 archivos) | Pantallas funcionales sobre la demo | Controladores `ChangeNotifier` | `squad_1_screen_test.dart` | **W** | Páginas Next por flujo (ver la matriz) |
| `squad_1/presentation/screens/sdd_viewer_screen.dart` | Visor de documentación | — | — | **X** | No se migra |
| `squad_2/**` | Prototipo visual | — | — | **X** (tras implementar) | Funcionalidad **nueva** en TS; no hay lógica que preservar |
| `squad_3/domain/models/gradebook.dart` | Modelo, escala y roles | — | `test/squad_3/gradebook_test.dart` | **R** | Ya existe en TS: `domain.ts`. Se exportan sus tipos |
| `squad_3/data/repositories/api_grades_repository.dart` | Cliente REST/WS real | `http`, `web_socket_channel` | `api_grades_repository_test.dart` | **W** | `packages/api-client/grades.ts` |
| `squad_3/data/repositories/demo_grades_repository.dart` | Demo en memoria | — | Indirectas | **X** | Mock de pruebas (MSW o fixtures) |
| `squad_3/presentation/controllers/gradebook_controller.dart` | Debounce de 400 ms, reintentos exponenciales, estados de guardado y conflicto 409 | Repositorio | Pruebas de widget (debounce, en vuelo, TSV, 360 px) | **W** | Hook o almacén React con la **misma máquina de estados** |
| `squad_3/presentation/widgets/grade_matrix.dart`, `screens/squad_3_screen.dart` | Matriz virtualizada, teclado y TSV | Controlador | `integration_test/squad_3_performance_test.dart` (5 000 estudiantes) | **W** | Grilla DOM virtualizada (D-10) |
| `squad_4/**`, `squad_5/**` | Prototipos visuales | — | — | **X** (tras implementar) | Funcionalidad **nueva** en TS |
| `android/ ios/ web/ windows/ linux/ macos/` | Targets generados | Flutter | — | **C** hasta la retirada final | Se retiran con Flutter, por decisión explícita |
| `test/`, `integration_test/`, `test_driver/` | 1 490 líneas de pruebas | `flutter_test` | — | **C** | Oráculo de paridad; se ejecutan en CI mientras exista Flutter |
| `pubspec.yaml`, `pubspec.lock`, `analysis_options.yaml` | Manifiestos | — | — | **C** | — |
| `vercel.json` | Despliegue de la SPA Flutter | — | — | **C** | Un proyecto Vercel nuevo para Next (directorio raíz propio); no se toca este |

### 3.2 Backends

| Ruta | Estado real | Pruebas | Cat. | Plan |
|---|---|---|---|---|
| `backend/src/server.ts` | Express + Helmet + CORS **permisivo** + Morgan | Ninguna (`jest` declarado sin instalar) | **E** | Base del backend modular; corregir CORS (N1) y retirar valores por defecto sensibles |
| `backend/src/config/database.ts`, `config/redis.ts` | Pool `pg` y cliente Redis con **contraseña por defecto en el código** (`database.ts:10`) | — | **E** | Configuración validada con Zod; falla si faltan variables |
| `backend/src/middlewares/auth.middleware.ts` | `jsonwebtoken`, secreto por defecto literal (`:35`), `as any` | — | **E** | Unificar con `authenticate()` de M8 (`jose`, `iss`/`aud`, claims requeridos) |
| `backend/src/middlewares/rbac.middleware.ts` | `requireRoles`, `SUPERADMIN` como comodín | — | **R** | Conservar el patrón y tipar los roles con el enum canónico |
| `backend/src/routes/health.routes.ts` | Salud de PG y Redis; **expone `e.message`** | — | **R** | Conservar; ocultar el detalle de errores fuera de desarrollo |
| `backend/squad_3_calificaciones/src/domain.ts` | Dominio M8 completo | `domain.test.ts` (12) | **C/R** | **Conservar sin cambios.** Extraer tipos y funciones puras a `packages/domain` *por re-exportación*, no por copia |
| `.../src/app.ts` | HTTP nativo + `ws` | `http.test.ts` | **C** | Sin cambios en F1–F3; montaje detrás del backend común en F2 (D-05) |
| `.../src/store.ts` | `PostgresBookStore` transaccional + RLS | `postgres.test.ts` (PGlite) | **C** | Sin cambios hasta la decisión de esquema (D-04) |
| `.../src/provision.ts` | Aprovisiona desde las URLs de S1 y S2 | `providers.test.ts` | **C** | Los proveedores reales serán endpoints del backend común (F2) |
| `.../migrations/001_grades.sql` | Esquema `squad3` con RLS | `postgres.test.ts` | **C** | **No se ejecuta ni se modifica** en F0/F1 |
| `backend/.env` (sin rastrear) | Configuración local con secretos | — | **C** | **No se toca.** Ignorarlo en F1 *antes* de cualquier `git add` |
| `backend/dist/`, `backend/node_modules/` | Artefactos | — | **C**, luego ignorar | No borrar: `npm start` depende de `dist/` |
| `backend/package-lock.json` (sin rastrear) | Lockfile | — | **E** | Rastrear en F1 tras una instalación limpia reproducible |

### 3.3 Base de datos

| Ruta | Estado | Cat. | Plan |
|---|---|---|---|
| `database/init/01_esquema_consolidado.sql` | 17 tablas + 1 vista materializada; sin RLS; `tenant_id UUID` | **C** en F0/F1, **E** en F2 | Fuente de las entidades S1, S2, S4 y S5 |
| `docker-compose.yml` | PG16, Redis 7 y Adminer; **contraseña literal** | **E** (F1) | Pasar las credenciales a `.env`; agregar servicios de aplicación más adelante |

### 3.4 Portal `las-condes-replica/` (sin rastrear)

| Elemento | Estado | Cat. | Plan |
|---|---|---|---|
| `app/*/page.tsx` (10 rutas), `components/Navbar.tsx`, `components/Footer.tsx` | Next 15.5 + React 19, contenido ya adaptado a UNSCH | **R** | Base del portal público RF-71 *si se oficializa* (D-08) |
| `app/intranet/page.tsx` | Login visual sin backend | **W** | Redirigir al login real del panel administrativo |
| `components/Home.tsx` (1 221 líneas) | Sin referencias estáticas | **X** (candidato) | Confirmar con el autor y un build |
| `primeng`, `@primeuix/themes` | Bibliotecas Angular, **inutilizables en React** | **X** (candidato) | Retirar tras la decisión D-09; no desinstalar en F0 |
| `next-themes`, `class-variance-authority` | Sin uso | Evaluar | Pueden ser útiles en el panel; decidir en F3 |
| `README.md`, `GEMINI.md`, `.agents/skills/*` | Documentación heredada de la réplica | **E** | Reescribir el README; revisar derechos de las 4 imágenes PNG |
| `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | Artefactos | Ignorar | Nunca rastrear |

---

## 4. Backend y persistencia

### 4.1 Cómo preservar el backend de calificaciones

**Principio:** el servicio M8 es hoy la implementación más madura. Se protege, no se refactoriza.

1. **F1:** congelar su comportamiento. Ejecutar `npm test` y `npm run check` como línea base en CI y generar un `openapi.yaml` a partir de las rutas de `app.ts:53-73` y de los tipos de `domain.ts`. Ese contrato **describe**, no modifica.
2. **F2: integración sin reescritura.** Elegir una opción (D-05):
   - **(a) Gateway** *(recomendada a corto plazo)*: el backend común hace de proxy de `/api/v1/grades/*` y `/api/v1/grades/live` hacia M8, que sigue siendo un proceso independiente. Cambios en M8: ninguno. Riesgo: bajo.
   - **(b) Módulo:** montar `createGradesApp()` dentro del proceso Express. Requiere adaptar el servidor HTTP nativo a un router y unificar ESM/CommonJS (`backend/` es CommonJS, M8 es ESM). Riesgo: medio.
   - **(c) Reescritura en Express:** **no recomendada**. Duplica 218 líneas de dominio probado.
3. **Unificación de autenticación:** el backend común debe emitir un JWT que satisfaga **ambos** verificadores durante la transición. Opciones:
   - ~~**Recomendada:** emitir claims superconjunto (`sub`, `tenant_id`, `tenantId`, `role`, `roles[]`, `iss`, `aud`, `iat`, `exp ≤ 30 min`) y migrar los middlewares al claim canónico en una versión posterior.~~ **Retirada en la Revisión 1.** Un token válido para varios servicios y el rol "más privilegiado" automático permiten escalada de privilegios.
   - **Recomendada (Revisión 1):** tokens **por audiencia** (`sms-core`, `sms-grades`) con un **rol activo elegido explícitamente**. El token M8 se obtiene por intercambio y cumple el verificador actual de M8 sin modificarlo. Detalle y pruebas SEC-01…14 en [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md) §C1.
   - **Alternativa:** cambiar `authenticate()` de M8. Rompe sus pruebas y no se recomienda.
4. **Reglas críticas que permanecen en el servidor y nunca se trasladan al frontend:** `authorize()`, `isClosed()`, `requireConclusions()`, la autoaprobación prohibida (`SELF_APPROVAL`), la revisión optimista (`VERSION_CONFLICT`), el historial inmutable, la emisión y firma de JWT, el hash de contraseñas, el cifrado AES y el hash de documentos (RF-60).

### 4.2 Diferencias entre esquemas PostgreSQL

| Aspecto | Consolidado (`database/init/01_…sql`) | M8 (`squad3` schema) | Conflicto |
|---|---|---|---|
| Tipo `tenant_id` | `UUID` FK → `instituciones(id)` | `VARCHAR(50)` sin FK | **Incompatible** |
| Modelo de notas | Relacional: `evaluaciones` + `calificaciones` (una fila por celda, `version_lock`) | Agregado JSONB por planilla (`gradebooks.state`) + `revision` | **Incompatible** |
| Granularidad de concurrencia | Por celda (`version_lock`) | Por planilla (`revision`) | Semántica distinta de 409 |
| Peso de la evaluación | `NUMERIC(3,2)` (máx. 9,99) | 0–100 | **Incompatible** (N6) |
| Estados de nota | No existen | `draft`/`approved`, `previous`, `publishedGrades` | El consolidado no soporta RF-40/RF-37 |
| Conclusiones | `conclusiones_descriptivas` por matrícula, curso y periodo | `state.conclusions` | Mapeable |
| Rectificaciones (RF-43) | No existen | `state.requests[]` | Falta en el consolidado |
| Historial | `logs_auditoria` (cadena hash, global) | `grade_audit_history` (antes/después, inmutable) | Complementarios |
| RLS | **No existe** | Sí (`app.tenant_id`) | Brecha de seguridad en el consolidado |
| Roles | `rol_usuario_enum` (11) | Texto en el JWT (5) | N2 |
| Curso | `curso_id UUID` **sin tabla `cursos`** | `courseId` UUID | Falta catálogo (RF-13) |
| Asistencia | `UNIQUE (matricula_id, fecha)` | — | Bloquea varios eventos y la sincronización (N7) |
| Sincronización | Sin `idempotency_key`, versión ni tombstones | — | Requerido para el offline |

**Alternativas de convergencia (propuestas, sin ejecutar):**

| Opción | Descripción | Ventajas | Riesgos |
|---|---|---|---|
| **K1. Coexistencia con frontera explícita** *(recomendada para F2)* | El consolidado es la autoridad de identidad, estructura académica y matrícula. `squad3.gradebooks` es la autoridad de notas. M8 guarda `courseId`/`sectionId`/`periodId` como referencias. Agregar una tabla puente o una vista de lectura para S4/S5. **Revisión 1:** M8 es el único escritor; `evaluaciones`, `calificaciones` y `conclusiones_descriptivas` quedan congeladas (hoy no tienen escritor). Las proyecciones P1/P2/P3, la reconciliación R1–R5 y los criterios de convergencia se describen en [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md) §C2 | Sin migrar datos; M8 intacto | Dos fuentes de notas para la analítica; requiere vista de proyección |
| K2. Normalizar M8 al consolidado | Reescribir `store.ts` sobre `evaluaciones`/`calificaciones`, ampliando el consolidado (estados, solicitudes, publicación) | Modelo único relacional | Alto: reescribe la capa probada y cambia la semántica de conflicto |
| K3. Adoptar el agregado M8 como canónico de notas y eliminar `evaluaciones`/`calificaciones` del consolidado | Elimina la duplicidad | Sin pérdida de lógica | `vm_rendimiento_seccion` debe reescribirse sobre JSONB |

Con cualquier opción, decidir el **tipo de `tenant_id`** (D-04). Recomendación: `UUID` en ambos esquemas, migrando `squad3.tenant_id` por un script con *dry-run* y reversión, en una fase posterior autorizada.

### 4.3 Secretos y configuración

- `backend/.env` existe, **no está ignorado** y contiene `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_MASTER_KEY` y `DB_PASSWORD`. Sus valores no se inspeccionaron. Riesgo inmediato: un `git add .` o `git add backend` lo confirmaría.
- Secretos literales en código rastreado: `docker-compose.yml:9`, `backend/src/config/database.ts:10`, `backend/src/middlewares/auth.middleware.ts:35`, `lib/.../auth_repository_impl.dart:33` y `lib/.../data_protection_service.dart:19`. Son valores de demo, pero ya están en el historial público. **Rotarlos** si alguno se reutilizó en otro entorno.
- Regla para la migración: **ningún** paquete del frontend (Next o Expo) importa `process.env` con secretos. En Next, solo las variables `NEXT_PUBLIC_*` llegan al navegador y nunca deben contener secretos.

---

## 5. Repositorio y dependencias

### 5.1 Estado verificado

| Elemento | Estado |
|---|---|
| `dev` | `06ddee3`, sincronizada con `origin/dev` |
| `main` | `origin/main` = `41b14e8` (22/09/2026), ancestro de `dev`, 8 commits detrás. No existe `main` local |
| Cambios locales | 7 registrantes con cambio de final de línea solamente (`core.autocrlf=true`) |
| Sin rastrear | `AUDITORIA_…md`, `backend/.env`, `backend/dist/`, `backend/node_modules/`, `backend/package-lock.json`, `las-condes-replica/` |
| Protección de `.env` | **No existe** en la raíz. Solo `backend/squad_3_calificaciones/.gitignore` cubre su propio `.env` |
| Stash | Vacío |
| CI | No existe |

### 5.2 Dependencias

| Unidad | Gestor | Lockfile | Observación |
|---|---|---|---|
| Flutter raíz | pub | `pubspec.lock` rastreado | `cupertino_icons` sin uso; nombre de paquete genérico `flutter_application_1` |
| `backend/` | npm, CommonJS, TS 5.5 | **Sin rastrear** | `jest` en scripts sin dependencia; `express-rate-limit` y `zod` instalados pero sin uso; `ts-node-dev` |
| `backend/squad_3_calificaciones/` | npm, ESM, TS 5.9 | Rastreado | `jose`, `pg`, `ws`; pruebas con `node:test` + `tsx` + PGlite |
| `las-condes-replica/` | npm | Presente, sin rastrear | Next 15.5, React 19, Tailwind 3.4; PrimeNG (Angular) incompatible |

Divergencias a resolver al crear el workspace:
- versiones de TypeScript (5.5 frente a 5.9);
- `@types/node` (20, 24 y 22);
- sistema de módulos (CJS frente a ESM);
- runner de pruebas (Jest declarado frente a `node:test`). Recomendación: `node:test` + `tsx`, que ya probó M8, o Vitest para paquetes y React. Ver D-11.

### 5.3 Estrategia de ramas

- Mantener la política de `AGENTS.md` §4: `main` blindada y `dev` de integración.
- Cada fase y módulo se desarrolla en una rama temporal desde `dev` (`temp/f1-higiene`, `temp/f3-web-calificaciones`, …) y llega a `dev` por PR con CI verde.
- **Punto de reversión por fase:** etiqueta anotada en `dev` antes de cada merge de fase (`pre-f1`, `pre-f2`, …). Hoy no existen etiquetas.
- `main` solo recibe `dev` al cerrar un hito con la paridad verificada.
- Ninguna rama ni etiqueta se crea en F0.

### 5.4 Workspaces progresivos (propuesta, sin crear)

Estructura objetivo **sin mover nada existente**:

```text
school-management-system/
├── lib/ test/ android/ ios/ web/ …      Flutter: intacto (referencia)
├── pubspec.yaml                          intacto
├── backend/                              intacto en F1; se integra al workspace en F2
│   └── squad_3_calificaciones/           intacto
├── database/                             intacto
├── apps/
│   ├── admin/                            (F3) Next.js panel administrativo
│   ├── portal/                           (F1/F3, si D-08) portal público desde las-condes-replica
│   └── mobile/                           (F8+, NO en este plan) Expo
├── packages/
│   ├── contracts/                        (F1) OpenAPI + Zod: DTOs, errores, roles
│   ├── domain/                           (F2) re-exporta funciones puras de M8 + validadores
│   ├── api-client/                       (F3) cliente fetch tipado, sin dependencias de Next
│   └── ui-tokens/                        (F3) tokens AppTheme → CSS
├── package.json                          (F1) solo "workspaces": ["apps/*","packages/*"]
└── vercel.json                           intacto (Flutter); Next se despliega con su propio proyecto
```

- **npm workspaces** porque los tres proyectos actuales ya usan npm. Evaluar pnpm o Turborepo solo cuando haya más de tres paquetes con build propio (D-12).
- `backend/` y `backend/squad_3_calificaciones/` entran al workspace en F2, después de verificar que su instalación no cambia de versión. Hasta entonces conservan sus lockfiles independientes.
- Flutter y npm coexisten en la raíz sin conflicto: `pubspec.yaml` y `package.json` son independientes.

---

## 6. Estrategia de sustitución gradual

### 6.1 Principios

1. **Flutter es el oráculo.** Cada módulo React se valida contra el comportamiento observable de Flutter *conectado a la API*, no contra la demo.
2. **Un módulo a la vez**, de mayor madurez backend a menor: S3 → S1 → S2 → S4 → S5.
3. **Sin retiradas implícitas.** Un archivo Dart se elimina solo con un acta de equivalencia firmada (el criterio de la matriz cumplido y el visto bueno del líder del squad y del líder del proyecto).
4. **El contrato precede al código.** Ningún endpoint nuevo sin su entrada en `packages/contracts` ni cambios incompatibles sin versión.
5. **Doble ejecución temporal:** durante la transición, Flutter y React consumen el mismo backend. Si React falla, el usuario vuelve a Flutter sin pérdida de datos porque la autoridad está en el servidor.

### 6.2 Fases

| Fase | Objetivo | Entregables | Pruebas de regresión | Punto de reversión | Detener si |
|---|---|---|---|---|---|
| **F1-A. Higiene, secretos y línea base** *(Revisión 1)* | Repositorio seguro de confirmar y medición base, neutral respecto del stack | Ver [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md): `.gitignore`, `.env.example` con placeholders, lockfile del backend, `docs/`, línea base. Sin CI, sin `.gitattributes`, sin workspaces | Línea base registrada; los resultados Flutter y M8 no cambian | Commit `06ddee3` (`pre-f1a`) | El estado inicial difiere de la foto F0; aparece un valor de `.env` en el diff |
| **F1-B. Contratos, CI y workspaces** *(Revisión 1; requiere D-01)* | Infraestructura TS compartida | `packages/contracts` (OpenAPI M8, D-18), `package.json` raíz con workspaces (D-12), Vitest/Playwright (D-11), GitHub Actions + protección de ramas (D-13), `.gitattributes` validado, escaneo de secretos en CI, contraseña de compose a variable | CI verde idéntico a la línea base F1-A | `pre-f1b` | CI no reproduce la línea base |
| ~~**F1. Higiene y línea base**~~ *(sustituida por F1-A/F1-B; se conserva como trazabilidad)* | Repositorio seguro y reproducible; contratos descriptivos | `.gitignore` raíz (`.env`, `node_modules`, `dist`, `.next`, `*.tsbuildinfo`); `.env.example` revisados; `backend/package-lock.json` rastreado; CI con `flutter analyze`, `flutter test`, `npm test`/`check` (M8) y escaneo de secretos; `packages/contracts` con `openapi.yaml` de M8; `package.json` raíz con workspaces vacíos; decisión sobre el portal | CI verde = línea base. Las pruebas Flutter y M8 no deben cambiar de resultado | Etiqueta `pre-f1`; todos los cambios son aditivos | Aparece un secreto real en el historial; el build no es reproducible |
| **F2. Autoridad backend** | Autenticación real y contratos S1/S2 mínimos | `POST /auth/login`, `/auth/refresh-token`, `/auth/logout` en `backend/src`; bcrypt; JWT por audiencia con rol activo e intercambio a M8 (Revisión 1, C1); proyecciones de lectura K1 (C2); corrección de CORS; mapa canónico de roles; gateway a M8; proveedores reales para `provision.ts`; ADR de esquema | Pruebas de contrato proveedor; 401/403/409/422; aislamiento de tenant; las pruebas M8 sin cambios | `pre-f2`; el gateway puede desactivarse y M8 sigue accesible directamente | Un tenant cruza datos; M8 necesita cambios de dominio |
| **F3. Web admin + calificaciones** | Primer módulo React con paridad | `apps/admin` (Next, App Router); login contra F2; `packages/api-client`; planilla S3 completa | Batería de paridad S3 (ver la matriz §S3); benchmark de la grilla con 5 000 filas; Playwright E2E por rol | `pre-f3`; Flutter S3 sigue desplegado | No se alcanza el rendimiento acordado (D-10); diverge cualquier regla |
| **F4. Squad 1 web** | Usuarios, configuración, auditoría y privacidad | Endpoints S1 + páginas | Paridad S1; pruebas de seguridad (enumeración, rate limit, revocación) | `pre-f4` | Alguna regla de seguridad queda solo en el cliente |
| **F5. Squad 2 web** | Matrícula, asistencia y kiosco web | Endpoints S2, sincronización idempotente, kiosco con IndexedDB | Cortes de red, duplicados y reloj desfasado | `pre-f5` | No hay idempotencia transaccional |
| **F6. Squads 4 y 5 web + portal** | Analítica, reportes PDF, verificación QR y portal | Vistas materializadas, servicio PDF, `GET /public/verify/:token` | Paridad de cálculos; PDF reproducible; verificación pública sin datos personales | `pre-f6` | Hay fuga de datos en el verificador público |
| **F7. Retirada de Flutter** | Eliminar Dart por módulo con acta | PR de retirada por squad; actualización de la DoD | CI completo sin Flutter | Etiqueta `flutter-final` antes de borrar; restauración por `git revert` | Falta cualquier acta de equivalencia |
| **F8+. Móvil Expo** | Fuera de este plan | — | — | — | Alcance no aprobado (D-01) |

### 6.3 Mecanismos contra cambios incompatibles

- **Versionado de API:** `/api/v1` se congela una vez publicado; los cambios incompatibles van a `/api/v2` o a campos opcionales.
- **Pruebas de contrato:** cada endpoint valida su respuesta contra el esquema de `packages/contracts` en las pruebas del proveedor, y los clientes (Flutter mientras exista, React y luego Expo) se prueban contra el mismo esquema.
- **Fixtures canónicos compartidos:** un conjunto JSON único (escala, planilla, roster) consumido por las pruebas Dart, las pruebas TS de M8 y las pruebas React. Resuelve N11.
- **CI obligatorio en `dev`:** la protección de rama exige que pasen Flutter y TS. Requiere configurar GitHub (D-13).
- **Feature flags de navegación:** el panel React enlaza a la pantalla Flutter equivalente mientras su módulo no tenga acta, sin mezclar las implementaciones.

---

## 7. Preparación móvil (sin crear la app)

### 7.1 Compartible con React Native

| Paquete | Contenido | Condición para compartir |
|---|---|---|
| `packages/contracts` | Zod/OpenAPI: DTOs, `ApiEnvelope {success, data|error, timestamp}` (`app.ts:21`), códigos de error estables, enum de roles canónico, `Permission` | Sin dependencias de DOM ni de Node |
| `packages/domain` | `literal`, `parseGrade`, `summary`, `annualSummary`, `cellKey` y `validateScale` de M8; validadores DNI, correo y contraseña | **Solo para vista previa y validación de UX.** El servidor revalida siempre |
| `packages/api-client` | Cliente `fetch` con inyección de `getAccessToken()` y manejo de 401/409/422/429/5xx | Sin cookies implícitas: el token es inyectable (cookie en web, `SecureStore` en móvil) |
| Máquina de estados de autoguardado | `idle → pending → saving → saved/error/conflict` con debounce de 400 ms y backoff exponencial (de `gradebook_controller.dart`) | Implementarla como lógica pura sin React para reutilizarla en RN |
| Política de reintentos | Reintentar timeout/5xx/429; no reintentar 400/403/409/422 | Ya validada en `api_grades_repository_test.dart` |

**No compartible:** componentes UI (DOM frente a nativo), Server Actions y middleware de Next, la cookie `HttpOnly`, la grilla tipo Excel (en móvil se sustituye por una vista por estudiante) y todo lo relacionado con secretos.

### 7.2 Almacenamiento local propuesto (futuro)

- **SQLite con `expo-sqlite`**, cifrado con SQLCipher (verificar en F8 el soporte de la versión de Expo elegida). Clave aleatoria por instalación en `expo-secure-store` (Keystore/Keychain). ORM tipado opcional: Drizzle (D-14).
- Tablas conceptuales:
  - `sync_metadata(scope, cursor, schema_version, last_success_at)`;
  - read models mínimos con `server_id`, `server_version` y `deleted_at`;
  - `outbox(operation_id UUID, idempotency_key, entity, base_version, action, payload, occurred_at_device, state, attempts, next_retry_at, last_error)`;
  - `inbox_receipts`.
- Token de acceso solo en memoria. Refresh token del dispositivo en `SecureStore`, rotativo y revocable por `device_id`.

### 7.3 Reglas de sincronización

1. El servidor es la autoridad; ninguna escritura local se considera confirmada sin ACK.
2. Cada operación lleva un UUID generado en el dispositivo e `Idempotency-Key`; el servidor guarda la respuesta.
3. Concurrencia optimista por `baseVersion`. El 409 devuelve el estado del servidor y **nunca se resuelve con LWW** para notas ni para asistencia ambigua.
4. Pull incremental por cursor opaco con tombstones.
5. **Offline permitido:** marcación de asistencia (primer MVP). **Offline condicionado:** borradores de notas, nunca publicación ni cierre. **Solo online:** login, roles, cierre, publicación, rectificación, exportaciones oficiales y verificación documental.
6. Requisitos de servidor previos: `idempotency_key` y versión en las tablas sincronizables, eliminar `uq_asistencia_diaria` o reemplazarla por una regla de eventos (N7) y unificar `sync-batch`/`sync-bulk` (N8).

### 7.4 Restricciones de acceso a datos estudiantiles (Ley 29733)

- **Minimización:** el dispositivo recibe solo su tenant, rol, secciones asignadas y periodo vigente. Nunca el DNI completo ni los datos de salud, psicológicos o de contacto de apoderados.
- Los datos cifrados en el servidor con `ENCRYPTION_MASTER_KEY` **no se descifran para sincronizar**; en el dispositivo solo existen valores enmascarados.
- Ventana máxima de lectura offline acotada (por decidir, D-15); al vencer, se exige reautenticación.
- Al cerrar sesión, revocar el acceso o cambiar de rol o tenant, borrar la base local y la clave.
- Sin telemetría con datos personales ni registros con PII en el dispositivo.
- El alcance actual prohíbe el acceso de apoderados (`limites_y_alcance_proyecto.md:62`); la app móvil no debe abrirlo.

---

## 8. Riesgos principales de la migración

| Severidad | Riesgo | Mitigación |
|---|---|---|
| Crítica | Contradicción con el alcance, el stack, la DoD y `AGENTS.md` | Acta de cambio (D-01) antes de F1 |
| Crítica | Confirmar `backend/.env` por accidente | `.gitignore` como **primer** cambio de F1 |
| Alta | Rendimiento de la planilla DOM inferior al canvas Flutter (RF-38: 60 FPS) | Benchmark comparativo con 5 000 × 40 celdas antes de aceptar F3 |
| Alta | JWT incompatibles entre servicios | Claims superconjunto en F2 |
| Alta | Esquemas de notas divergentes | ADR K1 antes de F2; ninguna migración sin dry-run |
| Media | Doble mantenimiento Flutter + React | Congelar las features Flutter: solo correcciones mientras dure la migración |
| Media | El equipo de 5 squads aprende un stack nuevo en pleno ciclo académico | Migrar primero S3, cuyo backend ya está en TS, como ejemplo de referencia |
| Media | Derechos sobre imágenes y estructura del portal derivado de un sitio municipal | Revisar el origen de los PNG y sustituirlos si no hay licencia |

---

## 9. Criterio de salida de F0 y propuesta de F1

**F0 se considera cerrada cuando:**
1. se aprueben o rechacen las decisiones bloqueantes D-01 a D-05 (D-04 puede limitarse a aprobar la estrategia K1);
2. el líder de proyecto acepte este plan y la matriz de paridad.

> **Revisión 1:** el alcance siguiente se divide en F1-A (ver [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md)) y F1-B. `.gitattributes` pasa a F1-B. El dictamen vigente está en [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md).

**Alcance propuesto para F1 (original)**, sujeto a aprobación, sin código funcional ni React:
- `.gitignore` raíz y protección de `.env`;
- rastreo de `backend/package-lock.json`;
- normalización de finales de línea (`.gitattributes`) para eliminar el ruido de los registrantes;
- CI de línea base;
- `packages/contracts` con el OpenAPI de M8;
- `package.json` raíz con workspaces;
- decisión y, si procede, rastreo del portal.

**Detenido aquí. A la espera de aprobación para ejecutar F1.**
