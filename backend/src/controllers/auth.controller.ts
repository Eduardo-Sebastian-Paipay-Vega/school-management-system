import { Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { sendAccessLink } from '../services/mail.service';
import { redisClient } from '../config/redis';
import { tokenHash } from '../core/identity-crypto';

const password = z.string().min(8).refine((value) => Buffer.byteLength(value, 'utf8') <= 72)
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value));
const loginSchema = z.object({ codigoModular: z.string().min(1).max(10),
  identifier: z.string().min(3).max(254), password: z.string().min(1) });
const linkSchema = z.object({ codigoModular: z.string().min(1).max(10),
  token: z.string().min(32).max(128), password });
const ipOf = (req: AuthenticatedRequest) => req.ip ?? req.socket.remoteAddress ?? '127.0.0.1';

function cookie(res: Response, value: string) {
  res.cookie('refreshToken', value, { httpOnly: true,
    secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/api/v1/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearCookie(res: Response) {
  res.clearCookie('refreshToken', { httpOnly: true,
    secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/v1/auth' });
}

const success = (res: Response, data: unknown, status = 200) => res.status(status).json({
  success: true, data, timestamp: new Date().toISOString(),
});
const error = (res: Response, status: number, code: string, message: string) => res.status(status).json({
  success: false, error: { code, message }, timestamp: new Date().toISOString(),
});

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) { error(res, 400, 'VALIDATION_ERROR', 'Datos de acceso inválidos.'); return; }
    try {
      const session = await AuthService.login(parsed.data.codigoModular, parsed.data.identifier,
        parsed.data.password, ipOf(req), req.headers['user-agent'] ?? '');
      if (!session) { error(res, 401, 'INVALID_CREDENTIALS', 'Usuario o contraseña incorrectos.'); return; }
      cookie(res, session.refreshToken);
      success(res, { user: session.user, accessToken: session.accessToken, expiresIn: 900 });
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'TOO_MANY_ATTEMPTS') {
        error(res, 429, 'TOO_MANY_ATTEMPTS', 'Espere antes de volver a intentar.'); return;
      }
      error(res, 503, 'AUTH_UNAVAILABLE', 'Acceso temporalmente no disponible.');
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) { error(res, 401, 'SESSION_EXPIRED', 'Inicie sesión nuevamente.'); return; }
    try {
      const session = await AuthService.refresh(token, ipOf(req), req.headers['user-agent'] ?? '');
      if (!session) { clearCookie(res); error(res, 401, 'SESSION_EXPIRED', 'Inicie sesión nuevamente.'); return; }
      cookie(res, session.refreshToken);
      success(res, { user: session.user, accessToken: session.accessToken, expiresIn: 900 });
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'AUTH_REVOCATION_UNAVAILABLE') {
        error(res, 503, 'AUTH_UNAVAILABLE', 'Autenticación temporalmente no disponible.'); return;
      }
      clearCookie(res); error(res, 401, 'SESSION_EXPIRED', 'Inicie sesión nuevamente.');
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    success(res, { user: req.user });
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await AuthService.logout(req.authClaims!, ipOf(req), req.headers['user-agent'] ?? '');
      clearCookie(res);
      success(res, { message: 'Sesión cerrada.' });
    } catch { error(res, 503, 'AUTH_UNAVAILABLE', 'No se pudo cerrar la sesión.'); }
  }

  static async forgot(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = z.object({ codigoModular: z.string().min(1).max(10),
      identifier: z.string().min(3).max(254) }).safeParse(req.body);
    if (!parsed.success) { error(res, 400, 'VALIDATION_ERROR', 'Solicitud inválida.'); return; }
    if (!redisClient.isReady) { error(res, 503, 'AUTH_UNAVAILABLE', 'Servicio temporalmente no disponible.'); return; }
    const key = `forgot:${tokenHash(`${ipOf(req)}:${parsed.data.identifier.toLowerCase()}`)}`;
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 900);
    if (count > 5) { error(res, 429, 'TOO_MANY_ATTEMPTS', 'Espere antes de volver a intentar.'); return; }
    try {
      const user = await AuthService.requestRecovery(parsed.data.codigoModular, parsed.data.identifier);
      if (user) {
        const tenant = await (await import('../config/database')).resolveInstitution(parsed.data.codigoModular);
        if (tenant) {
          const token = await AuthService.createAccessLink(tenant, user.id, user.id, 'RECUPERACION');
          await sendAccessLink(user.email, parsed.data.codigoModular, token, 'RECUPERACION');
        }
      }
    } catch (cause) {
      console.error('No se pudo completar la recuperación de contraseña:', cause);
    }
    success(res, { message: 'Si la cuenta existe, recibirá instrucciones en su correo.' }, 202);
  }

  static async reset(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = linkSchema.safeParse(req.body);
    if (!parsed.success) { error(res, 400, 'VALIDATION_ERROR', 'Datos inválidos.'); return; }
    try {
      const applied = await AuthService.consumeAccessLink(parsed.data.codigoModular, parsed.data.token,
        parsed.data.password, 'RECUPERACION', ipOf(req));
      if (!applied) { error(res, 400, 'INVALID_LINK', 'El enlace venció o ya se utilizó.'); return; }
      success(res, { message: 'Contraseña actualizada.' });
    } catch { error(res, 503, 'AUTH_UNAVAILABLE', 'No se pudo actualizar la contraseña.'); }
  }

  static async activate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = linkSchema.safeParse(req.body);
    if (!parsed.success) { error(res, 400, 'VALIDATION_ERROR', 'Datos inválidos.'); return; }
    try {
      const applied = await AuthService.consumeAccessLink(parsed.data.codigoModular, parsed.data.token,
        parsed.data.password, 'ACTIVACION', ipOf(req));
      if (!applied) { error(res, 400, 'INVALID_LINK', 'El enlace venció o ya se utilizó.'); return; }
      success(res, { message: 'Cuenta activada.' });
    } catch { error(res, 503, 'AUTH_UNAVAILABLE', 'No se pudo activar la cuenta.'); }
  }
}
