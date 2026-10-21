-- =============================================================================
-- ESQUEMA DDL: ANALÍTICA, VISTAS MATERIALIZADAS Y DASHBOARDS 360°
-- Squad 4: Grissel Arascely Rodríguez Quispe (@Arascely)
-- Motor: PostgreSQL 16/18 Multi-Tenant
-- =============================================================================

-- 1. Vista Materializada: Rendimiento por Sección y Periodo
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

-- 2. Vista Materializada: Récord Mensual de Asistencia
CREATE MATERIALIZED VIEW IF NOT EXISTS vm_asistencia_mensual AS
SELECT 
    m.seccion_id,
    DATE_TRUNC('month', a.fecha) AS mes,
    COUNT(CASE WHEN a.estado = 'PRESENTE' THEN 1 END) AS total_presentes,
    COUNT(CASE WHEN a.estado LIKE 'TARDANZA%' THEN 1 END) AS total_tardanzas,
    COUNT(CASE WHEN a.estado LIKE 'FALTA%' THEN 1 END) AS total_faltas
FROM asistencias_alumnos a
JOIN matriculas m ON m.id = a.matricula_id
GROUP BY m.seccion_id, DATE_TRUNC('month', a.fecha);

-- 3. Métricas de Impacto Social del Servicio Social Universitario (SSU IS-480)
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
-- AMPLIACIÓN RF-72 A RF-89 (RF-83, RF-89)
-- Copia de las secciones correspondientes de database/init/01_esquema_consolidado.sql,
-- que es la fuente de verdad. Si cambias algo aquí, cámbialo también allí.
-- =============================================================================

-- Avance de registro de notas por evaluación, base del tablero de cumplimiento (RF-83)
CREATE OR REPLACE VIEW v_avance_registro_notas AS
SELECT
    gs.tenant_id,
    ev.id AS evaluacion_id,
    ev.docente_id,
    ev.seccion_id,
    ev.curso_id,
    ev.periodo_id,
    COUNT(DISTINCT m.id) AS estudiantes_esperados,
    COUNT(DISTINCT c.matricula_id) AS notas_registradas,
    CASE WHEN COUNT(DISTINCT m.id) = 0 THEN 100.00
         ELSE ROUND(100.0 * COUNT(DISTINCT c.matricula_id) / COUNT(DISTINCT m.id), 2)
    END AS avance_porcentaje
FROM evaluaciones ev
JOIN grados_secciones gs ON gs.id = ev.seccion_id
LEFT JOIN matriculas m ON m.seccion_id = ev.seccion_id AND m.estado IN ('REGULAR', 'EXTEMPORANEA')
LEFT JOIN calificaciones c ON c.evaluacion_id = ev.id AND c.matricula_id = m.id
GROUP BY gs.tenant_id, ev.id, ev.docente_id, ev.seccion_id, ev.curso_id, ev.periodo_id;

-- Agenda de citas entre apoderados y tutores (RF-89)
CREATE TABLE IF NOT EXISTS franjas_atencion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    docente_id UUID NOT NULL REFERENCES usuarios(id),
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fin TIMESTAMP WITH TIME ZONE NOT NULL,
    modalidad VARCHAR(12) NOT NULL CHECK (modalidad IN ('PRESENCIAL', 'VIRTUAL')),
    lugar_o_enlace TEXT,
    CONSTRAINT ck_franja_rango CHECK (fin > inicio)
);

CREATE INDEX IF NOT EXISTS idx_franjas_docente ON franjas_atencion(docente_id, inicio);

CREATE TABLE IF NOT EXISTS citas_apoderados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    franja_id UUID NOT NULL REFERENCES franjas_atencion(id),
    apoderado_id UUID NOT NULL REFERENCES usuarios(id),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    motivo TEXT NOT NULL,
    convocada_por_docente BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'RESERVADA' CHECK (estado IN ('RESERVADA', 'CANCELADA', 'CANCELACION_TARDIA', 'REALIZADA')),
    acuerdos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Una franja admite una sola cita vigente (RN-ANA-15)
CREATE UNIQUE INDEX IF NOT EXISTS uq_cita_por_franja ON citas_apoderados(franja_id) WHERE estado IN ('RESERVADA', 'REALIZADA');
