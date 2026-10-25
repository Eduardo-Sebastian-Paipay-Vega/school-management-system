# 05 — Arquitectura de base de datos

## 1. Estado actual

| Aspecto | Valor |
|---|---|
| Motor | PostgreSQL 16 (`postgres:16-alpine` en `docker-compose.yml`); pruebas sobre PGlite 0.3.16 |
| Acceso | SQL directo con `pg` (sin ORM). Backend común: `backend/src/config/database.ts`. M8: su propio `store.ts` |
| Fuente ejecutable del esquema | `database/migrations/` (ADR-004). `database/init/01_esquema_consolidado.sql` y los `esquema_datos.sql` de cada squad son referencias históricas, **no** normativas |
| Herramienta de migraciones | `node-pg-migrate` 9.0.0, archivos `.sql` sin sección `down` |
| Migraciones | 10: dos copias exactas de la línea base, seis del núcleo (S1/S2) y dos de acceso y permisos (S1) |
| Aislamiento | RLS en toda tabla con `tenant_id`; la aplicación usa un usuario miembro de `sms_app`, sin `BYPASSRLS` y sin ser dueño de tablas (`assertRuntimeRole()` impide arrancar si no se cumple) |
| Pruebas | `database/tests/migraciones.test.mjs`: 33 pruebas (base nueva, base con datos, base creada por el *init*, RLS, restricciones, cadena de auditoría) |
| Semillas | No hay carpeta `seeds/`. Los datos obligatorios (roles, permisos, banco CNEB) viven en las migraciones |
| Respaldo | **No definido ni probado** |

## 2. Convenciones

No se redefinen aquí: son las **C-01 a C-14** del [modelo de datos canónico](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/modelo_datos_canonico.md) §5, ya aplicadas por las migraciones del núcleo. En resumen:

| Tema | Regla |
|---|---|
| Identificadores | `id UUID DEFAULT gen_random_uuid()` |
| Tenant | `tenant_id UUID NOT NULL` → `instituciones(id)` `ON DELETE RESTRICT`, índice `idx_<tabla>_tenant`, FK compuestas `(tenant_id, <padre>_id)` |
| Auditoría de filas | `created_at`, `updated_at`, `created_by` según C-05; inmutables sin `updated_at` (C-07) |
| Tiempo | Instantes en `TIMESTAMPTZ` (UTC); fechas civiles en `DATE` calculadas en `America/Lima` |
| Borrado | Baja lógica en tablas maestras (`activo` o `estado`); `sms_app` no tiene `DELETE` por defecto |
| Nombres | `snake_case` en español, tablas en plural, prefijos `pk_`, `uq_`, `fk_`, `ck_`, `idx_` |
| Datos personales | Clasificados en el diccionario; los restringidos se cifran en la aplicación (AES-256-GCM + índice ciego HMAC) |

Las decisiones que siguen **propuestas** (ADR-002 a ADR-004) se aplican en el código, pero su aprobación formal está pendiente.

## 3. Propiedad de los datos

| Grupo de tablas | Dueño | Escriben | Leen |
|---|---|---|---|
| `instituciones`, `sedes`, `configuracion_institucional`, `anios_lectivos`, `periodos_academicos`, `dias_no_lectivos`, `escalas_calificacion`, `rangos_escala` | S1 | S1 | Todos |
| `personas`, `usuarios`, `usuario_roles`, `roles`, `permisos_core`, `rol_permisos_core`, `sesiones_usuario`, `enlaces_acceso` | S1 | S1 | S2 (vía servicio) |
| `apoderados_estudiantes`, `invitaciones_apoderado`, `consentimientos_datos`, `notificaciones`, `preferencias_notificacion`, `envios_correo` | S1 | S1 (otros squads crean avisos con `NotificationService.create`) | S1 |
| `logs_auditoria` | S1 | Solo `fn_registrar_auditoria()` | S1 |
| `grados_secciones` | S1 (RF-12) | S1 | S2, S3, S4 |
| `matriculas`, `cursos`, `competencias`, `plan_estudios`, `carga_lectiva`, `importaciones_nomina`, `asistencias_*`, `carnes_escolares`, `avisos_inasistencia` | S2 | S2 | S3, S4, S5 |
| `squad3.*`, `evaluaciones`, `calificaciones`, `conclusiones_descriptivas`, `actividades_evaluativas`, `importaciones_notas`, `plazos_registro_notas`, `alertas_docentes`, `banco_conclusiones_cneb` | S3 | S3 | S4, S5 |
| `vm_*`, `metricas_impacto_ssu`, `franjas_atencion`, `citas_apoderados` | S4 | S4 | S5 |
| `documentos_emitidos`, `expedientes_*`, `solicitudes_certificado`, `exportaciones_siagie`, `comunicados_cartelera`, `noticias*`, `integraciones_redes` | S5 | S5 | Público (solo filas publicadas) |

