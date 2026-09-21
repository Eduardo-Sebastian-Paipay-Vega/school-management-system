# ESPECIFICACIÓN TÉCNICA FORMAL DE REQUISITOS FUNCIONALES (SRS TÉCNICO)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco de Asignatura:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase II – Diseño y Desarrollo de Software (Especificación SRS Técnica)
- **Documento Fuente Base:** `Fase 2/Requisitos Funcionales/requisitos_funcionales.md`
- **Nivel de Abstracción:** Especificación Técnica de Software (Arquitectura, Contratos de API REST, Lógica de Base de Datos, Transaccionalidad, Flujo de Datos, Offline-First, WebSockets y Criptografía Documental).

---

## 1. INTRODUCCIÓN Y ARQUITECTURA TÉCNICA DE REFERENCIA

El presente documento formaliza la **Especificación Técnica de los Requisitos Funcionales (RF-TEC)** para la plataforma web de gestión académica e información institucional. Mientras que la Fase I definió el comportamiento del sistema desde el punto de vista del negocio escolar y del usuario final, este documento de Fase II traduce cada requerimiento a especificaciones de ingeniería de software, detallando contratos de interfaz de programación (API RESTful), modelos de datos relacionales, transaccionalidad ACID, esquemas de seguridad de tokens, caché en memoria, tolerancia a fallos offline-first, firma criptográfica y canales de comunicación bidireccional en tiempo real.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE CLIENTE / PRESENTACIÓN (FRONTEND)                       │
│      Flutter Web / Desktop SPA (Dart 3.x / Material Design 3 / Responsive Layout)      │
│     [Motor de Teclado "Modo Excel" │ Almacenamiento Local Offline (IndexedDB/Hive)]    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / WSS (JSON REST APIs & WebSockets)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                    CAPA DE PUERTA DE ENLACE Y CONTROLADORES (BACKEND)                  │
│       API Gateway / Controladores RESTful / Middleware RBAC / JWT Auth Interceptors    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                       CAPA DE SERVICIOS Y LÓGICA DE DOMINIO                            │
│  Servicio Autenticación │ Servicio Académico │ Kiosco Sync Worker  │ Motor Calificaciones│
│  Servicio Reportes PDF  │ Motor Mapas Calor  │ Ficha 360° Engine   │ Validador Cripto QR │
│  Gestor Conclusiones    │ Monitor SSU IS-480 │ Gestor Auditoría    │ Servicio Difusión   │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│           CAPA DE CACHÉ Y TIEMPO REAL     │             CAPA DE PERSISTENCIA           │
│        Redis (Tokens, Sesiones, Rate      │       PostgreSQL Relacional (Multi-Tenant  │
│        Limiting, Pub/Sub WebSockets)      │       con particionado lógico `tenant_id`) │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 1.1 Estándares Técnicos Transversales del Sistema

1. **Protocolo de Comunicación:** HTTP/1.1 y HTTP/2 sobre TLS 1.3 (HTTPS) para APIs RESTful, y protocolo WebSocket Seguro (`wss://`) para eventos en tiempo real.
2. **Formato Universal de Intercambio:** `application/json; charset=utf-8` para todos los payloads de petición y respuesta.
3. **Mecanismo de Autenticación y Autorización:**
   - **Access Token:** JSON Web Token (JWT) firmado con algoritmo criptográfico HMAC-SHA256 (`HS256`) o RSA (`RS256`), con tiempo de expiración corto (15 a 30 minutos). Incluye claims estándar (`sub`, `iss`, `aud`, `exp`, `iat`) y privados (`user_id`, `role`, `tenant_id`, `permissions[]`).
   - **Refresh Token:** Token opaco almacenado en base de datos / Redis con tiempo de expiración configurable (7 días) para renovación silenciosa de sesiones sin exigir reautenticación continua.
   - **Cabecera de Autorización:** `Authorization: Bearer <access_token>`.
4. **Esquema Estándar de Respuesta de API (`ApiResponse<T>`):**
   ```json
   {
     "success": true,
     "statusCode": 200,
     "message": "Operación ejecutada correctamente.",
     "data": {},
     "meta": {
       "timestamp": "2026-09-21T15:30:00.000Z",
       "requestId": "req-98f3b4c1-12a8"
     }
   }
   ```
5. **Esquema Estándar de Error de API (`ApiErrorResponse`):**
   ```json
   {
     "success": false,
     "statusCode": 400,
     "error": "BAD_REQUEST",
     "message": "Error de validación en los datos de entrada.",
     "details": [
       { "field": "dni", "issue": "El DNI debe contener exactamente 8 dígitos numéricos." }
     ],
     "meta": {
       "timestamp": "2026-09-21T15:30:00.000Z",
       "requestId": "req-98f3b4c1-12a8"
     }
   }
   ```
6. **Aislamiento Multi-Tenant:** Todas las tablas de la base de datos relacional PostgreSQL incorporan la columna `tenant_id UUID NOT NULL` indexada, garantizando el aislamiento lógico estricto de los datos de los Planteles de Aplicación de la UNSCH y preparando el sistema para la escalabilidad institucional proyectada.

---

## 2. LISTA FORMAL DE MÓDULOS TÉCNICOS

- **MÓDULO TÉCNICO 1: Servicios de Autenticación, JWT, RBAC y Sesiones** (`RF-TEC-SEG`)
- **MÓDULO TÉCNICO 2: API de Gestión de Usuarios, Directorio y Cuentas** (`RF-TEC-USU`)
- **MÓDULO TÉCNICO 3: API de Parametrización y Estructura Organizacional Escolar** (`RF-TEC-ADM`)
- **MÓDULO TÉCNICO 4: API de Gestión Académica, Matrícula y Carga Lectiva** (`RF-TEC-ACA`)
- **MÓDULO TÉCNICO 5: API de Asistencia Estudiantil, Kiosco Offline-First y Carnés QR** (`RF-TEC-AST`)
- **MÓDULO TÉCNICO 6: API de Asistencia y Cómputo de Horas de Practicantes** (`RF-TEC-PRA`)
- **MÓDULO TÉCNICO 7: API de Control de Asistencia y Horas de Docentes Contratados** (`RF-TEC-DOC`)
- **MÓDULO TÉCNICO 8: Motor de Calificaciones en Tiempo Real, Modo Excel y Conclusiones** (`RF-TEC-NOT`)
- **MÓDULO TÉCNICO 9: Motor de Generación de Mapas de Calor con Navegación Drill-Down** (`RF-TEC-CAL`)
- **MÓDULO TÉCNICO 10: API de Tableros de Control, Ficha 360° y Métricas SSU (IS-480)** (`RF-TEC-MON`)
- **MÓDULO TÉCNICO 11: Servicio de Generación de Reportes y Verificación Criptográfica QR** (`RF-TEC-REP`)
- **MÓDULO TÉCNICO 12: Motor de Trazabilidad, Bitácora de Auditoría y Seguridad** (`RF-TEC-AUD`)
- **MÓDULO TÉCNICO 13: API de Difusión Digital, Cartelera y Contenidos Institucionales** (`RF-TEC-DIF`)

