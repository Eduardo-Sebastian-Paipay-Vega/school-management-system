-- =============================================================================
-- Núcleo: institución, configuración, sedes, calendario y escalas de calificación
-- Modelo de datos canónico DM-05, DM-09 · RF-07, RF-10, RF-11, RF-13, RF-14
-- =============================================================================

-- 1. instituciones ---------------------------------------------------------------
-- created_by sin FK: la institución existe antes que cualquiera de sus usuarios.
ALTER TABLE instituciones ADD COLUMN created_by UUID;
UPDATE instituciones
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now()),
    activo     = COALESCE(activo, TRUE);
ALTER TABLE instituciones
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL,
    ALTER COLUMN activo     SET NOT NULL;
CREATE TRIGGER trg_instituciones_updated_at BEFORE UPDATE ON instituciones
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 2. configuracion_institucional (RF-14), 1:1 con instituciones -------------------
-- escudo_url y membrete_texto se copian aquí; las columnas de instituciones se
-- retirarán en la migración "contract" de identidad.
CREATE TABLE configuracion_institucional (
    tenant_id                   UUID PRIMARY KEY REFERENCES instituciones(id) ON DELETE RESTRICT,
    zona_horaria                VARCHAR(40) NOT NULL DEFAULT 'America/Lima',
    escudo_url                  TEXT,
    membrete_texto              TEXT,
    tolerancia_tardanza_min     SMALLINT NOT NULL DEFAULT 10 CHECK (tolerancia_tardanza_min BETWEEN 0 AND 60),
    umbral_ausentismo_pct       NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (umbral_ausentismo_pct BETWEEN 0 AND 100),
    minutos_inactividad_sesion  SMALLINT NOT NULL DEFAULT 15 CHECK (minutos_inactividad_sesion BETWEEN 5 AND 120),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by                  UUID NOT NULL DEFAULT app_user_id()
                                REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED
);
CREATE TRIGGER trg_configuracion_institucional_updated_at BEFORE UPDATE ON configuracion_institucional
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

INSERT INTO configuracion_institucional (tenant_id, escudo_url, membrete_texto, created_by)
SELECT id, escudo_url, membrete_texto, fn_usuario_sistema(id) FROM instituciones;

CREATE FUNCTION fn_trg_instituciones_configuracion() RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
    INSERT INTO configuracion_institucional (tenant_id, escudo_url, membrete_texto, created_by)
    VALUES (NEW.id, NEW.escudo_url, NEW.membrete_texto, fn_usuario_sistema(NEW.id));
    RETURN NEW;
END;
$$;
-- Se ejecuta después de trg_instituciones_10_usuario_sistema (orden alfabético).
CREATE TRIGGER trg_instituciones_20_configuracion AFTER INSERT ON instituciones
    FOR EACH ROW EXECUTE FUNCTION fn_trg_instituciones_configuracion();

-- 3. sedes (RF-07) -----------------------------------------------------------------
CREATE TABLE sedes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    nombre      VARCHAR(120) NOT NULL,
    direccion   TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_sedes_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT uq_sedes_nombre UNIQUE (tenant_id, nombre)
);
CREATE INDEX idx_sedes_tenant ON sedes (tenant_id);
CREATE TRIGGER trg_sedes_updated_at BEFORE UPDATE ON sedes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 4. anios_lectivos (RF-10) ----------------------------------------------------------
ALTER TABLE anios_lectivos
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;
UPDATE anios_lectivos
SET created_by = fn_usuario_sistema(tenant_id),
    created_at = COALESCE(created_at, now()),
    activo     = COALESCE(activo, FALSE);
ALTER TABLE anios_lectivos
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN activo     SET NOT NULL,
    ADD CONSTRAINT uq_anios_lectivos_tenant_id UNIQUE (tenant_id, id),
    ADD CONSTRAINT ck_anios_lectivos_fechas CHECK (fecha_fin > fecha_inicio),
    ADD CONSTRAINT fk_anios_lectivos_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED;
-- Un solo año activo por institución.
CREATE UNIQUE INDEX uq_anios_lectivos_activo ON anios_lectivos (tenant_id) WHERE activo;
CREATE INDEX idx_anios_lectivos_tenant ON anios_lectivos (tenant_id);
CREATE TRIGGER trg_anios_lectivos_updated_at BEFORE UPDATE ON anios_lectivos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 5. periodos_academicos (RF-11): gana tenant_id y FK compuestas ------------------
ALTER TABLE periodos_academicos
    ADD COLUMN tenant_id  UUID,
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;
UPDATE periodos_academicos p
SET tenant_id  = a.tenant_id,
    created_by = fn_usuario_sistema(a.tenant_id),
    tipo       = COALESCE(p.tipo, 'BIMESTRE'),
    cerrado    = COALESCE(p.cerrado, FALSE)
FROM anios_lectivos a
WHERE a.id = p.anio_lectivo_id;

SELECT _mig_drop_fk('periodos_academicos', ARRAY['anio_lectivo_id']);
SELECT _mig_drop_fk('periodos_academicos', ARRAY['cerrado_por']);

