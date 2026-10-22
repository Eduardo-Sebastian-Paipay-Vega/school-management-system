-- =============================================================================
-- Núcleo: auditoría particionada con cadena de hash por tenant
-- Modelo de datos canónico DM-08 · RF-65, RF-66, RF-67 · Ley N.° 29733
--
-- La cadena de hash se calcula DENTRO de la base de datos con fn_registrar_auditoria(),
-- bajo un bloqueo por tenant. El rol de aplicación no puede insertar directamente,
-- así que ninguna fila entra fuera de la cadena.
-- =============================================================================

-- 1. Nueva tabla particionada por mes ------------------------------------------------
ALTER TABLE logs_auditoria RENAME TO logs_auditoria_v1;

CREATE TABLE logs_auditoria (
    id                BIGINT GENERATED ALWAYS AS IDENTITY,
    tenant_id         UUID NOT NULL REFERENCES instituciones(id),
    usuario_id        UUID,            -- NULL en eventos sin sesión (p. ej. login fallido)
    modulo            VARCHAR(50) NOT NULL,
    accion            VARCHAR(50) NOT NULL,
    tabla_afectada    VARCHAR(63),
    registro_id       VARCHAR(64),
    ip_origen         INET NOT NULL,
    user_agent        TEXT,
    request_id        UUID,            -- correlación con los logs de aplicación (ADR-011)
    payload_anterior  JSONB,           -- nunca datos de clase R (documento, claves)
    payload_nuevo     JSONB,
    hash_previo       CHAR(64),
    hash_registro     CHAR(64) NOT NULL,
    timestamp_utc     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, timestamp_utc)
) PARTITION BY RANGE (timestamp_utc);

CREATE INDEX idx_logs_auditoria_tenant_id ON logs_auditoria (tenant_id, id DESC);
CREATE INDEX idx_logs_auditoria_tenant_fecha ON logs_auditoria (tenant_id, timestamp_utc DESC);
CREATE INDEX idx_logs_auditoria_usuario ON logs_auditoria (usuario_id);
CREATE INDEX idx_logs_auditoria_modulo ON logs_auditoria (tenant_id, modulo);

CREATE TRIGGER trg_logs_auditoria_inmutable BEFORE UPDATE OR DELETE ON logs_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_modificacion();
CREATE TRIGGER trg_logs_auditoria_sin_truncate BEFORE TRUNCATE ON logs_auditoria
    FOR EACH STATEMENT EXECUTE FUNCTION fn_bloquear_modificacion();

-- 2. Particiones ----------------------------------------------------------------------
-- Una por mes UTC. Cada partición bloquea TRUNCATE directo y no es legible por la
-- aplicación: se consulta solo a través de la tabla padre, que aplica RLS.
-- No hay partición por defecto: si falta el mes, la inserción falla (falla cerrada).
-- Un job mensual crea los meses siguientes; esta migración deja 12 meses creados.
CREATE FUNCTION fn_crear_particion_auditoria(p_mes date) RETURNS text
LANGUAGE plpgsql AS
$$
DECLARE
    v_inicio date := date_trunc('month', p_mes)::date;
    v_fin    date := (date_trunc('month', p_mes) + interval '1 month')::date;
    v_nombre text := format('logs_auditoria_%s', to_char(v_inicio, 'YYYY_MM'));
BEGIN
    IF to_regclass(v_nombre) IS NOT NULL THEN
        RETURN v_nombre;
    END IF;
    EXECUTE format('CREATE TABLE %I PARTITION OF logs_auditoria FOR VALUES FROM (%L) TO (%L)',
                   v_nombre, v_inicio::timestamp AT TIME ZONE 'UTC', v_fin::timestamp AT TIME ZONE 'UTC');
    EXECUTE format('CREATE TRIGGER %I BEFORE TRUNCATE ON %I FOR EACH STATEMENT EXECUTE FUNCTION fn_bloquear_modificacion()',
                   'trg_' || v_nombre || '_sin_truncate', v_nombre);
    EXECUTE format('REVOKE ALL ON %I FROM PUBLIC', v_nombre);
    EXECUTE format('REVOKE ALL ON %I FROM sms_app', v_nombre);
    RETURN v_nombre;
END;
$$;

DO $$
DECLARE
    v_actual date := date_trunc('month', now() AT TIME ZONE 'UTC')::date;
    v_mes    date;
BEGIN
    SELECT LEAST(COALESCE(date_trunc('month', min(timestamp_utc AT TIME ZONE 'UTC'))::date, v_actual), v_actual)
    INTO v_mes
    FROM logs_auditoria_v1;
    WHILE v_mes <= (v_actual + interval '12 months')::date LOOP
        PERFORM fn_crear_particion_auditoria(v_mes);
        v_mes := (v_mes + interval '1 month')::date;
    END LOOP;
END $$;

-- 3. Copia de los registros existentes ---------------------------------------------
-- Se conservan id y hashes. Esas filas no se encadenaron con fn_registrar_auditoria(),
-- así que fn_verificar_cadena_auditoria() las reportará como inválidas: en la práctica
-- no debería haber ninguna, porque audit.service.ts insertaba en columnas inexistentes.
INSERT INTO logs_auditoria (id, tenant_id, usuario_id, modulo, accion, tabla_afectada, registro_id,
                            ip_origen, user_agent, payload_anterior, payload_nuevo,
                            hash_previo, hash_registro, timestamp_utc)
