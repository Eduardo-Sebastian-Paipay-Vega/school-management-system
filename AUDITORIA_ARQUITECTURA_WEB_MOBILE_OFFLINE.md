# Auditoría técnica — preparación de arquitectura web + aplicación móvil offline-first

**Repositorio auditado:** `school-management-system`  
**Fecha de corte:** 17 de octubre de 2026 (America/Lima)  
**Rama y commit:** `dev` — `06ddee38f10d863e9867ddcc4c2ff85b70776044`  
**Modalidad:** inspección estática de solo lectura. Este documento es el único artefacto creado.

## 1. Resumen ejecutivo

### Veredicto

El repositorio puede conservarse como punto de integración para la evolución web y una futura aplicación móvil, pero **no está preparado todavía para iniciar el cliente móvil ni para prometer sincronización offline**. La prioridad es convertir contratos documentales y demostraciones locales en servicios autoritativos, coherentes y probados.

La tecnología móvil recomendada es **Flutter para Android (y eventualmente iOS)**, no React Native/Expo. La razón es comprobable: la aplicación principal ya usa Flutter/Dart, dispone de `android/` e `ios/`, concentra 6 751 líneas en Squad 1 y 2 027 líneas en Squad 3, y su lógica de dominio y componentes podrían reutilizarse directamente. React Native reutilizaría TypeScript del backend, pero obligaría a reescribir la UI y el dominio Dart; Capacitor envolvería un build Flutter Web sin aprovechar el soporte móvil nativo de Flutter; una PWA es apropiada como canal de bajo costo, pero no como única solución para persistencia cifrada, trabajo confiable en segundo plano y control del ciclo de vida del dispositivo.

Existe un **bloqueo de gobierno**: `D - Base 1 - 01092026/Fase 2/limites_y_alcance_proyecto.md` declara fuera de alcance las apps móviles nativas y restringe el producto a Flutter Web/PWA y Windows. La app futura solo puede comenzar tras aprobar una ampliación de alcance posterior al piloto. Esta auditoría no cambia ese alcance.

### Estado real, resumido

| Área | Estado comprobado | Consecuencia |
|---|---|---|
| Flutter principal | Aplicación multiplataforma, Feature-First, sin gestor de estado externo; Squad 1 demo en memoria, Squad 3 funcional/demo + API, Squads 2/4/5 prototipos | Hay base reutilizable, pero no una web administrativa completa conectada al servidor |
| Backend común | Express/TypeScript con seguridad base, PostgreSQL/Redis y solo `/api/v1/health` | No constituye aún el backend compartido del sistema |
| Backend Squad 3 | Servicio Node/TypeScript independiente con REST, WebSocket, JWT, versión optimista, PostgreSQL, RLS y pruebas | Es la implementación más madura y el patrón técnico más cercano al objetivo |
| Base de datos | DDL consolidado de 18 tablas/vistas más un esquema alternativo `squad3` | Hay dos modelos incompatibles de calificaciones que deben reconciliarse |
| Offline | Solo simulación visual en Squad 2; Squad 3 conserva reintentos únicamente en memoria | No existe persistencia offline real ni motor de sincronización |
| Portal público | Proyecto Next.js 15/React 19 completo, pero toda la carpeta `las-condes-replica/` está sin rastrear | Debe decidirse si es producto oficial, prototipo o repositorio separado antes de integrarlo |
| Entrega/CI | `vercel.json` y Compose de datos; no hay `.github/workflows`, Dockerfiles ni API en Compose | La documentación de CI/CD y despliegue excede lo implementado |
| Seguridad | Reglas valiosas y validación server-side en Squad 3; secretos demo/default, auth de Squad 1 en cliente y `.env` local no ignorado | No apto para producción ni para almacenar datos reales de menores |

### Recomendaciones prioritarias

1. **Detener el inicio móvil** hasta autorizar el cambio de alcance y definir el MVP móvil por rol y dato.
2. **Establecer una autoridad backend única**: integrar o modularizar Squad 3 dentro del backend común, implementar autenticación real y eliminar dependencias de seguridad ejecutadas en el cliente.
3. **Congelar contratos versionados** mediante OpenAPI/JSON Schema y escoger un único modelo canónico de datos/migraciones.
4. **Implementar primero sincronización de asistencia** con idempotencia, cursor incremental, versiones y tombstones; no comenzar por calificaciones ni operaciones críticas.
5. **Adoptar Flutter móvil progresivamente**, reutilizando dominio Dart y UI adaptable, con SQLite cifrado y repositorios local/remoto; no reorganizar todo el repositorio en un monorepo en esta fase.

## 2. Alcance y método de auditoría

### Hechos inspeccionados

- Estado Git, ramas, remoto, worktrees, submódulos y archivos no confirmados.
- Manifiestos Flutter, Node y Next; configuración de compilación, despliegue y contenedores.
- Código de `lib/`, `backend/src/`, `backend/squad_3_calificaciones/`, pruebas y DDL.
- Documentación obligatoria de límites, 71 RF, 71 CU, 20 RNF, stack, arquitectura y SDD de Squads 1 y 3.
- Referencias estáticas mediante búsquedas de imports, rutas, endpoints, almacenamiento y dependencias.

### Límites de la evidencia

- No se ejecutaron builds, pruebas, migraciones, servidores ni contenedores: podían crear cachés/artefactos y la solicitud exige solo lectura salvo este informe.
- Se registran los resultados históricos declarados en `.../Squad 3.../validacion_integracion.md`, pero **no se presentan como verificación actual**.
- No se inspeccionó el contenido de secretos de `backend/.env`; solo se verificó la presencia de sus nombres de variables.
- No se validó infraestructura remota, Vercel, DNS ni base institucional. No hay evidencia local suficiente de un despliegue productivo.

