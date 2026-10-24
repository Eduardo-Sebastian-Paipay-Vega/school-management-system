import { Request, Response, NextFunction } from 'express';
import { AuthClaims, AuthService, UserPayload } from '../services/auth.service';

export interface AuthenticatedUser extends UserPayload {
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  authClaims?: AuthClaims;
}

export async function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
  if (!match) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Inicie sesión.' }, timestamp: new Date().toISOString() });
    return;
  }
  let claims: AuthClaims;
  try { claims = AuthService.accessClaims(match[1]); }
  catch {
    res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID',
      message: 'Token inválido o vencido.' }, timestamp: new Date().toISOString() });
    return;
  }
  try {
    const current = await AuthService.validateAccess(claims);
    if (!current) {
      res.status(401).json({ success: false, error: { code: 'SESSION_EXPIRED', message: 'La sesión terminó. Inicie sesión nuevamente.' }, timestamp: new Date().toISOString() });
      return;
    }
    req.authClaims = claims;
    req.user = { ...current, sessionId: claims.sid };
    next();
  } catch {
    res.status(503).json({ success: false,
      error: { code: 'AUTH_UNAVAILABLE', message: 'Autenticación temporalmente no disponible.' },
      timestamp: new Date().toISOString() });
  }
}
