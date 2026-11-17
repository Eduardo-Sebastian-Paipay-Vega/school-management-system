-- =============================================================================
-- Sprint 7+: Resolución silenciosa de login (sin exigir código modular en UI)
-- y motor de creación de roles y permisos dinámicos con ámbito silencioso.
-- =============================================================================

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ambito_silencioso VARCHAR(30) DEFAULT 'AUTOMATICO';
ALTER TABLE roles ADD COLUMN IF NOT EXISTS ambito_silencioso VARCHAR(30) DEFAULT 'OPERATIVO';

UPDATE roles SET ambito_silencioso = CASE
  WHEN codigo IN ('SUPERADMIN', 'DIRECTIVO') THEN 'DIRECTIVO'
  WHEN codigo IN ('COORDINADOR_ACADEMICO', 'SECRETARIA', 'AUXILIAR', 'PORTERIA') THEN 'ADMINISTRATIVO'
  WHEN codigo IN ('DOCENTE', 'DOCENTE_CONTRATADO', 'TUTOR_AULA', 'PRACTICANTE') THEN 'PEDAGOGICO'
  WHEN codigo = 'APODERADO' THEN 'FAMILIAR'
  WHEN codigo = 'ESTUDIANTE' THEN 'ESTUDIANTIL'
  ELSE 'OPERATIVO'
END WHERE id IS NOT NULL;

CREATE TABLE IF NOT EXISTS permisos_dinamicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES instituciones(id),
  codigo VARCHAR(80) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  modulo VARCHAR(60) NOT NULL,
  ambito_silencioso VARCHAR(30) NOT NULL DEFAULT 'OPERATIVO'
    CHECK (ambito_silencioso IN ('DIRECTIVO', 'ADMINISTRATIVO', 'PEDAGOGICO', 'TUTORIA', 'BIENESTAR', 'FAMILIAR', 'ESTUDIANTIL', 'OPERATIVO')),
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID DEFAULT app_user_id(),
  CONSTRAINT uq_permiso_dinamico_tenant UNIQUE (tenant_id, codigo)
);

CREATE TABLE IF NOT EXISTS roles_dinamicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES instituciones(id),
  codigo VARCHAR(60) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  ambito_silencioso VARCHAR(30) NOT NULL DEFAULT 'ADMINISTRATIVO'
    CHECK (ambito_silencioso IN ('DIRECTIVO', 'ADMINISTRATIVO', 'PEDAGOGICO', 'TUTORIA', 'BIENESTAR', 'FAMILIAR', 'ESTUDIANTIL', 'OPERATIVO')),
  prioridad_distincion INT NOT NULL DEFAULT 50,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID DEFAULT app_user_id(),
  CONSTRAINT uq_rol_dinamico_tenant UNIQUE (tenant_id, codigo)
);

CREATE TABLE IF NOT EXISTS rol_dinamico_permisos (
  tenant_id UUID NOT NULL REFERENCES instituciones(id),
  rol_dinamico_id UUID NOT NULL REFERENCES roles_dinamicos(id),
  permiso_codigo VARCHAR(80) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, rol_dinamico_id, permiso_codigo)
);

CREATE TABLE IF NOT EXISTS usuario_roles_dinamicos (
  tenant_id UUID NOT NULL REFERENCES instituciones(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  rol_dinamico_id UUID NOT NULL REFERENCES roles_dinamicos(id),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, usuario_id, rol_dinamico_id)
);

ALTER TABLE permisos_dinamicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_dinamicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rol_dinamico_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_roles_dinamicos ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['permisos_dinamicos', 'roles_dinamicos', 'rol_dinamico_permisos', 'usuario_roles_dinamicos'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'p_' || t || '_tenant') THEN
      EXECUTE format('CREATE POLICY %I ON %I USING (tenant_id = app_tenant_id()) WITH CHECK (tenant_id = app_tenant_id())', 'p_' || t || '_tenant', t);
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON permisos_dinamicos, roles_dinamicos, rol_dinamico_permisos, usuario_roles_dinamicos TO sms_app;

CREATE OR REPLACE FUNCTION fn_resolver_tenant_silencioso(
  p_identificador varchar,
  p_documento_hash char(64) DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_tenant uuid;
  v_norm text := lower(btrim(coalesce(p_identificador, '')));
BEGIN
  SELECT u.tenant_id INTO v_tenant
    FROM usuarios u
    JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
    JOIN instituciones i ON i.id = u.tenant_id
   WHERE i.activo IS TRUE
     AND i.estado_tenant = 'ACTIVO'
     AND u.estado = 'ACTIVO'
     AND (
       lower(u.username) = v_norm
       OR lower(p.email) = v_norm
       OR (p_documento_hash IS NOT NULL AND p.documento_hash = p_documento_hash)
     )
   ORDER BY u.ultimo_acceso_en DESC NULLS LAST, u.created_at ASC
   LIMIT 1;

  IF v_tenant IS NULL THEN
    SELECT id INTO v_tenant
      FROM instituciones
     WHERE activo IS TRUE AND estado_tenant = 'ACTIVO'
     ORDER BY CASE WHEN codigo_modular = '0425892' THEN 0 ELSE 1 END, created_at ASC
     LIMIT 1;
  END IF;

  RETURN v_tenant;
END $$;

REVOKE ALL ON FUNCTION fn_resolver_tenant_silencioso(varchar, char(64)) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_resolver_tenant_silencioso(varchar, char(64)) TO sms_app;
