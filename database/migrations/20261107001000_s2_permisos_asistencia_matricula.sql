-- Squad 2: permisos de corrección de asistencia (RF-22/RF-66), matrícula (RF-16) y
-- publicación de la filiación verificada de la ficha (RF-15 -> RF-75).
-- Contratos: docs/core/CONTRATO_RF66_ASISTENCIA.md y docs/core/CONTRATO_FICHA_RF15_RF75.md.
-- Matriz: docs/seguridad/matriz_rbac.md.

-- 1. Catálogo -------------------------------------------------------------------------
INSERT INTO permisos_core (codigo, descripcion) VALUES
    ('attendance:correct', 'Corregir o justificar asistencia con motivo auditado'),
    ('enrollments:create', 'Matricular estudiantes en una sección'),
    ('guardian-records:publish', 'Publicar y revocar la filiación verificada de la ficha');

-- 2. Concesiones por plantel ------------------------------------------------------------
-- RF-22 (actor «Coordinación Académica / Auxiliares») -> attendance:correct.
-- RF-16 (actor «Secretaría Académica / Coordinación») -> enrollments:create.
-- RF-15 (actor «Secretaría Académica / Dirección»)    -> guardian-records:publish.
--   Sin SECRETARIA: ya tiene guardians:manage (vincular). Separación de funciones del
--   contrato RF-15 -> RF-75: quien vincula no publica la fuente que acredita el vínculo.
-- SUPERADMIN recibe todo el catálogo, igual que en 20261023190000.
CREATE FUNCTION fn_permisos_s2_por_rol(p_tenant uuid)
RETURNS TABLE (tenant_id uuid, rol_id int, permiso_codigo varchar)
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
    SELECT p_tenant, r.id, p.codigo
    FROM roles r CROSS JOIN permisos_core p
    WHERE p.codigo IN ('attendance:correct', 'enrollments:create', 'guardian-records:publish')
      AND (r.codigo::text = 'SUPERADMIN'
        OR (p.codigo = 'attendance:correct' AND r.codigo::text IN ('COORDINADOR_ACADEMICO', 'AUXILIAR'))
        OR (p.codigo = 'enrollments:create' AND r.codigo::text IN ('SECRETARIA', 'COORDINADOR_ACADEMICO'))
        OR (p.codigo = 'guardian-records:publish' AND r.codigo::text = 'DIRECTIVO'))
$$;
REVOKE ALL ON FUNCTION fn_permisos_s2_por_rol(uuid) FROM PUBLIC;

INSERT INTO rol_permisos_core (tenant_id, rol_id, permiso_codigo)
SELECT s.tenant_id, s.rol_id, s.permiso_codigo
FROM instituciones i CROSS JOIN LATERAL fn_permisos_s2_por_rol(i.id) s
ON CONFLICT DO NOTHING;

-- Planteles nuevos: trg_seed_permisos_plantel siembra la matriz Core con una lista fija
-- (salvo SUPERADMIN, que toma el catálogo completo). Este disparador agrega la parte del
-- Squad 2 sin modificar la función del Core.
CREATE FUNCTION fn_seed_permisos_s2() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    INSERT INTO rol_permisos_core (tenant_id, rol_id, permiso_codigo)
    SELECT s.tenant_id, s.rol_id, s.permiso_codigo FROM fn_permisos_s2_por_rol(NEW.id) s
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION fn_seed_permisos_s2() FROM PUBLIC;
CREATE TRIGGER trg_seed_permisos_s2 AFTER INSERT ON instituciones
    FOR EACH ROW EXECUTE FUNCTION fn_seed_permisos_s2();

-- 3. Filiación verificada (RF-15 -> RF-75) ----------------------------------------------
-- sms_app solo tiene SELECT sobre fichas_apoderados_verificados (20261103000200). La
-- publicación y la revocación pasan por estas funciones SECURITY DEFINER: el dueño no
-- está sujeto a RLS, por eso el tenant se comprueba de forma explícita. Ambas escriben
-- en la cadena de auditoría dentro de la transacción del consumidor (withTenant()).
-- El hash del documento lo calcula el backend con DOCUMENT_HMAC_KEY (documentHash());
-- ni el DNI ni el hash se copian a la auditoría (clase R).
CREATE FUNCTION fn_publicar_ficha_apoderado(
    p_fuente_ficha_id UUID,
    p_estudiante_id UUID,
    p_apoderado_documento_hash TEXT,
    p_parentesco TEXT,
    p_ip INET,
    p_request_id UUID DEFAULT NULL
) RETURNS fichas_apoderados_verificados
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_tenant UUID := app_tenant_id();
    v_actor UUID := app_user_id();
    v_fila fichas_apoderados_verificados;