## 3. Estado real de Git y organización del repositorio

### Git

| Elemento | Hallazgo verificable |
|---|---|
| Raíz Git | `C:/2026 - 2/zapatex/school-management-system` |
| Rama | `dev`, siguiendo `origin/dev`, sin divergencia indicada |
| HEAD | `06ddee3 feat(squad-3): implement gradebook M8, backend, SDD and tests` |
| Ramas visibles | Local `dev`; remotas `origin/dev` y `origin/main`; `origin/HEAD -> origin/dev` |
| `main` remoto | `41b14e8...`; está incluido entre las ramas remotas fusionadas en `origin/dev` |
| Tags | Ninguno |
| Remoto | `origin` apunta a `https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system.git` |
| Worktrees | Uno: la raíz auditada |
| Submódulos | Ninguno reportado |
| Política documentada | GitFlow ligero en `AGENTS.md`: `dev` integración, `main` producción, ramas temporales opcionales |

### Working tree preexistente

El árbol **no estaba limpio antes de crear este informe**:

- Marcados modificados: siete registrantes generados de plugins en `linux/flutter/`, `macos/Flutter/` y `windows/flutter/`. `git diff` no mostró diferencias textuales; es compatible con cambios de metadatos/finales de línea, pero debe confirmarse antes de revertir o confirmar.
- Sin rastrear: `backend/.env`, `backend/dist/`, `backend/node_modules/`, `backend/package-lock.json` y todo `las-condes-replica/`.
- `.gitignore` no ignora `node_modules`, `dist`, `.env`, `.next` ni `*.tsbuildinfo` de forma general. Esto explica gran parte del ruido y crea riesgo de confirmar secretos o miles de artefactos.
- `backend/package-lock.json` sin rastrear impide garantizar instalaciones reproducibles del backend común, mientras el lockfile de Squad 3 sí está rastreado.

### Estructura real

```text
school-management-system/
├── lib/                         Flutter principal (86 archivos)
├── android/ ios/ web/ windows/ linux/ macos/
├── backend/
│   ├── src/                     API Express común: scaffold + salud
│   └── squad_3_calificaciones/  servicio ejecutable independiente
├── database/init/               DDL consolidado
├── test/ integration_test/      pruebas Flutter
├── las-condes-replica/          Next.js/React, sin rastrear
└── D - Base 1 - 01092026/       especificaciones, RF/CU/RNF y arquitectura
```

No es un monorepo administrado: no hay workspace npm/pnpm/yarn, Melos, Nx, Turborepo ni configuración raíz que coordine paquetes. Es un repositorio único con tres unidades de compilación independientes.

## 4. Arquitectura tecnológica identificada

### Implementación, no intención documental

| Capa | Tecnología comprobada | Evidencia y observaciones |
|---|---|---|
| Cliente administrativo | Flutter 3.35.4 / Dart 3.9.2 / Material 3 | `pubspec.yaml`, `lib/main.dart`; targets web, Android, iOS y escritorio ya generados |
| Estado/DI | `StatefulWidget`, `ChangeNotifier`, `InheritedWidget` y construcción manual | No están instalados Riverpod/Provider/BLoC aunque la documentación los menciona |
| HTTP/tiempo real | `http ^1.5.0`, `web_socket_channel ^3.0.3` | Solo Squad 3 usa ambos realmente |
| Backend común | Node.js >=20, TypeScript 5.5, Express 4, CommonJS | `backend/package.json`, `backend/src/server.ts` |
| Backend M8 | Node.js, TypeScript 5.9, ESM, HTTP nativo, `ws`, `jose`, `pg` | `backend/squad_3_calificaciones/package.json` |
| Portal público alterno | Next.js 15.5, React 19, TypeScript, Tailwind, Framer Motion | `las-condes-replica/package.json`; sin rastrear y sin llamadas API observadas |
| Datos | PostgreSQL 16 + Redis 7 | `docker-compose.yml`; Adminer incluido. No hay ORM: SQL/`pg` directo |
| Persistencia local | Ninguna implementada | `pubspec.yaml` no incluye Hive, SQLite, Drift, secure storage ni conectividad |
| Archivos | Solo columnas URL y selección/impresión local | `escudo_url`, `foto_url`, `archivo_adjunto_url`; no hay S3/bucket/servicio upload implementado |
| Seguridad | Helmet/CORS/JWT middleware en scaffold; JWT/RBAC robusto en M8; demo criptográfica en Flutter | Los middlewares comunes no protegen rutas funcionales porque esas rutas no existen |
| Build | Flutter CLI, `tsc`, `tsx`, Next CLI | Tres procesos separados; no hay orquestador raíz |
| Pruebas | `flutter_test`, Node test runner + PGlite en M8 | Backend común declara `jest` pero no incluye Jest en devDependencies |
| Despliegue | `vercel.json` para SPA Flutter y Compose solo para Postgres/Redis/Adminer | No hay Dockerfiles, workflows CI ni servicios app en Compose |

### Dependencias principales y estado de uso

- Flutter: `crypto`, `encrypt`, `file_picker`, `csv`, `excel`, `pdf`, `printing`, `http`, `web_socket_channel`; todas tienen referencias reales salvo `cupertino_icons`, que no apareció en imports de aplicación.
- Backend común: Express, CORS, Helmet, Morgan, `pg`, Redis, JWT, Zod y rate-limit. `express-rate-limit` y Zod no aparecen conectados al scaffold inspeccionado.
- Portal Next: Framer Motion, Lucide, `clsx` y `tailwind-merge` tienen uso. `primeng`, `@primeuix/themes`, `next-themes` y `class-variance-authority` no tienen imports observados y son candidatos a revisión, no a eliminación automática.

