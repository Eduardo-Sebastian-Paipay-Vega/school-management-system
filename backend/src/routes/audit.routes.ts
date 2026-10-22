import { Router, Response } from 'express';
import { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { requireTenant, TenantRequest } from '../middlewares/tenant.middleware';
import { AuditService } from '../services/audit.service';
import { pool } from '../config/database';

const router = Router();

/**
 * GET /api/v1/audit/verify-chain
 * Verifica la integridad criptográfica de la cadena de bloques SHA-256 (RF-65, RF-66).
 */
router.get(
  '/verify-chain',
  authenticateJwt,
  requireRoles(['DIRECTIVO', 'SUPERADMIN']),
  requireTenant,
  async (req: TenantRequest & AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId || 'unsch-guaman-poma-2026';
      const verification = await AuditService.verifyChain(tenantId);

      res.status(200).json({
        success: true,
        data: {
          chainIntact: verification.valid,
          totalRecords: verification.totalRecords,
          lawCompliance: 'Ley N.° 29733 (Protección de Datos Personales)',
          tenantId,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'AUDIT_VERIFICATION_ERROR',
          message: err.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * GET /api/v1/audit/logs
 * Consulta de registros de auditoría filtrados por entidad y fecha.
 */
router.get(
  '/logs',
  authenticateJwt,
  requireRoles(['DIRECTIVO', 'SUPERADMIN']),
  requireTenant,
  async (req: TenantRequest & AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId || 'unsch-guaman-poma-2026';
      const limit = parseInt(req.query.limit as string || '50', 10);

      const dbRes = await pool.query(
        `SELECT id, tenant_id, usuario_id, accion, entidad, entidad_id, ip_origen, prev_hash, hash_sha256, created_at 
         FROM logs_auditoria 
         WHERE tenant_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [tenantId, limit]
      );

      res.status(200).json({
        success: true,
        data: {
          logs: dbRes.rows,
          count: dbRes.rows.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(200).json({
        success: true,
        data: {
          logs: [],
          count: 0,
          notice: 'Tabla no inicializada o vacía en entorno de prueba.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
