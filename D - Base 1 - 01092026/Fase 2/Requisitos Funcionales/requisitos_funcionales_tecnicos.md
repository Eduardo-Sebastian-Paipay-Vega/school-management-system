# ESPECIFICACIÓN TÉCNICA FORMAL DE REQUISITOS FUNCIONALES (SRS TÉCNICO)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco de Asignatura:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase II – Diseño y Desarrollo de Software (Especificación SRS Técnica)
- **Documento Fuente Base:** `Fase 1/Requerimientos/requerimientos_funcionales.md`
- **Nivel de Abstracción:** Especificación Técnica de Software (Arquitectura, Contratos de API REST, Lógica de Base de Datos, Transaccionalidad, Flujo de Datos y Eventos en Tiempo Real).

---

## 1. INTRODUCCIÓN Y ARQUITECTURA TÉCNICA DE REFERENCIA

El presente documento formaliza la **Especificación Técnica de los Requisitos Funcionales (RF-TEC)** para la plataforma web de gestión académica e información institucional. Mientras que la Fase I definió el comportamiento del sistema desde el punto de vista del negocio escolar y del usuario final, este documento de Fase II traduce cada requerimiento a especificaciones de ingeniería de software, detallando contratos de interfaz de programación (API RESTful), modelos de datos relacionales, transaccionalidad ACID, esquemas de seguridad de tokens, caché en memoria y canales de comunicación bidireccional en tiempo real.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE CLIENTE / PRESENTACIÓN (FRONTEND)                       │
│      Flutter Web / Desktop SPA (Dart 3.x / Material Design 3 / Responsive Layout)      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / WSS (JSON REST APIs & WebSockets)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                    CAPA DE PUERTA DE ENLACE Y CONTROLADORES (BACKEND)                  │
│       API Gateway / Controladores RESTful / Middleware RBAC / JWT Auth Interceptors    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                       CAPA DE SERVICIOS Y LÓGICA DE DOMINIO                            │
│  Servicio Autenticación │ Servicio Académico │ Servicio Asistencia │ Motor Calificaciones│
│  Servicio Reportes PDF  │ Motor Mapas Calor  │ Gestor Auditoría    │ Servicio Difusión   │
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
- **MÓDULO TÉCNICO 5: API de Asistencia Estudiantil y Servicio de Kiosco/Portería** (`RF-TEC-AST`)
- **MÓDULO TÉCNICO 6: API de Asistencia y Cómputo de Horas de Practicantes** (`RF-TEC-PRA`)
- **MÓDULO TÉCNICO 7: API de Control de Asistencia y Horas de Docentes Contratados** (`RF-TEC-DOC`)
- **MÓDULO TÉCNICO 8: Motor de Calificaciones en Tiempo Real, WebSockets y Cierres** (`RF-TEC-NOT`)
- **MÓDULO TÉCNICO 9: Motor de Generación y Agregación de Mapas de Calor** (`RF-TEC-CAL`)
- **MÓDULO TÉCNICO 10: API de Tableros de Control, Métricas y Alertas Tempranas** (`RF-TEC-MON`)
- **MÓDULO TÉCNICO 11: Servicio de Generación y Exportación de Reportes (PDF/Excel)** (`RF-TEC-REP`)
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
- **Trazabilidad Fase 1:** `RF-SEG-01`
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
- **Trazabilidad Fase 1:** `RF-SEG-02`
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
- **Trazabilidad Fase 1:** `RF-SEG-03`
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
- **Trazabilidad Fase 1:** `RF-SEG-04`
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
- **Trazabilidad Fase 1:** `RF-USU-01`
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
  -- 1. Validar unicidad de DNI y email dentro del tenant
  SELECT id FROM users WHERE (dni = :dni OR email = :email) AND tenant_id = :tenantId FOR UPDATE;
  -- 2. Inserción del usuario con password hash inicial y flag de cambio obligatorio
  INSERT INTO users (id, tenant_id, dni, names, paternal_surname, maternal_surname, email, phone, role_id, employment_type, password_hash, status, must_change_password, created_at)
  VALUES (gen_random_uuid(), :tenantId, :dni, :names, :paternalSurname, :maternalSurname, :email, :phoneNumber, :roleId, :employmentType, :defaultHash, 'ACTIVE', true, NOW())
  RETURNING id;
  -- 3. Inserción en bitácora de auditoría
  INSERT INTO audit_logs (id, tenant_id, user_id, action, entity, entity_id, new_values, created_at)
  VALUES (gen_random_uuid(), :tenantId, :authUserId, 'CREATE_USER', 'users', :newId, :jsonNewValues, NOW());
  COMMIT;
  ```
- **Contrato de Salida (HTTP 201 Created):** Objeto usuario creado sanitizado (sin `password_hash`).

---

### RF-TEC-USU-02: Endpoint de Actualización y Baja Lógica (Soft Delete)
- **Trazabilidad Fase 1:** `RF-USU-02`
- **Endpoints:**
  - `PATCH /api/v1/users/:id` (Modificación de datos informativos)
  - `DELETE /api/v1/users/:id` (Desactivación / Baja lógica)
- **Lógica Técnica de Procesamiento:**
  1. Para eliminación: ejecutar actualización `UPDATE users SET status = 'INACTIVE', is_deleted = true, deleted_at = NOW(), updated_at = NOW() WHERE id = :id AND tenant_id = :tenantId`.
  2. Prohibición estricta de ejecución de `DELETE FROM users` mediante disparador (trigger) de base de datos que aborta si existen llaves foráneas activas en `grades` o `attendance_records`.
  3. Inmediata revocación de todos los tokens activos del usuario en Redis (`DEL user_tokens:<userId>`).
- **Contrato de Salida:** HTTP 200 OK con confirmación de estado inactivo.

---

### RF-TEC-USU-03: Endpoint de Búsqueda Indexada y Paginación del Directorio
- **Trazabilidad Fase 1:** `RF-USU-04`
- **Endpoint:** `GET /api/v1/users`
- **Parámetros Query:** `?page=1&limit=20&search=flores&role=ROLE_TEACHER&status=ACTIVE&sortBy=paternalSurname&sortOrder=ASC`
- **Lógica Técnica de Base de Datos:**
  - Consulta con operador trigram / ILIKE para coincidencia parcial:
    ```sql
    SELECT u.id, u.dni, u.names, u.paternal_surname, u.maternal_surname, u.email, u.phone, r.name as role_name, u.employment_type, u.status
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.tenant_id = :tenantId
      AND u.is_deleted = false
      AND (:role IS NULL OR r.name = :role)
      AND (:status IS NULL OR u.status = :status)
      AND (:search IS NULL OR (u.dni ILIKE :searchPattern OR (u.paternal_surname || ' ' || u.maternal_surname || ' ' || u.names) ILIKE :searchPattern))
    ORDER BY u.paternal_surname ASC
    LIMIT :limit OFFSET :offset;
    ```
  - Headers de respuesta para paginación: `X-Total-Count`, `X-Total-Pages`, `X-Current-Page`.
  - Latencia P95 optimizada mediante índice GIN: `CREATE INDEX idx_users_search ON users USING gin ((paternal_surname || ' ' || maternal_surname || ' ' || names) gin_trgm_ops)`.

---

```
========================================================================================
MÓDULO TÉCNICO 3: API DE PARAMETRIZACIÓN Y ESTRUCTURA ORGANIZACIONAL (RF-TEC-ADM)
========================================================================================
```

### RF-TEC-ADM-01: API de Parametrización Institucional y Almacenamiento de Activos
- **Trazabilidad Fase 1:** `RF-ADM-01`
- **Endpoints:**
  - `GET /api/v1/institution/profile`
  - `PUT /api/v1/institution/profile`
  - `POST /api/v1/institution/logo` (Carga multipart/form-data)
- **Lógica Técnica de Procesamiento:**
  1. Validación del archivo de logotipo: formato MIME estricto (`image/png`, `image/jpeg`, `image/webp`), tamaño máximo 2 MB.
  2. Procesamiento de imagen en memoria con librería de optimización: redimensionamiento automático a resolución estándar (512x512 px) y conversión a WebP para máxima velocidad de carga.
  3. Carga hacia servicio de almacenamiento compatible con S3 (MinIO / AWS S3) con ACL privada y generación de URL institucional con CDN / Caché de 24 horas.

---

### RF-TEC-ADM-02: API de Gestión de Periodos Lectivos y Cierre Programado
- **Trazabilidad Fase 1:** `RF-ADM-02`, `RF-ADM-03`, `RF-ADM-04`, `RF-ADM-05`
- **Endpoints:**
  - `POST /api/v1/academic-years` (Creación de Año Lectivo)
  - `POST /api/v1/academic-periods` (Creación de Bimestres/Trimestres)
  - `GET /api/v1/academic-periods/current`
  - `POST /api/v1/curriculum/courses` (Alta de Asignaturas y Competencias)
  - `POST /api/v1/curriculum/grading-scales` (Configuración de Escala Vigesimal / Literal)
- **Restricciones de Integridad y Triggers de Base de Datos:**
  - Invariante temporal: `CONSTRAINT check_period_dates CHECK (start_date < end_date AND grade_submission_deadline <= end_date)`.
  - Invariante de escala evaluativa:
    ```sql
    CREATE TABLE grading_scales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('NUMERIC_20', 'LITERAL_MINEDU')),
      min_score NUMERIC(4,2) NOT NULL,
      max_score NUMERIC(4,2) NOT NULL,
      passing_score NUMERIC(4,2) NOT NULL,
      scale_mapping JSONB NOT NULL -- Define equivalencias: [{"literal": "AD", "min": 18, "max": 20}, ...]
    );
    ```

---

```
========================================================================================
MÓDULO TÉCNICO 4: API DE GESTIÓN ACADÉMICA, MATRÍCULA Y CARGA LECTIVA (RF-TEC-ACA)
========================================================================================
```

### RF-TEC-ACA-01: API de Registro y Matrícula Masiva Transaccional
- **Trazabilidad Fase 1:** `RF-ACA-01`, `RF-ACA-02`
- **Endpoints:**
  - `POST /api/v1/students` (Registro individual de estudiante)
  - `POST /api/v1/students/bulk-import` (Carga masiva desde archivo CSV/Excel)
  - `POST /api/v1/enrollments` (Matrícula formal en sección)
- **Lógica Técnica de Procesamiento y Validación de Aforos:**
  1. La matrícula se ejecuta dentro de una transacción con bloqueo pesimista sobre la sección:
     ```sql
     BEGIN;
     SELECT current_students, max_capacity FROM sections WHERE id = :sectionId FOR UPDATE;
     -- Validar: IF current_students >= max_capacity THEN ROLLBACK y emitir HTTP 409 (SECTION_CAPACITY_EXCEEDED)
     INSERT INTO enrollments (id, tenant_id, student_id, section_id, academic_year_id, status, enrolled_at)
     VALUES (gen_random_uuid(), :tenantId, :studentId, :sectionId, :yearId, 'ENROLLED', NOW());
     UPDATE sections SET current_students = current_students + 1 WHERE id = :sectionId;
     COMMIT;
     ```
  2. Generación automática de credenciales de consulta para el estudiante: username = DNI, contraseña temporal generada, asignación de rol `ROLE_STUDENT`.

---

### RF-TEC-ACA-02: API de Asignación y Control de Carga Lectiva Docente
- **Trazabilidad Fase 1:** `RF-ACA-03`, `RF-ACA-04`
- **Endpoint:** `POST /api/v1/academic/teaching-assignments`
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "teacherId": "uuid",
    "courseId": "uuid",
    "sectionId": "uuid",
    "academicYearId": "uuid",
    "weeklyHours": 4,
    "assignedPractitionerId": "uuid (opcional)"
  }
  ```
