# Sprint 6 — Evidencia técnica (cierre del piloto y contratos con consumidores)

**Base:** `dev` en `4a9ff17` más el plan `docs/core/PLAN_IMPLEMENTACION_S6_S9.md`. **Rama de trabajo:** `claude/quirky-feynman-2mt29e`. **Estado:** implementación en el árbol de trabajo, **sin commit** (pendiente de autorización del líder). CI de GitHub aún no ejecutado sobre estos cambios.
**Entorno de verificación local (2026-11-07):** PostgreSQL 16 y Redis 7 locales con las mismas variables que el job `core-integration`. Datos ficticios únicamente.

## Historias

| Historia | Entrega | Evidencia | Estado |
|---|---|---|---|
| S6-00 | (a) Corrección de `chore/saas-tenant-foundation` (contraseña fuera de `docker-compose.yml`, puertos en `127.0.0.1`) aplicada con `.env.example` raíz y README sin contraseña. (b) Retirado el claim heredado `tenantId` y la variable `JWT_LEGACY_TENANT_ACCEPT_UNTIL`. (c) Eliminada la dependencia sin uso `express-rate-limit`. (d) Cabecera de `PLAN.md` actualizada. | `docker compose config` sin `.env` falla con «Defina POSTGRES_PASSWORD en .env local» y con `.env` pasa. Unitaria `jwt-claims` e integración «S6-00»: `tenantId` solo o junto a `tenant_id` → 401 `UNAUTHENTICATED`; el token canónico → 200. | Hecho. (e) Borrar `codex/core-sprint-{3,4,5}`: pendiente del líder. |
| S6-01 | `20261107000100_s1_cierre_privilegios_sin_tenant.sql`: `REVOKE ALL` a `sms_app` sobre 9 tablas heredadas sin tenant; `permisos_core` pasa a solo lectura (H11); `pgmigrations` sin acceso (H12). | `database/tests` «S6-01»: sobre el esquema previo detecta las 11 tablas y la escritura en `permisos_core`; con todas las migraciones solo quedan los 3 catálogos globales, que son de solo lectura; `SELECT` sobre `calificaciones` → `permission denied`. | Hecho |
| S6-02 | `backend/tests/tenant-scope-guard.test.cjs`: `pool.query`/`pool.connect` solo en usos revisados con cantidad exacta; importar `pool` (incluso con alias) fuera de esa lista falla; `new Pool`/`new Client` solo en `config/` y `scripts/`. La reutilización de conexiones ya estaba cubierta por la integración «sms_runtime aplica RLS… limpia el contexto del pool». | Inyecciones simuladas detectadas: `import { pool as __p }` en `school.routes.ts` y `pool.connect()` en `users.service.ts` (ambas revertidas). | Hecho. Ajuste: sin `withSystemScope()` (ver plan). |
| S6-03 | DTO concretos en `packages/contracts/openapi/`: se eliminan el esquema y la respuesta genéricos `Success`; 8 DTO nuevos (`Institution`, `Site`, `AcademicYear`, `AcademicPeriod`, `NonSchoolDay`, `Section`, `GradingScale`, `Notification`) y 30 respuestas con nombre; las 11 operaciones que solo devuelven `{message}` reutilizan `Message`. `Health` describe `services.auditPartitions` (S6-07). Tipos regenerados. | Referencias genéricas: **38 → 0** (el plan estimaba 36). `lint` válido sin advertencias nuevas; `check:inventory` 48 rutas y 60 operaciones (la cifra 46/57 de S2/S3 correspondía a `core.yaml`, copia histórica sin uso); `check:generated` reproducible. La suite integrada valida 22 operaciones más contra el esquema (`assertContract`: 25 → 47 llamadas). Las 16 operaciones que la suite no ejerce se validaron una vez contra respuestas reales con una prueba temporal que no se versionó. | Hecho. |
| S6-04 | `20261107000200_s1_asistencia_tenant_y_correccion_auditada.sql` y [contrato](CONTRATO_RF66_ASISTENCIA.md): `tenant_id`, FK compuesta y RLS en `asistencias_alumnos` y `avisos_inasistencia`; `sms_app` sin `UPDATE` directo; `fn_corregir_asistencia()` con motivo, IP y auditoría en la misma transacción. | `database/tests` «S6-04 y S6-06»: aislamiento A/B; FK rechaza matrícula ajena; `UPDATE` directo → `permission denied`; errores de motivo, IP, sin cambio, otro tenant y sin actor; reversión conjunta; evento con antes/después, motivo y autor; cadena íntegra. | Hecho en el Core; endpoint HTTP y permiso pendientes del Squad 2 (D-S2). |
| S6-05 | — | Reasignada al Squad 2 según `CONTRATO_FICHA_RF15_RF75.md` (ver plan). | No aplica al Core |
| S6-06 | `20261107000300_s1_aforo_seccion.sql`: `SECTION_FULL` con bloqueo de la fila de la sección. | `database/tests`: límite, cupo liberado al retirar, reactivación rechazada, otro tenant no comparte ocupación. Integración «S6-06»: dos matrículas concurrentes con aforo 1 → una aceptada y una `SECTION_FULL`. **Contraprueba:** sin `FOR UPDATE` la misma prueba falla (entran ambas). | Hecho en el Core; consumo pendiente del Squad 2. |
| S6-07 | `/health` informa `services.auditPartitions` (`OK`, `MISSING_NEXT_MONTH` con 200, `MISSING_CURRENT_MONTH` con 503, `UNKNOWN`); runbook con cron y alertas en `OPERACION_CORE.md`. | Integración «S6-07»: retira la partición del mes siguiente → `MISSING_NEXT_MONTH` con 200; al recrearla → `OK`. | Hecho; esquema `Health` actualizado y validado en la prueba. |
| S6-08 | Inspección visual autenticada con el Playwright del entorno, sin dependencia nueva en el repositorio: plantel y SUPERADMIN ficticios, activación por correo de captura, recorrido de Usuarios, alta e invitación, importación, edición, Año lectivo, Avisos, Auditoría y PDF, Roles, Apoderados, Perfil y cierre de sesión, a 375 y 1280 px (55 capturas, fuera del repositorio). | **2 defectos altos corregidos:** el tema PrimeReact quedaba anulado por el preflight de Tailwind sin capa (orden de capas en `frontend/app/css-layers.css`; activación: borde del input 0 → 1 px y botón transparente → granate; las 8 páginas del portal quedan idénticas píxel a píxel antes y después, salvo un punto animado), y la página tenía scroll horizontal a 375 px (`TabView scrollable`). Defectos medios de interfaz corregidos: error de red en inglés y prefijo «Error:». Defectos medios de validación en el backend: ver la sección siguiente. | Hecho; falta repetir la inspección autenticada tras integrar todo. |
| S6-09 | Ensayo del *contract* sobre la copia del piloto. | Sin datos reales del piloto: la puerta sigue abierta. | Abierta |

