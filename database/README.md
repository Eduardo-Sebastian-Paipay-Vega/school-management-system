# Base de datos

Migraciones versionadas y pruebas de PostgreSQL 16 del Sistema de Gestión Escolar.

Las reglas están en [ADR-004](../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-004-migraciones.md). El diseño está en el [modelo de datos canónico](../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/modelo_datos_canonico.md), y el aislamiento por institución en [ADR-003](../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-003-aislamiento-rls.md).

## Estructura

```text
database/
├── init/          # 01_esquema_consolidado.sql: línea base histórica, NO se edita
├── migrations/    # migraciones SQL, en orden por marca de tiempo
└── tests/         # pruebas de restricciones, RLS y auditoría (PGlite)
```

## Comandos

```bash
npm install
```

Ejecutar las pruebas. No requieren servidor: PGlite es PostgreSQL compilado a WebAssembly.

```bash
npm test
```

Aplicar las migraciones pendientes a una base existente, por ejemplo la de `docker compose`:

```bash
DATABASE_URL="postgres://postgres:<clave>@localhost:5432/school_management" npm run migrate
```

Crear una migración nueva (genera el archivo con la marca de tiempo):

```bash
npm run migrate:create -- s2_asistencia_eventos_kiosco
```

## Migraciones actuales

| Archivo | Contenido |
|---|---|
| `20261022000000_baseline_consolidado.sql` | Copia exacta de `init/01_esquema_consolidado.sql` |
| `20261022000100_baseline_squad3.sql` | Copia exacta de `backend/squad_3_calificaciones/migrations/001_grades.sql` (M8) |
| `20261022010000_s1_contexto_y_roles.sql` | `app_tenant_id()`, `app_user_id()`, triggers comunes y el rol `sms_app` |
| `20261022010100_s1_nucleo_identidad.sql` | `personas` (DM-01, DM-02), usuario `sistema`, `usuarios`, `usuario_roles`, apoderados y consentimientos |
| `20261022010200_s1_nucleo_institucion_calendario.sql` | Configuración institucional, sedes, años, periodos, días no lectivos y escalas |
| `20261022010300_s2_nucleo_estructura_academica.sql` | Secciones por año, cursos, competencias, plan de estudios, carga lectiva y matrículas |
| `20261022010400_s1_nucleo_auditoria.sql` | `logs_auditoria` particionada por mes, con cadena de hash calculada en la base |
| `20261022010500_s1_rls_y_permisos.sql` | RLS en toda tabla con `tenant_id` y privilegios de `sms_app` |
| `20261023182000_s1_acceso_y_notificaciones.sql` | `sesiones_usuario` y `enlaces_acceso` (activación y recuperación de un uso) |
| `20261023190000_s1_rbac_y_cola.sql` | `permisos_core`, `rol_permisos_core` y cola de correo |

## Reglas rápidas

- Una migración aplicada **no se edita**: si hay un error, se escribe otra.
- Nombre: `AAAAMMDDHHMMSS_s<squad>_<descripcion>.sql`, en UTC.
- Toda tabla nueva cumple las convenciones C-01 a C-14 del modelo canónico. Las pruebas fallan si una tabla con `tenant_id` queda sin política RLS.
- Las migraciones que tocan tablas del núcleo requieren aprobación del Squad 1.

## Cómo usar la base desde la aplicación

Cada solicitud abre una transacción y fija el contexto. Sin contexto, la aplicación no ve ninguna fila:

```sql
BEGIN;
SELECT set_config('app.tenant_id', '<uuid de la institución>', true),
       set_config('app.user_id',   '<uuid del usuario>', true);
-- consultas normales; RLS filtra por institución
COMMIT;
```

La aplicación no puede insertar en `logs_auditoria` directamente. Registra con:

```sql
SELECT fn_registrar_auditoria('core', 'LOGIN', '10.0.0.1'::inet, 'usuarios', '<id>', NULL, '{"rol":"DOCENTE"}'::jsonb);
SELECT * FROM fn_verificar_cadena_auditoria();
```

## Pendiente

- La migración *contract* de identidad: cifrar los DNI existentes en `personas` y eliminar de `usuarios` las columnas de identidad, cuando el login del Squad 1 lea `personas`.
- Job mensual que ejecute `fn_crear_particion_auditoria()`. La migración deja creados los próximos 12 meses.
- Cambiar `docker-compose.yml` para que el *init* solo cree roles (ADR-004). Mientras tanto funciona igual: la línea base se puede ejecutar de nuevo sin errores.
