---
name: update-main-staging
description: Lleva el trabajo local de bi-compusur hasta staging de punta a punta — valida en local (tests, migraciones, TypeScript), propone y crea los commits siguiendo COMMIT_CONVENTION, sube a `dev`, promueve a `main` (que es lo que dispara el build de Cloud Build), sigue la ejecución del build, verifica que las imágenes desplegadas en Cloud Run correspondan al commit, migra y alinea a la misma imagen TODO lo que el build no toca (Jobs de Compusur, base compartida `bi_mercado` y sus Jobs, Dysecom y cualquier otra empresa), y confirma que staging quedó sano. Se invoca manualmente (/update-main-staging) cuando el usuario quiere publicar lo que hizo. Pide confirmación explícita antes de CADA acción que salga de la máquina local, que consuma facturación de GCP o que pueda degradar el rendimiento del sistema — nunca encadena esos pasos sola.
---

# Publicar a staging — bi-compusur

Esta skill automatiza el camino `local → dev → main → staging`, pero **no es un botón de "deploy"**: cada paso que sale de la máquina local se presenta al usuario y espera su confirmación. El objetivo es que nada llegue a staging sin haber pasado por las validaciones locales, y que ninguna acción con costo o riesgo se ejecute sin que el usuario la haya visto escrita.

Para **diagnosticar** staging cuando ya está roto, esta skill no es la indicada: usar `/diagnostico-staging`, que cubre los síntomas conocidos (imagen del Job de migración desincronizada, secretos borrados por `--set-secrets`). Esta skill se apoya en esos mismos comandos, no los duplica.

## Datos fijos del entorno

Los mismos que documenta `/diagnostico-staging`:

- Proyecto GCP: `bi-compusur` · Región: `southamerica-west1` · Cuenta: `compusur@compusur.pe`
- Servicios: `bi-backend-staging`, `bi-frontend-staging`
- Job de migración: `bi-backend-staging-migrate`
- Cloud SQL: `bi-compusur-sql`, base `bi_composur_staging`

**El trigger de Cloud Build dispara con push a `main`, no a `dev`.** Subir a `dev` no despliega nada. Ver `cloudbuild.staging.yaml` y la sección 2.1 de `docs/instalacion/despliegue-google-cloud.md`.

### El build solo despliega los dos servicios de Compusur

Staging es multiempresa: varias bases, cada una con sus servicios y Jobs, **todos sobre la misma imagen** `bi-backend-staging:<SHA>` / `bi-frontend-staging:<SHA>`. El trigger actualiza únicamente `bi-backend-staging` y `bi-frontend-staging`; **todo lo demás queda en la imagen anterior** hasta que alguien lo actualice a mano (Paso 7). Requisito del usuario (2026-10-20): Compusur y Dysecom corren SIEMPRE el mismo código — el módulo de Gestión de Empresas administra a las dos por igual.

Cada recurso tiene la etiqueta `organizacion`, que dice a qué base pertenece. Inventario al 2026-10-20 (no confiar en esta tabla: el Paso 7 la vuelve a leer):

| `organizacion` | Base | Servicios | Jobs | ¿Se alinea en cada despliegue? |
| --- | --- | --- | --- | --- |
| `compusur` | `bi_composur_staging` | `bi-backend-staging`, `bi-frontend-staging` (los despliega el build) | `bi-backend-staging-migrate`, `bi-ocam-sincronizacion-staging`, `bi-ocam-alertas-staging` | Sí |
| `mercado` | `bi_mercado` (datos públicos compartidos) | — | `bi-mercado-migrate`, `bi-mercado-ocam-diario`, `bi-mercado-ocam-estados`, `bi-mercado-ceam-mensual`, `bi-mercado-comunicados` | Sí. **Excepción:** `bi-mercado-carga-inicial` fue de una sola vez; no se toca. `bi-mercado-ceam-mensual` debe tener `ALCANCE_CATALOGO_TODAS_LAS_MARCAS=True` (desde 2026-10-29): al alinearlo, comprobar que siga ahí. |
| `dysecom` | `bi_dysecom` | `bi-backend-dysecom`, `bi-frontend-dysecom` | `bi-backend-dysecom-migrate`, `bi-copiar-datos-publicos-dysecom` | Sí |
| `plataforma` | plano de control | `bi-plataforma` | `bi-plataforma-migrate` | **No**, salvo que el usuario lo pida en esa sesión (lo maneja un compañero). |
| `erp-administrator` | `bi_erp_administrator` | `bi-erp-administrator` | `bi-erp-administrator-migrate` | **No**, salvo que el usuario lo pida en esa sesión. Es del compañero y va aparte, como `plataforma` (decisión del usuario, 2026-10-20). |
| `compusur` | — | `bi-jsreport-staging` | — | No: imagen propia, no sale de este build. |

Una `organizacion` que no esté en esta tabla (una empresa nueva dada de alta por Gestión de Empresas) se reporta al usuario y se pregunta. Si es una empresa, se alinea igual que Dysecom.

## Qué exige confirmación explícita

