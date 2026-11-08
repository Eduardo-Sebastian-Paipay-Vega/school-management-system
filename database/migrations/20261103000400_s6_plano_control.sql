-- ADR-014 (propuesto): plano de control interno, sin alta pública ni acceso escolar.
-- El operador usa un rol distinto al rol de ejecución y solo funciones acotadas.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='sms_operator') THEN
    CREATE ROLE sms_operator NOLOGIN NOINHERIT;
  END IF;
END $$;

ALTER TABLE instituciones ADD COLUMN estado_tenant varchar(20);
UPDATE instituciones SET estado_tenant=CASE WHEN activo THEN 'ACTIVO' ELSE 'SUSPENDIDO' END;
ALTER TABLE instituciones ALTER COLUMN estado_tenant SET NOT NULL;
ALTER TABLE instituciones ALTER COLUMN estado_tenant SET DEFAULT 'ACTIVO';
ALTER TABLE instituciones ADD CONSTRAINT ck_instituciones_estado_tenant
  CHECK (estado_tenant IN ('SOLICITADO','APROVISIONANDO','ACTIVO','SUSPENDIDO','ARCHIVADO'));
ALTER TABLE instituciones ADD CONSTRAINT ck_instituciones_estado_activo
  CHECK (activo=(estado_tenant='ACTIVO'));
CREATE INDEX idx_instituciones_estado_tenant ON instituciones(estado_tenant);

-- Solo los campos escolares editables siguen disponibles a sms_app.
REVOKE UPDATE ON instituciones FROM sms_app;
GRANT UPDATE (nombre,direccion,telefono) ON instituciones TO sms_app;

CREATE TABLE tenant_config_operativa (
  tenant_id uuid PRIMARY KEY REFERENCES instituciones(id) ON DELETE RESTRICT,
  origenes_permitidos text[] NOT NULL DEFAULT ARRAY[]::text[],
  correo_remitente varchar(254),
  limite_rpm integer NOT NULL DEFAULT 120 CHECK (limite_rpm BETWEEN 10 AND 10000),
  limite_jobs integer NOT NULL DEFAULT 100 CHECK (limite_jobs BETWEEN 1 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT fk_tenant_config_autor FOREIGN KEY (tenant_id,created_by)
    REFERENCES usuarios(tenant_id,id)
);
ALTER TABLE tenant_config_operativa ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_tenant_config_operativa_tenant ON tenant_config_operativa
  USING (tenant_id=app_tenant_id()) WITH CHECK (tenant_id=app_tenant_id());
GRANT SELECT ON tenant_config_operativa TO sms_app;

CREATE TABLE operaciones_tenant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid UNIQUE,
  tenant_id uuid NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT,
  codigo_modular varchar(10) NOT NULL,
  accion varchar(32) NOT NULL,
  actor_operador varchar(120) NOT NULL,
  motivo text NOT NULL,
  registrado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_operacion_actor CHECK (length(btrim(actor_operador))>=3),
  CONSTRAINT ck_operacion_motivo CHECK (length(btrim(motivo))>=10)
);
CREATE INDEX idx_operaciones_tenant_fecha ON operaciones_tenant(tenant_id,registrado_en DESC);
ALTER TABLE operaciones_tenant ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_operaciones_tenant_bloqueada ON operaciones_tenant
  USING (false) WITH CHECK (false);
REVOKE ALL ON tenant_config_operativa,operaciones_tenant FROM PUBLIC,sms_operator;

CREATE FUNCTION fn_operador_provisionar(
  p_solicitud uuid,p_codigo varchar,p_nombre varchar,p_actor varchar,p_motivo text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_tenant uuid; v_codigo varchar;
BEGIN
  IF p_solicitud IS NULL OR p_codigo IS NULL OR length(btrim(p_codigo)) NOT BETWEEN 1 AND 10
     OR p_nombre IS NULL OR length(btrim(p_nombre))<3 OR length(p_nombre)>150
     OR p_actor IS NULL OR p_actor<>session_user OR length(btrim(p_actor))<3
     OR p_motivo IS NULL OR length(btrim(p_motivo))<10 THEN
    RAISE EXCEPTION 'Solicitud de provisión inválida';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('provision:'||p_solicitud::text,0));
  SELECT tenant_id,codigo_modular INTO v_tenant,v_codigo
    FROM operaciones_tenant WHERE solicitud_id=p_solicitud AND accion='PROVISION';
  IF v_tenant IS NOT NULL THEN
    IF v_codigo<>p_codigo THEN RAISE EXCEPTION 'La solicitud ya pertenece a otro código'; END IF;
    RETURN v_tenant;
  END IF;
  INSERT INTO instituciones(codigo_modular,nombre,nivel_educativo,activo,estado_tenant)
    VALUES(p_codigo,p_nombre,'INICIAL, PRIMARIA Y SECUNDARIA',false,'APROVISIONANDO')
    RETURNING id INTO v_tenant;
  INSERT INTO tenant_config_operativa(tenant_id,created_by)
    VALUES(v_tenant,fn_usuario_sistema(v_tenant));
  INSERT INTO operaciones_tenant(solicitud_id,tenant_id,codigo_modular,accion,actor_operador,motivo)
    VALUES(p_solicitud,v_tenant,p_codigo,'PROVISION',p_actor,p_motivo);
  RETURN v_tenant;
