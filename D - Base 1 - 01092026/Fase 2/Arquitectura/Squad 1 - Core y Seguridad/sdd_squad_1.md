# Documento de Diseño de Software (SDD) — Squad 1: Core, Seguridad, Configuración y Auditoría

### Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH
**Servicio Social Universitario IS-480 (2026-II)**  
**Estándar Normativo:** IEEE 1016-2009 / ISO/IEC/IEEE 42010

---

## Metadatos del Documento

| Campo | Detalle |
|---|---|
| **Squad Responsable** | Squad 1: Core, Seguridad, Configuración Institucional y Auditoría |
| **Líder Técnico** | Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`) |
| **Rama de Desarrollo** | `feature/squad-1/auth-core` |
| **Módulos Asignados** | Módulo 1 (Acceso y JWT), Módulo 2 (Usuarios), Módulo 3 (Configuración Escolar), Módulo 12 (Auditoría) |
| **Requisitos Trazables** | `RF-01`..`14`, `RF-65`..`68`, `RF-72`, `RF-73`, `RF-75`, `RF-76` (**22 requisitos**) |
| **Casos de Uso** | `CU-SEG-01`..`04`, `CU-USR-01`..`09`, `CU-INS-01`..`05`, `CU-AUD-01`..`04` (**22 casos**) |
| **Versión del SDD** | v1.1.0 (actualización Sprint 3) |
| **Estado** | En revisión; pendiente validación funcional y técnica |

---

## 1. Introducción y Alcance del Módulo

### 1.1. Propósito del Documento
El presente SDD traza el núcleo de seguridad, administración de la institución y auditoría. **Las secciones 2 a 5 conservan ejemplos de la línea base de Fase 2 y no constituyen contratos ni DDL ejecutables.** Para implementación prevalecen `database/migrations/`, `packages/contracts/openapi/openapi.yaml`, `backend/src/`, `frontend/modules/squads/squad_1_core/` y los ADR aceptados. La matriz de la sección 7 refleja las rutas actuales y sus límites.

### 1.2. Alcance Funcional
* **Autenticación Robusta:** Emisión y rotación de tokens JWT duales (Access Token de 15 minutos en memoria y Refresh Token de 7 días en cookie segura `HttpOnly`).
* **Control de Acceso RBAC Granular:** Autorización por roles jerárquicos (`SUPERADMIN`, `DIRECTIVO`, `DOCENTE`, `ESTUDIANTE`, `PORTERIA`).
* **Gestión Multi-Tenant:** La institución es el tenant (`tenant_id UUID`); las sedes son unidades internas. El aislamiento entre instituciones se aplica con `withTenant()` y RLS. El piloto real se limita a Guamán Poma de Ayala.
* **Directorio y protección de datos:** Alta pendiente, invitación explícita, roles, baja lógica, apoderados sujetos a consentimiento y notificaciones. El consentimiento institucional RF-75 sigue pendiente.
* **Configuración del Año Académico:** Parametrización de bimestres, calendarios y escalas CNEB.
* **Pista de Auditoría Inmutable:** Registro indeleble de accesos y modificaciones sensibles conforme a la Ley N.° 29733 (Protección de Datos Personales).

### 1.3. Supuestos y Restricciones Técnicas
* **Motor de Base de Datos:** PostgreSQL 16 con extensiones `uuid-ossp` y `pg_trgm`.
* **Caché y Rate-Limiting:** Redis 7 para lista negra de tokens revocados y bloqueo por intentos fallidos (máx. 5 intentos cada 15 min).
* **Frontend:** Next.js 15 (React 19, TypeScript) bajo arquitectura Feature-First en `frontend/modules/squads/squad_1_core/`.

---

## 2. Vista Arquitectural del Módulo (Modelo C4)

### 2.1. Diagrama de Contenedores y Flujo de Autenticación

```mermaid
flowchart TD
    subgraph Cliente["Cliente Next.js (Web / PWA / Móvil)"]
        UI["LoginForm / UserAdmin<br/>(frontend/modules/squads/squad_1_core)"]
        AuthNotifier["AuthNotifier / StateNotifier<br/>(Gestión de Token en Memoria)"]
        SecureCookie["Cookie Jar Seguro<br/>(HttpOnly SameSite=Strict)"]
    end

    subgraph Gateway["Capa de Red e Interceptores"]
        RateLimiter["Rate Limiter (Max 5 req/15min)"]
        AuthMiddleware["JWT Verification Guard"]
        AuditInterceptor["Audit Interceptor (Ley 29733)"]
    end

    subgraph Backend["Servicios de Dominio (Node.js / Express)"]
        AuthService["AuthService (Bcrypt Cost 12)"]
        UserService["UserService (Directorio y Búsqueda Trigram)"]
        TenantService["TenantConfigService (Multi-Tenant)"]
    end

    subgraph Persistencia["Capa de Datos"]
        RedisDB[("Redis 7<br/>Token Blacklist & Rate Limits")]
        PostgresDB[("PostgreSQL 16<br/>Esquema Multi-Tenant")]
    end

    UI --> AuthNotifier
    AuthNotifier -->|POST /api/v1/auth/login| RateLimiter
    RateLimiter -->|IP Permitida| AuthService
    AuthService -->|Valida Hash Bcrypt| PostgresDB
    AuthService -->|Emite JWT + Cookie| SecureCookie
    AuthService -->|Registra Éxito/Fallo| AuditInterceptor
    AuditInterceptor -->|INSERT Inmutable| PostgresDB
    
    UI -->|Petición con Bearer Token| AuthMiddleware
    AuthMiddleware -->|Verifica Revocación| RedisDB
    AuthMiddleware --> UserService
    UserService --> PostgresDB
