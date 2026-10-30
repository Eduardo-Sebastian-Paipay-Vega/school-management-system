# Sprint 2 — Contratos y seguridad transversal del Core

**Plan de trabajo original:** 10 días hábiles estimados; ventana sugerida **lunes 2 a viernes 13 de noviembre de 2026**, hora de Lima. **Estado:** Sprint 2 cerrado por decisión del líder el 2026-10-30; resultados y deuda transferida en `SPRINT_02_RESULTADOS.md`. **Rama:** `codex/core-sprint-2-plan`, basada en S1. **Responsable técnico:** Brandon Montero (Squad 1). **Integración y prioridades:** Eduardo Paipay (líder, Squad 2).

**Decisión posterior al plan:** el líder aprobó expresamente cerrar S1/S2 con su revisión, sin exigir aprobación del equipo completo. Las referencias de este plan a firmas de cinco líderes y revisión de consumidores como puerta de cierre describen la propuesta original; el acta S2 registra la excepción y la deuda que queda. Ningún plantel externo real queda autorizado.

## Objetivo y límite

Al final de S2, el Core debe publicar un contrato OpenAPI modular y tipos generados reproducibles, responder con un catálogo de errores estable, tomar el tenant solo de una sesión validada y demostrar en CI que dos instituciones ficticias no cruzan datos por rutas representativas ni por SQL con el rol de aplicación. Se preservan las 46 rutas y 57 operaciones actuales; no se añade funcionalidad escolar nueva.

El despliegue real continúa limitado al piloto Guamán Poma de Ayala. El plano de provisión/suspensión de tenants pertenece a S6. La aceptación integrada completa con SMTP, backfill y restauración pertenece a S3; aislamiento de WebSocket, colas, archivos y exportaciones en toda la plataforma pertenece a S7. S2 registra esos riesgos sin declararlos resueltos.

## Precondiciones y decisiones del Sprint 1

- El PR #1 es un paquete de revisión, no una aceptación de ADR. ADR-001–005 y ADR-014 siguen `Propuesto`; el índice de ADR exige aprobación del consejo de diseño. Los trabajos no disruptivos (división de YAML, preparación de CI, pruebas, inventario de errores) pueden empezar; **S2-03/04 no se publican** hasta fijar la transición en ADR-002/005 con los consumidores. Si esa decisión no llega, el sprint informa el bloqueo y no declara cumplida la puerta de salida.
- El líder decidió: **institución = tenant**, **sede = unidad interna**, **invitación RF-05 explícita** y **solo el piloto en producción**. Se usan dos tenants ficticios en pruebas.
- Línea base S1: `backend/npm test` 9/9, `database/npm test` 33/33, `packages/contracts/npm run lint` válido con 113 advertencias. Las advertencias no equivalen a fallos, pero las de rutas ambiguas y operaciones sin DTO se priorizan por efecto en consumidores.
- `core.yaml` tiene 46 paths y 57 `operationId`. La migración del documento debe preservar ese inventario; cualquier cambio funcional se revisa como historia separada.

## Capacidad y coordinación

El compromiso de dos semanas **supone tres frentes de implementación en paralelo** (Squad 1 con agentes colaboradores), con Squad 1 como dueño de los cambios y el líder como integrador. Se integran PRs/diffs pequeños en orden de dependencia. Si trabaja una sola persona sin apoyo paralelo, esta carga supera un sprint de diez días: se priorizan S2-01, S2-02 y S2-03, y se replanifica S2-04/05 sin declararlos terminados.

| Frente | Dueño de integración | Archivos que modifica | Colaboración requerida |
|---|---|---|---|
| A. Contratos/tipos | Squad 1 | `packages/contracts/`, cliente HTTP compartido | S2/S3/S5 revisan DTO que consumen |
| B. Auth/errores | Squad 1 | `backend/src/services/auth.service.ts`, `middlewares/`, `routes/` | S3 revisa transición JWT hacia M8 |
| C. Pruebas/CI | Líder + Squad 1 | `backend/tests/`, `.github/workflows/ci.yml`, utilidades de test | Responsable de datos revisa rol y RLS |

**Regla de integración:** A define contrato y tabla de códigos; B implementa después de esa versión. C puede preparar entorno y fixtures antes, pero fija aserciones de código de error después de A. No se editan simultáneamente `auth.service.ts`, `core.yaml` o `ci.yml` desde dos frentes; el integrador asigna un dueño por archivo. Cada diff se relee contra el contrato y se prueba antes de combinarlo.