END $$;

CREATE FUNCTION fn_operador_preparar_admin(
  p_tenant uuid,p_actor varchar,p_motivo text,p_nombres varchar,p_apellido varchar,
  p_email varchar,p_documento_hash char(64),p_documento_cifrado bytea,
  p_ultimos4 char(4),p_token_hash char(64)
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_codigo varchar; v_sistema uuid; v_usuario uuid; v_persona uuid;
BEGIN
  IF p_actor IS NULL OR p_actor<>session_user OR length(btrim(p_actor))<3
    OR p_motivo IS NULL OR length(btrim(p_motivo))<10
    OR p_nombres IS NULL OR length(btrim(p_nombres))<2
    OR p_apellido IS NULL OR length(btrim(p_apellido))<2
    OR p_email IS NULL OR p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    OR p_documento_hash IS NULL OR p_documento_cifrado IS NULL
    OR p_ultimos4 IS NULL THEN
    RAISE EXCEPTION 'Administrador inicial inválido';
  END IF;
  SELECT codigo_modular INTO v_codigo FROM instituciones
    WHERE id=p_tenant AND estado_tenant='APROVISIONANDO' FOR UPDATE;
  IF v_codigo IS NULL THEN RAISE EXCEPTION 'Tenant no está aprovisionando'; END IF;
  v_sistema:=fn_usuario_sistema(p_tenant);
  PERFORM set_config('app.tenant_id',p_tenant::text,true);
  PERFORM set_config('app.user_id',v_sistema::text,true);
  SELECT u.id INTO v_usuario FROM usuarios u JOIN personas p ON p.id=u.persona_id
    WHERE u.tenant_id=p_tenant AND p.documento_hash=p_documento_hash FOR UPDATE;
  IF v_usuario IS NULL THEN
    INSERT INTO personas(tenant_id,tipo_documento,documento_hash,documento_cifrado,
      documento_ultimos4,nombres,apellido_paterno,email)
      VALUES(p_tenant,'DNI',p_documento_hash,p_documento_cifrado,p_ultimos4,
        p_nombres,p_apellido,lower(p_email)) RETURNING id INTO v_persona;
    INSERT INTO usuarios(tenant_id,persona_id,username,password_hash,estado)
      VALUES(p_tenant,v_persona,'admin_'||v_codigo,
        crypt(gen_random_uuid()::text,gen_salt('bf',12)),'PENDIENTE_CAMBIO_CLAVE')
      RETURNING id INTO v_usuario;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM usuarios u JOIN personas p ON p.id=u.persona_id
       WHERE u.id=v_usuario AND u.estado='PENDIENTE_CAMBIO_CLAVE'
       AND lower(p.email)=lower(p_email) AND p.documento_ultimos4=p_ultimos4) THEN
      RAISE EXCEPTION 'Administrador inicial no coincide';
    END IF;
  END IF;
  INSERT INTO usuario_roles(tenant_id,usuario_id,rol_id)
    SELECT p_tenant,v_usuario,r.id FROM roles r WHERE r.codigo='SUPERADMIN'
      AND NOT EXISTS(SELECT 1 FROM usuario_roles ur WHERE ur.usuario_id=v_usuario
        AND ur.rol_id=r.id AND ur.activo);
  IF p_token_hash IS NOT NULL THEN
    UPDATE enlaces_acceso SET usado_en=now() WHERE tenant_id=p_tenant
      AND usuario_id=v_usuario AND proposito='ACTIVACION' AND usado_en IS NULL;
    INSERT INTO enlaces_acceso(tenant_id,usuario_id,proposito,token_hash,expira_en)
      VALUES(p_tenant,v_usuario,'ACTIVACION',p_token_hash,now()+interval '72 hours');
  END IF;
  INSERT INTO operaciones_tenant(tenant_id,codigo_modular,accion,actor_operador,motivo)
    VALUES(p_tenant,v_codigo,'PREPARE_ADMIN',p_actor,p_motivo);
  RETURN v_usuario;
END $$;

