# F0 — Matriz de paridad Flutter → TypeScript/React

**Fecha de corte:** 17/10/2026 · **Base:** `dev` @ `06ddee3` · Solo lectura
**Plan asociado:** [`F0_PLAN_MIGRACION_TYPESCRIPT.md`](F0_PLAN_MIGRACION_TYPESCRIPT.md) · **Decisiones:** [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](F0_DECISIONES_ARQUITECTURA_PENDIENTES.md)

> **Revisión 1 (17/10/2026):** las pruebas citadas como "P" se reclasifican en cuatro clases:
> - **A:** autoritativas del backend (M8);
> - **B:** comportamiento de UI;
> - **C:** demos usadas como especificación, **no vinculantes**;
> - **D:** nuevas obligatorias de seguridad y persistencia (SEC-01…14, PER-01…06).
>
> Ver [`F0_CIERRE_OBSERVACIONES.md`](F0_CIERRE_OBSERVACIONES.md) §C3. Los criterios de aceptación de los Squads 1 y 3 se sustituyen por los de esa sección (resumidos abajo en cada squad). Las filas originales se conservan como trazabilidad.

## Convenciones

**Estado real** (verificado en el código, no en la documentación):

| Estado | Significado |
|---|---|
| **Implementado** | Lógica real con persistencia o servidor autoritativo y pruebas. |
| **Parcial** | Lógica real, pero sin servidor o con persistencia simulada. |
| **Demo** | UI y lógica funcionan sobre `InMemoryStore` o una semilla, con seguridad simulada en el cliente. |
| **Documental** | Solo existe en la especificación; la UI, si existe, es una maqueta con valores literales. |

> Una pantalla Demo **no** equivale a funcionalidad backend terminada. En las filas Demo y Documental, la "migración" es en realidad **implementación nueva en el servidor + UI React**. El comportamiento Flutter sirve como especificación de UX, no como prueba de corrección.

**Pruebas de equivalencia:** **P** = prueba existente reutilizable como oráculo; **N** = prueba nueva requerida.

---

## 0. Transversal

| # | Funcionalidad | Comportamiento actual (evidencia) | Estado | Contratos/datos | Esperado en React | Pruebas de equivalencia | Riesgos | Dependencias / aceptación |
|---|---|---|---|---|---|---|---|---|
| T1 | Shell y navegación | 6 pestañas por squad, accesibles sin sesión; guard de salida de planilla (`main.dart:43-69`) | Demo | — | Layout Next con navegación **por rol**; rutas protegidas por middleware; guard `beforeunload` y de navegación interna para cambios no guardados | P: `navigation_test.dart` ("navigation protects unsaved invalid grades") → N: Playwright equivalente | Exponer módulos sin rol | Requiere login F2. **Aceptación:** sin sesión no se accede a ninguna ruta del panel; el guard bloquea la salida con celdas inválidas o pendientes |
| T2 | Identidad visual | `AppTheme` (verde botella, azul UNSCH, colores CNEB) | Implementado (visual) | `lib/core/theme/app_theme.dart` | Tokens CSS con los **mismos hex**; contraste AA | N: snapshot de tokens (hex de Dart = hex de CSS) | Divergencia cromática | **Aceptación:** test automático de igualdad de tokens |
| T3 | Sobre JSON de API | `{success, data | error{code,message}, timestamp}` (`app.ts:19-22`) | Implementado (M8) | Contrato S1 agrega `statusCode` | Tipo `ApiEnvelope<T>` en `packages/contracts` | N: validación de esquema en cada respuesta | Las formas S1 y M8 difieren | Decidir la forma canónica en F1 |

---

## Squad 1 — Core y Seguridad (RF-01–RF-14, RF-65–RF-68)

Estado global: **Demo**. 68 archivos y 47 casos de prueba sobre `InMemoryStore`, con JWT, hash y AES en el cliente (comentados como demo en `jwt_codec.dart:6-11` y `password_hasher.dart:5-14`). El backend común no tiene ningún endpoint S1.

