# Runbooks del Core SaaS — piloto controlado

**Ámbito:** PostgreSQL 16, Redis 7, backend Node persistente, SMTP y frontend Next.js del piloto Guamán Poma de Ayala. El plano de control S6 es un CLI interno con rol `sms_operator`, separado del rol escolar `sms_runtime`. No se crea un endpoint HTTP de operador. Estos procedimientos requieren una ventana aprobada y secretos obtenidos del gestor del entorno; no colocar cadenas de conexión ni datos personales en tickets, consola compartida o archivos versionados.

## 1. Reglas previas de toda intervención

1. Registrar identificador de incidente/cambio, actor, tenant UUID, motivo y hora UTC. `OPERATOR_ID` y `OPERATOR_REASON` deben acompañar cada operación de plataforma; `TENANT_REQUEST_ID` identifica de forma idempotente cada alta. Comprobar que el CLI rechace su ausencia cuando corresponde.
2. Confirmar entorno y tenant con un identificador técnico. Los dos tenants de CI son ficticios; nunca usar un tenant real adicional para una prueba.
3. Comprobar `GET /api/v1/health`, la cadena de auditoría del tenant afectado, última partición disponible y estado de cola de correo. Mantener secretos fuera del volcado y de las evidencias.
4. Registrar resultado y verificación independiente por otra persona autorizada cuando el entorno sea compartido. El operador de plataforma no obtiene permiso de lectura de alumnos, notas ni documentos.

## 2. Incidente de disponibilidad o aislamiento

| Síntoma | Acción inmediata | Verificación antes de reanudar |
|---|---|---|
| PostgreSQL o Redis indisponible | Detener tareas periódicas y escrituras de plataforma; mantener el fallo cerrado de las rutas protegidas. Revisar salud de servicios, conexiones y expiración de credenciales sin imprimirlas. | `health` vuelve a 200; login y petición protegida A/B en staging; RLS sin contexto devuelve cero filas. |
| Sospecha de cruce entre tenants | Suspender el tenant afectado mediante CLI si es posible; detener exposición y preservar evidencia de auditoría. No ejecutar consultas exploratorias con rol de aplicación sobre datos escolares. | Reproducir con datos ficticios, aislar causa en JWT/contexto/cola/WS/archivo/exportación, pasar matriz A/B S7 antes de reactivar. |
| Falta partición de auditoría | Detener mutaciones que fallen, ejecutar `npm run audit:partitions` desde `database/` con rol migrador y revisar rango de 13 meses UTC. | Una escritura auditable ficticia confirma y `fn_verificar_cadena_auditoria()` mantiene la cadena íntegra. |
| Cola SMTP acumulada | Comprobar salud del proveedor, preferencia y correo verificado; no reenviar manualmente invitaciones consumidas. | Reintentos regresan a normalidad y el mismo mensaje no se usa como prueba de entrega exactamente una vez. |

Si hay exposición de datos personales, conservar la bitácora y seguir el protocolo institucional de incidentes. No borrar filas de auditoría ni desactivar RLS para recuperar servicio. La respuesta a usuarios debe evitar detalles técnicos y datos de terceros.

## 3. Migración, respaldo y rollback

1. Obtener artefacto/versiones exactas de backend, frontend, contrato y migraciones. Ejecutar CI completo en PR y comprobar reglas de protección de `dev`/`main`; una ejecución verde aislada no sustituye protección de ramas.
2. Ensayar el cambio en una copia restaurada y aislada con el mismo PostgreSQL mayor. Registrar duración, tamaños, conteos, RLS, cadena y descifrado; custodiar `ENCRYPTION_MASTER_KEY` y `DOCUMENT_HMAC_KEY` fuera del respaldo.
3. Programar ventana y detener escrituras para migraciones *contract*. Ejecutar `database/npm run migrate` para migraciones *expand*. Para retirar columnas legadas, ejecutar antes `backend/npm run verify:identity-contract`; aplicar `database/npm run migrate:contract` únicamente con `CORE_IDENTITY_CONTRACT_ACK=backup-restore-backfill-verified` tras inventariar consumidores.
4. Verificar esquema, salud, login, RBAC, aislamiento A/B, cola, auditoría y flujos esenciales. Si falla antes del commit, detener la liberación y conservar el estado anterior. Si falla tras *contract*, restaurar el volcado previo en **otra** base, verificarla y conmutar durante ventana autorizada; no editar migraciones históricas ni restaurar encima de la base activa.
5. Documentar versión y resultado. El despliegue real sigue sin destino decidido (D-19), por lo que este runbook no autoriza publicarlo.

