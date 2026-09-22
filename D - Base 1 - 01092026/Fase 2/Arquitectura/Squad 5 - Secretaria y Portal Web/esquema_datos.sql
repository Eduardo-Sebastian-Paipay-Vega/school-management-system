-- =============================================================================
-- ESQUEMA DDL: VERIFICACIÓN CRIPTOGRÁFICA QR, SECRETARÍA Y PORTAL WEB
-- Squad 5: Cesar Antonio Leon Reyna (@cesarleon27-ai)
-- Motor: PostgreSQL 16/18 Multi-Tenant
-- =============================================================================

CREATE TYPE tipo_documento_escolar_enum AS ENUM ('BOLETA_NOTAS', 'CERTIFICADO_ESTUDIOS', 'CONSTANCIA_MATRICULA', 'ACTA_OFICIAL');

-- 1. Documentos Emitidos con Sello Criptográfico Anti-Falsificación
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

CREATE INDEX idx_documentos_token ON documentos_emitidos(token_verificacion);

-- 2. Cuadros de Mérito Calculados
CREATE TABLE IF NOT EXISTS cuadros_merito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion_id UUID NOT NULL REFERENCES grados_secciones(id),
    periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
    matricula_id UUID NOT NULL REFERENCES matriculas(id),
    puesto INT NOT NULL,
    promedio_ponderado NUMERIC(4,2) NOT NULL,
    CONSTRAINT uq_cuadro_merito_puesto UNIQUE (seccion_id, periodo_id, matricula_id)
);

-- 3. Cartelera Digital y Publicaciones del Portal
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
