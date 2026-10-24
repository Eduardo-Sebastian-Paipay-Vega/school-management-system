-- Matriz de permisos por plantel y cola de correo con reintentos.
CREATE TABLE permisos_core (
  codigo varchar(80) PRIMARY KEY,
  descripcion varchar(200) NOT NULL
);
INSERT INTO permisos_core(codigo,descripcion) VALUES
 ('profile:read-own','Leer perfil propio'),('profile:update-own','Actualizar perfil propio'),
 ('users:read','Consultar usuarios'),('users:import','Importar usuarios'),
 ('users:manage','Crear y modificar cuentas'),
 ('users:unmask','Consultar documento completo con motivo'),
 ('users:assign-roles','Asignar roles'),('roles:read','Consultar roles'),
 ('roles:manage','Administrar matriz RBAC'),('school:read','Consultar configuración'),
 ('school:manage','Administrar configuración'),('audit:read','Consultar auditoría'),
 ('audit:export','Exportar auditoría'),('guardians:manage','Administrar vínculos familiares'),
 ('notifications:send','Enviar avisos'),('grades:read','Consultar notas'),
 ('grades:edit','Editar notas'),('attendance:read','Consultar asistencia'),
 ('attendance:record','Registrar asistencia'),('reports:read','Consultar reportes');

CREATE TABLE rol_permisos_core (
  tenant_id uuid NOT NULL REFERENCES instituciones(id),
  rol_id int NOT NULL REFERENCES roles(id),
  permiso_codigo varchar(80) NOT NULL REFERENCES permisos_core(codigo),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES usuarios(id),
  PRIMARY KEY(tenant_id,rol_id,permiso_codigo)
);
INSERT INTO rol_permisos_core(tenant_id,rol_id,permiso_codigo)
SELECT i.id,r.id,p.codigo FROM instituciones i CROSS JOIN roles r CROSS JOIN permisos_core p
WHERE r.codigo::text='SUPERADMIN'
   OR p.codigo IN ('profile:read-own','profile:update-own')
   OR (r.codigo::text='DIRECTIVO' AND p.codigo IN
       ('users:read','users:import','users:manage','roles:read','school:read','school:manage','audit:read','audit:export','guardians:manage','notifications:send','reports:read'))
   OR (r.codigo::text='SECRETARIA' AND p.codigo IN
       ('users:read','users:import','roles:read','school:read','guardians:manage','notifications:send'))
   OR (r.codigo::text='COORDINADOR_ACADEMICO' AND p.codigo IN
       ('users:read','school:read','school:manage','grades:read','reports:read'))
   OR (r.codigo::text IN ('DOCENTE','DOCENTE_CONTRATADO') AND p.codigo IN
       ('grades:read','grades:edit','attendance:record','reports:read'))
   OR (r.codigo::text IN ('ESTUDIANTE','APODERADO') AND p.codigo IN
       ('grades:read','attendance:read'));

CREATE FUNCTION fn_seed_permisos_plantel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO rol_permisos_core(tenant_id,rol_id,permiso_codigo)
 SELECT NEW.id,r.id,p.codigo FROM roles r CROSS JOIN permisos_core p
 WHERE r.codigo::text='SUPERADMIN' OR p.codigo IN ('profile:read-own','profile:update-own')
   OR (r.codigo::text='DIRECTIVO' AND p.codigo IN
       ('users:read','users:import','users:manage','roles:read','school:read','school:manage','audit:read','audit:export','guardians:manage','notifications:send','reports:read'))
   OR (r.codigo::text='SECRETARIA' AND p.codigo IN
       ('users:read','users:import','roles:read','school:read','guardians:manage','notifications:send'))
   OR (r.codigo::text='COORDINADOR_ACADEMICO' AND p.codigo IN
       ('users:read','school:read','school:manage','grades:read','reports:read'))
   OR (r.codigo::text IN ('DOCENTE','DOCENTE_CONTRATADO') AND p.codigo IN
       ('grades:read','grades:edit','attendance:record','reports:read'))
   OR (r.codigo::text IN ('ESTUDIANTE','APODERADO') AND p.codigo IN
       ('grades:read','attendance:read'));
 RETURN NEW;
END $$;
CREATE TRIGGER trg_seed_permisos_plantel AFTER INSERT ON instituciones
 FOR EACH ROW EXECUTE FUNCTION fn_seed_permisos_plantel();
ALTER TABLE rol_permisos_core ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_rol_permisos_core_tenant ON rol_permisos_core
 USING (tenant_id=app_tenant_id()) WITH CHECK (tenant_id=app_tenant_id());
GRANT SELECT,INSERT,DELETE ON rol_permisos_core TO sms_app;
GRANT SELECT ON permisos_core TO sms_app;

ALTER TABLE envios_correo ADD COLUMN proximo_intento_en timestamptz NOT NULL DEFAULT now();
CREATE INDEX idx_envios_reintento ON envios_correo(proximo_intento_en)
 WHERE estado='PENDIENTE';
CREATE FUNCTION fn_tenants_correo_pendiente() RETURNS SETOF uuid
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT DISTINCT tenant_id FROM envios_correo
 WHERE estado='PENDIENTE' AND proximo_intento_en<=now() $$;
REVOKE ALL ON FUNCTION fn_tenants_correo_pendiente() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_tenants_correo_pendiente() TO sms_app;