- **Validación de Integridad:** Clave única compuesta en base de datos: `UNIQUE (course_id, section_id, academic_year_id)` para prevenir la asignación duplicada de dos docentes titulares al mismo curso en la misma sección.

---

```
========================================================================================
MÓDULO TÉCNICO 5: ASISTENCIA ESTUDIANTIL Y SERVICIO DE KIOSCO/PORTERÍA (RF-TEC-AST)
========================================================================================
```

### RF-TEC-AST-01: API de Registro Masivo de Asistencia en Aula (Batch Operation)
- **Trazabilidad Fase 1:** `RF-AST-01`
- **Endpoint:** `POST /api/v1/attendance/students/batch`
- **Roles Autorizados:** `ROLE_TEACHER`, `ROLE_COORDINATOR`.
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "sectionId": "uuid",
    "courseId": "uuid",
    "sessionDate": "2026-09-21",
    "blockNumber": 1,
    "records": [
      { "studentId": "uuid-1", "status": "PRESENT", "lateMinutes": 0, "remarks": null },
      { "studentId": "uuid-2", "status": "LATE", "lateMinutes": 12, "remarks": "Llegó al segundo bloque" },
      { "studentId": "uuid-3", "status": "ABSENT_UNJUSTIFIED", "lateMinutes": 0, "remarks": null }
    ]
  }
  ```
- **Lógica Técnica de Procesamiento:**
  1. Comprobar que `sessionDate <= CURRENT_DATE` (bloquear fechas futuras).
  2. Operación de persistencia con patrón `UPSERT` en PostgreSQL:
     ```sql
     INSERT INTO student_attendance (id, tenant_id, student_id, section_id, course_id, session_date, block_number, status, late_minutes, remarks, recorded_by, created_at)
     VALUES (:id, :tenantId, :studentId, :sectionId, :courseId, :sessionDate, :blockNumber, :status, :lateMinutes, :remarks, :userId, NOW())
     ON CONFLICT (student_id, course_id, session_date, block_number)
     DO UPDATE SET status = EXCLUDED.status, late_minutes = EXCLUDED.late_minutes, remarks = EXCLUDED.remarks, updated_at = NOW()
     WHERE student_attendance.is_locked = false;
     ```
  3. Disparo asíncrono de verificación de alertas: enviar mensaje al bus de eventos interno para evaluar si el alumno acumuló 3 faltas consecutivas y activar la alerta temprana (`RF-TEC-MON-05`).

---

### RF-TEC-AST-02: Micro-Servicio Kiosco de Control de Puerta y Portería ("Wachiman")
- **Trazabilidad Fase 1:** `RF-AST-02`
- **Endpoint de Ultra-Baja Latencia:** `POST /api/v1/kiosk/gate-entry`
- **Roles Autorizados:** `ROLE_SECURITY`, `ROLE_ADMIN`.
- **Tiempo Objetivo de Respuesta:** P99 < 300 ms.
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "scanPayload": "string (DNI digitado de 8 dígitos o código de barras/QR escaneado)",
    "gateId": "PUERTA_PRINCIPAL",
    "scanTimestamp": "2026-09-21T07:42:15.120Z"
  }
  ```
