-- =============================================================================
-- Contexto de transacción, utilidades comunes y rol de aplicación
-- ADR-003 (aislamiento) · Modelo de datos canónico C-06, C-07 y C-14
-- =============================================================================

-- Tenant y usuario de la transacción en curso. Devuelven NULL si no están definidos,
-- así las políticas RLS fallan cerradas y created_by NOT NULL rechaza la inserción.
CREATE OR REPLACE FUNCTION app_tenant_id() RETURNS uuid
LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid
LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

-- C-06: mantiene updated_at en cada UPDATE.
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- C-07: bloquea UPDATE, DELETE y TRUNCATE en tablas de solo inserción.
CREATE OR REPLACE FUNCTION fn_bloquear_modificacion() RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
    RAISE EXCEPTION 'La tabla % es de solo inserción (Ley N.° 29733)', TG_TABLE_NAME;
END;
$$;

-- Utilidad de migraciones: elimina las FK cuya lista de columnas es exactamente p_columnas.
-- La línea base declara FK sin nombre (p. ej. usuarios_baja_por_fkey); así no dependemos
-- del nombre generado por PostgreSQL.
CREATE OR REPLACE FUNCTION _mig_drop_fk(p_tabla regclass, p_columnas text[]) RETURNS integer
LANGUAGE plpgsql AS
$$
DECLARE
    v_con record;
    v_total integer := 0;
BEGIN
    FOR v_con IN
        SELECT c.conname
        FROM pg_constraint c
        WHERE c.conrelid = p_tabla
          AND c.contype = 'f'
          AND (SELECT array_agg(a.attname::text ORDER BY k.ord)
               FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
               JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum) = p_columnas
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', p_tabla, v_con.conname);
        v_total := v_total + 1;
    END LOOP;
    RETURN v_total;
END;
$$;

-- Rol de grupo de la aplicación (ADR-003). No tiene login: los usuarios con login
-- de cada entorno se crean en el despliegue y se agregan con GRANT sms_app TO <usuario>.
-- Los privilegios sobre las tablas se conceden en la migración de RLS y permisos.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sms_app') THEN
        CREATE ROLE sms_app NOLOGIN NOBYPASSRLS;
    END IF;
END $$;
