const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.DB_USER = 'sms_runtime';
process.env.DB_PASSWORD = 'unit_test_runtime_password_2026';
process.env.JWT_SECRET = 'unit_test_access_secret_with_32_chars_2026';
process.env.JWT_REFRESH_SECRET = 'unit_test_refresh_secret_with_32_chars_2026';

const modulePath = require.resolve('../dist/services/auth.service');
const tenantA = '11111111-1111-4111-8111-111111111111';
const tenantB = '22222222-2222-4222-8222-222222222222';

function sign(payload) {
  return jwt.sign({ sid: '33333333-3333-4333-8333-333333333333',
    jti: '44444444-4444-4444-8444-444444444444', version: 1, ...payload },
  process.env.JWT_SECRET, { subject: '55555555-5555-4555-8555-555555555555',
    issuer: 'sms-core', audience: 'sms-web', expiresIn: '15m', algorithm: 'HS256' });
}

test('JWT canónico usa tenant_id; el claim heredado tenantId se rechaza siempre (S6-00)', () => {
  // Aunque un despliegue conserve la variable de la transición S2, ya no tiene efecto.
  process.env.JWT_LEGACY_TENANT_ACCEPT_UNTIL = new Date(Date.now() + 60 * 60_000).toISOString();
  const { AuthService } = require(modulePath);
  const canonical = AuthService.accessClaims(sign({ tenant_id: tenantA }));
  assert.equal(canonical.tenant_id, tenantA);
  assert.equal(canonical.tenantId, tenantA); // alias interno del backend, no claim

  assert.throws(() => AuthService.accessClaims(sign({ tenantId: tenantA })));
  assert.throws(() => AuthService.accessClaims(sign({ tenant_id: tenantA, tenantId: tenantA })));
  assert.throws(() => AuthService.accessClaims(sign({ tenant_id: tenantA, tenantId: tenantB })));
  assert.throws(() => AuthService.accessClaims(sign({ tenant_id: 'tenant-no-uuid' })));
  assert.throws(() => AuthService.accessClaims(sign({})));
  delete process.env.JWT_LEGACY_TENANT_ACCEPT_UNTIL;
});