---

## 3. ESPECIFICACIÓN DETALLADA DE REQUISITOS FUNCIONALES TÉCNICOS

```
========================================================================================
MÓDULO TÉCNICO 1: SERVICIOS DE AUTENTICACIÓN, JWT, RBAC Y SESIONES (RF-TEC-SEG)
========================================================================================
```

### RF-TEC-SEG-01: Servicio de Autenticación de Credenciales y Emisión de JWT
- **Trazabilidad:** `RF-01`
- **Capa / Componente:** `AuthController` → `AuthService` → `TokenService` → `UserRepository`
- **Endpoint Principal:** `POST /api/v1/auth/login`
- **Autenticación Requerida:** Pública (Sin token previo).
- **Control de Tasa (Rate Limiting):** Máximo 5 peticiones por minuto por IP (Redis Bucket).
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "username": "string (DNI de 8 dígitos o email institucional válido)",
    "password": "string (mínimo 8 caracteres)",
    "deviceInfo": {
      "userAgent": "string",
      "ipAddress": "string"
    }
  }
  ```
- **Lógica Técnica de Procesamiento:**
  1. Sanitización de entradas contra inyecciones SQL/NoSQL y validación de formato (DNI regex `^\d{8}$` o email RFC 5322).
  2. Consulta en base de datos PostgreSQL mediante el índice único `idx_users_username_tenant`:
     `SELECT id, password_hash, role_id, status, tenant_id, failed_login_attempts, locked_until FROM users WHERE (username = :u OR email = :u) AND is_deleted = false`.
  3. Verificación de bloqueo: si `locked_until > NOW()`, rechazar con HTTP 423 (Locked).
  4. Comparación criptográfica de contraseña mediante `argon2id` o `bcrypt` (costo mínimo: salt rounds = 12).
  5. Si la contraseña no coincide:
     - Incrementar `failed_login_attempts` en 1.
     - Si `failed_login_attempts >= 3`, actualizar `locked_until = NOW() + INTERVAL '15 minutes'`.
     - Registrar evento en `audit_logs` con severidad `WARN`.
     - Retornar HTTP 401 Unauthorized con código `INVALID_CREDENTIALS`.
  6. Si coincide y estado es `ACTIVE`:
     - Resetear `failed_login_attempts = 0` y `locked_until = NULL`.
     - Generar par de tokens:
       - `accessToken`: JWT con payload `{ sub: user.id, role: role.name, tenant: user.tenant_id, perms: [...] }`, firmado con secreto/clave privada, expiración en 1800 segundos.
       - `refreshToken`: Cadena criptográfica aleatoria de 64 bytes (`crypto.randomBytes`), almacenada en Redis con clave `refresh_token:<token>` y TTL de 7 días.
     - Asentar evento de inicio exitoso en `audit_logs` con IP y User-Agent.
- **Contrato de Salida (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "refreshToken": "d8f24b89a9c2e01b45...",
      "tokenType": "Bearer",
      "expiresIn": 1800,
      "user": {
        "id": "uuid",
        "name": "Juan Perez",
        "role": "ROLE_TEACHER",
        "tenantId": "uuid"
      }
    }
  }
  ```
- **Manejo de Excepciones:** HTTP 400 (Bad Request), HTTP 401 (Invalid Credentials), HTTP 423 (Account Locked), HTTP 429 (Too Many Requests).

---

### RF-TEC-SEG-02: Revocación de Tokens y Middleware de Control de Inactividad
- **Trazabilidad:** `RF-02`
- **Capa / Componente:** `AuthMiddleware` → `SessionManager` → `RedisTokenStore`
- **Endpoints:**
  - `POST /api/v1/auth/logout` (Revocación activa)
  - `POST /api/v1/auth/refresh-token` (Rotación de tokens)
- **Lógica Técnica de Procesamiento:**
  1. Al invocar `/logout`, extraer el `jti` (JWT ID) del Access Token y agregarlo a una Lista Negra (Denylist) en Redis con clave `jwt_blacklist:<jti>` y expiración igual al tiempo remanente del token.
  2. Eliminar de Redis el `refreshToken` asociado al usuario.
  3. En el cliente Flutter, destruir el almacenamiento seguro local (`flutter_secure_storage`).
  4. En el Middleware del Backend: para cada petición entrante, consultar en Redis si el `jti` está en la lista negra. Si existe, denegar con HTTP 401 (`TOKEN_REVOKED`).
  5. Expiración por inactividad: el frontend monitorea eventos de puntero y teclado con un `Timer` de 20 minutos. Al agotarse, ejecuta `/logout` automáticamente y purga el estado de memoria en la aplicación.
- **Contrato de Salida (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Sesión revocada exitosamente."
  }
  ```

---

### RF-TEC-SEG-03: Servicio de Recuperación Asistida y Generación de Token Temporal
- **Trazabilidad:** `RF-03`
- **Capa / Componente:** `PasswordResetController` → `MailNotificationService` → `RedisTokenStore`
- **Endpoints:**
  - `POST /api/v1/auth/forgot-password` (Solicitud de recuperación)
  - `POST /api/v1/auth/reset-password` (Confirmación con token temporal)
  - `POST /api/v1/admin/users/:id/reset-password` (Reinicio administrativo asistido)
- **Lógica Técnica de Procesamiento:**
  1. Generar token criptográfico `resetToken` de 32 bytes con tiempo de vida de 1800 segundos (30 minutos) almacenado en Redis `pwd_reset:<token>` con valor `user_id`.
  2. Envío de correo electrónico transaccional con enlace seguro HTTPS: `https://planteles.unsch.edu.pe/reset-password?token=<token>`.
  3. Al consumir el token, validar existencia en Redis, verificar que la nueva contraseña cumpla la expresión regular de robustez `^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$`, hashearla con Argon2id y actualizar `users.password_hash`.
  4. Invalidar inmediatamente el token en Redis (`DEL pwd_reset:<token>`) para impedir su reutilización.
  5. Para reinicio administrativo: generar clave aleatoria de 10 caracteres alfanuméricos, setear bandera `users.must_change_password = true`, obligando a redefinirla en el primer login.

