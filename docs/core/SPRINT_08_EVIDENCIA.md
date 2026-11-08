# Sprint 8 — Registro de evidencia y puertas de salida

**Estado:** en ejecución. La implementación S6/S7 y el ensayo integral S8 comparten rama de trabajo; este registro no adelanta un cierre.

| Control | Evidencia observada | Estado |
|---|---|---|
| CI de código | `.github/workflows/ci.yml` se dispara por PR y push a `dev`/`main` y ejecuta frontend, backend, M8, migraciones, contratos y Core PostgreSQL 16/Redis 7 con copia restaurada. El job frontend ahora incluye el auditor PrimeReact antes de lint/build. | Workflow actualizado; la ejecución de esta rama se registra tras subir el PR. |
| Checks obligatorios | Consulta de `GET /repos/Eduardo-Sebastian-Paipay-Vega/school-management-system/branches/{dev,main}/protection` devolvió 404 `Branch not protected` para ambas ramas. | Pendiente configuración remota por propietario; CI presente no es check obligatorio. |
| UI Core | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` → PrimeReact 10.9.9, 0 errores y 0 avisos; el auditor declara que solo valida imports y versión. `frontend/npm run lint` → 0 errores, 66 avisos preexistentes. Inspección estática de `CoreModuleView.tsx`: etiquetas de formulario, regiones `role=status`/`role=alert` y controles deshabilitados en formularios clave. | Verificación estática parcial. No equivale a WCAG ni recorrido visual. |
| UI autenticada | En la máquina de trabajo Docker no está instalado, Redis no escucha en 6379 y no hay backend/frontend en 3001/3000. PostgreSQL sí escucha en 5432. El backend protegido falla cerrado sin Redis. | Pendiente abrir staging o entorno local con PostgreSQL, Redis y cuentas ficticias; capturar teclado, foco, errores, tamaños móvil/escritorio y contraste. |
| Restauración | CI S5 verificó `pg_dump`/`pg_restore`, RLS, cadena e identidad cifrada en copia ficticia ([run 41575497274](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575497274)). | Técnica ficticia probada; RPO/RTO, custodia y restore institucional pendientes. |
| 22 RF | [Matriz detallada](SPRINT_08_MATRIZ_ACEPTACION.md) basada en evidencias S3–S5. | Ningún RF se declara aceptado institucionalmente por compilación o CI solamente. |
| Runbooks | [Incidente, migración, recuperación, suspensión y baja](../deployment/runbooks-core-saas.md). | Procedimientos escritos; ensayo S6/S7 y responsables institucionales pendientes. |

## Criterio de actualización

Al ejecutar S6/S7, añadir enlace al CI y resultados A/B con números exactos. Antes del cierre S8, comprobar protección de ambas ramas, evidencia visual autenticada y puertas externas de la [matriz](SPRINT_08_MATRIZ_ACEPTACION.md). No atribuir aprobación a un squad o institución por ausencia de objeciones.
