-- RF-66: el historial M8 y la cadena Core se escriben en la misma transacción.
-- El historial M8 conserva los valores completos; Core encadena una referencia
-- y hashes de estados para evitar duplicar datos personales en la bitácora.
CREATE FUNCTION fn_auditar_historial_notas_core() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.tenant_id::uuid IS DISTINCT FROM app_tenant_id() THEN
    RAISE EXCEPTION 'Historial de notas fuera del tenant activo';
  END IF;
  IF app_user_id() IS NULL OR NEW.created_by IS DISTINCT FROM app_user_id() THEN
    RAISE EXCEPTION 'El autor del historial no coincide con el actor activo';
  END IF;
  PERFORM fn_registrar_auditoria(
    'grades','GRADE_HISTORY','127.0.0.1'::inet,
    'squad3.grade_audit_history',NEW.id::text,
    CASE WHEN NEW.before_state IS NULL THEN NULL ELSE jsonb_build_object(
      'bookId',NEW.book_id,'revision',NEW.before_state->>'revision',
      'stateSha256',encode(digest(NEW.before_state::text,'sha256'),'hex')) END,
    jsonb_build_object('bookId',NEW.book_id,'action',NEW.action,
      'revision',NEW.after_state->>'revision',
      'stateSha256',encode(digest(NEW.after_state::text,'sha256'),'hex')),
    NULL
  );
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION fn_auditar_historial_notas_core() FROM PUBLIC;
CREATE TRIGGER trg_grade_history_core_audit
  AFTER INSERT ON squad3.grade_audit_history
  FOR EACH ROW EXECUTE FUNCTION fn_auditar_historial_notas_core();