```

### 2.2. Descripción de Componentes Principales

| Componente | Capa | Responsabilidad |
|---|---|---|
| `useSession` | Frontend Next.js | Controla el ciclo de vida de la sesión en el cliente y la renovación automática del Access Token. |
| `AuthMiddleware` | Backend Gateway | Intercepta peticiones protegidas, valida la firma HMAC-SHA256 del JWT y consulta Redis. |
| `AuditService` | Backend Domain | Construye el registro diferencial (payload JSONB) y ejecuta la inserción inmutable. |
| `instituciones` | PostgreSQL Data | Tabla raíz del modelo multi-tenant que particiona lógicamente los datos de las sedes escolares. |

---

## 3. Diseño Detallado de Persistencia (PostgreSQL)

### 3.1. Modelo Entidad-Relación de Seguridad y Core

```mermaid
erDiagram
    INSTITUCIONES ||--o{ USUARIOS : "pertenecen a"
    INSTITUCIONES ||--o{ ANIOS_LECTIVOS : "parametrizan"
    ANIOS_LECTIVOS ||--o{ PERIODOS_ACADEMICOS : "contiene"
    USUARIOS ||--o{ USUARIO_ROLES : "posee"
    ROLES ||--o{ USUARIO_ROLES : "asignado a"
    USUARIOS ||--o{ AUDIT_LOGS : "genera"

    INSTITUCIONES {
        uuid id PK
        string codigo_modular UK
        string nombre
        string nivel_educativo
        boolean activo
    }

    USUARIOS {
        uuid id PK
        uuid tenant_id FK
        string username UK
        string dni UK
        string password_hash
        string nombres
        string apellidos
        string estado
    }

    ROLES {
        int id PK
        string codigo UK
        string nombre
    }

    AUDIT_LOGS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string accion
        string ip_address
        jsonb payload_diff
        timestamptz created_at
    }
```

### 3.2. Script DDL y Triggers de Inmutabilidad

```sql
-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tipos ENUM
CREATE TYPE rol_usuario_enum AS ENUM ('SUPERADMIN', 'DIRECTIVO', 'DOCENTE', 'ESTUDIANTE', 'PORTERIA');
CREATE TYPE estado_usuario_enum AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_CAMBIO_CLAVE');

-- 1. Tabla de Instituciones (Multi-Tenant)
CREATE TABLE IF NOT EXISTS instituciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_modular VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    nivel_educativo VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    username VARCHAR(50) NOT NULL,
    dni CHAR(8) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    estado estado_usuario_enum DEFAULT 'ACTIVO',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_tenant UNIQUE (tenant_id, username),
    CONSTRAINT uq_usuario_dni UNIQUE (tenant_id, dni)
);

CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_nombres_trgm ON usuarios USING gin ((nombres || ' ' || apellidos) gin_trgm_ops);

-- 3. Tabla Inmutable de Auditoría (Ley 29733)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    payload_diff JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger de Inmutabilidad Estricta (Prohibido UPDATE y DELETE)
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD (Ley 29733): Los registros de auditoría son estrictamente inmutables.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_update_delete
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_tampering();
```

---

## 4. Contratos de Comunicación (API REST)

### 4.1. `POST /api/v1/auth/login` (Autenticación Principal)
* **Descripción:** Autentica al usuario institucional mediante credenciales seguras.
* **Seguridad:** Rate limiting activo (máx 5 intentos/15 min).

#### Request Body:
```json
{
  "tenantModularCode": "0382910",
  "username": "70859632",
  "password": "Password123!"
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "dni": "70859632",
      "nombres": "Brandon Fernando",
      "apellidos": "Montero Gutiérrez",
      "roles": ["SUPERADMIN"],
      "tenantId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    }
  }
}
```
* **Cookie en Cabecera:**  
  `Set-Cookie: refreshToken=eyJhbGci...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth`

---

### 4.2. `POST /api/v1/auth/logout` (Revocación Inmediata)
* **Descripción:** Revoca el Refresh Token e introduce el Access Token en Redis Blacklist.

#### Response `200 OK`:
```json
{
  "success": true,
  "message": "Sesión cerrada satisfactoriamente y credenciales revocadas."
}
```

---

### 4.3. `GET /api/v1/users` (Directorio Institucional Paginado)
* **Headers:** `Authorization: Bearer <accessToken>`
* **Query Params:** `page=1&limit=20&role=DOCENTE&query=Montero`

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "dni": "70859632",
        "nombres": "Brandon Fernando",
        "apellidos": "Montero Gutiérrez",
        "email": "bmontero@planteles.unsch.edu.pe",
        "roles": ["DOCENTE", "ADMIN"],
        "estado": "ACTIVO"
      }
    ],
    "meta": {
      "totalItems": 45,
      "currentPage": 1,
      "totalPages": 3
    }
  }
}
```

---

## 5. Diseño Frontend en Next.js (Feature-First)

### 5.1. Organización del Código

```text
frontend/modules/squads/squad_1_core/
├── components/
│   ├── LoginForm.tsx                 # Formulario de inicio de sesión
│   ├── AuditViewer.tsx               # Visor paginado de bitácoras de auditoría (DataTable)
│   ├── RbacRoleChip.tsx              # Selector visual de roles
│   ├── UserEditDialog.tsx            # Edición y baja lógica de usuarios (RF-72)
│   ├── RoleManagerPanel.tsx          # Reasignación de roles con diferencia de permisos (RF-73)
│   ├── GuardianInviteDialog.tsx      # Invitación de apoderados (RF-75)
│   └── NotificationBell.tsx          # Campana y bandeja de notificaciones (RF-76)
├── hooks/
│   ├── useSession.ts                 # Sesión, roles y renovación silenciosa del Access Token
│   └── useIdleTimeout.ts             # Cierre por inactividad (30 min)
├── services/
│   └── authApi.ts                    # Llamadas a /auth, /users, /guardians, /notifications
├── types.ts                          # Tipos de User, Role, AuditLogEntry, Notification
└── CoreModuleView.tsx                # Vista maestra del Squad 1
```

### 5.2. Manejo de Sesión y Expiración por Inactividad
* El hook `useIdleTimeout` escucha eventos de teclado, ratón y toque en el documento y reinicia un temporizador de 30 minutos.
* Al minuto 29 sin actividad, despliega un diálogo de advertencia de 60 segundos antes del cierre forzoso.
* El Access Token vive en memoria; el Refresh Token viaja en cookie `HttpOnly` (`SameSite=Strict`), nunca en `localStorage`.

---

## 6. Seguridad, Resiliencia y Atributos de Calidad (NFR)

* **Algoritmo Criptográfico de Contraseñas:** `bcrypt` con factor de coste 12.
* **Rendimiento:** Los tiempos de login, logout y búsqueda aún requieren medición contra los RNF; las cifras de la línea base no se consideran aceptación cumplida.
* **Protección de Datos Personales (Ley N.° 29733):**
  * DNIs y datos de menores de edad siempre enmascarados en reportes públicos.
  * Cifrado en reposo (AES-256) de campos sensibles.

---

## 7. Matriz de Trazabilidad Bidireccional

Todas las rutas REST tienen el prefijo `/api/v1`. Las vistas se concentran hoy en `CoreModuleView.tsx`, `SessionProvider.tsx` y `AccessLinkForm.tsx`; los nombres de subcomponentes de la sección 5 son diseño futuro. El estado por RF se mantiene en `docs/requirements/matriz-rf-arquitectura.md`.

| Requisito | Caso de uso | Persistencia | API vigente o integración | UI / consumidor |
|---|---|---|---|---|
| `RF-01` | `CU-SEG-01` | `instituciones`, `usuarios`, `sesiones_usuario` | `POST /auth/login`, `GET /auth/me` | `SessionProvider.tsx` |
| `RF-02` | `CU-SEG-02` | `sesiones_usuario`; Redis revocación | `POST /auth/logout`, `POST /auth/refresh-token` | `SessionProvider.tsx` |
| `RF-03` | `CU-SEG-03` | `enlaces_acceso`, `usuarios` | `POST /auth/forgot-password`, `POST /auth/reset-password` | `AccessLinkForm.tsx` |
| `RF-04` | `CU-SEG-04` | `roles`, `usuario_roles`, `rol_permisos_core` | `GET /users/roles`, `PUT /users/roles/{id}/permissions` | `CoreModuleView.tsx` |
| `RF-05` | `CU-USR-01` | `personas`, `usuarios`, `enlaces_acceso` | `POST /users`, `POST /users/{id}/invite`, `POST /auth/activate` | `CoreModuleView.tsx`, `AccessLinkForm.tsx` |
| `RF-06` | `CU-USR-02` | `personas`, `usuarios` | `POST /users/import/preview`, `POST /users/import/commit` | `CoreModuleView.tsx` |
| `RF-07` | `CU-USR-03` | `instituciones`, `sedes` | `GET/POST /school/sites`; provisión SaaS futura | `CoreModuleView.tsx` |
| `RF-08` | `CU-USR-04` | `personas`, `usuarios` | `GET /users` | `CoreModuleView.tsx` |
| `RF-09` | `CU-USR-05` | `personas`, `usuarios`, `sesiones_usuario` | `GET/PATCH /users/me`, `POST /users/me/change-password` | `CoreModuleView.tsx` |
| `RF-10` | `CU-INS-01` | `anios_lectivos`, `dias_no_lectivos` | `GET/POST /school/years` | `CoreModuleView.tsx` |
| `RF-11` | `CU-INS-02` | `periodos_academicos` | `GET/POST /school/years/{id}/periods` | `CoreModuleView.tsx` |
| `RF-12` | `CU-INS-03` | `grados_secciones` | `GET/POST /school/years/{id}/sections` | `CoreModuleView.tsx`, Squads 2/3 |
| `RF-13` | `CU-INS-04` | `escalas_calificacion`, `rangos_escala` | `GET/POST /school/years/{id}/scales`, `POST /school/scales/{id}/approve` | `CoreModuleView.tsx`, Squad 3; rangos bloqueados por D-16 |
| `RF-14` | `CU-INS-05` | `configuracion_institucional` | `GET/PATCH /school/institution` | `CoreModuleView.tsx`, Squad 5 |
| `RF-65` | `CU-AUD-01` | `logs_auditoria` | `AuditService.record()`; `GET /audit/verify-chain` | Servicio backend |
| `RF-66` | `CU-AUD-02` | `logs_auditoria`, `squad3.grade_audit_history` | Integración con notas/asistencia pendiente | Squads 2/3 |
| `RF-67` | `CU-AUD-03` | `logs_auditoria` | `GET /audit/logs`, `GET /audit/export.pdf` | `CoreModuleView.tsx` |
| `RF-68` | `CU-AUD-04` | `personas` (cifrado e índice ciego) | `POST /users/{id}/document` | `CoreModuleView.tsx` |
| `RF-72` | `CU-USR-06` | `usuarios`, `personas` | `PATCH /users/{id}`, `POST /users/{id}/deactivate` | `CoreModuleView.tsx` |
| `RF-73` | `CU-USR-07` | `usuario_roles`, `logs_auditoria` | `PUT /users/{id}/roles` | `CoreModuleView.tsx` |
| `RF-75` | `CU-USR-08` | `apoderados_estudiantes`, `invitaciones_apoderado`, `consentimientos_datos` | `POST /guardians/invitations`, `POST /guardians/activate` | `CoreModuleView.tsx`; consentimiento real pendiente |
| `RF-76` | `CU-USR-09` | `notificaciones`, `preferencias_notificacion`, `envios_correo` | `GET /notifications`; WebSocket por formalizar | `CoreModuleView.tsx` |
