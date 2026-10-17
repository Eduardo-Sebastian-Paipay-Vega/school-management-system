import { randomUUID } from 'node:crypto';

export type Role = 'teacher' | 'practitioner' | 'coordinator' | 'director' | 'student';
export interface Actor { id: string; tenantId: string; role: Role; expiresAt?: number }
export interface Grade { numeric: number; literal: string; status: 'draft' | 'approved'; authorId: string; previous?: Grade }
export interface Evaluation { id: string; name: string; weight: number; competency: string; rubric: string }
export interface Student { id: string; userId: string; name: string }
export interface Scale { ad: number; a: number; b: number }
export interface Correction {
  id: string; studentId: string; evaluationId: string; input: string; reason: string; document: string;
  value: Pick<Grade, 'numeric' | 'literal'>; old: Grade; status: 'pending' | 'approved' | 'rejected';
  requesterId: string; decidedBy?: string; signature?: string; decisionReason?: string; decidedAt?: string;
  conclusion?: string;
}
export interface Book {
  id: string; tenantId: string; teacherId: string; practitionerIds: string[]; title: string;
  revision: number; closed: boolean; deadline: string; level: 'primary' | 'secondary'; scale: Scale;
  evaluations: Evaluation[]; students: Student[]; grades: Record<string, Grade>;
  conclusions: Record<string, string>; publishedGrades: Record<string, Grade>;
  publishedConclusions: Record<string, string>; requests: Correction[];
  conclusionBank: { level: string; competency: string; text: string }[];
  competencies: string[];
  draftFeedback?: string;
  courseId: string; sectionId: string; year: number; periodId: string; periodWeight: number;
  annualMode: 'weighted' | 'predominant' | 'latest';
  expectedPeriods: string[];
}
export class DomainError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function requireRule(condition: unknown, status: number, code: string, message: string): asserts condition {
  if (!condition) throw new DomainError(status, code, message);
}
export function text(value: unknown, label: string, max = 2000): string {
  requireRule(typeof value === 'string' && value.trim().length > 0 && value.length <= max, 400, 'INVALID_INPUT', `${label}: valor requerido (máximo ${max} caracteres)`);
  return value.trim();
}
export function validateScale(scale: Scale) {
  requireRule(scale && [scale.ad, scale.a, scale.b].every(Number.isFinite) && 0 < scale.b && scale.b < scale.a && scale.a < scale.ad && scale.ad <= 20, 422, 'INVALID_SCALE', 'Configuración CNEB inválida');
}
export function literal(value: number, scale: Scale) { return value >= scale.ad ? 'AD' : value >= scale.a ? 'A' : value >= scale.b ? 'B' : 'C'; }
export function parseGrade(input: unknown, scale: Scale): Pick<Grade, 'numeric' | 'literal'> {
  validateScale(scale);
  const value = text(input, 'Nota', 30).toUpperCase();
  const representatives: Record<string, number> = { AD: 19, A: 15, B: 12, C: 8 };
  if (Object.hasOwn(representatives, value)) return { numeric: representatives[value], literal: value };
  requireRule(/^\d{1,2}(?:[.,]\d{1,2})?$/.test(value), 400, 'INVALID_GRADE', 'Ingrese 0–20 o AD, A, B, C (dos decimales como máximo)');
  const numeric = Number(value.replace(',', '.'));
  requireRule(numeric >= 0 && numeric <= 20, 400, 'INVALID_GRADE', 'La nota debe estar entre 0 y 20');
  return { numeric, literal: literal(numeric, scale) };
}
export const cellKey = (studentId: string, evaluationId: string) => `${studentId}/${evaluationId}`;
export function isClosed(book: Book, now = Date.now()) { return book.closed || Date.parse(book.deadline) <= now; }
export function authorize(book: Book, actor: Actor) {
  requireRule(book.tenantId === actor.tenantId, 403, 'ACCESS_DENIED', 'Acceso denegado');
  const allowed = actor.role === 'director' || actor.role === 'coordinator' ||
    (actor.role === 'teacher' && book.teacherId === actor.id) ||
    (actor.role === 'practitioner' && book.practitionerIds.includes(actor.id)) ||
    (actor.role === 'student' && book.students.some(s => s.userId === actor.id));
  requireRule(allowed, 403, 'ACCESS_DENIED', 'No tiene asignación en esta planilla');
}
export function summary(book: Book, studentId: string, finalPeriod = false, source = book.grades) {
  if (!book.evaluations.length) return null;
  const values = book.evaluations.map(e => ({ grade: source[cellKey(studentId, e.id)], weight: e.weight }));
  if (values.some(v => !v.grade)) return null;
  if (book.level === 'primary') {
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v.grade.literal, (counts.get(v.grade.literal) ?? 0) + 1);
    const max = Math.max(...counts.values());
    const predominant = values.findLast(v => counts.get(v.grade.literal) === max)!.grade.literal;
    return { numeric: null, literal: predominant };
  }
  const raw = values.reduce((s, v) => s + v.grade.numeric * v.weight, 0) / values.reduce((s, v) => s + v.weight, 0);
  const numeric = finalPeriod ? Math.round(raw) : raw;
  return { numeric, literal: literal(numeric, book.scale) };
}
function checkCell(book: Book, student: unknown, evaluation: unknown) {
  const studentId = text(student, 'Matrícula', 100), evaluationId = text(evaluation, 'Evaluación', 100);
  requireRule(book.students.some(s => s.id === studentId) && book.evaluations.some(e => e.id === evaluationId), 422, 'INVALID_CELL', 'La matrícula o evaluación no pertenece a esta planilla');
  return cellKey(studentId, evaluationId);
}
export function applyBatch(book: Book, actor: Actor, items: unknown) {
  authorize(book, actor);
  requireRule(actor.role === 'teacher' || actor.role === 'practitioner', 403, 'ACCESS_DENIED', 'Solo el docente o practicante asignado puede registrar notas');
  requireRule(!isClosed(book), 422, 'PERIOD_CLOSED', 'El periodo está cerrado');
  requireRule(Array.isArray(items) && items.length > 0 && items.length <= 2000, 400, 'INVALID_BATCH', 'Envíe de 1 a 2000 celdas');
  const changes = new Map<string, Grade>();
  for (const item of items) {
    requireRule(item && typeof item === 'object', 400, 'INVALID_BATCH', 'Celda inválida');
    const key = checkCell(book, item.studentId, item.evaluationId);
    requireRule(!changes.has(key), 400, 'DUPLICATE_CELL', 'El lote contiene celdas duplicadas');
    const original = book.grades[key];
    changes.set(key, { ...parseGrade(item.input, book.scale), status: actor.role === 'practitioner' ? 'draft' : 'approved', authorId: actor.id,
      ...(actor.role === 'practitioner' && original ? { previous: structuredClone(original.status === 'draft' ? original.previous : original) } : {}) });
  }
  // All validations precede changes; the store additionally supplies a transaction.
  for (const [key, value] of changes) book.grades[key] = value;
}
export function applyAction(book: Book, actor: Actor, action: unknown, payload: Record<string, unknown>) {
  authorize(book, actor);
  const teacher = actor.role === 'teacher', director = actor.role === 'director';
  const allowed = (['evaluation', 'approve', 'reject', 'publish', 'conclusion', 'rectification'].includes(String(action)) && teacher) || (action === 'close' && (director || actor.role === 'coordinator')) || (action === 'decide' && director);
  requireRule(allowed, 403, 'ACCESS_DENIED', 'No tiene permiso para esta acción');
  if (action !== 'rectification' && action !== 'decide') requireRule(!isClosed(book), 422, 'PERIOD_CLOSED', 'El periodo está cerrado');
  switch (action) {
    case 'evaluation': {
      const weight = Number(payload.weight);
      requireRule(Number.isFinite(weight) && weight > 0 && weight <= 100 && book.evaluations.length < 40, 400, 'INVALID_WEIGHT', 'Peso entre 0 y 100; máximo 40 evaluaciones');
      const competency = text(payload.competency, 'Competencia', 250);
      requireRule(book.competencies.includes(competency), 422, 'INVALID_COMPETENCY', 'Seleccione una competencia oficial de la asignatura');
      book.evaluations.push({ id: randomUUID(), name: text(payload.name, 'Nombre', 100), weight, competency, rubric: text(payload.rubric, 'Rúbrica') });
      break;
    }
    case 'approve':
      for (const grade of Object.values(book.grades)) { grade.status = 'approved'; delete grade.previous; }
      delete book.draftFeedback;
      break;
    case 'reject':
      book.draftFeedback = text(payload.reason, 'Observaciones del docente', 500);
      for (const [key, grade] of Object.entries(book.grades)) if (grade.status === 'draft') {
        if (grade.previous) book.grades[key] = grade.previous;
        else delete book.grades[key];
      }
      break;
    case 'publish':
      requireRule(Object.keys(book.grades).length && Object.values(book.grades).every(g => g.status === 'approved'), 422, 'DRAFTS_PENDING', 'Apruebe los borradores antes de publicar');
      requireConclusions(book);
      book.publishedGrades = structuredClone(book.grades);
      book.publishedConclusions = structuredClone(book.conclusions);
      break;
    case 'conclusion': {
      const studentId = text(payload.studentId, 'Matrícula', 100);
      requireRule(book.students.some(s => s.id === studentId), 422, 'INVALID_STUDENT', 'Matrícula ajena a esta sección');
      book.conclusions[studentId] = text(payload.text, 'Conclusión', 500);
      break;
    }
    case 'close':
      requireRule(book.students.length && book.students.every(s => summary(book, s.id)) && Object.values(book.grades).every(g => g.status === 'approved'), 422, 'INCOMPLETE_PERIOD', 'Complete y apruebe las notas antes del cierre');
      requireConclusions(book);
      book.closed = true;
      break;
    case 'rectification': {
      requireRule(isClosed(book), 422, 'PERIOD_OPEN', 'Solo se rectifican notas cerradas');
      const key = checkCell(book, payload.studentId, payload.evaluationId);
      const old = book.grades[key];
      requireRule(old, 422, 'MISSING_GRADE', 'No existe la nota original');
      requireRule(!book.requests.some(r => cellKey(r.studentId, r.evaluationId) === key && r.status === 'pending'), 422, 'REQUEST_PENDING', 'Ya existe una solicitud pendiente para esta nota');
      const input = text(payload.input, 'Nueva nota', 30);
      const conclusion = payload.conclusion ? text(payload.conclusion, 'Conclusión posterior', 500) : undefined;
      const proposed = structuredClone(book);
      proposed.grades[key] = { ...parseGrade(input, book.scale), status: 'approved', authorId: actor.id };
      if (conclusion) proposed.conclusions[String(payload.studentId)] = conclusion;
      requireConclusions(proposed);
      book.requests.push({ id: randomUUID(), studentId: String(payload.studentId), evaluationId: String(payload.evaluationId), input, reason: text(payload.reason, 'Justificación'), document: text(payload.document, 'Documento de sustento', 500), value: parseGrade(input, book.scale), old: structuredClone(old), status: 'pending', requesterId: actor.id, ...(conclusion ? { conclusion } : {}) });
      break;
    }
    case 'decide': {
      const request = book.requests.find(r => r.id === payload.requestId);
      requireRule(request && request.status === 'pending', 422, 'REQUEST_RESOLVED', 'La solicitud no existe o ya fue resuelta');
      requireRule(typeof payload.approve === 'boolean', 400, 'INVALID_DECISION', 'Indique aprobación o rechazo');
      requireRule(request.requesterId !== actor.id, 403, 'SELF_APPROVAL', 'El solicitante no puede aprobar su propia rectificación');
      const key = cellKey(request.studentId, request.evaluationId);
      requireRule(JSON.stringify(book.grades[key]) === JSON.stringify(request.old), 409, 'STALE_GRADE', 'La nota original cambió; presente una nueva solicitud');
      if (payload.approve) {
        const signature = text(payload.signature, 'Confirmación electrónica', 200);
        book.grades[key] = { ...request.value, status: 'approved', authorId: actor.id };
        if (request.conclusion) book.conclusions[request.studentId] = request.conclusion;
        if (book.publishedGrades[key]) {
          book.publishedGrades[key] = structuredClone(book.grades[key]);
          if (request.conclusion) book.publishedConclusions[request.studentId] = request.conclusion;
        }
        requireConclusions(book);
        request.signature = signature;
      } else request.decisionReason = text(payload.reason, 'Motivo del rechazo');
      request.status = payload.approve ? 'approved' : 'rejected'; request.decidedBy = actor.id; request.decidedAt = new Date().toISOString();
      break;
    }
  }
}