BEGIN
    IF v_tenant IS NULL OR v_actor IS NULL THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_CONTEXT_REQUIRED' USING ERRCODE = '42501';
    END IF;
    IF p_ip IS NULL THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_IP_REQUIRED' USING ERRCODE = '22004';
    END IF;
    IF p_fuente_ficha_id IS NULL OR p_estudiante_id IS NULL
       OR p_apoderado_documento_hash IS NULL OR p_apoderado_documento_hash !~ '^[0-9a-f]{64}$'
       OR p_parentesco IS NULL OR p_parentesco NOT IN ('PADRE', 'MADRE', 'TUTOR_LEGAL') THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_INVALID' USING ERRCODE = '22023';
    END IF;
    PERFORM 1 FROM personas WHERE id = p_estudiante_id AND tenant_id = v_tenant;
    IF NOT FOUND THEN
        -- Un estudiante de otro tenant responde igual que uno inexistente.
        RAISE EXCEPTION 'GUARDIAN_RECORD_STUDENT_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    -- uq_ficha_apoderado_activa rechaza (23505) la misma filiación activa dos veces.
    INSERT INTO fichas_apoderados_verificados
        (tenant_id, fuente_ficha_id, estudiante_id, apoderado_documento_hash, parentesco, verificado_en)
    VALUES (v_tenant, p_fuente_ficha_id, p_estudiante_id, p_apoderado_documento_hash, p_parentesco, now())
    RETURNING * INTO v_fila;

    PERFORM fn_registrar_auditoria(
        'academics', 'GUARDIAN_RECORD_PUBLISHED', p_ip,
        'fichas_apoderados_verificados', v_fila.id::text, NULL,
        jsonb_build_object('fuenteFichaId', v_fila.fuente_ficha_id, 'estudianteId', v_fila.estudiante_id,
                           'parentesco', v_fila.parentesco, 'verificadoEn', v_fila.verificado_en),
        NULL, p_request_id);
    RETURN v_fila;
END $$;

-- Una corrección de la ficha marca revocado_en; la fila no se reutiliza para otro
-- parentesco (se publica una nueva).
CREATE FUNCTION fn_revocar_ficha_apoderado(
    p_ficha_id UUID,
    p_motivo TEXT,
    p_ip INET,
    p_request_id UUID DEFAULT NULL
) RETURNS fichas_apoderados_verificados
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_tenant UUID := app_tenant_id();
    v_actor UUID := app_user_id();
    v_motivo TEXT := btrim(p_motivo);
    v_fila fichas_apoderados_verificados;
BEGIN
    IF v_tenant IS NULL OR v_actor IS NULL THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_CONTEXT_REQUIRED' USING ERRCODE = '42501';
    END IF;
    IF p_ip IS NULL THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_IP_REQUIRED' USING ERRCODE = '22004';
    END IF;
    IF v_motivo IS NULL OR char_length(v_motivo) < 10 OR char_length(v_motivo) > 500 THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_REASON_REQUIRED' USING ERRCODE = '22023',
            HINT = 'El motivo debe tener entre 10 y 500 caracteres.';
    END IF;

    SELECT * INTO v_fila FROM fichas_apoderados_verificados
    WHERE id = p_ficha_id AND tenant_id = v_tenant
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
    IF v_fila.revocado_en IS NOT NULL THEN
        RAISE EXCEPTION 'GUARDIAN_RECORD_ALREADY_REVOKED' USING ERRCODE = '55000';
    END IF;

    UPDATE fichas_apoderados_verificados SET revocado_en = now()
    WHERE id = p_ficha_id AND tenant_id = v_tenant
    RETURNING * INTO v_fila;

    PERFORM fn_registrar_auditoria(
        'academics', 'GUARDIAN_RECORD_REVOKED', p_ip,
        'fichas_apoderados_verificados', v_fila.id::text,
        jsonb_build_object('fuenteFichaId', v_fila.fuente_ficha_id, 'estudianteId', v_fila.estudiante_id,
                           'parentesco', v_fila.parentesco, 'revocadoEn', NULL),
        jsonb_build_object('fuenteFichaId', v_fila.fuente_ficha_id, 'estudianteId', v_fila.estudiante_id,
                           'parentesco', v_fila.parentesco, 'revocadoEn', v_fila.revocado_en,
                           'motivo', v_motivo),
        NULL, p_request_id);
    RETURN v_fila;
END $$;

REVOKE ALL ON FUNCTION fn_publicar_ficha_apoderado(UUID, UUID, TEXT, TEXT, INET, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_revocar_ficha_apoderado(UUID, TEXT, INET, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_publicar_ficha_apoderado(UUID, UUID, TEXT, TEXT, INET, UUID) TO sms_app;
GRANT EXECUTE ON FUNCTION fn_revocar_ficha_apoderado(UUID, TEXT, INET, UUID) TO sms_app;
