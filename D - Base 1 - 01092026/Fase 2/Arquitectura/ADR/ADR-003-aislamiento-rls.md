# ADR-003: Aislamiento multi-tenant con Row-Level Security

- **Estado:** Aceptado por el líder del proyecto el 2026-10-30 para el cierre de S1/S2; verificación PostgreSQL A/B en S2.
- **Fecha:** 2026-10-22
- **Decisores:** Líder de proyecto (Squad 2), Squad 1 (Brandon Montero), Squad 3 (Steve Ovalle)
- **Squads afectados:** S1, S2, S3, S4, S5
- **Depende de:** [ADR-002](ADR-002-tipo-tenant-id.md) (tenant UUID tomado del JWT)
- **Formaliza:** la parte de RLS de D-04 en [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](../../../../docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md)
- **Requisitos relacionados:** RNF-06, RNF-08, RF-68

## Contexto

Las siguientes brechas describen la línea base previa a las migraciones versionadas. Al 2026-10-30, las migraciones del Core habilitan RLS y crean `sms_app NOBYPASSRLS`, y el arranque comprueba que el usuario de la aplicación no sea superusuario, dueño de tablas ni tenga `BYPASSRLS`. Falta una prueba integrada con PostgreSQL/Redis reales y dos tenants.

- **El consolidado original no tenía RLS.** El aislamiento dependía de que cada consulta recordara escribir `WHERE tenant_id = ...`. Un solo olvido podía exponer datos de menores de otro plantel.
- **M8 ya usa RLS** (`squad3.gradebooks` y `squad3.grade_audit_history`) con `current_setting('app.tenant_id', true)`, y advierte que "los dueños de la tabla omiten RLS".
- **El backend común se conectaba como `postgres`.** El código actual exige un usuario distinto y `assertRuntimeRole()` verifica sus privilegios antes del arranque. `POSTGRES_USER: postgres` en Docker corresponde al rol administrativo de la base, no al usuario de ejecución de la API.
- **17 tablas transaccionales de la línea base no tenían `tenant_id`** ([`modelo_datos_canonico.md`](../modelo_datos_canonico.md) §1.1). Las migraciones de núcleo corrigen ese punto; las tablas heredadas de los demás squads requieren revisión antes de usarse.

## Opciones consideradas

1. **Solo filtro en la aplicación.**
   - En contra: un error en una consulta es una filtración; no hay segunda barrera.
2. **Una base de datos o un esquema por tenant.**
   - A favor: aislamiento físico.
   - En contra: migraciones × N, conexiones × N; desproporcionado para un piloto de un plantel. Y M8 ya está diseñado sobre una sola base.
3. **Filtro en la aplicación + RLS en PostgreSQL, con roles separados.**
   - A favor: dos barreras independientes; mismo patrón que M8; costo bajo.
   - En contra: obliga a ejecutar toda consulta dentro de una transacción con contexto.

## Decisión

Se adopta la **opción 3**.

### 1. Roles de base de datos

| Rol | Login | Privilegios | Uso |
|---|---|---|---|
| `sms_owner` | No | Dueño de todos los objetos | Solo lo asumen las migraciones |
| `sms_migrator` | Sí | Miembro de `sms_owner` | Ejecutar migraciones (ADR-004) |
| `sms_app` | Sí | `SELECT`, `INSERT`, `UPDATE` sobre tablas de negocio; `INSERT` y `SELECT` sobre auditoría; `NOBYPASSRLS`; **no** es dueño de nada | Backend común y M8 |
| `postgres` | Sí | Superusuario | Solo administración. **Nunca** en una cadena de conexión de la aplicación |

La tabla anterior expresa el modelo objetivo. En la implementación actual, el dueño de los objetos es el rol que ejecuta las migraciones (en desarrollo, `postgres`); `sms_owner` y `sms_migrator` no existen como roles creados por las migraciones. La migración crea `sms_app` como rol de grupo sin login; cada entorno crea su usuario con login y le concede `sms_app`.

`DELETE` no se concede a `sms_app` por defecto (baja lógica, C-10 del modelo). Una tabla que necesite borrado físico lo justifica en su SDD.

### 2. Contexto por transacción

```sql
CREATE FUNCTION app_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;

CREATE FUNCTION app_user_id() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;
```

- El backend abre cada solicitud con `BEGIN` y luego `SELECT set_config('app.tenant_id', $1, true), set_config('app.user_id', $2, true)`. El tercer argumento `true` limita el valor a la transacción.
- Se prohíbe `SET` de sesión: con un pool de conexiones, el valor pasaría a la siguiente solicitud de otro tenant.
- El módulo `core/database` expone un único punto de entrada, `withTenant(ctx, fn)`. Ningún módulo usa `pool.query` directamente; se controla con una regla de lint y en la revisión de código.
- El `NULLIF` hace que la política **falle cerrada**: sin contexto, `app_tenant_id()` es `NULL`, ninguna fila cumple `tenant_id = NULL` y las inserciones fallan.