> **Revisión 1: clasificación y aceptación S1.**
> - Las 47 pruebas Flutter S1 son **clase C** (demo como especificación). Sus marcas "P" en la tabla indican intención funcional, **no oráculo vinculante**.
> - `jwt_codec_test` y `password_hasher_test` **no se trasladan**: prueban código que no debe existir en el cliente.
> - Única prueba **B** reutilizable: `squad_1_screen_test` (login visible sin sesión).
>
> **Aceptación vigente:**
> 1. Cada caso C se reescribe como prueba A sobre endpoints reales con PostgreSQL y Redis.
> 2. SEC-01…10, SEC-19, SEC-20 y PER-02, 03, 05 y 06 en verde.
> 3. Escaneo del bundle sin secretos ni cifrado o firma en el cliente.
> 4. E2E que fuerza la UI oculta y recibe 403 del servidor.
> 5. Pruebas B nuevas para React.
>
> S1.4 se rige por el modelo de rol activo de §C1 (sin selección automática del rol más privilegiado).

| # | Funcionalidad (RF) | Comportamiento actual (evidencia) | Estado | Contratos/datos | Esperado en React | Pruebas de equivalencia | Riesgos | Dependencias / aceptación |
|---|---|---|---|---|---|---|---|---|
| S1.1 | Login (RF-01) | Usuario/DNI + clave; access 15 min y refresh 7 d (`auth_repository_impl.dart:39-40`); 401 por clave errónea; rechaza bloqueados o inactivos; **5 intentos fallidos por IP en 15 min** | Demo | `POST /auth/login` (contrato S1: `tenantModularCode`, `username`, `password` → `accessToken`, `user`, cookie refresh); `usuarios`, `usuario_roles` | Formulario React (validación Zod) → endpoint real; access token en memoria o cookie de sesión del servidor Next; refresh en `HttpOnly` | P (como especificación): `auth_repository_impl_test` "emite tokens…", "rechaza contraseña incorrecta con 401", "bloquea tras 5 intentos…", "no bloquea… IP distinta", "rechaza cuentas bloqueadas" → N: mismas aserciones como pruebas HTTP del servidor | Rate limit en memoria → necesita Redis; enumeración de usuarios | F2 (auth en el servidor, bcrypt). **Aceptación:** los 5 casos pasan contra la API; login p95 < 500 ms (criterio RF-01) |
| S1.2 | Logout y expiración por inactividad (RF-02) | Revoca el `jti`; temporizador de inactividad que audita `sessionExpired` (`squad_1_scope.dart:82-96`, `session_activity_controller.dart`, `session_timer_widget.dart`) | Demo | `POST /auth/logout`; lista de revocación en Redis | Temporizador en el cliente + revocación en el servidor; aviso previo a la expiración | P: "revoca el access token…" → N: HTTP + E2E de inactividad con reloj simulado | Pestañas múltiples | **Aceptación:** un token revocado da 401; la inactividad cierra sesión y deja auditoría |
| S1.3 | Restablecer contraseña (RF-03) | Token de reset 30 min, uso único; política ≥ 8 caracteres con letras y números | Demo | Endpoints no definidos en `contratos_api.md` | Flujo de 2 pantallas | P: "un token expirado (+30 min)…", "…una sola vez", `validators_test` → N | Canal de entrega del token (correo) inexistente | Definir el canal. **Aceptación:** las 3 pruebas pasan en HTTP |
| S1.4 | RBAC (RF-04) | Matriz de 5 roles × N permisos en cliente (`role.dart:54+`); 403 para Portería al editar notas, **con auditoría** | Demo | Tres vocabularios de roles (DDL 11, Flutter 5, M8 5) | Autorización en el servidor (`requireRoles`); el cliente solo oculta UI con el mismo enum | P: `access_control_service_test` (3 casos) → N: matriz rol × endpoint en el servidor | **Divergencia de roles (N2)** | D-06. **Aceptación:** tabla de verdad rol × permiso idéntica en las pruebas del servidor y del cliente |
| S1.5 | Alta de usuarios (RF-05) | DNI único por tenant; cambio de clave obligatorio en el primer ingreso | Demo | `usuarios.estado = PENDIENTE_CAMBIO_CLAVE` | Formulario + endpoint | P: "rechaza un DNI duplicado…", "…exige cambio de clave…" → N | — | **Aceptación:** equivalencia de ambos casos |
| S1.6 | Importación masiva CSV/XLSX (RF-05) | Parseo en cliente; informe por fila (198/200, motivos) (`user_import_parser.dart`) | Demo | Formato del archivo no especificado | Carga en el servidor (multipart), validación en el servidor, vista previa del informe en React | P: "importa 198 filas válidas de 200…", "rechaza filas con DNI o correo…" → N con los **mismos archivos de fixture** | Archivos grandes; inyección CSV en la exportación | **Aceptación:** mismo informe para el mismo archivo |
| S1.7 | Edición, baja lógica y roles (RF-06, RF-07) | `updateRoles`, `updateProfile` | Demo | `usuario_roles` | Formulario + endpoint con auditoría de cambios | P: "actualiza el conjunto de roles…" → N | Escalada de privilegios | **Aceptación:** solo los roles autorizados reasignan; auditoría con antes/después |
| S1.8 | Directorio (RF-08) | Búsqueda paginada `searchDirectory` | Demo | Índice trigram `idx_usuarios_nombres_trgm` | Tabla con búsqueda en el servidor y paginación | N | Exposición de PII | **Aceptación:** campos sensibles enmascarados según el rol |
| S1.9 | Perfil (RF-09) | Ver y editar los datos propios y la clave | Demo | — | Página de perfil | N | — | — |
| S1.10 | Sedes y parámetros institucionales (RF-10) | CRUD de sedes; membrete (`letterhead_preview.dart`) | Demo | `instituciones`; **la sede actúa como tenant** en la semilla (`seed_data.dart`) | Formularios + vista previa del membrete | N | ¿Sede = tenant? Ambiguo | Aclarar el modelo de tenant (D-04) |
| S1.11 | Años y periodos (RF-11) | Un solo año activo por sede; periodo cerrado bloquea notas; bloqueo automático tras fecha límite + tolerancia | Demo | `anios_lectivos`, `periodos_academicos` | Formularios; las reglas, en el servidor | P: `academic_config_repository_impl_test` (3 casos) → N | **Interacción con M8** (`isClosed` usa `book.deadline`, no `periodos_academicos`) | **Aceptación:** una sola fuente de la fecha límite consumida por M8 |
| S1.12 | Grados y secciones (RF-12) | Aforo máximo respetado | Demo | `grados_secciones.aforo_maximo` | Formulario | P: "respeta el aforo máximo…" → N | — | — |
| S1.13 | Plan de estudios y competencias (RF-13) | **No implementado** (no existe tabla `cursos`) | Documental | `evaluaciones.curso_id` sin FK | Nuevo | N | M8 lo necesita para `provision.ts` | Requisito de F2 |
| S1.14 | Escala CNEB (RF-14) | `GradingScaleService.literalFor`: 15,6 → A; 18–20 AD, 11–13 B, 0–10 C; mínimo aprobatorio 11 | Demo | **Escalas divergentes**: S3 Flutter usa por defecto 17,5/13,5/10,5; M8 recibe la escala del proveedor | Configuración en el servidor; `literal()` en `packages/domain` | P: `grading_scale_service_test` (4 casos) + `domain.test.ts` "CNEB boundaries" → N: **fixture único de escala** | Fronteras con decimales (17,6; 13,5) | D-16. **Aceptación:** misma tabla de fronteras en Dart, TS servidor y TS cliente |
| S1.15 | Auditoría inmutable (RF-65) | Cadena SHA-256 por tenant; génesis `000…0`; detecta manipulación | Demo | `logs_auditoria` + trigger anti-UPDATE/DELETE (DDL) | Inserción en el servidor; visor React | P: `audit_service_test` (4 casos) → N: mismas aserciones sobre PG | Concurrencia en la cadena (dos inserciones simultáneas) | **Aceptación:** la verificación de cadena pasa; los inserts concurrentes se serializan |
| S1.16 | Historial de cambios (RF-66) | `ChangeHistoryEntry`, `change_timeline.dart` | Demo | No hay tabla genérica (M8 tiene `grade_audit_history`) | Visor | N | Dos historiales | — |
| S1.17 | Visor y exportación de auditoría (RF-67) | Filtros; exportación a PDF en el cliente (`pdf_exporter.dart`) | Demo | `GET /audit/logs` (contrato S1) | Tabla filtrable; PDF generado en el servidor | N | Volumen | — |
| S1.18 | Protección de datos (RF-68) | Enmascarado `987***321`; AES-256-CBC con **clave literal**; desenmascarado solo con `privacyUnmask` + motivo ≥ 5 caracteres, auditado | Demo | `ENCRYPTION_MASTER_KEY` (`.env`) | El cliente solo recibe valores enmascarados; desenmascarar = endpoint auditado. **El cifrado nunca ocurre en el cliente** | P: `data_protection_service_test` (5 casos) → N en el servidor | Clave filtrada en el historial (`data_protection_service.dart:19`) | **Aceptación:** ningún bundle del frontend contiene claves (escaneo del build) |
| S1.19 | Visor SDD (dev) | `sdd_viewer_screen.dart` | Demo | — | **No se migra** | — | — | Se retira con Flutter |

