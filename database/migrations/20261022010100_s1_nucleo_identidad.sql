-- =============================================================================
-- Núcleo: identidad (personas, usuarios, roles, apoderados, consentimientos)
-- Modelo de datos canónico DM-01, DM-02, DM-06, DM-07 · Fase "expand"
--
-- Esta migración solo AGREGA. Las columnas de identidad que hoy están en usuarios
-- (dni, nombres, apellidos, email, telefono, foto_url, codigo_siagie) se conservan,
-- ahora opcionales, hasta que el login del Squad 1 lea personas. Se eliminarán en una
-- migración "contract" posterior (ADR-004, regla 5), después de cifrar los DNI
-- existentes en personas.documento_cifrado con la clave de la aplicación (ADR-009).
--
-- Las personas creadas desde usuarios existentes conservan el MISMO UUID. Así, todas
-- las columnas estudiante_id que hoy apuntan a usuarios siguen siendo válidas al
-- apuntar a personas.
-- =============================================================================

-- 1. personas -----------------------------------------------------------------
CREATE TABLE personas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    tipo_documento      VARCHAR(13) NOT NULL
                        CHECK (tipo_documento IN ('DNI', 'CE', 'PASAPORTE', 'PTP', 'SIN_DOCUMENTO')),
    documento_cifrado   BYTEA,                    -- R: AES-256-GCM, clave fuera de la BD (ADR-009)
    documento_hash      CHAR(64),                 -- R: HMAC-SHA256 del número normalizado
    documento_ultimos4  CHAR(4),                  -- I: para mostrar enmascarado
    nombres             VARCHAR(100) NOT NULL,    -- C
    apellido_paterno    VARCHAR(100) NOT NULL,    -- C
    apellido_materno    VARCHAR(100),             -- C
    fecha_nacimiento    DATE,                     -- C
    sexo                CHAR(1) CHECK (sexo IN ('M', 'F')),
    email               VARCHAR(254),             -- C
    telefono            VARCHAR(20),              -- C
    foto_url            TEXT,                     -- C
    codigo_siagie       VARCHAR(20),              -- I (RF-78, RF-88)
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID NOT NULL DEFAULT app_user_id(),
    CONSTRAINT uq_personas_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT uq_personas_documento UNIQUE (tenant_id, tipo_documento, documento_hash),
    CONSTRAINT ck_personas_documento CHECK (
        (tipo_documento = 'SIN_DOCUMENTO') = (documento_hash IS NULL)
        AND (documento_hash IS NULL) = (documento_cifrado IS NULL)
    )
);
CREATE INDEX idx_personas_tenant ON personas (tenant_id);
CREATE UNIQUE INDEX uq_personas_siagie ON personas (tenant_id, codigo_siagie) WHERE codigo_siagie IS NOT NULL;
CREATE INDEX idx_personas_nombre_trgm ON personas
    USING gin ((nombres || ' ' || apellido_paterno || ' ' || coalesce(apellido_materno, '')) gin_trgm_ops);
CREATE TRIGGER trg_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 2. usuarios: nuevas columnas; la identidad deja de ser obligatoria aquí --------
ALTER TABLE usuarios
    ADD COLUMN persona_id        UUID,
    ADD COLUMN intentos_fallidos SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN bloqueado_hasta   TIMESTAMPTZ,
    ADD COLUMN created_by        UUID,
    ALTER COLUMN dni       DROP NOT NULL,
    ALTER COLUMN email     DROP NOT NULL,
    ALTER COLUMN nombres   DROP NOT NULL,
    ALTER COLUMN apellidos DROP NOT NULL;

-- 3. Usuario "sistema" por institución (modelo canónico §3) ---------------------
-- Autor de semillas, importaciones y procesos automáticos. Estado INACTIVO y clave
-- bcrypt de un valor aleatorio que nadie conoce: no puede iniciar sesión.
CREATE FUNCTION fn_usuario_sistema(p_tenant uuid) RETURNS uuid
LANGUAGE sql STABLE AS
$$ SELECT id FROM usuarios WHERE tenant_id = p_tenant AND username = 'sistema' $$;

CREATE FUNCTION fn_crear_usuario_sistema(p_tenant uuid) RETURNS uuid
LANGUAGE plpgsql AS
$$
DECLARE
    v_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO personas (id, tenant_id, tipo_documento, nombres, apellido_paterno, created_by)
    VALUES (v_id, p_tenant, 'SIN_DOCUMENTO', 'Sistema', 'Interno', v_id);
    INSERT INTO usuarios (id, tenant_id, persona_id, username, password_hash, estado, created_by)
    VALUES (v_id, p_tenant, v_id, 'sistema', crypt(gen_random_uuid()::text, gen_salt('bf', 12)), 'INACTIVO', v_id);
    RETURN v_id;
