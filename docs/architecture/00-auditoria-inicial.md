# 00 — Auditoría inicial del esqueleto

**Fecha:** 2026-10-25 · **Rama:** `dev` (commit `cb6fff67`, árbol limpio al iniciar) · **Alcance:** estructura, configuración, contratos, persistencia e infraestructura. No evalúa la lógica de negocio.

Este documento abre la serie `docs/architecture/`. Las decisiones de fondo ya están en los ADR propuestos de `D - Base 1 - 01092026/Fase 2/Arquitectura/ADR/` y en `docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`. Esta serie **no los sustituye**: los aplica al código real e indica qué falta.

## 1. Estado inicial

| Campo | Valor comprobado |
|---|---|
| Proyecto | Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH), SSU IS-480 2026-II |
| Propósito | Gestión académica, asistencia, calificaciones, analítica, documentos oficiales y portal institucional |
| Tipo | Aplicación web (portal público + intranet + kiosco offline) con API REST/WebSocket, multi-institución (tenant) |
| Requisitos | 89 RF (`RF-01`…`RF-89`), 20 RNF, 89 CU, repartidos en 5 squads y 13 módulos (M1–M13) |
| Organización | Un repositorio, tres proyectos npm independientes (`frontend/`, `backend/`, `database/`) y el servicio M8 (`backend/squad_3_calificaciones/`) con su propio `package.json` |
| Avance real | Core (Squad 1) y M8 (Squad 3) tienen código y pruebas. Squads 2, 4 y 5 solo tienen vistas de demostración en el frontend y tablas heredadas de la línea base |

## 2. Fuentes consultadas

1. `AGENTS.md`, `README.md`, `PLAN.md` (plan del Core, 2026-10-23).
2. `D - Base 1 - 01092026/Fase 2/`: requisitos funcionales y no funcionales, límites de alcance, stack, `arquitectura_sistema.md`, `modelo_datos_canonico.md`, `plan_fase_3_diseno.md`, ADR-001 a ADR-005, SDD de los squads 1 y 3.
3. `docs/F0_*.md` (decisiones D-00 a D-20), `docs/core/OPERACION_CORE.md`, `docs/seguridad/matriz_rbac.md`, `docs/project-health/`.
4. Código: `frontend/`, `backend/src/`, `backend/squad_3_calificaciones/`, `database/`, `packages/contracts/`, `docker-compose.yml`, `vercel.json`, `.github/workflows/`.

## 3. Tecnologías detectadas

| Capa | Tecnología (versión declarada) | Ubicación |
|---|---|---|
| Frontend | Next.js ^15.5 (App Router), React ^19.1, TypeScript ^5.8 estricto, PrimeReact 10.9.9 (tema `unsch-lara.css`), Tailwind 3.4, framer-motion | `frontend/` |
| Backend común | Node ≥ 20, Express 4.19, TypeScript CommonJS, `pg`, `redis` 4, `ws`, `zod` 4, `jsonwebtoken`, `helmet`, `express-rate-limit` | `backend/src/` |
| Servicio M8 (calificaciones) | `node:http`, ESM, `jose`, `pg`, `ws`; pruebas con `node:test` + `tsx` + PGlite | `backend/squad_3_calificaciones/` |
| Base de datos | PostgreSQL 16, RLS por `tenant_id`, migraciones SQL con `node-pg-migrate` 9.0.0, pruebas con PGlite 0.3.16 | `database/` |
| Caché/sesiones | Redis 7 | `docker-compose.yml` |
| Contratos | OpenAPI 3.1 (`core.yaml`, solo Squad 1) | `packages/contracts/openapi/` |
| Calidad | ESLint 9 (frontend y backend), `tsc`, `node:test` | cada proyecto |
| CI | Solo PR-Agent (revisión con IA); ninguna puerta de compilación o pruebas | `.github/workflows/pr_agent.yml` |
| Infraestructura | `docker-compose.yml` (PostgreSQL, Redis, Adminer); sin Dockerfiles; `vercel.json` con cabeceras de seguridad | raíz |

## 4. Problemas observados

