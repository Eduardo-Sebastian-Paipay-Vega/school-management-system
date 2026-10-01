import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware para Control de Acceso Basado en Roles (RBAC — RF-04)
 * Valida si el usuario autenticado posee al menos uno de los roles permitidos.
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Sesión no identificada.',
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = userRoles.some(
      (role) => role === 'SUPERADMIN' || allowedRoles.includes(role)
    );

    if (!hasRole) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