## 5. Inventario funcional real

### Módulos Flutter

| Módulo y ruta | Implementación real | Dependencias/datos | API/permisos | Reutilización móvil y límites |
|---|---|---|---|---|
| Shell — `lib/main.dart` | Navegación inferior a overview y cinco squads; guard de salida de planilla | Importa barrels de los cinco squads | No hay router protegido global; módulos 2–5 se alcanzan desde shell sin autenticación común | Adaptable. La navegación debe separarse por rol y factor de forma |
| Tema/core — `lib/core/` | Tokens visuales y `SquadCard` | Flutter Material | Sin datos | Reutilizable en Flutter; `SquadCard` es una pantalla de desarrollo, no navegación de producto |
| Squad 1 — `lib/features/squad_1_core_seguridad/` | 68 archivos: login, usuarios, importación CSV/XLSX, directorio, sedes, periodos, escalas, auditoría, cifrado y PDF | Repositorios contra `InMemoryStore`; seed demo; modelos/servicios Dart | RBAC en cliente; JWT y hash de contraseña generados en Flutter; sin API remota | Dominio, validadores, contratos y widgets son adaptables; seguridad/credenciales y persistencia deben moverse al servidor. No compartir secretos con móvil |
| Squad 2 — `lib/features/squad_2_matricula_asistencia/` | 2 archivos/248 líneas; simulador de QR, toggle offline, contador local y textos WebSocket | Estado local de widget, valores hardcoded | No usa API, BD local, cámara, QR ni WebSocket | UI conceptual adaptable; no existe lógica reutilizable de matrícula/asistencia/sync |
| Squad 3 — `lib/features/squad_3_calificaciones/` | 8 archivos/2 027 líneas; matriz virtualizada, teclado/TSV, debounce 400 ms, reintentos, conflicto, roles, publicación/cierre/rectificación | `GradesRepository`; demo en memoria o `ApiGradesRepository` | GET matrix/annual, PATCH batch, POST actions, WS live; token inyectable | Alto valor reusable en Flutter. Cola solo en memoria; el módulo declara que no es offline durable |
| Squad 4 — `lib/features/squad_4_analitica_dashboards/` | 2 archivos/217 líneas; heatmap y drill-down visual con valores constantes | Estado local | Sin endpoint ni permisos efectivos | Exclusivo/adaptable de presentación; agregaciones deben residir en servidor |
| Squad 5 — `lib/features/squad_5_secretaria_portal/` | 2 archivos/212 líneas; verificación hash y accesos visuales a reportes/portal | Estado local y valores demostrativos | Sin generación PDF, QR, hash servidor o endpoints | Mantener separado por plataforma; en móvil solo consulta/descarga autorizada |

### Backends

| Ruta | Responsabilidad comprobada | Datos y reglas | Limitaciones |
|---|---|---|---|
| `backend/src/` | Arranque Express, Helmet, CORS, JSON, Morgan, conexión Redis, health de PostgreSQL/Redis | Middleware `authenticateJwt`, `requireRoles`; solo se monta `GET /api/v1/health` | No hay auth/login, usuarios, matrícula, asistencia, reportes o sync; defaults sensibles en fuente |
| `backend/squad_3_calificaciones/src/domain.ts` | Reglas de planilla, escalas, permisos, promedios, publicación, cierre y rectificación | Dominio TypeScript puro | Duplica parte del dominio Dart; debe mantenerse autoridad server-side |
| `.../store.ts` | Adaptadores memoria/pruebas y PostgreSQL; transacción, lock y revisión optimista | `gradebooks`, `grade_audit_history` | Agregado JSONB completo puede crecer; conflictos son por planilla, no por celda |
| `.../app.ts` | REST y WebSocket autenticados; CORS exacto; validación de tamaño | Rutas de M8 y broadcast por proceso | Sin Redis pub/sub multi-instancia; sin idempotency key explícita en el contrato de escritura |
| `.../provision.ts` | Importa escala/currículo de Squad 1 y padrón de Squad 2 por URLs configuradas | Valida tenant, UUID, duplicados y política | Los proveedores reales no existen todavía en este checkout |

### Portal Next.js sin rastrear

`las-condes-replica/app/` implementa páginas públicas de inicio, niveles, servicios, testimonios, admisión, noticias, contacto e intranet. Los formularios solo cambian estado local; no se observaron `fetch`/API. La pantalla de intranet es una presentación, no autenticación integrada. `components/Home.tsx` no tiene referencias estáticas y parece una versión alterna del home; requiere confirmación antes de eliminarse.

### Datos y esquema

`database/init/01_esquema_consolidado.sql` crea extensiones, enums, 17 tablas y una vista materializada para instituciones, usuarios/RBAC, periodos, auditoría, matrícula, carnés, asistencia, calificaciones, conclusiones, analítica, documentos y comunicados. El esquema:

- sí usa UUID en entidades principales y protege `logs_auditoria` contra UPDATE/DELETE;
- no implementa Row-Level Security en el DDL consolidado;
- omite `tenant_id` directo y pistas completas de auditoría en varias tablas transaccionales, pese a la regla SDD;
- no incluye `idempotency_key`, versiones de sync, tombstones ni curso/catálogo completos;
- usa `tenant_id UUID` en el consolidado, mientras M8 usa `VARCHAR(50)` y un esquema JSONB separado;
- no cifra por sí mismo DNI u otros campos sensibles y no contiene gestión de claves.

`backend/squad_3_calificaciones/migrations/001_grades.sql` sí añade RLS, revisión, historial inmutable y transacciones para M8, pero constituye un modelo alternativo. Ejecutar ambos no integra automáticamente sus datos.

