# Sprint 5 — Evidencia de ejecución

**Base:** `dev` tras PR #4 (`f10e0ddd`). **Rama:** `codex/core-sprint-5`. **PR:** [#5](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/5), sin solicitudes de revisión. **Estado:** cierre técnico probado en [CI 41575261081](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575261081); aceptación del piloto y RF-66 entre squads pendientes.

| Historia | Cambio y prueba disponible | Estado |
|---|---|---|
| S5-00 Privacidad | `/users` entrega `telefono_enmascarado`; edición UI envía teléfono solo si fue tocado. Suite HTTP prueba ausencia de número completo y PATCH parcial. | CI verde. |
| S5-01 Familias | Core verifica contra `fichas_apoderados_verificados` antes de vincular, invitar, activar y consultar. Sin registro de Squad 2 falla cerrado; CI carga fichas ficticias. `DELETE /guardians/consent` y desvinculación revocan sesiones. | Mecanismo implementado; carga oficial y texto institucional quedan para antes del despliegue. |
| S5-02 Avisos | SEGURIDAD obligatorio en API y BD; correo solo a cuenta verificada, preferencia respetada al crear y al enviar. Cola reclama trabajo en transacción corta y reintenta; BAJA se agrupa al día siguiente (hora Lima). Contador de no leídas se actualiza por WebSocket y se prueba su cierre tras revocar la sesión. | CI verde con PostgreSQL 16, Redis 7 y SMTP ficticio. |
| S5-03 Auditoría | `/audit/logs` devuelve total filtrado y filtros de usuario, DNI convertido a hash, IP, módulo y fechas; registra lecturas sin DNI claro. El PDF comparte filtros y responde 409 al superar 2000 filas. `database audit:partitions` prepara 13 meses UTC; `notifications:retain` elimina avisos mayores de 180 días en lotes. | Filtros DNI/IP, UI forense, aislamiento A/B y retención 181/179 probados en CI inicial y restaurada. |
| S5-04 RF-66 | Trigger de PostgreSQL enlaza cada inserción en `squad3.grade_audit_history` con la cadena Core dentro de la misma transacción. La suite ficticia comprueba actor, tenant, cadena y rollback conjunto. Squad 2 aún no expone mutación de asistencia auditable en Core. | Integración M8 probada en CI; asistencia, motivo obligatorio y línea de tiempo siguen como dependencia entre squads. |

## Contrato de integración RF-66

La mutación de asistencia o calificación y `fn_registrar_auditoria` deben usar **la misma conexión PostgreSQL y la misma transacción**. Antes de ambas operaciones, establecer `app.tenant_id` y el actor; rechazar un actor sin identidad y una fila de otro tenant. El trigger de M8 toma `created_by` del historial y lo registra en la cadena Core con hashes de estados, sin duplicar datos personales. Si la escritura de la bitácora falla, toda la mutación se revierte. Squad 2 debe aplicar el mismo contrato a asistencia y agregar el motivo obligatorio de corrección; la prueba conjunta debe provocar un fallo de auditoría y comprobar que la asistencia no cambió.

## Pruebas ejecutadas localmente

- `database npm test`: 33/33.
- `backend npm run lint`, `npm run build`, `npm test`: 0 errores; 10/10 pruebas unitarias.
- `packages/contracts npm run generate`, `check:inventory`, `check:generated`: 48 rutas y 60 operaciones, tipos reproducibles. OpenAPI mantiene avisos de calidad preexistentes.
- PrimeReact Guardian: auditor 0 errores y 0 avisos. `frontend npm run lint`: 0 errores y 66 avisos preexistentes; `npm run build` compiló con el contador nuevo.
- [CI 41575261081](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575261081): seis jobs técnicos verdes y job auxiliar del PR verde. Core pasó antes y después de restaurar la base y aplicar el contract en la copia. Inspección visual autenticada aún no ejecutada por falta de backend local con datos ficticios; los estados se verifican en build, no visualmente.

## Dependencias para aceptación del piloto

1. Texto oficial de consentimiento, versión y responsable institucional.
2. Integración de carga oficial de Squad 2 conforme al [contrato RF-15 → RF-75](CONTRATO_FICHA_RF15_RF75.md); el campo libre `verificacion` ya no acredita vínculo.
3. Integración de asistencia de Squad 2 y motivo formal/línea de tiempo de RF-66. M8 ya enlaza su historial a la cadena Core y la prueba pasó en CI.
4. Ejecución mensual supervisada de `audit:partitions`; no hay scheduler incluido.

La autorización sigue limitada al piloto real de Guamán Poma de Ayala. Los tenants A/B son exclusivamente ficticios para CI.
