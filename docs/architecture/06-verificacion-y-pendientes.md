# 06 — Verificación, cambios y pendientes del esqueleto

**Fecha:** 2026-10-25 · **Máquina:** Windows 11, Node 26.2.0, sin Docker. CI usa Node 22.

## 1. Verificaciones ejecutadas

| Proyecto | Comando | Antes de los cambios | Después |
|---|---|---|---|
| `frontend/` | `npm run lint` | 0 errores, 66 advertencias | 0 errores, 66 advertencias (las mismas) |
| `frontend/` | `npm run build` | Correcto, 22 páginas | Correcto, 22 páginas |
| `frontend/` | Auditor PrimeReact | — | 0 errores, 0 avisos |
| `backend/` | `npm run lint` | Sin errores | Sin errores |
| `backend/` | `npm test` (incluye `tsc`) | 4/4 | 9/9 (5 nuevas de errores HTTP) |
| `backend/squad_3_calificaciones/` | `npm run check`, `npm test` | 16/16 | 16/16 (sin cambios) |
| `database/` | `npm test` | 33/33 | 33/33 (sin cambios) |
| `packages/contracts/` | `npm run lint` | No existía | Válido; 113 advertencias de estilo |
| `.github/workflows/ci.yml` | Análisis YAML con `js-yaml` | — | 5 jobs válidos; **no ejecutado en GitHub** |
| Lockfiles | `npm ci --dry-run` en los 5 proyectos | — | Sincronizados |

**No verificado:** arranque real del backend con PostgreSQL y Redis (sin Docker en esta máquina), el health check en vivo, la ejecución del workflow en GitHub Actions y la inspección visual de la UI (el cambio de frontend no altera la interfaz).

## 2. Registro de cambios

### Creados

| Archivo | Propósito |
|---|---|
| `docs/architecture/00` a `06` | Auditoría, mapa modular, dependencias, frontend, backend, base de datos y este reporte |
| `docs/requirements/matriz-rf-arquitectura.md` | 89 RF con destino y estado (generada desde la tabla maestra de RF) |
| `docs/deployment/guia-despliegue.md` | Entornos, variables, verificación y brechas para producción |
| `backend/src/core/http/errors.ts` | 404 y manejador de errores con el sobre de ADR-005; nunca expone detalle técnico |
| `backend/tests/http-errors.test.cjs` | 5 pruebas reales sobre un servidor Express efímero |
| `frontend/modules/shared/api/{client,index}.ts` | Ubicación canónica del cliente HTTP base, sobre y peticiones públicas |
| `packages/contracts/{package.json,package-lock.json,redocly.yaml}` | Lint de OpenAPI con `@redocly/cli` 2.59.0 (versión publicada hace más de dos semanas) |
| `.github/workflows/ci.yml` | Lint, tipos, pruebas y build de los 5 proyectos; sin despliegue ni secretos |

### Modificados

| Archivo | Cambio |
|---|---|
| `backend/src/server.ts` | CORS rechazado lanza `OriginDeniedError` (antes 500 HTML, ahora 403 `ORIGIN_DENIED`); registra `notFoundHandler` y `errorHandler` al final |
| `frontend/modules/squads/squad_1_core/SessionProvider.tsx` | Usa `@/modules/shared/api` en lugar de su copia local; conserva `corePublicRequest` y `corePublicGet` para no tocar consumidores |
| `database/README.md` | Lista las dos migraciones faltantes; quita un pendiente ya resuelto (el backend rechaza `postgres`) |
| `README.md` | Estructura real, verificaciones completas, enlaces a la arquitectura, hosting del backend marcado como pendiente |
| `AGENTS.md` | Remite a `docs/architecture/` antes de crear estructura |

### Dependencias introducidas

Solo `@redocly/cli` 2.59.0 (desarrollo, `packages/contracts/`). Ninguna dependencia de ejecución.

### No modificado deliberadamente

Migraciones, `docker-compose.yml`, servicio M8, vistas de los squads 2–5, `core.yaml` y la organización de `backend/src/` (ver riesgos de la auditoría §6).

## 3. Riesgos y decisiones pendientes

| # | Pendiente | Responsable | Bloquea |
|---|---|---|---|
| 1 | Aprobar ADR-001 a ADR-005 (hoy "Propuesto") | Líder + squads | Integración entre squads |
| 2 | D-15 datos offline (Ley 29733) | Dirección del plantel | RF-25 kiosco |
| 3 | D-16 rangos CNEB | Coordinación académica | Publicar escalas (RF-13, RF-46) |
| 4 | D-19 hosting backend y WebSocket; Dockerfiles | Líder | Staging y producción |
| 5 | Unificar códigos de error con ADR-005 (P-05) | S1 | Consumo del Core por otros squads |
| 6 | Dividir `core.yaml` según ADR-005 y generar tipos con `openapi-typescript` | S1 | Tipos compartidos frontend/backend |
| 7 | Gateway del backend común hacia M8 (ADR-001) | S1 + S3 | Usar calificaciones desde el frontend |
| 8 | Un único gateway WebSocket (S-03) | S1 + S2 + S3 | RF-27 |
| 9 | Clasificar el backend de RF-86 a RF-89 y diseñar RF-79 a RF-82 | S4, S5, S3 | Esos RF |
| 10 | Reemplazar cifras fijas en vistas de S2–S5 por estados vacíos (P-01) | Cada squad | Credibilidad de la demo |
| 11 | Respaldo y restauración probada | Líder | Migración *contract* de identidad |
| 12 | Protección de ramas exigiendo `CI` en `dev` y `main` (D-13) | Dueño del repositorio en GitHub | Cumplimiento técnico de AGENTS.md §4 |
| 13 | Logging estructurado sin datos personales | S1 | Producción |
| 14 | Runner de pruebas del frontend (D-11) | Líder | Pruebas de UI |

## 4. Estado de preparación estructural

| Criterio | Estado |
|---|---|
| Arquitectura justificada y documentada | Sí (esta serie + ADR existentes) |
| Módulos con propietario | Sí, 13 módulos; 4 RF sin módulo de backend, registrados |
| Trazabilidad RF | 89/89 con destino o clasificación de pendiente |
| Reglas de negocio nuevas | Ninguna |
| Estructuras duplicadas | Se eliminó la copia local del cliente HTTP; no se crearon duplicados |
| Compilación y pruebas | Verdes en los 5 proyectos (local) |
| Migraciones y datos | Sin cambios; estrategia documentada |
| Secretos | Ninguno agregado |
| Lista para producción | **No**: ver §3, puntos 4, 11, 12 y 13 |

## 5. Siguiente fase recomendada

1. Aprobar el workflow `CI` como requisito de merge en `dev` (D-13).
2. Squad 1: cerrar P-05 y la división de `core.yaml`, porque son la base de los contratos de los demás squads.
3. Squad 2: primer módulo bajo `backend/src/modules/academics/` siguiendo [04-backend.md](04-backend.md) §9, empezando por su `paths/enrollments.yaml`.
