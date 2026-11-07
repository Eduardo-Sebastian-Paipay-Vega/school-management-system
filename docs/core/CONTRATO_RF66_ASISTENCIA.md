# Contrato Core → Squad 2: corrección auditada de asistencia (RF-66) y aforo de sección (RF-12)

**Origen:** Sprint 6, historias S6-04 y S6-06 de [`PLAN_IMPLEMENTACION_S6_S9.md`](PLAN_IMPLEMENTACION_S6_S9.md). **Proveedor:** Squad 1 (Core). **Consumidor:** Squad 2 (matrícula y asistencia, RF-16, RF-20–25).
**Migraciones:** `database/migrations/20261107000200_s1_asistencia_tenant_y_correccion_auditada.sql` y `20261107000300_s1_aforo_seccion.sql`. **Pruebas:** `database/tests/migraciones.test.mjs` (bloque «S6-04 y S6-06») y `backend/tests/integration/tenant-isolation.test.cjs` (prueba «S6-06»).

## 1. Aislamiento de asistencia

- `asistencias_alumnos` y `avisos_inasistencia` tienen `tenant_id UUID NOT NULL` con `DEFAULT app_tenant_id()`, FK compuesta (`asistencias_alumnos(tenant_id, matricula_id) → matriculas(tenant_id, id)`; `avisos_inasistencia(tenant_id, asistencia_id) → asistencias_alumnos(tenant_id, id)`) y la política RLS estándar `tenant_id = app_tenant_id()`.
- Toda escritura se hace dentro de `withTenant()`. Sin contexto, `tenant_id` queda `NULL` y la inserción falla. Registrar sobre una matrícula de otro tenant falla con `fk_asistencias_matricula_tenant`.

## 2. Privilegios de `sms_app`

| Tabla | Permitido | Motivo |
|---|---|---|
| `asistencias_alumnos` | `SELECT`, `INSERT` | El registro ordinario (aula, kiosco, sincronización) es una inserción. **No hay `UPDATE` directo**: toda modificación es una corrección auditada (§3). |
| `avisos_inasistencia` | `SELECT`, `INSERT`, `UPDATE` | Vincula el aviso con la notificación. |

Para la sincronización del kiosco (`POST /api/v1/attendance/sync-batch`), un registro duplicado del mismo día debe usar `INSERT … ON CONFLICT (matricula_id, fecha) DO NOTHING`. `ON CONFLICT … DO UPDATE` requiere `UPDATE` y aquí falla con `permission denied`: modificaría un registro sin auditoría. Si el producto necesita otra semántica, se pide un cambio de este contrato.

## 3. `fn_corregir_asistencia`

```sql
SELECT * FROM fn_corregir_asistencia(
  p_asistencia_id  uuid,
  p_estado         estado_asistencia_enum,  -- PRESENTE, TARDANZA_JUSTIFICADA, TARDANZA_INJUSTIFICADA, FALTA_JUSTIFICADA, FALTA_INJUSTIFICADA
  p_justificada    boolean,
  p_motivo         text,                    -- 10 a 500 caracteres tras recortar espacios
  p_ip             inet,                    -- IP de origen de la petición (obligatoria)
  p_request_id     uuid DEFAULT NULL
);  -- devuelve la fila de asistencias_alumnos ya corregida
```

**Forma de llamada obligatoria: `SELECT * FROM fn_corregir_asistencia(...)`.** La forma `SELECT (fn_corregir_asistencia(...)).*` hace que PostgreSQL ejecute la función una vez por columna del resultado. La segunda ejecución ya no encuentra cambios y falla con `ATTENDANCE_NO_CHANGE`.

- Corre dentro de la transacción de `withTenant()` del consumidor. Actualiza la asistencia y escribe `ATTENDANCE_CORRECTED` (módulo `attendance`) en la cadena de `logs_auditoria` con `fn_registrar_auditoria()`. Si la transacción del consumidor falla después, **ambas cosas se revierten juntas**.
- El evento guarda `payload_anterior` `{matriculaId, fecha, estado, justificada}` y `payload_nuevo` con los mismos campos más `motivo`. El autor es `app.user_id`. El evento aparece en `GET /api/v1/audit/logs` del tenant, junto al historial de notas de M8 (RF-66).
- Es `SECURITY DEFINER` y comprueba el tenant de forma explícita. Una asistencia de otro tenant responde igual que una inexistente.

| Error (`message`) | SQLSTATE | Causa | Respuesta HTTP sugerida |
|---|---|---|---|
| `ATTENDANCE_CONTEXT_REQUIRED` | 42501 | Falta `app.tenant_id` o `app.user_id` | 500 (error de integración) |
| `ATTENDANCE_IP_REQUIRED` | 22004 | `p_ip` nulo | 500 (error de integración) |
| `ATTENDANCE_VALUE_REQUIRED` | 22004 | `p_estado` o `p_justificada` nulos | 400 |
| `ATTENDANCE_REASON_REQUIRED` | 22023 | Motivo ausente o fuera de 10–500 caracteres | 400 |
| `ATTENDANCE_NOT_FOUND` | P0002 | Asistencia inexistente o de otro tenant | 404 |
| `ATTENDANCE_NO_CHANGE` | 22023 | El estado y la justificación ya son los pedidos | 409 |

**Pendiente del consumidor (Squad 2):** exponer el endpoint HTTP de corrección y la justificación formal (RF-22) sobre esta función, con un permiso explícito en `permisos_core` (propuesta: `attendance:correct`), que se agrega con una migración nueva del Core a pedido del Squad 2. También publicar la prueba conjunta de la línea de tiempo de notas y asistencia en `/audit/logs`.

## 4. Aforo de sección (RF-12)

- `trg_matriculas_aforo` (`BEFORE INSERT OR UPDATE OF seccion_id, estado ON matriculas`) rechaza una matrícula activa (`REGULAR` o `EXTEMPORANEA`) cuando la sección ya tiene `grados_secciones.aforo_maximo` matrículas activas. El error es `SECTION_FULL` (SQLSTATE 23514), con el detalle del aforo y la sección. Respuesta HTTP sugerida: 409.
- Retirar o trasladar libera el cupo. Reactivar una matrícula o moverla a otra sección vuelve a comprobar el aforo.
- El disparador bloquea la fila de la sección (`FOR UPDATE`) y así serializa las matrículas concurrentes. La prueba de integración demuestra que, con aforo 1, dos matrículas simultáneas producen exactamente una aceptada, y que sin el bloqueo entrarían ambas.
- Bajar `aforo_maximo` por debajo de la ocupación actual no retira matrículas existentes: impide nuevas hasta que haya cupo.

## 5. Tablas heredadas sin tenant

`asistencias_practicantes`, `calificaciones`, `evaluaciones`, `conclusiones_descriptivas`, `carnes_escolares`, `expedientes_adjuntos`, `expedientes_movimientos`, `metricas_impacto_ssu` y `noticias_galeria` no son accesibles para `sms_app` desde `20261107000100`. El squad dueño (2 para practicantes y carnés, 3 para las tablas de notas heredadas, 4 para métricas, 5 para expedientes y noticias) recupera el acceso con una migración que agregue `tenant_id`, FK compuesta, RLS y los `GRANT` mínimos. La prueba «S6-01» de `database/tests` rechaza cualquier tabla accesible sin RLS que no sea un catálogo global.
