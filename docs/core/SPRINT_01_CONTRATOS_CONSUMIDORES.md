# Sprint 1 — Contratos del Core para Squads 2, 3 y 5

**Corte:** 2026-10-30. **Estado:** propuesta técnica para revisión de productores y consumidores; ninguna interfaz nueva de este documento está implementada o aprobada. Se examinó `packages/contracts/openapi/core.yaml`, las rutas/servicios vigentes y `docs/architecture/02-dependencias.md` / `04-backend.md`. El contrato actual es un único YAML del Squad 1, todavía sin tipos generados y sin las rutas de los demás squads (ADR-005 propuesto).

## Reglas compartidas que deben quedar congeladas primero

1. El Core produce una identidad de usuario/tenant validada. Un consumidor recibe `tenantId` desde la sesión comprobada por `authenticateJwt`, y el acceso a datos ocurre con `withTenant(tenantId, userId, fn)`. No se acepta `tenant_id` del cuerpo o una cabecera como autoridad (ADR-002/003).
2. El contrato HTTP usa `/api/v1`, éxito `{success:true,data,timestamp}` y fallo `{success:false,error:{code,message,details?},timestamp}`. Los estados HTTP expresan el resultado y `code` es estable. Las respuestas actuales de `core.yaml` tipan `data` como `{}`; esto **no** basta para que otro squad desarrolle contra DTO verificables.
3. En el monolito común, las llamadas entre módulos van por un servicio público del módulo propietario, no por su repositorio o tabla. Una mutación sensible y `AuditService.record` usan el mismo `PoolClient` y transacción.
4. El contrato de WebSocket no está en OpenAPI; un catálogo de eventos y sus esquemas debe quedar en AsyncAPI o formato equivalente antes de que otros squads emitan eventos. El gateway de M8 sigue siendo una decisión de ADR-001.
5. El administrador `SUPERADMIN` es de un tenant. El futuro operador SaaS del ADR-014 no obtiene permisos sobre los datos de los módulos consumidores.

## Matriz productor → consumidor

| Productor | Consumidor / RF | Evidencia actual | Contrato mínimo propuesto para revisión | Prueba de aceptación del contrato |
|---|---|---|---|---|
| Core identidad y RBAC | Squad 2, RF-15/16/78 | `personas` es identidad durable; `GET /users/persons` existe, pero requiere `guardians:manage` y devuelve datos para búsqueda de vínculo | Servicio interno `PersonIdentityService`: resolver una persona por `personaId` y criterios autorizados dentro de `tenantId`; devolver `personaId`, tipo de persona, estado y campos mínimos enmascarados. No reutilizar la búsqueda de apoderados para matrícula | S2 resuelve persona de A, no puede resolver la de B y reimportar padrón conserva `personaId`; ningún dato sensible se desenmascara por defecto |
| Core configuración | Squad 2, RF-15–19 | `GET /school/years`, `/school/years/{id}/sections` | Servicio `SchoolCalendarService`: año activo y secciones vigentes de ese tenant con IDs UUID y estado; la matrícula queda en S2 | S2 rechaza sección de otro año o tenant y cuenta de persona se mantiene al cambiar de año |
| Core escala RF-13 | Squad 3, RF-36–46 | `GET /school/years/{id}/scales` devuelve `id,nivel,modalidad,estado,aprobada_en,rangos`; M8 usa `Scale {ad,a,b}` numérica | `GradingScaleService` devuelve versión/ID inmutable, tenant, año, nivel, modalidad, estado y rangos AD/A/B/C; adaptador explícito a `Scale` de M8 solo para escala vigente aprobada | M8 rechaza escala en borrador o de otro tenant; valores numéricos se publican solo tras D-16; cambio de versión no altera una planilla ya cerrada |
| Core sesión/RBAC | Gateway hacia M8, RF-36–46 | M8 exige audiencia `sms-grades`; backend común valida `sms-core`; gateway no existe | `AccessControlService` valida usuario, tenant, sesión y permisos actuales y emite una credencial interna de audiencia `sms-grades` ≤60 s, sin entregarla al navegador | Token de un tenant/rol inválido no pasa a M8; revocar rol o sesión bloquea la siguiente petición y conexión WS |
| Core auditoría RF-65/66 | Squads 2 y 3, RF-20–35 y RF-36–46 | `AuditService.record(entry, client?)` existe; `AuditEntryInput` tiene `motivo`, pero el SQL de `record` no lo envía a `fn_registrar_auditoria()` | DTO estable con `tenantId`, `usuarioId`, acción, entidad/ID, antes, después, motivo y referencia de operación; uso del mismo `PoolClient` que la mutación. Acordar dónde persiste el motivo sin perderlo | Cambio de asistencia/nota y auditoría confirman o revierten juntos; consulta muestra actor, motivo y antes/después; A no ve logs de B |
| Core notificaciones RF-76 | Squad 2, RF-24/77; otros squads que emitan avisos | `NotificationService.create(client, tenantId, userId, input)` persiste aviso y correo; `publish` usa `sms:notice:<tenant>:<user>` | Servicio interno con categoría versionada, prioridad, destinatario y clave de idempotencia; evento WS `notification.created` con payload mínimo y tenant derivado del contexto | Reintento no duplica aviso; preferencias de correo se respetan; evento de A no llega a B |
| Core configuración RF-14 | Squad 5, RF-59–64 | `GET /school/institution`; datos en `configuracion_institucional` | DTO de membrete versionado: identificador institucional, nombre visible, sede, dirección y recurso autorizado de logotipo si existe. Decidir campos exactos con S5 antes de generar PDF | S5 genera documento con datos de su tenant y no puede usar membrete de otro; versión usada queda trazable |
| Core identidad/privacidad | Squad 5, reportes nominativos | `users/:id/document` desenmascara por permiso y motivo; no es endpoint general de reportes | Consulta interna mínima por `personaId` con campos permitidos para el documento oficial; sin acceso directo a columnas cifradas | El reporte registra finalidad/acceso sensible, no expone documentos en logs o caché y falla si persona no pertenece al tenant |