---

### RF-TEC-SEG-04: Middleware de Autorización RBAC y Guardias de Privilegios Mínimos
- **Trazabilidad:** `RF-04`
- **Capa / Componente:** `RbacMiddleware` / `RoleGuard`
- **Mecanismo Técnico:**
  1. Decorador / Middleware en cada ruta de la API: `@RequireRole(['ROLE_ADMIN', 'ROLE_DIRECTOR'])` o `@RequirePermission('grades:write')`.
  2. Extracción de claims del JWT validado: verificar correspondencia de `role` y matriz de permisos cargada en memoria caché Redis.
  3. Verificación de alcance de datos (Data Scoping): si el rol es `ROLE_TEACHER`, el middleware inyecta en el contexto de la petición (`req.user.teacherId`) y fuerza en las consultas SQL: `WHERE teacher_id = :teacherId AND tenant_id = :tenantId`.
  4. Si el usuario carece del rol o intenta acceder a recursos de otro tenant, retornar HTTP 403 Forbidden con código `ACCESS_DENIED`.

---

```
========================================================================================
MÓDULO TÉCNICO 2: API DE GESTIÓN DE USUARIOS, DIRECTORIO Y CUENTAS (RF-TEC-USU)
========================================================================================
```

### RF-TEC-USU-01: API Transaccional de Alta y Aprovisionamiento de Usuarios
- **Trazabilidad:** `RF-05`
- **Endpoint:** `POST /api/v1/users`
- **Roles Autorizados:** `ROLE_ADMIN`, `ROLE_DIRECTOR`.
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "dni": "string (8 dígitos numéricos)",
    "names": "string (máximo 100 caracteres)",
    "paternalSurname": "string (máximo 100 caracteres)",
    "maternalSurname": "string (máximo 100 caracteres)",
    "email": "string (email institucional)",
    "phoneNumber": "string (9 dígitos)",
    "roleId": "uuid",
    "employmentType": "ENUM('NOMBRADO', 'CONTRATADO', 'PRACTICANTE', 'ADMINISTRATIVO')",
    "tenantId": "uuid"
  }
  ```
- **Lógica de Persistencia y Transaccionalidad (PostgreSQL):**
  ```sql
  BEGIN;
  SELECT id FROM users WHERE (dni = :dni OR email = :email) AND tenant_id = :tenantId FOR UPDATE;
  INSERT INTO users (id, tenant_id, dni, names, paternal_surname, maternal_surname, email, phone, role_id, employment_type, password_hash, status, must_change_password, created_at)
  VALUES (gen_random_uuid(), :tenantId, :dni, :names, :paternalSurname, :maternalSurname, :email, :phoneNumber, :roleId, :employmentType, :defaultHash, 'ACTIVE', true, NOW())
  RETURNING id;
  INSERT INTO audit_logs (id, tenant_id, user_id, action, entity, entity_id, new_values, created_at)
  VALUES (gen_random_uuid(), :tenantId, :authUserId, 'CREATE_USER', 'users', :newId, :jsonNewValues, NOW());
  COMMIT;
  ```
- **Contrato de Salida (HTTP 201 Created):** Objeto usuario creado sanitizado (sin `password_hash`).

---

### RF-TEC-USU-02: Endpoint de Actualización y Baja Lógica (Soft Delete)
- **Trazabilidad:** `RF-06`, `RF-07`
- **Endpoints:**
  - `PATCH /api/v1/users/:id` (Modificación de datos informativos o rol)
  - `DELETE /api/v1/users/:id` (Desactivación / Baja lógica)
- **Lógica Técnica:** Actualización `UPDATE users SET status = 'INACTIVE', is_deleted = true, deleted_at = NOW() WHERE id = :id AND tenant_id = :tenantId`. Prohibición de `DELETE` físico mediante trigger ante registros históricos. Inmediata revocación de tokens en Redis (`DEL user_tokens:<userId>`).

---

### RF-TEC-USU-03: Endpoint de Búsqueda Indexada y Paginación del Directorio
- **Trazabilidad:** `RF-08`, `RF-09`
- **Endpoint:** `GET /api/v1/users`
- **Parámetros Query:** `?page=1&limit=20&search=flores&role=ROLE_TEACHER&status=ACTIVE&sortBy=paternalSurname&sortOrder=ASC`
- **Lógica de Base de Datos:** Búsqueda mediante índice GIN Trigram (`idx_users_search`) sobre `(paternal_surname || ' ' || maternal_surname || ' ' || names)` con latencia P95 < 50 ms. Retorno de cabeceras de paginación `X-Total-Count`, `X-Total-Pages`.

---

```
========================================================================================
MÓDULO TÉCNICO 3: API DE PARAMETRIZACIÓN Y ESTRUCTURA ORGANIZACIONAL (RF-TEC-ADM)
========================================================================================
```

### RF-TEC-ADM-01: API de Parametrización Institucional y Almacenamiento S3
- **Trazabilidad:** `RF-10`
- **Endpoints:** `GET /api/v1/institution/profile`, `PUT /api/v1/institution/profile`, `POST /api/v1/institution/logo` (Multipart).
- **Lógica Técnica:** Validación de tipo MIME de imagen, compresión y conversión automática a WebP 512x512 px, almacenamiento en MinIO/S3 con CDN y TTL de caché de 24 horas.

---

### RF-TEC-ADM-02: API de Periodos, Estructura Curricular y Escalas
- **Trazabilidad:** `RF-11`, `RF-12`, `RF-13`, `RF-14`
- **Endpoints:**
  - `POST /api/v1/academic-years`
  - `POST /api/v1/academic-periods`
  - `POST /api/v1/curriculum/courses`
  - `POST /api/v1/curriculum/grading-scales`
- **Integridad Referencial:** Invariantes de fechas (`start_date < end_date`), escalas mapeadas con estructura `JSONB` que definen equivalencias cualitativas/cuantitativas (`scale_mapping`).

---

```
========================================================================================
MÓDULO TÉCNICO 4: API DE GESTIÓN ACADÉMICA, MATRÍCULA Y CARGA LECTIVA (RF-TEC-ACA)
========================================================================================
```

### RF-TEC-ACA-01: API de Registro y Matrícula Masiva con Bloqueo Pesimista
- **Trazabilidad:** `RF-15`, `RF-16`, `RF-19`
- **Endpoints:** `POST /api/v1/students`, `POST /api/v1/students/bulk-import`, `POST /api/v1/enrollments`.
- **Lógica Técnica:** Transacción con `SELECT current_students, max_capacity FROM sections WHERE id = :sectionId FOR UPDATE`. Si `current_students >= max_capacity` aborta con HTTP 409 (`SECTION_CAPACITY_EXCEEDED`). Generación automática de cuenta para el estudiante con rol `ROLE_STUDENT`.

---

### RF-TEC-ACA-02: API de Asignación y Control de Carga Lectiva Docente
- **Trazabilidad:** `RF-17`, `RF-18`
- **Endpoint:** `POST /api/v1/academic/teaching-assignments`
- **Restricción:** Clave única compuesta en base de datos: `UNIQUE (course_id, section_id, academic_year_id)` que garantiza la asignación unívoca del docente titular.

---

```
========================================================================================
MÓDULO TÉCNICO 5: ASISTENCIA ESTUDIANTIL, KIOSCO OFFLINE-FIRST Y CARNÉS QR (RF-TEC-AST)
========================================================================================
```

### RF-TEC-AST-01: API de Registro Masivo de Asistencia en Aula (Batch Operation)
- **Trazabilidad:** `RF-20`, `RF-22`, `RF-23`, `RF-24`
- **Endpoint:** `POST /api/v1/attendance/students/batch`
- **Lógica Técnica:** Inserción `UPSERT` en PostgreSQL (`ON CONFLICT (student_id, course_id, session_date, block_number) DO UPDATE...`) con verificación de candado `is_locked = false`. Emisión asíncrona de evento para cálculo de alertas tempranas si acumula 3 faltas.

---

### RF-TEC-AST-02: Micro-Servicio Kiosco de Control de Puerta y Portería ("Wachiman")
- **Trazabilidad:** `RF-21`
- **Endpoint de Ultra-Baja Latencia:** `POST /api/v1/kiosk/gate-entry`
- **Latencia Objetivo:** P99 < 300 ms.
- **Lógica Técnica:** Búsqueda en Redis hash `student_gate_cache:<dni>` en 2 ms. Cálculo automático de minutos de tardanza contra las 07:30:00 (Tolerancia 10 min). Respuesta visual y auditiva inmediata.

---

### RF-TEC-AST-03: Arquitectura Resiliente de Sincronización Desconectada (Offline-First Kiosk)
- **Trazabilidad:** `RF-25`
- **Capa / Componente:** `KioskStorageService` (Frontend Flutter) → `IndexedDB` / `Hive` → `GateSyncWorker` (Background)
- **Endpoint de Sincronización por Lote:** `POST /api/v1/kiosk/gate-entry/offline-batch-sync`
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "gateId": "PUERTA_PRINCIPAL",
    "batchTimestamp": "2026-09-21T08:05:00.000Z",
    "entries": [
      { "dni": "72345678", "offlineTimestamp": "2026-09-21T07:35:12.450Z", "clientUuid": "c-98a1" },
      { "dni": "74891234", "offlineTimestamp": "2026-09-21T07:44:02.100Z", "clientUuid": "c-98a2" }
    ]
  }
  ```
