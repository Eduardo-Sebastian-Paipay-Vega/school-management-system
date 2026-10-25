const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { errorHandler, notFoundHandler, OriginDeniedError } = require('../dist/core/http/errors');

// Aplicación mínima con el mismo orden de middlewares que server.ts, sin base de datos ni Redis.
let server;
let base;
before(async () => {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.get('/cors', (_req, _res, next) => next(new OriginDeniedError()));
  app.get('/boom', () => { throw new Error('detalle interno secreto'); });
  app.post('/echo', (req, res) => res.json({ success: true, data: req.body }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

async function call(path, init) {
  const response = await fetch(`${base}${path}`, init);
  return { status: response.status, body: await response.json() };
}

test('ruta inexistente devuelve 404 NOT_FOUND con el sobre canónico', async () => {
  const { status, body } = await call('/no-existe');
  assert.equal(status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'NOT_FOUND');
  assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
});

test('JSON malformado devuelve 400 INVALID_JSON', async () => {
  const { status, body } = await call('/echo', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{"a":' });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_JSON');
});

test('cuerpo excesivo devuelve 413 BODY_TOO_LARGE', async () => {
  const { status, body } = await call('/echo', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'x'.repeat(2048) }) });
  assert.equal(status, 413);
  assert.equal(body.error.code, 'BODY_TOO_LARGE');
});

test('origen rechazado devuelve 403 ORIGIN_DENIED', async () => {
  const { status, body } = await call('/cors');
  assert.equal(status, 403);
  assert.equal(body.error.code, 'ORIGIN_DENIED');
});

test('error inesperado devuelve 500 sin exponer el detalle técnico', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const { status, body } = await call('/boom');
    assert.equal(status, 500);
    assert.equal(body.error.code, 'INTERNAL_ERROR');
    assert.ok(!JSON.stringify(body).includes('secreto'));
  } finally {
    console.error = original;
  }
});
