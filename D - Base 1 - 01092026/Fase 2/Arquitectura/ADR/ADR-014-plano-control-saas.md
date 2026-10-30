# ADR-014: Plano de control SaaS y ciclo de vida del tenant

- **Estado:** Propuesto
- **Fecha:** 2026-10-30
- **Decisores requeridos:** líder del proyecto, Squad 1, responsables de datos del plantel y representantes de los squads consumidores
- **Afecta:** Core, operación, despliegue y todos los módulos que almacenan datos por `tenant_id`
- **Base:** ADR-002 (UUID y origen del tenant), ADR-003 (RLS), ADR-004 (migraciones), RF-07 y RNF-05–08

## Contexto

El modelo actual ya usa `instituciones.id` como `tenant_id UUID`, contexto transaccional y RLS. El JWT actual emite el claim `tenantId`; ADR-002 propone `tenant_id`, aún no implementado. `instituciones` tiene un indicador `activo` booleano, no el ciclo de estados de esta propuesta. El alta inicial se realiza mediante `bootstrap-admin.ts`, pensado para el piloto Guamán Poma de Ayala. No hay un plano de control para provisionar, suspender y recuperar varios planteles. `SUPERADMIN` es un administrador TI **dentro** de un plantel y no debe convertirse en un operador global con acceso a datos escolares.

El alcance aprobado se limita al piloto. El líder del proyecto confirmó el 2026-10-30 que se mantiene ese límite. Esta decisión define una arquitectura preparada para varios tenants de prueba; incorporar otros planteles a producción requeriría cambiar formalmente ese alcance en el futuro.

## Decisión propuesta

1. Mantener una instalación de PostgreSQL compartida, `tenant_id UUID` y RLS obligatoria. Cada petición de datos usa el rol `sms_app` sin `BYPASSRLS` y fija el contexto con `SET LOCAL` dentro de una transacción. Un contexto ausente falla cerrado.
2. Separar **plano de datos** (API escolar) y **plano de control** (provisión y operación técnica). El operador de plataforma no tiene una cuenta escolar `SUPERADMIN`, ni permisos de lectura de personas, calificaciones, asistencia o auditoría detallada de un plantel. Sus acciones técnicas dejan una bitácora propia con identificador de tenant, actor, motivo y resultado, sin datos personales. La implementación propuesta es un comando interno con credencial de operador separada y un rol de base de datos que solo puede ejecutar procedimientos de provisión/suspensión limitados; no reutiliza `sms_app` ni el rol migrador para operaciones privilegiadas. Los procedimientos fijan `search_path`, validan actor/motivo y nunca devuelven filas escolares.
3. El primer alta será operada, mediante un comando/servicio interno autenticado con privilegios mínimos. No se expone un endpoint público de auto registro ni se introduce facturación. La provisión crea institución, configuración mínima y una invitación de un uso para el primer administrador local. Cada paso es idempotente o reanudable; un fallo parcial deja estado `aprovisionando` y no un tenant utilizable.
4. Estados técnicos: `solicitado → aprovisionando → activo → suspendido → archivado`. Una nueva migración agrega el estado y mantiene compatibilidad con `instituciones.activo` durante la transición; nunca se edita la migración inicial. Solo `activo` admite login, refresh, peticiones protegidas, jobs y WebSockets. Suspender invalida sesiones existentes y detiene trabajos pendientes de ese tenant. Reactivar requiere motivo y verificación operativa. `archivado` no implica borrado físico automático; la retención y eliminación de datos se definen con la institución.
5. La institución es el tenant y sus sedes son unidades internas, según decisión del líder del proyecto del 2026-10-30. Antes del login se resuelve el tenant mediante un código público único (y, si se aprueba posteriormente, un dominio verificado). Tras autenticarse, la autoridad es el tenant de la sesión/JWT validado contra la base. La migración de claim `tenantId` a `tenant_id` debe coordinarse con ADR-001/002 y consumidores M8; se documenta su ventana de compatibilidad antes del cambio. Ni `X-Tenant-ID`, ni el cuerpo, ni un dominio no verificado autorizan acceso. Una discrepancia entre host/código, sesión y token se rechaza.
6. Configuración operativa, cuotas técnicas, límites de tasa, jobs, caché, canales WebSocket, correos, exportaciones y archivos usan claves o rutas con `tenant_id`. Los secretos no se almacenan en la configuración escolar. La telemetría incluye `tenant_id` seudónimo e identificador de solicitud, sin DNI ni contenido de expedientes.
7. Migraciones de esquema siguen siendo globales y versionadas. Antes de migraciones incompatibles se toma respaldo y se ensaya restauración; la restauración de un solo tenant requiere procedimiento probado para evitar sobrescribir datos de otro.

## Consecuencias

- El Core necesita un estado de tenant persistido y una comprobación de estado en login, refresh y peticiones protegidas; el JWT por sí solo no acredita que el plantel siga activo.
- La provisión, suspensión y recuperación se implementan fuera de las rutas escolares y con identidad de operador separada.
- La política RLS cubre filas, pero no aísla automáticamente Redis, correo, WebSockets, objetos ni vistas materializadas. Cada uno requiere pruebas A/B.
- No se crean bases separadas por tenant en esta fase. Se reevalúa si requisitos legales, escala o residencia de datos lo exigen.

## Verificación requerida para aceptación

1. Crear dos tenants desde cero y repetir la provisión tras un fallo simulado sin duplicados.
2. Demostrar rechazo A→B por API, SQL con `sms_app`, búsqueda, exportación, WebSocket, correo, cola y archivos.
3. Suspender A durante una sesión: siguiente petición, refresh y evento en tiempo real fallan; B sigue operativo.
4. Reutilizar conexiones del pool tras cambiar de tenant sin heredar contexto anterior.
5. Restaurar un respaldo de ensayo y documentar tiempo, pérdida máxima de datos y controles de integridad.

## Preguntas para la revisión del consejo de diseño

- ¿Quién custodia la identidad del operador de plataforma y quién autoriza un alta, suspensión o restauración?
- ¿Qué entidad legal es responsable de los datos al añadir planteles externos al piloto?
- ¿Qué retención, exportación y eliminación se exige al archivar un tenant?
- ¿Se autorizarán dominios propios por plantel o se mantendrá el código modular como selector inicial?

Hasta resolver esas preguntas, este ADR sigue **Propuesto**. Su existencia no autoriza incorporar terceros en producción.