## 6. Mapa de dependencias

```text
lib/main.dart
├── core/theme + core/widgets
├── Squad 1 -> dominio Dart -> repositorios -> InMemoryStore (demo)
├── Squad 2 -> estado UI simulado
├── Squad 3 -> GradebookController -> GradesRepository
│              ├── DemoGradesRepository
│              └── ApiGradesRepository -> REST/WS -> backend/squad_3_calificaciones
├── Squad 4 -> estado UI simulado
└── Squad 5 -> estado UI simulado

backend/squad_3_calificaciones
├── JWT de Squad 1 (contrato externo, aún no disponible)
├── escalas/competencias de Squad 1 (proveedor URL, aún no disponible)
├── matrícula/asignaciones de Squad 2 (proveedor URL, aún no disponible)
└── PostgreSQL schema squad3

backend/src
├── PostgreSQL -> database/init/01_esquema_consolidado.sql
├── Redis
└── solo health; no conecta funcionalmente con los módulos Flutter

las-condes-replica (Next.js, sin rastrear)
└── contenido estático/estado local; sin integración con backend o Flutter
```

Acoplamientos críticos:

- `lib/main.dart` conoce directamente las cinco pantallas y expone módulos demo desde una sola navegación.
- Squad 3 tiene contratos explícitos, pero su aprovisionamiento depende de servicios inexistentes de Squads 1/2.
- Autenticación existe dos veces: simulación Dart en cliente y middleware Node sin rutas de emisión; M8 espera una tercera integración JWT externa.
- Los contratos documentales (`requisitos_funcionales_tecnicos.md`, `contratos_api.md`) describen muchos endpoints que no existen en código.

## 7. Matriz de reutilización web–móvil

Categorías: A reutilizable, B adaptable, C exclusivo de plataforma, D conviene extraer/estabilizar, E candidato a eliminación solo tras autorización.

| Cat. | Ruta exacta | Evidencia y justificación | Riesgo/dependencias | Recomendación |
|---|---|---|---|---|
| A | `lib/core/theme/app_theme.dart` | Tokens Material compartibles por Flutter web/móvil | Bajo; todos los widgets | Conservar como fuente visual; eliminar colores ad hoc gradualmente en fase futura |
| A | `lib/features/squad_1_core_seguridad/domain/models/`, `domain/services/grading_scale_service.dart`, `shared/validators.dart`, `shared/failures.dart` | Modelos/reglas Dart sin UI; pruebas presentes | Medio: verificar paridad con servidor y normativa | Extraer a paquete Dart solo cuando haya dos consumidores reales |
| A | `lib/features/squad_3_calificaciones/domain/models/gradebook.dart` | Modelo, escala y cálculos usados por UI/pruebas | Medio: duplicidad con `domain.ts` | Reutilizar en Flutter; mantener servidor como autoridad y añadir pruebas contractuales |
| B | `lib/features/squad_3_calificaciones/presentation/` | UI Flutter madura, virtualizada y responsive | Medio/alto en pantallas pequeñas y teclado táctil | Crear composición móvil específica conservando controlador/modelos |
| B | `lib/features/squad_1_core_seguridad/presentation/` | Widgets y controladores funcionales en demo | Alto: hoy dependen de repositorios en memoria y seguridad cliente | Sustituir datasources por API; conservar flujos y validación de UX |
| B | `lib/features/squad_2_matricula_asistencia/presentation/screens/squad_2_screen.dart` | Solo demuestra UX, QR/offline no reales | Alto; depende del futuro sync, cámara y almacenamiento | Usar como prototipo visual, no como base lógica |
| C | `lib/features/squad_4_analitica_dashboards/presentation/`, `lib/features/squad_5_secretaria_portal/presentation/` | Dashboards/reportes densos y simulados | Medio; móvil requiere vistas resumidas | Mantener UIs separadas; compartir DTOs y repositorios, no pantallas completas |
| C | `las-condes-replica/` | Portal público Next/React, SEO y contenido web | Alto si se mezcla con Flutter; estado Git incierto | Mantener como aplicación web separada si se oficializa |
| C | `backend/src/`, `backend/squad_3_calificaciones/` | Seguridad, permisos, validaciones críticas y datos | Crítico | Nunca trasladar secretos, firma JWT, autorización final ni reglas de cierre al teléfono |
| D | Contratos de `backend/squad_3_calificaciones/src/domain.ts` y modelos Dart de Squad 3 | Dos representaciones del mismo dominio | Alto riesgo de deriva | Publicar OpenAPI/JSON Schema y tests de contrato; no intentar ejecutar TypeScript dentro de Flutter |
| D | `lib/features/squad_1_core_seguridad/data/repositories/` | Interfaces ya desacoplan dominio, pero implementaciones usan memoria | Alto | Crear adaptadores HTTP; conservar interfaces donde el contrato sea estable |
| D | `database/init/01_esquema_consolidado.sql` y `backend/squad_3_calificaciones/migrations/001_grades.sql` | Dos modelos de M8 y tipos tenant incompatibles | Crítico | Elegir migración canónica y plan de convergencia antes de nuevos datos |
| D | `backend/src/` + servicio M8 | Backend común vacío y servicio vertical separado | Alto | Adoptar modular monolith inicialmente o gateway explícito; unificar auth/config/observabilidad |
| E | `backend/node_modules/`, `backend/dist/`, `las-condes-replica/node_modules/`, `.next/`, `tsconfig.tsbuildinfo` | Artefactos generados/locales y sin rastrear | Bajo si scripts reproducenlos; `dist` es requerido por `npm start` | Ignorar y regenerar; no borrar hasta verificar build reproducible |
| E | `las-condes-replica/components/Home.tsx` | No se hallaron imports; `app/page.tsx` implementa otro home | Medio por uso dinámico/manual posible | Confirmar con build y propietario del portal antes de eliminar |
| E | Dependencias Next `primeng`, `@primeuix/themes`, `next-themes`, `class-variance-authority` | Sin imports estáticos encontrados | Bajo/medio; puede haber configuración futura | Revisar con build/bundle; no desinstalar en esta auditoría |
| E | Registrantes Flutter marcados modificados | Archivos generados, sin diff textual visible | Medio por plugins nativos | Determinar causa y regenerar/revertir solo con árbol limpio y autorización |

