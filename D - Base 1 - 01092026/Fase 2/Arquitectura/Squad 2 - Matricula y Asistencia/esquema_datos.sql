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

-- =============================================================================
-- AMPLIACIÓN RF-72 A RF-89 (RF-74, RF-77, RF-78)
-- Copia de las secciones correspondientes de database/init/01_esquema_consolidado.sql,
-- que es la fuente de verdad. Si cambias algo aquí, cámbialo también allí.
-- =============================================================================

-- Conformidad de horas por el docente tutor (RF-74); reemplaza el uso de validado_por_tutor
ALTER TABLE asistencias_practicantes ADD COLUMN IF NOT EXISTS estado_validacion VARCHAR(10) DEFAULT 'PENDIENTE'
    CHECK (estado_validacion IN ('PENDIENTE', 'VALIDADA', 'OBSERVADA'));
ALTER TABLE asistencias_practicantes ADD COLUMN IF NOT EXISTS comentario_tutor TEXT;
ALTER TABLE asistencias_practicantes ADD COLUMN IF NOT EXISTS validado_por UUID REFERENCES usuarios(id);
ALTER TABLE asistencias_practicantes ADD COLUMN IF NOT EXISTS validado_en TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_practicantes_pendientes ON asistencias_practicantes(tutor_docente_id, fecha) WHERE estado_validacion = 'PENDIENTE';

-- Avisos de inasistencia al apoderado, uno por estudiante, día y tipo (RF-77)
CREATE TABLE IF NOT EXISTS avisos_inasistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asistencia_id UUID NOT NULL REFERENCES asistencias_alumnos(id),
    apoderado_id UUID NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(12) NOT NULL CHECK (tipo IN ('AVISO', 'RECTIFICACION')),
    notificacion_id UUID REFERENCES notificaciones(id),
    enviado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_aviso_inasistencia UNIQUE (asistencia_id, apoderado_id, tipo)
);

-- Importaciones de nóminas SIAGIE (RF-78)
CREATE TABLE IF NOT EXISTS importaciones_nomina (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    anio_lectivo_id UUID NOT NULL REFERENCES anios_lectivos(id),
    archivo_nombre VARCHAR(200) NOT NULL,
    archivo_hash CHAR(64) NOT NULL,
    total_filas INT NOT NULL,
    creados INT DEFAULT 0,
    actualizados INT DEFAULT 0,
    rechazados INT DEFAULT 0,
    detalle_rechazos JSONB DEFAULT '[]'::jsonb,
    importado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