La [operación Core](../core/OPERACION_CORE.md) detalla el ensayo de volcado/restauración y el preflight de identidad.

## 4. Provisión, suspensión, reactivación y baja de tenant

El CLI S6 usa `OPERATOR_DATABASE_URL` con rol `sms_operator`, `OPERATOR_ID` y `OPERATOR_REASON`. Obtenerlos del entorno protegido; la base escolar usa credenciales separadas. Las operaciones se auditan con identificadores técnicos y nunca con nombres o documentos de estudiantes. Para alta, configurar además `TENANT_REQUEST_ID`, `TENANT_CODE`, `TENANT_NAME`, `FIRST_ADMIN_FIRST_NAME`, `FIRST_ADMIN_LAST_NAME`, `FIRST_ADMIN_EMAIL` y `FIRST_ADMIN_DNI`; para transiciones, `TENANT_ID`. Ejecutar desde `backend/` los scripts `tenant:provision`, `tenant:invite-admin`, `tenant:suspend` y `tenant:reactivate` definidos en `package.json`.

- **Alta ficticia o autorizada:** ejecutar `npm run tenant:provision` con código modular y nombre institucional validados; repetir el mismo `TENANT_REQUEST_ID` tras un fallo parcial y comprobar que existe un único tenant en estado `APROVISIONANDO` y un administrador `PENDIENTE`, sin correo enviado. Después de revisar la ficha técnica, ejecutar **explícitamente** `npm run tenant:invite-admin` con `TENANT_ID`, `TENANT_CODE` y los datos `FIRST_ADMIN_*`; esa acción envía el enlace de activación y activa el tenant. No asignar contraseña por CLI. Antes de cualquier alta real fuera del piloto se requieren acuerdo de datos y autorización de alcance.
- **Suspensión:** ejecutar `npm run tenant:suspend` con motivo y UUID. Confirmar rechazo de login, refresh, peticiones protegidas y WS del tenant suspendido; otro tenant debe continuar. No suprimir datos al suspender.
- **Reactivación:** comprobar causa resuelta, integridad de cadena y operaciones periódicas; ejecutar `npm run tenant:reactivate` con el UUID del tenant. Verificar acceso con una sesión nueva, sin revivir tokens previos por accidente.
- **Baja:** primero suspender. Preservar evidencias, respaldos y obligaciones de conservación según decisión institucional. No existe borrado automático irreversible en este sprint; cualquier eliminación requiere diseño, plazo y autorización específicos.

Registrar el resultado de cada transición y sus pruebas. No ejecutar CLI desde una cuenta `sms_runtime` ni usar credenciales del operador en el backend público.

## 5. Claves, secretos y tareas periódicas

- La rotación de cifrado/HMAC requiere versión de clave, inventario de consumidores, respaldo restaurable y recifrado verificado en copia. Mantener lector dual y claves previas hasta verificar cero registros pendientes por tenant; una aplicación antigua solo puede volver a usarse con lector dual compatible o restauración. No cambiar `DOCUMENT_HMAC_KEY` en producción mientras existan índices/vínculos calculados con la versión anterior. Los JWT requieren invalidación de sesiones según la ventana acordada. Seguir el [procedimiento S7](../core/SPRINT_07_ROTACION_CLAVES.md) y sus pruebas antes de una rotación real.
- Ejecutar `database/npm run audit:partitions` al menos mensualmente y `database/npm run notifications:retain` diariamente con monitoreo de éxito/fracaso. Los avisos expiran a los 180 días; la bitácora de auditoría no se purga por ese comando.
- Las alertas operativas deben contener tenant UUID o identificador opaco, código de error y correlación; nunca DNI, nombres, notas, tokens, texto de correo o secretos. Si falla una tarea, registrar y reintentar desde el último estado seguro antes de su fecha límite.

## 6. Puertas antes del piloto

La [matriz de 22 RF](../core/SPRINT_08_MATRIZ_ACEPTACION.md) distingue prueba técnica de aceptación. Las protecciones de `dev` y `main` ya están configuradas con seis checks obligatorios (y una aprobación requerida en `main`). Faltan alojamiento D-19, aceptación visual/accesibilidad de la UI autenticada, aprobación de datos y seguridad, ficha oficial RF-15 y consentimiento RF-75, decisión D-16 y contratos entre squads señalados en la matriz. El piloto real permanece en Guamán Poma de Ayala; otros planteles reales no se incorporan por este runbook.