---

## Squad 2 — Matrícula y Asistencia (RF-15–RF-35)

Estado global: **Documental**. `squad_2_screen.dart` (248 líneas) contiene un simulador con `_localQueueCount = 42`, un texto QR literal y un toggle offline sin efecto real. No usa API, cámara, almacenamiento ni WebSocket. **No hay comportamiento que preservar**, salvo la intención de UX.

| # | Funcionalidad (RF) | Actual | Estado | Contratos/datos | Esperado en React | Pruebas | Riesgos | Aceptación |
|---|---|---|---|---|---|---|---|---|
| S2.1 | Padrón y matrícula (RF-15, RF-16) | — | Documental | `matriculas` (`UNIQUE tenant, año, estudiante`) | CRUD + asignación de sección | N | Sin endpoint | Endpoints S2 en F5 |
| S2.2 | Carga lectiva y practicantes (RF-17, RF-18) | — | Documental | **Sin tabla** de asignación docente-curso | Nuevo | N | M8 requiere `teacherId`/`practitionerIds` del proveedor S2 | Requisito de F2 para `provision.ts` |
| S2.3 | Nóminas (RF-19) | — | Documental | — | Vista + PDF | N | — | — |
| S2.4 | Asistencia en aula (RF-20, RF-27) | Texto "WebSockets" | Documental | `asistencias_alumnos` `UNIQUE(matricula_id, fecha)` | Toma rápida por sección; difusión WS | N | **N7: un solo evento por día** | Revisar la restricción antes de implementar |
| S2.5 | Kiosco de portería offline (RF-21, RF-25) | Simulador de escaneo y toggle "corte de red" | Documental | `POST /attendance/kiosk/scan`, `POST /attendance/sync-bulk` (sin idempotencia) | PWA kiosco: IndexedDB + outbox + `Idempotency-Key`; lector de código de barras como teclado | N: corte de red, duplicados, reloj desfasado, cierre abrupto | **N8**; el alcance exige < 200 ms y DoD de resiliencia | **Aceptación:** cero duplicados o pérdidas en una batería reproducible |
| S2.6 | Justificaciones y récord (RF-22, RF-23) | — | Documental | `justificada`, `observacion` | Nuevo | N | — | — |
| S2.7 | Alertas de ausentismo (RF-24) | — | Documental | Falta `vm_asistencia_mensual` (N5) | Nuevo | N | — | — |
| S2.8 | Carnés QR (RF-26) | Texto literal | Documental | `carnes_escolares.codigo_qr_token` | PDF generado en el servidor | N | El token del QR no debe contener PII | — |
| S2.9 | Practicantes y docentes contratados (RF-28–RF-35) | — | Documental | `asistencias_practicantes`; no hay tablas para M7 | Nuevo | N | — | — |

