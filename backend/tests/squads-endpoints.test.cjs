const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_USER = 'sms_runtime';
process.env.DB_PASSWORD = 'unit_test_runtime_password_2026';
process.env.JWT_SECRET = 'unit_test_access_secret_with_32_chars_2026';
process.env.JWT_REFRESH_SECRET = 'unit_test_refresh_secret_with_32_chars_2026';
process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.DOCUMENT_HMAC_KEY = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';

const { createApp } = require('../dist/app');
const {
  vigesimalToLiteral,
  literalToRepresentativeVigesimal,
  computeTemplateHmac,
} = require('../dist/routes/grades.routes');
const {
  generateTenantBoundToken,
  extractTenantFromToken,
} = require('../dist/routes/documents.routes');

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

async function call(path, init) {
  const response = await fetch(`${base}${path}`, init);
  return { status: response.status, body: await response.json() };
}

test('Squad 3: motor CNEB convierte nota vigesimal y literal de forma determinista (RF-40, RF-46)', () => {
  assert.equal(vigesimalToLiteral(20), 'AD');
  assert.equal(vigesimalToLiteral(18), 'AD');
  assert.equal(vigesimalToLiteral(17.5), 'A');
  assert.equal(vigesimalToLiteral(14), 'A');
  assert.equal(vigesimalToLiteral(13.9), 'B');
  assert.equal(vigesimalToLiteral(11), 'B');
  assert.equal(vigesimalToLiteral(10.5), 'C');
  assert.equal(vigesimalToLiteral(0), 'C');

  assert.equal(literalToRepresentativeVigesimal('AD'), 19);
  assert.equal(literalToRepresentativeVigesimal('A'), 16);
  assert.equal(literalToRepresentativeVigesimal('B'), 12);
  assert.equal(literalToRepresentativeVigesimal('C'), 9);
});

test('Squad 3: firma HMAC de plantilla Excel es de 64 caracteres hexadecimales y sensible al contexto (RF-80)', () => {
  const tenantId = '11111111-1111-4111-8111-111111111111';
  const seccionId = '22222222-2222-4222-8222-222222222222';
  const cursoId = '33333333-3333-4333-8333-333333333333';
  const periodoId = '44444444-4444-4444-8444-444444444444';

  const sig1 = computeTemplateHmac(tenantId, seccionId, cursoId, periodoId);
  const sig2 = computeTemplateHmac(tenantId, seccionId, cursoId, periodoId);
  const sigDifferentCourse = computeTemplateHmac(
    tenantId,
    seccionId,
    '55555555-5555-4555-8555-555555555555',
    periodoId
  );

  assert.equal(sig1.length, 64);
  assert.equal(sig1, sig2);
  assert.notEqual(sig1, sigDifferentCourse);
});

test('Squad 5: tokens QR de verificación vinculan y extraen el UUID del tenant para RLS (RF-60)', () => {
  const tenantId = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const token = generateTenantBoundToken(tenantId);
  assert.equal(token.length, 64);
  assert.equal(extractTenantFromToken(token), tenantId);
  assert.equal(extractTenantFromToken('token-invalido'), null);
});

test('Squads 2, 3, 4 y 5: endpoints protegidos exigen autenticación JWT (401 UNAUTHENTICATED)', async () => {
  const protectedPaths = [
    '/api/v1/academics/sections',
    '/api/v1/academics/enrollments',
    '/api/v1/attendance/records',
    '/api/v1/attendance/internships',
    '/api/v1/curriculum/courses',
    '/api/v1/curriculum/activities',
    '/api/v1/grades/evaluations',
    '/api/v1/grades/sheet',
    '/api/v1/analytics/academic/heatmap',
    '/api/v1/analytics/attendance/risk-dropout',
    '/api/v1/analytics/ssu/impact',
    '/api/v1/documents',
    '/api/v1/portal/announcements',
    '/api/v1/portal/news',
  ];

  for (const path of protectedPaths) {
    const { status, body } = await call(path);
    assert.equal(status, 401, `Ruta ${path} debería retornar 401 sin token`);
    assert.equal(body.success, false);
  }
});

test('Squad 5: endpoints públicos de verificación QR y Mesa de Partes validan formato sin sesión (RF-60, RF-86)', async () => {
  const verifyInvalid = await call('/api/v1/public/verify/token_corto_invalido');
  assert.equal(verifyInvalid.status, 404);
  assert.equal(verifyInvalid.body.error.code, 'DOCUMENT_NOT_FOUND');

  const trackInvalid = await call('/api/v1/public/mesa-partes/track/codigo_invalido');
  assert.equal(trackInvalid.status, 404);
  assert.equal(trackInvalid.body.error.code, 'EXPEDIENTE_NOT_FOUND');

  const submitInvalid = await call('/api/v1/public/mesa-partes/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'SOLICITUD' }),
  });
  assert.equal(submitInvalid.status, 400);
  assert.equal(submitInvalid.body.error.code, 'VALIDATION_FAILED');
});