CREATE FUNCTION fn_operador_cambiar_estado(
  p_tenant uuid,p_estado varchar,p_actor varchar,p_motivo text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_anterior varchar; v_codigo varchar;
BEGIN
  IF p_actor IS NULL OR p_actor<>session_user OR length(btrim(p_actor))<3
    OR p_motivo IS NULL OR length(btrim(p_motivo))<10
    OR p_estado NOT IN ('ACTIVO','SUSPENDIDO') THEN
    RAISE EXCEPTION 'Cambio de estado inválido';
  END IF;
  SELECT estado_tenant,codigo_modular INTO v_anterior,v_codigo
    FROM instituciones WHERE id=p_tenant FOR UPDATE;
  IF v_anterior IS NULL THEN RAISE EXCEPTION 'Tenant inexistente'; END IF;
  IF v_anterior=p_estado THEN RETURN false; END IF;
  IF (v_anterior='APROVISIONANDO' AND p_estado='ACTIVO') THEN
    IF NOT EXISTS(SELECT 1 FROM usuarios u JOIN usuario_roles ur ON ur.usuario_id=u.id
      JOIN roles r ON r.id=ur.rol_id WHERE u.tenant_id=p_tenant
      AND u.estado='PENDIENTE_CAMBIO_CLAVE' AND ur.activo AND r.codigo='SUPERADMIN'
      AND EXISTS(SELECT 1 FROM enlaces_acceso e WHERE e.usuario_id=u.id
        AND e.proposito='ACTIVACION' AND e.usado_en IS NULL AND e.expira_en>now())) THEN
      RAISE EXCEPTION 'Falta invitación vigente del primer administrador';
    END IF;
  ELSIF NOT (v_anterior='ACTIVO' AND p_estado='SUSPENDIDO'
         OR v_anterior='SUSPENDIDO' AND p_estado='ACTIVO') THEN
    RAISE EXCEPTION 'Transición de tenant inválida';
  END IF;
  UPDATE instituciones SET estado_tenant=p_estado,activo=(p_estado='ACTIVO') WHERE id=p_tenant;
  IF p_estado='SUSPENDIDO' THEN
    UPDATE sesiones_usuario SET revocada_en=coalesce(revocada_en,now())
      WHERE tenant_id=p_tenant AND revocada_en IS NULL;
  END IF;
  INSERT INTO operaciones_tenant(tenant_id,codigo_modular,accion,actor_operador,motivo)
    VALUES(p_tenant,v_codigo,p_estado,p_actor,p_motivo);
  RETURN true;
END $$;

CREATE FUNCTION fn_operador_configurar(
  p_tenant uuid,p_actor varchar,p_motivo text,p_origenes text[],
  p_correo varchar,p_limite_rpm integer,p_limite_jobs integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_codigo varchar;
BEGIN
  IF p_actor IS NULL OR p_actor<>session_user OR length(btrim(p_actor))<3
    OR p_motivo IS NULL OR length(btrim(p_motivo))<10
    OR p_limite_rpm NOT BETWEEN 10 AND 10000 OR p_limite_jobs NOT BETWEEN 1 AND 100000
    OR array_length(p_origenes,1)>20 OR EXISTS(SELECT 1 FROM unnest(p_origenes) o
       WHERE o !~ '^https://[^/[:space:]]+$')
    OR (p_correo IS NOT NULL AND p_correo !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') THEN
    RAISE EXCEPTION 'Configuración operativa inválida';
  END IF;
  SELECT codigo_modular INTO v_codigo FROM instituciones WHERE id=p_tenant FOR UPDATE;
  IF v_codigo IS NULL THEN RAISE EXCEPTION 'Tenant inexistente'; END IF;
  UPDATE tenant_config_operativa SET origenes_permitidos=coalesce(p_origenes,ARRAY[]::text[]),
    correo_remitente=p_correo,limite_rpm=p_limite_rpm,limite_jobs=p_limite_jobs,updated_at=now()
    WHERE tenant_id=p_tenant;
  INSERT INTO operaciones_tenant(tenant_id,codigo_modular,accion,actor_operador,motivo)
    VALUES(p_tenant,v_codigo,'CONFIGURE',p_actor,p_motivo);
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION fn_resolver_institucion(p_codigo varchar) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT id FROM instituciones WHERE codigo_modular=p_codigo
   AND activo IS TRUE AND estado_tenant='ACTIVO' $$;

REVOKE ALL ON FUNCTION fn_operador_provisionar(uuid,varchar,varchar,varchar,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_operador_preparar_admin(uuid,varchar,text,varchar,varchar,varchar,char(64),bytea,char(4),char(64)) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_operador_cambiar_estado(uuid,varchar,varchar,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_operador_configurar(uuid,varchar,text,text[],varchar,integer,integer) FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO sms_operator;
GRANT EXECUTE ON FUNCTION fn_operador_provisionar(uuid,varchar,varchar,varchar,text) TO sms_operator;
GRANT EXECUTE ON FUNCTION fn_operador_preparar_admin(uuid,varchar,text,varchar,varchar,varchar,char(64),bytea,char(4),char(64)) TO sms_operator;
GRANT EXECUTE ON FUNCTION fn_operador_cambiar_estado(uuid,varchar,varchar,text) TO sms_operator;
GRANT EXECUTE ON FUNCTION fn_operador_configurar(uuid,varchar,text,text[],varchar,integer,integer) TO sms_operator;