| ID | Problema | Evidencia | Tratamiento en esta fase |
|---|---|---|---|
| P-01 | Las vistas de los squads 2–5 muestran cifras fijas como si fueran reales (p. ej. "15.8 / 20", "+4.2% vs 2025") | `frontend/modules/squads/squad_4_analitica/AnaliticaModuleView.tsx` y equivalentes | **Registrado**, no modificado: pertenecen a cada squad. Riesgo R-03 |
| P-02 | El backend no tenía manejador de 404 ni de errores: JSON malformado, cuerpo excesivo o CORS rechazado caían en la página HTML por defecto de Express (500 en CORS) | `backend/src/server.ts` | **Corregido**: `backend/src/core/http/errors.ts` |
| P-03 | El único cliente HTTP vivía dentro del módulo del Squad 1, sin ubicación compartida | `squad_1_core/SessionProvider.tsx` | **Corregido**: `frontend/modules/shared/api/` |
| P-04 | `arquitectura_sistema.md` §4 y `PLAN.md` prevén `backend/src/modules/*` y `core/*`; el código real está organizado por capa técnica (`routes/`, `controllers/`, `services/`, `middlewares/`, `config/`) | `backend/src/` | **Documentado** en [04-backend.md](04-backend.md) con una ruta de transición; no se reorganiza código en uso |
| P-05 | Códigos de error divergentes del catálogo de ADR-005: el backend usa `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `TOKEN_INVALID`…; ADR-005 fija `UNAUTHENTICATED`, `ACCESS_DENIED`, `VALIDATION_FAILED` | `backend/src/middlewares/*.ts` | **Pendiente** (D-18, Squad 1). Los nuevos manejadores solo usan códigos ya publicados en ADR-005 |
| P-06 | El contrato es un único `core.yaml`; ADR-005 prevé `openapi.yaml` raíz, `components/` y un `paths/*.yaml` por squad; no había lint ni tipos generados | `packages/contracts/openapi/` | **Parcial**: se agrega lint (Redocly). La reestructuración y la generación de tipos quedan pendientes |
| P-07 | No hay CI de compilación ni pruebas (D-13) | `.github/workflows/` | **Corregido**: `.github/workflows/ci.yml` |
| P-08 | `docker-compose.yml` sigue montando `database/init/` como *init* (ADR-004 propone un script que solo cree roles); contraseña de desarrollo escrita en el archivo; `adminer:latest` sin versión | `docker-compose.yml` | **Documentado** como pendiente en [05-database.md](05-database.md); no se cambia porque las pruebas de `database/` cubren el camino "base creada por el *init*" |
| P-09 | `database/README.md` no lista las dos últimas migraciones | `database/README.md` | **Corregido** |
| P-10 | Los ADR-001 a ADR-005 siguen "Propuesto"; D-01, D-04, D-08, D-15 y D-16 están bloqueadas | ADR y `F0_DECISIONES…` | **Registrado** en [Riesgos y pendientes](06-verificacion-y-pendientes.md) |
| P-11 | D-12 propone `apps/*` + npm workspaces; el repositorio usa `frontend/` y `backend/` sin workspaces | estructura real | **No se adopta** ahora (ver §8) |
| P-12 | `arquitectura_sistema.md` menciona Socket.IO; el código usa `ws` nativo (Core y M8) | `backend/src/services/realtime.service.ts` | **Documentado**: `ws` es el estado real |
| P-13 | 66 advertencias de ESLint (importaciones sin uso) en vistas de squads | `npm run lint` en `frontend/` | Registrado; 0 errores, no bloquea |
| P-14 | `GET /users/me` y `GET /users/{id}` son rutas ambiguas en OpenAPI; en Express dependen del orden de registro | `redocly lint` (`no-ambiguous-paths`) | Registrado para el Squad 1 |
| P-15 | La línea base consolidada creó 42 tablas de **todos** los squads con un diseño anterior al modelo canónico; solo las del núcleo fueron revisadas | `database/migrations/20261022000000_baseline_consolidado.sql` | Regla: los squads 2, 4 y 5 corrigen sus tablas con migraciones nuevas antes de usarlas |

## 5. Elementos reutilizables (no se duplican)

- **Aislamiento y datos:** `withTenant()` y `assertRuntimeRole()` en `backend/src/config/database.ts`; funciones `app_tenant_id()`, `fn_resolver_institucion()`, `fn_registrar_auditoria()` en las migraciones.
- **Seguridad:** `authenticateJwt` y `requirePermission` (`backend/src/middlewares/`), validación de secretos JWT (`config/jwt.ts`) y de claves de cifrado (`core/identity-crypto.ts`).
- **Sesión web:** `SessionProvider` / `useCoreSession().request` (renovación de token, WebSocket de avisos).
- **UI:** `PrimeProvider` y tema `unsch-lara.css`; tokens en `tailwind.config.ts` y `globals.css`.
- **Contrato:** `packages/contracts/openapi/core.yaml` con el sobre `{ success, data | error, timestamp }`.
- **Migraciones y pruebas:** paquete `database/` (33 pruebas sobre PGlite), suites de M8 (16 pruebas).

## 6. Riesgos de modificación

- Reorganizar `backend/src/` rompería el trabajo en curso del Squad 1 (E0–E7 de `PLAN.md`). Por eso la estructura por módulos se aplica solo a código nuevo.
- Editar migraciones aplicadas está prohibido (ADR-004 regla 3). Ninguna migración se toca en esta fase.
- Cambiar `docker-compose.yml` invalida el escenario probado "base creada por el *init* de Docker".
- M8 es el subsistema más maduro; ADR-001 descarta reescribirlo. No se modifica.

## 7. Decisiones pendientes que condicionan el esqueleto

| ID | Decisión | Efecto mientras siga pendiente |
|---|---|---|
| D-01 | Actualizar alcance, stack y DoD | La documentación base aún describe parcialmente el stack anterior |
| D-04 / ADR-002 | Autoridad del esquema y tipo de `tenant_id` | M8 sigue con `VARCHAR(50)`; el núcleo ya usa `UUID` |
| D-05 / ADR-001 | M8 detrás de un gateway del backend común | El gateway no existe; el frontend aún no consume M8 |
| D-12 | Workspaces npm (`apps/*`, `packages/*`) | Cada proyecto se instala y verifica por separado |
| D-15 | Datos estudiantiles offline (Ley 29733) | Bloquea el diseño de persistencia del kiosco (RF-25) |
| D-16 | Fronteras de la escala CNEB | No se siembran rangos de calificación |
| D-18 / ADR-005 | Catálogo de errores | Divergencia P-05 |
| D-19 | Hosting del backend y WebSocket | No se crean Dockerfiles ni despliegue automático |

## 8. Propuesta inicial de organización

**Se conserva la distribución actual** (`frontend/`, `backend/`, `database/`, `packages/contracts/`) en lugar de convertirla en `apps/*`:

- ya existe, compila y tiene pruebas; moverla no aporta capacidad nueva;
- D-12 sigue propuesta y su motivo principal (compartir tipos generados) aún no existe;
- la ruta `frontend/modules/squads/squad_[X]_*` es la que exige `AGENTS.md` §3.

El esqueleto se completa dentro de esa forma: límites de módulos documentados, ubicaciones canónicas de lo transversal, CI con las puertas reales y trazabilidad RF → ubicación. Ver [01-mapa-modular.md](01-mapa-modular.md).