- **Lógica Técnica de Alto Rendimiento:**
  1. Consulta optimizada en caché Redis con clave hash `student_gate_cache:<dni>`:
     - Si está en caché: recuperar datos del estudiante en 2 ms (foto, nombres, sección, horario de entrada).
     - Si no está en caché: buscar en PostgreSQL y poblar caché con TTL de 12 horas.
  2. Evaluación de horario institucional:
     - Horario parametrizado de entrada matutina: 07:30:00 (Tolerancia: 10 minutos hasta las 07:40:00).
     - Si `scanTimestamp <= 07:40:00` → `status = "PUNCTUAL"`, `lateMinutes = 0`.
     - Si `scanTimestamp > 07:40:00` → `status = "LATE"`, `lateMinutes = DATEDIFF(scanTimestamp - 07:30:00)`.
  3. Inserción asíncrona no bloqueante (Write-Behind Cache / Queue) en la tabla `gate_access_logs`.
- **Contrato de Salida Inmediato (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "status": "LATE",
    "lateMinutes": 12,
    "student": {
      "fullName": "Quispe Gomez, Alexander",
      "gradeSection": "4° B Secundaria",
      "photoUrl": "https://cdn.planteles.unsch.edu.pe/photos/std-4102.webp"
    },
    "feedback": {
      "color": "#F59E0B",
      "sound": "ALERT_LATE",
      "message": "Tardanza registrada (12 minutos)"
    }
  }
  ```

---

```
========================================================================================
MÓDULO TÉCNICO 6: API DE ASISTENCIA Y HORAS DE PRACTICANTES (RF-TEC-PRA)
========================================================================================
```

### RF-TEC-PRA-01: API de Marcaje Biométrico / Web y Cómputo de Horas Efectivas
- **Trazabilidad Fase 1:** `RF-PRA-01`, `RF-PRA-02`
- **Endpoints:**
  - `POST /api/v1/practitioners/check-in` (Registro de entrada)
  - `POST /api/v1/practitioners/check-out` (Registro de salida y cálculo)
  - `GET /api/v1/practitioners/:id/hours-summary`
- **Lógica Técnica de Procesamiento:**
  1. Al registrar check-in: validar que no exista una entrada abierta sin salida en el día; guardar `check_in_time = NOW()`.
  2. Al registrar check-out: validar existencia de check-in del mismo día; guardar `check_out_time = NOW()`.
  3. Cálculo de duración en minutos: `duration_minutes = EXTRACT(EPOCH FROM (check_out_time - check_in_time))/60`.
  4. Redondeo formal a horas pedagógicas o cronológicas según directiva universitaria (1 hora pedagógica = 45 minutos).
  5. Registro con estado inicial `status = "PENDING_APPROVAL"`.

---

### RF-TEC-PRA-02: Endpoint de Aprobación y Firma Digital del Docente Tutor
- **Trazabilidad Fase 1:** `RF-PRA-03`, `RF-PRA-04`
- **Endpoint:** `POST /api/v1/practitioners/sessions/batch-approve`
- **Roles Autorizados:** `ROLE_TEACHER` (Tutor titular asignado), `ROLE_COORDINATOR`.
- **Contrato de Entrada:**
  ```json
  {
    "sessionIds": ["uuid-1", "uuid-2", "uuid-3"],
    "action": "APPROVE",
    "supervisorRemarks": "Cumplió satisfactoriamente con la sesión de apoyo pedagógico"
  }
  ```
- **Lógica Técnica:** Transacción ACID que actualiza `status = 'APPROVED'`, asienta el `approved_by = req.user.id`, `approved_at = NOW()`, y suma las horas al total oficial acumulado del practicante en `practitioner_profiles.validated_hours`.

---

```
========================================================================================
MÓDULO TÉCNICO 7: ASISTENCIA Y HORAS DE DOCENTES CONTRATADOS (RF-TEC-DOC)
========================================================================================
```

### RF-TEC-DOC-01: API de Marcación y Cotejo Automatizado con Horario Lectivo
- **Trazabilidad Fase 1:** `RF-DOC-01`, `RF-DOC-03`, `RF-DOC-04`
- **Endpoints:**
  - `POST /api/v1/attendance/contracted-teachers/mark`
  - `GET /api/v1/attendance/contracted-teachers/monthly-summary?month=9&year=2026`
- **Lógica Técnica de Base de Datos:**
  - Cruce relacional automático entre el horario programado del docente (`teacher_schedules`) y el log de marcación (`teacher_attendance_logs`):
    ```sql
    SELECT 
      ts.id as schedule_id,
      ts.course_id,
      ts.start_time,
      ts.end_time,
      tal.marked_at,
      CASE 
        WHEN tal.marked_at IS NULL THEN 'ABSENT'
        WHEN tal.marked_at <= (ts.start_time + INTERVAL '10 minutes') THEN 'PUNCTUAL'
        ELSE 'LATE'
      END as attendance_status,
      COALESCE(EXTRACT(EPOCH FROM (tal.marked_at - ts.start_time))/60, 0) as delay_minutes
    FROM teacher_schedules ts
    LEFT JOIN teacher_attendance_logs tal ON ts.id = tal.schedule_id AND tal.marked_date = CURRENT_DATE
    WHERE ts.teacher_id = :teacherId AND ts.day_of_week = EXTRACT(DOW FROM CURRENT_DATE);
    ```

---

```
========================================================================================
MÓDULO TÉCNICO 8: MOTOR DE CALIFICACIONES EN TIEMPO REAL Y WEBSOCKETS (RF-TEC-NOT)
========================================================================================
```

### RF-TEC-NOT-01: API Transaccional de Registro y Modificación de Notas
- **Trazabilidad Fase 1:** `RF-NOT-01`, `RF-NOT-02`
- **Endpoint:** `POST /api/v1/grades/batch-upsert`
- **Roles Autorizados:** `ROLE_TEACHER` (Titular del curso).
- **Contrato de Entrada (JSON Body):**
  ```json
  {
    "courseId": "uuid",
    "sectionId": "uuid",
    "periodId": "uuid",
    "evaluationCriteriaId": "uuid",
    "grades": [
      { "studentId": "uuid-1", "score": 17.5, "comments": "Excelente análisis" },
      { "studentId": "uuid-2", "score": 11.0, "comments": null }
    ]
  }
  ```
- **Lógica Técnica Transaccional y Validaciones Críticas:**
  1. Verificar estado del periodo académico:
     `SELECT is_closed FROM academic_periods WHERE id = :periodId;` → Si es `true`, abortar con HTTP 403 (`PERIOD_CLOSED_FOR_EDITING`).
  2. Validar que el usuario que ejecuta la petición sea el docente asignado a la asignatura y sección:
     `SELECT id FROM teaching_assignments WHERE teacher_id = :userId AND course_id = :courseId AND section_id = :sectionId;` → Si no coincide, abortar con HTTP 403 (`FORBIDDEN_TEACHING_ASSIGNMENT`).
  3. Validar rango de notas según la escala oficial configurada (`score BETWEEN min_score AND max_score`).
  4. En una transacción `BEGIN ... COMMIT`:
     - Para cada estudiante, capturar el valor anterior si existe:
       `SELECT score FROM grades WHERE student_id = :sId AND evaluation_criteria_id = :ecId;`
     - Asentar o actualizar la calificación en la tabla `grades`.
     - Si la nota fue modificada, insertar en `grades_audit_history` el registro inalterable con `old_score`, `new_score`, `changed_by`, `timestamp`.
  5. Ejecutar la función interna de cálculo de promedio de competencia y promedio de periodo (`RF-TEC-NOT-02`).

---

### RF-TEC-NOT-02: Motor de Cálculo Automatizado de Promedios Ponderados
- **Trazabilidad Fase 1:** `RF-NOT-04`
- **Componente:** `GradingCalculationEngine` (Invocado síncronamente tras persistencia de notas).
- **Fórmula de Promedio Ponderado de Competencia / Bimestre:**
  $$\text{Promedio Competencia} = \frac{\sum_{i=1}^{n} (\text{Nota}_i \times \text{Peso}_i)}{\sum_{i=1}^{n} \text{Peso}_i}$$
- **Lógica Técnica de Redondeo y Persistencia:**
  - Los promedios parciales de evaluaciones intermedias se mantienen en formato numérico flotante con 2 decimales (`NUMERIC(4,2)`).
  - El promedio final del periodo se procesa mediante regla institucional de redondeo simétrico (`ROUND(score, 0)` si escala es vigesimal, convirtiendo 10.5 a 11).
  - Si la escala es literal (MINEDU), se aplica la matriz de decisión cualitativa oficial almacenada en la tabla `grading_scales.scale_mapping`.
  - El resultado consolidado se persiste en la tabla resumen `student_period_summaries` con bloqueo optimista mediante columna `version`.

---

### RF-TEC-NOT-03: Servicio de Difusión en Tiempo Real mediante WebSockets
- **Trazabilidad Fase 1:** `RF-NOT-02`, `RF-NOT-07`
- **Protocolo:** WebSocket Seguro (`wss://planteles.unsch.edu.pe/ws`)
- **Gestor de Mensajería:** Redis Pub/Sub integrado con WebSocket Gateway.
- **Flujo de Eventos en Tiempo Real:**
  1. Tras completarse con éxito la transacción de notas en la API REST, el servicio emite un mensaje en el canal Redis `channel:section:<sectionId>:grades`.
  2. El servidor WebSocket captura el evento y lo retransmite de inmediato a los sockets activos suscritos a esa sala.
  3. **Payload del Evento WebSocket (`GRADE_UPDATED`):**
     ```json
     {
       "event": "GRADE_UPDATED",
       "timestamp": "2026-09-21T15:40:12.000Z",
       "data": {
         "courseId": "uuid",
         "periodId": "uuid",
         "studentId": "uuid-1",
         "newAverage": 16.0,
         "updatedBy": "Prof. Carlos Mendoza"
       }
     }
     ```
  4. En la interfaz cliente Flutter del estudiante y del coordinador, el componente de vista reacciona instantáneamente sin requerir que el usuario recargue manualmente el navegador web.

