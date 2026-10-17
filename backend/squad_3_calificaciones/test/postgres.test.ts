import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import type { Pool } from 'pg';
import { PostgresBookStore } from '../src/store.js';
import { applyBatch } from '../src/domain.js';
import { completeItems, fixture, teacher } from './fixtures.js';

test('PostgreSQL engine: migration, transaction rollback, history immutability, tenant RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile(new URL('../migrations/001_grades.sql', import.meta.url), 'utf8'));
    const book = fixture();
    await db.query('INSERT INTO squad3.gradebooks(id,tenant_id,state,created_by) VALUES($1,$2,$3,$4)', [book.id, book.tenantId, JSON.stringify(book), teacher.id]);
    const pool = { connect: async () => ({ query: (sql: string, params?: unknown[]) => db.query(sql, params), release() {} }) } as unknown as Pool;
    const store = new PostgresBookStore(pool);
    await store.mutate(teacher, book.id, 1, 'batch', b => applyBatch(b, teacher, completeItems()));
    assert.equal((await store.load(teacher, book.id)).revision, 2);
    await assert.rejects(store.mutate(teacher, book.id, 2, 'failure', b => { b.title = 'corrupt'; throw new Error('simulate failure'); }));
    assert.equal((await store.load(teacher, book.id)).title, book.title);
    assert.equal((await db.query<{ count: number }>('SELECT count(*)::int AS count FROM squad3.grade_audit_history')).rows[0].count, 1);
    await assert.rejects(db.exec('DELETE FROM squad3.grade_audit_history'));
    await assert.rejects(db.exec("UPDATE squad3.grade_audit_history SET action = 'tampered'"));
    await assert.rejects(db.exec('TRUNCATE squad3.grade_audit_history'));
    await assert.rejects(store.load({ ...teacher, tenantId: 'other-school' }, book.id));
    await db.exec('CREATE ROLE grades_app; GRANT USAGE ON SCHEMA squad3 TO grades_app; GRANT SELECT ON ALL TABLES IN SCHEMA squad3 TO grades_app; SET ROLE grades_app');
    await db.query("SELECT set_config('app.tenant_id',$1,false)", ['other-school']);
    assert.equal((await db.query('SELECT id FROM squad3.gradebooks')).rows.length, 0);
    await db.query("SELECT set_config('app.tenant_id',$1,false)", [teacher.tenantId]);
    assert.equal((await db.query('SELECT id FROM squad3.gradebooks')).rows.length, 1);
  } finally { await db.close(); }
});