- **Lógica Técnica:**
  1. El cliente Flutter monitorea el estado de conectividad mediante `connectivity_plus`. Al detectar fallo de red, conmuta a modo desconectado.
  2. Los escaneos se persisten localmente en una base de datos local encriptada (`Hive` con cifrado AES-256).
  3. Al restablecerse la conexión, el servicio `GateSyncWorker` despacha la cola acumulada al endpoint de sincronización.
  4. En el backend: transacción idempotente basada en `clientUuid` para evitar duplicados. Cálculo de tardanzas según el `offlineTimestamp` capturado en portería.
- **Contrato de Salida (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "synchronizedCount": 42,
    "failedCount": 0,
    "conflictsResolved": 0
  }
  ```

---

### RF-TEC-AST-04: Motor de Maquetación y Emisión Masiva de Carnés Escolares QR en PDF
- **Trazabilidad:** `RF-26`
- **Endpoint:** `GET /api/v1/reports/student-id-cards?sectionId=uuid&format=pdf`
- **Lógica Técnica de Renderizado:**
  1. Extracción de los estudiantes matriculados en la sección con su fotografía en formato optimizado y datos de matrícula.
  2. Generación programática de códigos QR en memoria utilizando algoritmo de corrección de errores nivel M (`QR_ECLEVEL_M`), codificando la cadena segura: `PLANTEL:UNSCH:STD:<dni>:<checksum>`.
  3. Maquetación vectorial con motor PDF en cuadrículas estándar A4 (2 columnas x 5 filas = 10 carnés por hoja) con guías de corte (`crop marks`), respetando dimensiones estándar de carné escolar (8.5 cm x 5.4 cm).
  4. Retorno mediante streaming de buffer en menos de 1.8 segundos por aula completa.

---

```
========================================================================================
MÓDULO TÉCNICO 6: ASISTENCIA Y HORAS DE PRACTICANTES (RF-TEC-PRA)
========================================================================================
```

### RF-TEC-PRA-01: API de Marcaje y Aprobación por Lotes de Horas de Prácticas
- **Trazabilidad:** `RF-27`, `RF-28`, `RF-29`, `RF-30`
- **Endpoints:** `POST /api/v1/practitioners/check-in`, `POST /api/v1/practitioners/check-out`, `POST /api/v1/practitioners/sessions/batch-approve`.
- **Lógica:** Cómputo de minutos entre entrada y salida (`EXTRACT(EPOCH...)`), estado inicial `PENDING_APPROVAL`, y transición atómica a `APPROVED` firmada por el docente titular, alimentando el acumulador `practitioner_profiles.validated_hours`.

---

```
========================================================================================
MÓDULO TÉCNICO 7: ASISTENCIA Y HORAS DE DOCENTES CONTRATADOS (RF-TEC-DOC)
========================================================================================
```

### RF-TEC-DOC-01: API de Marcación y Cruce Automatizado con Horario Lectivo
- **Trazabilidad:** `RF-31`, `RF-32`, `RF-33`, `RF-34`
- **Endpoints:** `POST /api/v1/attendance/contracted-teachers/mark`, `GET /api/v1/attendance/contracted-teachers/monthly-summary`.
- **Lógica:** Cruce relacional SQL entre `teacher_schedules` y `teacher_attendance_logs`, evaluando puntualidad (tolerancia 10 min), consolidando horas pedagógicas mensuales de 45 minutos.

---

```
========================================================================================
MÓDULO TÉCNICO 8: MOTOR DE CALIFICACIONES EN TIEMPO REAL, MODO EXCEL Y CONCLUSIONES (RF-TEC-NOT)
========================================================================================
```

### RF-TEC-NOT-01: API Transaccional de Registro y Modificación de Notas
- **Trazabilidad:** `RF-35`, `RF-36`, `RF-40`, `RF-41`, `RF-42`, `RF-43`
- **Endpoints:** `POST /api/v1/grades/batch-upsert`, `POST /api/v1/academic-periods/:id/close`.
- **Lógica:** Verificación de periodo abierto, comprobación de titularidad docente, validación de escalas oficiales, registro de histórico en `grades_audit_history` y recálculo automático de promedios de competencia y periodo.

---

### RF-TEC-NOT-02: Servicio de Difusión en Tiempo Real mediante WebSockets
- **Trazabilidad:** `RF-36`, `RF-43`
- **Protocolo:** WebSocket Seguro (`wss://.../ws`) mediante Redis Pub/Sub en canal `channel:section:<sectionId>:grades`. Notificación instantánea a clientes conectados ante evento `GRADE_UPDATED`.

