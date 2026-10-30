# Sprint 1 — Inventario y decisiones del Core SaaS multi tenant

**Corte de evidencia:** `dev` al 2026-10-30. **Estado:** inventario técnico preparado; aceptación y decisiones formales pendientes. Este documento distingue existencia de código de cumplimiento funcional probado. La referencia normativa de los 22 RF y CU es `D - Base 1 - 01092026/Fase 2/`; la ubicación arquitectónica detallada está en `docs/requirements/matriz-rf-arquitectura.md`.

## Resultado del inventario

- Los 22 RF del Squad 1 están repartidos en M1, M2, M3 y M12. La matriz arquitectónica registra **21 con código y contrato, sin aceptación integrada**; RF-66 tiene ubicación definida, pero requiere integración con las mutaciones de Squads 2/3. RF-13 tiene bloqueada la publicación de rangos por D-16.
- Hay rutas Express para auth, usuarios, escuela, apoderados, avisos y auditoría; `packages/contracts/openapi/core.yaml` los describe. El frontend del Core usa `SessionProvider`, `AccessLinkForm` y `CoreModuleView`. El esquema ejecutable es `database/migrations/`.
- `backend/tests/core.test.cjs` prueba cifrado, tokens e importación CSV/XLSX; `backend/tests/http-errors.test.cjs` prueba errores HTTP; `database/tests/migraciones.test.mjs` prueba migraciones/RLS/cadena. **No hay prueba de aceptación por cada RF ni prueba de punta a punta con PostgreSQL, Redis y SMTP reales.** El reporte de verificaciones del 25-10-2026 está en `docs/architecture/06-verificacion-y-pendientes.md`.
- Los metadatos del SDD de Squad 1 dicen 18 RF/CU y no cuentan RF-72, 73, 75 y 76; su matriz §7 tiene 16 filas y omite otros seis RF. El alcance vigente es 22. RF-05/CU-USR-01 prescriben contraseña provisional por correo; el Core y `docs/core/OPERACION_CORE.md` usan invitación de un uso. Estas discrepancias requieren enmienda normativa revisada.
- La revisión detallada de decisiones está en `SPRINT_01_REVISION_ADR.md`, las enmiendas propuestas en `SPRINT_01_ENMIENDAS_NORMATIVAS.md`, los contratos consumidores en `SPRINT_01_CONTRATOS_CONSUMIDORES.md` y las resoluciones para revisión en `SPRINT_01_ACTA_PROPUESTA.md`. Son insumos para el consejo de diseño, no firmas.

### Verificación local de la línea base (2026-10-30)

| Proyecto | Resultado | Límite |
|---|---|---|
| `backend/` → `npm test` | 9/9; incluye compilación TypeScript | Unitarias y errores HTTP efímeros; sin PostgreSQL/Redis reales |
| `database/` → `npm test` | 33/33; incluye migraciones, RLS y cadena en PGlite | No sustituye PostgreSQL 16 real con pool del backend |
| `packages/contracts/` → `npm run lint` | Válido, 113 advertencias | DTO genéricos y rutas ambiguas siguen pendientes |
| Entorno | `docker` no está disponible en esta máquina | Prueba integrada programada en S3 |

## Matriz RF → evidencia → aceptación faltante

`C` = código y contrato observables; `I` = integración con servicios reales pendiente; `D` = decisión institucional; `X` = integración entre squads. Cada fila debe recibir evidencia de prueba concreta antes de marcarse aceptada.

