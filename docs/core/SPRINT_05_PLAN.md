# Sprint 5 — Familias, avisos, privacidad y auditoría

**Base:** merge de PR #4 en `dev` (`f10e0ddd`). **Rama:** `codex/core-sprint-5`. **Estado:** en ejecución. El piloto real sigue limitado a Guamán Poma de Ayala; CI usa dos tenants ficticios.

## Objetivo y fuentes de verdad

Cerrar los flujos Core de RF-65–68 y RF-75–76 con pruebas de aislamiento. PostgreSQL conserva vínculos, consentimiento, avisos y bitácora; Redis distribuye eventos temporales y limita acceso, sin decidir permisos. El texto oficial del consentimiento y la ficha verificadora de Squad 2 siguen ausentes: las pruebas ficticias son válidas para el mecanismo, no habilitan datos reales.

| Historia | Entrega | Prueba de salida |
|---|---|---|
| S5-00 Privacidad | El directorio no expone teléfono íntegro; UI de edición nunca guarda un valor enmascarado. | Roles sin `users:unmask` no reciben el número; edición parcial conserva campos no tocados. |
| S5-01 Familias | Desvinculación revoca acceso inmediato; Core consulta la fuente verificada RF-15 de Squad 2 para vincular, invitar, activar y leer. Consentimiento versionado no usa texto ficticio fuera de CI. | Token previo pierde acceso en la siguiente petición; A no vincula personas de B; sin registro de ficha ni texto oficial no hay alta real. |
| S5-02 Avisos | Preferencia SEGURIDAD inmutable, cola con reclamo transaccional corto y reintentos; correo solo a destino verificable; entrega en tiempo real vinculada a sesión vigente. | A no recibe avisos de B; preferencia se respeta; fallo SMTP reintenta sin bloquear la transacción de datos. |
| S5-03 Auditoría | Búsqueda paginada con total real y filtros, lectura/exportación autorizadas y registradas, campos sensibles protegidos; particiones futuras preparadas. | Consulta/exportación A/B, cadena válida, error y límite explícitos, sin desactivar auditoría. |
| S5-04 RF-66 | Contrato de mutación y auditoría atómica para Squads 2/3, con evidencia de integración donde exista consumidor. | Nota/asistencia y bitácora confirman o revierten juntas; dependencias externas declaradas si el consumidor aún no existe. |

## Secuencia

1. Corregir S5-00 y sus pruebas antes de ampliar flujos.
2. Ensayar S5-01 con consentimiento ficticio solo en CI y bloqueo real explícito.
3. Implementar S5-02 con pruebas HTTP/SMTP/WS A/B, sin presumir entrega exactamente una vez cuando SMTP no ofrece idempotencia.
4. Ejecutar S5-03/04 y documentar el contrato pendiente con Squads 2/3.
5. Verificar `database npm test`, `backend npm run lint/build/test`, PG16+Redis7+SMTP en CI, contratos, frontend lint/build y PrimeReact Guardian cuando se edite UI. Inspeccionar UI autenticada cuando haya entorno navegable con datos ficticios.

**Puerta de salida:** apoderado desvinculado no consulta al estudiante, el aviso no cruza tenant, auditoría permanece íntegra y el reporte distingue las pruebas Core de la aceptación institucional y entre squads. Ningún texto de consentimiento o umbral CNEB se inventa para producción.
