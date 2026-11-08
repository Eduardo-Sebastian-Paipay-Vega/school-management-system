# Sprint 8 — Registro de evidencia y puertas de salida

**Estado:** en ejecución. S6/S7 y la preparación del ensayo S8 están integrados en `dev`; este registro no adelanta un cierre.

| Control | Evidencia observada | Estado |
|---|---|---|
| CI de código | Run [42444728077](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/42444728077), commit `6eea4f66`: Frontend, Backend, M8, Migraciones y Contratos pasaron; Core A/B pasó hasta respaldo/restauración. `verify-restored.cjs` falló porque la prueba S7 deja una identidad ficticia cifrada con clave versión 2 y el job no suministraba esa clave para leer la copia. Añadida al entorno de prueba efímero `ENCRYPTION_KEYS_JSON` con la misma clave ficticia de `key-rotation.test.cjs`; no es una clave de despliegue. | Corrección del workflow incorporada; pendiente nueva ejecución completa. |
| Compuertas locales | `database/npm test` → 33/33; `backend/npm run lint` → 0 errores; `backend/npm test` → 11/11; `packages/contracts/npm run lint` → válido con 111 avisos; `check:inventory` → 48 rutas y 60 operaciones; `check:generated` → tipos reproducibles. | Aprobadas localmente con las advertencias OpenAPI registradas. |
| Checks obligatorios | `gh api .../branches/dev/protection` y `.../main/protection` respondieron 404 `Branch not protected`. | Pendiente configuración remota por propietario; los workflows presentes no son checks obligatorios. |
| UI Core | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` → PrimeReact 10.9.9, 0 errores y 0 avisos; el auditor declara que solo valida imports y versión. `frontend/npm run lint` → 0 errores, 66 avisos preexistentes. Inspección estática de `CoreModuleView.tsx`: etiquetas de formulario, regiones `role=status`/`role=alert` y controles deshabilitados en formularios clave. | Verificación estática parcial. No equivale a WCAG ni recorrido visual. |
| UI autenticada | En la máquina de trabajo Docker no está instalado, Redis no escucha en 6379 y no hay backend/frontend en 3001/3000. PostgreSQL sí escucha en 5432. El backend protegido falla cerrado sin Redis. | Pendiente abrir staging o entorno local con PostgreSQL, Redis y cuentas ficticias; capturar teclado, foco, errores, tamaños móvil/escritorio y contraste. |
| Restauración | CI S5 verificó `pg_dump`/`pg_restore`, RLS, cadena e identidad cifrada en copia ficticia ([run 41575497274](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575497274)). Run S8 `42444728077` restauró la base correctamente, pero la comprobación de identidad no tenía disponible la clave ficticia v2; corrección añadida al workflow. | Pendiente CI verde tras la corrección; RPO/RTO, custodia y restore institucional siguen pendientes. |
| 22 RF | [Matriz detallada](SPRINT_08_MATRIZ_ACEPTACION.md) basada en evidencias S3–S5. | Ningún RF se declara aceptado institucionalmente por compilación o CI solamente. |
| Runbooks | [Incidente, migración, recuperación, suspensión y baja](../deployment/runbooks-core-saas.md). | Procedimientos escritos; ensayo S6/S7 y responsables institucionales pendientes. |

## Criterio de actualización

Al ejecutar S6/S7, añadir enlace al CI y resultados A/B con números exactos. Antes del cierre S8, comprobar protección de ambas ramas, evidencia visual autenticada y puertas externas de la [matriz](SPRINT_08_MATRIZ_ACEPTACION.md). No atribuir aprobación a un squad o institución por ausencia de objeciones.
