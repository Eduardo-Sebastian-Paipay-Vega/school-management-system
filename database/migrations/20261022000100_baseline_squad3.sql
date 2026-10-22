-- Apply once, with a migration owner. Run the application with a separate role.
CREATE SCHEMA IF NOT EXISTS squad3;

CREATE TABLE squad3.gradebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
    state JSONB NOT NULL CHECK (jsonb_typeof(state) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    UNIQUE (tenant_id, id),
    CHECK (state->>'id' = id::text),
    CHECK (state->>'tenantId' = tenant_id),
    CHECK ((state->>'revision')::integer = revision)
);
CREATE INDEX idx_gradebooks_tenant ON squad3.gradebooks (tenant_id);
CREATE UNIQUE INDEX uq_gradebooks_scope ON squad3.gradebooks
(tenant_id, (state->>'courseId'), (state->>'sectionId'), (state->>'year'), (state->>'periodId'));

-- The gradebook is the transactional aggregate. Its JSONB state contains the
-- evaluations, roster snapshot, dual grades, publication snapshot and requests.
-- The history stores full before/after values for immutable reconstruction.
CREATE TABLE squad3.grade_audit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    book_id UUID NOT NULL,
    action VARCHAR(40) NOT NULL,
    before_state JSONB,
    after_state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    FOREIGN KEY (tenant_id, book_id) REFERENCES squad3.gradebooks(tenant_id, id) ON DELETE RESTRICT
);
CREATE INDEX idx_grade_audit_history_tenant ON squad3.grade_audit_history (tenant_id);
CREATE INDEX idx_grade_audit_history_book ON squad3.grade_audit_history (tenant_id, book_id, created_at);

CREATE FUNCTION squad3.reject_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'El historial de calificaciones es inmutable';
END;
$$;
CREATE TRIGGER grade_history_immutable BEFORE UPDATE OR DELETE ON squad3.grade_audit_history
FOR EACH ROW EXECUTE FUNCTION squad3.reject_history_change();
CREATE TRIGGER grade_history_no_truncate BEFORE TRUNCATE ON squad3.grade_audit_history
FOR EACH STATEMENT EXECUTE FUNCTION squad3.reject_history_change();

-- Tenant filtering also occurs on every application query. RLS adds a second
-- boundary for deployments using a non-owner role (owners bypass RLS).
ALTER TABLE squad3.gradebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY gradebooks_tenant ON squad3.gradebooks
USING (tenant_id = current_setting('app.tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
ALTER TABLE squad3.grade_audit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY grade_history_tenant ON squad3.grade_audit_history
USING (tenant_id = current_setting('app.tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
