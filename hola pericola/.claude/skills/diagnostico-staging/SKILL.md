---
name: diagnostico-staging
description: Diagnostica el entorno de staging de bi-compusur en Google Cloud (Cloud Run + Cloud SQL) — verifica sesión de gcloud, estado de los servicios, logs de error recientes, si el Job de migración de Django está desincronizado de la imagen desplegada, guía cómo agregar/cambiar variables o secretos en un servicio de Cloud Run sin borrar los que ya existen (`--update-secrets`, nunca `--set-secrets`), advierte que desplegar mientras hay una importación en background en curso la mata (Cloud Run retira la revisión vieja), cuándo activar "CPU siempre asignada" para que esas importaciones no avancen a tirones, y cómo destrabar un registro de sincronización trabado (`en_progreso=true`) reusando el Job de migración con `manage.py shell` en vez de tocar Cloud SQL directo. Se invoca manualmente (/diagnostico-staging) al reportar staging caído o con errores, incluido "no se pudo conectar con el servidor" tras tocar variables de entorno o tras un despliegue a mitad de una importación. Nunca ejecuta acciones que modifiquen infraestructura (correr el job de migración, actualizar imágenes, tocar secretos, desplegar) sin confirmación explícita del usuario en esa sesión.
---

# Diagnóstico de staging — bi-compusur (GCP)

Esta skill existe porque el 2026-08-20 staging falló por un caso concreto y no obvio: el servicio `bi-backend-staging` tenía la imagen nueva desplegada, pero el Job `bi-backend-staging-migrate` seguía apuntando a una imagen **vieja**, por lo que al ejecutarlo manualmente reportaba "No migrations to apply" aunque había 13 migraciones reales pendientes (dos apps nuevas completas: `envios` y `pedidos`). El síntoma engañoso es que el Job sale con `exit(0)` (éxito) incluso cuando no aplicó nada por estar comparando contra el código equivocado.

## Datos fijos del entorno

- Proyecto GCP: `bi-compusur`
- Región: `southamerica-west1`
- Servicios Cloud Run: `bi-backend-staging`, `bi-frontend-staging`
- Cloud SQL: instancia `bi-compusur-sql` (Postgres)
- Job de migración: `bi-backend-staging-migrate` (corre `python manage.py migrate --noinput`)
- Cuenta esperada: `compusur@compusur.pe`

## Glosario — qué hace cada tipo de comando `gcloud run`

Antes de correr cualquier comando de esta skill, saber qué categoría es: **solo lectura** (seguro, sin confirmación) o **modifica estado** (requiere mostrar el comando y esperar confirmación explícita del usuario, ver Paso 5 y Paso 7).

| Comando | Qué hace | Categoría |
| --- | --- | --- |
| `gcloud run services list` | Lista los servicios de Cloud Run del proyecto (nombre, URL, última revisión). | Solo lectura |
| `gcloud run services describe <servicio> --format=...` | Muestra el estado/configuración **actual** de un servicio ya desplegado — condiciones (`Ready`), imagen de contenedor en uso, variables de entorno/secretos conectados. No cambia nada, solo consulta. | Solo lectura |
| `gcloud run jobs describe <job> --format=...` | Igual que `services describe` pero para un **Job** (una tarea de un solo uso, ej. `bi-backend-staging-migrate`) — muestra qué imagen usaría ese Job si se ejecutara ahora. No lo ejecuta. | Solo lectura |
| `gcloud run revisions list --service=<servicio>` | Lista las revisiones (versiones desplegadas) de un servicio, para ver cuál es la activa y cuáles quedaron atrás apagándose. | Solo lectura |
| `gcloud logging read "..."` | Consulta el historial de logs (Cloud Logging) de un servicio, Job o revisión específica en una ventana de tiempo (`--freshness`). | Solo lectura |
| `gcloud run jobs update <job> --image=<imagen>` | **Reconfigura** un Job para que su próxima ejecución use una imagen de contenedor distinta — no lo ejecuta, solo cambia qué código usará la próxima vez que alguien lo corra. | Modifica estado |
| `gcloud run jobs execute <job> --wait` | **Ejecuta el Job ahora mismo** con la imagen que tenga configurada — para el Job de migración, esto corre `python manage.py migrate --noinput` de verdad contra la base de datos de Cloud SQL. `--wait` hace que el comando espere a que termine antes de devolver el control, en vez de disparar y seguir. | Modifica estado (puede alterar la base de datos) |
| `gcloud run services update <servicio> --update-secrets=... / --set-secrets=...` | **Redespliega** el servicio con una nueva revisión que tiene los secretos/variables indicados — `--update-secrets` agrega/actualiza sin tocar el resto, `--set-secrets` reemplaza la lista completa (ver incidente del Paso 7). | Modifica estado (puede tumbar el servicio si se usa mal) |