| RF / CU | Evidencia principal | Estado | Prueba de salida pendiente | Sprint |
|---|---|---|---|---|
| 01 / SEG-01 | `routes/auth.routes.ts`, `services/auth.service.ts`, `core.yaml` | C, I | Login válido/inválido en dos tenants, sin enumeración | S3 |
| 02 / SEG-02 | `auth.routes.ts`, `auth.middleware.ts`, sesiones/Redis | C, I | Refresh rotado, logout, inactividad y revocación | S3 |
| 03 / SEG-03 | `auth.controller.ts`, `enlaces_acceso` | C, I | Enlace expirado/usado, correo y revocación de sesiones | S3 |
| 04 / SEG-04 | `rbac.middleware.ts`, `users.routes.ts`, permisos | C, I | Cambio de rol efectivo en siguiente petición; último admin protegido | S3–S4 |
| 05 / USR-01 | `users.routes.ts` (`POST /users` y `POST /users/:id/invite` separados), `/auth/activate` | C, I, D | Comprobar alta pendiente, envío explícito y activación; acordar si el alta debe disparar invitación; enmienda RF/CU | S1, S4 |
| 06 / USR-02 | `user-import.service.ts`, `/users/import/*` | C, I | CSV/XLSX idempotente con filas inválidas y tenant aislado | S4 |
| 07 / USR-03 | `school.routes.ts`, `instituciones` (tenant), `sedes` (dentro del tenant) | C, I, D | Resolver contradicción RF-07 sede/tenant; dos tenants provisionados y sedes aisladas; plano SaaS separado | S1, S3, S6 |
| 08 / USR-04 | `users.routes.ts`, `CoreModuleView.tsx` | C, I | Búsqueda/paginación sin resultados de otro tenant | S4 |
| 09 / USR-05 | `users.routes.ts`, `CoreModuleView.tsx` | C, I | Perfil propio y cambio de clave que revoca sesiones | S4 |
| 10 / INS-01 | `school.routes.ts`, `anios_lectivos`, `dias_no_lectivos` | C, I | Año nuevo sin recrear persona/cuenta | S4 |
| 11 / INS-02 | `school.routes.ts`, `periodos_academicos` | C, I | Apertura/cierre y periodos sin solapamiento | S4 |
| 12 / INS-03 | `school.routes.ts`, `grados_secciones` | C, I, X | Unicidad y contrato de consumo S2/S3 | S4 |
| 13 / INS-04 | `school.routes.ts`, `escalas_calificacion` | C, I, D | Versión/aprobación; rangos solo tras D-16 | S4 |
| 14 / INS-05 | `school.routes.ts`, `configuracion_institucional` | C, I | Membrete/configuración sin cruce entre tenants | S4 |
| 65 / AUD-01 | `audit.service.ts`, `logs_auditoria` | C, I | Mutación y registro atómicos; cadena íntegra | S3, S5 |
| 66 / AUD-02 | `audit.service.ts`, M8 y futuro S2 | X | Nota/asistencia con antes, después, actor y motivo en misma transacción | S5 |
| 67 / AUD-03 | `audit.routes.ts`, `CoreModuleView.tsx` | C, I | Búsqueda/exportación autorizada y limitada por tenant | S5 |
| 68 / AUD-04 | `identity-crypto.ts`, `/users/:id/document` | C, I | Cifrado, enmascarado, motivo, auditoría y restauración | S3, S5 |
| 72 / USR-06 | `users.routes.ts` edición/baja/reactivación | C, I | Baja revoca sesiones y reactivación exige invitación | S4 |
| 73 / USR-07 | `users.routes.ts` roles | C, I | Reasignación auditada sin escalada de privilegios | S4 |
| 75 / USR-08 | `guardians.routes.ts`, consentimientos | C, I, D | Vínculo/consentimiento/revocación; texto legal aprobado | S5 |
| 76 / USR-09 | `notifications.routes.ts`, `notifications.service.ts` | C, I | Reintento SMTP, preferencias, WS y aislamiento A/B | S5, S7 |

## Contratos a revisar con consumidores

| Consumidor | Contrato actual o punto de integración | Acuerdo pendiente |
|---|---|---|
| Squad 2 | `persona_id` estable, `GET /users/persons`, año/secciones de `/school/*` | Qué datos mínimos puede consultar sin duplicar identidad; quién escribe la matrícula; cómo propaga el contexto tenant |
| Squad 3 | `/school/years/{id}/scales`, aprobación de escala, servicio M8 con audiencia JWT distinta | Versión inmutable de escala, D-16 y forma del token interno del gateway (ADR-001) |
| Squads 2/3 | `AuditService.record` y `fn_registrar_auditoria()` | DTO obligatorio para antes/después, autor, motivo y transacción compartida de RF-66 |
| Squads 2–5 | `NotificationService.create` y `/notifications/*` | Categorías, idempotencia, preferencias, cola y un único gateway WebSocket |
| Squad 5 | `/school/institution` | Versión/estructura de membrete para documentos, sin lectura directa de tablas Core |