function requireConclusions(book: Book) {
  for (const student of book.students) {
    const level = summary(book, student.id, true)?.literal;
    requireRule(!['B', 'C'].includes(level ?? '') || !!book.conclusions[student.id]?.trim(), 422, 'CONCLUSION_REQUIRED', `Registre la conclusión obligatoria para ${student.name} (${level})`);
  }
}

export function annualSummary(books: Book[], studentId: string, published = false) {
  const sorted = [...books].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const periods = sorted.map(book => ({ periodId: book.periodId, weight: book.periodWeight, summary: summary(book, studentId, true, published ? book.publishedGrades : book.grades), closed: isClosed(book) }));
  if (!periods.length || sorted[0].expectedPeriods.some(id => !periods.some(p => p.periodId === id)) || periods.some(p => !p.summary || !p.closed)) return { periods, annual: null };
  const policy = sorted[0];
  requireRule(sorted.every(b => b.annualMode === policy.annualMode && b.level === policy.level && b.scale.ad === policy.scale.ad && b.scale.a === policy.scale.a && b.scale.b === policy.scale.b), 422, 'INCONSISTENT_POLICY', 'Los periodos tienen políticas incompatibles; revise la configuración académica');
  if (policy.annualMode === 'latest') return { periods, annual: periods.at(-1)!.summary };
  if (policy.level === 'primary' || policy.annualMode === 'predominant') {
    const counts = new Map<string, number>();
    for (const p of periods) counts.set(p.summary!.literal, (counts.get(p.summary!.literal) ?? 0) + 1);
    const max = Math.max(...counts.values());
    return { periods, annual: { numeric: null, literal: periods.findLast(p => counts.get(p.summary!.literal) === max)!.summary!.literal } };
  }
  const numeric = Math.round(periods.reduce((total, p) => total + p.summary!.numeric! * p.weight, 0) / periods.reduce((total, p) => total + p.weight, 0));
  return { periods, annual: { numeric, literal: literal(numeric, policy.scale) } };
}

