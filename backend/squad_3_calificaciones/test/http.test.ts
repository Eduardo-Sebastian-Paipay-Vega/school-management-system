import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { WebSocket } from 'ws';
import { once } from 'node:events';
import { createGradesApp } from '../src/app.js';
import { MemoryBookStore } from '../src/store.js';
import { completeItems, fixture, student, teacher } from './fixtures.js';

test('authenticated REST + WebSocket, validation, publication and privacy', async () => {
  const auth = { secret: new TextEncoder().encode('test-only-secret-32-bytes-long-value'), issuer: 'squad1', audience: 'school' };
  const book = fixture(), store = new MemoryBookStore([book]), app = createGradesApp(store, auth, 'http://school.test');
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  const port = (app.server.address() as { port: number }).port, base = `http://127.0.0.1:${port}`;
  const sign = (actor: typeof teacher, expires = '15m') => new SignJWT({ role: actor.role, tenant_id: actor.tenantId }).setProtectedHeader({ alg: 'HS256' }).setSubject(actor.id).setIssuer(auth.issuer).setAudience(auth.audience).setIssuedAt().setExpirationTime(expires).sign(auth.secret);
  const token = await sign(teacher), studentToken = await sign(student);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    assert.equal((await fetch(`${base}/api/v1/grades/matrix?bookId=${book.id}`)).status, 401);
    assert.equal((await fetch(`${base}/api/v1/grades/matrix?bookId=${book.id}`, { headers: { Authorization: `Bearer ${await sign(teacher, '-1s')}` } })).status, 401);
    assert.equal((await fetch(`${base}/api/v1/grades/matrix?bookId=${book.id}`, { headers: { ...headers, Origin: 'http://evil.test' } })).status, 403);
    const socket = new WebSocket(`ws://127.0.0.1:${port}/api/v1/grades/live`); await once(socket, 'open');
    const ready = once(socket, 'message'); socket.send(JSON.stringify({ token: studentToken, bookId: book.id })); await ready;
    const update = once(socket, 'message');
    const saved = await fetch(`${base}/api/v1/grades/batch`, { method: 'PATCH', headers, body: JSON.stringify({ bookId: book.id, revision: 1, items: completeItems() }) });
    assert.equal(saved.status, 200); assert.equal(JSON.parse(String((await update)[0])).event, 'GRADE_UPDATED');
    const hidden = await (await fetch(`${base}/api/v1/grades/matrix?bookId=${book.id}`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    assert.deepEqual(hidden.data.grades, {});
    assert.equal((await fetch(`${base}/api/v1/grades/actions`, { method: 'POST', headers, body: JSON.stringify({ bookId: book.id, revision: 2, action: 'publish' }) })).status, 200);
    const visible = await (await fetch(`${base}/api/v1/grades/matrix?bookId=${book.id}`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    assert.equal(Object.keys(visible.data.grades).length, 2); assert.equal(visible.data.students.length, 1);
    assert.equal((await fetch(`${base}/api/v1/grades/batch`, { method: 'PATCH', headers, body: JSON.stringify({ bookId: book.id, revision: 1, items: completeItems() }) })).status, 409);
    assert.equal((await fetch(`${base}/api/v1/grades/batch`, { method: 'PATCH', headers, body: '{broken' })).status, 400);
    socket.close();
  } finally { await app.close(); }
});
