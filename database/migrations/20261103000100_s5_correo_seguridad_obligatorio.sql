-- RF-76: las notificaciones de seguridad no admiten desactivar el canal de correo.
-- Corrige preferencias anteriores antes de imponer la regla para futuros cambios.
UPDATE preferencias_notificacion SET por_correo=true
WHERE categoria='SEGURIDAD' AND por_correo IS DISTINCT FROM true;

ALTER TABLE preferencias_notificacion
  ADD CONSTRAINT ck_preferencia_seguridad_correo
  CHECK (categoria<>'SEGURIDAD' OR por_correo IS TRUE);