No se clasifica ningún módulo funcional como obsoleto. Squads 2/4/5 son incompletos, no eliminables: corresponden a RF vigentes.

## 8. Comparación de alternativas móviles

Escala 1 (desfavorable) a 5 (favorable), relativa a este repositorio.

| Criterio | React Native + Expo | Flutter móvil | Capacitor + web actual | PWA Flutter |
|---|---:|---:|---:|---:|
| Reutilización del cliente actual | 1 | 5 | 3 | 5 |
| Reutilización TypeScript | 4 | 2 vía contratos, no código directo | 3 | 1 |
| UI nativa/rendimiento | 4 | 5 | 2 | 2–3 |
| SQLite y capacidades dispositivo | 4 | 5 | 3 | 1–2 |
| Background sync confiable | 4 | 4 | 3 | 1 |
| Seguridad de almacenamiento | 4 | 4 | 3 | 2 |
| Complejidad incremental | 2 | 4 | 3 | 5 |
| Riesgo de duplicación | 2 | 4 | 3 | 5 |
| Distribución Android | 5 | 5 | 5 | 2 (instalable, no equivalente a app de tienda) |
| Evolución de producto | 4 | 5 | 3 | 3 |

### A. React Native + Expo + TypeScript

Ventaja: compartir tipos, validaciones puras y cliente API con Node si se crea un workspace TypeScript. Desventaja decisiva: la UI, controladores, modelos y pruebas actuales están en Dart. Expo no convierte esos artefactos; implicaría un segundo ecosistema y reescritura. Solo conviene si la organización decide abandonar Flutter por razones de talento/estrategia externas que no aparecen en el repositorio.

### B. Aplicación existente + Capacitor

Capacitor está optimizado para aplicaciones web DOM. El cliente principal es Flutter Web renderizado y Flutter ya genera Android/iOS nativos. Envolver el build web añade puente y ciclo de vida sin una ganancia clara. Podría aplicarse al portal Next, pero ese portal es informativo y no el sistema administrativo/offline.

### C. PWA

Es la ruta más rápida para acceso móvil y debe conservarse como canal complementario. Resulta adecuada para consultas y formularios de baja criticidad. Para datos sensibles de estudiantes, colas durables, cifrado robusto, revocación, almacenamiento amplio y sincronización en segundo plano, las restricciones del navegador hacen más débil la garantía operacional.

### D. Flutter móvil — recomendada

La ventaja concreta exigida para considerar Flutter existe: el repositorio ya es Flutter, los targets móviles ya están presentes y las dos áreas con mayor código reusable son Dart. Se recomienda una app Android Flutter o un entrypoint móvil dentro del ecosistema Dart, con pantallas por rol y repositorios offline-first. No debe ser simplemente la compilación sin cambios del dashboard administrativo.

**Decisión propuesta:** Flutter móvil, condicionada a aprobación de alcance y a F1/F2. Mantener PWA para consulta y continuidad básica. No adoptar React Native/Expo ni Capacitor en el estado actual.

## 9. Diseño conceptual offline-first

### Principios

1. PostgreSQL y el backend son autoridad final.
2. El dispositivo recibe solo el subconjunto de tenant, rol, sección, curso y periodo autorizado.
3. Toda mutación offline es una operación inmutable en una outbox, no una escritura “confirmada”.
4. Ningún control local sustituye JWT/RBAC, validación pedagógica, cierres, auditoría o reglas de duplicidad del servidor.

### Persistencia local propuesta

Para Flutter móvil, usar **SQLite mediante Drift** (o `sqflite` si se prefiere menor abstracción), con migraciones versionadas. Drift aporta consultas tipadas, transacciones, streams y una capa testeable; SQLite encaja mejor que Hive para relaciones entre estudiantes, matrículas, asistencias, curso/periodo y colas.

Tablas conceptuales locales:

- `sync_metadata(scope, cursor, schema_version, last_success_at)`.
- `students`, `enrollments`, `sections`, `courses`, con `server_id`, `server_version`, `updated_at`, `deleted_at`.
- `attendance_read_model` y otros read models mínimos por rol.
- `outbox(operation_id UUID, idempotency_key, entity_type, entity_id UUID, base_version, action, payload_encrypted, occurred_at_device, state, attempt_count, next_retry_at, last_error)`.
- `inbox_receipts(operation_id, server_revision, acknowledged_at)` para evitar reprocesamiento.

Cuando el soporte lo permita, cifrar la BD con SQLCipher; guardar la clave en Android Keystore/iOS Keychain mediante secure storage. No guardar secretos de servidor ni claves JWT firmantes. El access token vive en memoria; refresh/credencial de dispositivo, si se autoriza, en almacenamiento seguro, con rotación y revocación.

### Flujo de sincronización

```text
login online -> servidor calcula scopes -> descarga snapshot/cursor
acción offline -> transacción SQLite: cambio local + outbox UUID
conectividad -> backoff con jitter -> POST /sync/push (lote idempotente)
servidor -> revalida token, tenant, rol, regla y base_version
         -> commit de dato + auditoría + receipt en una transacción
cliente <- accepted/rejected/conflict + nuevo cursor/version
cliente -> marca ACK solo tras respuesta; conserva rechazados/conflictos
cliente -> GET /sync/pull?cursor=... -> aplica cambios/tombstones atómicamente
```