ALTER TABLE periodos_academicos
    ALTER COLUMN tenant_id  SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ALTER COLUMN tipo       SET NOT NULL,
    ALTER COLUMN cerrado    SET NOT NULL,
    ADD CONSTRAINT fk_periodos_tenant FOREIGN KEY (tenant_id) REFERENCES instituciones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_periodos_anio FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    ADD CONSTRAINT fk_periodos_cerrado_por FOREIGN KEY (tenant_id, cerrado_por) REFERENCES usuarios (tenant_id, id),
    ADD CONSTRAINT fk_periodos_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT uq_periodos_tenant_id UNIQUE (tenant_id, id),
    ADD CONSTRAINT ck_periodos_fechas CHECK (fecha_fin > fecha_inicio);
CREATE INDEX idx_periodos_academicos_tenant ON periodos_academicos (tenant_id);
CREATE TRIGGER trg_periodos_academicos_updated_at BEFORE UPDATE ON periodos_academicos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 6. dias_no_lectivos (RF-10) --------------------------------------------------------
CREATE TABLE dias_no_lectivos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    anio_lectivo_id  UUID NOT NULL,
    fecha            DATE NOT NULL,
    tipo             VARCHAR(13) NOT NULL CHECK (tipo IN ('FERIADO', 'VACACIONES', 'SUSPENSION', 'INSTITUCIONAL')),
    motivo           VARCHAR(150) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_dias_no_lectivos_anio FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    CONSTRAINT uq_dias_no_lectivos UNIQUE (anio_lectivo_id, fecha)
);
CREATE INDEX idx_dias_no_lectivos_tenant ON dias_no_lectivos (tenant_id);
CREATE TRIGGER trg_dias_no_lectivos_updated_at BEFORE UPDATE ON dias_no_lectivos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 7. Escalas de calificación (RF-13, DM-05) -----------------------------------------
-- Los valores oficiales de AD/A/B/C dependen de D-16 (coordinación académica).
CREATE TABLE escalas_calificacion (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    anio_lectivo_id  UUID NOT NULL,
    nivel            VARCHAR(10) NOT NULL CHECK (nivel IN ('INICIAL', 'PRIMARIA', 'SECUNDARIA')),
    modalidad        VARCHAR(16) NOT NULL CHECK (modalidad IN ('LITERAL', 'DUAL_VIGESIMAL')),
    estado           VARCHAR(11) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'VIGENTE', 'REEMPLAZADA')),
    aprobada_por     UUID,
    aprobada_en      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_escalas_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_escalas_anio FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    CONSTRAINT fk_escalas_aprobada_por FOREIGN KEY (tenant_id, aprobada_por) REFERENCES usuarios (tenant_id, id),
    CONSTRAINT ck_escalas_aprobacion CHECK ((estado = 'BORRADOR') = (aprobada_en IS NULL))
);
-- Una sola escala vigente por año y nivel.
CREATE UNIQUE INDEX uq_escalas_vigente ON escalas_calificacion (tenant_id, anio_lectivo_id, nivel) WHERE estado = 'VIGENTE';
CREATE INDEX idx_escalas_calificacion_tenant ON escalas_calificacion (tenant_id);
CREATE TRIGGER trg_escalas_calificacion_updated_at BEFORE UPDATE ON escalas_calificacion
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE rangos_escala (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    escala_id    UUID NOT NULL,
    nivel_logro  nivel_logro_cneb_enum NOT NULL,
    nota_minima  NUMERIC(4,2),     -- NULL en modalidad LITERAL
    nota_maxima  NUMERIC(4,2),
    descripcion  VARCHAR(150) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by   UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_rangos_escala FOREIGN KEY (tenant_id, escala_id)
        REFERENCES escalas_calificacion (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_rangos_nivel UNIQUE (escala_id, nivel_logro),
    CONSTRAINT ck_rangos_valores CHECK (
        (nota_minima IS NULL AND nota_maxima IS NULL)
        OR (nota_minima >= 0 AND nota_maxima <= 20 AND nota_minima <= nota_maxima)
    )
);
CREATE INDEX idx_rangos_escala_tenant ON rangos_escala (tenant_id);
CREATE TRIGGER trg_rangos_escala_updated_at BEFORE UPDATE ON rangos_escala
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Al pasar una escala a VIGENTE: debe tener rangos y, si es vigesimal, sin solapes.
-- La cobertura completa de 0 a 20 y las fronteras decimales se validarán cuando
-- D-16 fije los valores oficiales.
CREATE FUNCTION fn_validar_escala_vigente() RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
    IF NEW.estado = 'VIGENTE' AND OLD.estado IS DISTINCT FROM 'VIGENTE' THEN
        IF NOT EXISTS (SELECT 1 FROM rangos_escala WHERE escala_id = NEW.id) THEN
            RAISE EXCEPTION 'La escala % no tiene rangos definidos', NEW.id;
        END IF;
        IF NEW.modalidad = 'DUAL_VIGESIMAL' THEN
            IF EXISTS (SELECT 1 FROM rangos_escala WHERE escala_id = NEW.id AND nota_minima IS NULL) THEN
                RAISE EXCEPTION 'La escala vigesimal % tiene rangos sin notas', NEW.id;
            END IF;
            IF EXISTS (
                SELECT 1
                FROM rangos_escala a
                JOIN rangos_escala b ON b.escala_id = a.escala_id AND b.id <> a.id
                WHERE a.escala_id = NEW.id
                  AND a.nota_minima <= b.nota_maxima AND b.nota_minima <= a.nota_maxima
            ) THEN
                RAISE EXCEPTION 'La escala % tiene rangos solapados', NEW.id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_escalas_validar_vigente BEFORE UPDATE OF estado ON escalas_calificacion
    FOR EACH ROW EXECUTE FUNCTION fn_validar_escala_vigente();