---

### RF-TEC-NOT-05: Controlador de Matriz de Teclado Rápido ("Modo Excel") y Parser de Portapapeles en Flutter
- **Trazabilidad:** `RF-37`
- **Capa / Componente:** `FastGradeMatrixWidget` (Frontend Flutter) → `FocusNodeMatrixController` → `ClipboardParserService`
- **Lógica Técnica de Frontend:**
  1. Implementación de matriz de `FocusNode` bidimensional `focusNodes[row][col]`.
  2. Captura de eventos de hardware mediante `FocusScope` y escucha de teclas `HardwareKeyboard`:
     - Flecha Arriba (`LogicalKeyboardKey.arrowUp`): `focusNodes[row - 1][col].requestFocus()`
     - Flecha Abajo / Enter (`LogicalKeyboardKey.enter`): autoguardar y enfocar celda `[row + 1][col]`
     - Flechas Izquierda / Derecha: navegación horizontal entre criterios evaluativos.
  3. Intercepción del portapapeles (`Clipboard.getData(Clipboard.kTextPlain)`):
     - Detección de cadenas tabuladas y saltos de línea (`\t` y `\n` o `\r\n`).
     - Mapeo secuencial hacia los `TextEditingController` de la columna activa en orden alfabético.
     - Ejecución de validaciones de rango por celda y activación de botón de guardado masivo en 1 clic.

---

### RF-TEC-NOT-06: API de Catálogo y Recomendación de Conclusiones Descriptivas por Competencia y Nivel
- **Trazabilidad:** `RF-38`
- **Endpoint:** `GET /api/v1/curriculum/competencies/:competencyId/descriptive-conclusions?level=B`
- **Roles Autorizados:** `ROLE_TEACHER`, `ROLE_COORDINATOR`.
- **Estructura de la Tabla de Catálogo Pedagógico (`descriptive_conclusion_bank`):**
  ```sql
  CREATE TABLE descriptive_conclusion_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    competency_id UUID REFERENCES competencies(id),
    achievement_level VARCHAR(5) NOT NULL CHECK (achievement_level IN ('AD', 'A', 'B', 'C')),
    suggested_text TEXT NOT NULL,
    tags TEXT[] -- Ej: ['analisis', 'comprension', 'geometria']
  );
  CREATE INDEX idx_conclusions_comp_level ON descriptive_conclusion_bank (competency_id, achievement_level);
  ```
- **Contrato de Salida (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-1",
        "text": "Demuestra comprensión básica de las propiedades de los números enteros, requiriendo mayor práctica en la resolución de problemas contextualizados."
      },
      {
        "id": "uuid-2",
        "text": "Se encuentra en proceso de interpretar diagramas estadísticos; se recomienda afianzar la formulación de conclusiones a partir de tablas de frecuencia."
      }
    ]
  }
  ```

---

```
========================================================================================
MÓDULO TÉCNICO 9: MOTOR DE MAPAS DE CALOR CON NAVEGACIÓN DRILL-DOWN (RF-TEC-CAL)
========================================================================================
```

### RF-TEC-CAL-01: Servicio de Agregación y Matriz Térmica de Rendimiento y Asistencia
- **Trazabilidad:** `RF-44`, `RF-45`, `RF-47`, `RF-48`
- **Endpoints:** `GET /api/v1/analytics/heatmaps/academic-performance`, `GET /api/v1/analytics/heatmaps/attendance`.
- **Lógica:** Consultas SQL CTE agregadas con cálculo de niveles térmicos (`LEVEL_OUTSTANDING`, `LEVEL_EXPECTED`, `LEVEL_RISK_PASS`, `LEVEL_FAILED`) cacheadas en Redis con TTL de 1 hora.

---

### RF-TEC-CAL-03: API y Motor de Navegación Analítica a Detalle (Drill-Down de Competencias)
- **Trazabilidad:** `RF-46`
- **Endpoint:** `GET /api/v1/analytics/heatmaps/drill-down`
- **Parámetros Query:** `?studentId=uuid&courseId=uuid&periodId=uuid` (o `?sectionId=uuid&courseId=uuid&periodId=uuid`)
- **Lógica Técnica de Procesamiento:**
  ```sql
  SELECT 
    c.id as competency_id,
    c.name as competency_name,
    AVG(g.score) as competency_average,
    json_agg(json_build_object(
      'evaluationCriteria', ec.name,
      'weight', ec.weight,
      'score', g.score,
      'date', ec.evaluation_date
    )) as evaluation_breakdown
  FROM competencies c
  JOIN evaluation_criteria ec ON ec.competency_id = c.id
  JOIN grades g ON g.evaluation_criteria_id = ec.id
  WHERE g.student_id = :studentId AND ec.course_id = :courseId AND ec.period_id = :periodId
  GROUP BY c.id, c.name;
  ```
- **Contrato de Salida:** Estructura tipada con el desglose exacto de las competencias evaluadas, permitiendo que la interfaz Flutter pinte el gráfico modal explicativo de por qué la celda térmica es roja o amarilla.

---

```
========================================================================================
MÓDULO TÉCNICO 10: TABLEROS DE CONTROL, FICHA 360° Y MÉTRICAS SSU (RF-TEC-MON)
========================================================================================
```

### RF-TEC-MON-01: API de Métricas Ejecutivas y Worker de Alertas de Deserción
- **Trazabilidad:** `RF-49`, `RF-50`, `RF-51`, `RF-52`, `RF-55`
- **Endpoints:** `GET /api/v1/dashboard/director-kpis`, Worker `EarlyWarningWorker`.
- **Lógica:** Procesamiento diario de reglas de riesgo (inasistencias $\ge 10\%$, desaprobación $\ge 3$ cursos) y emisión de alertas hacia la bandeja de tutoría.

---

### RF-TEC-MON-03: API de Agregación de Alto Rendimiento para la Ficha Escolar 360° del Estudiante
- **Trazabilidad:** `RF-53`
- **Endpoint:** `GET /api/v1/students/:id/profile-360`
- **Roles Autorizados:** `ROLE_DIRECTOR`, `ROLE_COORDINATOR`, `ROLE_TEACHER` (Tutor).
- **Lógica Técnica de Consulta Única (Aggregated Single-Query):**
  - Recuperación en un solo viaje de ida y vuelta a la base de datos (Single Round-Trip) de:
    1. Datos de matrícula y contacto del alumno.
    2. Resumen bimestral de calificaciones con evolución cronológica de promedios.
    3. Semáforo de asistencia (total presencias, tardanzas justificadas/injustificadas, faltas).
    4. Mini mapa de calor individual de competencias.
    5. Listado de alertas preventivas activas registradas en `early_warning_alerts`.
- **Contrato de Salida (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "student": { "id": "uuid", "fullName": "Quispe Gomez, Alexander", "grade": "4° B Sec" },
      "academicProgression": [
        { "period": "Bimestre I", "average": 14.5 },
        { "period": "Bimestre II", "average": 12.0 }
      ],
      "attendanceStats": { "rate": 91.2, "lates": 4, "absences": 3, "semaphore": "YELLOW" },
      "competencyHeatmap": [
        { "area": "Matemática", "level": "LEVEL_RISK_PASS", "score": 11.0 },
        { "area": "Comunicación", "level": "LEVEL_EXPECTED", "score": 15.0 }
      ],
      "activeAlerts": ["Inasistencias acumuladas superan el 8% en el periodo actual"]
    }
  }
  ```

