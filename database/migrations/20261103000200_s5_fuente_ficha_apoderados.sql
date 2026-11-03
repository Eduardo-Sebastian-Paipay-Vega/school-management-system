-- Contrato RF-15 -> RF-75. Squad 2 carga la filiación verificada de la ficha;
-- Core solo consulta. Ningún texto libre de Secretaría acredita parentesco.
CREATE TABLE fichas_apoderados_verificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES instituciones(id),
  fuente_ficha_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  apoderado_documento_hash char(64) NOT NULL,
  parentesco varchar(20) NOT NULL CHECK (parentesco IN ('PADRE','MADRE','TUTOR_LEGAL')),
  verificado_en timestamptz NOT NULL,
  revocado_en timestamptz,
  registrado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_ficha_apoderado_estudiante FOREIGN KEY (tenant_id,estudiante_id)
    REFERENCES personas(tenant_id,id)
);
CREATE UNIQUE INDEX uq_ficha_apoderado_activa ON fichas_apoderados_verificados
  (tenant_id,estudiante_id,apoderado_documento_hash,parentesco)
  WHERE revocado_en IS NULL;
CREATE INDEX idx_ficha_apoderado_fuente ON fichas_apoderados_verificados
  (tenant_id,fuente_ficha_id);
ALTER TABLE fichas_apoderados_verificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_fichas_apoderados_verificados_tenant ON fichas_apoderados_verificados
  USING (tenant_id=app_tenant_id()) WITH CHECK (tenant_id=app_tenant_id());
GRANT SELECT ON fichas_apoderados_verificados TO sms_app;
REVOKE INSERT,UPDATE,DELETE ON fichas_apoderados_verificados FROM sms_app;
