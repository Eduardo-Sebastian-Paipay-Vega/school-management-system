# Acta de cierre técnico del Sprint 5 — Core y seguridad

**Decisión:** cerrar la ejecución técnica del Sprint 5 e integrar el [PR #5](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/5) en `dev`. El líder autorizó avanzar hasta el cierre y confirmó que los datos reales se cargarán antes del despliegue o durante sus fases. La revisión del equipo completo no es requisito para este cierre y no se solicitaron revisores. Esta acta no constituye aprobación institucional del consentimiento ni puesta en producción.

## Alcance aceptado

- S5-00: el directorio enmascara el teléfono y la edición parcial no reenvía el valor enmascarado.
- S5-01: Core exige una ficha RF-15 verificada para vincular, invitar, activar y consultar; revocar la ficha, el consentimiento o el vínculo corta el acceso. Sin ficha o texto oficial, el flujo real falla cerrado.
- S5-02: los avisos de seguridad son obligatorios; el correo exige dirección verificada y respeta preferencias, cola y reintentos; el resumen diario, WebSocket revocable, contador y retención tienen prueba A/B.
- S5-03: auditoría con búsqueda paginada por usuario, DNI transformado a hash, IP, módulo y fechas; lectura y PDF se registran, el PDF rechaza más de 2000 filas, y existen tareas operativas de particiones y retención.
- S5-04: el historial de calificaciones M8 se incorpora a la cadena Core en la misma transacción, con autor autenticado, tenant y rollback conjunto.

## Evidencia de salida

La [CI 41575261081](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575261081) pasó los seis jobs técnicos y el job auxiliar del PR: migraciones, backend, contratos, M8, frontend y Core con PostgreSQL 16, Redis 7 y SMTP ficticio. La suite Core corrió sobre la base inicial y sobre una copia restaurada tras el contract de identidad. El [reporte detallado](SPRINT_05_EVIDENCIA.md) registra pruebas y límites. PrimeReact Guardian pasó con cero errores y cero avisos; no hubo inspección visual autenticada en un navegador con datos ficticios.

## Puertas posteriores al cierre

1. **RF-75, activación real:** Squad 2 debe cargar y conciliar las fichas oficiales de filiación según el [contrato RF-15 → RF-75](CONTRATO_FICHA_RF15_RF75.md). La institución debe proporcionar el texto y la versión aprobados de consentimiento antes de habilitar apoderados reales. La autorización de cargar datos más adelante no sustituye esas verificaciones.
2. **RF-66 completo:** Squad 2 debe integrar asistencia y motivo obligatorio de corrección con la transacción auditada; la línea de tiempo conjunta de notas y asistencia requiere prueba entre squads. La parte M8 está probada.
3. **Operación:** programar y supervisar la creación mensual de particiones de auditoría y la retención de avisos; inspeccionar visualmente los flujos autenticados antes del despliegue.

**Resolución:** Sprint 5 cerrado técnicamente en `dev` al fusionar el PR #5. Las puertas anteriores permanecen abiertas para la aceptación del piloto de Guamán Poma de Ayala. No se autoriza otro plantel real.
