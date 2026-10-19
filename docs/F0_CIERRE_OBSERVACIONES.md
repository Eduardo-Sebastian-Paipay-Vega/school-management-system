# F0 — Cierre de observaciones de revisión

**Fecha:** 17/10/2026 · **Base:** `dev` @ `06ddee3` (sin cambios desde F0)
**Modalidad:** documental. No se modificaron código, ramas, secretos ni datos.
**Corrige:** [`F0_PLAN_MIGRACION_TYPESCRIPT.md`](F0_PLAN_MIGRACION_TYPESCRIPT.md), [`F0_MATRIZ_PARIDAD_FLUTTER_REACT.md`](F0_MATRIZ_PARIDAD_FLUTTER_REACT.md), [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](F0_DECISIONES_ARQUITECTURA_PENDIENTES.md). Cada uno lleva ahora una sección "Revisión 1" que remite a este documento.
**Relacionados:** [`F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md`](F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md), [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md)

---

## 0. Verificaciones adicionales realizadas (mínimas, solo lectura)

| Verificación | Resultado | Uso |
|---|---|---|
| Escrituras sobre `calificaciones`, `evaluaciones` y `conclusiones_descriptivas` en `backend/`, `lib/` y `database/` | **Ninguna.** Tampoco hay `REFRESH MATERIALIZED VIEW` en el código | C2: hoy no existe doble escritura; basta congelar esas tablas |
| `backend/.env` frente a `backend/.env.example` (comparación por clave, sin imprimir valores) | `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET` y `ENCRYPTION_MASTER_KEY` son **idénticos** a los del example rastreado | F1-A: el `.env` local no contiene credenciales distintas de las ya públicas, pero esos valores deben tratarse como comprometidos |
| Historial de Git de `*.env` | Ningún `.env` fue confirmado nunca | F1-A: no hace falta limpiar el historial por `.env` |
| `git ls-files --eol` | 444 archivos con `i/lf w/crlf` (normal con `autocrlf=true`); los 7 registrantes tienen `i/lf w/lf`; **1 archivo con CRLF en el índice**: `D - Base 1 - 01092026/Fase 1/limitaciones.md` | F1-A: no introducir `.gitattributes` global (ver F1-A §4) |
| Reglas `.gitignore` propuestas frente a archivos rastreados (`git ls-files -ci`) | **Cero** archivos rastreados afectados | F1-A: el ignore propuesto no oculta fuentes |
| Coherencia `package.json` ↔ `package-lock.json` (lockfile v3) | `backend/`, `squad_3_calificaciones/` y `las-condes-replica/`: sin discrepancias | F1-A: `backend/package-lock.json` es apto para rastrearse, pendiente de `npm ci` |
| Herramientas locales | Node 26.2.0, npm 11.13.0, Flutter 3.35.4. Sin gitleaks ni trufflehog | F1-A: el escaneo de secretos requiere autorización para obtener la herramienta |

---

## C1 — Identidad y JWT (sustituye la propuesta de claims superconjunto)

### C1.1 Por qué se retira la propuesta anterior

La propuesta F0 tenía dos componentes, y los dos se retiran.

**(a) Un token con claims duplicados** (`tenant_id` + `tenantId`, `role` + `roles[]`) aceptado por los dos verificadores:
- Un mismo token valdría para cualquier servicio que comparta el secreto. El backend común no valida `aud` ni `iss` (`backend/src/middlewares/auth.middleware.ts:38`), así que aceptaría tokens destinados a M8, y viceversa si coincide el secreto.
- La duplicación de claims abre ambigüedad: ¿qué ocurre si `tenant_id ≠ tenantId`?

**(b) Selección automática del rol más privilegiado** para M8:
- En M8, `director` y `coordinator` tienen acceso **a todas las planillas del tenant** (`domain.ts:56`).
- Un usuario `DOCENTE` + `COORDINADOR_ACADEMICO` que abre su propia planilla pasaría a operar como coordinador sin pedirlo. Es una escalada implícita de privilegios y además altera la autoría (`authorId`) y las reglas de flujo, porque solo `teacher` publica y solo `director` decide.

### C1.2 Modelo canónico propuesto