---

### RF-TEC-MON-04: Motor y Tablero de Métricas de Impacto y Acreditación del SSU (IS-480)
- **Trazabilidad:** `RF-54`
- **Endpoint:** `GET /api/v1/ssu/impact-metrics`
- **Roles Autorizados:** `ROLE_ADMIN`, Tutor SSU de la UNSCH (`ROLE_DIRECTOR`).
- **Lógica Técnica de Agregación de Impacto:**
  - Cálculo de KPIs del Servicio Social Universitario:
    - $\text{KPI-1 (Tasa de Adopción)} = \frac{\text{Usuarios Activos en Últimos 14 Días}}{\text{Total Personal Registrado}} \times 100$
    - $\text{KPI-5 (Eficiencia)} = \text{Total Registros Digitalizados} \times 0.25 \text{ horas ahorradas}$
    - Cumplimiento de horas individuales por integrante del equipo (meta: 96 horas / integrante).
- **Contrato de Salida:** Datos formateados para la generación del Informe Final de Proyecto del IS-480.

---

```
========================================================================================
MÓDULO TÉCNICO 11: SERVICIO DE REPORTES Y VERIFICACIÓN CRIPTOGRÁFICA QR (RF-TEC-REP)
========================================================================================
```

### RF-TEC-REP-01: Micro-Servicio de Compilación de Boletas y Exportación a Excel
- **Trazabilidad:** `RF-56`, `RF-58`, `RF-59`, `RF-60`, `RF-61`
- **Endpoints:** `GET /api/v1/reports/report-cards/:studentId`, `POST /api/v1/reports/export-excel`.
- **Lógica:** Generación en streaming mediante Chromium Headless/PDFKit y ExcelJS para evitar saturación de memoria RAM.

---

### RF-TEC-REP-03: Servicio Criptográfico de Verificación Documental con Hash SHA-256 y Endpoint Público QR
- **Trazabilidad:** `RF-57`
- **Endpoints:**
  - `POST /api/v1/documents/seal-and-register` (Firma y registro del documento en la emisión)
  - `GET /api/v1/public/verify-document` (Consulta pública no autenticada)
- **Parámetros de Consulta Pública:** `?docHash=3f8a91c2d0...`
- **Lógica Técnica Criptográfica:**
  1. Al emitirse una boleta oficial: concatenar los datos inmutables del reporte:
     $$\text{Payload} = \text{student\_id} + \text{period\_id} + \text{gpa} + \text{issued\_at} + \text{SECRET\_SALT}$$
  2. Generar el resumen criptográfico SHA-256 (`crypto.createHash('sha256').update(Payload).digest('hex')`).
  3. Almacenar el registro en la tabla `document_verification_registry` con el hash, fecha de emisión y resumen de notas.
  4. Incrustar en el pie de página del PDF el código QR que apunta a:
     `https://planteles.unsch.edu.pe/verificar?doc=<docHash>`.
  5. Al consultar `/verify-document`: validar el hash en base de datos. Si coincide, retornar HTTP 200 con la confirmación de autenticidad y datos oficiales; si no existe, retornar HTTP 404 (`DOCUMENT_INVALID_OR_NOT_FOUND`).
- **Contrato de Salida Público:**
  ```json
  {
    "success": true,
    "isAuthentic": true,
    "document": {
      "type": "BOLETA_OFICIAL_CALIFICACIONES",
      "studentName": "Quispe Gomez, Alexander",
      "academicYear": "2026",
      "issuedAt": "2026-09-21T14:30:00.000Z",
      "institution": "Planteles de Aplicación 'Guamán Poma de Ayala' - UNSCH",
      "generalAverage": 15.0
    }
  }
  ```

---

```
========================================================================================
MÓDULO TÉCNICO 12: MOTOR DE TRAZABILIDAD Y AUDITORÍA INSTITUCIONAL (RF-TEC-AUD)
========================================================================================
```