## Backlog comprometido

| ID / prioridad | Trabajo y archivos principales | Resultado verificable | Dependencia | Esfuerzo orientativo |
|---|---|---|---|---:|
| **S2-00 / P0** | Cerrar tabla de transición de claim y errores en `docs/core/`, ADR-002/005 y contratos consumidores; registrar revisión sin atribuir firmas no recibidas | Versión de transición y reglas 401/403/429/503 escritas; consumidores conocen el cambio | Consejo de diseño S1; puede avanzar como propuesta, el cambio incompatible espera acuerdo | 1 día |
| **S2-01 / P0** | Crear `packages/contracts/openapi/openapi.yaml`, `components/` y `paths/{auth,users,school,guardians,notifications,audit}.yaml`; actualizar scripts `lint` y CI. Migrar `core.yaml` sin cambiar rutas ni `operationId` | 46 paths y 57 operaciones preservados; Redocly sin errores; rutas ambiguas identificadas y documentadas. Resolverlas, si exige cambiar URL, mediante contrato versionado y prueba de compatibilidad, nunca solo por mover YAML | ADR-005; base de S2-02 | 2–3 días |
| **S2-02 / P0** | Esquemas concretos de sobre, errores, paginación y DTO iniciales de auth/sesión y contratos Core consumidos; generar declaración `.d.ts` con `openapi-typescript` en `packages/contracts/`. Publicar `school-contracts` como paquete local de **solo tipos** con dependencias `file:` en frontend/backend y lockfiles actualizados; usar `import type` en `frontend/modules/shared/api/client.ts`/sesión y backend cuando aplique | `npm run generate` reproducible y `check:generated` sin diff; `npm ci --dry-run` de consumidores y builds FE/BE verdes; ningún TS fuente externo rompe `backend/tsconfig.json` (`rootDir: ./src`); operaciones aún genéricas quedan registradas | S2-01; revisión S2/S3/S5 de sus DTO | 3–4 días |
| **S2-03 / P0** | Unificar códigos y sobre de errores conforme ADR-005 en `backend/src/core/http/errors.ts`, `middlewares/auth.middleware.ts`, `rbac.middleware.ts`, controladores/rutas y cliente; añadir pruebas de 400/401/403/404/413/429/503. Corregir rama de `audit.routes.ts` sin `timestamp` | Estado HTTP conservado, código estable, `timestamp` presente; 401 no filtra existencia de cuenta, 403 no revela datos, 503 falla cerrado; pruebas de contrato representativas | S2-00, catálogo de A | 3 días |
| **S2-04 / P0** | Migración controlada de JWT `tenantId` → `tenant_id` en `auth.service.ts` y verificación de cabecera `X-Tenant-ID` discordante en `auth.middleware.ts`; pruebas de token viejo/nuevo, claims conflictivos y tenant A con sesión B | Token nuevo usa claim canónico; el lector admite el claim legado como máximo durante la vida de refresh vigente (7 días desde el corte, sin renovar formato legado); claims dobles discordantes se rechazan; cabecera ausente/igual aceptada y discordante responde 403 `TENANT_MISMATCH`; la cabecera nunca da autoridad | ADR-002/005 y revisión S3 por M8 | 2–3 días |
| **S2-05 / P0** | Preparar app HTTP testeable separando composición Express de `startServer()` en `backend/src/app.ts` o levantar un proceso externo de prueba; no iniciar WS/worker al importar la app. En CI levantar PostgreSQL 16/Redis 7, aplicar migraciones, crear rol de ejecución `sms_runtime` miembro de `sms_app` sin `BYPASSRLS`, y usar fixtures ficticios de dos tenants. Suite A/B sobre auth/users/school/audit y SQL con/sin contexto, pool reutilizado y Redis indisponible | A no lee/escribe B; sin contexto RLS falla cerrado; conexión reutilizada no conserva tenant; petición protegida y refresh fallan cerrados con 503 cuando no puede verificarse Redis; CI ejecuta y registra resultado sin datos personales | S2-04 para aserciones JWT; composición/CI puede prepararse antes | 4–5 días |

**Estimación total:** 15–19 días de implementación más revisión; exige trabajo paralelo y margen de integración. Los números son esfuerzo, no días de calendario sumados. El cierre se determina por gates, no por consumir el tiempo del sprint.

## Trabajo preparado, no comprometido para S2