---

## Squad 3 — Calificaciones y Modo Excel (RF-36–RF-46)

Estado global: **Implementado** (backend M8 + cliente API) y **Demo** (en el shell, por N4). Es la única área con paridad estricta. Oráculos disponibles:
- **Flutter:** `test/squad_3/gradebook_test.dart` (8 casos), `api_grades_repository_test.dart` (2), `navigation_test.dart` (1) e `integration_test/squad_3_performance_test.dart` (1).
- **M8:** 16 casos en `backend/squad_3_calificaciones/test/`.

**Regla de oro:** React **no reimplementa** reglas de autorización, cierre ni publicación. Las previsualizaciones locales (literal y promedio) usan `packages/domain`, que re-exporta `domain.ts`. El servidor sigue siendo la autoridad.

> **Revisión 1: clasificación y aceptación S3.**
> - **Clase A:** las 16 pruebas de M8 (`domain`, `http`, `postgres` y `providers`).
> - **Clase B:** `gradebook_test` (debounce, entrada en vuelo, fallo o conflicto, TSV, entrada inválida, teclado y virtualización, 360 px), `navigation_test`, `api_grades_repository_test` e `integration_test/squad_3_performance_test`.
> - **Clase C:** "demo: supervised draft, publication, close and signed rectification" y los cálculos sobre `DemoGradesRepository`.
>
> **Aceptación vigente:**
> 1. Pruebas A en verde **sin modificar M8**.
> 2. Equivalentes React de todas las B en verde contra M8 real (no mocks).
> 3. SEC-04, 06, 07, 08, 10, 11, 12, 14 y SEC-15…22 a través del gateway (Revisión 2, C1.6 nivel 1). SEC-23…25 solo si se aprueba el nivel 2 en F2.
> 4. Benchmark D-10 aceptado.
> 5. La demo (C) no sirve como evidencia.

