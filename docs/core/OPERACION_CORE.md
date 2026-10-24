# Operación del Core — Squad 1

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

## API

Las rutas bajo `/api/v1` usan `{success,data|error,timestamp}`, salvo `/health` y el PDF. El tenant procede del JWT validado y la conexión ejecuta `SET LOCAL app.tenant_id` y `app.user_id` para RLS.

El inventario de operaciones y el esquema de respuesta se publica en `packages/contracts/openapi/core.yaml`; los campos de entrada se validan en los controladores con Zod.

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

## Verificación y pendientes institucionales

`database/npm test` comprueba migraciones, RLS y cadena; `backend/npm test` cubre cifrado e importación CSV. Ejecutar lint, build y auditor PrimeReact en frontend. Para la aceptación real se necesita un entorno integrado PostgreSQL + Redis + SMTP con dos planteles y cuentas de cada rol. La institución debe aprobar D-16 y el texto legal de consentimiento antes de habilitar escalas numéricas o consentimiento de apoderados con datos reales.
