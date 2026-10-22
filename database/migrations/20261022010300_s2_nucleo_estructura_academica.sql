-- =============================================================================
-- Núcleo: estructura académica (secciones, catálogo curricular, carga, matrículas)
-- Modelo de datos canónico DM-03, DM-04, DM-06 · RF-12, RF-16, RF-17, RF-18
-- =============================================================================

-- 1. grados_secciones (DM-03): cada sección pertenece a un año lectivo ------------
ALTER TABLE grados_secciones
    ADD COLUMN anio_lectivo_id UUID,
    ADD COLUMN sede_id         UUID,
    ADD COLUMN updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by      UUID;

-- Las secciones existentes se asignan al año activo de su institución.
UPDATE grados_secciones s
SET anio_lectivo_id = a.id
FROM anios_lectivos a
WHERE a.tenant_id = s.tenant_id AND a.activo;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM grados_secciones WHERE anio_lectivo_id IS NULL) THEN
        RAISE EXCEPTION 'Hay secciones sin año lectivo: su institución no tiene un año activo. '
                        'Active un año en anios_lectivos o asigne anio_lectivo_id antes de migrar.';
    END IF;
END $$;

UPDATE grados_secciones
SET created_by   = fn_usuario_sistema(tenant_id),
    created_at   = COALESCE(created_at, now()),
    aforo_maximo = COALESCE(aforo_maximo, 35);

ALTER TABLE grados_secciones DROP CONSTRAINT uq_grado_seccion;
SELECT _mig_drop_fk('grados_secciones', ARRAY['tutor_id']);

-- nivel conserva VARCHAR(50): la vista materializada vm_rendimiento_seccion
-- depende de la columna y PostgreSQL no permite cambiar su tipo. El CHECK fija los valores.
ALTER TABLE grados_secciones
    ALTER COLUMN anio_lectivo_id SET NOT NULL,
    ALTER COLUMN created_by      SET NOT NULL,
    ALTER COLUMN created_by      SET DEFAULT app_user_id(),
    ALTER COLUMN created_at      SET NOT NULL,
    ALTER COLUMN aforo_maximo    SET NOT NULL,
    ADD CONSTRAINT ck_secciones_nivel CHECK (nivel IN ('INICIAL', 'PRIMARIA', 'SECUNDARIA')),
    ADD CONSTRAINT ck_secciones_grado CHECK (grado BETWEEN 1 AND 6),
    ADD CONSTRAINT ck_secciones_aforo CHECK (aforo_maximo > 0),
    ADD CONSTRAINT uq_grado_seccion UNIQUE (tenant_id, anio_lectivo_id, nivel, grado, seccion),
    ADD CONSTRAINT uq_secciones_tenant_id UNIQUE (tenant_id, id),
    ADD CONSTRAINT uq_secciones_tenant_anio_id UNIQUE (tenant_id, anio_lectivo_id, id),
    ADD CONSTRAINT fk_secciones_anio  FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    ADD CONSTRAINT fk_secciones_sede  FOREIGN KEY (tenant_id, sede_id)  REFERENCES sedes (tenant_id, id),
    ADD CONSTRAINT fk_secciones_tutor FOREIGN KEY (tenant_id, tutor_id) REFERENCES usuarios (tenant_id, id),
    ADD CONSTRAINT fk_secciones_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX idx_grados_secciones_tenant ON grados_secciones (tenant_id);
