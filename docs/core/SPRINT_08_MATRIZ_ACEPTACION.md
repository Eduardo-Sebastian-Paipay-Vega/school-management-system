# Sprint 8 — Matriz de aceptación de los 22 RF del Core

**Corte inicial:** código S1–S5 integrado en `dev`; S6–S8 están en ejecución. «Probado técnicamente» significa suite automatizada del Core con dos tenants ficticios; no certifica uso escolar real. Fuente: [evidencia S4](SPRINT_04_EVIDENCIA.md), [evidencia S5](SPRINT_05_EVIDENCIA.md), [contrato OpenAPI](../../packages/contracts/openapi/openapi.yaml), [SDD Squad 1](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/sdd_squad_1.md).

| RF | Estado al inicio de S8 | Puerta restante para aceptación del piloto |
|---|---|---|
| 01 | Login/JWT/tenant probado técnicamente. | Ensayo visible de sesión y accesibilidad. |
| 02 | Logout, revocación e inactividad probados técnicamente. | Ensayo E2E después de suspensión. |
| 03 | Recuperación y SMTP ficticio probados técnicamente. | SMTP y dominio reales configurados y ensayados. |
| 04 | RBAC y denegación A/B probados técnicamente. | Ensayo E2E de cambio de rol y revocación. |
| 05 | Cuenta pendiente e invitación explícita probadas técnicamente. | Correo institucional y flujo visible. |
| 06 | Importación CSV/XLSX, rollback e idempotencia probados técnicamente. | Padrón oficial y validación de Secretaría. |
| 07 | Institución como tenant y sede interna probadas técnicamente. | Provisión S6 y aprobación del operador para piloto; terceros fuera de alcance. |
| 08 | Directorio filtrado, paginado y enmascarado probado técnicamente. | Inspección visual autenticada. |
| 09 | Perfil, clave propia y revocación probados técnicamente. | Inspección visual autenticada. |
| 10 | Año nuevo y cuentas persistentes probados técnicamente. | Calendario oficial 2027. |
| 11 | Periodos y solapamiento probados técnicamente. | Bloqueo real de notas con Squad 3. |
| 12 | Secciones y unicidad probadas técnicamente. | Aforo/matrícula con Squad 2. |
| 13 | Escala literal y bloqueo de publicación numérica probados técnicamente. | Decisión académica D-16. |
| 14 | Membrete y escudo en Core probados técnicamente. | PDF de Squad 5 con membrete real. |
| 65 | Cadena inmutable, integridad y restauración probadas técnicamente. | Tareas mensuales y alerta operativa ensayadas. |
| 66 | Historial M8 unido atómicamente a cadena Core. | Corrección de asistencia, motivo y línea de tiempo conjunta con Squad 2/3. |
| 67 | Búsqueda, filtros y PDF con límite probados técnicamente. | Inspección visual y criterios de acceso institucionales. |
| 68 | Cifrado de DNI, HMAC, enmascarado y contract probados técnicamente. | Custodia y rotación de claves con procedimiento S7. |
| 72 | Baja, reactivación y último administrador probados técnicamente. | Ensayo E2E de cuenta en piloto. |
| 73 | Motivo, cambio de rol y revocación probados técnicamente. | Ensayo E2E de permisos visibles. |
| 75 | Vínculo exige ficha verificada; revocación y consentimiento ficticio probados técnicamente. | Ficha RF-15 oficial y texto/versionado de consentimiento institucional aprobados. |
| 76 | Cola, preferencias, correo, WebSocket, contador y retención probados técnicamente. | SMTP/hosting real y operación de tareas periódicas. |

## Handoff a consumidores

| Consumidor | Contrato Core | Prueba conjunta pendiente |
|---|---|---|
| Squad 2 Matrícula/Asistencia | JWT `tenant_id`, `withTenant`, persona estable, `fichas_apoderados_verificados`, `NotificationService`, auditoría transaccional. | RF-15→75, aforo RF-12, asistencia RF-66 y avisos. |
| Squad 3 Calificaciones | JWT/roles, año/periodo/sección, escala aprobada, trigger de historial M8. | Cierre de periodo RF-11, publicación RF-13/D-16 y línea de tiempo RF-66. |
| Squad 4 Analítica | Identidad y aislamiento de tenant, consultas autorizadas. | Aislamiento de agregados y exportaciones con datos de Squads 2/3. |
| Squad 5 Secretaría | Membrete, identidad, permisos y auditoría. | PDF institucional RF-14 y verificación de documentos reales. |

La matriz debe actualizarse con CI S6–S8 y evidencia visual antes de cambiar un RF de «probado técnicamente» a «aceptado». Ningún silencio de otro squad equivale a conformidad.