Ejecutar **sin preguntar** solo lo de lectura: `git status`/`diff`/`log`, tests, `manage.py check`, `makemigrations --check`, `tsc --noEmit`, `gcloud ... list`/`describe`, `gcloud logging read`, `gcloud builds list`.

Todo lo demás se presenta escrito y se espera el "sí" del usuario **en esta sesión**, aunque haya pedido "hacé todo" al invocar la skill. Aprobar un paso no aprueba el siguiente.

| Acción | Por qué |
| --- | --- |
| `git commit` | Escribe historia del repo. |
| `git push origin dev` | Sale de la máquina local. |
| Merge/PR `dev` → `main` | **Dispara el build de Cloud Build: consume minutos de build, almacenamiento en Artifact Registry y crea revisiones nuevas de Cloud Run. Es el paso que cuesta plata.** |
| `gcloud builds submit` / re-lanzar un build | Mismo costo que el anterior, sin pasar por git. |
| `gcloud run jobs update` / `execute` (migración) | Modifica el esquema y los datos de `bi_composur_staging`. |
| `gcloud run jobs execute` de `sincronizar_ordenes_ocam*` | Corrida larga: consume CPU facturada y golpea el endpoint de Perú Compras miles de veces. |
| `gcloud run services update` | Crea una revisión nueva; una variable mal puesta tira el servicio entero. |
| Cambiar `--min-instances`, `--cpu`, `--memory`, `--concurrency` | Impacto directo en la factura mensual. |
| Cualquier `--set-secrets` o `--set-env-vars` sobre un servicio existente | **Reemplazan la lista completa** y borran en silencio lo que no se repita. Usar siempre `--update-secrets` / `--update-env-vars` (ver el incidente del 2026-08-21 en `/diagnostico-staging`). |
| `gcloud run services update-traffic` (rollback) | Cambia qué revisión sirve. Es la salida de emergencia del Paso 6, pero sigue siendo una decisión del usuario. |
| Programar o cerrar el aviso de mantenimiento (Paso 4 y Paso 7) | Muestra un mensaje a **todos** los usuarios de staging, incluso en el login. Avisa a personas reales, así que se confirma como cualquier otra acción que sale de la máquina. |
| `git push --force`, borrar revisiones, imágenes o secretos | Irreversible. |

Si el usuario dice que no a un paso, **detenerse ahí y reportar en qué estado quedó todo** — no seguir con los siguientes ni buscar una vía alternativa.

## Paso 0 — `gcloud` accesible

Igual que en `/diagnostico-staging`: probar `gcloud config list`. Si da `CommandNotFoundException`, agregar el bin a la sesión actual y reintentar:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin;" + $env:PATH
```

Si el token expiró, **no** intentar login por esta vía: pedirle al usuario que corra `gcloud auth login` en su terminal.

## Paso 1 — Validación local (sin confirmación, todo de lectura)

No proponer ningún commit hasta que estos cuatro pasen. Si alguno falla, arreglarlo o reportarlo — **nunca subir algo que ya se sabe roto**.

```powershell
cd BACKEND
python manage.py makemigrations --check --dry-run
python manage.py check
cd ../frontend
npx tsc --noEmit -p tsconfig.json
```

Y los tests del backend, eligiendo qué correr como se explica abajo.

- `makemigrations --check` en rojo significa que hay un cambio de modelo sin migración generada. Es la causa clásica de que staging arranque y reviente con `column ... does not exist`.
- Si algún test ya fallaba **antes** de los cambios de esta sesión, verificarlo (`git stash -u`, correr, `git stash pop`) y decirlo explícitamente en vez de contarlo como regresión propia.

### Qué tests correr

La suite completa tarda 30-45 min (5.765 tests, medido 2026-10-24). No se corre siempre: se eligen las apps según lo que llegaría a `main`.

1. **Suite completa** si el diff toca una pieza que usan todas las apps: `backend/` (`settings.py`, `urls.py`), `comun/`, `usuarios/` (permisos y sesión), `requirements*.txt` o el `Dockerfile` del backend. También si el usuario la pide.
2. Si no, **las apps con archivos cambiados más las que las importan** (procesos adyacentes: una app que hace `from bi_app...` se rompe si `bi_app` cambia).

Ojo: `bi_app` la importan casi todas las apps, así que un cambio ahí elige casi la suite entera. El ahorro real está en los cambios de apps que pocas otras usan (`rrhh`, `pendientes`, `reclutamiento`…).

```powershell
cd D:\SOFTWARE-COMPUSUR\bi-compusur
git fetch -q origin
# Lo que llegaría a main: commits por delante + cambios sin commitear + archivos nuevos.
$cambios = @(git diff --name-only origin/main) + @(git ls-files --others --exclude-standard) | Sort-Object -Unique
$compartidas = '^BACKEND/(backend/|comun/|usuarios/|requirements[^/]*\.txt$|Dockerfile$)'
$tocaCompartidas = @($cambios | Where-Object { $_ -match $compartidas })
$apps = Get-ChildItem BACKEND -Directory | Where-Object { Test-Path "$($_.FullName)\apps.py" } | ForEach-Object Name
$cambiadas = @($cambios | ForEach-Object { if ($_ -match '^BACKEND/([^/]+)/') { $Matches[1] } } |
  Where-Object { $_ -in $apps } | Sort-Object -Unique)