CREATE TRIGGER trg_grados_secciones_updated_at BEFORE UPDATE ON grados_secciones
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 2. Catálogo curricular CNEB (RF-17, DM-04) -----------------------------------------
-- "cursos" = área curricular del CNEB o taller propio del plantel.
CREATE TABLE cursos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    nivel        VARCHAR(10) NOT NULL CHECK (nivel IN ('INICIAL', 'PRIMARIA', 'SECUNDARIA')),
    nombre       VARCHAR(100) NOT NULL,
    codigo_cneb  VARCHAR(20),
    es_taller    BOOLEAN NOT NULL DEFAULT FALSE,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by   UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_cursos_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT uq_cursos_nombre UNIQUE (tenant_id, nivel, nombre),
    CONSTRAINT ck_cursos_cneb CHECK (es_taller OR codigo_cneb IS NOT NULL)
);
CREATE INDEX idx_cursos_tenant ON cursos (tenant_id);
CREATE TRIGGER trg_cursos_updated_at BEFORE UPDATE ON cursos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE competencias (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    curso_id    UUID NOT NULL,
    nombre      VARCHAR(200) NOT NULL,
    orden       SMALLINT NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_competencias_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_competencias_curso FOREIGN KEY (tenant_id, curso_id) REFERENCES cursos (tenant_id, id),
    CONSTRAINT uq_competencias_orden UNIQUE (curso_id, orden)
);
CREATE INDEX idx_competencias_tenant ON competencias (tenant_id);
CREATE TRIGGER trg_competencias_updated_at BEFORE UPDATE ON competencias
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE plan_estudios (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    anio_lectivo_id  UUID NOT NULL,
    nivel            VARCHAR(10) NOT NULL CHECK (nivel IN ('INICIAL', 'PRIMARIA', 'SECUNDARIA')),
    grado            SMALLINT NOT NULL CHECK (grado BETWEEN 1 AND 6),
    curso_id         UUID NOT NULL,
    horas_semanales  SMALLINT NOT NULL CHECK (horas_semanales BETWEEN 1 AND 20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_plan_anio  FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    CONSTRAINT fk_plan_curso FOREIGN KEY (tenant_id, curso_id) REFERENCES cursos (tenant_id, id),
    CONSTRAINT uq_plan_estudios UNIQUE (anio_lectivo_id, nivel, grado, curso_id)
);
CREATE INDEX idx_plan_estudios_tenant ON plan_estudios (tenant_id);
CREATE TRIGGER trg_plan_estudios_updated_at BEFORE UPDATE ON plan_estudios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 3. Carga lectiva (RF-18) ---------------------------------------------------------
CREATE TABLE carga_lectiva (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    seccion_id       UUID NOT NULL,
    curso_id         UUID NOT NULL,
    docente_id       UUID NOT NULL,
    horas_semanales  SMALLINT NOT NULL CHECK (horas_semanales BETWEEN 1 AND 20),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_carga_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_carga_seccion FOREIGN KEY (tenant_id, seccion_id) REFERENCES grados_secciones (tenant_id, id),
    CONSTRAINT fk_carga_curso   FOREIGN KEY (tenant_id, curso_id)   REFERENCES cursos (tenant_id, id),
    CONSTRAINT fk_carga_docente FOREIGN KEY (tenant_id, docente_id) REFERENCES usuarios (tenant_id, id)
);
-- Un docente vigente por curso y sección; los reemplazos dejan historial.
CREATE UNIQUE INDEX uq_carga_vigente ON carga_lectiva (seccion_id, curso_id) WHERE activo;
CREATE INDEX idx_carga_docente ON carga_lectiva (tenant_id, docente_id) WHERE activo;
CREATE INDEX idx_carga_lectiva_tenant ON carga_lectiva (tenant_id);
CREATE TRIGGER trg_carga_lectiva_updated_at BEFORE UPDATE ON carga_lectiva
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 4. matriculas (RF-16): el estudiante es una persona y la sección es del mismo año --
ALTER TABLE matriculas
    ADD COLUMN fecha_retiro  DATE,
    ADD COLUMN motivo_retiro TEXT,
    ADD COLUMN updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by    UUID;

UPDATE matriculas
SET created_by      = fn_usuario_sistema(tenant_id),
    created_at      = COALESCE(created_at, now()),
    estado          = COALESCE(estado, 'REGULAR'),
    fecha_matricula = COALESCE(fecha_matricula, created_at::date, CURRENT_DATE);

SELECT _mig_drop_fk('matriculas', ARRAY['estudiante_id']);
SELECT _mig_drop_fk('matriculas', ARRAY['seccion_id']);
SELECT _mig_drop_fk('matriculas', ARRAY['anio_lectivo_id']);

ALTER TABLE matriculas
    ALTER COLUMN created_by      SET NOT NULL,
    ALTER COLUMN created_by      SET DEFAULT app_user_id(),
    ALTER COLUMN created_at      SET NOT NULL,
    ALTER COLUMN estado          SET NOT NULL,
    ALTER COLUMN fecha_matricula SET NOT NULL,
    ADD CONSTRAINT uq_matriculas_tenant_id UNIQUE (tenant_id, id),
    ADD CONSTRAINT fk_matriculas_estudiante FOREIGN KEY (tenant_id, estudiante_id) REFERENCES personas (tenant_id, id),
    ADD CONSTRAINT fk_matriculas_anio FOREIGN KEY (tenant_id, anio_lectivo_id) REFERENCES anios_lectivos (tenant_id, id),
    ADD CONSTRAINT fk_matriculas_seccion FOREIGN KEY (tenant_id, anio_lectivo_id, seccion_id)
        REFERENCES grados_secciones (tenant_id, anio_lectivo_id, id),
    ADD CONSTRAINT fk_matriculas_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT ck_matriculas_retiro CHECK ((estado IN ('RETIRADO', 'TRASLADADO')) = (fecha_retiro IS NOT NULL));
CREATE INDEX idx_matriculas_tenant ON matriculas (tenant_id);
CREATE TRIGGER trg_matriculas_updated_at BEFORE UPDATE ON matriculas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