---

### RF-TEC-NOT-04: API de Cierre Oficial de Periodo y Bloqueo Concurrente
- **Trazabilidad Fase 1:** `RF-NOT-05`, `RF-NOT-06`
- **Endpoints:**
  - `POST /api/v1/academic-periods/:id/close` (Cierre masivo)
  - `POST /api/v1/grades/rectification-requests` (Solicitud de rectificación)
  - `POST /api/v1/grades/rectification-requests/:id/approve` (Aprobación directiva)
- **Mecanismo de Bloqueo:**
  - Al cerrar el periodo: `UPDATE academic_periods SET is_closed = true, closed_at = NOW(), closed_by = :userId WHERE id = :periodId`.
  - Disparador (Trigger) a nivel de base de datos en PostgreSQL:
    ```sql
    CREATE OR REPLACE FUNCTION enforce_grade_period_lock() RETURNS TRIGGER AS $$
    BEGIN
      IF (SELECT is_closed FROM academic_periods WHERE id = NEW.period_id) = true AND (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        IF NOT EXISTS (SELECT 1 FROM grade_rectifications WHERE grade_id = OLD.id AND status = 'APPROVED_BY_DIRECTOR' AND is_applied = false) THEN
          RAISE EXCEPTION 'No se pueden modificar calificaciones de un periodo cerrado sin una rectificación formal aprobada.';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    ```

