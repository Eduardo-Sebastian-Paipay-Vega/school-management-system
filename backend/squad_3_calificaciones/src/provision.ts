import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { validateScale, text, requireRule, type Book } from './domain.js';

/** Squad 1/2 boundary: URLs are configured, never guessed or hardcoded. */
export async function fetchProvider(url: string, token: string) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) });
  requireRule(response.ok, 502, 'PROVIDER_ERROR', 'No se pudo obtener configuración de otro squad');
  const payload = await response.json() as { success: boolean; data: Record<string, unknown> };
  requireRule(payload.success && payload.data, 502, 'PROVIDER_ERROR', 'Respuesta de proveedor inválida');
  return payload.data;
}
export function validateBook(book: Book) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  requireRule(uuid.test(book.id) && uuid.test(book.teacherId) && typeof book.tenantId === 'string' && book.tenantId.length <= 50 && book.tenantId.length > 0, 400, 'INVALID_BOOK', 'Identidad de planilla inválida');
  text(book.title, 'Título', 200); validateScale(book.scale);
  requireRule(['primary', 'secondary'].includes(book.level) && Number.isFinite(Date.parse(book.deadline)) && ['weighted', 'predominant', 'latest'].includes(book.annualMode), 400, 'INVALID_POLICY', 'Configure nivel, fecha de cierre y política anual');
  requireRule(uuid.test(book.courseId) && uuid.test(book.sectionId) && uuid.test(book.periodId) && Number.isInteger(book.year) && Number.isFinite(book.periodWeight) && book.periodWeight > 0, 400, 'INVALID_SCOPE', 'Configure curso, sección, año, periodo y peso');
  requireRule(Array.isArray(book.expectedPeriods) && book.expectedPeriods.length > 0 && book.expectedPeriods.includes(book.periodId) && book.expectedPeriods.every(id => uuid.test(id)) && new Set(book.expectedPeriods).size === book.expectedPeriods.length, 400, 'INVALID_SCOPE', 'Configure todos los periodos esperados del año');
  requireRule(Array.isArray(book.students) && book.students.length <= 5000 && book.students.every(s => uuid.test(s.id) && uuid.test(s.userId) && typeof s.name === 'string' && s.name.length > 0), 400, 'INVALID_ROSTER', 'Matrículas inválidas');
  requireRule(new Set(book.students.map(s => s.id)).size === book.students.length && new Set(book.students.map(s => s.userId)).size === book.students.length, 400, 'INVALID_ROSTER', 'Matrículas duplicadas');
  requireRule(Array.isArray(book.practitionerIds) && book.practitionerIds.every(id => uuid.test(id)), 400, 'INVALID_ASSIGNMENT', 'Asignaciones inválidas');
  requireRule(Array.isArray(book.competencies) && book.competencies.length > 0 && book.competencies.every(c => typeof c === 'string' && c.trim().length > 0), 400, 'INVALID_CURRICULUM', 'Faltan competencias oficiales');
  requireRule(Array.isArray(book.conclusionBank) && book.conclusionBank.every(c => ['AD', 'A', 'B', 'C'].includes(c.level) && book.competencies.includes(c.competency) && typeof c.text === 'string' && c.text.length <= 500), 400, 'INVALID_BANK', 'Banco pedagógico inválido');
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    requireRule(process.env.DATABASE_URL, 400, 'CONFIG', 'Configure DATABASE_URL');
    if (process.argv[2] === 'migrate') {
      const migration = await readFile(new URL('../migrations/001_grades.sql', import.meta.url), 'utf8');
      const db = await pool.connect();
      try { await db.query('BEGIN'); await db.query(migration); await db.query('COMMIT'); }
      catch (e) { await db.query('ROLLBACK'); throw e; } finally { db.release(); }
    } else {
      requireRule(process.argv[2] === 'provision' && process.argv[3], 400, 'CONFIG', 'Uso: npm run provision -- config.json');
      const metadata = JSON.parse(await readFile(process.argv[3], 'utf8'));
      const token = text(process.env.PROVIDER_TOKEN, 'Token de integración');
      const [curriculum, roster] = await Promise.all([
        fetchProvider(text(process.env.SQUAD1_SCALE_URL, 'URL del proveedor curricular'), token),
        fetchProvider(text(process.env.SQUAD2_ROSTER_URL, 'URL del proveedor de matrículas'), token),
      ]);
      requireRule(curriculum.tenantId === metadata.tenantId && roster.tenantId === metadata.tenantId && roster.courseId === metadata.courseId && roster.sectionId === metadata.sectionId && roster.periodId === metadata.periodId, 403, 'PROVIDER_SCOPE', 'Los proveedores devolvieron un contexto diferente');
      const book: Book = { ...metadata, scale: curriculum.scale, competencies: curriculum.competencies, conclusionBank: curriculum.conclusionBank, teacherId: roster.teacherId, practitionerIds: roster.practitionerIds, students: roster.students, revision: 1, evaluations: [], grades: {}, conclusions: {}, publishedGrades: {}, publishedConclusions: {}, requests: [], closed: false };
      validateBook(book);
      const db = await pool.connect();
      try {
        await db.query('BEGIN'); await db.query("SELECT set_config('app.tenant_id',$1,true)", [book.tenantId]);
        await db.query('INSERT INTO squad3.gradebooks(id, tenant_id, revision, state, created_by) VALUES ($1,$2,1,$3,$4)', [book.id, book.tenantId, JSON.stringify(book), book.teacherId]);
        await db.query('INSERT INTO squad3.grade_audit_history(tenant_id,book_id,action,after_state,created_by) VALUES($1,$2,$3,$4,$5)', [book.tenantId, book.id, 'provision', JSON.stringify(book), book.teacherId]);
        await db.query('COMMIT');
      } catch (e) { await db.query('ROLLBACK'); throw e; } finally { db.release(); }
    }
    console.log('Operación completada');
  } finally { await pool.end(); }
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/provision.ts')) main().catch(error => { console.error(error instanceof Error ? error.message : 'Error'); process.exitCode = 1; });
