import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/** Sobre canónico de ADR-005 para los módulos de backend/src/modules. */
export const ok = (res: Response, data: unknown, status = 200): void => {
  res.status(status).json({ success: true, data, timestamp: new Date().toISOString() });
};

/** Error de negocio con estado HTTP y código estable; nunca lleva detalle técnico. */
export class DomainError extends Error {
  constructor(readonly status: number, readonly code: string, message: string,
    readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Responde un DomainError; cualquier otro error va al manejador central (500 sin detalle). */
export function handleError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof DomainError) {
    res.status(error.status).json({ success: false,
      error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
      timestamp: new Date().toISOString() });
    return;
  }
  next(error);
}

export const validationError = () =>
  new DomainError(400, 'VALIDATION_FAILED', 'Parámetros inválidos.');

/** Error de PostgreSQL tal como lo entrega pg. */
export interface PgError { code?: string; message?: string; constraint?: string }
export const asPgError = (error: unknown): PgError =>
  (error && typeof error === 'object' ? error : {}) as PgError;

/** Contexto de la petición que la auditoría necesita, obtenido como en las rutas Core. */
export interface RequestContext {
  tenantId: string;
  userId: string;
  /** IP de origen (req.ip); null si Express no la conoce: la base de datos la exige. */
  ip: string | null;
  userAgent: string | null;
  /** Correlación (ADR-011): solo si el cliente o el proxy envían X-Request-Id con forma UUID. */
  requestId: string | null;
}

export function requestContext(req: AuthenticatedRequest): RequestContext {
  const header = req.headers['x-request-id'];
  const candidate = Array.isArray(header) ? header[0] : header;
  return {
    tenantId: req.user!.tenantId,
    userId: req.user!.id,
    ip: req.ip ?? req.socket.remoteAddress ?? null,
    userAgent: req.headers['user-agent'] ?? null,
    requestId: candidate && z.string().uuid().safeParse(candidate).success ? candidate : null,
  };
}

export const uuidParam = z.string().uuid();
