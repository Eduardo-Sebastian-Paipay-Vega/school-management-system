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
  } catch {
    dbStatus = 'DISCONNECTED';
  }

  // Particiones mensuales de logs_auditoria (UTC, como database/scripts/ensure-audit-partitions.mjs).
  // Sin la del mes actual, toda escritura auditada falla cerrada: la instancia no está sana.
  // Sin la del mes siguiente, solo se avisa para ejecutar `npm run audit:partitions` a tiempo.
  let auditPartitions = 'UNKNOWN';
  if (dbStatus === 'CONNECTED') {
    try {
      const partitions = await pool.query<{ actual: boolean; siguiente: boolean }>(
        `SELECT to_regclass('public.logs_auditoria_' || to_char(m, 'YYYY_MM')) IS NOT NULL AS actual,
                to_regclass('public.logs_auditoria_' || to_char(m + interval '1 month', 'YYYY_MM')) IS NOT NULL AS siguiente
         FROM (SELECT date_trunc('month', now() AT TIME ZONE 'UTC') AS m) AS mes`);
      const row = partitions.rows[0];
      auditPartitions = !row.actual ? 'MISSING_CURRENT_MONTH' : !row.siguiente ? 'MISSING_NEXT_MONTH' : 'OK';
    } catch {
      auditPartitions = 'UNKNOWN';
    }
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      redisStatus = 'CONNECTED';
    }
  } catch {
    redisStatus = 'DISCONNECTED';
  }

  const isHealthy = dbStatus === 'CONNECTED' && redisStatus === 'CONNECTED' &&
    auditPartitions !== 'MISSING_CURRENT_MONTH';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      auditPartitions,
    },
    version: '1.0.0',
    institution: 'Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH',
  });
});

export default router;
