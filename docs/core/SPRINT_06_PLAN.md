# Sprint 6 — Plano de control y provisión

**Base:** `dev` tras PR #5 (`4a9ff173`). **Rama de trabajo:** `codex/core-sprints-6-8`. **Alcance real:** solo piloto Guamán Poma de Ayala; tenants adicionales son ficticios para pruebas. ADR-014 sigue propuesto y no se presenta como aceptación institucional.

## Contrato de salida

1. Separar el operador técnico del `SUPERADMIN` escolar. El operador solo puede crear, suspender y reactivar tenants mediante un comando interno y un rol SQL de privilegios mínimos. No obtiene consultas de estudiantes ni expedientes.
2. Persistir el estado técnico del tenant y compatibilizarlo con `instituciones.activo`. Login, refresh, petición protegida, cola y WebSocket deben rechazar un tenant suspendido en la siguiente operación.
3. Provisionar idempotentemente dos tenants ficticios. Un reintento, incluso tras fallo inducido, no duplica institución ni administrador. El primer administrador nace pendiente y requiere invitación explícita.
4. Mantener configuración técnica no secreta y bitácora de cada acción del operador con actor, motivo, tenant, resultado y fecha.

## Verificación

- Pruebas PostgreSQL 16 con rol operador y rol `sms_app`: alta/reintento, A suspendido/B operativo, rechazo de lectura escolar al operador, sesión y refresh revocados.
- `database npm test`; `backend npm run lint`, `npm run build`, `npm test`; suite de integración Core en CI.
- Evidencia de límites: sin operador institucional designado y sin acuerdo de datos, el comando no se ejecuta sobre un tenant externo real.
