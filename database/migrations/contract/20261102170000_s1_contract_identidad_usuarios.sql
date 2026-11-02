-- Sprint 3, fase contract. Se aplica solo con `npm run migrate:contract`
-- después de restauración, backfill y ventana de compatibilidad verificados.
-- No modificar migraciones históricas ni usar CASCADE: una dependencia nueva
-- debe bloquear la retirada y obligar a actualizar su consumidor primero.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM usuarios u
    JOIN personas p ON p.id = u.persona_id AND p.tenant_id = u.tenant_id
    WHERE u.username <> 'sistema' AND u.dni IS NOT NULL
      AND (p.tipo_documento <> 'DNI' OR p.documento_hash IS NULL
        OR p.documento_cifrado IS NULL
        OR btrim(p.documento_ultimos4) IS DISTINCT FROM right(btrim(u.dni), 4))
  ) THEN
    RAISE EXCEPTION 'IDENTITY_BACKFILL_INCOMPLETE: existen DNI legados sin identidad cifrada verificada';
  END IF;
END;
$$;

ALTER TABLE usuarios
  DROP COLUMN dni,
  DROP COLUMN nombres,
  DROP COLUMN apellidos,
  DROP COLUMN email,
  DROP COLUMN telefono,
  DROP COLUMN foto_url,
  DROP COLUMN codigo_siagie;
