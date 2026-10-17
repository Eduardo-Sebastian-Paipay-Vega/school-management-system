# Validación e integración — Squad 3 / M8

## Ejecutar la interfaz

Desde la raíz, con Flutter compatible con `pubspec.yaml`:

```powershell
flutter pub get
flutter run -d chrome
```

Abrir **Squad 3** en la navegación. La cinta de demostración identifica los datos ficticios y su almacenamiento en memoria. El selector de perfil solo existe en la demostración. Puede registrar un bloque de notas tabuladas, revisar como docente, publicar y consultar el resultado como estudiante. Para cerrar, completar las notas, aprobar los borradores y registrar conclusiones para B/C; cambiar a dirección/coordinación. Volver a docente para solicitar una rectificación; dirección la decide con confirmación electrónica o motivo de rechazo. El perfil estudiante de demostración representa la primera matrícula.

Crear una evaluación requiere nombre, peso, competencia del catálogo y rúbrica. La competencia de ejemplo es «Resuelve problemas de cantidad»; en producción llega del proveedor curricular. Los pesos son relativos y se normalizan al calcular el promedio. Las sugerencias pedagógicas del modo demo necesitan revisión docente y no son un catálogo oficial certificado.

## Ejecutar el backend

Requiere Node.js 24 y PostgreSQL 16 o compatible. El servidor utiliza PostgreSQL siempre; el adaptador en memoria solo se emplea en pruebas.

```powershell
Set-Location backend/squad_3_calificaciones
npm ci
```

Configurar en el entorno `DATABASE_URL`, `JWT_SECRET` (al menos 32 bytes, compartido de forma segura con Squad 1), `JWT_ISSUER`, `JWT_AUDIENCE`. Opcionales: `PORT` (3003), `HOST` (127.0.0.1), `ALLOWED_ORIGIN` (origen exacto de la aplicación web). No guardar valores reales en el repositorio. En producción terminar HTTPS/WSS en el proxy institucional y mantener el servicio sin exposición pública directa.

```powershell
npm run migrate
```

La migración inicial se ejecuta una vez sobre una base nueva; no está diseñada para repetirse ni para transformar tablas de una instalación anterior. Crea el esquema `squad3`, planillas, historial, índices, triggers y políticas RLS. Ejecutarla con rol de migración. El rol de aplicación debe tener USAGE en el esquema, SELECT/INSERT/UPDATE en `gradebooks`, SELECT/INSERT en `grade_audit_history` y no ser propietario ni disponer de permisos DDL/TRUNCATE. `created_by` y las referencias externas requieren UUID reales.

## Importar la configuración real

No se incluye un seed productivo de usuarios o matrículas. Preparar un JSON local con metadatos:

```json
{
  "id": "00000000-0000-4000-8000-000000000010",
  "tenantId": "codigo-institucion",
  "title": "Matemática · 3 A · Bimestre I",
  "courseId": "00000000-0000-4000-8000-000000000011",
  "sectionId": "00000000-0000-4000-8000-000000000012",
  "periodId": "00000000-0000-4000-8000-000000000013",
  "year": 2026,
  "periodWeight": 1,
  "expectedPeriods": ["00000000-0000-4000-8000-000000000013"],
  "annualMode": "weighted",
  "level": "secondary",
  "deadline": "2026-11-01T04:59:59Z"
}
```

Es un ejemplo de forma: reemplazar IDs, año, cierre y **todos** los periodos anuales según la configuración escolar; no usar un único periodo como atajo si el año tiene cuatro bimestres. `deadline` se transmite con zona horaria, convirtiendo la fecha local de Lima a UTC. En primaria se configura `predominant` o `latest` según la política académica validada.

Configurar `SQUAD1_SCALE_URL`, `SQUAD2_ROSTER_URL` y `PROVIDER_TOKEN` con las URLs reales y un token de integración. Las formas de respuesta se describen en [contratos_api.md](contratos_api.md). El aprovisionamiento valida institución, sección, curso y periodo, escala, competencias, banco, UUID y matrículas duplicadas.

```powershell
npm run provision -- C:/ruta-local/config-planilla.json
npm start
```

El comando no actualiza silenciosamente una planilla existente: el ID duplicado falla. Cambiar la matrícula o la política de una planilla ya utilizada requiere una migración de integración revisada, para no alterar calificaciones históricas.

## Conectar Flutter con los Squads 1 y 2

El host autenticado debe construir la pantalla con la sesión real y un repositorio cuyo callback devuelva el token vigente. Los tokens no se incorporan mediante `--dart-define` ni se almacenan en los fuentes:

```dart
Squad3Screen(
  session: GradeSession(authenticatedUserId, GradeRole.teacher),
  repository: ApiGradesRepository(
    baseUrl: gradesApiBaseUrl,
    bookId: assignedBookId,
    token: () => authenticationService.currentAccessToken,
  ),
)
```