---

```
========================================================================================
MÓDULO TÉCNICO 9: MOTOR DE GENERACIÓN Y AGREGACIÓN DE MAPAS DE CALOR (RF-TEC-CAL)
========================================================================================
```

### RF-TEC-CAL-01: Servicio de Agregación y Matriz Térmica de Rendimiento
- **Trazabilidad Fase 1:** `RF-CAL-01`, `RF-CAL-03`, `RF-CAL-04`
- **Endpoint:** `GET /api/v1/analytics/heatmaps/academic-performance`
- **Parámetros Query:** `?periodId=uuid&sectionId=uuid&gradeId=uuid`
- **Estructura de la Consulta de Agregación de Alto Rendimiento (SQL CTE):**
  ```sql
  WITH StudentCourseScores AS (
    SELECT 
      e.student_id,
      u.paternal_surname || ' ' || u.maternal_surname || ', ' || u.names as student_name,
      c.id as course_id,
      c.name as course_name,
      COALESCE(sps.final_score, 0) as score,
      CASE 
        WHEN sps.final_score >= 17 THEN 'LEVEL_OUTSTANDING'  -- Verde Intenso (#10B981)
        WHEN sps.final_score >= 14 THEN 'LEVEL_EXPECTED'     -- Verde Claro (#34D399)
        WHEN sps.final_score >= 11 THEN 'LEVEL_RISK_PASS'    -- Amarillo (#FBBF24)
        ELSE 'LEVEL_FAILED'                                  -- Rojo (#EF4444)
      END as heat_level
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN sections sec ON e.section_id = sec.id
    JOIN teaching_assignments ta ON ta.section_id = sec.id
    JOIN courses c ON ta.course_id = c.id
    LEFT JOIN student_period_summaries sps ON sps.student_id = e.student_id AND sps.course_id = c.id AND sps.period_id = :periodId
    WHERE e.section_id = :sectionId AND e.status = 'ENROLLED'
  )
  SELECT json_build_object(
    'sectionId', :sectionId,
    'matrix', json_agg(StudentCourseScores)
  ) FROM StudentCourseScores;
  ```
- **Optimización de Caché en Redis:**
  - Clave en memoria: `heatmap:academic:<tenantId>:<periodId>:<sectionId>`.
  - TTL: 1 hora, con invalidación inmediata ante cualquier emisión de evento `GRADE_UPDATED` sobre esa sección.
  - Tiempo de respuesta de la API: menor a 40 ms cuando es servido desde caché Redis.

