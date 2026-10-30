const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.DB_USER = 'sms_runtime';
process.env.DB_PASSWORD = 'unit_test_runtime_password_2026';
process.env.JWT_SECRET = 'unit_test_access_secret_with_32_chars_2026';
process.env.JWT_REFRESH_SECRET = 'unit_test_refresh_secret_with_32_chars_2026';
process.env.JWT_LEGACY_TENANT_ACCEPT_UNTIL = new Date(Date.now() + 60 * 60_000).toISOString();

const modulePath = require.resolve('../dist/services/auth.service');
const tenantA = '11111111-1111-4111-8111-111111111111';
const tenantB = '22222222-2222-4222-8222-222222222222';

function sign(payload) {
  return jwt.sign({ sid: '33333333-3333-4333-8333-333333333333',
    jti: '44444444-4444-4444-8444-444444444444', version: 1, ...payload },
  process.env.JWT_SECRET, { subject: '55555555-5555-4555-8555-555555555555',
    issuer: 'sms-core', audience: 'sms-web', expiresIn: '15m', algorithm: 'HS256' });
}

test('JWT canónico usa tenant_id; legado solo durante ventana y sin claims contradictorios', () => {
  const { AuthService } = require(modulePath);
  const canonical = AuthService.accessClaims(sign({ tenant_id: tenantA }));
  assert.equal(canonical.tenant_id, tenantA);
  assert.equal(canonical.tenantId, tenantA); // alias interno durante transición

  const legacy = AuthService.accessClaims(sign({ tenantId: tenantA }));
  assert.equal(legacy.tenant_id, tenantA);

  assert.throws(() => AuthService.accessClaims(sign({ tenant_id: tenantA, tenantId: tenantB })));
  assert.throws(() => AuthService.accessClaims(sign({ tenant_id: 'tenant-no-uuid' })));

  delete process.env.JWT_LEGACY_TENANT_ACCEPT_UNTIL;
  delete require.cache[modulePath];
  const strict = require(modulePath).AuthService;
  assert.throws(() => strict.accessClaims(sign({ tenantId: tenantA })));
  assert.equal(strict.accessClaims(sign({ tenant_id: tenantA })).tenant_id, tenantA);
});