$dependientes = foreach ($app in $cambiadas) {
  Get-ChildItem BACKEND -Recurse -Filter *.py |
    Select-String -Pattern "^\s*(from|import)\s+$app(\.|\s|$)" -List |
    ForEach-Object { ($_.Path -replace '^.*\\BACKEND\\', '').Split('\')[0] }
}
$elegidas = @($cambiadas + $dependientes | Where-Object { $_ -in $apps } | Sort-Object -Unique)
"Compartidas tocadas: $($tocaCompartidas -join ', ')"
"Apps a probar:       $($elegidas -join ' ')"
```

Decirle al usuario cuál de los dos casos aplica, y por qué, antes de correr. Probado contra el despliegue del 2026-10-24: tocaba `settings.py`, `urls.py` y `usuarios/` → suite completa.

**Siempre con la salida completa en un archivo** y en segundo plano. Nunca recortar con `Select-Object -Last N`: el 2026-10-24 eso dejó solo el resumen ("FAILED (failures=10, errors=2)") sin los nombres de los tests, y hubo que repetir 45 minutos de corrida. `--keepdb` reutiliza la base de prueba entre corridas en vez de crearla cada vez:

```powershell
cd BACKEND
$salida = "<scratchpad>\tests_<fecha>.txt"
python manage.py test <apps elegidas> --noinput --keepdb *> $salida     # suite completa: sin apps
Select-String -Path $salida -Pattern '^(FAIL|ERROR):|^Ran |^OK|^FAILED'
```

- Escribir los nombres de las apps a mano en el comando, no `$elegidas`: las variables de PowerShell no pasan de una llamada a otra, y con la variable vacía Django corre la suite completa sin avisar.
- Con `--keepdb`, si la base de prueba quedó inconsistente (por ejemplo, se editó una migración que ya existía en vez de agregar una nueva), correr una vez sin `--keepdb`.
- **Si la corrida anterior se cortó a mitad** (falta de memoria, Ctrl+C), la siguiente va **sin `--keepdb`**: la base de prueba queda sin los datos que cargan las migraciones. El 2026-10-24 eso dio 303 fallas falsas (`TipoComponente.DoesNotExist`, `AcuerdoMarco.DoesNotExist`, `KeyError: 'DELTRON'`, «comun.Departamento está vacío»); con base nueva, la misma suite dio `OK`.
- La suite completa necesita memoria libre: Claude Code mata el proceso en segundo plano si la máquina se queda sin RAM (pasó dos veces el 2026-10-24 con ~1 GB libre). Antes de lanzarla, pedir que se cierre el navegador o el IDE si hay poca memoria, o correrla por tandas de apps.
- **No usar `--parallel` en Windows** mientras `tblib` no esté instalado: en la primera falla el proceso se cae con `TypeError: cannot pickle 'traceback' object` y no reporta nada (2026-10-24).
- Un test que falla en local por el `.env` de quien lo corre no es una regresión del código, pero hay que confirmarlo (correr ese módulo con la variable vacía) antes de descartarlo. Ejemplo del 2026-10-24: con `MERCADO_PRECIOS_DB_NAME` configurada fallaban 12 tests del Cotizador; se corrigieron los tests para no depender del `.env`.

### Lo que estas cuatro validaciones NO cubren

Pasarlas no significa que la imagen funcione. Nada de lo de arriba ejecuta el contenedor: los tests y `runserver` importan `backend.settings` directo, nunca pasan por el `CMD` del Dockerfile. Antes de promover, revisar si el diff toca alguno de estos y **decírselo al usuario como riesgo explícito**:

```powershell
git diff origin/main..origin/dev -- BACKEND/Dockerfile frontend/Dockerfile BACKEND/requirements.txt frontend/package.json
```

- **`CMD` / `ENTRYPOINT` / `ENV` del Dockerfile** — es código que solo corre en la imagen. Un wrapper nuevo alrededor de gunicorn puede romper todas las requests sin que falle un solo test.
- **Dependencias nuevas** que se auto-activan al arrancar el proceso (instrumentación, APM, profilers): no se ven en `manage.py test`.
- **Variables que el código espera** y que el servicio todavía no tiene.

Incidente real (2026-08-28): se promovió un `CMD` que pasó de `gunicorn ...` a `opentelemetry-instrument gunicorn ...`. Los 506 tests, `makemigrations --check`, `manage.py check` y `tsc` pasaron los cuatro. En staging, **todas** las requests devolvieron 500 con `AttributeError: module 'django.conf.global_settings' has no attribute 'ROOT_URLCONF'`: el instrumentador toca `django.conf.settings` antes de que `wsgi.py` haga su `setdefault` de `DJANGO_SETTINGS_MODULE`. Se resolvió agregando `ENV DJANGO_SETTINGS_MODULE=backend.settings` al Dockerfile.

Si el diff toca el Dockerfile, la única validación local real es construir y correr la imagen:

```powershell
docker build -t bi-backend-local BACKEND
docker run --rm -p 8080:8080 -e SECRET_KEY=x -e DB_NAME=x -e DB_USER=x -e DB_PASSWORD=x -e DB_HOST=localhost -e DB_PORT=5432 bi-backend-local
curl -o /dev/null -w "%{http_code}" http://localhost:8080/api/
```

Un 500 acá es el mismo 500 que va a dar staging. Sin base de datos alcanza: el fallo de arranque/settings aparece igual.

## Paso 2 — Leer el working tree y proponer los commits

Leer `docs/desarrollo/COMMIT_CONVENTION.md` antes de redactar nada — el tipo, el módulo y las reglas vigentes salen de ahí, no de memoria.

```powershell
git status --short
git diff --stat
```

Reglas al armar la propuesta:

- **Un commit, una intención.** Si el working tree mezcla trabajos distintos (típico: una tanda de observabilidad + una de negocio), proponer varios commits y decir qué archivo va en cuál. Nunca un `git add -A` de todo junto.
- **Separar lo que no es de esta sesión.** Puede haber cambios previos del usuario en el árbol; señalarlos y preguntar si entran o quedan afuera.
- **Nunca commitear archivos de datos ni credenciales.** Revisar en particular `docs/archivos historicos/` (CSV/XLSX de trabajo, pueden pesar megas), `.env`, `media/`, `*.sqlite3`. Si aparecen en `git status`, listarlos aparte y proponer excluirlos o agregarlos a `.gitignore`.
- Después de un `git add`, correr `git status` de nuevo y **mirar la lista real** antes de commitear.

Presentar la propuesta completa (qué commits, con qué mensaje y qué archivos) y esperar aprobación.

## Paso 3 — Commit y push a `dev` (requiere confirmación)

```powershell
git checkout dev
git add <archivos del commit 1>
git commit -m "tipo(modulo): descripcion"
git push origin dev
```

`dev` es la rama de trabajo; este push **no despliega nada**. Es el punto de corte seguro: si el usuario quiere parar acá, es un final válido.

## Paso 4 — Promover a `main` (requiere confirmación — este paso cuesta)

Antes de proponerlo, decir en voz alta que **este es el paso que dispara el build facturado**, y confirmar que `dev` esté al día:

```powershell
git fetch origin
git log --oneline origin/main..origin/dev
```

Si no hay commits por delante, no hay nada que promover — decirlo y terminar.

### Avisar a los usuarios ANTES de promover (requiere confirmación)

Mientras corre el build el backend viejo sigue sirviendo y, al cambiar de revisión, quien estaba trabajando pierde lo que no guardó. El sistema tiene un **aviso de mantenimiento** (Configuración → Mantenimiento) que muestra un banner arriba de todo, también en el login: primero "entrará en mantenimiento a las HH:mm (en N min)" con cuenta regresiva y, llegada la hora, "el sistema está en mantenimiento". **No bloquea el acceso**: pide guardar el trabajo y evitar registrar operaciones. El estado vive en la base de datos (`comun.Mantenimiento`), así que sobrevive al cambio de revisión; el aviso nunca se guarda en variables de entorno (cambiarlas crearía otra revisión).

Proponer, y ejecutar solo con el "sí" del usuario, programarlo con ~10 minutos de anticipación (alcanza para que lo vean y para que arranque el build):

```powershell
# El token que usa el Cloud Scheduler está en Secret Manager. El nombre del secreto no está
# en el repo: leerlo de la variable SCHEDULER_TASK_TOKEN del servicio (secretKeyRef.name).
# En staging, al 2026-10-13, es `scheduler-task-token-staging`.
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format=json | ConvertFrom-Json | ForEach-Object { $_.spec.template.spec.containers[0].env } | Where-Object { $_.name -eq 'SCHEDULER_TASK_TOKEN' }

# `-join ""` ANTES del Trim: el secreto trae un salto de línea final y PowerShell devuelve
# la salida de gcloud como array de 2 líneas. `(...).Trim()` recorta cada línea pero sigue
# siendo array, y el header viaja mal → 401 "Las credenciales de autenticación no se
# proveyeron" (pasado real, 2026-10-13). Un 401 acá es token mal leído, no endpoint caído.
$token = ((gcloud secrets versions access latest --secret=<secreto>) -join "").Trim()   # nunca imprimirlo
$backend = 'https://bi-backend-staging-535667828861.southamerica-west1.run.app'
$cuerpo = @{ accion = 'programar'; minutos = 10; fin_estimado_minutos = 30; detalle = (git rev-parse --short origin/dev) } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$backend/api/tareas-programadas/mantenimiento/" -Headers @{ 'X-Scheduler-Token' = $token } -ContentType 'application/json' -Body $cuerpo
```

- Es **idempotente**: si ya hay un mantenimiento vigente (programado a mano desde Configuración) lo devuelve tal cual, no crea otro. Reintentar es seguro.
- **Desde 2026-10-16 el trigger de Cloud Build también avisa solo** (2 min antes, `detalle: "build <sha>"`) y cierra **solo su propio aviso** al terminar el despliegue (ver §6.3 de `despliegue-google-cloud.md`). Si la skill programó el suyo antes, el trigger reutiliza ese y no lo cierra: el cierre sigue siendo el Paso 7 de esta skill, después de la migración. Programar desde la skill sigue valiendo la pena porque da 10 min de anticipación en vez de 2.
- **Primer despliegue de esta funcionalidad:** el endpoint todavía no existe en staging (responde 404). Es lo esperado: omitir el aviso, decirlo, y usarlo desde el siguiente despliegue.
- Si el usuario no quiere avisar (cambio chico, fuera de horario), omitirlo sin insistir.
- **Cada empresa tiene su propio aviso**, porque vive en su base. El de Compusur no lo ven los usuarios de Dysecom. Para avisar también en Dysecom, repetir lo mismo con su backend (`bi-backend-dysecom`, URL desde `gcloud run services describe bi-backend-dysecom --region=southamerica-west1 --format="value(status.url)"`) y el secreto de su `SCHEDULER_TASK_TOKEN` (al 2026-10-20, `dysecom-scheduler-token`). Preguntar al usuario si quiere avisar en las dos o solo en Compusur. El trigger de Cloud Build solo avisa en Compusur.
- **En Compusur usar siempre la URL fija `https://bi-backend-staging-535667828861…`, nunca la que devuelve `describe` (`status.url`, formato `…-bw55zzpnwq-tl.a.run.app`).** Esa no está en su `ALLOWED_HOSTS`, y Django responde `Bad Request (400)` sin llegar al endpoint (pasado real, 2026-10-21). En Dysecom funcionan las dos.
- Si después el usuario decide **no promover**, cancelar el aviso (`accion = 'cancelar'`) en vez de dejarlo anunciando algo que no va a pasar. Si el flujo se aborta por otra razón, recordarlo en el cierre del Paso 8; mientras tanto el aviso se autocierra 30 minutos después del fin estimado.

Vía preferida (deja rastro y respeta `GIT_WORKFLOW.md`):

```powershell
gh pr create --base main --head dev --title "..." --body "..."
gh pr merge --merge
```

Si el usuario prefiere merge directo, pedir confirmación aparte para eso. **Nunca `--force`.**

## Paso 5 — Seguir el build (sin confirmación, es lectura)

**`gcloud builds list` sin `--region` consulta `global` y devuelve vacío** — los builds de este proyecto viven en `southamerica-west1`. Sin la bandera parece que el merge no disparó nada (pasado real, 2026-08-28):

```powershell
gcloud builds list --region=southamerica-west1 --limit=5 --format="table(id.slice(0,8),status,substitutions.SHORT_SHA,substitutions._SERVICE_NAME,createTime.date('%H:%M:%S'))"
gcloud builds describe <BUILD_ID> --region=southamerica-west1 --format="value(status,statusDetail)"
```

Los triggers reales **no son** `cloudbuild.staging.yaml` del repo: son dos triggers de Cloud Run source-deploy (`cloudrun-bi-backend-staging-...` y `cloudrun-bi-frontend-staging-...`), uno por servicio, que publican en el repo `cloud-run-source-deploy` de Artifact Registry. Un push a `main` dispara **dos builds independientes**: uno puede fallar y el otro no.

Si un build falla, **no re-lanzarlo automáticamente**: leer `statusDetail`, reportar la causa y esperar instrucciones. Un re-run a ciegas vuelve a cobrar por el mismo error. Excepción a señalar al usuario: `Couldn't read commit <sha>` es una carrera transitoria del enlace de Developer Connect (el commit sí existe), y ahí un reintento suele bastar:

```powershell
gcloud builds triggers run <NOMBRE_TRIGGER> --region=southamerica-west1 --branch=main
```

## Paso 6 — Verificar que las imágenes desplegadas sean las del commit

Este es el chequeo que evita el falso "ya está desplegado". Comparar el commit promovido contra el tag de la imagen que corre en cada servicio.

**El tag es el SHA COMPLETO (40 caracteres), no el corto** — comparar contra `--short` da siempre "no coincide" y manda a investigar un problema que no existe (pasado real, 2026-08-28):

```powershell
git rev-parse origin/main    # completo, NO --short
gcloud run services describe bi-backend-staging  --region=southamerica-west1 --format="value(spec.template.spec.containers[0].image)"
gcloud run services describe bi-frontend-staging --region=southamerica-west1 --format="value(spec.template.spec.containers[0].image)"
```

- Si el tag **no** coincide con el SHA del commit, el deploy no llegó: revisar el build del Paso 5 antes de tocar nada. Cada servicio tiene su **propio trigger y su propio build**, así que uno puede quedar desplegado y el otro no.
- Confirmar que ambos servicios estén `Ready`:

```powershell
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="yaml(status.conditions)"
```

### `Ready: True` NO significa que la aplicación funcione

**Este paso no está completo sin un smoke test HTTP.** El health check de Cloud Run es un probe TCP contra el puerto: si gunicorn levanta y escucha, la revisión queda `Ready` aunque cada request devuelva 500. Fue exactamente lo que pasó el 2026-08-28 — servicio `Ready`, build `SUCCESS`, imagen correcta, y la aplicación entera caída.

Pegarle de verdad a la API, incluido un endpoint que toque la base:

```powershell
$B = "https://bi-backend-staging-535667828861.southamerica-west1.run.app"
curl -s -o /dev/null -w "%{http_code}`n" "$B/api/"
curl -s -o /dev/null -w "%{http_code}`n" "$B/admin/login/"
curl -s -o /dev/null -w "%{http_code}`n" "$B/api/entregas-ordenes-ocam/top-nro-parte/?categoria_negocio=COMPUTADORAS"
curl -s -o /dev/null -w "%{http_code}`n" "https://bi-frontend-staging-535667828861.southamerica-west1.run.app/"
```

Un 500 acá es un deploy fallido aunque todo lo demás diga que salió bien. Ir directo a los logs de **la revisión nueva** (no del servicio en general: la revisión vieja puede seguir logueando mientras se apaga) y tratarlo con `/diagnostico-staging`:

```powershell
gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.revision_name="<REVISION_NUEVA>" AND severity>=ERROR' --freshness=15m --limit=20 --format="value(textPayload)"
```

### Salida de emergencia: volver a la revisión anterior

Si staging queda caído y la causa no es evidente en un par de minutos, **restaurar el servicio primero y diagnosticar después**. Presentar el comando y esperar confirmación:

```powershell
gcloud run revisions list --service=bi-backend-staging --region=southamerica-west1 --limit=5 --format="table(metadata.name,spec.containers[0].image,metadata.creationTimestamp.date('%H:%M'))"
gcloud run services update-traffic bi-backend-staging --region=southamerica-west1 --to-revisions=<ULTIMA_BUENA>=100
```

Antes de proponerlo, verificar si las migraciones ya aplicadas son compatibles con el código viejo. Suelen serlo cuando solo **agregan** columnas o índices (el código viejo las ignora); no lo son si renombran, borran o agregan un `NOT NULL` sin default. Decírselo al usuario en vez de asumirlo.

## Paso 7 — Migraciones en staging (requiere confirmación)

El pipeline **no corre migraciones** (sección 2.1, punto 4 de `despliegue-google-cloud.md`). Es siempre un paso manual y aparte.

Primero comparar la imagen del Job contra la del servicio — si el Job quedó en una imagen vieja, reporta "No migrations to apply" con `exit(0)` aunque haya migraciones pendientes (incidente del 2026-08-20, ver `/diagnostico-staging` Paso 4):

```powershell
gcloud run jobs describe bi-backend-staging-migrate --region=southamerica-west1 --format="value(spec.template.spec.template.spec.containers[0].image)"
```

Si difiere, presentar los dos comandos y esperar confirmación:

```powershell
gcloud run jobs update bi-backend-staging-migrate --image="<imagen del servicio>" --region=southamerica-west1
gcloud run jobs execute bi-backend-staging-migrate --region=southamerica-west1 --wait
```

**Antes de ejecutar, advertir si alguna migración pendiente hace UPDATE de tabla completa o crea índices sobre una tabla grande** (`entregas_ordenes_ocam`, `ordenes_formalizadas`, `fichas_catalogo_ceam`): son operaciones que pueden tomar lock o inflar los índices. Decir cuál es y cuánto pesa esa tabla en staging antes de que el usuario decida.

Verificar el resultado real en los logs, no el exit code:

```powershell
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=bi-backend-staging-migrate" --freshness=10m --limit=50 --format="table(timestamp,severity,textPayload)"
```

Buscar `Applying <app>.<migración>... OK`. Si hay traceback o `IntegrityError`, la migración falló pese al exit code — reportarlo sin intentar corregirlo solo.

Si una migración de datos hizo UPDATE masivo, sugerir (no ejecutar sin confirmación) reconstruir los índices de esa tabla:

```sql
REINDEX TABLE CONCURRENTLY <tabla>;
```

`CONCURRENTLY` no bloquea lecturas ni escrituras. **Nunca proponer `VACUUM FULL`** sin avisar que toma lock exclusivo.

### Alinear a la imagen nueva todo lo que el build no toca (requiere confirmación)

Mismo problema que el Job de migración, multiplicado: **el build no le actualiza la imagen a ningún Job ni a los servicios de otras empresas** (ver «El build solo despliega los dos servicios de Compusur»).

Incidente real (2026-10-02): tras desplegar el recorte por alcance y las columnas nuevas de `LoteSincronizacionCatalogo`, `bi-ocam-sincronizacion-staging` seguía en una imagen anterior. No aplicaba el alcance y, además, su código viejo no conocía esas columnas `NOT NULL`: la corrida de esa noche habría fallado al crear el lote.

Al 2026-10-20 había tres recursos atrasados sin que nadie lo notara: `bi-ocam-alertas-staging` en `663d2ff0` (lo dispara un Scheduler cada 15 min), `bi-mercado-migrate` en `b8c3dac8` y Dysecom completo en el despliegue anterior.

**1. Listar qué quedó atrasado.** Es lectura, sin confirmación. Se lee el inventario real; no se usa la tabla de arriba:

```powershell
$sha = git rev-parse origin/main    # SHA COMPLETO
$recursos = @(
  gcloud run services list --region=southamerica-west1 --format=json | ConvertFrom-Json | ForEach-Object {
    [pscustomobject]@{ tipo = 'servicio'; nombre = $_.metadata.name; organizacion = $_.metadata.labels.organizacion; imagen = $_.spec.template.spec.containers[0].image } }
  gcloud run jobs list --region=southamerica-west1 --format=json | ConvertFrom-Json | ForEach-Object {
    [pscustomobject]@{ tipo = 'job'; nombre = $_.metadata.name; organizacion = $_.metadata.labels.organizacion; imagen = $_.spec.template.spec.template.spec.containers[0].image } }
)
$recursos | Where-Object { $_.imagen -match 'bi-(backend|frontend)-staging:' } |
  Select-Object organizacion, tipo, nombre, @{ n = 'tag'; e = { $_.imagen.Split(':')[-1].Substring(0, 8) } }, @{ n = 'al_dia'; e = { $_.imagen.EndsWith(":$sha") } } |
  Sort-Object organizacion, tipo, nombre | Format-Table -AutoSize
```

Presentar al usuario la tabla de lo que no está al día, agrupada por `organizacion`, aplicando la columna «¿Se alinea?» del inventario. No incluir `plataforma`, `erp-administrator`, `bi-mercado-carga-inicial` ni ninguna `organizacion` desconocida sin preguntar.

**2. Revisar que no haya ejecuciones en curso** en los Jobs que se van a tocar. Una ejecución que ya arrancó conserva su imagen, pero no se toca un Job a mitad de su corrida programada:

```powershell
gcloud run jobs executions list --job=<job> --region=southamerica-west1 --limit=1 --format="table(metadata.name,status.completionTime,status.runningCount)"
```

Horarios a evitar (Scheduler en `southamerica-east1`, hora de Lima):

| Job | Cuándo corre |
| --- | --- |
| `bi-mercado-ocam-diario` | 05:30 todos los días |
| `bi-mercado-ocam-estados` | domingo 03:30 |
| `bi-mercado-ceam-mensual` | 01:30 los días 1 a 9 |
| `bi-mercado-comunicados` | 14:30 de lunes a viernes |
| `bi-ocam-sincronizacion-staging` | de 00:00 a 02:00 los días 1 a 9 |
| `bi-ocam-alertas-staging` | cada 15 min (basta con que no esté corriendo en ese momento) |

**3. Orden: migrar primero, después el código.** Una base con migraciones pendientes revienta con el código nuevo (`relation ... does not exist`, pasado real con Dysecom).

| Base | Paso 1: migración | Paso 2: código | Paso 3: verificación |
| --- | --- | --- | --- |
| Compusur | Ya migrada arriba en este paso. | Resto de sus Jobs: `bi-ocam-sincronizacion-staging`, `bi-ocam-alertas-staging`. | — |
| `bi_mercado` | `bi-mercado-migrate`: `update --image` y después `execute --wait`. | Sus 4 Jobs de ingesta. | — |
| Dysecom (y cada empresa igual) | `bi-backend-dysecom-migrate`: `update --image` y después `execute --wait`. Revisar `Applying … OK` en los logs, como arriba. | `bi-backend-dysecom` y `bi-frontend-dysecom`, y después sus Jobs (`bi-copiar-datos-publicos-dysecom`). | La prueba de que la app responde. |

Comandos. Cada tanda (una base) se presenta escrita y espera su sí. Solo `--image`: **nunca** `--set-env-vars` ni `--set-secrets` sobre algo que ya existe.

```powershell
$img_back  = "southamerica-west1-docker.pkg.dev/bi-compusur/cloud-run-source-deploy/bi-compusur-bi-compusur/bi-backend-staging:$sha"
$img_front = "southamerica-west1-docker.pkg.dev/bi-compusur/cloud-run-source-deploy/bi-compusur-bi-compusur/bi-frontend-staging:$sha"

# Antes de tocar un servicio: contar sus variables (deben quedar las mismas; Dysecom tenía 43 al 2026-10-20)
(gcloud run services describe bi-backend-dysecom --region=southamerica-west1 --format=json | ConvertFrom-Json).spec.template.spec.containers[0].env.Count

gcloud run jobs update <job-migrate> --image=$img_back --region=southamerica-west1
gcloud run jobs execute <job-migrate> --region=southamerica-west1 --wait
gcloud run services update bi-backend-dysecom  --image=$img_back  --region=southamerica-west1
gcloud run services update bi-frontend-dysecom --image=$img_front --region=southamerica-west1
gcloud run jobs update <job> --image=$img_back --region=southamerica-west1    # uno por Job
```

Antes de usarla, confirmar que la ruta de `$img_back` coincide con la imagen que corre `bi-backend-staging`: `gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="value(spec.template.spec.containers[0].image)"`.

**4. Prueba de que la app responde en cada empresa alineada**, igual que en el Paso 6:

```powershell
$BD = gcloud run services describe bi-backend-dysecom  --region=southamerica-west1 --format="value(status.url)"
$FD = gcloud run services describe bi-frontend-dysecom --region=southamerica-west1 --format="value(status.url)"
curl -s -o /dev/null -w "%{http_code}`n" "$BD/api/"
curl -s -o /dev/null -w "%{http_code}`n" "$BD/admin/login/"
curl -s -o /dev/null -w "%{http_code}`n" "$FD/"
```

**5. Volver a correr el listado del punto 1.** Todo lo que se decidió alinear tiene que salir con `al_dia = True`.

### Cerrar el aviso de mantenimiento (requiere confirmación)

Solo cuando **todo** esté verificado: servicios en la imagen del commit (Paso 6), Job de migración con `Applying … OK`, el resto de los recursos alineados y smoke test posterior sin errores. Si también se avisó en Dysecom, cerrar ese aviso con su backend y su token. Si algo falló, **no cerrar el aviso** — es justo cuando hay que seguir avisando; decirlo y dejar la decisión al usuario.

```powershell
$cuerpo = @{ accion = 'finalizar' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$backend/api/tareas-programadas/mantenimiento/" -Headers @{ 'X-Scheduler-Token' = $token } -ContentType 'application/json' -Body $cuerpo
```

Cierra lo que esté vigente (si todavía no había empezado, queda como `cancelado`; si estaba en curso, `finalizado`) y no falla si ya no había nada. A quienes lo vieron en curso, el sistema les recarga la página solo (a los 3 s de mostrar «El mantenimiento terminó») para cargar la versión nueva. Queda registrado en el historial de Configuración → Mantenimiento con origen "Despliegue" y el commit.

## Paso 8 — Cerrar

Repetir la lectura de logs de error (Paso 3 de `/diagnostico-staging`) y resumir en español simple:

- Qué commits se subieron y a qué ramas.
- Qué build corrió y con qué resultado.
- Qué imágenes quedaron desplegadas (SHA), y si coinciden con el commit, **por organización**: Compusur, `bi_mercado`, Dysecom y cualquier otra que se haya alineado.
- Qué migraciones se aplicaron, en qué base.
- Estado final de los servicios de cada empresa.
- Qué recursos quedaron **a propósito** en otra imagen (`plataforma`, `erp-administrator`, `bi-mercado-carga-inicial`, lo que el usuario no quiso tocar), para que no se confundan con un olvido.
- **Qué quedó pendiente y requiere una acción manual del usuario** (cargas de CSV, Jobs de sincronización, variables de entorno nuevas que el código ya espera).

Ese último punto importa: si el commit agrega settings nuevas (`CLOUD_RUN_JOB_SINCRONIZACION`, `CLOUD_RUN_PROYECTO`, `CLOUD_RUN_REGION`, …), el servicio de staging **no las tiene** hasta que alguien las configure. Listarlas explícitamente en vez de dar el deploy por completo.

### Configurar variables y recursos nuevos (requiere confirmación)

**`--update-env-vars`, NUNCA `--set-env-vars`.** Es la misma trampa que `--set-secrets`: `--set` reemplaza la lista COMPLETA y borra en silencio las demás (el servicio de staging tiene ~35). Contar cuántas hay antes y después, y verificar por nombre que los secretos críticos siguen ahí:

```powershell
gcloud run services describe bi-backend-staging --region=southamerica-west1 --format="value(spec.template.spec.containers[0].env[].name)"
gcloud run services update bi-backend-staging --region=southamerica-west1 --update-env-vars="VAR1=valor,VAR2=valor"
```

**El orden importa cuando la variable apunta a otro recurso.** Si una variable nombra un Job/bucket/servicio, crear PRIMERO ese recurso y darle permisos, y recién después configurar la variable. Al revés, el código encuentra la variable, intenta usar el recurso inexistente y falla — normalmente peor que no tenerla, porque el fallback por "no configurado" deja de aplicar. Para el Job de sincronización el orden correcto es:

1. `gcloud run jobs create <job>` — replicando la configuración de `bi-ocam-alertas-staging` (misma cuenta de servicio, `--set-cloudsql-instances`, y los secretos `secret-key-staging` / `db-password-staging`, sin los cuales Django no arranca).
2. `gcloud run jobs add-iam-policy-binding <job> --member=serviceAccount:<sa del backend> --role=roles/run.invoker` — el permiso lo necesita la cuenta del **backend**, no la del Scheduler.
3. `gcloud run services update ... --update-env-vars=...`

En un Job recién creado sí se puede usar `--set-secrets`: no hay nada previo que preservar.

Antes de dar por bueno un Job nuevo, probarlo con una corrida **acotada** (una categoría, un mes) en vez de confiar en que la configuración quedó bien. Es barato y valida secretos, conexión a Cloud SQL y formato del endpoint de una sola vez:

```powershell
gcloud run jobs execute <job> --region=southamerica-west1 --wait --args="manage.py,sincronizar_ordenes_ocam,--categoria,<CAT>,--desde,<YYYY-MM-DD>,--hasta,<YYYY-MM-DD>"
```

Y leer sus logs por `execution_name`, no por `job_name`: filtrar por el Job mezcla las ejecuciones anteriores y da un diagnóstico equivocado.

```powershell
gcloud logging read 'resource.type=cloud_run_job AND labels."run.googleapis.com/execution_name"="<EXECUTION>"' --freshness=30m --limit=40 --format="value(timestamp,textPayload)" --order=asc
```
