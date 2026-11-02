# Sprint 3 — Evidencia técnica y estado de cierre

**Corte:** 2026-11-02. **Rama:** `codex/core-sprint-3`. **PR:** [#3](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/3), borrador sin solicitudes de revisión. La aprobación de cierre de S3 no se presume.

| Historia | Evidencia | Estado |
|---|---|---|
| S3-00 | RF-05/CU-USR-01 definen cuenta pendiente e invitación explícita; RF-07/CU-USR-03 definen institución = tenant, sede interna; SDD Squad 1 traza 22 RF/CU y distingue la línea base histórica del contrato vigente. | Implementada en rama; validación funcional del líder pendiente. |
| S3-01 | SMTP de captura loopback solo bajo `NODE_ENV=test`, sin correo real; pruebas de fallo y reintento de invitación y recuperación. | Probada en CI. |
| S3-02 | Suite HTTP A/B cubre login, refresh/reuso, logout, RBAC 403 con auditoría, alta/invitación/activación, recuperación no enumerativa, rollback de importación, apoderado con texto ficticio de CI, RLS y Redis indisponible. | Probada en CI con PostgreSQL 16 y Redis 7. |
| S3-03 | `pg_dump -Fc` y `pg_restore` sobre base separada; comparación de conteos, RLS, cadena de auditoría y descifrado con clave fuera del volcado. | Probada con fixtures ficticios; [CI 41478224847](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41478224847) pasó los seis jobs técnicos. La ejecución anterior registró 1 s para respaldo + restauración de una base pequeña, 2 tenants y 2 identidades cifradas. No es RTO del piloto. |
| S3-04 | Backfill en una transacción global, conteo, DNI inválido con rollback, segundo `--apply` sin cambios e índice HMAC correcto. | Probada en copia restaurada ficticia. |
| S3-05 | [Inventario y gate de retirada](SPRINT_03_CONTRACT_GATE.md). | Condicionado: no se retiran columnas legadas sin restauración y backfill del piloto, ventana de compatibilidad y autorización de ejecución. |
| S3-06 | DTO concretos de respuestas S3; validación de respuestas HTTP reales contra OpenAPI 3.1 con Ajv; inventario 46 rutas/57 operaciones y tipos reproducibles. | Probada en [CI 41478224847](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41478224847). Quedan 36 referencias a respuesta genérica en rutas fuera del subconjunto probado. |

La prueba de apoderado utiliza una versión y texto **ficticios configurados únicamente por el proceso de CI**. La activación real RF-75 sigue bloqueada hasta contar con el texto institucional aprobado. Los rangos numéricos CNEB permanecen bloqueados por D-16. Ningún plantel real adicional forma parte del piloto.