export function view(book: Book, actor: Actor): Record<string, unknown> {
  authorize(book, actor);
  const data: Record<string, unknown> = { ...structuredClone(book) };
  if (actor.role === 'student') {
    const student = book.students.find(s => s.userId === actor.id)!;
    const grades = Object.fromEntries(Object.entries(book.publishedGrades).filter(([key]) => key.startsWith(`${student.id}/`)));
    Object.assign(data, { students: [{ id: student.id, name: student.name }], grades, conclusions: { ...(book.publishedConclusions[student.id] ? { [student.id]: book.publishedConclusions[student.id] } : {}) }, requests: [], conclusionBank: [] });
    delete data.teacherId; delete data.practitionerIds;
  }
  delete data.publishedGrades; delete data.publishedConclusions;
  data.summaries = Object.fromEntries((data.students as Student[]).map(s => [s.id, { partial: summary(book, s.id, false, data.grades as Record<string, Grade>), period: summary(book, s.id, true, data.grades as Record<string, Grade>) }]));
  data.competencySummaries = Object.fromEntries((data.students as Student[]).map(s => [s.id, Object.fromEntries(book.competencies.map(competency => [competency, summary({ ...book, evaluations: book.evaluations.filter(e => e.competency === competency) }, s.id, false, data.grades as Record<string, Grade>)]))]));
  return data;
}
