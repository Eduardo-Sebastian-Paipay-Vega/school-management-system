-- S6-04: aislamiento de asistencia y corrección auditada (RF-66, contrato con Squad 2).
-- Contrato: docs/core/CONTRATO_RF66_ASISTENCIA.md.
--   1. asistencias_alumnos y avisos_inasistencia reciben tenant_id, FK compuesta y RLS.
--   2. sms_app registra asistencia (INSERT) pero no la modifica directamente: toda
--      corrección pasa por fn_corregir_asistencia(), que exige motivo y escribe en la
--      cadena de auditoría Core dentro de la misma transacción.

-- 1. asistencias_alumnos ----------------------------------------------------------------
ALTER TABLE asistencias_alumnos ADD COLUMN tenant_id UUID;

UPDATE asistencias_alumnos a SET tenant_id = m.tenant_id
FROM matriculas m WHERE m.id = a.matricula_id;

DO $$
DECLARE huerfanas integer;
BEGIN
    SELECT count(*) INTO huerfanas FROM asistencias_alumnos WHERE tenant_id IS NULL;
    IF huerfanas > 0 THEN
        RAISE EXCEPTION 'S6-04: % asistencias sin matrícula resoluble; corregir antes de migrar', huerfanas;
    END IF;
END $$;

ALTER TABLE asistencias_alumnos
    ALTER COLUMN tenant_id SET DEFAULT app_tenant_id(),
    ALTER COLUMN tenant_id SET NOT NULL,
    ADD CONSTRAINT fk_asistencias_tenant FOREIGN KEY (tenant_id) REFERENCES instituciones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_asistencias_matricula_tenant FOREIGN KEY (tenant_id, matricula_id)
        REFERENCES matriculas (tenant_id, id),
    ADD CONSTRAINT uq_asistencias_tenant_id UNIQUE (tenant_id, id);
CREATE INDEX idx_asistencias_tenant_fecha ON asistencias_alumnos (tenant_id, fecha);

ALTER TABLE asistencias_alumnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_asistencias_alumnos_tenant ON asistencias_alumnos
    USING (tenant_id = app_tenant_id()) WITH CHECK (tenant_id = app_tenant_id());

-- 2. avisos_inasistencia ----------------------------------------------------------------
ALTER TABLE avisos_inasistencia ADD COLUMN tenant_id UUID;

UPDATE avisos_inasistencia v SET tenant_id = a.tenant_id
FROM asistencias_alumnos a WHERE a.id = v.asistencia_id;

ALTER TABLE avisos_inasistencia
    ALTER COLUMN tenant_id SET DEFAULT app_tenant_id(),
    ALTER COLUMN tenant_id SET NOT NULL,
    ADD CONSTRAINT fk_avisos_inasistencia_asistencia_tenant FOREIGN KEY (tenant_id, asistencia_id)
        REFERENCES asistencias_alumnos (tenant_id, id);
CREATE INDEX idx_avisos_inasistencia_tenant ON avisos_inasistencia (tenant_id);

ALTER TABLE avisos_inasistencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_avisos_inasistencia_tenant ON avisos_inasistencia
    USING (tenant_id = app_tenant_id()) WITH CHECK (tenant_id = app_tenant_id());

-- 3. Privilegios ------------------------------------------------------------------------
REVOKE ALL ON asistencias_alumnos FROM sms_app;
GRANT SELECT, INSERT ON asistencias_alumnos TO sms_app;
REVOKE ALL ON avisos_inasistencia FROM sms_app;
GRANT SELECT, INSERT, UPDATE ON avisos_inasistencia TO sms_app;

-- 4. Corrección auditada ----------------------------------------------------------------
-- SECURITY DEFINER: el dueño no está sujeto a RLS, por eso el tenant se comprueba de
-- forma explícita, igual que fn_auditar_historial_notas_core() (20261103000300).
CREATE FUNCTION fn_corregir_asistencia(
    p_asistencia_id UUID,
    p_estado estado_asistencia_enum,
    p_justificada BOOLEAN,
    p_motivo TEXT,
    p_ip INET,
    p_request_id UUID DEFAULT NULL
) RETURNS asistencias_alumnos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_tenant UUID := app_tenant_id();
    v_actor UUID := app_user_id();
    v_motivo TEXT := btrim(p_motivo);
    v_antes asistencias_alumnos;
    v_despues asistencias_alumnos;
BEGIN
    IF v_tenant IS NULL OR v_actor IS NULL THEN
        RAISE EXCEPTION 'ATTENDANCE_CONTEXT_REQUIRED' USING ERRCODE = '42501';
    END IF;
    IF p_ip IS NULL THEN
        RAISE EXCEPTION 'ATTENDANCE_IP_REQUIRED' USING ERRCODE = '22004';
    END IF;
    IF p_estado IS NULL OR p_justificada IS NULL THEN
        RAISE EXCEPTION 'ATTENDANCE_VALUE_REQUIRED' USING ERRCODE = '22004';
    END IF;
    IF v_motivo IS NULL OR char_length(v_motivo) < 10 OR char_length(v_motivo) > 500 THEN
        RAISE EXCEPTION 'ATTENDANCE_REASON_REQUIRED' USING ERRCODE = '22023',
            HINT = 'El motivo debe tener entre 10 y 500 caracteres.';
    END IF;

    SELECT * INTO v_antes FROM asistencias_alumnos
    WHERE id = p_asistencia_id AND tenant_id = v_tenant
    FOR UPDATE;
    IF NOT FOUND THEN
        -- La asistencia de otro tenant responde igual que una inexistente.
        RAISE EXCEPTION 'ATTENDANCE_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
    IF v_antes.estado = p_estado AND v_antes.justificada IS NOT DISTINCT FROM p_justificada THEN
        RAISE EXCEPTION 'ATTENDANCE_NO_CHANGE' USING ERRCODE = '22023';
    END IF;

    UPDATE asistencias_alumnos SET estado = p_estado, justificada = p_justificada
    WHERE id = p_asistencia_id AND tenant_id = v_tenant
    RETURNING * INTO v_despues;

    PERFORM fn_registrar_auditoria(
        'attendance', 'ATTENDANCE_CORRECTED', p_ip,
        'asistencias_alumnos', p_asistencia_id::text,
        jsonb_build_object('matriculaId', v_antes.matricula_id, 'fecha', v_antes.fecha,
                           'estado', v_antes.estado, 'justificada', v_antes.justificada),
        jsonb_build_object('matriculaId', v_despues.matricula_id, 'fecha', v_despues.fecha,
                           'estado', v_despues.estado, 'justificada', v_despues.justificada,
                           'motivo', v_motivo),
        NULL, p_request_id);
    RETURN v_despues;
END $$;

REVOKE ALL ON FUNCTION fn_corregir_asistencia(UUID, estado_asistencia_enum, BOOLEAN, TEXT, INET, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_corregir_asistencia(UUID, estado_asistencia_enum, BOOLEAN, TEXT, INET, UUID) TO sms_app;