Importar `domain/models/gradebook.dart` y `data/repositories/api_grades_repository.dart` desde el feature. `authenticationService` y las variables del ejemplo representan las dependencias del host, no clases que ya existan en este checkout. Mapear el rol del usuario autenticado al enum correspondiente; la UI no sustituye la validación del JWT en el servidor. El estudiante se resuelve en el backend por `sub`; no se puede elegir otra matrícula por query.

Para un host que prefiera configuración de compilación, la pantalla entiende `GRADES_API_URL` y `GRADES_BOOK_ID`, pero sigue requiriendo que el host inyecte `accessToken` y una sesión real. La aplicación de demostración predeterminada no tiene autenticación institucional y no se anuncia como lista para producción.

Integraciones aún externas: provisión JWT/revocación institucional de Squad 1, endpoints reales de escala y matrícula, expedientes probatorios, bus Redis para varias instancias y aprobación académica de reglas/plantillas. Las pruebas locales no sustituyen una prueba conjunta con esos servicios.

## Comprobaciones automatizadas

```powershell
flutter analyze
flutter test
Set-Location backend/squad_3_calificaciones
npm run check
npm test
```

Flutter: conversión, validación, promedio ponderado, redondeo final, primaria, debounce exacto de 400 ms, edición durante petición, conflicto, TSV atómico, bloqueo con celdas inválidas, foco por teclado, viewport con 5000 estudiantes y adaptación a 360 px.

Node: reglas CNEB y permisos, atomicidad, publicación separada, privacidad entre alumnos, borradores/aprobación/rechazo, conclusiones B/C, cierre por plazo, rectificaciones con sustento y confirmación, anual completo, versiones, rutas REST con JWT y mensajes WebSocket. PGlite ejecuta el DDL y el adaptador SQL sobre un motor PostgreSQL embebido, incluyendo rollback, auditoría inmutable y RLS con rol no propietario. No constituye una prueba de infraestructura del PostgreSQL desplegado por el colegio.

## Rendimiento reproducible

La prueba de widgets verifica que 5000 alumnos no se construyan simultáneamente. Para medir cuadros reales:

```powershell
flutter drive --profile -d windows --driver=test_driver/squad_3_performance.dart --target=integration_test/squad_3_performance_test.dart
```

La prueba usa `IntegrationTestWidgetsFlutterBinding.watchPerformance` durante digitación y desplazamiento, y el driver escribe resultados en `build/`. Registrar modelo de equipo, resolución, Flutter, modo de compilación y carga de datos junto al JSON. Evaluar tiempos build/raster y cuadros que superan 16,67 ms para el objetivo de 60 Hz. La prueba falla si se ejecuta sin profile para evitar presentar tiempos debug como evidencia de rendimiento.

Intento local del 16 de octubre de 2026: el comando se detuvo antes de compilar con `Unable to find suitable Visual Studio toolchain`. Por tanto no hay una medición profile de cuadros ni certificación de 60 FPS en este entorno. Se necesita instalar la toolchain de escritorio de Flutter o ejecutar el escenario en otro equipo compatible.

Los resultados de ese escenario miden renderizado local con datos sintéticos, sin latencia de red ni persistencia productiva. Para aceptación institucional repetir con matrículas anonimizadas y servidor real, incluyendo conflictos y reconexión. No extrapolar una sola medición a todos los dispositivos.

## Decisiones que requieren revisión académica o de integración

1. Ratificar dos decimales frente a la mención de un decimal en CU-NOT-02.
2. Confirmar escala suministrada por Squad 1, regla de desempate en primaria, pesos/modo anual y catálogo de competencias/conclusiones.
3. Ratificar el contrato canónico `batch` y adaptar consumidores de los payloads históricos.
4. Verificar referencias documentales contra expedientes institucionales; este servicio no almacena binarios ni emite firmas PKI.
5. Validar volumen del agregado JSONB e historial completo con la carga real antes del despliegue.

## Registro de validación local — 16 de octubre de 2026

- Flutter 3.35.7: 14 pruebas de la suite Flutter aprobadas, incluyendo la prueba institucional existente.
- `flutter analyze`: sin errores, advertencias ni incidencias.
- Node.js 24.11.1: `npm run check` aprobado y 16 pruebas de servidor aprobadas.
- El DDL, la transacción, el historial y RLS se verificaron con PGlite, sin modificar una base institucional.
- La compilación web release se comprobó localmente; los artefactos permanecen en `build/web/`, excluido de Git.
- La prueba de rendimiento profile no pudo ejecutarse por falta de toolchain Visual Studio compatible, como se detalla arriba.
