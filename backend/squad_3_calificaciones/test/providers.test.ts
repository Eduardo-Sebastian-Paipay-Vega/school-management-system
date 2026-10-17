import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBook, fetchProvider } from '../src/provision.js';
import { fixture } from './fixtures.js';

test('provider boundary validates UUID roster, duplicated users and academic configuration', () => {
  const book = fixture();
  book.students = [{ id: '00000000-0000-4000-8000-000000000020', userId: '00000000-0000-4000-8000-000000000021', name: 'Alumno' }];
  validateBook(book);
  book.students.push(structuredClone(book.students[0])); assert.throws(() => validateBook(book));
  book.students.pop(); book.expectedPeriods = []; assert.throws(() => validateBook(book));
});
test('provider boundary rejects an unsuccessful response', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_input, options) => {
    assert.equal((options?.headers as { Authorization: string }).Authorization, 'Bearer service-token');
    return new Response(JSON.stringify({ success: false }), { status: 200 });
  };
  try { await assert.rejects(fetchProvider('https://provider.example', 'service-token')); }
  finally { globalThis.fetch = original; }
});