| # | Funcionalidad (RF) | Comportamiento actual (evidencia) | Estado | Contrato | Esperado en React | Pruebas de equivalencia | Riesgos | Aceptación |
|---|---|---|---|---|---|---|---|---|
| S3.1 | Cargar planilla | `GET /api/v1/grades/matrix?bookId=` → `view()` filtrada por rol (`app.ts:61-64`, `domain.ts:205-217`) | Implementado | Respuesta: `Book` + `summaries` + `competencySummaries` | `api-client.grades.load(bookId)` | P: `http.test.ts` → N: el cliente React contra el mismo servidor de prueba | — | Misma forma de respuesta validada por esquema |
| S3.2 | Matriz tipo Excel (RF-38) | Grilla virtualizada; flechas, Tab y Enter; edición; perfil con 5 000 estudiantes (`grade_matrix.dart`, `gradebook_test` "keyboard moves focus and matrix is virtualized for 5000 students") | Implementado (UI) | — | Grilla DOM virtualizada (filas y columnas) con roving focus y ARIA grid | P → N: Playwright de teclado; benchmark de 5 000 filas × 40 evaluaciones | **Rendimiento DOM frente a canvas (RF-38: 60 FPS)** | D-10. **Aceptación:** scroll y edición sin frames > 16 ms en el hardware objetivo del aula |
| S3.3 | Pegado TSV | Valida el bloque completo; admite CRLF; rechaza desbordes (`gradebook_controller.dart:115`) | Implementado | — | Manejador `onPaste` con la misma validación atómica | P: "TSV validates whole block; supports CRLF and rejects overflow" → N | Diferencias del portapapeles entre navegadores | Mismos fixtures TSV, mismo resultado |
| S3.4 | Autoguardado con debounce (RF-45) | 400 ms; "saved" solo tras éxito del repositorio; una entrada nueva durante un guardado en vuelo sobrevive a la respuesta antigua; reintento `1 << n` s para retryables (`gradebook_controller.dart:107-189`) | Implementado | `PATCH /api/v1/grades/batch {bookId, revision, items[]}` | Máquina de estados idéntica (`idle/pending/saving/saved/error/conflict`) como lógica pura reutilizable | P: "debounce is 400ms…", "new input during an in-flight save survives…", "failed and conflicted saves retain local input…" → N: las mismas con temporizadores falsos (Vitest) | Condiciones de carrera con React 19 (transiciones) | **Aceptación:** las 3 pruebas replicadas pasan |
| S3.5 | Conflicto de versión | 409 `VERSION_CONFLICT` → estado `conflict`, sin reintento; conserva la entrada local (`store.ts:148`) | Implementado | `revision` por planilla | UI de conflicto: "recargar / descartar"; nunca sobrescribir | P: "409 is a conflict, 422 is not retried, and 503 is retryable", `domain.test` "store rejects stale revisions…" → N | — | Mismo trío 409/422/503 |
| S3.6 | Conversión vigesimal ↔ literal (RF-46) | `parseGrade`: 0–20 con ≤ 2 decimales, coma o punto; AD/A/B/C → 19/15/12/8 | Implementado | `Scale {ad,a,b}` | Previsualización con `packages/domain.parseGrade` | P: `domain.test` "CNEB boundaries…", `gradebook_test` "conversion, range and non-finite rejection" → N | **N11**: escalas por defecto distintas | Fixture de escala único |
| S3.7 | Promedios (RF-41) | Ponderado parcial; redondeo solo al final del periodo; incompleto = `null` (no 0); primaria = literal predominante (`domain.ts:62-76`) | Implementado | `summaries` en la respuesta | Mostrar los valores **del servidor**; previsualización local opcional | P: "weighted partial, final-only rounding, incomplete is not zero", "weighted means, missing grades, final-only rounding and primary mode" | Redondeo de 0,5 (Dart `round()` frente a JS `Math.round` coinciden para positivos) | Igualdad numérica con el fixture |
| S3.8 | Evaluaciones y rúbricas (RF-36) | Acción `evaluation`: peso 0–100, máximo 40, competencia oficial | Implementado | `POST /api/v1/grades/actions {action:'evaluation'}` | Diálogo de alta | P: `domain.test` → N E2E | N6 (peso en el DDL) | — |
| S3.9 | Practicantes: borradores (RF-40) | Practicante → `draft` con `previous`; docente `approve`/`reject` restaura (`domain.ts:93-123`) | Implementado | Acciones `approve`/`reject` | Indicador de borrador por celda; panel de aprobación | P: "reject practitioner changes restores teacher value…", "demo: supervised draft, publication…" | — | Mismos estados visibles |
| S3.10 | Conclusiones (RF-39) | Obligatorias para B/C; ≤ 500 caracteres; banco por competencia | Implementado | Acción `conclusion`; `conclusionBank` | Asistente con sugerencias del banco | P: "B/C conclusions are mandatory…" | — | — |
| S3.11 | Publicación (RF-37) | Requiere todo aprobado y las conclusiones; captura `publishedGrades` | Implementado | Acción `publish` | Botón con verificación previa (el servidor valida) | P: "published snapshot and student isolation" | — | — |
| S3.12 | Cierre (RF-42) | Director o coordinador; completo y aprobado; también por `deadline` | Implementado | Acción `close` | Acción con confirmación | P: "expired periods reject edits…" | Fuente de la fecha límite (S1.11) | — |
| S3.13 | Rectificación (RF-43) | Solo con el periodo cerrado; evidencia; una pendiente por celda; el director decide con firma; **sin autoaprobación**; `STALE_GRADE` | Implementado | Acciones `rectification`/`decide` | Formulario + bandeja del director | P: "rectification requires evidence, director signature…", "rectification to B/C requires…" | — | — |
| S3.14 | Vista del estudiante (RF-44) | Solo lo publicado y propio; sin docente ni practicantes (`domain.ts:208-213`) | Implementado | `view()` con rol `student` | Página "Mis notas" | P: "published snapshot and student isolation" → N E2E de aislamiento | Fuga entre estudiantes | **Aceptación:** un estudiante nunca ve otra matrícula (prueba negativa) |
| S3.15 | Resumen anual | `GET /grades/annual`; `null` hasta que todos los periodos esperados estén cerrados; políticas weighted, predominant y latest | Implementado | `annualSummary` | Vista anual | P: "annual remains incomplete until all configured periods close" | — | — |
| S3.16 | Tiempo real | WS `/api/v1/grades/live`; autenticación en el primer mensaje en ≤ 5 s; evento `GRADE_UPDATED` → recarga; cierre al expirar el token (`app.ts:83-106`) | Implementado | Mensaje `{token, bookId}` | Hook WS con reconexión y recarga | P: `http.test.ts` → N | Un solo proceso (sin Redis pub/sub) | Multiinstancia en una fase posterior |
| S3.17 | Selector de rol demo | Cambio de rol en la demo (`squad_3_screen.dart:110-121`) | Demo | — | **No se migra** | — | — | — |
| S3.18 | Aprovisionamiento | CLI `provision.ts` desde URLs S1/S2 | Implementado (sin proveedores reales) | `SQUAD1_SCALE_URL`, `SQUAD2_ROSTER_URL` | No es UI | P: `providers.test.ts` | Proveedores inexistentes | F2 |