## Discrepancias comprobadas que bloquean congelar contratos

| ID | Evidencia | Impacto y resolución propuesta |
|---|---|
| C-01 | `core.yaml` usa `Success.data: {}` y `Error.code: string`; casi todas las rutas usan una respuesta genérica sin request DTO | Definir DTO y errores por operación, paginación y códigos estables antes de generar tipos. Dividir `core.yaml` según ADR-005 y validar respuesta real contra esquema |
| C-02 | `auth.middleware.ts`, `rbac.middleware.ts`, rutas de escuela y usuarios emiten `UNAUTHORIZED`, `TOKEN_INVALID`, `FORBIDDEN`, `VALIDATION_ERROR`, `TOO_MANY_ATTEMPTS`; ADR-005 define `UNAUTHENTICATED`, `ACCESS_DENIED`, `VALIDATION_FAILED`, `RATE_LIMITED` | Publicar una tabla de migración de códigos y corregir productor y consumidores en el mismo cambio. No congelar errores actuales como API pública |
| C-03 | `AuditEntryInput.motivo` aparece en la interfaz, pero `AuditService.record` no lo pasa a la función SQL | RF-66 no tiene contrato suficiente para trazabilidad de motivo. Definir persistencia y prueba de transacción antes de integrar S2/S3 |
| C-04 | `GET /users/persons` está restringido a `guardians:manage` y limitado a 30 resultados; S2 necesita resolver identidad para matrícula | Servicio interno propio para S2 con autorización específica. La ruta de apoderados conserva su uso original |
| C-05 | M8 usa `Scale {ad,a,b}` y el Core ofrece rangos AD/A/B/C; D-16 no aprobó fronteras | Acordar transformación, versión y política de escala no aprobada; no incorporar números de fixtures a producción |
| C-06 | `NotificationService` usa canales Redis con tenant, pero `core.yaml` no describe eventos WS y `NotificationService.create` no admite clave de idempotencia | Definir evento y semántica de reintentos con S2 antes de que RF-77 consuma avisos; evaluar gateway WS único |
| C-07 | `core.yaml` declara `GET /school/institution` sin esquema de `data`; S5 necesita campos y versión de membrete | Producir DTO acordado con S5, incluyendo comportamiento ante logo ausente y cambios posteriores |
| C-08 | `backend/src/routes/audit.routes.ts` devuelve un error 400 sin `timestamp` en una rama, pese al sobre del ADR-005 | Añadir prueba de contrato para errores, además del camino exitoso |

## Decisiones que requieren revisión de los squads

| Decisión | Productor y revisores | Criterio para darla por acordada |
|---|---|---|
| Identidad para matrícula | S1 + S2 | S2 aprueba campos mínimos, semántica de persona existente y autorización; el Core confirma que no crea matrícula |
| Escala y gateway M8 | S1 + S3 | DTO/versionado, transformación, permisos y audiencia de token aprobados; D-16 queda como gate de rangos |
| Auditoría RF-66 | S1 + S2 + S3 | Motivo y antes/después persistidos atómicamente; una prueba conjunta por asistencia y nota |
| Avisos y tiempo real | S1 + S2 + S3 | Evento, idempotencia, categorías, permisos y gateway WS documentados |
| Membrete y datos de reportes | S1 + S5 | DTO exacto y finalidad de datos aprobados; ningún acceso directo a tablas Core |

**Estado de cierre:** matriz y propuesta terminadas; los contratos no están formalmente aprobados. La revisión de los consumidores y la aceptación de ADR-001–005 son puertas del Sprint 1 que no pueden sustituirse por esta auditoría.
