# Sprint 3 — Integración real y migración segura de datos del Core

**Ventana orientativa:** 2–13 de noviembre de 2026 (10 días hábiles, Lima). **Estado:** implementación técnica completa en rama; evidencia por historia en [SPRINT_03_EVIDENCIA.md](SPRINT_03_EVIDENCIA.md). **Rama:** `codex/core-sprint-3`, desde `dev`. **Aprobación de cierre:** líder del proyecto; este plan no presupone aprobación de S3 ni ejecución sobre el piloto real.

## Objetivo y frontera

Demostrar de punta a punta los flujos principales del Core con PostgreSQL 16, Redis 7 y un SMTP de captura, siempre con dos instituciones ficticias. Probar un respaldo/restauración aislado y el backfill de identidades antes de cualquier migración *contract*. Completar la trazabilidad RF-05/RF-07 y los DTO que las pruebas de contrato S3 necesitan.

El código no activa otros planteles reales. RF-75 se prueba con un texto de consentimiento **ficticio y exclusivo de CI**; el texto/versionado institucional sigue bloqueado hasta decisión de Dirección. D-16 continúa bloqueando los rangos CNEB oficiales. Las migraciones compartidas no se aplican desde CI a entornos reales.

## Línea base comprobada

- S1/S2 están en `dev`; ADR-001–005 aceptados como decisiones por el líder. `openapi.yaml` conserva 46 rutas/57 operaciones; Redocly valida con 113 advertencias, aún hay DTO genéricos.
- [CI S2](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41139229505) pasó seis jobs técnicos. La suite integrada solo cubre login/aislamiento, rutas representativas, RLS y Redis indisponible; no cubre refresh rotado, SMTP, invitación, importación ni apoderados.
- `mail.service.ts` exige host, autenticación y TLS; no hay servidor SMTP de captura en CI. `backfill-identities.ts` tiene conteo y `--apply`, sin prueba automatizada. `docs/architecture/05-database.md` confirma que no existe restauración ensayada.
- `sdd_rules.md` todavía prescribe `tenant_id VARCHAR(50)` pese a ADR-002. RF-05/CU-USR-01 describen contraseña provisional; RF-07/CU-USR-03 confunden sede e institución. El SDD de Squad 1 declara 18 RF/CU cuando el alcance vigente es 22.

## Diseño y propiedad de estado

PostgreSQL y sus migraciones son la fuente de identidad, sesión, invitaciones, permisos, consentimientos y auditoría. Redis solo mantiene rate limit y revocación temporal; una caída debe fallar cerrado. SMTP transporta enlaces de un uso y avisos, pero no determina el estado de una cuenta: la activación ocurre al consumir el enlace válido en una transacción. El respaldo conserva datos cifrados; las claves de cifrado y HMAC quedan fuera del volcado y se custodiarán por separado. La migración *contract* solo retira columnas legadas después de restauración y backfill verificables, cero lecturas activas y una ventana de compatibilidad.

## Backlog comprometido