- **S2-06 / P1:** inventario automatizable de consultas que usan `pool.query` fuera de `withTenant()` y excepciones públicas justificadas. Si no cabe, se entrega inventario manual y guard automático en S3.
- **S2-07 / P1:** contrato mínimo `notification.created` en `packages/contracts/events/` con esquema, autenticación y tenant; no implementar gateway único RF-27 en este sprint. El esquema se acuerda con S2/S3 antes de publicarlo como estable.
- **S2-08 / P1:** `AccessControlService`, `GradingScaleService` y versión final de `AuditService` solo cuando exista primer consumidor revisado. En S2 se fijan DTO/semántica; no se crean interfaces vacías. La persistencia de `AuditEntryInput.motivo` es una brecha concreta a corregir antes de integración RF-66 en S5.

## Orden de ejecución durante las dos semanas

| Días | Contratos (A) | Seguridad (B) | Pruebas y CI (C) | Revisión conjunta |
|---|---|---|---|---|
| 1–2 | Inventario 46/57, tabla de códigos, esquema raíz | Mapear claims y respuestas de error; sin cambio incompatible | Definir app HTTP testeable, bootstrap de migraciones/rol y servicios PG/Redis para CI | ADR-002/005, consumidores y ventana de transición |
| 3–4 | Dividir YAML y validar equivalencia | Implementar rechazo de tenant discordante con tests | Arranque aislado del test A/B | Diff de contrato y límites de tenant |
| 5–6 | DTO iniciales, generación de tipos y consumo FE | Migrar claim y unificar códigos según versión acordada | Casos A/B por SQL y rutas | Demostración intermedia y ajuste de aserciones |
| 7–8 | `check:generated`, justificar advertencias ambiguas existentes o preparar alias versionados | Corregir ramas de error restantes | Pool reutilizado, Redis no disponible, CI | Revisión cruzada de archivos compartidos |
| 9–10 | Congelar versión publicada de S2 | Correcciones finales | CI y regresión | Demo, evidencia por historia y cierre/gaps |

Si la revisión de ADR/consumidores no llega a tiempo, se integran S2-01 y pruebas no disruptivas, y se dejan S2-03/04 sin publicar. No se usa una aprobación de agentes como sustituto de la firma de los responsables.

## Definition of Done y puerta de salida

1. `packages/contracts`: lint sin errores, 46 paths/57 operaciones o cambios explícitos aprobados, tipos generados reproducibles y ejemplos de éxito/error acordes al backend. Las ambigüedades existentes se documentan con su ruta y orden Express; solo se eliminan mediante alias/cambio versionado acordado. No se ocultan con una renumeración de archivos YAML.
2. `backend`: `npm run lint`, `npm run build`, `npm test`; pruebas de catálogo HTTP, cabecera discordante, claim de transición y fallo cerrado con Redis indisponible para petición protegida y refresh. Ninguna ruta protegida toma tenant de entrada del cliente como autoridad.
3. `database`: `npm test` conserva 33/33; CI añade PostgreSQL/Redis reales para casos A/B sin sustituir PGlite. Las pruebas comprueban el rol de ejecución miembro de `sms_app` sin `BYPASSRLS`, migraciones aplicadas y conexiones reutilizadas.
4. `frontend`: `npm run lint`, `npm run build`; sesión/cliente compilan con tipos generados. Si se edita UI, aplicar `primereact-guardian` G0–G6 y auditor; este sprint no exige rediseño visual.
5. Revisión de diff, evidencia por historia (RF/RNF/ADR, comando y salida), guía breve de transición para consumidores y lista de riesgos transferidos a S3/S7. Los ADR solo cambian a `Aceptado` con el acta y responsables requeridos.

**Demostración de cierre:** generar los tipos desde cero, levantar en CI la API con PostgreSQL/Redis y dos instituciones ficticias, autenticar A, consultar una ruta de A, intentar leer/escribir B por API y SQL, enviar `X-Tenant-ID` discordante, reutilizar la conexión y cortar Redis. Mostrar respuestas 403/503 y que B sigue aislado. La demostración no usa datos del plantel.

**RF y RNF relacionados:** RF-01–04 (acceso y RBAC), RF-07 (tenant/sede), RF-65/68 (auditoría y datos), RNF-05–08 (seguridad), RNF-16–18 (modularidad, pruebas y contrato). **Fuera de S2:** activar terceros reales, RF-66 integrada con notas/asistencia, rangos CNEB D-16, consentimiento real RF-75, migración *contract* de identidad y despliegue productivo.
