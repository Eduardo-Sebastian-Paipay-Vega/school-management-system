import pg from 'pg';
import { createGradesApp } from './app.js';
import { PostgresBookStore } from './store.js';

function env(name: string) { const value = process.env[name]; if (!value) throw new Error(`Configure ${name}`); return value; }
const secret = env('JWT_SECRET');
if (Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET requiere al menos 32 bytes');
const pool = new pg.Pool({ connectionString: env('DATABASE_URL'), max: 10 });
const app = createGradesApp(new PostgresBookStore(pool), { secret: new TextEncoder().encode(secret), issuer: env('JWT_ISSUER'), audience: env('JWT_AUDIENCE') }, process.env.ALLOWED_ORIGIN);
app.server.listen(Number(process.env.PORT ?? 3003), process.env.HOST ?? '127.0.0.1', () => console.log('Squad 3: servidor de calificaciones listo'));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => { await app.close(); await pool.end(); });
