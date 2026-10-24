-- Core S1: sesiones, enlaces de un uso y aislamiento de avisos.
-- Se agrega al esquema expand existente; no modifica migraciones aplicadas.

ALTER TABLE usuarios
    ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN email_verificado_en TIMESTAMPTZ,
    ADD COLUMN ultimo_acceso_en TIMESTAMPTZ;

-- La relación verificada por Secretaría no concede acceso familiar hasta que
-- el apoderado consuma su invitación y acepte la versión vigente del texto.
ALTER TABLE apoderados_estudiantes ADD COLUMN confirmado_en TIMESTAMPTZ;

CREATE TABLE sesiones_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL,
    familia_id UUID NOT NULL DEFAULT gen_random_uuid(),
    refresh_hash CHAR(64) NOT NULL UNIQUE,
    access_jti UUID NOT NULL,
    version_auth INTEGER NOT NULL,
    expira_en TIMESTAMPTZ NOT NULL,
    ultima_actividad_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    revocada_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_sesiones_usuario FOREIGN KEY (tenant_id, usuario_id) REFERENCES usuarios(tenant_id,id),
    CONSTRAINT uq_sesiones_tenant_id UNIQUE (tenant_id,id),
    CONSTRAINT ck_sesiones_fechas CHECK (expira_en > created_at)
);
CREATE INDEX idx_sesiones_usuario_activas ON sesiones_usuario(tenant_id,usuario_id,expira_en)
    WHERE revocada_en IS NULL;
CREATE INDEX idx_sesiones_familia ON sesiones_usuario(tenant_id,familia_id);
CREATE TRIGGER trg_sesiones_updated_at BEFORE UPDATE ON sesiones_usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE enlaces_acceso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL,
    proposito VARCHAR(16) NOT NULL CHECK (proposito IN ('ACTIVACION','RECUPERACION')),
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT app_user_id() REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_enlaces_usuario FOREIGN KEY (tenant_id,usuario_id) REFERENCES usuarios(tenant_id,id),
    CONSTRAINT uq_enlaces_tenant_id UNIQUE (tenant_id,id),
    CONSTRAINT ck_enlaces_fechas CHECK (expira_en > created_at)
);
CREATE INDEX idx_enlaces_usuario_vigentes ON enlaces_acceso(tenant_id,usuario_id,proposito,expira_en)
    WHERE usado_en IS NULL;
CREATE TRIGGER trg_enlaces_updated_at BEFORE UPDATE ON enlaces_acceso
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Las tablas históricas de RF-76 carecían de tenant en dos relaciones.
ALTER TABLE notificaciones
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;
UPDATE notificaciones n
SET created_by = fn_usuario_sistema(n.tenant_id);
ALTER TABLE notificaciones
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ADD CONSTRAINT fk_notificaciones_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT uq_notificaciones_tenant_id UNIQUE (tenant_id,id);
SELECT _mig_drop_fk('notificaciones', ARRAY['usuario_id']);
ALTER TABLE notificaciones
    ADD CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (tenant_id,usuario_id)
        REFERENCES usuarios(tenant_id,id);
CREATE TRIGGER trg_notificaciones_updated_at BEFORE UPDATE ON notificaciones
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE preferencias_notificacion
    ADD COLUMN tenant_id UUID,
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;
UPDATE preferencias_notificacion p
SET tenant_id = u.tenant_id, created_by = fn_usuario_sistema(u.tenant_id)
FROM usuarios u WHERE u.id = p.usuario_id;
SELECT _mig_drop_fk('preferencias_notificacion', ARRAY['usuario_id']);
ALTER TABLE preferencias_notificacion
    ALTER COLUMN tenant_id SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ADD CONSTRAINT fk_preferencias_tenant FOREIGN KEY (tenant_id) REFERENCES instituciones(id),
    ADD CONSTRAINT fk_preferencias_usuario FOREIGN KEY (tenant_id,usuario_id) REFERENCES usuarios(tenant_id,id),
    ADD CONSTRAINT fk_preferencias_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX idx_preferencias_tenant ON preferencias_notificacion(tenant_id);
CREATE TRIGGER trg_preferencias_updated_at BEFORE UPDATE ON preferencias_notificacion
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE envios_correo
    ADD COLUMN tenant_id UUID,
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN created_by UUID;
UPDATE envios_correo e
SET tenant_id = n.tenant_id, created_by = fn_usuario_sistema(n.tenant_id)
FROM notificaciones n WHERE n.id = e.notificacion_id;
SELECT _mig_drop_fk('envios_correo', ARRAY['notificacion_id']);
ALTER TABLE envios_correo
    ALTER COLUMN tenant_id SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN created_by SET DEFAULT app_user_id(),
    ADD CONSTRAINT fk_envios_tenant FOREIGN KEY (tenant_id) REFERENCES instituciones(id),
    ADD CONSTRAINT fk_envios_notificacion FOREIGN KEY (tenant_id,notificacion_id)
        REFERENCES notificaciones(tenant_id,id),
    ADD CONSTRAINT fk_envios_created_by FOREIGN KEY (created_by)
        REFERENCES usuarios(id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX idx_envios_tenant ON envios_correo(tenant_id);
CREATE TRIGGER trg_envios_updated_at BEFORE UPDATE ON envios_correo
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Resolver institución por código modular antes del login sin otorgar SELECT global.
CREATE FUNCTION fn_resolver_institucion(p_codigo varchar) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS
$$ SELECT id FROM instituciones WHERE codigo_modular = p_codigo AND activo IS TRUE $$;
REVOKE ALL ON FUNCTION fn_resolver_institucion(varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_resolver_institucion(varchar) TO sms_app;

DO $$
DECLARE t regclass;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'sesiones_usuario'::regclass, 'enlaces_acceso'::regclass,
        'preferencias_notificacion'::regclass, 'envios_correo'::regclass
    ] LOOP
        EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY',t);
        EXECUTE format('CREATE POLICY %I ON %s USING (tenant_id = app_tenant_id()) WITH CHECK (tenant_id = app_tenant_id())',
                       'p_' || t::text || '_tenant',t);
    END LOOP;
END $$;
GRANT SELECT, INSERT, UPDATE ON sesiones_usuario, enlaces_acceso,
    preferencias_notificacion, envios_correo TO sms_app;
