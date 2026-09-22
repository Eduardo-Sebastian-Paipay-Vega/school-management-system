-- =============================================================================
-- ESQUEMA DDL: GESTIÓN ACADÉMICA, MATRÍCULA Y ASISTENCIA OFFLINE-FIRST
-- Squad 2: Eduardo Sebastian Paipay Vega (@Eduardo-Sebastian-Paipay-Vega)
-- Motor: PostgreSQL 16/18 Multi-Tenant
-- =============================================================================

CREATE TYPE estado_matricula_enum AS ENUM ('REGULAR', 'EXTEMPORANEA', 'RETIRADO', 'TRASLADADO');
CREATE TYPE estado_asistencia_enum AS ENUM ('PRESENTE', 'TARDANZA_JUSTIFICADA', 'TARDANZA_INJUSTIFICADA', 'FALTA_JUSTIFICADA', 'FALTA_INJUSTIFICADA');
CREATE TYPE origen_asistencia_enum AS ENUM ('KIOSCO_PORTERIA', 'AULA_DOCENTE', 'REGULARIZACION_MANUAL');

-- 1. Grados y Secciones
CREATE TABLE IF NOT EXISTS grados_secciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    nivel VARCHAR(50) NOT NULL, -- PRIMARIA, SECUNDARIA
    grado INT NOT NULL,         -- 1 a 6 (Primaria) o 1 a 5 (Secundaria)
    seccion CHAR(1) NOT NULL,   -- A, B, C
    aforo_maximo INT DEFAULT 35,
    tutor_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grado_seccion UNIQUE (tenant_id, nivel, grado, seccion)
);

-- 2. Matrículas de Estudiantes
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    anio_lectivo_id UUID NOT NULL REFERENCES anios_lectivos(id),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    estado estado_matricula_enum DEFAULT 'REGULAR',
    fecha_matricula DATE DEFAULT CURRENT_DATE,
    CONSTRAINT uq_estudiante_anio UNIQUE (tenant_id, anio_lectivo_id, estudiante_id)
);

CREATE INDEX idx_matriculas_seccion ON matriculas(seccion_id);

-- 3. Carnés Escolares con Token QR
CREATE TABLE IF NOT EXISTS carnes_escolares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    codigo_qr_token VARCHAR(64) NOT NULL UNIQUE,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_carnes_token ON carnes_escolares(codigo_qr_token);

-- 4. Registro de Asistencia Estudiantil (Optimizado para Kiosco e Inserción Masiva)
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

CREATE INDEX idx_asistencias_fecha_estado ON asistencias_alumnos(fecha, estado);

-- 5. Asistencias y Horas de Practicantes EPIS-UNSCH
CREATE TABLE IF NOT EXISTS asistencias_practicantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practicante_id UUID NOT NULL REFERENCES usuarios(id),
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME,
    horas_computadas NUMERIC(4,2),
    actividad_descripcion TEXT,
    validado_tutor BOOLEAN DEFAULT FALSE,
    tutor_guia_id UUID REFERENCES usuarios(id)
);

-- 6. Horas de Docentes Contratados
CREATE TABLE IF NOT EXISTS asistencias_docentes_contratados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    fecha DATE NOT NULL,
    horas_dictadas NUMERIC(3,1) NOT NULL,
    tema_sesion VARCHAR(200),
    es_reprogramacion BOOLEAN DEFAULT FALSE
);