OVERRIDING SYSTEM VALUE
SELECT id, tenant_id, usuario_id, modulo, accion, tabla_afectada, registro_id,
       ip_origen::inet, user_agent, payload_anterior, payload_nuevo,
       hash_previo, hash_registro, timestamp_utc
FROM logs_auditoria_v1;

DO $$
BEGIN
    IF (SELECT count(*) FROM logs_auditoria) <> (SELECT count(*) FROM logs_auditoria_v1) THEN
        RAISE EXCEPTION 'La copia de logs_auditoria no coincide con el original';
    END IF;
END $$;

SELECT setval(pg_get_serial_sequence('logs_auditoria', 'id'),
              COALESCE((SELECT max(id) FROM logs_auditoria), 1),
              (SELECT count(*) > 0 FROM logs_auditoria));

DROP TABLE logs_auditoria_v1;
DROP FUNCTION fn_prevent_audit_tampering();

-- 4. Cadena de hash ---------------------------------------------------------------------
-- Contenido canónico de un registro. jsonb normaliza el orden de las claves, así que el
-- resultado es determinista.
CREATE FUNCTION fn_auditoria_contenido(
    p_hash_previo text, p_tenant uuid, p_usuario uuid, p_modulo text, p_accion text,
    p_tabla text, p_registro text, p_ip inet, p_anterior jsonb, p_nuevo jsonb, p_momento timestamptz
) RETURNS text
LANGUAGE sql IMMUTABLE AS
$$
    SELECT jsonb_build_array(
        p_hash_previo, p_tenant, p_usuario, p_modulo, p_accion, p_tabla, p_registro,
        host(p_ip), p_anterior, p_nuevo,
        to_char(p_momento AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
    )::text
$$;

-- Única vía de inserción para la aplicación. Toma el tenant y el usuario del contexto
-- de la transacción (ADR-003) y serializa la cadena de cada tenant con un bloqueo.
CREATE FUNCTION fn_registrar_auditoria(
    p_modulo           varchar,
    p_accion           varchar,
    p_ip               inet,
    p_tabla            varchar DEFAULT NULL,
    p_registro_id      varchar DEFAULT NULL,
    p_payload_anterior jsonb   DEFAULT NULL,
    p_payload_nuevo    jsonb   DEFAULT NULL,
    p_user_agent       text    DEFAULT NULL,
    p_request_id       uuid    DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS
$$
DECLARE
    v_tenant  uuid := app_tenant_id();
    v_usuario uuid := app_user_id();
    v_momento timestamptz := clock_timestamp();
    v_previo  char(64);
    v_hash    char(64);
    v_id      bigint;
BEGIN
    IF v_tenant IS NULL THEN
        RAISE EXCEPTION 'fn_registrar_auditoria requiere app.tenant_id en la transacción';
    END IF;
    IF p_ip IS NULL THEN
        RAISE EXCEPTION 'fn_registrar_auditoria requiere la IP de origen';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('logs_auditoria:' || v_tenant::text, 0));

    SELECT hash_registro INTO v_previo
    FROM logs_auditoria
    WHERE tenant_id = v_tenant
    ORDER BY id DESC
    LIMIT 1;

    v_hash := encode(digest(fn_auditoria_contenido(v_previo, v_tenant, v_usuario, p_modulo, p_accion,
                                                   p_tabla, p_registro_id, p_ip, p_payload_anterior,
                                                   p_payload_nuevo, v_momento), 'sha256'), 'hex');

    INSERT INTO logs_auditoria (tenant_id, usuario_id, modulo, accion, tabla_afectada, registro_id,
                                ip_origen, user_agent, request_id, payload_anterior, payload_nuevo,
                                hash_previo, hash_registro, timestamp_utc)
    VALUES (v_tenant, v_usuario, p_modulo, p_accion, p_tabla, p_registro_id,
            p_ip, p_user_agent, p_request_id, p_payload_anterior, p_payload_nuevo,
            v_previo, v_hash, v_momento)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- Recorre la cadena del tenant de la transacción (RF-65).
CREATE FUNCTION fn_verificar_cadena_auditoria()
RETURNS TABLE (total_registros bigint, cadena_integra boolean, primer_id_invalido bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS
$$
DECLARE
    v_tenant uuid := app_tenant_id();
    v_previo char(64);
    v_total  bigint := 0;
    r        record;
BEGIN
    IF v_tenant IS NULL THEN
        RAISE EXCEPTION 'fn_verificar_cadena_auditoria requiere app.tenant_id en la transacción';
    END IF;
    FOR r IN SELECT * FROM logs_auditoria WHERE tenant_id = v_tenant ORDER BY id LOOP
        v_total := v_total + 1;
        IF r.hash_previo IS DISTINCT FROM v_previo
           OR r.hash_registro <> encode(digest(fn_auditoria_contenido(
                  r.hash_previo, r.tenant_id, r.usuario_id, r.modulo, r.accion, r.tabla_afectada,
                  r.registro_id, r.ip_origen, r.payload_anterior, r.payload_nuevo, r.timestamp_utc),
                  'sha256'), 'hex') THEN
            RETURN QUERY SELECT v_total, false, r.id;
            RETURN;
        END IF;
        v_previo := r.hash_registro;
    END LOOP;
    RETURN QUERY SELECT v_total, true, NULL::bigint;
END;
$$;

REVOKE ALL ON FUNCTION fn_registrar_auditoria(varchar, varchar, inet, varchar, varchar, jsonb, jsonb, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_verificar_cadena_auditoria() FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_crear_particion_auditoria(date) FROM PUBLIC;