### Contrato mínimo de sync

- UUID v4/UUIDv7 generado en dispositivo para operación y entidad nueva.
- `Idempotency-Key` única y tabla server-side con respuesta previamente confirmada.
- `baseVersion`/ETag por entidad; actualización condicional y HTTP 409 con estado servidor.
- Cursor opaco y monotónico por scope; no depender exclusivamente del reloj del teléfono.
- Tombstones con retención suficiente para clientes que pasan días offline.
- Respuesta por operación: `accepted`, `duplicate`, `rejected`, `conflict`, con código estable y revisión.
- Reintentos para timeout/5xx/429; no reintentar automáticamente 400/403/422/409 sin intervención o nueva base.

### Política de conflictos

- Asistencia de ingreso: deduplicar por operación y regla institucional; preservar ambos eventos ambiguos para revisión, no Last-Write-Wins ciego.
- Ediciones simples no críticas: versión optimista; permitir rebase si campos distintos y la política lo autoriza.
- Calificaciones: nunca LWW. Mostrar conflicto, conservar borrador local y exigir recarga/decisión autorizada.
- Cierres/publicaciones/rectificaciones: exclusivamente online y transaccionales.
- Eliminaciones: preferir baja lógica; propagar tombstone. Purga física solo por política de retención y proceso servidor.

### Qué puede operar offline

| Clase | Ejemplos | Política inicial |
|---|---|---|
| Modificable offline | Marcaciones de asistencia/portería y toma de lista del aula asignada | Primer MVP; cola durable, idempotencia y revisión de anomalías |
| Modificable offline condicionado | Borradores de notas/conclusiones del docente asignado | Fase posterior; nunca publicar/cerrar; conflicto explícito |
| Solo lectura offline | Nómina mínima, horario, secciones asignadas, configuración de escala, resumen propio publicado | Snapshot con TTL, watermark y minimización |
| Obligatoriamente online | Login inicial, refresh/revocación, roles/permisos, alta/baja masiva, cierre de periodo, publicación/rectificación de notas, exportaciones oficiales, auditoría, verificación documental y cambios institucionales | Servidor autoritativo y auditoría inmediata |

### Sesión, revocación y pérdida del dispositivo

- Asociar cada instalación a `device_id` y registro server-side revocable.
- Permitir lectura offline solo dentro de una ventana de confianza aprobada; después exigir reautenticación.
- Al logout, revocación, cambio de rol/tenant o cierre remoto: borrar claves y datos sensibles locales. Si no hay red, bloquear acceso local y enviar revocación al reconectar.
- MDM/remote wipe es una capacidad externa opcional; el sistema debe minimizar datos para reducir impacto si no existe.
- Reinstalación no debe “recuperar” una outbox sin confirmar desde backup inseguro. Las operaciones confirmadas se reconstruyen desde servidor; las no confirmadas pueden perderse y este riesgo debe explicitarse al usuario.

## 10. Evaluación de monorepo

### Hecho

El repositorio ya agrupa Flutter, dos backends Node y un portal Next sin coordinación. Moverlo ahora a `apps/web`, `apps/api`, `apps/mobile` rompería rutas documentales, imports, scripts, Vercel, rutas Flutter, DDL, CI futura y referencias relativas del SDD de Squad 3.

### Comparación

| Alternativa | Ventajas | Riesgos | Dictamen |
|---|---|---|---|
| Reorganización completa | Convención limpia, tooling central | Cambio masivo sin contratos estables; rompe referencias y despliegues; portal ni siquiera está confirmado en Git | No recomendada ahora |
| Incorporación progresiva | Mantiene Flutter raíz y rutas; permite estabilizar API/contratos primero | Estructura temporal menos estética | Recomendada |

Ruta de menor riesgo:

1. Mantener la raíz Flutter y `backend/` sin moverlos.
2. Resolver el estado de `las-condes-replica/` y decidir si se rastrea aquí o en otro repo.
3. Añadir en una fase autorizada un directorio de contratos (`contracts/` o paquete equivalente) con OpenAPI/JSON Schema, sin acoplar Dart a TypeScript.
4. Extraer un paquete Dart de dominio/API solo cuando web y móvil lo consuman realmente.
5. Evaluar workspace/Melos después de tener dos aplicaciones Flutter con ciclos de release separados.

## 11. Conservar, reutilizar, modificar, reorganizar y evaluar

### Conservar

- Arquitectura Feature-First y barrels públicos de los squads.
- `AppTheme`, interfaces de repositorio, modelos y pruebas de Squads 1/3.
- Diseño server-authoritative, transacciones, historial y RLS del backend Squad 3.
- PostgreSQL y Redis como infraestructura objetivo.
- UUID, versión optimista y auditoría inmutable como conceptos.
- Documentación RF/CU/RNF y trazabilidad, corrigiendo divergencias en vez de descartarla.

### Reutilizar

- Dominio Dart probado en el futuro cliente Flutter móvil.
- Controlador/matriz de Squad 3, adaptando UX móvil.
- Validadores de formato no sensibles; duplicar/validar siempre en servidor.
- Contratos y fixtures de M8 como semilla para especificación versionada.

### Modificar

