-- =============================================================================
-- ESQUEMA CONSOLIDADO DDL — POSTGRESQL 16+ MULTI-TENANT
-- Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
-- Servicio Social Universitario IS-480 (2026-II)
-- Unificación de los 5 Squads Técnicos (RF-01 al RF-71)
-- =============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. TIPOS ENUMERADOS DEL SISTEMA
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE rol_usuario_enum AS ENUM (
        'SUPERADMIN',
        'DIRECTIVO',
        'COORDINADOR_ACADEMICO',
        'SECRETARIA',
        'DOCENTE',
        'DOCENTE_CONTRATADO',
        'TUTOR_AULA',
        'PRACTICANTE',
        'AUXILIAR',
        'ESTUDIANTE',
        'PORTERIA'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_usuario_enum AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_CAMBIO_CLAVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE periodo_academico_tipo_enum AS ENUM ('BIMESTRE', 'TRIMESTRE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_matricula_enum AS ENUM ('REGULAR', 'EXTEMPORANEA', 'RETIRADO', 'TRASLADADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_asistencia_enum AS ENUM (
        'PRESENTE',
        'TARDANZA_JUSTIFICADA',
        'TARDANZA_INJUSTIFICADA',
        'FALTA_JUSTIFICADA',
        'FALTA_INJUSTIFICADA'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE origen_asistencia_enum AS ENUM ('KIOSCO_PORTERIA', 'AULA_DOCENTE', 'REGULARIZACION_MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE nivel_logro_cneb_enum AS ENUM ('AD', 'A', 'B', 'C');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_documento_escolar_enum AS ENUM (
        'BOLETA_NOTAS',
        'CERTIFICADO_ESTUDIOS',
        'CONSTANCIA_MATRICULA',
        'ACTA_OFICIAL',
        'CARNE_ESCOLAR'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2. SQUAD 1: CORE, SEGURIDAD, CONFIGURACIÓN INSTITUCIONAL Y AUDITORÍA
-- =============================================================================

-- Instituciones y Sedes Escolares (Multi-Tenant)
CREATE TABLE IF NOT EXISTS instituciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_modular VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    nivel_educativo VARCHAR(50) NOT NULL, -- Inicial, Primaria, Secundaria
    direccion TEXT,
    telefono VARCHAR(20),
    escudo_url TEXT,
    membrete_texto TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios del Sistema (Docentes, Alumnos, Directivos, etc.)
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
    foto_url TEXT,
    estado estado_usuario_enum DEFAULT 'ACTIVO',
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_tenant UNIQUE (tenant_id, username),
    CONSTRAINT uq_usuario_dni UNIQUE (tenant_id, dni)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombres_trgm ON usuarios USING gin ((nombres || ' ' || apellidos) gin_trgm_ops);

-- Roles y Matriz RBAC
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

-- Años Lectivos
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

-- Periodos Académicos (Bimestres / Trimestres)
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

-- Auditoría Criptográfica Inmutable (Ley N.° 29733)
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(50),
    ip_origen VARCHAR(45) NOT NULL,
    user_agent TEXT,
    payload_anterior JSONB,
    payload_nuevo JSONB,
    hash_previo CHAR(64),
    hash_registro CHAR(64) NOT NULL,
    timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_timestamp ON logs_auditoria(tenant_id, timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_modulo ON logs_auditoria(modulo);

-- Trigger de Inmutabilidad Estricta
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD: Los registros de logs_auditoria son estrictamente inmutables (Ley N.° 29733).';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_audit_logs ON logs_auditoria;
CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON logs_auditoria
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_tampering();

-- =============================================================================
-- 3. SQUAD 2: MATRÍCULA Y ASISTENCIA OFFLINE-FIRST
-- =============================================================================

-- Grados y Secciones
CREATE TABLE IF NOT EXISTS grados_secciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    nivel VARCHAR(50) NOT NULL, -- PRIMARIA, SECUNDARIA
    grado INT NOT NULL,
    seccion CHAR(1) NOT NULL,
    aforo_maximo INT DEFAULT 35,
    tutor_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grado_seccion UNIQUE (tenant_id, nivel, grado, seccion)
);

-- Matrículas de Estudiantes
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    anio_lectivo_id UUID NOT NULL REFERENCES anios_lectivos(id),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    estado estado_matricula_enum DEFAULT 'REGULAR',
    fecha_matricula DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_estudiante_anio UNIQUE (tenant_id, anio_lectivo_id, estudiante_id)
);

CREATE INDEX IF NOT EXISTS idx_matriculas_seccion ON matriculas(seccion_id);

-- Carnés Escolares con Token QR
CREATE TABLE IF NOT EXISTS carnes_escolares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    codigo_qr_token VARCHAR(64) NOT NULL UNIQUE,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_carnes_token ON carnes_escolares(codigo_qr_token);

-- Asistencia Estudiantil (Kiosco y Aula)
CREATE TABLE IF NOT EXISTS asistencias_alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula_id UUID NOT NULL REFERENCES matriculas(id),
    fecha DATE NOT NULL,
    hora_registro TIME NOT NULL,
    estado estado_asistencia_enum NOT NULL,
    origen origen_asistencia_enum NOT NULL,
    justificada BOOLEAN DEFAULT FALSE,
    observacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_asistencia_diaria UNIQUE (matricula_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias_alumnos(fecha);

-- Asistencia de Practicantes de Educación (UNSCH)
CREATE TABLE IF NOT EXISTS asistencias_practicantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practicante_id UUID NOT NULL REFERENCES usuarios(id),
    tutor_docente_id UUID NOT NULL REFERENCES usuarios(id),
    fecha DATE NOT NULL,
    hora_ingreso TIME NOT NULL,
    hora_salida TIME,
    horas_computadas NUMERIC(4,2) DEFAULT 0.0,
    validado_por_tutor BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. SQUAD 3: CALIFICACIONES Y MODO EXCEL (CNEB)
-- =============================================================================

-- Evaluaciones por Asignatura y Periodo
CREATE TABLE IF NOT EXISTS evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    curso_id UUID NOT NULL,
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    nombre VARCHAR(100) NOT NULL,
    peso NUMERIC(3,2) DEFAULT 1.00,
    cerrada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Calificaciones con Conversión Dual
CREATE TABLE IF NOT EXISTS calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    nota_vigesimal NUMERIC(4,2) CHECK (nota_vigesimal >= 0 AND nota_vigesimal <= 20),
    nota_literal nivel_logro_cneb_enum NOT NULL,
    version_lock INT DEFAULT 1 NOT NULL,
    registrado_por UUID REFERENCES usuarios(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_nota_alumno_evaluacion UNIQUE (evaluacion_id, matricula_id)
);

CREATE INDEX IF NOT EXISTS idx_calificaciones_evaluacion ON calificaciones(evaluacion_id);

-- Banco Oficial de Conclusiones Descriptivas CNEB
CREATE TABLE IF NOT EXISTS banco_conclusiones_cneb (
    id SERIAL PRIMARY KEY,
    area_curricular VARCHAR(50) NOT NULL,
    competencia VARCHAR(150) NOT NULL,
    nivel_logro nivel_logro_cneb_enum NOT NULL,
    texto_plantilla TEXT NOT NULL
);

-- Conclusiones Descriptivas Asignadas
CREATE TABLE IF NOT EXISTS conclusiones_descriptivas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula_id UUID NOT NULL REFERENCES matriculas(id),
    curso_id UUID NOT NULL,
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    conclusion_texto TEXT NOT NULL,
    es_banco BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_conclusion_periodo UNIQUE (matricula_id, curso_id, periodo_id)
);

-- =============================================================================
-- 5. SQUAD 4: ANALÍTICA Y DASHBOARDS (VISTAS MATERIALIZADAS)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS vm_rendimiento_seccion AS
SELECT 
    gs.tenant_id,
    gs.id AS seccion_id,
    gs.nivel,
    gs.grado,
    gs.seccion,
    ev.periodo_id,
    ROUND(AVG(c.nota_vigesimal), 2) AS promedio_seccion_vigesimal,
    COUNT(CASE WHEN c.nota_vigesimal < 11 THEN 1 END) AS total_desaprobados,
    COUNT(CASE WHEN c.nota_vigesimal >= 14 THEN 1 END) AS total_destacados
FROM grados_secciones gs
JOIN evaluaciones ev ON ev.seccion_id = gs.id
JOIN calificaciones c ON c.evaluacion_id = ev.id
GROUP BY gs.tenant_id, gs.id, gs.nivel, gs.grado, gs.seccion, ev.periodo_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vm_rendimiento_uid ON vm_rendimiento_seccion(seccion_id, periodo_id);

-- Métricas SSU IS-480
CREATE TABLE IF NOT EXISTS metricas_impacto_ssu (
    id SERIAL PRIMARY KEY,
    integrante_nombre VARCHAR(100) NOT NULL,
    horas_acumuladas NUMERIC(5,2) DEFAULT 0.0,
    meta_horas NUMERIC(5,2) DEFAULT 96.0,
    modulo_responsable VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO metricas_impacto_ssu (integrante_nombre, modulo_responsable) VALUES
('Montero Gutiérrez, Brandon Fernando', 'Squad 1: Core, Seguridad y Auditoría'),
('Paipay Vega, Eduardo Sebastian', 'Squad 2: Matrícula y Asistencia Offline-First'),
('Ovalle Luyo, Steve Smith', 'Squad 3: Calificaciones y Modo Excel'),
('Rodríguez Quispe, Grissel Arascely', 'Squad 4: Analítica y Dashboards 360°'),
('Leon Reyna, Cesar Antonio', 'Squad 5: Secretaría y Portal Web')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. SQUAD 5: SECRETARÍA, VERIFICACIÓN QR Y PORTAL
-- =============================================================================

CREATE TABLE IF NOT EXISTS documentos_emitidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    tipo tipo_documento_escolar_enum NOT NULL,
    estudiante_id UUID REFERENCES usuarios(id),
    token_verificacion VARCHAR(64) NOT NULL UNIQUE,
    hash_sha256 VARCHAR(64) NOT NULL,
    metadata_snapshot_json JSONB NOT NULL,
    emitido_por UUID REFERENCES usuarios(id),
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_documentos_token ON documentos_emitidos(token_verificacion);

CREATE TABLE IF NOT EXISTS comunicados_cartelera (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    titulo VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'GENERAL',
    publicado_por UUID REFERENCES usuarios(id),
    publicado BOOLEAN DEFAULT TRUE,
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    archivo_adjunto_url TEXT
);

-- =============================================================================
-- SEMILLAS INICIALES OBLIGATORIAS (ROLES BASE)
-- =============================================================================

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('SUPERADMIN', 'Superadministrador', 'Acceso total y configuración de plataforma'),
('DIRECTIVO', 'Equipo Directivo', 'Supervisión ejecutiva, actas y reportes oficiales'),
('COORDINADOR_ACADEMICO', 'Coordinador Académico', 'Planificación curricular y periodos'),
('SECRETARIA', 'Secretaría Académica', 'Matrículas, padrón y emisión de certificados'),
('DOCENTE', 'Docente Titular / Nombrado', 'Planilla de notas y asistencia de aula'),
('DOCENTE_CONTRATADO', 'Docente Contratado', 'Planilla y reporte de horas dictadas'),
('TUTOR_AULA', 'Tutor de Aula', 'Seguimiento 360° y ausentismo crónico'),
('PRACTICANTE', 'Practicante de Educación', 'Asistencia a clases y horas de práctica SSU'),
('AUXILIAR', 'Auxiliar de Educación', 'Tardanzas, justificaciones y apoyo en aula'),
('ESTUDIANTE', 'Estudiante', 'Consulta de calificaciones y récord de asistencia'),
('PORTERIA', 'Personal de Vigilancia', 'Operador del Kiosco de control de ingreso')
ON CONFLICT (codigo) DO NOTHING;