| Elemento | Definición canónica | Fuente persistente |
|---|---|---|
| **Identidad** | `sub` = `usuarios.id` (UUID v4, texto). Nunca DNI ni username | `usuarios` (DDL consolidado) |
| **Tenant** | `tenant_id` = `instituciones.id` (UUID en texto). **La sede no es tenant**; es un atributo (`sede_id`) cuando aplique | `instituciones` |
| **Roles otorgados** | Conjunto de `rol_usuario_enum` en `usuario_roles`. **No viajan completos** en el token de los servicios | DDL `:18-30` |
| **Rol activo** | Un solo rol, **elegido explícitamente por el usuario** al iniciar sesión o con "cambiar de perfil", validado por el servidor contra los roles otorgados. Cada cambio queda auditado | Sesión del servidor |
| **Permisos** | Derivados en el servidor de `(rol activo, recurso, asignación)`. El cliente recibe una lista de permisos **solo para mostrar u ocultar UI** | Catálogo `Permission` (por definir en contratos F1-B) |
| **Sesión** | `sid` (sesión del servidor) y `jti` (token), revocables en Redis | Redis |

### C1.3 Tokens por audiencia (en lugar de un token universal)

| Token | Emisor | `aud` | Claims | Vida | Uso |
|---|---|---|---|---|---|
| Access core | Backend común (F2) | `sms-core` | `sub`, `tenant_id`, `active_role`, `sid`, `jti`, `iss`, `iat`, `exp` | ≤ 15 min | API del backend común |
| Access M8 *(corregido, Revisión 2)* | **Gateway** del backend común, acuñado internamente en cada solicitud o conexión tras validar la sesión core | `sms-grades` | `sub`, `tenant_id`, `role` (rol M8 **mapeado del rol activo**), `sid`, `jti`, `iss`, `iat`, `exp` | **≤ 60 s** | Solo tráfico gateway → M8. **Nunca se entrega al cliente** (ver C1.6) |
| Refresh | Backend común | `sms-refresh` | `sub`, `sid`, `jti` | 7 días, rotativo | Web: cookie `HttpOnly`. Móvil futuro: almacén seguro (D-07) |

**Compatibilidad con M8 sin modificar su verificador:**
- M8 exige `sub` UUID, `tenant_id` string de 1 a 50 caracteres, `role` válido, `iss` y `aud` configurados, `exp` e `iat`.
- Un UUID en texto mide 36 caracteres y cumple el límite, así que el token "Access M8" satisface `authenticate()` (`app.ts:9-18`) **sin cambios**.
- Basta configurar `JWT_ISSUER` y `JWT_AUDIENCE=sms-grades` en M8 y **un secreto distinto** del core. `jose` acepta claims adicionales, así que `sid` y `jti` no rompen el verificador actual.

> **Precisión (Revisión 2):** "sin cambios" se refiere a la **verificación de firma, audiencia y claims**. M8 **no** comprueba revocación: no consulta `sid`/`jti` ni Redis. La revocación efectiva con M8 sin modificar depende del gateway y del aislamiento de red (C1.6, nivel 1). La revocación dentro de M8 es una **propuesta F2 que modifica M8** (C1.6, nivel 2).

**Compatibilidad con el backend común sin modificar su verificador:**
- No hace falta: hoy no tiene rutas protegidas (solo `/health`).
- El verificador se actualizará en F2, al crear las primeras rutas, para exigir `aud=sms-core`, `iss` y `algorithms:['HS256']` y para leer `tenant_id` y `active_role`.
- Hasta entonces **no se modifica**, como pide esta revisión.

**Mapa rol activo → rol M8** (sin fallback hacia arriba):

| Rol activo canónico | `role` M8 | Observación |
|---|---|---|
| `DOCENTE`, `DOCENTE_CONTRATADO` | `teacher` | M8 exige además `book.teacherId === sub` |
| `TUTOR_AULA` | — (sin acceso de escritura) | Hasta definir si es una asignación (ver acta) |
| `PRACTICANTE` | `practitioner` | M8 exige `practitionerIds ∋ sub` |
| `COORDINADOR_ACADEMICO` | `coordinator` | Acceso a todo el tenant: solo si es el rol activo |
| `DIRECTIVO` | `director` | Ídem |
| `ESTUDIANTE` | `student` | Solo lo publicado y propio |
| `SUPERADMIN`, `SECRETARIA`, `AUXILIAR`, `PORTERIA` | **No se emite token M8** | El intercambio responde 403. `SUPERADMIN` **no** equivale a `director` |

### C1.4 Validación por recurso y operación

