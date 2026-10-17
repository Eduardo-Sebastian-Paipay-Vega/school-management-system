import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annualSummary, applyAction, applyBatch, authorize, parseGrade, summary, view } from '../src/domain.js';
import { MemoryBookStore } from '../src/store.js';
import { completeItems, director, fixture, practitioner, student, teacher } from './fixtures.js';

test('CNEB boundaries, literal inputs, invalid and non-finite values', () => {
  const scale = fixture().scale;
  for (const [input, level] of [['0', 'C'], ['10.49', 'C'], ['10,50', 'B'], ['13.49', 'B'], ['13.50', 'A'], ['17.49', 'A'], ['17.50', 'AD'], ['20', 'AD']]) assert.equal(parseGrade(input, scale).literal, level);
  assert.deepEqual(parseGrade('AD', scale), { numeric: 19, literal: 'AD' });
  for (const input of ['', 'NaN', 'Infinity', '-1', '21', '1e1', '13.555']) assert.throws(() => parseGrade(input, scale));
});
test('weighted partial, final-only rounding, incomplete is not zero', () => {
  const book = fixture(); assert.equal(summary(book, 'mat1'), null);
  applyBatch(book, teacher, [{ studentId: 'mat1', evaluationId: 'ev1', input: '10' }, { studentId: 'mat1', evaluationId: 'ev2', input: '12' }]);
  assert.equal(summary(book, 'mat1')!.numeric, 11.5);
  assert.equal(summary(book, 'mat1', true)!.numeric, 12);
  book.level = 'primary'; assert.equal(summary(book, 'mat1')!.numeric, null); assert.equal(summary(book, 'mat1')!.literal, 'B');
});
test('invalid batch and duplicate cells are atomic', () => {
  const book = fixture();
  assert.throws(() => applyBatch(book, teacher, [{ studentId: 'mat1', evaluationId: 'ev1', input: '18' }, { studentId: 'mat2', evaluationId: 'ev2', input: '99' }]));
  assert.deepEqual(book.grades, {});
  assert.throws(() => applyBatch(book, teacher, [...completeItems(), completeItems()[0]]));
  assert.deepEqual(book.grades, {});
});
test('reject practitioner changes restores teacher value; approval preserves authorship', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems());
  applyBatch(book, practitioner, [{ studentId: 'mat1', evaluationId: 'ev1', input: '19' }]);
  assert.throws(() => applyAction(book, practitioner, 'publish', {}));
  assert.throws(() => applyAction(book, teacher, 'publish', {}));
  applyAction(book, teacher, 'reject', { reason: 'Verifique la evidencia' });
  assert.equal(book.grades['mat1/ev1'].numeric, 18);
  applyBatch(book, practitioner, [{ studentId: 'mat1', evaluationId: 'ev1', input: '19' }]);
  applyAction(book, teacher, 'approve', {}); applyAction(book, teacher, 'publish', {});
  assert.equal(book.publishedGrades['mat1/ev1'].authorId, practitioner.id);
});
test('published snapshot and student isolation', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems());
  assert.deepEqual(view(book, student).grades, {});
  applyAction(book, teacher, 'publish', {});
  applyBatch(book, practitioner, [{ studentId: 'mat1', evaluationId: 'ev1', input: '7' }]);
  const data = view(book, student);
  assert.equal((data.grades as Record<string, { numeric: number }>)['mat1/ev1'].numeric, 18);
  assert.equal(Object.keys(data.grades as object).length, 2);
  assert.equal((data.students as unknown[]).length, 1);
  assert.equal(data.publishedGrades, undefined); assert.equal(data.teacherId, undefined);
});
test('ownership and tenant boundaries cannot be supplied in request body', () => {
  const book = fixture();
  assert.throws(() => authorize(book, { ...teacher, tenantId: 'other' }));
  assert.throws(() => authorize(book, { ...teacher, id: director.id }));
  assert.throws(() => applyBatch(book, student, completeItems()));
  assert.throws(() => applyAction(book, teacher, 'close', {}));
});
test('B/C conclusions are mandatory, length limited, competency is official', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems().map(i => ({ ...i, input: '9' })));
  assert.throws(() => applyAction(book, teacher, 'publish', {}));
  assert.throws(() => applyAction(book, teacher, 'conclusion', { studentId: 'mat1', text: 'a'.repeat(501) }));
  for (const student of book.students) applyAction(book, teacher, 'conclusion', { studentId: student.id, text: 'Requiere acompañamiento en la competencia evaluada.' });
  applyAction(book, teacher, 'publish', {}); applyAction(book, director, 'close', {});
  assert.throws(() => applyBatch(book, teacher, completeItems()));
  const open = fixture(); assert.throws(() => applyAction(open, teacher, 'evaluation', { name: 'Examen', weight: 1, competency: 'Inventada', rubric: 'Detalle' }));
});
test('expired periods reject edits even without a scheduled close job', () => {
  const book = fixture(); book.deadline = '2000-01-01T00:00:00Z';
  assert.throws(() => applyBatch(book, teacher, completeItems()));
});
test('rectification requires evidence, director signature and single decision', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems()); applyAction(book, teacher, 'publish', {}); applyAction(book, director, 'close', {});
  const payload = { studentId: 'mat1', evaluationId: 'ev1', input: '19', reason: 'Error material', document: 'EXP-2026-001' };
  assert.throws(() => applyAction(book, teacher, 'rectification', { ...payload, document: '' }));
  applyAction(book, teacher, 'rectification', payload);
  const requestId = book.requests[0].id;
  assert.throws(() => applyAction(book, teacher, 'decide', { requestId, approve: true, signature: 'Docente' }));
  assert.throws(() => applyAction(book, director, 'decide', { requestId, approve: true }));
  applyAction(book, director, 'decide', { requestId, approve: true, signature: 'Director identificado' });
  assert.equal(book.closed, true); assert.equal(book.grades['mat1/ev1'].numeric, 19); assert.equal(book.publishedGrades['mat1/ev1'].numeric, 19);
  assert.throws(() => applyAction(book, director, 'decide', { requestId, approve: true, signature: 'Director' }));
});
test('store rejects stale revisions, leaves state and history unchanged on failure', async () => {
  const book = fixture(), store = new MemoryBookStore([book]);
  await store.mutate(teacher, book.id, 1, 'batch', b => applyBatch(b, teacher, completeItems()));
  await assert.rejects(store.mutate(teacher, book.id, 1, 'batch', b => applyBatch(b, teacher, completeItems())));
  await assert.rejects(store.mutate(teacher, book.id, 2, 'batch', b => { b.title = 'bad'; throw new Error('rollback'); }));
  assert.equal((await store.load(teacher, book.id)).title, book.title); assert.equal(store.history.length, 1);
});
test('annual remains incomplete until all configured periods close', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems());
  assert.equal(annualSummary([book], 'mat1').annual, null);
  book.closed = true;
  assert.equal(annualSummary([book], 'mat1').annual!.numeric, 18);
  book.expectedPeriods.push('missing-period'); assert.equal(annualSummary([book], 'mat1').annual, null);
});
test('rectification to B/C requires an accompanying conclusion', () => {
  const book = fixture(); applyBatch(book, teacher, completeItems()); applyAction(book, director, 'close', {});
  const payload = { studentId: 'mat1', evaluationId: 'ev2', input: '0', reason: 'Corrección sustentada', document: 'EXP-02' };
  assert.throws(() => applyAction(book, teacher, 'rectification', payload));
  applyAction(book, teacher, 'rectification', { ...payload, conclusion: 'Requiere acompañamiento para resolver problemas.' });
  applyAction(book, director, 'decide', { requestId: book.requests[0].id, approve: true, signature: 'Director' });
  assert.match(book.conclusions.mat1, /acompañamiento/);
});