---

## Squad 4 — Analítica y Dashboards (RF-47–RF-58)

Estado global: **Documental**. `squad_4_screen.dart` (217 líneas) muestra un heatmap con constantes y "Reset Zoom".

| # | Funcionalidad | Estado | Contratos/datos | Esperado en React | Pruebas | Riesgos | Aceptación |
|---|---|---|---|---|---|---|---|
| S4.1 | Mapas de calor y drill-down (RF-47–RF-51) | Documental (constantes) | `vm_rendimiento_seccion` (sobre `calificaciones`, **no** sobre `squad3`); `vm_asistencia_mensual` **no existe** | Agregaciones en el servidor; heatmap SVG o canvas (biblioteca por decidir, D-17) | N: fixtures de agregación con resultados conocidos | **La vista lee el modelo de notas que M8 no usa** (K1) | Datos de M8 reflejados en la vista |
| S4.2 | Tableros por rol (RF-52–RF-55) | Documental | — | Nuevo | N | — | — |
| S4.3 | Ficha 360° (RF-56) | Documental | — | Radar chart | N | PII | Acceso solo a tutores y dirección |
| S4.4 | Métricas SSU (RF-57) | Documental; semilla `metricas_impacto_ssu` | Tabla sin `tenant_id` | Nuevo | N | — | — |
| S4.5 | Alertas de deserción (RF-58) | Documental | — | Nuevo | N | — | — |

