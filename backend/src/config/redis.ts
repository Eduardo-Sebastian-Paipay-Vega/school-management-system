import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

export const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
});

redisClient.on('error', (err) => {
  console.warn('Aviso: Redis no disponible o fuera de línea:', err.message);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Conexión exitosa a Redis');
  } catch {
    console.warn('No se pudo conectar a Redis. Operando en modo degradado sin caché.');
  }
};