END;
$$;

SELECT fn_crear_usuario_sistema(id) FROM instituciones;

-- 4. Una persona por cada usuario existente, con el mismo UUID ------------------
-- El documento queda como SIN_DOCUMENTO: el DNI en claro no puede cifrarse en SQL
-- porque la clave no está en la BD. Lo migra un script de la aplicación (ver encabezado).
INSERT INTO personas (id, tenant_id, tipo_documento, nombres, apellido_paterno, email, telefono,
                      foto_url, codigo_siagie, created_at, updated_at, created_by)
SELECT u.id, u.tenant_id, 'SIN_DOCUMENTO', u.nombres, u.apellidos, u.email, u.telefono,
       u.foto_url, u.codigo_siagie, COALESCE(u.created_at, now()), COALESCE(u.updated_at, now()),
       fn_usuario_sistema(u.tenant_id)
FROM usuarios u
WHERE u.persona_id IS NULL;

UPDATE usuarios
SET persona_id = id,
    created_by = fn_usuario_sistema(tenant_id),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now()),
    estado     = COALESCE(estado, 'ACTIVO')
WHERE persona_id IS NULL;

-- 5. Restricciones de usuarios ---------------------------------------------------
ALTER TABLE usuarios
    ALTER COLUMN persona_id SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT now(),
    ALTER COLUMN estado     SET NOT NULL,
    ADD CONSTRAINT uq_usuarios_tenant_id UNIQUE (tenant_id, id),
    ADD CONSTRAINT uq_usuarios_persona UNIQUE (persona_id),
    ADD CONSTRAINT fk_usuarios_persona FOREIGN KEY (tenant_id, persona_id) REFERENCES personas (tenant_id, id),
    ADD CONSTRAINT ck_usuarios_baja CHECK ((fecha_baja IS NULL) = (motivo_baja IS NULL));

ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED;

SELECT _mig_drop_fk('usuarios', ARRAY['baja_por']);
ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_baja_por FOREIGN KEY (tenant_id, baja_por) REFERENCES usuarios (tenant_id, id);

ALTER TABLE personas
    ADD CONSTRAINT fk_personas_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Cada institución nueva recibe su usuario "sistema" al crearse.
-- El prefijo numérico fija el orden frente a otros triggers AFTER INSERT de instituciones.
CREATE FUNCTION fn_trg_instituciones_usuario_sistema() RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
    PERFORM fn_crear_usuario_sistema(NEW.id);
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_instituciones_10_usuario_sistema AFTER INSERT ON instituciones
    FOR EACH ROW EXECUTE FUNCTION fn_trg_instituciones_usuario_sistema();

-- 6. usuario_roles: asignación con tenant e historial (RF-73) --------------------
ALTER TABLE usuario_roles
    ADD COLUMN id          UUID NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN tenant_id   UUID,
    ADD COLUMN activo      BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN revocado_en TIMESTAMPTZ,
    ADD COLUMN created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by  UUID;

UPDATE usuario_roles ur
SET tenant_id  = u.tenant_id,
    created_by = fn_usuario_sistema(u.tenant_id)
FROM usuarios u
WHERE u.id = ur.usuario_id;

ALTER TABLE usuario_roles DROP CONSTRAINT usuario_roles_pkey;
SELECT _mig_drop_fk('usuario_roles', ARRAY['usuario_id']);
SELECT _mig_drop_fk('usuario_roles', ARRAY['rol_id']);

