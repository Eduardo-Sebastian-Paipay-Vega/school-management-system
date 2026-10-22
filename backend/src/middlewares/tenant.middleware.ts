import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

/**
 * Middleware para Aislamiento Multi-Tenant (Segregación Lógica Institucional).
 * Extrae y valida el identificador de sede/institución de la cabecera `X-Tenant-ID`.
 */
export const requireTenant = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  const tenantIdHeader = req.headers['x-tenant-id'];
  const tenantId = (Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader) ||
    'unsch-guaman-poma-2026'; // Tenant por defecto en desarrollo

  if (!tenantId || tenantId.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_TENANT_ID',
        message: 'La cabecera X-Tenant-ID es obligatoria para el aislamiento multi-tenant.',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  req.tenantId = tenantId.trim();
  next();
};