---

### RF-TEC-CAL-02: API de Mapa de Calor de Asistencia Temporal y Detección de Frecuencia
- **Trazabilidad Fase 1:** `RF-CAL-02`
- **Endpoint:** `GET /api/v1/analytics/heatmaps/attendance`
- **Parámetros Query:** `?startDate=2026-09-01&endDate=2026-09-30&sectionId=uuid`
- **Lógica Técnica de Procesamiento:**
  1. Generación de serie temporal continua de fechas lectivas (`generate_series(startDate, endDate, '1 day'::interval)`).
  2. Cruce matricial con las inasistencias registradas para calcular el Coeficiente de Ausentismo Diario ($CAD$):
     $$CAD = \frac{\text{Total Inasistencias del Día}}{\text{Total Alumnos Matriculados}} \times 100$$
  3. Asignación de escala cromática térmica:
     - 0% a 5% ausencias: Verde (`#10B981`)
     - 6% a 15% ausencias: Amarillo (`#F59E0B`)
     - 16% a 30% ausencias: Naranja (`#F97316`)
     - > 30% ausencias: Rojo Crítico (`#DC2626`)
  4. Retorno de la matriz formateada para el renderizado nativo en Canvas/CustomPainter de Flutter.

---

```
========================================================================================
MÓDULO TÉCNICO 10: TABLEROS DE CONTROL, MÉTRICAS Y ALERTAS TEMPRANAS (RF-TEC-MON)
========================================================================================
```

### RF-TEC-MON-01: API de Métricas Ejecutivas Consolidadas para Dashboards
- **Trazabilidad Fase 1:** `RF-MON-01`, `RF-MON-02`, `RF-MON-03`, `RF-MON-04`
- **Endpoints:**
  - `GET /api/v1/dashboard/director-kpis`
  - `GET /api/v1/dashboard/coordinator-status`
  - `GET /api/v1/dashboard/teacher-summary`
  - `GET /api/v1/dashboard/student-progress`
- **Especificación del Contrato de Salida de KPIs Directivos:**
  ```json
  {
    "success": true,
    "data": {
      "totalStudentsEnrolled": 1420,
      "dailyAttendanceRate": 96.4,
      "teachersPendingGradeSubmission": 3,
      "globalPassingRate": 88.2,
      "studentsAtRiskCount": 24,
      "recentAuditAlertsCount": 2,
      "gradeDistribution": {
        "outstanding": 320,
        "expected": 810,
        "inProcess": 210,
        "atRisk": 80
      }
    }
  }
  ```
- **Estrategia de Actualización:** Cálculo en segundo plano programado cada 15 minutos mediante tarea programada (Cron Job) y persistido en tabla de agregados `dashboard_kpi_snapshots` para evitar consultas agregadas pesadas sobre la base de datos operativa.

---

### RF-TEC-MON-02: Servicio Automatizado de Evaluación y Emisión de Alertas de Deserción
- **Trazabilidad Fase 1:** `RF-MON-05`
- **Componente:** `EarlyWarningWorker` (Servicio en segundo plano / Worker).
- **Lógica Algorítmica de Clasificación de Riesgo:**
  1. Se ejecuta diariamente a las 18:00 horas (al finalizar la jornada escolar).
  2. Consulta de estudiantes que satisfacen las siguientes condiciones de regla de negocio:
     - **Regla R1 (Inasistencia Crónica):** Inasistencias injustificadas acumuladas en el periodo $\ge 10\%$.
     - **Regla R2 (Riesgo Académico Crítico):** Calificaciones desaprobatorias vigentes en 3 o más áreas curriculares.
     - **Regla R3 (Tardanzas Reiteradas):** Más de 5 tardanzas injustificadas en los últimos 15 días calendario.
  3. Puntuación de Riesgo Ponderada:
     $$\text{RiskScore} = (R_1 \times 0.40) + (R_2 \times 0.45) + (R_3 \times 0.15)$$
  4. Si $\text{RiskScore} \ge 0.60$, insertar registro en tabla `early_warning_alerts` con severidad `HIGH` y generar notificación interna hacia el Coordinador Académico y el Docente Tutor.

---

```
========================================================================================
MÓDULO TÉCNICO 11: SERVICIO DE GENERACIÓN Y EXPORTACIÓN DE REPORTES (RF-TEC-REP)
========================================================================================
```

### RF-TEC-REP-01: Micro-Servicio de Compilación de Boletas y Registros en PDF
- **Trazabilidad Fase 1:** `RF-REP-01`, `RF-REP-02`, `RF-REP-03`
- **Endpoints:**
  - `GET /api/v1/reports/report-cards/:studentId?periodId=uuid` (Boleta individual PDF)
  - `POST /api/v1/reports/report-cards/bulk-section` (Generación de lote completo de sección en ZIP/PDF concatenado)
  - `GET /api/v1/reports/class-grade-book?courseId=uuid&sectionId=uuid` (Registro Auxiliar Oficial)
- **Pipeline Técnico de Generación de Documentos:**
  1. Extracción de datos enriquecidos en una sola consulta relacional optimizada (datos institucionales, estudiante, notas por competencia, asistencias, firmas).
  2. Renderizado de plantilla con motor de renderizado HTML5/CSS3 desacoplado (Handlebars / Chromium Headless / PDFKit).
  3. Inyección estricta de membrete institucional, logotipo en formato vectorial o WebP optimizado, marcas de agua y código QR de verificación de autenticidad documental que apunta a:
     `https://planteles.unsch.edu.pe/verify-doc?code=<hashSha256>`.
  4. Flujo de respuesta HTTP mediante Streaming (`Content-Type: application/pdf`, `Content-Disposition: inline; filename="Boleta_2026_4B_Quispe.pdf"`).
  5. Tiempo de compilación P95: menor a 1.2 segundos por documento individual.