| ID | Prioridad y trabajo | Archivos principales | Evidencia de salida |
|---|---|---|---|
| **S3-00** | P0. Corregir reglas `tenant_id UUID`, RF-05/CU-USR-01 (alta pendiente, invitación **explícita**, sin clave provisional) y RF-07/CU-USR-03 (institución = tenant; sede interna). Actualizar SDD Squad 1 a 22 RF/CU con seis filas faltantes y estado real. | `.agents/rules/sdd_rules.md`, RF/CU de Squad 1, `sdd_squad_1.md`, `docs/requirements/matriz-rf-arquitectura.md` | Trazabilidad 22/22, enlaces válidos, sin RENIEC directo ni superadmin global; diferencias de implementación anotadas. |
| **S3-01** | P0. Crear SMTP de captura reproducible con direcciones `example.invalid`, autenticación y política TLS de prueba sin relajar producción. Inyectar su configuración en CI y registrar correo enviado sin publicar tokens. | `.github/workflows/ci.yml`, `backend/tests/integration/`, `backend/src/services/mail.service.ts`, `backend/.env.example` | Captura de enlaces de activación/recuperación/apoderado; fallo SMTP y reintento controlados; no se envían correos reales. |
| **S3-02** | P0. Extender suite HTTP A/B: login, refresh rotado/reuso, logout, RBAC 403 con auditoría, alta/importación, invitación explícita/activación, recuperación no enumerativa, apoderado con consentimiento ficticio, auditoría y fallos Redis/SMTP. | `backend/tests/integration/`, controladores/rutas/servicios del Core si se descubre una falla, `.github/workflows/ci.yml` | Estados y sobre estables; tokens viejos de refresh fallan; invitación de uso único; rollback de importación; A nunca accede a B; fallo de dependencia no abre acceso. |
| **S3-03** | P0. Ensayar `pg_dump -Fc` y `pg_restore` en una base aislada con fixtures ficticios; medir duración y comprobar conteos, RLS, cadena de auditoría y descifrado con la clave externa. Crear runbook de respaldo/restauración. | `.github/workflows/ci.yml`, `database/scripts/`, `database/README.md`, `docs/core/OPERACION_CORE.md`, `docs/architecture/05-database.md` | CI registra tiempo, éxito de restauración y pruebas en la copia; no publica volcado ni secretos. Se comprueba restauración antes de tocar columnas legadas. |
| **S3-04** | P0. Ejecutar conteo y `--apply` de backfill en copia restaurada; probar idempotencia, DNI inválido/rollback, aislamiento A/B y verificación del cifrado/índice ciego. | `backend/src/scripts/backfill-identities.ts`, `backend/tests/integration/`, `database/tests/` | Conteo previo y posterior; segunda ejecución sin cambios; anomalías impiden *contract* y quedan documentadas. |
| **S3-05** | P0 condicionado. Inventariar consumidores de columnas legadas en todo el repositorio y actualizar los que aún lean `usuarios.dni`/identidad duplicada. Crear **nueva** migración *contract* solo después de S3-03/04, prueba en copia y ventana de compatibilidad; no editar migraciones aplicadas ni ejecutar en datos reales desde CI. | `backend/src/`, `backend/squad_3_calificaciones/`, `frontend/`, `database/migrations/`, `database/tests/`, `docs/core/OPERACION_CORE.md` | Cero lecturas activas de columnas a retirar, migración ensayada con rollback operativo hacia adelante y CI verde. Si no se cumple el gate, se documenta bloqueo y no se retira la columna. |
| **S3-06** | P0. Concretar DTO de auth, usuarios, apoderados y auditoría consumidos en S3 y validar respuestas reales de éxito/error contra OpenAPI en CI. Conservar inventario 46/57 y generación reproducible. | `packages/contracts/openapi/`, `packages/contracts/src/generated.d.ts`, `backend/tests/integration/`, `.github/workflows/ci.yml` | Esquema y servidor coinciden en las rutas S3; `lint`, `check:inventory` y `check:generated` pasan; operaciones aún genéricas quedan listadas. |

## Secuencia y dependencias

| Fase | Días orientativos | Entregables | Gate |
|---|---:|---|---|
| A. Contrato y norma | 1–3 | S3-00, DTO iniciales de S3-06, fixtures/SMTP de S3-01 | RF/CU/SDD coherentes; correos capturables sin secretos reales. |
| B. Flujos reales | 3–7 | S3-02 y validación OpenAPI de S3-06 | Suite HTTP A/B con PG/Redis/SMTP verde. |
| C. Recuperación de datos | 5–9 | S3-03, S3-04 e inventario S3-05 | Restauración probada **antes** del backfill y del *contract*. |
| D. Contract y cierre | 9–10 | S3-05 si supera gates, correcciones y operación | CI completo, diff revisado, demostración y riesgos residuales. |

La cola SMTP y las pruebas de flujos pueden avanzar en paralelo con el runbook/fixture de restauración. S3-05 depende estrictamente de los resultados de S3-03/04; no se anticipa el `DROP COLUMN`. Ningún cambio de URL pública se hace para resolver advertencias Redocly sin plan de compatibilidad.

## Definition of Done

1. `backend`: `npm run lint`, `npm run build`, `npm test` y suite integrada PG16/Redis7/SMTP de captura, con dos tenants ficticios y casos de éxito, fallo, reintento y aislamiento.
2. `database`: `npm test` y CI de respaldo/restauración cronometrada en copia aislada; backfill idempotente y fallo atómico; *contract* solo tras sus gates.
3. `packages/contracts`: OpenAPI válido, inventario 46/57 preservado, tipos reproducibles y respuestas S3 contrastadas contra DTO concretos.
4. `frontend`: lint/build si se toca código; `primereact-guardian` G0–G6 y auditor si se edita interfaz React.
5. Evidencia por historia y guía de operación actualizadas; consentimiento real RF-75 y rangos D-16 se reportan como bloqueos institucionales, no como fallas de la suite ficticia.

**Demostración de salida:** alta de usuario A sin correo automático, invitación explícita capturada por SMTP, activación de uso único, login y rotación de refresh; intento desde B denegado; RBAC y auditoría; apoderado ficticio con consentimiento; respaldo y restauración de la base A/B, backfill repetido sin cambios y validación de datos cifrados. Se muestra el tiempo de restauración y el resultado del inventario de columnas legadas.
