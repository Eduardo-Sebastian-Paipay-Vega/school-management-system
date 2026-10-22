-- =============================================================================
-- Row-Level Security y privilegios del rol de aplicación
-- ADR-003 · Modelo de datos canónico §6
-- =============================================================================

-- 1. Política estándar en toda tabla de public con tenant_id -------------------------
-- Incluye las tablas de los demás squads que ya tienen tenant_id. Las que aún no lo
-- tienen la recibirán en sus migraciones, y la prueba de RLS de database/tests exige
-- que toda tabla con tenant_id tenga política.
DO $$
DECLARE
    t record;
    v_politica text;
BEGIN
    FOR t IN
        SELECT c.oid::regclass AS tabla, c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
          AND NOT c.relispartition
    LOOP
        v_politica := 'p_' || t.relname || '_tenant';
        EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t.tabla);
        IF NOT EXISTS (SELECT 1 FROM pg_policies
                       WHERE schemaname = 'public' AND tablename = t.relname AND policyname = v_politica) THEN
            EXECUTE format('CREATE POLICY %I ON %s USING (tenant_id = app_tenant_id()) WITH CHECK (tenant_id = app_tenant_id())',
                           v_politica, t.tabla);
        END IF;
    END LOOP;
END $$;

-- instituciones es el tenant: cada uno ve solo su propia fila.
ALTER TABLE instituciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_instituciones_tenant ON instituciones
    USING (id = app_tenant_id())
    WITH CHECK (id = app_tenant_id());

-- 2. Privilegios de sms_app ---------------------------------------------------------
GRANT USAGE ON SCHEMA public TO sms_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO sms_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sms_app;

-- Catálogos globales: solo lectura.
REVOKE INSERT, UPDATE ON roles, banco_conclusiones_cneb FROM sms_app;
-- Las instituciones se dan de alta por un procedimiento administrativo.
REVOKE INSERT ON instituciones FROM sms_app;
-- Auditoría: lectura (con RLS) e inserción solo mediante fn_registrar_auditoria().
REVOKE INSERT, UPDATE ON logs_auditoria FROM sms_app;
GRANT EXECUTE ON FUNCTION fn_registrar_auditoria(varchar, varchar, inet, varchar, varchar, jsonb, jsonb, text, uuid) TO sms_app;
GRANT EXECUTE ON FUNCTION fn_verificar_cadena_auditoria() TO sms_app;

-- Las particiones de auditoría solo se leen a través de la tabla padre.
DO $$
DECLARE
    p record;
BEGIN
    FOR p IN SELECT inhrelid::regclass AS particion FROM pg_inherits WHERE inhparent = 'logs_auditoria'::regclass LOOP
        EXECUTE format('REVOKE ALL ON %s FROM sms_app', p.particion);
    END LOOP;
END $$;

-- Funciones internas de las migraciones y del alta de tenants.
REVOKE ALL ON FUNCTION fn_crear_usuario_sistema(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION _mig_drop_fk(regclass, text[]) FROM PUBLIC;

-- 3. Vistas ------------------------------------------------------------------------
-- Una vista común se ejecuta con los permisos de su dueño, que no está sujeto a RLS.
-- security_invoker hace que se apliquen las políticas de quien la consulta.
ALTER VIEW v_avance_registro_notas SET (security_invoker = true);

-- PostgreSQL no aplica RLS a vistas materializadas: la aplicación las lee filtradas.
REVOKE ALL ON vm_rendimiento_seccion FROM sms_app;
CREATE VIEW v_rendimiento_seccion WITH (security_barrier = true) AS
    SELECT * FROM vm_rendimiento_seccion WHERE tenant_id = app_tenant_id();
GRANT SELECT ON v_rendimiento_seccion TO sms_app;

-- 4. Esquema squad3 (M8): conserva sus propias políticas RLS ------------------------
GRANT USAGE ON SCHEMA squad3 TO sms_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA squad3 TO sms_app;
REVOKE UPDATE ON squad3.grade_audit_history FROM sms_app;

-- 5. Objetos futuros creados por el rol que ejecuta las migraciones -----------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO sms_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO sms_app;
