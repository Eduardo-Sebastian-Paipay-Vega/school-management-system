-- =============================================================================
-- ESQUEMA CONSOLIDADO DDL — POSTGRESQL 16+ MULTI-TENANT
-- Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
-- Servicio Social Universitario IS-480 (2026-II)
-- Unificación de los 5 Squads Técnicos (RF-01 al RF-89)
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
        'PORTERIA',
        'APODERADO'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Bases creadas antes de RF-75 ya tienen el tipo sin APODERADO.
-- Ejecutar con psql (cada sentencia confirma por separado): PostgreSQL no permite usar
-- un valor de enum agregado dentro de la misma transacción.
ALTER TYPE rol_usuario_enum ADD VALUE IF NOT EXISTS 'APODERADO';

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
        'CARNE_ESCOLAR',
        'CONSTANCIA_CONDUCTA',
        'CONSTANCIA_NOTAS'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Constancias de RF-87 para bases existentes
ALTER TYPE tipo_documento_escolar_enum ADD VALUE IF NOT EXISTS 'CONSTANCIA_CONDUCTA';
ALTER TYPE tipo_documento_escolar_enum ADD VALUE IF NOT EXISTS 'CONSTANCIA_NOTAS';

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

-- Baja lógica de usuarios (RF-72) e identificador SIAGIE del estudiante (RF-78, RF-88)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_baja TIMESTAMP WITH TIME ZONE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS motivo_baja TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS baja_por UUID REFERENCES usuarios(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_siagie VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_codigo_siagie ON usuarios(tenant_id, codigo_siagie) WHERE codigo_siagie IS NOT NULL;

-- Vínculo apoderado-estudiante verificado (RF-75)
CREATE TABLE IF NOT EXISTS apoderados_estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    apoderado_id UUID NOT NULL REFERENCES usuarios(id),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    parentesco VARCHAR(20) NOT NULL CHECK (parentesco IN ('PADRE', 'MADRE', 'TUTOR_LEGAL')),
    activo BOOLEAN DEFAULT TRUE,
    vinculado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_apoderado_estudiante UNIQUE (apoderado_id, estudiante_id)
);

CREATE INDEX IF NOT EXISTS idx_apoderados_estudiante ON apoderados_estudiantes(estudiante_id);

-- Invitaciones de activación de un solo uso, vigencia 72 h (RF-75)
CREATE TABLE IF NOT EXISTS invitaciones_apoderado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    apoderado_id UUID NOT NULL REFERENCES usuarios(id),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    usada_en TIMESTAMP WITH TIME ZONE,
    creada_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consentimiento informado de datos personales (RF-75, Ley N.° 29733)
CREATE TABLE IF NOT EXISTS consentimientos_datos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    version_texto VARCHAR(20) NOT NULL,
    aceptado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    revocado_en TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_consentimientos_usuario ON consentimientos_datos(usuario_id);

-- Centro de notificaciones (RF-76)
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria VARCHAR(40) NOT NULL, -- SEGURIDAD, RECORDATORIO, ASISTENCIA, NOTAS, TRAMITES, CITAS
    prioridad VARCHAR(10) DEFAULT 'NORMAL' CHECK (prioridad IN ('ALTA', 'NORMAL', 'BAJA')),
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    enlace TEXT,
    leida_en TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas ON notificaciones(usuario_id, created_at DESC) WHERE leida_en IS NULL;

CREATE TABLE IF NOT EXISTS preferencias_notificacion (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria VARCHAR(40) NOT NULL,
    por_correo BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (usuario_id, categoria)
);

CREATE TABLE IF NOT EXISTS envios_correo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notificacion_id UUID NOT NULL REFERENCES notificaciones(id) ON DELETE CASCADE,
    estado VARCHAR(10) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'FALLIDO')),
    intentos INT DEFAULT 0,
    ultimo_error TEXT,
    enviado_en TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_envios_pendientes ON envios_correo(estado) WHERE estado = 'PENDIENTE';

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

