# Plan de implementación del Core — Sprints 6 a 9

**Fecha:** 2026-11-07 · **Base:** `dev` en `4a9ff17` (merge del [PR #5](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/5)) · **Responsable:** Squad 1 (Core y Seguridad), con dependencias declaradas de los Squads 2, 3 y 5.
**Relación con [`PLAN.md`](../../PLAN.md):** reemplaza la secuencia S6–S8 de la hoja de ruta. Se inserta un sprint de cierre del piloto (**S6**) antes de las capacidades SaaS. Los antiguos S6, S7 y S8 pasan a ser **S7, S8 y S9**, sin cambiar su contenido de fondo. El horizonte total sube de 8 a 9 sprints.
**Estado:** propuesto; requiere aprobación del líder del proyecto.

## 1. Justificación del reordenamiento

1. El piloto autorizado se limita a Guamán Poma de Ayala (actas S1–S5). El plano de control multi-tenant (antiguo S6) no acerca su puesta en marcha.
2. Las puertas abiertas de los 22 RF dependen hoy de los consumidores: RF-66 y RF-75 (Squad 2), RF-12 (Squad 2), RF-11 (Squad 3) y RF-14 (Squad 5). Los módulos frontend de los Squads 2–5 suman entre 64 y 211 líneas cada uno. Si no se fijan los contratos antes, cada squad integrará contra un Core que todavía se mueve.
3. La revisión del código del 2026-11-07 encontró una brecha de aislamiento que el piloto no puede arrastrar (§2.1).

## 2. Línea base verificada (2026-11-07)

### 2.1 Hallazgos que condicionan el plan

| # | Hallazgo | Evidencia | Sprint |
|---|---|---|---|
| H1 | **11 tablas de `public` no tienen `tenant_id` ni RLS, pero `sms_app` puede leerlas y escribirlas en ellas:** `asistencias_alumnos`, `asistencias_practicantes`, `avisos_inasistencia`, `calificaciones`, `evaluaciones`, `conclusiones_descriptivas`, `carnes_escolares`, `expedientes_adjuntos`, `expedientes_movimientos`, `metricas_impacto_ssu`, `noticias_galeria`. | `20261022010500_s1_rls_y_permisos.sql`: la política se aplica solo a tablas con `tenant_id`, y luego `GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO sms_app`. La migración anticipa que «la recibirán en sus migraciones». | S6-01 |
| H2 | Dos lecturas usan `pool.query` fuera de `withTenant()`, para recorrer tenants en los workers de avisos. No existe una prueba automática que impida añadir más. | `notifications.service.ts:59` y `:100`; S2-06 dejó el inventario como manual. | S6-02 |
| H3 | El lector del claim JWT antiguo `tenantId` sigue en el código. Lo habilita `JWT_LEGACY_TENANT_ACCEPT_UNTIL`, con una ventana máxima de 7 días que contaba desde el cierre del S2 (2026-10-30). | `auth.service.ts:68-73`; `SPRINT_02_TRANSICION_CONTRATOS.md`. | S6-00 |
| H4 | 36 respuestas del OpenAPI siguen siendo genéricas, en rutas que no se validan con Ajv. | `SPRINT_03_EVIDENCIA.md`, S3-06. | S6-03 |
| H5 | `express-rate-limit` está declarado y no se usa; el límite de intentos se implementa a mano con Redis. | `backend/package.json:24`; `auth.service.ts:105-114`. | S6-00 |
| H6 | `instituciones` solo tiene `activo BOOLEAN`, sin ciclo de vida. El ADR-014 sigue **Propuesto**. | Migración baseline, línea 97; ADR-014. | S7 |
| H7 | El cifrado del documento (`personas.documento_cifrado`, formato `iv‖tag‖cuerpo`) no guarda versión de clave, así que una rotación no puede distinguir los datos antiguos de los nuevos. | `core/identity-crypto.ts`; `20261022010100_s1_nucleo_identidad.sql:22`. | S8-02 |
| H8 | No hay logs estructurados ni métricas (`morgan` sin redacción; ni pino ni prom-client). | `backend/package.json`. | S8-04 |
| H9 | Nunca se inspeccionaron los flujos autenticados en un navegador. El frontend no tiene Playwright ni axe. | Actas S4/S5; `frontend/package.json`. | S6-08, S9-02 |
| H10 | `docker-compose.yml:8` y `README.md:205` publican una contraseña de PostgreSQL. El arreglo está aislado en `chore/saas-tenant-foundation` y no tiene `.env.example`. | `git diff origin/dev origin/chore/saas-tenant-foundation`. | S6-00 |

### 2.2 Activos que se reutilizan (no se reimplementan)

`withTenant()` y `assertRuntimeRole()` (`config/database.ts`); `fn_resolver_institucion()`; `fn_registrar_auditoria()` y el patrón atómico de `20261103000300_s5_auditoria_historial_notas.sql`; el flujo de invitación de un uso (S3); `bootstrap-admin.ts`; `fichas_apoderados_verificados` y el [contrato RF-15 → RF-75](CONTRATO_FICHA_RF15_RF75.md); los scripts `database npm run audit:partitions` y `notifications:retain`; la suite `backend/tests/integration/tenant-isolation.test.cjs` con dos tenants ficticios; los 6 jobs de `.github/workflows/ci.yml` (`frontend`, `backend`, `grades`, `database`, `contracts`, `core-integration`).

## 3. Calendario estimado

Sprints de 2 semanas. Las fechas son estimaciones de trabajo, no compromisos. Feriados en Perú: 08-12 y 25-12.

| Sprint | Ventana estimada | Tema | Condición de inicio |
|---|---|---|---|
| **S6** | 2026-11-09 → 2026-11-20 | Cierre del piloto y contratos con consumidores | Aprobación de este plan |
| **S7** | 2026-11-23 → 2026-12-04 | Plano de control y ciclo de vida del tenant | **ADR-014 aceptado** (D-A) |
| **S8** | 2026-12-07 → 2026-12-18 | Aislamiento extendido y operación | S7 cerrado |
| **S9** | 2027-01-04 → 2027-01-15 | Aceptación de punta a punta y salida controlada | S8 cerrado; D-19 resuelta |

S6 no depende de ADR-014 y puede empezar de inmediato. Si D-A no se resuelve antes del 2026-11-20, S8-01 a S8-04 se adelantan, porque no requieren el plano de control, y S7 se pospone.

---

## 4. Sprint 6 — Cierre del piloto y contratos con consumidores

**Objetivo:** dejar el Core del piloto sin brechas técnicas conocidas, con los contratos de RF-66, RF-75 y RF-12 ejecutables por el Squad 2 y los flujos autenticados inspeccionados en el navegador.
**Rama:** `codex/core-sprint-6` desde `dev`. **Cierre:** PR a `dev` con los 6 jobs de CI en verde.

| ID | Historia | Entrega concreta | Prueba de salida |
|---|---|---|---|
| **S6-00** | Higiene y retirada de transiciones vencidas | (a) Fusionar `chore/saas-tenant-foundation` agregando `.env.example` con `POSTGRES_PASSWORD` y quitando la contraseña de `README.md:205`. (b) Eliminar el lector de `tenantId` y la variable `JWT_LEGACY_TENANT_ACCEPT_UNTIL` (`auth.service.ts:68-73`). (c) Quitar `express-rate-limit`, o adoptarlo en S8-03 y documentarlo; no dejarlo sin uso. (d) Actualizar la cabecera de `PLAN.md`. (e) Borrar las ramas `codex/core-sprint-{3,4,5}`, ya fusionadas (lo ejecuta el líder). | Un token con `tenantId` y sin `tenant_id` recibe 401 en la suite integrada; `docker compose up` sin `.env` falla con el mensaje definido; `grep postgrespassword2026` sin resultados; `npm ls express-rate-limit` coherente con la decisión. |
| **S6-01** | **Guard de cobertura RLS** (H1) | Prueba en `database/tests/`: toda tabla de `public` sobre la que `sms_app` tenga cualquier privilegio debe tener `tenant_id` con política RLS, o figurar en una lista explícita de catálogos globales (`roles`, `permisos_core`, `banco_conclusiones_cneb`). `instituciones` se trata aparte, con su propia política. Nueva migración `2026111x_s1_cierre_privilegios_sin_tenant.sql`: **`REVOKE ALL` a `sms_app`** sobre las 11 tablas de H1, salvo `asistencias_alumnos` y `avisos_inasistencia`, que reciben `tenant_id` en S6-04. Cada squad dueño devolverá el privilegio en su propia migración, añadiendo `tenant_id` y RLS, cuando tenga un consumidor. | La prueba falla sobre `dev` actual (demuestra que detecta H1) y pasa tras la migración; `sms_app` recibe `permission denied` en `SELECT` sobre `calificaciones`; `grades` (M8, esquema `squad3`) sigue en verde. |
| **S6-02** | **Guard de contexto tenant en el pool** (H2) | (a) Prueba estática en `backend/tests/` que falla si aparece `pool.query` o `pool.connect` fuera de una lista permitida: `config/database.ts`, `health.routes.ts` y los dos workers de `notifications.service.ts`, que pasan a `withSystemScope()`, documentado como recorrido de tenants sin datos personales. (b) Prueba integrada: con `max: 1` en el pool, una transacción del tenant A seguida de una consulta fuera de transacción debe dar `current_setting('app.tenant_id', true)` vacío; después, una transacción de B solo ve filas de B. | Introducir un `pool.query` nuevo en una ruta hace fallar `npm test`; la prueba de reutilización pasa en `core-integration`. |
| **S6-03** | Contrato OpenAPI completo (H4) | Reemplazar las 36 respuestas genéricas por DTO concretos en `packages/contracts/openapi/`; regenerar los tipos; ampliar la validación Ajv de respuestas a **todas** las operaciones que ejercita la suite integrada. | `grep` de la referencia genérica = 0; `check:inventory` y `check:generated` en verde; ninguna respuesta real incumple su esquema. |
| **S6-04** | **Contrato RF-66 de asistencia** con Squad 2 | Migración: `tenant_id` en `asistencias_alumnos` y `avisos_inasistencia`, rellenado desde `matriculas.tenant_id`, `NOT NULL`, FK compuesta y RLS. Función `fn_corregir_asistencia(asistencia_id, estado, motivo)` que valida el motivo (no vacío, longitud mínima definida en el contrato) y llama a `fn_registrar_auditoria()` en la misma transacción, con antes/después, siguiendo el patrón de `20261103000300`. Documento `docs/core/CONTRATO_RF66_ASISTENCIA.md`: firma, errores, permiso `attendance:correct` y quién la invoca. El endpoint HTTP es del Squad 2. | Prueba de BD: una corrección sin motivo se rechaza; un fallo de la auditoría revierte la corrección; A no corrige registros de B. `/audit/logs` filtrado por estudiante devuelve notas (M8) y asistencia en orden temporal. |
| **S6-05** | Conciliación RF-15 → RF-75 | Script `database npm run fichas:conciliar -- --archivo <csv>`, solo con `--dry-run` o `--apply`. Valida el formato del contrato y genera un reporte de nuevas, coincidentes, discrepantes y rechazadas sin mostrar el DNI en claro. Lo ejecuta Secretaría o el Squad 2 cuando existan las fichas oficiales. | Con datos ficticios: un segundo `--apply` no produce cambios; una discrepancia de parentesco no habilita el vínculo; el reporte no contiene DNI en claro. La activación real sigue bloqueada por D-C. |
| **S6-06** | Aforo de sección (RF-12) | Disparador o restricción sobre `matriculas` que rechaza una matrícula `REGULAR` cuando ya hay tantas como `grados_secciones.aforo_maximo`, con bloqueo de la fila de la sección para evitar carreras. Error `SECTION_FULL` en el contrato. | Prueba de concurrencia: con aforo N y N+1 inserciones simultáneas, exactamente una falla. El consumidor es el Squad 2. |
| **S6-07** | Operación programada | Runbook en `OPERACION_CORE.md`: `audit:partitions` el día 20 de cada mes y `notifications:retain` a diario, con cron de ejemplo. `GET /health` informa `degraded` si falta la partición de auditoría del mes siguiente. | Prueba integrada: tras borrar la partición futura en la BD de CI, `/health` responde `degraded`; al ejecutar el script vuelve a `ok`. |
| **S6-08** | **Inspección visual autenticada** (H9) | `@playwright/test` como devDependency de `frontend/` y `frontend/tests/e2e/core.spec.ts` contra la pila local (PostgreSQL, Redis, SMTP de captura, backend y frontend) con el tenant ficticio A. Recorridos: login → directorio → alta e invitación → importación con errores → configuración de año, periodo y sección → apoderado → auditoría y PDF → logout. Capturas como evidencia en `docs/core/evidencia/s6/`. PrimeReact Guardian en cada ajuste de UI. | La suite pasa localmente y en un job nuevo `core-e2e`. Hay capturas de los estados vacío, carga y error de cada vista, más una a 375 px de ancho. Los defectos visuales encontrados se corrigen o quedan registrados. |
| **S6-09** | Ensayo del *contract* sobre la copia del piloto | **Puerta operativa, no de código:** cuando el piloto tenga datos reales, restaurar una copia, ejecutar `verify:identity-contract` y `migrate:contract` en ella y registrar tiempos. Sin datos reales queda abierta y se informa así. | Acta con conteos antes/después y descifrado verificado; o la puerta declarada abierta con su motivo. |

**Secuencia:** S6-00 → S6-01 y S6-02 en paralelo (seguridad primero) → S6-04 (depende de S6-01) → S6-03, S6-05, S6-06 y S6-07 → S6-08 al final, sobre la API ya estable.

**Puerta de salida S6:** las guardas S6-01 y S6-02 están en CI y fallarían ante una regresión; RF-66, RF-75 y RF-12 tienen un contrato ejecutable y pruebas de BD, con el consumidor declarado; el OpenAPI no tiene respuestas genéricas; existe evidencia visual de los flujos autenticados. La aceptación de los RF por los consumidores se registra aparte: el S6 no la presume.

---

## 5. Sprint 7 — Plano de control y ciclo de vida del tenant (ADR-014)

**Objetivo:** provisionar, suspender, reactivar y archivar planteles de prueba de forma idempotente y auditada, con un operador que no puede leer datos escolares.
**Condición de inicio:** ADR-014 pasa a **Aceptado**, con respuesta a sus cuatro preguntas (§8, D-A).

| ID | Historia | Entrega concreta | Prueba de salida |
|---|---|---|---|
| **S7-01** | Estado del tenant (*expand*) | Migración: `tenant_estado_enum ('solicitado','aprovisionando','activo','suspendido','archivado')`; `instituciones.estado` con valor `activo` para las filas existentes; disparador que mantiene `activo = (estado = 'activo')` durante la transición; tabla `tenant_transiciones` (tenant, de, a, actor, motivo, request_id, fecha) con solo inserción. `fn_resolver_institucion()` devuelve el tenant únicamente si está `activo`. | Una transición no permitida (p. ej. `archivado → activo`) se rechaza en la BD; las pruebas existentes no cambian; `migraciones.test.mjs` cubre la tabla de transiciones. |
| **S7-02** | Aplicar el estado en todos los canales | `authenticateJwt`, refresh y login comprueban el estado del tenant. Lo leen de Redis (`sms:tenant:{id}:estado`, TTL ≤ 30 s), lo invalidan al cambiar y **fallan cerrado** si no pueden verificarlo. Al suspender se publica `sms:tenant:{id}:suspendido`: `realtime.service.ts` cierra los sockets y los workers de `notifications.service.ts` omiten los tenants que no estén activos. | Con A suspendido en plena sesión: la petición siguiente da 403 `TENANT_SUSPENDED`, el refresh falla, el socket se cierra en ≤ 30 s y la cola de A no envía. B no se ve afectado. Con Redis caído, las rutas protegidas responden 503. |
| **S7-03** | Rol de BD `sms_control` | Rol sin `BYPASSRLS`, sin `SELECT` sobre tablas escolares y solo con `EXECUTE` sobre `fn_ctrl_provisionar`, `fn_ctrl_suspender`, `fn_ctrl_reactivar` y `fn_ctrl_archivar`, que son `SECURITY DEFINER` con `SET search_path = public, pg_temp`, validan actor y motivo y devuelven solo `(tenant_id, estado)`. Extender `bootstrap-app-role.mjs` o crear un script hermano. | Como `sms_control`, `SELECT * FROM personas` da `permission denied`; cada función rechaza un motivo vacío; `assertRuntimeRole()` rechaza que la API arranque con `sms_control`. |
| **S7-04** | CLI de provisión idempotente | `backend/src/control/cli.ts` (`npm run control -- provision|suspend|reactivate|archive`). Usa una credencial separada (`CONTROL_DB_USER`/`CONTROL_DB_PASSWORD`) y una clave de idempotencia (`--request-id`). Pasos de `provision`: crear el tenant en `solicitado` → `aprovisionando` → configuración institucional mínima → matriz de permisos por defecto → invitación de un uso al primer `SUPERADMIN` (flujo S3) → `activo`. Ante un fallo intermedio se queda en `aprovisionando` y el mismo `request-id` reanuda. `bootstrap-admin.ts` se mantiene solo para el tenant del piloto. | Crear dos tenants desde cero; simular un fallo después de la matriz de permisos y reintentar sin duplicar ni el tenant ni el administrador; el administrador invitado inicia sesión y no ve datos del otro tenant. |
| **S7-05** | Bitácora del operador | Tabla `ctrl_bitacora` de solo inserción: actor, acción, tenant_id, motivo, resultado, request_id y fecha, **sin datos personales**, encadenada con un hash igual que `logs_auditoria`. | Cada operación de la CLI deja una entrada, también cuando falla; la cadena se verifica; la prueba busca patrones de DNI o correo y no los encuentra. |
| **S7-06** | Configuración operativa por tenant | Orígenes CORS, remitente de correo y límites técnicos por tenant en una tabla de configuración técnica. **Los secretos no se guardan en la BD**: solo nombres de referencia a variables o al gestor de secretos que se elija en D-19. | Un origen no registrado para A queda rechazado por CORS en peticiones de A; ninguna columna nueva guarda credenciales (prueba de esquema). |

**Puerta de salida S7:** puntos 1 y 3 de la verificación de ADR-014 demostrados en CI (provisión dos veces tras un fallo; suspensión de A sin afectar a B) y prueba de que el operador no lee datos escolares.

---

## 6. Sprint 8 — Aislamiento extendido y operación

**Objetivo:** demostrar que ningún canal fuera de PostgreSQL filtra datos entre tenants, y poder operar el sistema sin exponer datos personales.

| ID | Historia | Entrega concreta | Prueba de salida |
|---|---|---|---|
| **S8-01** | Matriz de fugas A/B | `backend/tests/integration/tenant-leakage.test.cjs`, con un caso por canal: API, SQL con `sms_app`, búsqueda del directorio, búsqueda y PDF de auditoría, WebSocket, correo (SMTP de captura), cola de avisos, claves de Redis y archivos (escudo y membrete). Convención de claves de Redis: `sms:{tenant}:…` para todo dato del tenant; los prefijos globales actuales (`blacklist:{jti}`, `forgot:{hash}`) se documentan como globales con su justificación. | La matriz completa está en verde en `core-integration`; el informe enumera cada canal y su prueba. |
| **S8-02** | Rotación de claves (H7) | Columna `personas.documento_clave_version SMALLINT NOT NULL DEFAULT 1`; anillo de claves `ENCRYPTION_KEYS=v1:<hex>,v2:<hex>` con `ENCRYPTION_ACTIVE_VERSION`; descifrado según la versión de la fila. Script `rekey-identities.ts` por lotes transaccionales, con `--dry-run` y verificación final. La rotación del HMAC (`documento_hash`) usa una columna sombra y conmutación atómica, porque es un índice de búsqueda. | Con v1 y v2 a la vez se descifran ambas filas; tras el rekey todas las filas están en v2 y se puede retirar v1; una búsqueda por DNI funciona antes, durante y después del cambio. |
| **S8-03** | Límites de tasa y cuotas por tenant | Ventana deslizante en Redis por tenant y por usuario en las rutas protegidas; cuotas de tamaño de importación, filas exportadas (se mantiene el límite actual de 2000 en el PDF) y conexiones WebSocket por tenant, configurables en S7-06. | Una prueba de carga sobre A produce 429 en A mientras B mantiene una latencia p95 dentro del umbral de RNF; superar la cuota de sockets rechaza solo los de A. |
| **S8-04** | Observabilidad sin datos personales (H8) | Logs JSON (pino) con `request_id` y un seudónimo del tenant (HMAC), redactando DNI, correo, teléfono y tokens; `morgan` se retira. `/metrics` en formato Prometheus, protegido por red o token: latencia por ruta, errores 5xx, cola de avisos pendiente, particiones de auditoría disponibles, fallos de verificación de estado de tenant. Reglas de alerta documentadas. | La prueba de redacción no encuentra patrones de DNI, correo ni JWT en los logs de la suite integrada; `/metrics` sin credencial da 401 o 403. |
| **S8-05** | Restauración de un tenant | Procedimiento para extraer un tenant a una BD de ensayo y restaurarlo sin tocar los demás. Registra RTO y RPO medidos y la verificación de conteos, RLS y cadena de auditoría. | Ensayo documentado con tiempos; tras restaurar A, los conteos de B no cambian. |

**Puerta de salida S8:** puntos 2, 4 y 5 de la verificación de ADR-014; matriz de fugas en verde; rotación y restauración ensayadas.

---

## 7. Sprint 9 — Aceptación de punta a punta y salida controlada

| ID | Historia | Entrega concreta | Prueba de salida |
|---|---|---|---|
| **S9-01** | Prueba E2E del ciclo completo | Extender `frontend/tests/e2e/` con: provisión por CLI → invitación → primer login → alta de personal → cambio de rol en plena sesión → suspensión → reactivación → restauración. | La suite pasa en `core-e2e` con dos tenants. |
| **S9-02** | Accesibilidad WCAG 2.1 AA | `@axe-core/playwright` en cada vista del Core, más una revisión manual de teclado y foco. | Ninguna violación *serious* o *critical*; los hallazgos manuales quedan corregidos o registrados. |
| **S9-03** | Protección de ramas | En GitHub: `main` y `dev` exigen PR y los 7 jobs (6 actuales más `core-e2e`), sin push directo (AGENTS.md §4). Lo configura el líder. | Captura de la configuración en el acta. |
| **S9-04** | Runbooks y despliegue | Runbooks en `docs/core/runbooks/`: incidente de seguridad, migración *expand/contract*, rotación de claves, suspensión y baja de tenant, restauración. Actualizar `docs/deployment/guia-despliegue.md` con la decisión D-19. | Cada runbook se ensaya al menos una vez en el entorno de pruebas y se registra quién y cuándo. |
| **S9-05** | Acta de aceptación de los 22 RF | `docs/core/ACTA_ACEPTACION_CORE.md`: por RF, estado **aceptado**, **bloqueado por decisión institucional** (D-16 para RF-13; D-C para RF-75) o **bloqueado por consumidor**, con evidencia enlazada. | Ningún RF queda sin estado ni evidencia. |
| **S9-06** | Entrega de contratos a los squads | Documentar `AccessControlService`, `GradingScaleService`, `AuditService` y avisos como interfaces públicas, con su versión. | Cada squad consumidor confirma por escrito (issue o PR) haber leído su contrato. |
| **S9-07** | Liberación | Merge `dev → main` y etiqueta `core-v1.0.0`. | CI en verde en `main`; nota de versión con riesgos residuales. |

**Puerta de salida S9** (equivale a la del antiguo S8 de `PLAN.md`): los 22 RF aceptados o bloqueados solo por decisiones institucionales identificadas; pruebas con dos tenants en verde; respaldo, restauración y alertas demostrados; aprobación de seguridad, datos y alcance antes de admitir un cliente distinto del piloto.

---

## 8. Decisiones que dependen de personas (no de código)

| ID | Decisión | Responsable | Se necesita antes de | Si no llega |
|---|---|---|---|---|
| D-A | Aceptar ADR-014: custodia de la identidad del operador, entidad responsable de los datos, retención al archivar, dominio o código modular | Líder + responsables de datos | S7 | Se adelanta S8-01–04; S7 se pospone |
| D-16 | Cortes de la escala numérica CNEB | Coordinación Académica | S9-05 | RF-13 se acepta como «bloqueado institucional» |
| D-C | Texto y versión oficiales del consentimiento de apoderados | Dirección / Asesoría legal | Activación real de RF-75 | RF-75 queda probado solo con datos ficticios |
| D-19 | Alojamiento del backend y del WebSocket, proveedor de correo y gestor de secretos | Líder | S7-06, S9-04 | S9 no puede cerrar |
| D-S2 | Compromiso del Squad 2 de consumir los contratos de RF-66, RF-75 y RF-12 dentro de su propio sprint | Líder de Squad 2 | Cierre de S6 | Los contratos quedan listos sin consumidor y se informa así |

## 9. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El `REVOKE` de S6-01 rompe código de otro squad que ya lea esas tablas | Alto | Verificado el 2026-11-07: ni `backend/src` ni sus pruebas leen esas 11 tablas. `database/scripts/retain-notifications.mjs` modifica `avisos_inasistencia`, pero se conecta con el rol propietario de las migraciones (`DATABASE_URL`), no con `sms_app`. El job `grades` usa el esquema `squad3` y se vuelve a comprobar. Se avisa a los squads antes del merge. |
| El rellenado de `tenant_id` en asistencia falla con datos huérfanos | Medio | Migración con verificación previa que aborta y lista los huérfanos; ensayo sobre una copia (ADR-004). |
| La verificación de estado del tenant añade latencia en cada petición | Medio | Caché en Redis con TTL ≤ 30 s; se mide p95 en S8-03. |
| La rotación de HMAC deja búsquedas inconsistentes | Alto | Columna sombra, conmutación atómica y prueba de búsqueda durante el cambio (S8-02). |
| El E2E en CI es frágil | Medio | Datos ficticios deterministas, sin esperas fijas; `--trace off` salvo para depurar. |
| Ningún squad consume los contratos | Alto | D-S2 explícita; el acta separa «contrato listo» de «RF aceptado». |

## 10. Definition of Done (se mantiene la de `PLAN.md` y se añade)

Cada historia cierra con RF/CU o ADR, contrato, migración nueva si aplica (nunca se edita una aplicada), prueba de éxito, de error y de aislamiento A/B, auditoría de los cambios sensibles, documentación operativa y evidencia en el reporte del sprint.
Gates: `database npm test`; `backend npm run lint`, `npm run build`, `npm test` y `npm run test:integration`; `packages/contracts npm run lint`, `check:inventory` y `check:generated`; `frontend npm run lint` y `npm run build`, auditor PrimeReact cuando cambie la UI, y desde S6 `core-e2e`.
**Añadido:** cada guarda nueva (S6-01, S6-02, S8-01, S8-04) debe demostrar que **falla** ante la regresión que vigila, antes de demostrar que pasa.
El reporte de cada sprint separa: código completado, aceptación demostrada, bloqueo institucional y riesgo residual.
