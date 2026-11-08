# Sprint 7 — Aislamiento extendido y operación

**Base:** Sprint 6 sobre `codex/core-sprints-6-8`. **Objetivo:** demostrar que la separación por `tenant_id` alcanza los recursos fuera de PostgreSQL y que las operaciones críticas se pueden recuperar.

## Contrato de salida

1. Matriz A/B para pool, Redis, WebSocket, correo, jobs, búsquedas, exportaciones y archivos donde exista consumidor. Toda operación sin tenant falla cerrada; la reutilización de conexiones no conserva el contexto previo.
2. Claves con versión y procedimiento de rotación/recifrado ensayado en copia, sin perder acceso a valores antiguos durante la transición. Documentar reversión, respaldo y destrucción de claves solo después de verificación.
3. Cuotas y límites de tasa por tenant en las operaciones expuestas, con telemetría que no contenga DNI, contenido de expedientes ni secretos.
4. Registrar explícitamente los recursos aún no implementados por otros squads; una prueba ausente no se marca como verde.

## Verificación

- CI con PostgreSQL 16, Redis 7, SMTP ficticio y dos tenants; prueba de aislamiento y restauración de copia.
- Construcción/lint de backend y contratos; revisión de los nombres de claves Redis, canales y archivos para verificar alcance por tenant.
- Las alertas de producción y objetivos de disponibilidad requieren hosting y responsable operativo (D-19); no se simula una operación real para aprobarlos.