1. **Autenticación:** firma, `alg` fijo, `iss`, `aud` de su audiencia, `exp`, revocación de `jti`/`sid`.
2. **Tenant:** el tenant **solo** sale del token; se ignora cualquier `tenantId` en el cuerpo o la consulta. M8 ya lo hace (`store.ts:132`, prueba "ownership and tenant boundaries cannot be supplied in request body"). En PostgreSQL, además, `set_config('app.tenant_id')` + RLS con rol no propietario.
3. **Rol:** `requireRoles` sobre el rol **activo**, no sobre la unión de roles otorgados.
4. **Asignación del recurso:** pertenencia a la sección, curso o planilla (como `authorize()` de M8). Se aplica a cada recurso, también en listados.
5. **Estado del recurso:** periodo cerrado, publicación, autoaprobación, versión.
6. **Auditoría:** cada 401/403 y cada cambio de rol activo genera un registro en `logs_auditoria`.

### C1.5 Pruebas obligatorias (nuevas; se implementan en F2)

| ID | Caso | Resultado esperado |
|---|---|---|
| SEC-01 | Token `aud=sms-grades` presentado al core, y viceversa | 401 |
| SEC-02 | Token firmado con el secreto del otro servicio | 401 |
| SEC-03 | `alg: none` / `alg: HS512` / `alg: RS256` con clave pública como secreto | 401 |
| SEC-04 | Usuario `DOCENTE`+`COORDINADOR` con rol activo `DOCENTE` abre una planilla ajena | 403 (no se eleva a coordinador) |
| SEC-05 | Cambio de rol activo a un rol no otorgado | 403 + auditoría |
| SEC-06 | `SUPERADMIN` solicita intercambio a M8 | 403 |
| SEC-07 | `tenant_id` del cuerpo o la consulta distinto del token | Ignorado; acceso solo a su tenant |
| SEC-08 | Token del tenant A con `bookId` del tenant B | 404/403 sin filtrar existencia |
| SEC-09 | Sesión de BD sin `app.tenant_id` (rol no propietario) | 0 filas (RLS) |
| SEC-10 *(precisada, Revisión 2)* | Sesión revocada (`logout`, revocación administrativa o cambio de rol): (a) siguiente solicitud REST vía gateway; (b) WS ya abierto vía gateway | (a) 401 en la **primera** solicitud posterior (no al expirar); (b) cierre del WS cliente en ≤ 2 s y cierre del WS upstream a M8. Medido con reloj real, no simulado |
| SEC-11 | Estudiante solicita `matrix` y `annual` de otra matrícula | Solo datos propios publicados |
| SEC-12 | Practicante intenta `publish`, `approve` o `close` | 403 |
| SEC-13 | Director decide su propia rectificación | 403 `SELF_APPROVAL` (ya cubierto en M8) |
| SEC-14 | Token con `exp` superior a 30 min frente a M8 | 401 (`maxTokenAge`) |
| SEC-15 | Respuestas del gateway (login, refresh y cualquier endpoint) y bundle web | No contienen ningún JWT con `aud=sms-grades` |
| SEC-16 | Token core (`aud=sms-core`) presentado **directamente** a M8, por REST y por WS | 401 / cierre 1008 |
| SEC-17 | Conexión directa al puerto de M8 desde fuera de la red interna (prueba de despliegue) | Conexión rechazada o inalcanzable |
| SEC-18 | Token M8 interno capturado y reutilizado 61 s después de emitido | 401 (`exp ≤ 60 s`) |
| SEC-19 | Pérdida de un rol otorgado o cambio de rol activo | Todas las sesiones con ese rol activo se revocan; sus WS se cierran (como SEC-10b) |
| SEC-20 | Redis (almacén de sesiones) no disponible | El gateway **falla cerrado**: 503 en REST y rechazo de nuevos WS; nunca acepta sin verificar |
| SEC-21 | Revocación emitida en la instancia A del gateway con el WS abierto en la instancia B | Cierre en B en ≤ 2 s (pub/sub) |
| SEC-22 | WS upstream cerrado por M8 (expiración ≤ 60 s, `app.ts:99`) | El gateway re-suscribe **solo** si `sid` sigue válido; en caso contrario cierra el WS cliente |
| SEC-23 *(F2, requiere modificar M8)* | `jti`/`sid` en la lista de revocación presentado directamente a M8 | 401 aun sin pasar por el gateway |
| SEC-24 *(F2, requiere modificar M8)* | Revocación publicada mientras M8 mantiene una suscripción WS directa con ese `sid` | M8 cierra la conexión en ≤ 2 s |
| SEC-25 *(F2, requiere modificar M8)* | Retirada de la asignación docente o practicante (`teacherId`/`practitionerIds`) | 403 en REST y cierre del WS en la siguiente re-suscripción (≤ 60 s) o inmediato con el nivel 2 |

