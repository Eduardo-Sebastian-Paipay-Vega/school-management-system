# Sprint 8 — Ensayo integral y salida controlada

**Estado:** en ejecución. **Base:** `dev` después del cierre técnico S5. **Alcance real:** piloto Guamán Poma de Ayala; los tenants adicionales de CI son ficticios. ADR-014 continúa propuesto y no habilita altas reales de terceros.

## Objetivo

Demostrar una operación completa con datos ficticios: provisión interna → invitación explícita → sesión y cambio de rol → suspensión → restauración → reactivación. Preparar la operación para el piloto sin convertir un CI verde en aprobación institucional.

| Historia | Entrega | Evidencia de salida |
|---|---|---|
| S8-01 Ensayo integral | Dos tenants ficticios, actor de plataforma separado, flujo de cuenta y rol, suspensión con rechazo inmediato y reactivación. | Prueba automática en PostgreSQL 16/Redis 7/SMTP; operador no lee datos escolares; restauración aislada y cadena de auditoría válida. |
| S8-02 Calidad visible | Recorridos autenticados de Core, teclado, foco, estados de error/carga/vacío y adaptación móvil. | Capturas y lista WCAG 2.1 AA con incidencias; sin entorno navegable se marca pendiente, no aprobado. |
| S8-03 Puertas de integración | CI en PR y push para `dev`/`main`; checks obligatorios configurados en protección de ramas por propietario del repositorio. | Workflow verde y consulta de reglas de protección. Un workflow presente no sustituye la regla de branch protection. |
| S8-04 Operación | Runbooks de incidente, migración/rollback, baja o suspensión de tenant, restauración y rotación de claves. | Ensayo en copia ficticia, bitácora de operador, responsables y criterios de detención. |
| S8-05 Trazabilidad | Matriz de los 22 RF de Core y handoff de contratos a los squads consumidores. | Cada RF marcado como probado, parcialmente probado o bloqueado con enlace de evidencia y dueño de la puerta restante. |

## Propiedad y límites

PostgreSQL y las migraciones son la fuente de verdad de estado del tenant y datos escolares; el CLI interno S6 es el único plano de control. La API escolar recibe el tenant desde JWT y no expone operaciones de plataforma. Redis se usa para revocación, límites y eventos temporales, nunca como fuente de permisos. Los secretos permanecen fuera de la BD y del repositorio.

## Verificación

Ejecutar `npm test` en `database/`; `npm run lint`, `npm test` e integración con PostgreSQL/Redis/SMTP en `backend/`; `npm run lint`, `check:inventory`, `check:generated` en `packages/contracts/`; `npm run lint` y `npm run build` en `frontend/`. Repetir pruebas Core en copia restaurada tras el *contract* de identidad. Revisar [la matriz RF](SPRINT_08_MATRIZ_ACEPTACION.md), [runbooks](../deployment/runbooks-core-saas.md) y protección de ramas antes de cualquier cierre formal.

**Puerta de salida:** ningún cliente real adicional ni despliegue automático por este sprint. La puesta en producción del piloto exige aprobación de seguridad, datos, alojamiento D-19, consentimiento RF-75 y dependencias entre squads registradas en la matriz.