## ⚠️ Advertencia — nunca desplegar/actualizar el servicio con una importación en background en curso

Incidente real del 2026-08-28: un `gcloud run services update` sobre `bi-backend-staging` — aunque sea solo un cambio de config (ej. activar `--no-cpu-throttling`, ver Paso 8), sin tocar código ni imagen — crea una revisión nueva y mueve el 100% del tráfico a ella de inmediato. Cloud Run entonces **retira** la revisión anterior; confirmado con:

```powershell
gcloud run revisions describe <revision-vieja> --region=southamerica-west1 --format="yaml(status)"
```

que mostró `type: Active, status: 'False', reason: Retired, message: 'Revision retired.'` justo en el minuto del despliegue. Cualquier `threading.Thread` en background que viviera en esa revisión (las importaciones de CSV/Excel de "Órdenes OCAM", "Fichas técnicas", "Precio Referencial Estado" — ver `docs/arquitectura/contexto-proyecto.md`) muere ahí mismo, a mitad de camino: no termina limpio, no revisa un pedido de cancelación pendiente, y deja el registro de progreso pegado en base de datos (ver Paso 9).

**Antes de correr cualquier comando "Modifica estado" del Glosario de arriba sobre `bi-backend-staging`** (`services update`, un redeploy, etc.), revisar si hay algo en curso — pedirle al usuario que confirme en pantalla si algún "Sincronizar"/"Cargar Excel"/"Subir CSV manual" muestra la barra de progreso activa, o verificar por API con el mismo truco del Paso 9 (`E.objects.filter(en_progreso=True)`). Si hay algo corriendo, esperar a que termine o cancelarlo desde la UI antes de aprobar el despliegue.

## Paso 0 — Asegurar que `gcloud` esté accesible en esta sesión

El instalador de Google Cloud SDK agrega su bin al PATH del sistema, pero una sesión de PowerShell ya abierta (incluida la que usa esta herramienta) no lo recoge hasta reiniciarse. Antes de cualquier comando `gcloud`, probar:

```powershell
gcloud config list
```

