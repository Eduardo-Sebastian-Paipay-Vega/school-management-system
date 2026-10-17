import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { jwtVerify } from 'jose';
import { WebSocketServer, WebSocket } from 'ws';
import { annualSummary, applyAction, applyBatch, DomainError, requireRule, text, view, type Actor, type Role } from './domain.js';
import type { BookStore } from './store.js';

export interface AuthConfig { secret: Uint8Array; issuer: string; audience: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function authenticate(token: string, config: AuthConfig): Promise<Actor> {
  try {
    const { payload } = await jwtVerify(token, config.secret, { algorithms: ['HS256'], issuer: config.issuer, audience: config.audience, requiredClaims: ['sub', 'exp', 'iat', 'tenant_id', 'role'], maxTokenAge: '30m' });
    const roles: Role[] = ['teacher', 'practitioner', 'coordinator', 'director', 'student'];
    const aliases: Record<string, Role> = { ROLE_TEACHER: 'teacher', ROLE_PRACTITIONER: 'practitioner', ROLE_COORDINATOR: 'coordinator', ROLE_DIRECTOR: 'director', ROLE_STUDENT: 'student' };
    const role = aliases[String(payload.role)] ?? payload.role as Role;
    requireRule(roles.includes(role) && typeof payload.sub === 'string' && uuid.test(payload.sub) && typeof payload.tenant_id === 'string' && payload.tenant_id.length > 0 && payload.tenant_id.length <= 50, 401, 'UNAUTHENTICATED', 'Sesión inválida');
    return { id: payload.sub, tenantId: payload.tenant_id, role, expiresAt: payload.exp! * 1000 };
  } catch { throw new DomainError(401, 'UNAUTHENTICATED', 'La sesión expiró o no es válida'); }
}
function send(res: ServerResponse, status: number, data: unknown, success = true) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify({ success, ...(success ? { data } : { error: data }), timestamp: new Date().toISOString() }));
}
async function readBody(req: IncomingMessage) {
  let size = 0; const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length; requireRule(size <= 512_000, 413, 'BODY_TOO_LARGE', 'Solicitud demasiado grande'); chunks.push(chunk);
  }
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); requireRule(value && typeof value === 'object' && !Array.isArray(value), 400, 'INVALID_JSON', 'JSON inválido'); return value as Record<string, unknown>; }
  catch (error) { if (error instanceof DomainError) throw error; throw new DomainError(400, 'INVALID_JSON', 'JSON inválido'); }
}

export function createGradesApp(store: BookStore, auth: AuthConfig, allowedOrigin?: string) {
  const subscriptions = new Map<WebSocket, { actor: Actor; bookId: string; expiry: ReturnType<typeof setTimeout> }>();
  const wss = new WebSocketServer({ noServer: true, maxPayload: 8192 });
  const notify = (tenantId: string, bookId: string) => {
    for (const [socket, subscription] of subscriptions) {
      if (subscription.actor.tenantId === tenantId && subscription.bookId === bookId && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ event: 'GRADE_UPDATED', bookId }));
    }
  };
  const server = createServer(async (req, res) => {
    try {
      if (req.headers.origin) {
        requireRule(req.headers.origin === allowedOrigin, 403, 'ORIGIN_DENIED', 'Origen no autorizado');
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin!);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
      }
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/health' && req.method === 'GET') { send(res, 200, { status: 'ok' }); return; }
      const actor = await authenticate((req.headers.authorization ?? '').replace(/^Bearer /, ''), auth);
      if (req.method === 'GET' && url.pathname === '/api/v1/grades/annual') {
        const bookId = text(url.searchParams.get('bookId'), 'Planilla', 100);
        requireRule(uuid.test(bookId), 400, 'INVALID_BOOK', 'Identificador inválido');
        const book = await store.load(actor, bookId);
        const books = await store.periods(actor, book);
        const students = book.students.filter(s => actor.role !== 'student' || s.userId === actor.id);
        send(res, 200, { students: students.map(s => ({ id: s.id, name: s.name, ...annualSummary(books, s.id, actor.role === 'student') })) }); return;
      }
      if (req.method === 'GET' && url.pathname === '/api/v1/grades/matrix') {
        const bookId = text(url.searchParams.get('bookId'), 'Planilla', 100);
        requireRule(uuid.test(bookId), 400, 'INVALID_BOOK', 'Identificador de planilla inválido');
        send(res, 200, view(await store.load(actor, bookId), actor)); return;
      }
      const batchRoute = req.method === 'PATCH' && ['/api/v1/grades/batch', '/api/v1/grades/batch-save', '/api/v1/grades/auto-save'].includes(url.pathname) || req.method === 'POST' && url.pathname === '/api/v1/grades/batch-upsert';
      const actionRoute = req.method === 'POST' && url.pathname === '/api/v1/grades/actions';
      requireRule(batchRoute || actionRoute, 404, 'NOT_FOUND', 'Ruta no encontrada');
      const body = await readBody(req);
      const bookId = text(body.bookId, 'Planilla', 100);
      requireRule(uuid.test(bookId) && Number.isInteger(body.revision) && Number(body.revision) > 0, 400, 'INVALID_VERSION', 'Planilla o versión inválida');
      const action = batchRoute ? 'batch' : text(body.action, 'Acción', 30);
      const updated = await store.mutate(actor, bookId, Number(body.revision), action, book => batchRoute ? applyBatch(book, actor, body.items) : applyAction(book, actor, action, body));
      send(res, 200, view(updated, actor)); notify(actor.tenantId, bookId);
    } catch (error) {
      const known = error instanceof DomainError;
      if (!known) console.error('Grades request failed:', error instanceof Error ? error.name : 'UnknownError');
      send(res, known ? error.status : 500, { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'No se pudo completar la operación' }, false);
    }
  });
  server.requestTimeout = 20_000;
  server.headersTimeout = 15_000;
  server.on('upgrade', (req, socket, head) => {
    if (req.url !== '/api/v1/grades/live' || req.headers.origin && req.headers.origin !== allowedOrigin) { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws));
  });
  wss.on('connection', socket => {
    const timeout = setTimeout(() => socket.close(1008, 'Autenticación requerida'), 5000);
    let authenticating = false;
    socket.once('message', async message => {
      if (authenticating) return; authenticating = true;
      try {
        const { token, bookId } = JSON.parse(message.toString());
        requireRule(typeof token === 'string' && typeof bookId === 'string' && uuid.test(bookId), 401, 'UNAUTHENTICATED', 'Credenciales inválidas');
        const actor = await authenticate(token, auth);
        await store.load(actor, bookId);
        if (socket.readyState !== WebSocket.OPEN) return;
        clearTimeout(timeout);
        const expiry = setTimeout(() => socket.close(1008, 'Renueve la sesión'), Math.max(0, Math.min(60_000, actor.expiresAt! - Date.now())));
        subscriptions.set(socket, { actor, bookId, expiry });
        socket.send(JSON.stringify({ event: 'SUBSCRIBED', bookId }));
      } catch { socket.close(1008, 'Acceso denegado'); }
    });
    socket.on('error', () => socket.close());
    socket.on('close', () => { clearTimeout(timeout); const sub = subscriptions.get(socket); if (sub) clearTimeout(sub.expiry); subscriptions.delete(socket); });
  });
  return { server, wss, close: async () => { for (const socket of wss.clients) socket.terminate(); await new Promise<void>(resolve => wss.close(() => resolve())); await new Promise<void>(resolve => server.close(() => resolve())); } };
}
