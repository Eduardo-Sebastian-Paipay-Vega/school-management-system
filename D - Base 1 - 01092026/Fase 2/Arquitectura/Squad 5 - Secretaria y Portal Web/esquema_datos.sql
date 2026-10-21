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

-- =============================================================================
-- AMPLIACIÓN RF-72 A RF-89 (RF-84 al RF-88)
-- Copia de las secciones correspondientes de database/init/01_esquema_consolidado.sql,
-- que es la fuente de verdad. Si cambias algo aquí, cámbialo también allí.
-- =============================================================================

ALTER TYPE tipo_documento_escolar_enum ADD VALUE IF NOT EXISTS 'CONSTANCIA_CONDUCTA';
ALTER TYPE tipo_documento_escolar_enum ADD VALUE IF NOT EXISTS 'CONSTANCIA_NOTAS';

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