### RF-TEC-AUD-01: Bitácora Inmutable y Enmascaramiento Dinámico (Ley N.° 29733)
- **Trazabilidad:** `RF-62`, `RF-63`, `RF-64`, `RF-65`
- **Lógica:** Interceptores de auditoría que capturan snapshots JSONB de `old_values` y `new_values`. Tabla `audit_logs` con permisos revocados de `UPDATE` y `DELETE`. Encriptación AES-256 en reposo y supresión de datos confidenciales de menores en endpoints abiertos.

---

```
========================================================================================
MÓDULO TÉCNICO 13: DIFUSIÓN DIGITAL Y CONTENIDOS INSTITUCIONALES (RF-TEC-DIF)
========================================================================================
```

### RF-TEC-DIF-01: API de Cartelera Digital, Calendario y Contenidos del Plantel
- **Trazabilidad:** `RF-66`, `RF-67`, `RF-68`
- **Endpoints:** `GET /api/v1/public/announcements`, `GET /api/v1/public/academic-calendar`, `GET /api/v1/public/institutional-info`.
- **Lógica:** Respuestas cacheadas en Redis con revalidación ante modificaciones directivas.

---

## 4. MATRIZ DE TRAZABILIDAD TÉCNICA INTEGRAL (RF-01 AL RF-68)

