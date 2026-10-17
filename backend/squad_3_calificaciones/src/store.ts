import type { Pool, PoolClient } from 'pg';
import { authorize, requireRule, type Actor, type Book } from './domain.js';

export interface BookStore {
  load(actor: Actor, bookId: string): Promise<Book>;
  periods(actor: Actor, book: Book): Promise<Book[]>;
  mutate(actor: Actor, bookId: string, revision: number, action: string, update: (book: Book) => void): Promise<Book>;
}

export class PostgresBookStore implements BookStore {
  constructor(private pool: Pool) {}
  private async transaction<T>(actor: Actor, task: (db: PoolClient) => Promise<T>) {
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      await db.query("SELECT set_config('app.tenant_id', $1, true)", [actor.tenantId]);
      const result = await task(db);
      await db.query('COMMIT');
      return result;
    } catch (error) { await db.query('ROLLBACK'); throw error; }
    finally { db.release(); }
  }
  private async read(db: PoolClient, actor: Actor, id: string, lock: boolean): Promise<Book> {
    const result = await db.query(`SELECT state FROM squad3.gradebooks WHERE tenant_id = $1 AND id = $2${lock ? ' FOR UPDATE' : ''}`, [actor.tenantId, id]);
    requireRule(result.rows.length, 404, 'NOT_FOUND', 'Planilla no encontrada');
    const book = result.rows[0].state as Book;
    authorize(book, actor);
    return book;
  }
  load(actor: Actor, bookId: string) { return this.transaction(actor, db => this.read(db, actor, bookId, false)); }
  periods(actor: Actor, book: Book) {
    return this.transaction(actor, async db => {
      const result = await db.query("SELECT state FROM squad3.gradebooks WHERE tenant_id = $1 AND state->>'courseId' = $2 AND state->>'sectionId' = $3 AND state->>'year' = $4", [actor.tenantId, book.courseId, book.sectionId, String(book.year)]);
      return result.rows.map(r => r.state as Book).filter(b => { try { authorize(b, actor); return true; } catch { return false; } });
    });
  }
  mutate(actor: Actor, bookId: string, revision: number, action: string, update: (book: Book) => void) {
    return this.transaction(actor, async db => {
      const book = await this.read(db, actor, bookId, true);
      requireRule(revision === book.revision, 409, 'VERSION_CONFLICT', 'La planilla cambió; recargue antes de continuar');
      const before = structuredClone(book);
      update(book);
      book.revision++;
      await db.query('UPDATE squad3.gradebooks SET state = $1, revision = $2, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $3 AND id = $4', [JSON.stringify(book), book.revision, actor.tenantId, book.id]);
      await db.query('INSERT INTO squad3.grade_audit_history (tenant_id, book_id, action, before_state, after_state, created_by) VALUES ($1,$2,$3,$4,$5,$6)', [actor.tenantId, book.id, action, JSON.stringify(before), JSON.stringify(book), actor.id]);
      return book;
    });
  }
}

/** Only a test adapter. The production server always uses PostgreSQL. */
export class MemoryBookStore implements BookStore {
  private books = new Map<string, Book>();
  history: { actor: Actor; action: string; before: Book; after: Book }[] = [];
  constructor(books: Book[]) { for (const book of books) this.books.set(`${book.tenantId}/${book.id}`, structuredClone(book)); }
  async load(actor: Actor, bookId: string) {
    const book = this.books.get(`${actor.tenantId}/${bookId}`);
    requireRule(book, 404, 'NOT_FOUND', 'Planilla no encontrada');
    authorize(book, actor);
    return structuredClone(book);
  }
  async periods(actor: Actor, book: Book) {
    return [...this.books.values()].filter(b => b.tenantId === actor.tenantId && b.courseId === book.courseId && b.sectionId === book.sectionId && b.year === book.year).filter(b => { try { authorize(b, actor); return true; } catch { return false; } }).map(b => structuredClone(b));
  }
  async mutate(actor: Actor, bookId: string, revision: number, action: string, update: (book: Book) => void) {
    const original = this.books.get(`${actor.tenantId}/${bookId}`);
    requireRule(original, 404, 'NOT_FOUND', 'Planilla no encontrada'); authorize(original, actor);
    requireRule(original.revision === revision, 409, 'VERSION_CONFLICT', 'Conflicto de versión');
    const book = structuredClone(original); update(book); book.revision++;
    this.books.set(`${actor.tenantId}/${bookId}`, book);
    this.history.push({ actor, action, before: structuredClone(original), after: structuredClone(book) });
    return structuredClone(book);
  }
}
