-- =============================================================================
-- ESQUEMA DDL: CORE, SEGURIDAD, CONFIGURACIÓN Y AUDITORÍA
-- Squad 1: Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
-- Motor: PostgreSQL 16/18 Multi-Tenant
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tipos ENUM del sistema
CREATE TYPE rol_usuario_enum AS ENUM ('SUPERADMIN', 'DIRECTIVO', 'DOCENTE', 'ESTUDIANTE', 'PORTERIA');
CREATE TYPE estado_usuario_enum AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_CAMBIO_CLAVE');
CREATE TYPE periodo_academico_tipo_enum AS ENUM ('BIMESTRE', 'TRIMESTRE');

-- 1. Tabla de Instituciones / Sedes (Multi-Tenant)
CREATE TABLE IF NOT EXISTS instituciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_modular VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    nivel_educativo VARCHAR(50) NOT NULL, -- Inicial, Primaria, Secundaria
    direccion TEXT,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    telefono VARCHAR(20),
    estado estado_usuario_enum DEFAULT 'ACTIVO',
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_tenant UNIQUE (tenant_id, username),
    CONSTRAINT uq_usuario_dni UNIQUE (tenant_id, dni)
);

CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_nombres_trgm ON usuarios USING gin ((nombres || ' ' || apellidos) gin_trgm_ops);

-- 3. Tabla de Roles y Permisos (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    codigo rol_usuario_enum NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

-- 4. Años Lectivos y Periodos Académicos
CREATE TABLE IF NOT EXISTS anios_lectivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    anio INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_anio_tenant UNIQUE (tenant_id, anio)
);

CREATE TABLE IF NOT EXISTS periodos_academicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anio_lectivo_id UUID NOT NULL REFERENCES anios_lectivos(id) ON DELETE CASCADE,
    tipo periodo_academico_tipo_enum DEFAULT 'BIMESTRE',
    numero INT NOT NULL, -- 1, 2, 3, 4
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_limite_notas TIMESTAMP WITH TIME ZONE NOT NULL,
    cerrado BOOLEAN DEFAULT FALSE,
    cerrado_por UUID REFERENCES usuarios(id),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_periodo_anio UNIQUE (anio_lectivo_id, numero)
);

-- 5. Tabla de Auditoría Inmutable (Ley N.° 29733)
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    modulo VARCHAR(50) NOT NULL, -- AUTH, NOTAS, ASISTENCIA, USUARIOS
    accion VARCHAR(50) NOT NULL, -- LOGIN, CREATE, UPDATE, DELETE, RECTIFICACION
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(50),
    ip_origen VARCHAR(45) NOT NULL,
    user_agent TEXT,
    payload_anterior JSONB,
    payload_nuevo JSONB,
    timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_tenant_timestamp ON logs_auditoria(tenant_id, timestamp_utc DESC);
CREATE INDEX idx_audit_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_audit_modulo ON logs_auditoria(modulo);

-- REGLA DE SEGURIDAD INMUTABLE: Impide UPDATE y DELETE sobre logs_auditoria
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD: Los registros de logs_auditoria son estrictamente inmutables (Ley N.° 29733).';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON logs_auditoria
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_tampering();