---

## Squad 5 — Secretaría y Portal (RF-59–RF-64, RF-69–RF-71)

Estado global: **Documental**. `squad_5_screen.dart` (212 líneas) presenta un campo hash con resultado fijo "DOCUMENTO AUTÉNTICO" y botones sin acción.

| # | Funcionalidad | Estado | Contratos/datos | Esperado en React | Pruebas | Riesgos | Aceptación |
|---|---|---|---|---|---|---|---|
| S5.1 | Libretas PDF (RF-59), actas (RF-62), cuadro de mérito (RF-61) | Documental | `documentos_emitidos` | PDF en el servidor (biblioteca por decidir); descarga autorizada | N: PDF determinista + hash | Fidelidad del formato MINEDU | — |
| S5.2 | Verificación pública QR (RF-60) | Documental (resultado literal) | `GET /api/v1/public/verify/:token`; `hash_sha256`, `metadata_snapshot_json` | Página pública en el portal Next, sin autenticación, **sin PII** más allá de lo mínimo | N: token válido, revocado, inexistente y manipulado | Enumeración de tokens; fuga de datos | Rate limit + tokens de 256 bits |
| S5.3 | Exportación PDF/Excel (RF-63, RF-64) | Documental | — | En el servidor | N | Inyección de fórmulas CSV | — |
| S5.4 | Cartelera y calendario (RF-69, RF-70) | Documental | `comunicados_cartelera` | Portal + panel | N | — | — |
| S5.5 | Portal institucional (RF-71) | **Next.js existente sin rastrear** (`las-condes-replica/app/*`, 10 rutas) | Ninguno (estático) | Portal Next oficializado (D-08) | N: build + Lighthouse + accesibilidad | Derechos de las imágenes; README de "réplica" | Decisión de propiedad |
| S5.6 | Intranet del portal | Login visual sin backend (`app/intranet/page.tsx:27-37`) | Documental | Ninguno | Enlace al login real del panel | N | Simula autenticación | Quitar el login falso |

---

## Backends: paridad de contratos (no de UI)

| # | Elemento | Estado | Acción de paridad |
|---|---|---|---|
| B1 | `GET /api/v1/health` (común) | Implementado | Conservar; ocultar `e.message` |
| B2 | `GET /health` (M8) | Implementado | Conservar |
| B3 | `authenticateJwt` común frente a `authenticate` de M8 | Divergentes (N3) | Claims superconjunto; prueba cruzada: un token de F2 aceptado por ambos |
| B4 | Rutas alias de M8 (`batch-save`, `auto-save`, `batch-upsert`) | Implementado (`app.ts:66`) | Documentar como alias **obsoletos** en OpenAPI; el cliente React usa solo `/batch` |

---

## Orden de migración y acta de equivalencia

1. **S3** (F3): 18 filas, 12 con oráculo P existente.
2. **S1** (F4): 19 filas, todas Demo. El servidor se construye guiándose por las 47 pruebas Dart.
3. **S2** (F5), **S4/S5** (F6): implementación nueva; no hay paridad que demostrar, solo criterios RF.

**Plantilla de acta de equivalencia por módulo** (condición para retirar Dart en F7):
- [ ] Todas las filas P del módulo tienen su prueba N equivalente en verde en CI. *(Revisión 1: solo las clases A y B son vinculantes; las C se reescriben como A)*
- [ ] Las pruebas D aplicables del módulo (SEC/PER) están en verde. *(Revisión 1)*
- [ ] E2E Playwright por rol en verde contra el backend real (no contra mocks).
- [ ] Sin reglas críticas nuevas en el cliente (revisión de código).
- [ ] Benchmark de rendimiento aceptado (solo S3).
- [ ] Prueba con usuarios: al menos un docente y un coordinador usaron React una semana sin volver a Flutter.
- [ ] Firmas: líder del squad y líder del proyecto.