Estas son propuestas de revisión, no contratos congelados. El archivo `core.yaml` es la descripción ejecutable actual; se dividirá y tipará en S2 después de acordar los DTO y errores con consumidores.

## Backlog priorizado para el siguiente sprint

| Prioridad | Ítem | Entrega comprobable | Responsable propuesto |
|---|---|---|---|
| P0 | Resolver catálogo de errores P-05 y estructura OpenAPI ADR-005 | Códigos estables, rutas separadas, tipos generados y lint | Squad 1; consumidores S2/S3 revisan |
| P0 | Test de aislamiento por tenant en API/RLS | Casos A→B y ausencia de contexto, en CI | Squad 1 |
| P0 | Acordar contrato de identidad, escala y auditoría | Interfaces y DTO revisados por S2/S3/S5 | Squads 1/2/3/5 |
| P1 | Enmendar RF-05/CU-USR-01 y SDD Squad 1 | 22 RF/CU y activación de un uso coherentes | Squad 1; Dirección valida proceso |
| P1 | Probar restauración antes de *contract* de identidad | Runbook, tiempo y prueba de integridad | Líder + Squad 1 |
| P1 | Definir identidad y autoridad del operador SaaS | ADR-014 revisado, sin acceso a datos escolares | Líder + Squad 1 + responsable de datos |

## Registro de decisiones y bloqueos

| Decisión | Situación comprobada | Siguiente acción / dueño |
|---|---|---|
| ADR-001–005 | Todos figuran `Propuesto` en el índice ADR, aunque parte de su diseño ya está codificado | Consejo de diseño de los 5 squads: aceptar o corregir; no cambiarles estado sin acta |
| ADR-014 | Propuesta de plano de control, estados y separación de operador | Líder, Squad 1 y responsable de datos: revisar autoridad y límites |
| RF-05 | Norma manda contraseña provisional; código usa enlace de activación | Líder decidió envío explícito el 2026-10-30; Squad 1/Dirección revisan enmienda de RF/CU |
| SDD Squad 1 | Declara 18 RF/CU frente a 22 vigentes | Squad 1 actualiza trazabilidad y diagramas tras revisar requisitos añadidos |
| D-16 | Rangos numéricos CNEB no aprobados | Coordinación académica decide; no publicar valores supuestos |
| RF-75 | Versión y texto oficial de consentimiento faltantes | Dirección/responsable de datos aprueba antes de usar datos reales |
| D-19 | Hosting de backend/WebSocket y recuperación sin cerrar | Líder define entorno para S3 y salida S8 |
| Alcance SaaS | Piloto actual restringido a Guamán Poma de Ayala | Líder confirmó mantener solo el piloto el 2026-10-30; se permiten dos tenants ficticios de prueba |
| Unidad de tenant | RF-07 confunde sede e institución | Líder decidió institución = tenant y sede interna el 2026-10-30; Squad 1/Dirección revisan enmienda |

## Enmienda propuesta para RF-05 y CU-USR-01

Texto normativo propuesto para reemplazar la entrega de contraseña provisional, sujeto a revisión de Dirección y Squad 1:

> Al registrar una cuenta, el sistema la dejará pendiente de activación y enviará al correo verificado una invitación de un solo uso y vigencia limitada. La persona definirá su propia contraseña antes del primer acceso. El sistema no enviará ni mostrará contraseñas por correo, registrará el alta y la activación en auditoría y rechazará invitaciones vencidas o ya usadas.

El criterio de aceptación correspondiente debe comprobar duplicados por documento/correo dentro del tenant, entrega solo al destinatario verificado, expiración, uso único, clave con bcrypt y ausencia de sesión previa a la activación. En CU-USR-01 deben sustituirse los pasos 6–7, la garantía de éxito y RN-USR-02. El flujo alternativo de duplicados no debe revelar datos de otra institución. Esta propuesta no modifica aún la fuente normativa.

## Criterio de cierre del Sprint 1

El inventario y el backlog quedan preparados con evidencia de repositorio. Las tres decisiones de producto solicitadas al líder están registradas: institución como tenant, invitación explícita y piloto como único despliegue real. El sprint **no está formalmente cerrado** hasta que el consejo de diseño revise ADR-001–005 y ADR-014 y los squads consumidores acuerden sus contratos. Esas firmas son decisiones externas, no resultados que pueda inferirse del código.