---

### RF-TEC-REP-02: Motor de Exportación Dinámica a Hojas de Cálculo (Excel / CSV)
- **Trazabilidad Fase 1:** `RF-REP-04`, `RF-REP-05`
- **Endpoint:** `POST /api/v1/reports/export-excel`
- **Contrato de Entrada:**
  ```json
  {
    "reportType": "CONSOLIDATED_ATTENDANCE_MONTHLY",
    "filters": {
      "month": 9,
      "year": 2026,
      "level": "SECONDARY"
    }
  }
  ```
- **Lógica Técnica:**
  1. Uso de librería de generación de hojas de cálculo basada en flujos de memoria (`ExcelJS` / streaming buffer), evitando saturación de memoria RAM ante reportes con más de 5,000 registros.
  2. Tipado estricto de celdas (formato numérico con dos decimales para notas, fechas formateadas ISO, cadenas alfanuméricas para DNI preservando ceros iniciales).
  3. Retorno mediante cabecera `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

```
========================================================================================
MÓDULO TÉCNICO 12: MOTOR DE TRAZABILIDAD Y AUDITORÍA INSTITUCIONAL (RF-TEC-AUD)
========================================================================================
```

### RF-TEC-AUD-01: Middleware de Intercepción y Bitácora de Eventos Inmutable
- **Trazabilidad Fase 1:** `RF-AUD-01`, `RF-AUD-02`, `RF-AUD-03`
- **Componente:** `AuditInterceptorMiddleware` → `AuditLoggerService`
- **Endpoints de Consulta:** `GET /api/v1/audit/logs?page=1&limit=50&action=UPDATE_GRADE`
- **Estructura de la Tabla de Base de Datos Inmutable (`audit_logs`):**
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'UPDATE_GRADE', 'RECTIFY_GRADE'
    entity_name VARCHAR(50) NOT NULL, -- 'grades', 'users', 'student_attendance'
    entity_id UUID NOT NULL,
    old_values JSONB, -- Captura snapshot anterior completo
    new_values JSONB, -- Captura snapshot nuevo completo
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    severity VARCHAR(10) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARN', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  );
  -- Inmutabilidad técnica: regla que revoca permisos de UPDATE y DELETE sobre la tabla
  REVOKE UPDATE, DELETE ON audit_logs FROM public, app_user;
  CREATE INDEX idx_audit_logs_tenant_action ON audit_logs (tenant_id, action, created_at DESC);
  ```

---

### RF-TEC-AUD-02: Cumplimiento Técnico de Privacidad de Datos de Menores (Ley N.° 29733)
- **Trazabilidad Fase 1:** `RF-AUD-04`
- **Componente:** `DataSanitizerInterceptor` (Serializador de Respuestas de API).
- **Mecanismos Técnicos de Protección:**
  1. Encriptación en reposo (Encryption at Rest) de la base de datos PostgreSQL utilizando cifrado AES-256 (módulo `pgcrypto` o cifrado a nivel de volumen de almacenamiento VPS).
  2. Enmascaramiento dinámico de datos: los endpoints públicos de la plataforma jamás serializan identificadores sensibles de menores ni libretas completas sin un token de sesión autenticado y validado contra el `student_id`.
  3. Prevención de fugas de datos (DLP): eliminación de cualquier campo técnico interno (ej. contraseñas hasheadas, tokens, IPs internas) en las respuestas de la API mediante interceptores de serialización (`class-transformer` / esquemas DTO estrictos).

---

```
========================================================================================
MÓDULO TÉCNICO 13: DIFUSIÓN DIGITAL Y CONTENIDOS INSTITUCIONALES (RF-TEC-DIF)
========================================================================================
```

### RF-TEC-DIF-01: API de Cartelera Digital, Circulares y Contenido Institucional
- **Trazabilidad Fase 1:** `RF-DIF-01`, `RF-DIF-02`, `RF-DIF-03`
- **Endpoints:**
  - `GET /api/v1/public/announcements` (Avisos vigentes públicos)
  - `POST /api/v1/admin/announcements` (Creación de avisos con adjuntos PDF)
  - `GET /api/v1/public/academic-calendar` (Calendario cívico-escolar)
  - `GET /api/v1/public/institutional-info` (Misión, visión, normas del plantel)
- **Lógica Técnica:**
  - Filtrado automático de vigencia en la consulta: `WHERE is_published = true AND (expires_at IS NULL OR expires_at >= CURRENT_DATE)`.
  - Almacenamiento en caché pública de Redis de la información estática del plantel con TTL de 24 horas y revalidación bajo demanda ante modificaciones de la Dirección.

---

## 4. MATRIZ DE TRAZABILIDAD TÉCNICA (FASE 1 VS FASE 2)