ALTER TABLE usuario_roles
    ADD PRIMARY KEY (id),
    ALTER COLUMN tenant_id  SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ADD CONSTRAINT fk_usuario_roles_tenant FOREIGN KEY (tenant_id) REFERENCES instituciones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (tenant_id, usuario_id) REFERENCES usuarios (tenant_id, id),
    ADD CONSTRAINT fk_usuario_roles_rol FOREIGN KEY (rol_id) REFERENCES roles (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_usuario_roles_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT ck_usuario_roles_revocacion CHECK (activo = (revocado_en IS NULL));

-- Un rol vigente por usuario; las revocaciones quedan como historial.
CREATE UNIQUE INDEX uq_usuario_roles_vigente ON usuario_roles (usuario_id, rol_id) WHERE activo;
CREATE INDEX idx_usuario_roles_tenant ON usuario_roles (tenant_id);
CREATE TRIGGER trg_usuario_roles_updated_at BEFORE UPDATE ON usuario_roles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 7. apoderados_estudiantes: ambos extremos son personas (RF-75) ---------------
ALTER TABLE apoderados_estudiantes
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;

UPDATE apoderados_estudiantes
SET created_by = COALESCE(vinculado_por, fn_usuario_sistema(tenant_id)),
    created_at = COALESCE(created_at, now()),
    activo     = COALESCE(activo, TRUE);

SELECT _mig_drop_fk('apoderados_estudiantes', ARRAY['apoderado_id']);
SELECT _mig_drop_fk('apoderados_estudiantes', ARRAY['estudiante_id']);
SELECT _mig_drop_fk('apoderados_estudiantes', ARRAY['vinculado_por']);

ALTER TABLE apoderados_estudiantes
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN activo     SET NOT NULL,
    ADD CONSTRAINT fk_apoderados_apoderado  FOREIGN KEY (tenant_id, apoderado_id)  REFERENCES personas (tenant_id, id),
    ADD CONSTRAINT fk_apoderados_estudiante FOREIGN KEY (tenant_id, estudiante_id) REFERENCES personas (tenant_id, id),
    ADD CONSTRAINT fk_apoderados_vinculado_por FOREIGN KEY (tenant_id, vinculado_por) REFERENCES usuarios (tenant_id, id),
    ADD CONSTRAINT fk_apoderados_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT ck_apoderados_distintos CHECK (apoderado_id <> estudiante_id);
CREATE INDEX idx_apoderados_estudiantes_tenant ON apoderados_estudiantes (tenant_id);
CREATE TRIGGER trg_apoderados_estudiantes_updated_at BEFORE UPDATE ON apoderados_estudiantes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 8. consentimientos_datos: lo otorga una persona (RF-68, RF-75) ----------------
ALTER TABLE consentimientos_datos RENAME COLUMN usuario_id TO persona_id;
ALTER TABLE consentimientos_datos
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;

UPDATE consentimientos_datos SET created_by = fn_usuario_sistema(tenant_id), created_at = aceptado_en;

SELECT _mig_drop_fk('consentimientos_datos', ARRAY['persona_id']);
ALTER TABLE consentimientos_datos
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ADD CONSTRAINT fk_consentimientos_persona FOREIGN KEY (tenant_id, persona_id) REFERENCES personas (tenant_id, id),
    ADD CONSTRAINT fk_consentimientos_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios (id) DEFERRABLE INITIALLY DEFERRED;
ALTER INDEX idx_consentimientos_usuario RENAME TO idx_consentimientos_persona;
CREATE INDEX idx_consentimientos_tenant ON consentimientos_datos (tenant_id);
CREATE TRIGGER trg_consentimientos_datos_updated_at BEFORE UPDATE ON consentimientos_datos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 9. Columnas que identifican a un estudiante o a un apoderado sin cuenta -------
-- En tablas de otros squads: pasan a apuntar a personas. Son FK simples porque
-- algunas de estas tablas aún no tienen tenant_id; cada squad las vuelve compuestas
-- al aplicar las convenciones del modelo canónico.
SELECT _mig_drop_fk('carnes_escolares', ARRAY['estudiante_id']);
ALTER TABLE carnes_escolares
    ADD CONSTRAINT fk_carnes_estudiante FOREIGN KEY (estudiante_id) REFERENCES personas (id);

SELECT _mig_drop_fk('citas_apoderados', ARRAY['estudiante_id']);
ALTER TABLE citas_apoderados
    ADD CONSTRAINT fk_citas_estudiante FOREIGN KEY (estudiante_id) REFERENCES personas (id);

SELECT _mig_drop_fk('documentos_emitidos', ARRAY['estudiante_id']);
ALTER TABLE documentos_emitidos
    ADD CONSTRAINT fk_documentos_estudiante FOREIGN KEY (estudiante_id) REFERENCES personas (id);

SELECT _mig_drop_fk('solicitudes_certificado', ARRAY['estudiante_id']);
ALTER TABLE solicitudes_certificado
    ADD CONSTRAINT fk_solicitudes_estudiante FOREIGN KEY (estudiante_id) REFERENCES personas (id);

SELECT _mig_drop_fk('invitaciones_apoderado', ARRAY['estudiante_id']);
SELECT _mig_drop_fk('invitaciones_apoderado', ARRAY['apoderado_id']);
ALTER TABLE invitaciones_apoderado
    ADD CONSTRAINT fk_invitaciones_estudiante FOREIGN KEY (estudiante_id) REFERENCES personas (id),
    ADD CONSTRAINT fk_invitaciones_apoderado  FOREIGN KEY (apoderado_id)  REFERENCES personas (id);