Notas: el esquema `squad3` de M8 guarda `tenant_id` como `VARCHAR(50)` con el UUID en texto (ADR-002 §3); las tablas de la línea base para S2–S5 existen pero no se han revisado contra C-01–C-14 (auditoría P-15). No se fragmenta la base por módulo: un solo PostgreSQL y un solo historial de migraciones.

## 4. Migraciones

| Tema | Regla (ADR-004) |
|---|---|
| Ubicación única | `database/migrations/`. M8 deja de ejecutar `provision.ts migrate` como vía oficial |
| Nombre | `AAAAMMDDHHMMSS_s<squad>_<descripcion>.sql` en UTC; `npm run migrate:create -- s2_<descripcion>` |
| Orden | Por marca de tiempo; `migrate` usa `--no-check-order` para admitir ramas paralelas |
| Historial | Tabla de control de `node-pg-migrate`. Una migración aplicada **no se edita ni se borra** |
| Transacción | Una por migración; excepciones (`CREATE INDEX CONCURRENTLY`, `ALTER TYPE … ADD VALUE`) van solas y lo declaran en el encabezado |
| Cambios incompatibles | *Expand / contract* en dos despliegues (p. ej. traslado de identidad de `usuarios` a `personas`) |
| Reversión | Solo hacia adelante en entornos compartidos: una reversión es una migración nueva, respaldada por el volcado previo |
| Aprobación | Las que tocan tablas del núcleo requieren aprobación del Squad 1 |

| Entorno | Ejecución |
|---|---|
| Local | `docker compose up -d postgres redis`, luego `npm run migrate` en `database/` con `DATABASE_URL` de administrador y `npm run bootstrap:app-role` |
| Pruebas / CI | `npm test` en `database/`: PGlite, base nueva, sin servidor |
| `dev` compartido / producción | Paso manual y explícito con volcado previo, ejecutado por un rol migrador. **Nunca** desde el arranque de la aplicación ni desde CI sin autorización |

Comprobar estado: `npx node-pg-migrate up --dry-run --migrations-dir migrations --migration-file-language sql --no-check-order` (con `DATABASE_URL`; imprime el SQL pendiente sin ejecutarlo).

## 5. Semillas

| Tipo | Dónde | Regla |
|---|---|---|
| Datos de referencia obligatorios (roles, permisos, banco CNEB) | Dentro de migraciones | Idempotentes |
| Institución y primer administrador | `backend/` → `npm run bootstrap:admin` con variables `BOOTSTRAP_*` | No imprime contraseñas ni tokens |
| Datos de demostración | **No existen** | Si se crean, irán en `database/seeds/demo/` y nunca se ejecutarán en producción |
| Rangos CNEB | **No se siembran** | Bloqueado por D-16 |

## 6. Respaldo y recuperación

| Tema | Estado |
|---|---|
| Mecanismo | Propuesto: `pg_dump -Fc` antes de cada migración en entornos compartidos y uno diario. Sin implementar |
| Responsable | Líder del proyecto hasta que se defina el hosting (D-19) |
| Prueba de restauración | **No realizada.** Es requisito previo a la migración *contract* de identidad (`PLAN.md`) |
| Particiones de auditoría | Las migraciones crean 12 meses; falta el job mensual de `fn_crear_particion_auditoria()` |
| Redis | Datos efímeros (contadores, `jti` revocados); `appendonly yes` en local. Perderlo invalida sesiones, no datos |

## 7. Pendientes

1. `docker-compose.yml` aún monta `database/init/` como *init* (ADR-004 propone un script que solo cree roles). Se mantiene porque las pruebas cubren ese camino; cambiarlo es decisión del líder.
2. La contraseña de PostgreSQL de desarrollo está escrita en `docker-compose.yml`; moverla a un `.env` local no versionado.
3. Revisar y corregir con migraciones nuevas las tablas de la línea base de S2–S5 antes de usarlas.
4. Unificar `tenant_id` de M8 a `UUID` (ADR-002 §3) con *dry-run* y reversión.
5. Definir respaldo, probar una restauración y documentar el procedimiento.