### C1.6 Revocación de sesiones y tokens M8 (Revisión 2)

**Problema:**
- Un JWT HS256 es válido hasta su `exp`, y una expiración corta **no** equivale a revocación inmediata.
- M8 (`app.ts:9-18`) no consulta `sid`, `jti` ni ningún almacén de revocación.
- Sus suscripciones WS solo se re-autorizan cuando M8 las cierra, cada ≤ 60 s (`app.ts:99`).

**Nivel 1: compatible con M8 sin modificarlo** (F2, cambios solo en el backend común y en el despliegue).

1. **Sesión autoritativa en el servidor.** Cada login crea `sid` en Redis (`session:{sid}` → `sub`, `tenant_id`, `active_role`, estado y versión de permisos) con TTL igual al del refresh. Cada access core lleva `sid` y `jti`.
2. **Revocación.**
   - `logout`, una revocación administrativa, un cambio de contraseña, la pérdida de un rol o un cambio de rol activo **borran o marcan** `session:{sid}` y añaden `jti` a `revoked:{jti}` con TTL igual a su `exp`.
   - Un solo evento se publica en el canal Redis `session-revoked` (`{sid}`).
3. **Validación por solicitud en el gateway.** Antes de reenviar **cualquier** solicitud a M8, el gateway verifica:
   - el token core: firma, `alg`, `iss`, `aud=sms-core`, `exp`;
   - la existencia y vigencia de `session:{sid}` y la ausencia de `revoked:{jti}`;
   - **falla cerrado** si Redis no responde.

   Así la revocación es efectiva desde la siguiente solicitud.
4. **Token M8 interno.**
   - El gateway acuña un token `aud=sms-grades` con `sid` y `jti` propios y `exp ≤ 60 s`, solo para la llamada o la conexión upstream.
   - Usa un secreto **exclusivo** del par gateway–M8.
   - **El cliente nunca lo recibe** (SEC-15), así que no puede reutilizarlo ni dirigirlo a M8.
5. **WebSocket con terminación en el gateway.**
   - El cliente abre el WS contra el gateway y se autentica con su token core en el primer mensaje: el mismo protocolo `{token, bookId}` que hoy usa M8.
   - El gateway abre la conexión upstream con el token interno y retransmite `SUBSCRIBED`/`GRADE_UPDATED`.
   - Mantiene un índice `sid → conexiones` y está suscrito a `session-revoked`. Al recibir un `sid` revocado, cierra el WS cliente (código 4401) y el upstream.
   - Cuando M8 cierra el upstream por expiración (≤ 60 s), el gateway re-suscribe **solo** si la sesión sigue vigente (SEC-22).
6. **Impedir el acceso directo a M8.**
   - M8 escucha en `127.0.0.1` por defecto (`server.ts:10`, `HOST ?? '127.0.0.1'`). En el despliegue, M8 corre en la red privada del gateway, **sin puerto publicado**, y con `HOST` restringido a esa interfaz.
   - Su secreto `sms-grades` no lo comparte ningún otro componente.
   - Un token core enviado a M8 falla por `aud` (SEC-16).
7. **Revocación de permisos sin cerrar sesión.** Un cambio de roles otorgados incrementa la versión de permisos de la sesión; el gateway la compara en cada solicitud y, si cambió, revoca y obliga a re-seleccionar el rol (SEC-19).
   - **Limitación del nivel 1:** la **asignación** a una planilla vive en el agregado M8 (`teacherId`, `practitionerIds` en `state`). Retirarla requiere actualizar ese agregado, y M8 no ofrece hoy una acción para hacerlo (solo `provision.ts` al crear la planilla).
8. **Riesgo residual del nivel 1:** si la red se configura mal y M8 queda expuesto, un token interno filtrado sería válido como máximo 60 s, y M8 no cerraría las suscripciones directas. Por eso SEC-17 es una prueba **obligatoria** de despliegue.

