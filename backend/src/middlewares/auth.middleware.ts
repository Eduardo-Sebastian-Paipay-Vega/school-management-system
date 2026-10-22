import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  username: string;
  dni: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de acceso no proporcionado o formato inválido.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    req.user = {
      id: decoded.sub || decoded.id,
      tenantId: decoded.tenantId,
      username: decoded.username,
      dni: decoded.dni,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles],
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'TOKEN_EXPIRED_OR_INVALID',
      message: 'El token ha expirado o la firma criptográfica es inválida.',
    });
  }
};
