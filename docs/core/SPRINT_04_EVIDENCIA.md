# Sprint 4 — Evidencia y estado

**Base:** `dev` tras PR #3. **Rama:** `codex/core-sprint-4`. **PR:** [#4](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/4), borrador sin solicitudes de revisión. **Estado:** en ejecución; este documento no constituye cierre ni aprobación del piloto.

| Historia | Evidencia en rama | Estado |
|---|---|---|
| S4-01 | `users.routes.ts`: directorio con total real, edición y protección de último administrador; `CoreModuleView.tsx`: paginación remota y formulario de edición. Suite HTTP: reimportación sin duplicados, edición y cruce A/B. | En verificación CI. |
| S4-02 | `GET/PATCH /users/me` y panel de perfil con teléfono/foto y errores. Suite HTTP: lectura, actualización y aislamiento. | En verificación CI. |
| S4-03 | `PATCH /school/sites/{id}` con auditoría, UI de edición/estado y contrato OpenAPI; suite HTTP de institución, sedes, año 2027, periodos, secciones y conflictos. | En verificación CI. Los bloqueos de notas y aforo requieren prueba conjunta con Squads 3 y 2. |
| S4-04 | Aprobación de escala `DUAL_VIGESIMAL` rechazada con `CNEB_D16_PENDING`; escala literal versionada y reemplazo comprobables. UI presenta D-16; edición de membrete y escudo. | En verificación CI. El PDF de Squad 5 y la decisión D-16 siguen pendientes. |
| S4-05 | Inventario de 22 RF del Core y puertas técnicas del [plan S4](SPRINT_04_PLAN.md). | Pendiente de cierre. |

## Trazabilidad de los 22 RF

| RF | Estado verificable al corte | Sprint / dependencia |
|---|---|---|
| 01–03 | Autenticación, sesión, recuperación e invitación probadas con PG/Redis/SMTP. | S3 |
| 04 | RBAC 403/auditoría probados; último administrador y roles se amplían en S4. | S3–S4 |
| 05 | Alta pendiente e invitación explícita probadas. | S3–S4 |
| 06 | Rollback de lote probado; reimportación idempotente añadida. | S3–S4 |
| 07 | Institución = tenant, sedes internas; edición de sede añadida con aislamiento A/B. | S3–S4 |
| 08 | Directorio aislado; total y paginación remota añadidos. | S3–S4 |
| 09 | Clave propia revoca sesiones; perfil editable añadido. | S3–S4 |
| 10 | Año y activación añadidos a suite A/B; cuentas estables entre años. | S4 |
| 11 | Periodos y solapamiento añadidos a suite; bloqueo de notas depende de Squad 3. | S4 / Squad 3 |
| 12 | Secciones y unicidad añadidas a suite; límite de matrícula depende de Squad 2. | S4 / Squad 2 |
| 13 | Borrador/versión literal y bloqueo de publicación numérica. | S4 / D-16 |
| 14 | Membrete y escudo en Core; salida PDF depende de Squad 5. | S4 / Squad 5 |
| 65 | Cadena de auditoría probada. | S3 |
| 66 | Contrato y prueba conjunta de notas/asistencia pendientes. | S5 / Squads 2–3 |
| 67 | API de consulta/exportación presente; aceptación de búsquedas/exportaciones pendiente. | S5 |
| 68 | Documento cifrado, HMAC, restauración y acceso enmascarado probados. | S3–S5 |
| 72 | Baja/reactivación presentes; protección de último administrador en suite S4. | S4 |
| 73 | Roles con motivo y revocación presentes; prueba de cambio efectivo pendiente. | S4 |
| 75 | Flujo ficticio de CI probado; uso real bloqueado hasta texto institucional aprobado. | S3–S5 |
| 76 | Avisos presentes; cola/reintentos y aislamiento de eventos quedan en S5/S7. | S5–S7 |

El auditor PrimeReact 10.9.9 pasó con cero errores y cero avisos. Lint y build del frontend pasaron localmente; la inspección visual de los recorridos autenticados queda pendiente de un entorno navegable con datos ficticios. El contrato tiene 47 rutas/58 operaciones y tipos generados reproducibles; Redocly conserva advertencias no bloqueantes de rutas ajenas a este cambio.
