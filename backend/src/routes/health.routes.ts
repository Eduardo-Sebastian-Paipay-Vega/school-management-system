import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'DISCONNECTED';
  let redisStatus = 'DISCONNECTED';

  try {
    const dbRes = await pool.query('SELECT NOW()');
    if (dbRes.rows.length > 0) dbStatus = 'CONNECTED';
  } catch (e: any) {
    dbStatus = `ERROR: ${e.message}`;
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      redisStatus = 'CONNECTED';
    }
  } catch (e: any) {
    redisStatus = `ERROR: ${e.message}`;
  }

  const isHealthy = dbStatus === 'CONNECTED';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    version: '1.0.0',
    institution: 'Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH',
  });
});

export default router;