### 3. Política estándar

Toda tabla con `tenant_id`:

```sql
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_<tabla>_tenant ON <tabla>
    USING (tenant_id = app_tenant_id())
    WITH CHECK (tenant_id = app_tenant_id());
```

Casos particulares:

| Objeto | Tratamiento |
|---|---|
| `instituciones` | `USING (id = app_tenant_id())`; sin `INSERT` para `sms_app` (los tenants se crean por migración o por un procedimiento administrativo) |
| `roles`, `banco_conclusiones_cneb` | Catálogos globales sin RLS; `sms_app` solo tiene `SELECT` |
| Esquema `squad3` (M8) | Conserva sus políticas: compara `VARCHAR` con el mismo parámetro `app.tenant_id`, que contiene el UUID en texto (ADR-002). No requiere cambios |
| Vistas materializadas `vm_*` | PostgreSQL **no** aplica RLS a vistas materializadas. Se revoca el acceso de `sms_app` y se exponen con vistas `WITH (security_barrier)` filtradas por `tenant_id = app_tenant_id()`. Por eso toda `vm_*` debe tener `tenant_id` |
| Refresco de vistas materializadas | En PostgreSQL 16 solo el dueño puede refrescarlas. Se hace con `fn_refrescar_vistas()`, `SECURITY DEFINER`, propiedad de `sms_owner`, con `EXECUTE` para `sms_app` |

`FORCE ROW LEVEL SECURITY` no se usa: la aplicación nunca es dueña de las tablas y las migraciones necesitan operar sobre todos los tenants.

### 4. Operaciones sin sesión o entre tenants

| Caso | Solución |
|---|---|
| Login: hay que encontrar el tenant antes de autenticar | `fn_resolver_tenant(codigo_modular)`, `SECURITY DEFINER`, devuelve solo el UUID de una institución activa. Luego se fija el contexto y se consulta `usuarios` normalmente |
| Verificador público de documentos (RF-60) | `fn_verificar_documento(token)`, `SECURITY DEFINER`. Devuelve solo los campos públicos del documento (tipo, fecha, institución, estado) y nunca el contenido personal |
| Portal público (noticias, comunicados) | El tenant se deduce del dominio o del código del plantel y se fija el contexto. Solo se leen filas publicadas |
| Monitores y jobs (alertas de notas, avisos de inasistencia) | Recorren los tenants **uno por uno**, cada uno en su transacción con contexto. No existe un rol con `BYPASSRLS` para la aplicación |

Cada función `SECURITY DEFINER` fija `SET search_path = public, pg_temp`, valida sus argumentos y está cubierta por pruebas.

## Consecuencias

- **Base de datos:** las 17 tablas sin `tenant_id` lo reciben (modelo canónico, DM-06). Las migraciones crean roles, funciones de contexto y políticas.
- **`docker-compose.yml`:** la aplicación usa `sms_app` en lugar de `postgres`. Las credenciales salen de variables de entorno, no del archivo (relacionado con D-03).
- **Backend común:** `core/database` implementa `withTenant`. El rendimiento no cambia de forma apreciable, porque las políticas usan el índice `idx_<tabla>_tenant` que ya exige C-02.
- **Squad 4:** sus vistas materializadas incluyen `tenant_id` y se leen a través de vistas `security_barrier`.
- **Pruebas obligatorias en CI** (ya validadas con PGlite sobre el núcleo; ver el modelo canónico §5):
  1. Con el contexto del tenant A, `sms_app` solo ve filas de A.
  2. Sin contexto, `sms_app` no ve ninguna fila.
  3. `sms_app` no puede insertar ni actualizar filas con el `tenant_id` de otro tenant.
  4. `sms_app` no es dueño de ninguna tabla y no tiene `BYPASSRLS` (consulta a `pg_class` y `pg_roles`).
  5. Toda tabla con columna `tenant_id` tiene RLS activado y al menos una política (consulta a `pg_class.relrowsecurity` y `pg_policies`). Esta prueba impide que una tabla nueva quede sin política.
  6. Ninguna vista materializada es legible por `sms_app`.

## Preguntas abiertas para la revisión

1. ¿M8 se conecta con el mismo rol `sms_app` o con uno propio (`sms_app_grades`) limitado al esquema `squad3`? Un rol propio reduce el impacto si M8 se ve comprometido.
2. ¿Se usará PgBouncer? Si se usa, debe ser en modo *transaction*, compatible con `set_config(..., true)`.
