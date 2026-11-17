import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

export const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  socket: {
    connectTimeout: 1500,
    reconnectStrategy: (retries) => (retries > 0 ? new Error('REDIS_OFFLINE') : 100),
  },
});

redisClient.on('error', (err) => {
  console.warn('Aviso: Redis no disponible o fuera de línea:', err.message);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Conexión exitosa a Redis');
  } catch {
    console.warn('No se pudo conectar a Redis. Operando en modo degradado con memoria local.');
    if (process.env.NODE_ENV === 'development') {
      const memoryStore = new Map<string, string>();
      const fallback = redisClient as unknown as Record<string, unknown>;
      Object.defineProperty(fallback, 'isReady', { get: () => true, configurable: true });
      fallback.get = async (k: string) => memoryStore.get(k) ?? null;
      fallback.set = async (k: string, v: string) => {
        memoryStore.set(k, String(v));
        return 'OK';
      };
      fallback.incr = async (k: string) => {
        const next = Number(memoryStore.get(k) ?? '0') + 1;
        memoryStore.set(k, String(next));
        return next;
      };
      fallback.expire = async () => true;
      fallback.del = async (keys: string | string[]) => {
        const list = Array.isArray(keys) ? keys : [keys];
        list.forEach((k) => memoryStore.delete(k));
        return list.length;
      };
      fallback.duplicate = () => ({
        on: () => undefined,
        connect: async () => undefined,
        pSubscribe: async () => undefined,
        quit: async () => undefined,
      });
    }
  }
};