- `lib/main.dart`: navegación por rol, autenticación global y composición distinta web/móvil.
- Squad 1: reemplazar `InMemoryStore`, JWT/hash/cifrado cliente y seeds por API real.
- Squad 2: implementar repositorios, SQLite, QR, conectividad y sync; hoy solo simula.
- Squads 4/5: conectar agregaciones/reportes server-side y aplicar permisos.
- Backend común: rutas funcionales, refresh seguro, rate limit efectivo, validación, observabilidad y módulos.
- `.gitignore`: cubrir secretos y artefactos después de decidir qué lockfiles sí se rastrean.
- Compose/despliegue: incluir servicios de aplicación y configuración sin credenciales literales.

### Reorganizar

- Unificar auth y configuración compartida de backends.
- Convertir contratos documentales en OpenAPI/JSON Schema ejecutable.
- Reconciliar DDL consolidado y migración M8; no mantener dos autoridades.
- Separar contenido público Next del panel administrativo Flutter si ambos son oficiales.
- Extraer dominio compartido solo tras demostrar dos consumidores.

### Evaluar para eliminación, sin eliminar

Los candidatos E de la matriz requieren build limpio, búsqueda dinámica, aprobación del propietario y plan de recuperación. Prioridad: artefactos generados/no ignorados; después archivo Home alterno y dependencias Next sin uso. No se recomienda eliminar ningún feature funcional.

## 12. Riesgos y bloqueos

| Severidad | Riesgo/bloqueo | Evidencia | Mitigación |
|---|---|---|---|
| Crítica | App móvil contradice alcance oficial | `limites_y_alcance_proyecto.md` prohíbe apps nativas | Acta de cambio de alcance y MVP aprobado |
| Crítica | Seguridad principal en cliente demo | `InMemoryStore`, secreto JWT y cifrado default en Dart | Backend auth real; nunca enviar claves al cliente |
| Crítica | Dos modelos de datos M8 | DDL consolidado vs schema `squad3`, UUID vs VARCHAR | ADR y migración canónica antes de datos reales |
| Alta | Datos de menores sin política offline aprobada | No existe clasificación/retención/revocación implementada | DPIA/criterios Ley 29733, minimización y cifrado |
| Alta | Backend común no implementa RF | Solo health montado | Modularizar endpoints por prioridad |
| Alta | Offline documentado pero inexistente | Sin paquetes de persistencia; Squad 2 simula contador | Prototipo técnico acotado con pruebas de corte/red |
| Alta | Secretos/artefactos pueden confirmarse | `.env` y `node_modules` sin rastrear/no ignorados | Higiene Git y secret scanning en fase autorizada |
| Alta | Portal público fuera de Git | `las-condes-replica/` entero sin rastrear | Decisión de propiedad, licencia, despliegue y repo |
| Media | CI/CD declarado pero ausente | No `.github/workflows` ni Dockerfiles | Pipeline mínimo reproducible |
| Media | Backend común declara Jest sin dependencia | `backend/package.json` | Elegir runner e incorporar pruebas al estabilizar módulo |
| Media | Formularios públicos no persisten | Next solo cambia estado local | API, consentimiento, anti-spam y privacidad antes de publicar |
| Media | Métricas de rendimiento no actuales | Validación histórica; profile falló por toolchain | Repetir en hardware objetivo y con servidor real |

## 13. Recomendaciones priorizadas

1. Aprobar o rechazar formalmente la fase móvil y sus actores; no tratar RF-27 como autorización implícita de una app nativa.
2. Definir “producto actual”: Flutter administrativo, portal Next y backend deben tener propietarios y estados (demo/beta/producción) explícitos.
3. Resolver Git: proteger `.env`, decidir lockfiles y portal, y separar artefactos generados sin tocar trabajo ajeno.
4. Seleccionar autoridad de base de datos y estrategia de migraciones; prohibir DDL paralelos incompatibles.
5. Completar autenticación/autorización en servidor antes de conectar datos reales.
6. Publicar contratos OpenAPI versionados y pruebas consumidor/proveedor Flutter–Node.
7. Implementar vertical slice de asistencia online, luego su outbox offline e incremental pull.
8. Reutilizar Flutter para móvil; empezar con Android interno/distribución controlada, no con tienda pública.
9. Añadir pruebas de seguridad, aislamiento tenant, idempotencia, revocación y pérdida de conectividad.
10. Posponer monorepo completo, analítica avanzada y offline de calificaciones hasta validar el núcleo.

## 14. Plan de implementación por fases

### F0 — Diagnóstico y decisiones

- **Objetivo:** cerrar alcance, producto oficial, roles móviles, datos offline y autoridad de esquema.
- **Dependencias:** dirección institucional, responsable Ley 29733, líderes de squads.
- **Afecta:** documentos de alcance/ADR; Git y backlog, no código funcional inicialmente.
- **Riesgo:** crítico por decisiones contradictorias.
- **Pruebas/evidencia:** inventario firmado, modelo de amenazas, matriz dato–rol–operación.
- **Aceptación:** alcance móvil autorizado; MVP y datos permitidos enumerados; portal y DDL canónicos decididos.
- **Detener si:** no hay responsable de datos, base legal, propietario del backend o decisión de esquema.

### F1 — Preparación mínima

- **Objetivo:** higiene Git, configuración segura, CI básica y backend común ejecutable/reproducible.
- **Dependencias:** F0.
- **Afecta:** `.gitignore`, manifiestos/lockfiles, env examples, pipeline, Compose/Docker; módulos backend.
- **Riesgo:** medio; no mezclar con refactor funcional.
- **Pruebas:** install limpio, analyze/test/check, secret scan, health Postgres/Redis.
- **Aceptación:** checkout limpio reproducible; ningún secreto rastreado; pipelines verdes.
- **Detener si:** aparecen secretos reales en historial o no puede reproducirse el build.

### F2 — Arquitectura compartida y servidor autoritativo

