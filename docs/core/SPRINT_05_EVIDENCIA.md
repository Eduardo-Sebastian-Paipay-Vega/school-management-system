# Sprint 5 — Evidencia de ejecución

**Base:** `dev` tras PR #4 (`f10e0ddd`). **Rama:** `codex/core-sprint-5`. **PR:** [#5](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/5), borrador sin solicitudes de revisión. **Estado:** implementación Core probada en [CI 41570433884](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41570433884); aceptación del piloto y RF-66 entre squads pendientes.

| Historia | Cambio y prueba disponible | Estado |
|---|---|---|
| S5-00 Privacidad | `/users` entrega `telefono_enmascarado`; edición UI envía teléfono solo si fue tocado. Suite HTTP prueba ausencia de número completo y PATCH parcial. | Implementada; suite integrada pendiente de CI. |
| S5-01 Familias | Sin ficha institucional de Squad 2, altas y consulta real fallan con 503; mecanismo ficticio solo en `NODE_ENV=test`. `DELETE /guardians/consent` y desvinculación revocan sesiones; suite A/B lo comprueba. | Implementada con bloqueo real; aceptación institucional pendiente. |
| S5-02 Avisos | SEGURIDAD obligatorio en API y BD; correo solo a cuenta verificada, preferencia respetada al crear y al enviar. Cola reclama trabajo en transacción corta y reintenta; BAJA se agrupa al día siguiente (hora Lima). Contador de no leídas se actualiza por WebSocket y se prueba su cierre tras revocar la sesión. | CI verde con PostgreSQL 16, Redis 7 y SMTP ficticio. |
| S5-03 Auditoría | `/audit/logs` devuelve total filtrado, filtro usuario y registra lecturas. PDF responde 409 al superar 2000 filas. `database audit:partitions` prepara 13 meses UTC con propietario de migraciones. `notifications:retain` elimina avisos mayores de 180 días en lotes. | CI verde para la tarea operativa y prueba de límite 181/179 días en base inicial y restaurada. |
| S5-04 RF-66 | Contrato de transacción compartida definido abajo. Squad 3 conserva su `grade_audit_history` separado y Squad 2 aún no expone mutación auditable en Core. | Dependencia entre squads; no se declara cierre RF-66. |

## Contrato de integración RF-66

La mutación de asistencia o calificación y `fn_registrar_auditoria` deben usar **la misma conexión PostgreSQL y la misma transacción**. Antes de ambas operaciones, establecer `app.tenant_id` y `app.user_id` con `SET LOCAL`; rechazar un actor sin identidad y una fila de otro tenant. Si la escritura de la bitácora falla, toda la mutación se revierte. La bitácora Core almacena módulo, acción, entidad, ID, actor, IP y resumen de cambios sin DNI, teléfonos ni credenciales en claro. La historia propia de Squad 3 puede coexistir, pero no reemplaza la cadena Core para RF-66. La prueba conjunta debe provocar un fallo de auditoría y comprobar que la nota o asistencia no cambió.

## Pruebas ejecutadas localmente

- `database npm test`: 33/33.
- `backend npm run lint`, `npm run build`, `npm test`: 0 errores; 10/10 pruebas unitarias.
- `packages/contracts npm run generate`, `check:inventory`, `check:generated`: 48 rutas y 60 operaciones, tipos reproducibles. OpenAPI mantiene avisos de calidad preexistentes.
- PrimeReact Guardian: auditor 0 errores y 0 avisos. `frontend npm run lint`: 0 errores y 66 avisos preexistentes; `npm run build` compiló con el contador nuevo.
- [CI 41570433884](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41570433884): seis jobs técnicos verdes y job auxiliar del PR verde. Core pasó antes y después de restaurar la base y aplicar el contract en la copia. Inspección visual autenticada aún no ejecutada por falta de backend local con datos ficticios; los estados se verifican en build, no visualmente.

## Dependencias para aceptación del piloto

1. Texto oficial de consentimiento, versión y responsable institucional.
2. Contrato verificable con Squad 2 de la ficha de matrícula y parentesco; el campo libre `verificacion` no acredita vínculo.
3. Prueba integrada de RF-66 con mutación de Squad 2 y Squad 3 en la cadena Core.
4. Ejecución mensual supervisada de `audit:partitions`; no hay scheduler incluido.

La autorización sigue limitada al piloto real de Guamán Poma de Ayala. Los tenants A/B son exclusivamente ficticios para CI.