## Verificaciones ejecutadas

Entorno local con las variables del job `core-integration`. Base nueva para la suite final.

| Comando | Antes (`dev`) | Después |
|---|---|---|
| `database npm test` (PGlite) | 33/33 | **42/42** |
| `backend npm run lint` / `npm run build` | — | 0 errores / OK |
| `backend npm test` (unitarias y guarda S6-02) | 10/10 | **14/14** |
| `backend npm run test:integration` (PostgreSQL 16 + Redis 7) | 24/24 | **27/27** |
| `database npm run audit:partitions` y `notifications:retain` | OK | OK |
| `pg_dump -Fc` → `pg_restore` en otra base, `verify-restored`, `verify-backfill` | — | OK |
| `verify-identity-contract`, `migrate:contract` en la copia, `verify-contract` | — | OK |
| `test:integration` sobre la copia tras *contract* | — | **27/27** |
| `packages/contracts`: `lint`, `check:inventory`, `check:generated` | válido | válido; 48/60; reproducible |
| M8 (`backend/squad_3_calificaciones`): `npm run check`, `npm test` | — | OK; 16/16 |
| `frontend npm run lint` / `npm run build` | — | 0 errores (66 advertencias previas) / OK |
| `docker compose config` sin `.env` / con `.env` | — | falla con mensaje / OK |

**Contrapruebas de las guardas:** S6-01 detecta las 11 tablas sobre el esquema previo; S6-02 detecta `pool` importado con alias y `pool.connect()` nuevo; S6-06 falla sin `FOR UPDATE`.

## Defectos encontrados al derivar los DTO (corregidos en `b83ba1a`)

1. **Fechas `DATE`.** Salían como instante ISO; ahora salen como `YYYY-MM-DD` (parser de `pg` en `config/database.ts`). Esto corrige además las validaciones `OUT_OF_YEAR` de periodos y días no lectivos, que comparaban texto con `Date` y nunca rechazaban nada. **Cambio de formato de la API.**
2. **`GET /users/roles`** responde 500 `ROLES_ERROR` en lugar de quedar colgado. Era la única ruta sin `try/catch`.
3. **Preferencias de aviso:** el `PUT` responde `{categoria, por_correo}`, igual que el `GET`. El cuerpo de la petición sigue siendo `{porCorreo}`. **Cambio de formato de la respuesta.**
4. **Contrato:** el `DELETE` de vínculos declara el 404 `LINK_NOT_FOUND`.
5. **`GET /guardians/links`** devuelve solo vínculos activos; `?estado=todos` incluye los revocados y un valor inválido da 400. Decisión basada en RF-75, que no pide historial («al desvincular o dar de baja (RF-72) pierde el acceso de inmediato»).

Cada corrección tiene una prueba «S7: …» en `tenant-isolation.test.cjs` que falla sin el cambio (comprobado revirtiendo `backend/src`: 26/31).

