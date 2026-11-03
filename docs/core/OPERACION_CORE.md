# Operación del Core — Squad 1

## Particiones mensuales de auditoría

Ejecutar `npm run audit:partitions` desde `database/` cada mes con `DATABASE_URL` del propietario de migraciones. El comando crea el mes UTC actual y los 12 siguientes, de forma idempotente. Supervisar su resultado antes de que venza la última partición: una escritura auditada falla cerrada si falta la partición del mes; `sms_app` no puede crearla.

## Conservación de notificaciones

Ejecutar `npm run notifications:retain` diariamente desde `database/` con `DATABASE_URL` del propietario de migraciones. El comando elimina avisos de más de 180 días en lotes de 1000, junto con sus intentos de correo; las referencias de avisos de inasistencia se conservan con `notificacion_id` nulo. No borra la bitácora de auditoría. El despliegue debe programar y supervisar esta tarea.

## Fases

La cuenta pertenece a la persona y al plantel, no al año lectivo. En la Fase 1 se importan personas de la nómina, se crean solo las cuentas necesarias y se envía una invitación de un uso; cada usuario fija su clave. El archivo no lleva contraseñas. En 2027 se configura otro año con periodos y secciones, mientras Squad 2 crea la matrícula anual referida al `persona_id` existente. El Core no crea matrículas ni fija rangos numéricos CNEB sin la aprobación institucional D-16.

## Arranque

1. Levantar PostgreSQL 16 y Redis 7: `docker compose up -d postgres redis` (requiere Docker).
2. En `database/`, configurar `DATABASE_URL` de administrador y ejecutar `npm install && npm run migrate`.
3. En `database/`, ejecutar `npm run bootstrap:app-role` con `DATABASE_URL`, `APP_DB_USER=sms_runtime` y `APP_DB_PASSWORD` aleatoria de 24+ caracteres. Este rol hereda `sms_app` sin `BYPASSRLS`.
4. Configurar `backend/.env` desde `.env.example`: `DB_USER/DB_PASSWORD` del paso 3; secretos JWT distintos; `ENCRYPTION_MASTER_KEY` y `DOCUMENT_HMAC_KEY` hexadecimales, distintos, de 32 bytes; SMTP, `PUBLIC_APP_URL` y orígenes exactos `CORS_ORIGIN`. El servidor no arranca si faltan claves. Antes de activar apoderados, Dirección debe aprobar y configurar `GUARDIAN_CONSENT_VERSION` y el texto íntegro en `GUARDIAN_CONSENT_TEXT`; sin ellos la activación responde 503.
5. Definir `DATABASE_URL`, `BOOTSTRAP_INSTITUTION_CODE`, `BOOTSTRAP_INSTITUTION_NAME`, `BOOTSTRAP_ADMIN_FIRST_NAME`, `BOOTSTRAP_ADMIN_LAST_NAME`, `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_DNI`. En `backend/`, ejecutar `npm run bootstrap:admin`. Crea el plantel y primer administrador pendiente y envía la invitación; no imprime token ni contraseña.
6. Para usuarios legados, respaldar la base y ejecutar `npm run backfill:identities` en `backend/` para revisar el conteo. Repetir con `-- --apply` después de verificar claves y respaldo. Cifra documentos en `personas` e indexa HMAC. Las columnas antiguas de `usuarios` permanecen hasta comprobar todos los consumidores y el backfill en producción.
7. Iniciar backend (`npm run build && npm start`, puerto 3001) y frontend (`npm run build && npm start`, puerto 3000). Definir `NEXT_PUBLIC_CORE_API_URL` antes del build del frontend. La cookie refresh usa `SameSite=Strict`: en producción frontend y API deben compartir sitio registrable o proxy de origen. Enumerar los orígenes exactos en `CORS_ORIGIN`.

## Respaldo, restauración y backfill (Sprint 3)

El CI usa exclusivamente dos instituciones ficticias. Ejecuta `pg_dump -Fc` después de las pruebas HTTP, restaura el archivo en `school_management_restore` y compara conteos de `instituciones`, `personas`, `usuarios` y `logs_auditoria`. En la copia verifica que el rol de aplicación no lea filas sin contexto, que RLS aísle instituciones, que la cadena de auditoría sea íntegra y que los documentos cifrados se puedan descifrar con la clave externa de prueba. Luego siembra identidades legadas ficticias, ensaya error por DNI inválido con rollback global, corrige el fixture y ejecuta dos veces el backfill para comprobar idempotencia. Por último prueba que el *contract* rechaza identidades pendientes, lo aplica sobre la copia y repite la suite HTTP después de retirar las columnas. El CI no publica el volcado.

Para ensayar una restauración fuera de CI, en una infraestructura autorizada y con acceso restringido:

```bash
export PGDATABASE=school_management
pg_dump -Fc -f /ruta/segura/core.dump
createdb school_management_restore
pg_restore --exit-on-error -d school_management_restore /ruta/segura/core.dump
```

Registrar fecha, versión PostgreSQL, tamaño y duración del volcado y restauración, conteos antes/después, resultado de RLS, cadena y descifrado. Custodiar `ENCRYPTION_MASTER_KEY` y `DOCUMENT_HMAC_KEY` fuera del volcado; sin ellas no se recupera la identidad cifrada. Proteger el archivo como dato personal y borrarlo conforme a la retención aprobada. No restaurar encima de la base activa. Si la restauración falla, detener la migración y conservar la base original; si falla el backfill, revertir la transacción completa y corregir el dato de origen antes de reintentar.