**Nivel 2: defensa en profundidad dentro de M8** (propuesta F2, **requiere modificar M8**; no es compatibilidad sin cambios).

| Cambio propuesto en M8 | Archivo | Efecto | Prueba |
|---|---|---|---|
| `requiredClaims` + `sid`, `jti`; rechazar `exp - iat > 60 s` | `src/app.ts` (`authenticate`) | Solo acepta tokens internos de vida corta | SEC-18 |
| Consulta de revocación (`session:{sid}`, `revoked:{jti}`) inyectada como dependencia `RevocationStore`, que falla cerrado | `src/app.ts`, `src/server.ts` | Revocación efectiva aun sin gateway | SEC-23 |
| Suscripción a `session-revoked` que cierra los sockets con ese `sid` | `src/app.ts` (mapa `subscriptions`) | Cierre inmediato de WS directos | SEC-24 |
| Acción `reassign` (director o coordinador) o re-aprovisionamiento de roster y asignaciones, con historial | `src/domain.ts`, `src/provision.ts` | Retirada efectiva de permisos de planilla | SEC-25 |
| Autenticación del emisor por canal (mTLS o cabecera HMAC del gateway) | `src/app.ts` | M8 solo atiende al gateway | SEC-17 reforzada |

Todos los cambios del nivel 2 deben mantener verdes las 16 pruebas actuales de M8 (clase A) y añadir sus propias pruebas. Se proponen para F2, no para F1-A ni F1-B.

---

## C2 — Autoridad de calificaciones (precisión de K1)

### C2.1 Reglas

1. **Autoridad de escritura:** `squad3.gradebooks` (M8) es la **única** fuente escribible de evaluaciones, notas, conclusiones, publicación, cierre y rectificaciones mientras K1 esté vigente.
2. **Congelamiento:** las tablas del consolidado `evaluaciones`, `calificaciones` y `conclusiones_descriptivas` quedan **sin escritor**. Hoy no hay ningún escritor (§0). Se registra como regla de revisión de código: un PR que añada `INSERT`/`UPDATE` sobre ellas se rechaza. No se eliminan ni se alteran (sin DDL).
3. **Sin doble escritura:** ningún servicio escribe la misma nota en ambos esquemas, ni de forma síncrona (riesgo de transacción distribuida) ni asíncrona desde el cliente.
4. **Lectura para analítica:** se hace mediante **proyecciones derivadas** de M8, que nunca se escriben a mano.
5. **Qué notas se proyectan:**
   - para estudiantes y reportes oficiales, solo `publishedGrades`;
   - para la analítica interna de coordinación y dirección, `grades` con `status='approved'`;
   - los borradores (`draft`) **nunca** se proyectan.

### C2.2 Alternativas de proyección (propuestas; sin DDL)

| Opción | Mecanismo | Consistencia | Coste | Recomendación |
|---|---|---|---|---|
| **P1. Vistas SQL sobre JSONB** | Vistas (`jsonb_each` sobre `state->'grades'` y `state->'publishedGrades'`) en un esquema de solo lectura `analytics`, con un rol lector separado | Inmediata | Consultas más costosas; sin escritor nuevo | **Inicial** |
| P2. Tabla de proyección por eventos | Un proyector idempotente consume `squad3.grade_audit_history` (append-only, ordenado por `created_at`, `id`) y mantiene tablas `analytics.*` | Eventual | Proceso adicional; requiere cursor e idempotencia por `history.id` | Si P1 no cumple el rendimiento |
| P3. Materializada sobre P1 | `vm_*` refrescada por un cron | Periódica | Bajo | Para tableros S4 con SLA de minutos |

`vm_rendimiento_seccion` (que hoy lee `calificaciones`, siempre vacía) se **redefinirá** sobre la proyección en F6. No se toca hasta entonces.

**Mapeo de identificadores necesario para la proyección:**
- `book.tenantId` (texto) ↔ `instituciones.id::text`;
- `courseId`, `sectionId` y `periodId` ↔ `grados_secciones.id` y `periodos_academicos.id`;
- `students[].id` ↔ `matriculas.id`.

Por eso **el aprovisionamiento (F2) debe usar UUID canónicos del consolidado**. Es la condición que hace viable K1.

### C2.3 Reconciliación

Verificación periódica, sin corrección automática:

