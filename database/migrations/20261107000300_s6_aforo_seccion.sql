-- S6-06: límite de aforo por sección (RF-12; consumidor: matrícula del Squad 2, RF-16).
-- Una matrícula activa (REGULAR o EXTEMPORANEA, igual que v_avance_registro_notas) no
-- puede superar grados_secciones.aforo_maximo. El bloqueo FOR UPDATE de la fila de la
-- sección serializa las matrículas concurrentes en la misma sección: sin él, dos
-- transacciones podrían contar N-1 a la vez y dejar N+1 matrículas.
CREATE FUNCTION fn_validar_aforo_seccion() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
    v_aforo integer;
    v_ocupadas integer;
BEGIN
    IF NEW.estado NOT IN ('REGULAR', 'EXTEMPORANEA') THEN
        RETURN NEW;
    END IF;
    -- Sin cambio de sección ni reactivación, la ocupación no aumenta.
    IF TG_OP = 'UPDATE' AND NEW.seccion_id = OLD.seccion_id
       AND OLD.estado IN ('REGULAR', 'EXTEMPORANEA') THEN
        RETURN NEW;
    END IF;

    SELECT aforo_maximo INTO v_aforo FROM grados_secciones
    WHERE tenant_id = NEW.tenant_id AND id = NEW.seccion_id
    FOR UPDATE;
    IF NOT FOUND THEN
        -- La FK compuesta de matriculas informa el error de referencia.
        RETURN NEW;
    END IF;

    SELECT count(*) INTO v_ocupadas FROM matriculas
    WHERE tenant_id = NEW.tenant_id AND seccion_id = NEW.seccion_id
      AND estado IN ('REGULAR', 'EXTEMPORANEA') AND id <> NEW.id;
    IF v_ocupadas >= v_aforo THEN
        RAISE EXCEPTION 'SECTION_FULL' USING ERRCODE = '23514',
            DETAIL = format('Aforo %s alcanzado en la sección %s', v_aforo, NEW.seccion_id);
    END IF;
    RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION fn_validar_aforo_seccion() FROM PUBLIC;

CREATE TRIGGER trg_matriculas_aforo
    BEFORE INSERT OR UPDATE OF seccion_id, estado ON matriculas
    FOR EACH ROW EXECUTE FUNCTION fn_validar_aforo_seccion();