Si da `CommandNotFoundException`, agregar el bin a la sesión actual (ruta por defecto del instalador en Windows) y reintentar:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin;" + $env:PATH
gcloud config list
```

## Paso 1 — Confirmar sesión y proyecto activo

```powershell
gcloud auth list
gcloud config get-value project
```

- Si no hay cuenta activa o el token expiró ("Reauthentication failed"), **no se puede hacer login interactivo por esta vía** — pedir al usuario que lo corra él mismo en su propia terminal: `gcloud auth login`. Esperar confirmación de que terminó antes de continuar.
- Si el proyecto activo no es `bi-compusur`, corregirlo con `gcloud config set project bi-compusur` (esto es solo config local, no requiere confirmación).

## Paso 2 — Estado de los servicios

Ejecutar sin pedir confirmación (son operaciones de solo lectura):

```powershell
gcloud run services list --platform=managed
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="yaml(status.conditions)"
gcloud run services describe bi-frontend-staging --region=southamerica-west1 --format="yaml(status.conditions)"
```

Confirmar que ambos servicios tengan `type: Ready` con `status: 'True'`.

## Paso 3 — Logs de error recientes

```powershell
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=bi-backend-staging AND severity>=ERROR" --freshness=2h --limit=50 --format="table(timestamp,severity,textPayload)"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=bi-frontend-staging AND severity>=ERROR" --freshness=2h --limit=50 --format="table(timestamp,severity,textPayload)"
```

Si el usuario reportó el fallo hace más de 2 horas, ampliar `--freshness` en consecuencia (ej. `24h`).

Si aparece `django.db.utils.ProgrammingError: column ... does not exist` o `relation ... does not exist` → ir al Paso 4 (migración pendiente).

## Paso 4 — Detectar migración de Django desincronizada

Este es el chequeo que no es obvio y que resolvió el incidente del 2026-08-20: comparar la imagen del Job de migración contra la imagen real del servicio, **antes** de confiar en lo que reporte el Job.

```powershell
gcloud run jobs describe bi-backend-staging-migrate --region=southamerica-west1 --format="value(spec.template.spec.template.spec.containers[0].image)"
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="value(spec.template.spec.containers[0].image)"
```

- Si las dos imágenes (tag/digest) **no coinciden**, el Job de migración está desactualizado — pasar al Paso 5.
- Si coinciden y aun así hay errores de columna/tabla faltante, el problema no es de sincronización de imagen; investigar si la migración fue reescrita/squasheada o si falta commitear el archivo de migración generado localmente.

## Paso 5 — Sincronizar y ejecutar el Job de migración (requiere confirmación)

Estas acciones modifican infraestructura y potencialmente la base de datos de staging — **presentar el comando exacto al usuario y esperar su confirmación explícita antes de correrlo**, incluso si el usuario ya pidió "diagnosticar y arreglar" en general. No asumir autorización previa.

```powershell
gcloud run jobs update bi-backend-staging-migrate --image="<imagen-del-servicio-del-paso-4>" --region=southamerica-west1
gcloud run jobs execute bi-backend-staging-migrate --region=southamerica-west1 --wait
```

Después de ejecutar, verificar el resultado real (no solo el ✅ del job, que puede ser exit(0) sin haber aplicado nada útil):

```powershell
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=bi-backend-staging-migrate" --freshness=10m --limit=50 --format="table(timestamp,severity,textPayload)"
```

Buscar líneas `Applying <app>.<migración>... OK`. Si en cambio aparece un traceback o `IntegrityError`, la migración falló pese al exit code — reportarlo al usuario sin intentar corregirlo automáticamente.

## Paso 6 — Cerrar el diagnóstico

Repetir el Paso 3 (logs de error) para confirmar que el error original ya no aparece, y resumir en español simple:
- Qué se encontró (causa raíz).
- Qué se ejecutó para solucionarlo (o qué falta que el usuario confirme).
- Estado final de ambos servicios.

## Paso 7 — Agregar/cambiar variables o secretos en un servicio de Cloud Run (requiere confirmación)

**`--set-secrets` reemplaza la lista COMPLETA de secretos del servicio, no la agrega.** Incidente real del 2026-08-21: al agregar `ANTHROPIC_API_KEY` a `bi-backend-staging` con `gcloud run services update ... --set-secrets=ANTHROPIC_API_KEY=...`, se borraron silenciosamente los otros 4 secretos que ya estaban conectados (`SECRET_KEY`, `DB_PASSWORD`, `EMAIL_HOST_PASSWORD`, `DECOLECTA_API_TOKEN`) — el contenedor entró en crash loop (`decouple.UndefinedValueError: SECRET_KEY not found`) y el frontend mostró "No se pudo conectar con el servidor" para **toda** la aplicación, no solo para la pantalla que se estaba probando.

Usar siempre **`--update-secrets`** (agrega/actualiza sin tocar el resto) al conectar un secreto a un servicio que ya tiene otros configurados:

```powershell
gcloud run services update bi-backend-staging --region=southamerica-west1 --update-secrets="NUEVA_VAR=nombre-del-secreto:latest"
```

Antes de tocar `--set-secrets`/`--update-secrets` en cualquier servicio, listar primero los secretos/variables actuales para saber qué hay que preservar:

```powershell
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="yaml(spec.template.spec.containers[0].env)"
```

Después de cualquier cambio, verificar la **revisión nueva específicamente** (no basta con mirar logs generales del servicio: la revisión vieja puede seguir logueando errores mientras termina de apagarse, dando una falsa alarma):

```powershell
gcloud run revisions list --service=bi-backend-staging --region=southamerica-west1 --limit=3 --format="table(metadata.name,status.conditions[0].status,status.conditions[0].type)"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=bi-backend-staging AND resource.labels.revision_name=<revision-nueva> AND severity>=ERROR" --freshness=5m --limit=20
```

Si algo salió mal (secretos perdidos), es recuperable sin drama: los secretos en sí siguen intactos en Secret Manager, solo hay que volver a conectarlos con `--update-secrets` — no hace falta recrearlos ni se pierde ningún valor.

Nota de PowerShell: en `--update-secrets`/`--set-secrets` con varios pares separados por coma, **siempre envolver el valor completo entre comillas dobles** (`--update-secrets="A=b:latest,C=d:latest"`) — sin comillas, PowerShell trata la lista como un array y la reconstruye uniendo con espacios en vez de comas, rompiendo el flag silenciosamente (mismo problema que con `--args` de Cloud Run Jobs, ver más abajo).

## Paso 8 — Activar "CPU siempre asignada" para que una importación en background no avance a tirones (requiere confirmación)

Las importaciones que corren en un `threading.Thread` en background (Órdenes OCAM, Fichas técnicas, Precio Referencial Estado — ver `docs/arquitectura/contexto-proyecto.md`) no están atadas a ninguna petición HTTP activa. Por defecto Cloud Run solo asigna CPU al contenedor **mientras atiende una petición** (`cpu-throttling` = true, el default); entre peticiones el hilo se congela. En la práctica esto se nota porque `progreso_actual` (`GET /api/sincronizacion-ceam/?categoria=...`) solo avanza en ráfagas que coinciden con el polling del frontend (cada 4s) en vez de avanzar continuo — confirmado en vivo el 2026-08-28 sobre una importación real de Órdenes OCAM (avanzaba ~5.9 filas/s en ráfagas, nunca de forma pareja).

Activar (afecta a **todo** el servicio mientras esté prendido, no solo a la importación puntual — se factura CPU de forma continua en vez de solo durante peticiones, así que el costo sube un poco mientras dure; es reversible al instante):

```powershell
gcloud run services update bi-backend-staging --region=southamerica-west1 --no-cpu-throttling
```

Volver al comportamiento por defecto cuando ya no haga falta:

```powershell
gcloud run services update bi-backend-staging --region=southamerica-west1 --cpu-throttling
```

**Cada uno de estos dos comandos ES un despliegue** (crea una revisión nueva y mueve el tráfico) — aplica la Advertencia de arriba sin excepción: nunca correrlos con una importación en background ya en curso, la matarían a mitad de camino.

## Paso 9 — Recuperar un registro de sincronización trabado (`en_progreso=true`) sin conectarse a Cloud SQL directamente (requiere confirmación)

Si una importación en background muere a mitad de camino (por la Advertencia de arriba, por un contenedor reiniciado, etc.), la fila `EstadoSincronizacionFuente` correspondiente queda con `en_progreso=true` para siempre desde el punto de vista del usuario — el auto-sanado (`hay_sincronizacion_en_curso`, `BACKEND/importacion/sincronizacion_ceam.py`) solo la trata como abandonada después de `MARGEN_SINCRONIZACION_ATASCADA` (**3 horas**, generoso a propósito porque Fichas técnicas puede tardar ~1h legítimamente), así que el botón "Cancelar"/"Sincronizar" del frontend queda bloqueado hasta entonces.

En vez de conectarse a Cloud SQL y correr un `UPDATE` a mano (fuera de las reglas de esta skill, ver "Qué NO hacer"), reusar el Job `bi-backend-staging-migrate` — ya tiene la conexión correcta a la base — para una corrida puntual de `manage.py shell` en vez de `migrate`. Esto pasa por el ORM de Django, el mismo camino que habría usado el propio código si el hilo hubiera terminado normal, y no requiere extraer ninguna credencial de base de datos:

```powershell
$script = "from importacion.models import EstadoSincronizacionFuente as E; qs = E.objects.filter(categoria_negocio='<CATEGORIA>').filter(fuente='<FUENTE>'); qs.update(en_progreso=False); qs.update(cancelacion_solicitada=False); qs.update(en_progreso_desde=None); qs.update(en_error=True); qs.update(detalle_error='<motivo, sin comas>'); print('FILAS_ACTUALIZADAS ' + str(qs.count()))"
gcloud run jobs execute bi-backend-staging-migrate --region=southamerica-west1 --args="manage.py,shell,-c,$script" --wait
```

**Gotcha verificado en vivo (2026-08-28):** `--args=[ARG,...]` de `gcloud run jobs execute` separa por comas — igual que `--update-secrets` (ver nota de PowerShell más arriba), pero acá la trampa es más fácil de pisar sin darse cuenta: **cualquier coma dentro del propio script Python rompe el parseo**, no solo comas "de lista". Un simple `print('X', qs.count())` (la coma entre los dos argumentos de `print`) hizo fallar la ejecución con `manage.py shell: error: unrecognized arguments: ...` — un error de argparse que no menciona nada de comas y confunde. Para evitarlo: nunca usar `print(a, b)` (usar `print(a + ' ' + str(b))`), y encadenar `.filter(x=1).filter(y=2)` / varios `.update(campo=valor)` de a un kwarg por vez en vez de agrupar varios separados por coma en una sola llamada.

Después de ejecutar, verificar el resultado real en logs (buscar el `print()` de confirmación, no solo el exit code):

```powershell
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=bi-backend-staging-migrate" --freshness=5m --limit=20 --format="table(timestamp,severity,textPayload)"
```

Y confirmar en el frontend que el botón ya no muestra "Cancelando..." ni está bloqueado (o pedirle al usuario que lo confirme).

## Qué NO hacer sin permiso explícito

- No ejecutar `gcloud run jobs execute` ni `gcloud run jobs update` sin mostrar antes el comando y esperar confirmación.
- No ejecutar `gcloud run services update --set-secrets` ni `--update-secrets` sin mostrar antes el comando y esperar confirmación — y nunca usar `--set-secrets` en un servicio que ya tiene otros secretos configurados (ver Paso 7).
- No ejecutar **ningún** `gcloud run services update` sobre `bi-backend-staging` (incluido `--no-cpu-throttling`/`--cpu-throttling` del Paso 8) sin revisar antes si hay una importación en background en curso (ver la Advertencia de arriba) — cada uno de estos comandos es un despliegue y mata cualquier hilo que esté corriendo.
- No conectarse a Cloud SQL para modificar datos (`UPDATE`/`DELETE`/`DROP`) — solo lectura de verificación (`SELECT` sobre `django_migrations`, `\d tabla`). El Paso 9 (`manage.py shell` vía el Job de migración) es la única vía sancionada para corregir un registro de estado trabado, y solo con confirmación explícita — nunca un `UPDATE`/`DELETE` SQL crudo, ni siquiera para esto.
- No hacer `gcloud auth login` por el usuario — es interactivo y debe correrlo él en su propia terminal.
- No usar `--force`, `gcloud sql instances delete`, ni ninguna operación destructiva sobre Cloud SQL o Cloud Run bajo ninguna circunstancia dentro de esta skill.
