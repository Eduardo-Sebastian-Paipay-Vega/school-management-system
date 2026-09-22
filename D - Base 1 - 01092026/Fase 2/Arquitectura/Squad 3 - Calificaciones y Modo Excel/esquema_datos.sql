-- =============================================================================
-- ESQUEMA DDL: EVALUACIÓN PEDAGÓGICA, CALIFICACIONES DUALES Y CNEB
-- Squad 3: Steve Smith Ovalle Luyo (@steveovalle27-lgtm)
-- Motor: PostgreSQL 16/18 Multi-Tenant
-- =============================================================================

CREATE TYPE nivel_logro_cneb_enum AS ENUM ('AD', 'A', 'B', 'C');

-- 1. Evaluaciones Programadas por Asignatura y Periodo
CREATE TABLE IF NOT EXISTS evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    curso_id UUID NOT NULL,
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    nombre VARCHAR(100) NOT NULL, -- Práctica 1, Examen Parcial, Rúbrica de Proyecto
    peso NUMERIC(3,2) DEFAULT 1.00,
    cerrada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Calificaciones con Soporte Dual (Vigesimal y Literal CNEB)
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

CREATE INDEX idx_calificaciones_evaluacion ON calificaciones(evaluacion_id);

-- 3. Banco Taxonómico de Conclusiones Descriptivas Oficiales (MINEDU)
CREATE TABLE IF NOT EXISTS banco_conclusiones_cneb (
    id SERIAL PRIMARY KEY,
    area_curricular VARCHAR(50) NOT NULL,
    competencia VARCHAR(150) NOT NULL,
    nivel_logro nivel_logro_cneb_enum NOT NULL,
    texto_plantilla TEXT NOT NULL
);

-- 4. Conclusiones Descriptivas Registradas por Estudiante
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