| Control | Fórmula | Tolerancia |
|---|---|---|
| R1. Existencia de referencias | Todo `courseId`/`sectionId`/`periodId`/`students[].id` existe en el consolidado y pertenece al mismo tenant | 0 huérfanos |
| R2. Conteo | Celdas proyectadas = celdas `approved` (o `published`) en `state` | Exacto |
| R3. Suma de control | `sum(numeric)` y conteo por literal, por planilla | Exacto |
| R4. Revisión | La proyección registra `revision` y el cursor de historial procesados | La revisión proyectada ≤ la revisión fuente, con el retraso dentro del SLA (P2/P3) |
| R5. Historial | Cada `revision` tiene una fila en `grade_audit_history` | Exacto |

Ante una discrepancia: alerta y regeneración de la proyección desde la fuente. **La fuente nunca se corrige automáticamente.**

### C2.4 Criterios de convergencia (cuándo se decide K2 o K3)

Se reabre la decisión del modelo canónico **solo** cuando se cumplan todos estos criterios:
1. El rol canónico y el tenant UUID se aplican en todos los servicios (C1).
2. Las proyecciones están en uso por S4 o S5 con al menos un periodo académico completo reconciliado sin discrepancias.
3. Hay un requisito medible que P1–P3 no satisfacen (rendimiento, granularidad de conflicto por celda o reporte oficial).
4. Existe un plan de migración con *dry-run* sobre una copia, reversión probada y conservación íntegra de `grade_audit_history`.

Mientras no se cumplan, K1 sigue vigente.

---

## C3 — Clasificación de pruebas de paridad

| Clase | Definición | Valor para la paridad | Inventario actual |
|---|---|---|---|
| **A. Autoritativas del backend** | Ejecutan reglas en el servidor real o en su motor de BD | **Oráculo vinculante**: el comportamiento React debe ser consistente con ellas | M8: `domain.test.ts` (12), `http.test.ts` (1, REST+WS), `postgres.test.ts` (1, RLS e inmutabilidad), `providers.test.ts` (2) |
| **B. Comportamiento de UI** | Prueban la UX del cliente real (debounce, foco, TSV, conflicto, responsive) | **Oráculo de UX**: React debe replicarlas | Flutter S3: `gradebook_test.dart` (debounce de 400 ms; entrada en vuelo; fallo o conflicto conserva la entrada; TSV; inválidos bloquean el guardado; teclado y virtualización; 360 px), `navigation_test.dart`, `api_grades_repository_test.dart` (contrato del cliente 409/422/503, lote canónico), `integration_test/squad_3_performance_test.dart` |
| **C. Demos como especificación** | Prueban lógica ejecutada **en el cliente sobre datos en memoria** | **No vinculantes.** Describen la intención funcional; se reescriben como pruebas A en el servidor | Flutter S1: los 47 casos (`auth`, `user`, `academic_config`, `access_control`, `audit`, `data_protection`, `grading_scale`, `jwt_codec`, `password_hasher`, `validators`, `squad_1_screen`). Flutter S3: "demo: supervised draft, publication, close and signed rectification" y las pruebas de cálculo sobre `DemoGradesRepository` |
| **D. Nuevas obligatorias de seguridad y persistencia** | No existen hoy | **Condición de aceptación** | SEC-01…SEC-14 (C1.5); PER-01…PER-06 (abajo) |

Excepción en la clase C: `jwt_codec_test` y `password_hasher_test` **no se trasladan**. Prueban código que no debe existir en el cliente. Se sustituyen por SEC-02/03 y por pruebas de bcrypt en el servidor.

**Pruebas nuevas de persistencia:**

| ID | Caso |
|---|---|
| PER-01 | Una mutación M8 fallida no deja cambios ni historial (ya cubierto por `postgres.test.ts`; se mantiene en CI) |
| PER-02 | La auditoría S1 en PostgreSQL rechaza UPDATE, DELETE y TRUNCATE sobre `logs_auditoria`. **El trigger actual no cubre TRUNCATE** (DDL `:188-190` solo `UPDATE OR DELETE`); se registra como hallazgo para F2 |
| PER-03 | Dos inserciones concurrentes en la cadena hash mantienen el encadenamiento (bloqueo o serialización) |
| PER-04 | Las proyecciones C2 cumplen R1–R5 sobre un fixture |
| PER-05 | Login: bloqueo por intentos en Redis sobrevive al reinicio del proceso |
| PER-06 | Revocación de `jti` persistente en Redis con TTL igual a la expiración |

### Criterios de aceptación actualizados

