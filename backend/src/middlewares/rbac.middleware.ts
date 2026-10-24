import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { withTenant } from '../config/database';
import { AuditService } from '../services/audit.service';

async function denied(req: AuthenticatedRequest, res: Response, requirement: string): Promise<void> {
  try {
    await withTenant(req.user!.tenantId, req.user!.id, async (client) => {
      await AuditService.record({ tenantId: req.user!.tenantId, usuarioId: req.user!.id,
        accion: 'ACCESS_DENIED', entidad: 'api',
        datosNuevos: { method: req.method, path: req.path, requirement }, ipOrigen: req.ip,
        userAgent: req.headers['user-agent'] ?? '' }, client);
    });
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN',
      message: 'No tiene permiso para esta acción.' }, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, error: { code: 'AUDIT_UNAVAILABLE',
      message: 'No se pudo verificar la autorización.' }, timestamp: new Date().toISOString() });
  }
}

export const requireRoles = (allowedRoles: string[]) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Inicie sesión.' }, timestamp: new Date().toISOString() });
      return;
    }
    if (!req.user.roles.some((role) => allowedRoles.includes(role))) {
      await denied(req, res, `role:${allowedRoles.join(',')}`);
      return;
    }
    next();
  };

export const requirePermission = (permission: string) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Inicie sesión.' }, timestamp: new Date().toISOString() });
      return;
    }
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes(permission)) {
      await denied(req, res, `permission:${permission}`);
      return;
    }
    next();
  };
