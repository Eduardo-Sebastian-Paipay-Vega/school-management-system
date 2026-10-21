-- Squad 3 / M8. DDL canónico único para PostgreSQL.
-- Ejecutar este archivo con psql, o usar `npm run migrate` en el backend.
-- Reemplaza el borrador incompleto sin tenant_id ni historial inmutable.
-- La ruta de \ir se resuelve respecto de este archivo, no del directorio actual.
\ir ../../../../backend/squad_3_calificaciones/migrations/001_grades.sql

-- =============================================================================
-- AMPLIACIÓN RF-72 A RF-89 (RF-79 al RF-82)
-- Copia de las secciones correspondientes de database/init/01_esquema_consolidado.sql,
-- que es la fuente de verdad. Si cambias algo aquí, cámbialo también allí.
-- =============================================================================

-- Publicación de notas: el apoderado solo ve notas publicadas (RF-82)
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS publicada BOOLEAN DEFAULT FALSE;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS publicada_en TIMESTAMP WITH TIME ZONE;

-- Tareas, exámenes y actividades con calendario (RF-79)
CREATE TABLE IF NOT EXISTS actividades_evaluativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    evaluacion_id UUID NOT NULL UNIQUE REFERENCES evaluaciones(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    curso_id UUID NOT NULL,
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    tipo VARCHAR(12) NOT NULL CHECK (tipo IN ('TAREA', 'EXAMEN', 'PRACTICA', 'EXPOSICION', 'PROYECTO')),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    competencia VARCHAR(150) NOT NULL,
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    adjunto_url TEXT,
    estado VARCHAR(12) DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'REPROGRAMADA', 'ANULADA')),
    motivo_anulacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_actividades_calendario ON actividades_evaluativas(seccion_id, fecha_programada);

-- Cargas de notas desde plantilla Excel (RF-80)
CREATE TABLE IF NOT EXISTS importaciones_notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    curso_id UUID NOT NULL,
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    firma_plantilla CHAR(64) NOT NULL, -- HMAC de curso + sección + periodo incrustado en la plantilla
    archivo_hash CHAR(64) NOT NULL,
    nuevas INT DEFAULT 0,
    modificadas INT DEFAULT 0,
    rechazadas INT DEFAULT 0,
    detalle_rechazos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plazos de registro de notas y alertas escalonadas a docentes (RF-81)
CREATE TABLE IF NOT EXISTS plazos_registro_notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    evaluacion_id UUID REFERENCES evaluaciones(id), -- NULL: aplica a todo el periodo
    fecha_limite TIMESTAMP WITH TIME ZONE NOT NULL,
    dias_recordatorio INT DEFAULT 3 CHECK (dias_recordatorio >= 0),
    umbral_llamado_dias INT DEFAULT 2 CHECK (umbral_llamado_dias >= 0),
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alertas_docentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    plazo_id UUID NOT NULL REFERENCES plazos_registro_notas(id),
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    curso_id UUID NOT NULL,
    nivel VARCHAR(16) NOT NULL CHECK (nivel IN ('RECORDATORIO', 'AVISO', 'LLAMADO_ATENCION')),
    avance_porcentaje NUMERIC(5,2) NOT NULL,
    emitida_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cerrada_en TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_alerta_docente UNIQUE (plazo_id, docente_id, seccion_id, curso_id, nivel)
);

CREATE INDEX IF NOT EXISTS idx_alertas_docente ON alertas_docentes(docente_id, emitida_en DESC);

-- Los llamados de atención forman parte del historial del docente y no se eliminan (RN-NOT-21)
CREATE OR REPLACE FUNCTION fn_prevent_delete_llamado_atencion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.nivel = 'LLAMADO_ATENCION' THEN
        RAISE EXCEPTION 'Los llamados de atención no pueden eliminarse (RN-NOT-21).';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_llamados_atencion ON alertas_docentes;
CREATE TRIGGER trg_protect_llamados_atencion
BEFORE DELETE ON alertas_docentes
FOR EACH ROW EXECUTE FUNCTION fn_prevent_delete_llamado_atencion();