La migración *contract* exige además inventario de consumidores, ventana de compatibilidad y autorización de ejecución en el entorno compartido. Detener escrituras durante el preflight y la migración. Antes de aplicarla, ejecutar `npm run verify:identity-contract` en `backend/` con `DATABASE_URL`, `ENCRYPTION_MASTER_KEY` y `DOCUMENT_HMAC_KEY`; el preflight compara cada DNI legado con el documento descifrado, HMAC y últimos cuatro dígitos, sin imprimir el documento. El comando opt-in se ejecuta desde `database/` con `DATABASE_URL` de la base objetivo y `CORE_IDENTITY_CONTRACT_ACK=backup-restore-backfill-verified npm run migrate:contract`; `npm run migrate` no la incluye. Probar antes el mismo comando en una copia recién restaurada. El SQL bloquea escrituras concurrentes en `usuarios` y `personas` hasta completar la transacción. Si detecta un DNI no cifrado o una dependencia de columna, toda la migración se revierte y se conserva la base original. Si aparece una incidencia después de aplicarla, detener escrituras, restaurar el volcado previo en otra base, verificar RLS, auditoría y claves, y conmutar el servicio a esa copia durante la ventana acordada. Cualquier compensación posterior en la base compartida requiere una migración nueva; no editar ni revertir la migración histórica.

## API

Las rutas bajo `/api/v1` usan `{success,data|error,timestamp}`, salvo `/health` y el PDF. El tenant procede del JWT validado y la conexión ejecuta `SET LOCAL app.tenant_id` y `app.user_id` para RLS.

El contrato vigente se publica en `packages/contracts/openapi/openapi.yaml`, con rutas en `paths/` y componentes en `components/`; `core.yaml` permanece como instantánea histórica para comprobar la migración de 46 rutas y 57 operaciones. Los tipos de `school-contracts` se generan desde el contrato vigente. Los campos de entrada se validan en los controladores con Zod.

La suite HTTP integrada valida las respuestas de Sprint 3 contra un bundle OpenAPI 3.1 desreferenciado. En una instalación local nueva, ejecutar `npm ci` en `packages/contracts/` y `npx redocly bundle openapi/openapi.yaml --dereferenced --output ../../backend/tests/integration/.openapi-bundle.json` antes de `npm run test:integration` en `backend/`; el archivo generado está ignorado por Git. El CI ejecuta esos pasos automáticamente.

| Grupo | Rutas principales |
| --- | --- |
| Acceso | `POST /auth/login`, `/auth/refresh-token`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/activate`; `GET /auth/me` |
| Usuarios | `GET/POST /users`, `POST /users/import/preview`, `/users/import/commit`, `POST /users/:id/invite`, `PATCH /users/:id`, baja/reactivación, `PUT /users/:id/roles` |
| Roles y privacidad | `GET /users/roles`, `/users/permissions`, `PUT /users/roles/:id/permissions`, `POST /users/:id/document` con motivo |
| Configuración | `GET/PATCH /school/institution`, sedes, años, periodos, secciones, días no lectivos y escalas |
| Apoderados | vínculos, invitaciones, `GET /guardians/consent`, activación con consentimiento, estudiantes propios y revocación bajo `/guardians` |
| Avisos | bandeja, preferencias, creación y WebSocket `/notifications/ws`; correo persistido con cinco intentos |
| Auditoría | `GET /audit/logs`, `/audit/verify-chain`, `/audit/export.pdf` (hasta 2000 eventos) |

Access JWT dura 15 minutos; refresh rota por sesión. La inactividad de 30 minutos y cinco intentos por IP o identificador cortan acceso. Los cambios de rol/matriz revocan sesiones. `NotificationService.create(client,tenantId,userId,input)` permite a otros squads crear avisos en su transacción. Las correcciones de notas/asistencia de Squads 2/3 deben registrar autor, motivo y valores anterior/nuevo con `AuditService.record` en la misma transacción.

Si Administración TI cambia el correo de una cuenta no administradora, esta queda pendiente, se revocan sus sesiones y se debe enviar una nueva invitación. La importación aplica la misma regla. El correo de una cuenta `SUPERADMIN` no se cambia por estas rutas. El vínculo de contraseña anterior no habilita recuperación por un correo aún no verificado.

Un vínculo familiar creado por Secretaría queda pendiente de aceptación. `GET /guardians/students` solo devuelve estudiantes tras consumir la invitación y aceptar la versión vigente del texto oficial. Revocar y volver a vincular obliga a confirmar otra vez; una nueva versión oficial obliga a recabar de nuevo el consentimiento.

Antes de vincular, Squad 2 debe publicar la ficha de filiación en `fichas_apoderados_verificados` conforme al [contrato RF-15 → RF-75](CONTRATO_FICHA_RF15_RF75.md). Secretaría no puede sustituir esa fuente con texto libre. La ausencia o revocación de la ficha bloquea invitación, activación y consulta. El texto/versionado oficial de consentimiento se configura al preparar el despliegue del piloto; sin él el API responde 503.

## Verificación y pendientes institucionales

`database/npm test` comprueba migraciones, RLS y cadena; `backend/npm test` cubre cifrado e importación CSV/XLSX. El CI del Core usa PostgreSQL 16, Redis 7 y SMTP de captura local con dos instituciones ficticias, además del ensayo de restauración y backfill. Ejecutar lint, build y auditor PrimeReact en frontend cuando cambie la interfaz. La institución debe aprobar D-16 y el texto legal de consentimiento antes de habilitar escalas numéricas o consentimiento de apoderados con datos reales.