| Requisito Documental | Requisito Técnico | Endpoint / Componente | Método HTTP | Tablas Principales | Rol Mínimo |
|:---:|:---:|---|:---:|---|:---:|
| `RF-01` | `RF-TEC-SEG-01` | `/api/v1/auth/login` | POST | `users`, `audit_logs` | Público |
| `RF-02` | `RF-TEC-SEG-02` | `/api/v1/auth/logout` | POST | Redis Denylist | Autenticado |
| `RF-03` | `RF-TEC-SEG-03` | `/api/v1/auth/reset-password` | POST | `users`, Redis Tokens | Público / Admin |
| `RF-04` | `RF-TEC-SEG-04` | `RbacMiddleware` | ALL | `roles`, `permissions` | Transversal |
| `RF-05` | `RF-TEC-USU-01` | `/api/v1/users` | POST | `users`, `audit_logs` | Admin, Director |
| `RF-06` | `RF-TEC-USU-02` | `/api/v1/users/:id` | DELETE | `users` (Soft Delete) | Admin |
| `RF-07` | `RF-TEC-USU-02` | `/api/v1/users/:id` | PATCH | `users`, `roles` | Admin, Director |
| `RF-08` | `RF-TEC-USU-03` | `/api/v1/users` | GET | `users` (GIN Trigram) | Directivos |
| `RF-09` | `RF-TEC-USU-03` | `/api/v1/profile` | PUT | `users` | Autenticado |
| `RF-10` | `RF-TEC-ADM-01` | `/api/v1/institution/profile` | PUT | `institution_profiles` | Director, Admin |
| `RF-11` | `RF-TEC-ADM-02` | `/api/v1/academic-periods` | POST | `academic_periods` | Coordinación |
| `RF-12` | `RF-TEC-ADM-02` | `/api/v1/curriculum/sections` | POST | `sections` | Coordinación |
| `RF-13` | `RF-TEC-ADM-02` | `/api/v1/curriculum/courses` | POST | `courses`, `competencies`| Coordinación |
| `RF-14` | `RF-TEC-ADM-02` | `/api/v1/curriculum/grading-scales`| POST | `grading_scales` | Dirección |
| `RF-15` | `RF-TEC-ACA-01` | `/api/v1/students` | POST | `students`, `users` | Secretaría |
| `RF-16` | `RF-TEC-ACA-01` | `/api/v1/enrollments` | POST | `enrollments`, `sections` | Secretaría |
| `RF-17` | `RF-TEC-ACA-02` | `/api/v1/academic/teaching-assignments`| POST | `teaching_assignments` | Coordinación |
| `RF-18` | `RF-TEC-ACA-02` | `/api/v1/academic/teaching-assignments`| POST | `teaching_assignments` | Coordinación |
| `RF-19` | `RF-TEC-ACA-01` | `/api/v1/sections/:id/roster` | GET | `enrollments`, `users` | Docentes |
| `RF-20` | `RF-TEC-AST-01` | `/api/v1/attendance/students/batch` | POST | `student_attendance` | Docentes |
| `RF-21` | `RF-TEC-AST-02` | `/api/v1/kiosk/gate-entry` | POST | Redis + `gate_access_logs`| Portería |
| `RF-22` | `RF-TEC-AST-01` | `/api/v1/attendance/justifications` | POST | `attendance_justifications`| Coordinación |
| `RF-23` | `RF-TEC-AST-01` | `/api/v1/attendance/students/:id` | GET | `student_attendance` | Alumnos, Docentes |
| `RF-24` | `RF-TEC-AST-01` | `EarlyWarningWorker` | Worker | `early_warning_alerts` | Sistema |
| **`RF-25`**| **`RF-TEC-AST-03`**| `/api/v1/kiosk/gate-entry/offline-batch-sync`| **POST** | **`gate_access_logs` (Sync)** | **Portería** |
| **`RF-26`**| **`RF-TEC-AST-04`**| `/api/v1/reports/student-id-cards` | **GET** | **`enrollments` (PDF QR)** | **Secretaría** |
| `RF-27` | `RF-TEC-PRA-01` | `/api/v1/practitioners/check-in` | POST | `practitioner_logs` | Practicantes |
| `RF-28` | `RF-TEC-PRA-01` | `/api/v1/practitioners/:id/hours` | GET | `practitioner_profiles`| Practicantes |
| `RF-29` | `RF-TEC-PRA-01` | `/api/v1/practitioners/batch-approve` | POST | `practitioner_logs` | Docentes Tutores |
| `RF-30` | `RF-TEC-PRA-01` | `/api/v1/reports/practitioner-card` | GET | `practitioner_profiles`| Coordinación |
| `RF-31` | `RF-TEC-DOC-01` | `/api/v1/attendance/contracted/mark` | POST | `teacher_logs` | Docentes Contratados|
| `RF-32` | `RF-TEC-DOC-01` | `/api/v1/attendance/contracted/reschedule`| POST | `schedules` | Coordinación |
| `RF-33` | `RF-TEC-DOC-01` | `/api/v1/attendance/contracted/monthly` | GET | `teacher_logs` | Secretaría |
| `RF-34` | `RF-TEC-DOC-01` | `/api/v1/attendance/contracted/real-time`| GET | `teacher_logs` | Coordinación |
| `RF-35` | `RF-TEC-NOT-01` | `/api/v1/evaluation-criteria` | POST | `evaluation_criteria` | Docentes Titulares |
| `RF-36` | `RF-TEC-NOT-01` | `/api/v1/grades/batch-upsert` | POST | `grades`, `audit_history` | Docentes Titulares |
| **`RF-37`**| **`RF-TEC-NOT-05`**| `FastGradeMatrixWidget` (Flutter) | **UI** | **Matrix Keyboard Parser** | **Docentes** |
| **`RF-38`**| **`RF-TEC-NOT-06`**| `/api/v1/curriculum/competencies/:id/conclusions` | **GET** | **`descriptive_conclusion_bank`**| **Docentes** |
| `RF-39` | `RF-TEC-NOT-01` | `/api/v1/grades/practitioner-proposals` | POST | `grade_proposals` | Practicantes |
| `RF-40` | `RF-TEC-NOT-01` | `GradingCalculationEngine` | Lógica | `student_period_summaries` | Sistema |
| `RF-41` | `RF-TEC-NOT-01` | `/api/v1/academic-periods/:id/close` | POST | `academic_periods` (Lock) | Coordinación |
| `RF-42` | `RF-TEC-NOT-01` | `/api/v1/grades/rectifications` | POST | `grade_rectifications` | Dirección |
| `RF-43` | `RF-TEC-NOT-02` | `wss://.../ws` (`GRADE_UPDATED`) | WSS | WebSockets Redis PubSub| Estudiantes |
| `RF-44` | `RF-TEC-CAL-01` | `/api/v1/analytics/heatmaps/academic` | GET | SQL CTE + Redis Cache | Directivos, Docentes|
| `RF-45` | `RF-TEC-CAL-01` | `/api/v1/analytics/heatmaps/attendance` | GET | `student_attendance` | Auxiliares |
| **`RF-46`**| **`RF-TEC-CAL-03`**| `/api/v1/analytics/heatmaps/drill-down` | **GET** | **`competencies`, `grades`** | **Coordinación** |
| `RF-47` | `RF-TEC-CAL-01` | `/api/v1/analytics/heatmaps/comparative` | GET | SQL Aggregation | Coordinación |
| `RF-48` | `RF-TEC-CAL-01` | `/api/v1/analytics/heatmaps/risk-overview`| GET | SQL Aggregation | Dirección General |
| `RF-49` | `RF-TEC-MON-01` | `/api/v1/dashboard/director-kpis` | GET | `dashboard_kpi_snapshots`| Dirección General |
| `RF-50` | `RF-TEC-MON-01` | `/api/v1/dashboard/coordinator-status` | GET | `teaching_assignments` | Coordinación |
| `RF-51` | `RF-TEC-MON-01` | `/api/v1/dashboard/teacher-summary` | GET | `schedules`, `grades` | Docentes |
| `RF-52` | `RF-TEC-MON-01` | `/api/v1/dashboard/student-progress` | GET | `student_summaries` | Estudiantes |
| **`RF-53`**| **`RF-TEC-MON-03`**| `/api/v1/students/:id/profile-360` | **GET** | **Holistic Aggregated SQL** | **Tutores, Director** |
| **`RF-54`**| **`RF-TEC-MON-04`**| `/api/v1/ssu/impact-metrics` | **GET** | **SSU Project Audit Logs** | **Tutor SSU UNSCH** |
| `RF-55` | `RF-TEC-MON-01` | `EarlyWarningWorker` | Worker | `early_warning_alerts` | Coordinación |
| `RF-56` | `RF-TEC-REP-01` | `/api/v1/reports/report-cards/:id` | GET | PDFKit Buffer Stream | Secretaría |
| **`RF-57`**| **`RF-TEC-REP-03`**| `/api/v1/public/verify-document` | **GET** | **`document_verification_registry`**| **Público General** |
| `RF-58` | `RF-TEC-REP-01` | `/api/v1/reports/merit-roll` | GET | SQL Ranking Window Func| Dirección |
| `RF-59` | `RF-TEC-REP-01` | `/api/v1/reports/class-grade-book` | GET | PDF Stream Engine | Docentes |
| `RF-60` | `RF-TEC-REP-01` | `/api/v1/reports/attendance-consolidated`| GET | PDF/Excel Stream | Secretaría |
| `RF-61` | `RF-TEC-REP-01` | `/api/v1/reports/export-excel` | POST | ExcelJS Stream Engine | Usuarios Autorizados|
| `RF-62` | `RF-TEC-AUD-01` | `AuditInterceptorMiddleware` | ALL | `audit_logs` (Inmutable) | Administrador |
| `RF-63` | `RF-TEC-AUD-01` | `/api/v1/audit/grades-history` | GET | `grades_audit_history` | Dirección |
| `RF-64` | `RF-TEC-AUD-01` | `/api/v1/audit/logs` | GET | `audit_logs` | Administrador |
| `RF-65` | `RF-TEC-AUD-01` | `DataSanitizerInterceptor` | ALL | Cifrado AES-256 | Transversal |
| `RF-66` | `RF-TEC-DIF-01` | `/api/v1/public/announcements` | GET | `announcements`, S3 | Toda la comunidad |
| `RF-67` | `RF-TEC-DIF-01` | `/api/v1/public/academic-calendar` | GET | `academic_events` | Toda la comunidad |
| `RF-68` | `RF-TEC-DIF-01` | `/api/v1/public/institutional-info` | GET | `institutional_pages` | Público General |

---

## 5. CRITERIOS DE VERIFICACIÓN Y CALIDAD TÉCNICA (QA)

1. **Rendimiento de Endpoints (SLA):**
   - Endpoints de consulta simple y Ficha 360°: Tiempo de respuesta P95 < 150 ms.
   - Microservicio de portería / kiosco online: P99 < 300 ms.
   - Sincronización en lote offline: hasta 100 registros en menos de 1 segundo.
   - Verificación documental pública por QR: Menor a 100 ms.
2. **Pruebas de Concurrencia:**
   - La API mantiene estabilidad sin errores 500 bajo carga sostenida de 200 usuarios concurrentes simulados con k6.
3. **Idempotencia y Manejo de Concurrencia:**
   - Endpoints `batch-upsert` y `offline-batch-sync` son idempotentes mediante identificadores de transacción UUID.
4. **Cobertura de Pruebas Automatizadas:**
   - Cobertura mínima de código del 80% en pruebas unitarias e integración en el cálculo de promedios, reglas de alerta temprana y firma criptográfica SHA-256.