**Squad 3** (sustituye el bloque de aceptación de S3 en la matriz):
1. Todas las pruebas A de M8 en verde **sin modificar M8**.
2. Cada prueba B tiene su equivalente React (Vitest con temporizadores falsos y Playwright) en verde, contra el **backend M8 real** en CI (PGlite o PostgreSQL de servicio), no contra mocks.
3. SEC-04, 06, 07, 08, 10, 11, 12, 14 y SEC-15…22 en verde a través del gateway (nivel 1 de C1.6). SEC-23…25 son obligatorias solo si se aprueba el nivel 2 en F2.
4. Benchmark de la grilla (D-10) aceptado.
5. La demo Flutter (clase C) no se usa como evidencia de aceptación.

**Squad 1** (sustituye el bloque de aceptación de S1 en la matriz):
1. Cada caso C de S1 se reescribe como prueba A sobre endpoints reales con PostgreSQL y Redis, con la misma intención.
2. SEC-01…SEC-10, SEC-19, SEC-20 y PER-02, 03, 05 y 06 en verde.
3. Escaneo del bundle web: cero secretos, cero uso de `encrypt`/`crypto` para cifrado o firma en el cliente.
4. El RBAC del cliente es solo de presentación. Una prueba E2E manipula el cliente para mostrar un botón oculto y el servidor responde 403.
5. Las pruebas de UI (B) se escriben nuevas para React. Las de Flutter S1 son clase C y no sirven de oráculo de UX salvo `squad_1_screen_test` (login visible sin sesión).

---

## C4 — División de F1

| | **F1-A: higiene, secretos y línea base** | **F1-B: contratos, CI ampliada y workspaces** |
|---|---|---|
| Objetivo | Que el repositorio sea seguro de confirmar y tenga una medición base | Preparar la infraestructura compartida TS |
| Contenido | `.gitignore` raíz; plantilla `.env.example` sin valores reutilizables; rastrear `backend/package-lock.json`; verificación de credenciales; línea base `flutter analyze`/`test` + M8 `check`/`test`; documentación F0 en `docs/` | `packages/contracts` (OpenAPI M8, sobre canónico D-18); `package.json` raíz con npm workspaces (D-12); Vitest/Playwright (D-11); GitHub Actions + protección de ramas (D-13); `.gitattributes` evaluado; escaneo de secretos en CI |
| Excluye | Flutter, React, Expo, BD, backend funcional, `.gitattributes` global, CI | Migraciones de BD, React/Expo, cambios funcionales del backend |
| Depende de la autorización institucional (D-01) | **No**: es neutral respecto del stack | **Sí**: introduce artefactos del stack TS |
| Plan | [`F1A_PLAN_EJECUCION_SEGURA.md`](F1A_PLAN_EJECUCION_SEGURA.md) | Se redactará tras cerrar F1-A |

---

## Estado de decisiones tras esta revisión

| ID | Estado | Cambio |
|---|---|---|
| D-01 | ⛔ Bloqueada | Borrador de acta: [`F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md`](F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md). **No hay aprobación institucional** |
| D-03 | 🟡 Lista para aprobación | Registro en el acta, Anexo B |
| D-06 | 🟡 Revisada | Rol activo explícito; sin selección automática (C1) |
| D-07 | 🟡 Revisada | Tokens por audiencia + intercambio para M8 (C1.3) |
| D-04 / K1 | ⛔ Bloqueada, con K1 precisada | C2 |
| D-08 | ⛔ Pendiente | Sin cambios: requiere verificar propiedad, procedencia de las imágenes y autorización. `las-condes-replica/` no se mueve ni se borra |
| D-11, D-12, D-13, D-18, D-20 | 🟡 Listas para aprobación | Registro en el acta, Anexo B |

## Dictamen

| Ámbito | Dictamen | Motivo |
|---|---|---|
| **Preparación técnica para F1-A** | **APTO CON CONDICIONES** | Plan reversible con archivos exactos. Las condiciones están en F1-A §0 |
| **Autorización institucional para F1-A** | No requerida más allá del líder de proyecto | F1-A no cambia stack, alcance ni funcionalidad |
| **F1-B** | **BLOQUEADO** | Requiere D-01 aprobada (institucional) y aprobación técnica de D-11, D-12, D-13 y D-18 |
| **F2 en adelante** | **BLOQUEADO** | D-01, D-04 y aplicación de C1 |