-- Gestor de noticias con galería y publicación programada (RF-84)
CREATE TABLE IF NOT EXISTS noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    resumen VARCHAR(300) NOT NULL,
    cuerpo_html TEXT NOT NULL,
    portada_url TEXT,
    portada_alt VARCHAR(200),
    categoria VARCHAR(50) DEFAULT 'INSTITUCIONAL',
    etiquetas TEXT[] DEFAULT '{}',
    estado VARCHAR(12) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'EN_REVISION', 'APROBADA', 'PUBLICADA', 'RETIRADA')),
    publicar_en TIMESTAMP WITH TIME ZONE,
    publicada_en TIMESTAMP WITH TIME ZONE,
    autor_id UUID NOT NULL REFERENCES usuarios(id),
    aprobada_por UUID REFERENCES usuarios(id),
    compartir_facebook BOOLEAN DEFAULT FALSE,
    facebook_post_id VARCHAR(100),
    facebook_estado VARCHAR(12) CHECK (facebook_estado IN ('PENDIENTE', 'PUBLICADO', 'FALLIDO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_noticia_slug UNIQUE (tenant_id, slug),
    CONSTRAINT ck_portada_alt CHECK (portada_url IS NULL OR portada_alt IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_noticias_publicadas ON noticias(tenant_id, publicada_en DESC) WHERE estado = 'PUBLICADA';

CREATE TABLE IF NOT EXISTS noticias_galeria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    noticia_id UUID NOT NULL REFERENCES noticias(id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    miniatura_url TEXT NOT NULL,
    texto_alternativo VARCHAR(200) NOT NULL,
    orden INT DEFAULT 0
);

-- Integración con la página oficial de Facebook vía Graph API (RF-85); el token se guarda cifrado con pgcrypto
CREATE TABLE IF NOT EXISTS integraciones_redes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    proveedor VARCHAR(20) NOT NULL CHECK (proveedor IN ('FACEBOOK')),
    pagina_id VARCHAR(50) NOT NULL,
    pagina_nombre VARCHAR(150),
    token_cifrado BYTEA NOT NULL,
    token_expira_en TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(16) DEFAULT 'CONECTADA' CHECK (estado IN ('CONECTADA', 'DESCONECTADA', 'TOKEN_VENCIDO')),
    conectada_por UUID REFERENCES usuarios(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_integracion_proveedor UNIQUE (tenant_id, proveedor)
);

-- Mesa de partes virtual (RF-86)
CREATE TABLE IF NOT EXISTS expedientes_correlativos (
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    anio INT NOT NULL,
    ultimo INT NOT NULL DEFAULT 0,
    PRIMARY KEY (tenant_id, anio)
);

CREATE TABLE IF NOT EXISTS expedientes_mesa_partes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    numero VARCHAR(20) NOT NULL, -- MP-2026-000123
    tipo VARCHAR(12) NOT NULL CHECK (tipo IN ('SOLICITUD', 'CONSULTA', 'QUEJA', 'RECLAMO', 'DOCUMENTO')),
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    solicitante_nombre VARCHAR(150) NOT NULL,
    solicitante_dni CHAR(8) NOT NULL,
    solicitante_email VARCHAR(100) NOT NULL,
    solicitante_telefono VARCHAR(20),
    usuario_id UUID REFERENCES usuarios(id), -- NULL si se registró sin iniciar sesión
    codigo_seguimiento_hash CHAR(64) NOT NULL UNIQUE,
    area_asignada VARCHAR(60),
    estado VARCHAR(12) DEFAULT 'REGISTRADO' CHECK (estado IN ('REGISTRADO', 'DERIVADO', 'EN_ATENCION', 'OBSERVADO', 'RESPONDIDO', 'ARCHIVADO')),
    plazo_vence DATE,
    respuesta TEXT,
    respondido_en TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_expediente_numero UNIQUE (tenant_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_expedientes_bandeja ON expedientes_mesa_partes(tenant_id, estado, plazo_vence);

CREATE TABLE IF NOT EXISTS expedientes_movimientos (
    id BIGSERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes_mesa_partes(id) ON DELETE CASCADE,
    accion VARCHAR(30) NOT NULL, -- DERIVAR, SOLICITAR_INFO, RESPONDER, ARCHIVAR
    de_area VARCHAR(60),
    a_area VARCHAR(60),
    comentario TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expedientes_adjuntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes_mesa_partes(id) ON DELETE CASCADE,
    archivo_url TEXT NOT NULL,
    nombre_original VARCHAR(200) NOT NULL,
    mime_type VARCHAR(50) NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),
    tamano_bytes INT NOT NULL CHECK (tamano_bytes <= 5242880)
);

-- Solicitudes de certificados y constancias en línea (RF-87)
CREATE TABLE IF NOT EXISTS solicitudes_certificado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    tipo tipo_documento_escolar_enum NOT NULL,
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    periodos UUID[] DEFAULT '{}',
    motivo TEXT,
    solicitante_usuario_id UUID REFERENCES usuarios(id), -- NULL para exalumnos sin cuenta
    solicitante_dni CHAR(8) NOT NULL,
    solicitante_email VARCHAR(100) NOT NULL,
    estado VARCHAR(12) DEFAULT 'SOLICITADO' CHECK (estado IN ('SOLICITADO', 'EN_REVISION', 'OBSERVADO', 'EMITIDO', 'RECHAZADO')),
    observacion TEXT,
    documento_id UUID REFERENCES documentos_emitidos(id),
    aprobado_por UUID REFERENCES usuarios(id),
    emitido_en TIMESTAMP WITH TIME ZONE,
    descarga_expira_en TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificados_bandeja ON solicitudes_certificado(tenant_id, estado, created_at);

-- Archivos de carga para el SIAGIE y control de envíos (RF-88)
CREATE TABLE IF NOT EXISTS exportaciones_siagie (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    tipo VARCHAR(12) NOT NULL CHECK (tipo IN ('NOTAS', 'ASISTENCIA')),
    archivo_hash CHAR(64) NOT NULL,
    generado_por UUID NOT NULL REFERENCES usuarios(id),
    generado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(22) DEFAULT 'ARCHIVO_GENERADO' CHECK (estado IN ('ARCHIVO_GENERADO', 'CARGADA_EN_SIAGIE', 'REQUIERE_NUEVA_CARGA')),
    cargada_por UUID REFERENCES usuarios(id),
    cargada_en TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_siagie_avance ON exportaciones_siagie(tenant_id, periodo_id, seccion_id, tipo);

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
('PORTERIA', 'Personal de Vigilancia', 'Operador del Kiosco de control de ingreso'),
('APODERADO', 'Apoderado', 'Consulta de solo lectura de notas, actividades y asistencia de sus hijos vinculados')
ON CONFLICT (codigo) DO NOTHING;