| Requisito Fase 1 (Negocio) | Requisito Técnico Fase 2 | Endpoint / Servicio Principal | Método HTTP | Entidades de Base de Datos Principales | Roles de Acceso |
|---|---|---|:---:|---|---|
| `RF-SEG-01` | `RF-TEC-SEG-01` | `/api/v1/auth/login` | POST | `users`, `roles`, `audit_logs` | Público |
| `RF-SEG-02` | `RF-TEC-SEG-02` | `/api/v1/auth/logout` | POST | Redis Denylist, `user_sessions` | Autenticado |
| `RF-SEG-03` | `RF-TEC-SEG-03` | `/api/v1/auth/reset-password` | POST | `users`, Redis Reset Keys | Público / Admin |
| `RF-SEG-04` | `RF-TEC-SEG-04` | Middleware RBAC | ALL | `roles`, `permissions`, `role_permissions` | Transversal |
| `RF-USU-01` | `RF-TEC-USU-01` | `/api/v1/users` | POST | `users`, `audit_logs` | Admin, Director |
| `RF-USU-02` | `RF-TEC-USU-02` | `/api/v1/users/:id` | DELETE | `users` (Soft Delete) | Admin |
| `RF-USU-04` | `RF-TEC-USU-03` | `/api/v1/users` | GET | `users`, `roles` (Índice GIN Trigram) | Admin, Director, Coord |
| `RF-ADM-01` | `RF-TEC-ADM-01` | `/api/v1/institution/profile` | PUT | `institution_profiles`, S3 Assets | Admin, Director |
| `RF-ADM-02` | `RF-TEC-ADM-02` | `/api/v1/academic-periods` | POST | `academic_years`, `academic_periods` | Admin, Coordinación |
| `RF-ADM-05` | `RF-TEC-ADM-02` | `/api/v1/curriculum/grading-scales`| POST | `grading_scales` | Admin, Coordinación |
| `RF-ACA-01` | `RF-TEC-ACA-01` | `/api/v1/students` | POST | `students`, `users` | Secretaría, Admin |
| `RF-ACA-02` | `RF-TEC-ACA-01` | `/api/v1/enrollments` | POST | `enrollments`, `sections` (Lock pesimista) | Secretaría, Coordinación |
| `RF-ACA-03` | `RF-TEC-ACA-02` | `/api/v1/academic/teaching-assignments` | POST | `teaching_assignments` | Coordinación, Director |
| `RF-AST-01` | `RF-TEC-AST-01` | `/api/v1/attendance/students/batch` | POST | `student_attendance` (Upsert SQL) | Docentes, Coord |
| `RF-AST-02` | `RF-TEC-AST-02` | `/api/v1/kiosk/gate-entry` | POST | Redis Cache + `gate_access_logs` | Portería ("Wachiman") |
| `RF-PRA-01` | `RF-TEC-PRA-01` | `/api/v1/practitioners/check-in` | POST | `practitioner_attendance_logs` | Practicantes |
| `RF-PRA-03` | `RF-TEC-PRA-02` | `/api/v1/practitioners/sessions/batch-approve` | POST | `practitioner_attendance_logs` | Docentes Tutores, Coord |
| `RF-DOC-01` | `RF-TEC-DOC-01` | `/api/v1/attendance/contracted-teachers/mark` | POST | `teacher_attendance_logs`, `schedules` | Docentes Contratados |
| `RF-NOT-01` | `RF-TEC-NOT-01` | `/api/v1/grades/batch-upsert` | POST | `grades`, `evaluation_criteria` | Docentes Titulares |
| `RF-NOT-04` | `RF-TEC-NOT-02` | `GradingCalculationEngine` | Lógica Interna | `student_period_summaries` | Transversal |
| `RF-NOT-07` | `RF-TEC-NOT-03` | `wss://.../ws` (Evento `GRADE_UPDATED`) | WSS | Redis Pub/Sub, WebSockets | Estudiantes, Docentes |
| `RF-NOT-05` | `RF-TEC-NOT-04` | `/api/v1/academic-periods/:id/close` | POST | `academic_periods`, Triggers de bloqueo | Coordinación, Director |
| `RF-CAL-01` | `RF-TEC-CAL-01` | `/api/v1/analytics/heatmaps/academic-performance` | GET | SQL CTE Agregado + Redis Cache | Director, Coord, Docentes |
| `RF-CAL-02` | `RF-TEC-CAL-02` | `/api/v1/analytics/heatmaps/attendance` | GET | `student_attendance` series temporales | Director, Coord, Auxiliares |
| `RF-MON-01` | `RF-TEC-MON-01` | `/api/v1/dashboard/director-kpis` | GET | `dashboard_kpi_snapshots` | Director General |
| `RF-MON-05` | `RF-TEC-MON-02` | `EarlyWarningWorker` | Worker / Cron | `early_warning_alerts` | Coordinación, Tutores |
| `RF-REP-01` | `RF-TEC-REP-01` | `/api/v1/reports/report-cards/:id` | GET (Stream) | Chromium Headless / PDFKit Buffer | Secretaría, Alumnos |
| `RF-REP-05` | `RF-TEC-REP-02` | `/api/v1/reports/export-excel` | POST (Stream) | ExcelJS Stream Engine | Usuarios Autorizados |
| `RF-AUD-01` | `RF-TEC-AUD-01` | `AuditInterceptorMiddleware` | Middleware | `audit_logs` (Tabla inmutable) | Transversal |
| `RF-AUD-04` | `RF-TEC-AUD-02` | `DataSanitizerInterceptor` | Interceptor | Cifrado AES-256 / DTO Sanitization | Transversal (Ley 29733) |
| `RF-DIF-01` | `RF-TEC-DIF-01` | `/api/v1/public/announcements` | GET | `announcements`, S3 Storage | Toda la comunidad |

---

## 5. CRITERIOS DE VERIFICACIÓN Y CALIDAD TÉCNICA (QA)

1. **Rendimiento de Endpoints (SLA):**
   - Endpoints de consulta y lectura simple: Tiempo de respuesta P95 < 150 ms.
   - Microservicio de portería / kiosco (`RF-TEC-AST-02`): P99 < 300 ms.
   - Generación de reportes PDF individuales: Menor a 1.5 segundos.
2. **Pruebas de Concurrencia:**
   - La API debe mantener estabilidad sin errores 500 bajo una carga sostenida de 200 usuarios concurrentes simulados mediante herramientas de prueba de carga (k6 / Artillery).
3. **Idempotencia y Manejo de Concurrencia:**
   - Todo endpoint de guardado masivo de notas y asistencias (`batch-upsert`) debe ser idempotente, evitando la creación de duplicados ante reenvíos de paquetes en conexiones inestables.
4. **Cobertura de Pruebas Automatizadas:**
   - Cobertura mínima de código del 80% en pruebas unitarias para servicios de cálculo de notas y validaciones de acceso.
