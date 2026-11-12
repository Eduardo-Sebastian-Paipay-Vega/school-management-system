# Sprint 8 — Registro de evidencia y puertas de salida

**Estado al 2026-11-12:** validación técnica local reejecutada; **Sprint 8 todavía no puede cerrarse formalmente** porque falta inspeccionar la UI autenticada con servicios operativos y completar puertas institucionales. S6/S7 y la preparación del ensayo S8 están integrados en `dev`.

## Revalidación local — 2026-11-11

| Compuerta | Resultado observado | Estado |
|---|---|---|
| Base de datos | `database/npm test`: 33/33, 0 fallos. Suite con PGlite; no sustituye el ensayo de runtime PostgreSQL 16 + Redis 7. | Aprobada localmente. |
| Backend | `backend/npm run lint`: 0 errores; `backend/npm test`: 11/11, incluye compilación TypeScript. | Aprobada localmente. |
| Contratos | `packages/contracts/npm run lint`: contrato válido, 111 advertencias; `check:inventory`: 48 rutas y 60 operaciones; `check:generated`: tipos reproducibles. | Aprobada con advertencias registradas. |
| Frontend | `frontend/npm run lint`: 0 errores, 59 advertencias. `frontend/npm run build`: compilación, tipos y generación de 22 páginas completados. | Aprobada; deuda de advertencias conocida. |
| PrimeReact Guardian | Auditoría local: PrimeReact 10.9.9, 0 errores y 0 avisos. El auditor valida imports/versión, no JSX, props ni experiencia de uso. | Aprobada estáticamente. |
| Servicios para ensayo autenticado | En este entorno no se encontró `docker`, `redis-server`, `psql` ni un servicio Redis instalado. La suite local de base usa PGlite. | Bloqueada aquí; requiere staging o entorno PostgreSQL/Redis disponible. |

Esta revalidación cubre el estado de trabajo local existente; no acredita una sesión autenticada real ni se atribuye visualmente al build.

## Preflight de servicios — 2026-11-12

- La guía vigente confirma que staging y producción no existen y que D-19 sigue pendiente.
- PostgreSQL responde en el puerto local configurado, pero el usuario/clave del `backend/.env` ignorado por Git fueron rechazados con SQLSTATE `28P01`. Solo se comprobó conectividad/autenticación; no se consultaron tablas ni datos.
- Redis no responde en el puerto local configurado. No se encontró Docker ni un binario/servicio Redis local.
- GitHub no devolvió workflow runs asociados al merge commit `bfe8132c`; por eso esta reanudación no afirma un resultado de CI más reciente que la evidencia registrada del 8/11.

**Siguiente puerta técnica:** habilitar un PostgreSQL y Redis de prueba con credenciales válidas, más SMTP de captura; provisionar exclusivamente cuentas y datos ficticios; iniciar backend/frontend y guardar capturas de estados de carga, vacío, error, foco y tamaños móvil/escritorio. No reutilizar el `backend/.env` local ni datos institucionales para ese ensayo.

| Control | Evidencia observada | Estado |
|---|---|---|
| CI de código | Runs [42469150736](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/42469150736) y [42470105251](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/42470105251): los seis checks obligatorios pasaron. El segundo verificó el commit `1c1441d9` del [PR #6](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/6), con Frontend, Backend, M8, Migraciones, Contratos y Core A/B verdes. Core A/B completó PostgreSQL+Redis, aislamiento y fallo cerrado, backup/restore, `verify-restored`, backfill y contract en copia restaurada. La causa del run anterior [42444728077](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/42444728077) fue que `verify-restored.cjs` no recibía la clave ficticia v2 usada por la prueba de rotación. Se añadió al entorno efímero `ENCRYPTION_KEYS_JSON`; no es clave de despliegue. | Aprobado en CI. |
| Compuertas locales | `database/npm test` → 33/33; `backend/npm run lint` → 0 errores; `backend/npm test` → 11/11; `packages/contracts/npm run lint` → válido con 111 avisos; `check:inventory` → 48 rutas y 60 operaciones; `check:generated` → tipos reproducibles. | Aprobadas localmente con las advertencias OpenAPI registradas. |
| Checks obligatorios | `dev` y `main` protegidas con seis checks obligatorios: Frontend, Backend común, Servicio M8, Migraciones, Contratos OpenAPI y Core PostgreSQL+Redis. Requerir ramas actualizadas y bloquear force-push/eliminación; `main` exige una aprobación. | Configuradas y verificadas en GitHub. |
| UI Core | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` → PrimeReact 10.9.9, 0 errores y 0 avisos; el auditor declara que solo valida imports y versión. `frontend/npm run lint` → 0 errores, 66 avisos preexistentes. Inspección estática de `CoreModuleView.tsx`: etiquetas de formulario, regiones `role=status`/`role=alert` y controles deshabilitados en formularios clave. | Verificación estática parcial. No equivale a WCAG ni recorrido visual. |
| UI pública responsive | Landing inspeccionado visualmente en navegador a 360, 768 y 1280 px. Se corrigió la franja institucional móvil para truncar el nombre largo y ocultar enlaces secundarios redundantes; sin scroll horizontal en los tres anchos. | Verificación visual del landing completada; no reemplaza aceptación de UI autenticada ni auditoría WCAG. |
| UI autenticada | PostgreSQL escucha localmente, pero no hay Redis en `127.0.0.1:6379` ni backend autenticado disponible. Docker/Redis no están instalados en Windows; WSL Ubuntu está presente, pero no tiene Redis y no permite instalar paquetes con `sudo -n`. El backend protegido falla cerrado sin Redis. | Pendiente usar staging o habilitar Redis en el entorno local con cuentas ficticias; luego capturar teclado, foco, errores, tamaños móvil/escritorio y contraste. No se simuló una sesión autenticada. |
| Restauración | CI S5 verificó `pg_dump`/`pg_restore`, RLS, cadena e identidad cifrada en copia ficticia ([run 41575497274](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41575497274)). Run S8 [42469150736](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/42469150736) pasó backup/restore, `verify-restored`, backfill y contract en copia restaurada. | Validación automatizada aprobada; RPO/RTO, custodia y restore institucional siguen pendientes. |
| 22 RF | [Matriz detallada](SPRINT_08_MATRIZ_ACEPTACION.md) basada en evidencias S3–S5. | Ningún RF se declara aceptado institucionalmente por compilación o CI solamente. |
| Runbooks | [Incidente, migración, recuperación, suspensión y baja](../deployment/runbooks-core-saas.md). | Procedimientos escritos; ensayo S6/S7 y responsables institucionales pendientes. |

## Criterio de actualización

Al ejecutar S6/S7, añadir enlace al CI y resultados A/B con números exactos. Antes del cierre S8, comprobar protección de ambas ramas, evidencia visual autenticada y puertas externas de la [matriz](SPRINT_08_MATRIZ_ACEPTACION.md). No atribuir aprobación a un squad o institución por ausencia de objeciones.
