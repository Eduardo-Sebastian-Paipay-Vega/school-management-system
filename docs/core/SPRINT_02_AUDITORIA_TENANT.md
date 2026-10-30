# Sprint 2 — Inventario de acceso directo a PostgreSQL

**Fecha:** 2026-10-30. **Alcance:** búsqueda estática de `pool.query()` y `pool.connect()` en `backend/src/`. Esta revisión no sustituye la prueba A/B de la API ni cubre SQL ejecutado por el servicio M8.

| Ubicación | Uso | Clasificación |
|---|---|---|
| `config/database.ts` → `assertRuntimeRole()` | Comprueba que el usuario runtime hereda `sms_app` sin superusuario, `BYPASSRLS` ni propiedad de tablas | Consulta administrativa sin datos escolares; permitida antes de aceptar tráfico |
| `config/database.ts` → `resolveInstitution()` | `fn_resolver_institucion(codigoModular)` resuelve un código público antes de login | Excepción pública controlada; no devuelve filas de personas ni datos escolares |
| `config/database.ts` → `withTenant()` | Abre conexión, `BEGIN`, fija `app.tenant_id`/`app.user_id` con `set_config(..., true)`, ejecuta callback y libera tras `COMMIT`/`ROLLBACK` | Única vía prevista para datos de un tenant |
| `routes/health.routes.ts` | `SELECT NOW()` para salud de PostgreSQL | Consulta de disponibilidad sin datos escolares; permitida |

La búsqueda no encontró otros usos directos de `pool.query()` o `pool.connect()` en el backend común. Las rutas/servicios del Core usan `withTenant()` o reciben el `PoolClient` de una transacción ya abierta. El JWT actual aún transita de `tenantId` a `tenant_id`; esta auditoría no certifica por sí sola que el tenant de todas las rutas sea correcto.

**Gate S2-06 (P1):** añadir una comprobación automatizada que falle si aparece un nuevo `pool.query`/`pool.connect` fuera de esta lista, o justificarlo explícitamente en revisión de código. El gate P0 se demuestra con PostgreSQL real, dos tenants, rol `sms_runtime`, pool reutilizado y pruebas HTTP/SQL A/B (S2-05).