- **Objetivo:** auth/RBAC real, contratos versionados y modelo canónico.
- **Dependencias:** F1 y ADR de datos.
- **Afecta:** `backend/src/`, servicio M8, migraciones, adaptadores Flutter y nuevo artefacto OpenAPI.
- **Riesgo:** alto por seguridad/migración.
- **Pruebas:** contract, RLS/tenant, refresh/revocación, 401/403/409/422, migración y rollback.
- **Aceptación:** Squad 1/2 proveen contratos reales; M8 se aprovisiona sin mocks; no hay secretos cliente.
- **Detener si:** tenant puede cruzarse, migración pierde historial o reglas servidor/cliente divergen.

### F3 — Preparación móvil Flutter

- **Objetivo:** aplicación/entrypoint móvil por rol con repositorios abstractos, sin offline aún.
- **Dependencias:** F2 y alcance autorizado.
- **Afecta:** shell/navegación, composición, cliente API y paquetes Dart eventualmente compartidos.
- **Riesgo:** medio.
- **Pruebas:** Android real, accesibilidad, tamaños, deep links, sesión y permisos.
- **Aceptación:** login online y lectura autorizada funcionan; no se expone dashboard ajeno al rol.
- **Detener si:** se requiere duplicar reglas críticas o guardar credenciales inseguras.

### F4 — Persistencia local

- **Objetivo:** SQLite cifrado, esquema local, snapshots mínimos, outbox e inbox.
- **Dependencias:** F3 y política de datos.
- **Afecta:** repositorios locales, migraciones móviles, secure storage.
- **Riesgo:** alto por datos sensibles.
- **Pruebas:** migraciones, cifrado, almacenamiento lleno, cierre abrupto, logout/wipe, upgrade/downgrade soportado.
- **Aceptación:** lectura offline autorizada; ninguna escritura se marca sincronizada sin ACK.
- **Detener si:** datos quedan legibles fuera de app o no puede borrarse el scope revocado.

### F5 — Sincronización

- **Objetivo:** push/pull incremental para asistencia, idempotencia, conflictos y reintentos.
- **Dependencias:** F4 y endpoints server-side.
- **Afecta:** API `/sync`, tablas de operaciones/cambios/tombstones, worker móvil.
- **Riesgo:** crítico.
- **Pruebas:** duplicación, reordenamiento, reloj incorrecto, cortes en cada paso, token expirado, 409, 429, reinstalación.
- **Aceptación:** cero duplicados/pérdidas en batería reproducible; pendientes sobreviven reinicio; auditoría enlaza operación.
- **Detener si:** no existe idempotencia transaccional o se usa LWW para notas/asistencia ambigua.

### F6 — Integración funcional

- **Objetivo:** integrar matrícula/asistencia y luego módulos de solo lectura; evaluar borradores de notas.
- **Dependencias:** F5 estable.
- **Afecta:** Squads 2/3/4/5, WebSocket/Redis y reportes.
- **Riesgo:** alto.
- **Pruebas:** E2E por rol, carga, multi-instancia, privacidad de estudiante, versiones de API.
- **Aceptación:** flujo real con datos anonimizados y métricas acordadas; web no presenta regresiones.
- **Detener si:** los contratos cambian sin versión o las métricas exceden SLA.

### F7 — Validación y liberación controlada

- **Objetivo:** seguridad, recuperación, operación offline y piloto Android.
- **Dependencias:** F6.
- **Afecta:** todo el sistema, runbooks y soporte.
- **Riesgo:** crítico operacional.
- **Pruebas:** pentest, DPIA, pérdida de dispositivo, revocación, backup/restore servidor, caos de red, carga y regresión web.
- **Aceptación:** aprobación institucional, telemetría sin PII, rollback, soporte y capacitación.
- **Detener si:** hay fuga de datos, pérdida/duplicación, bypass RBAC o falta de plan de incidente.

## 15. Decisiones pendientes de autorización

1. Modificar el alcance que hoy prohíbe apps nativas.
2. Elegir Flutter móvil y canal de distribución Android (interno, MDM, APK firmado o tienda).
3. Definir actores y operaciones del MVP offline; recomendación: asistencia primero.
4. Aprobar retención, cifrado, reautenticación y borrado de datos de estudiantes.
5. Elegir DDL/migraciones canónicos y tipo definitivo de `tenant_id`.
6. Decidir si M8 permanece servicio separado o módulo del backend común.
7. Oficializar, mover o descartar `las-condes-replica/`; nunca borrarlo sin respaldo y autor.
8. Elegir almacenamiento de archivos y política de URLs firmadas.
9. Definir autoridad para reglas CNEB, decimales, primaria, conclusiones y conflictos.
10. Autorizar la futura limpieza de artefactos/dependencias candidatos E.
11. Definir SLA, dispositivos Android mínimos, periodo máximo offline y volumen por usuario.
12. Determinar si la PWA seguirá como canal complementario y qué capacidades se permitirán allí.

## 16. Conclusión

La inversión más segura no es crear inmediatamente una carpeta `mobile/`, sino cerrar contratos, datos, seguridad y sync en verticales pequeñas. El repositorio ofrece una ventaja real para Flutter móvil, especialmente en Squads 1 y 3, pero la mayoría del producto todavía es demostrativo y el backend compartido no implementa los RF declarados. La arquitectura objetivo debe conservar el servidor como autoridad, utilizar SQLite cifrado y una outbox idempotente en el dispositivo, y mantener separadas las interfaces web densas de las experiencias móviles por rol.

**Resultado de esta fase:** diagnóstico y recomendación únicamente. No se implementó ninguna fase, no se ejecutaron migraciones, no se modificó código de aplicación y no se eliminó ningún archivo.
