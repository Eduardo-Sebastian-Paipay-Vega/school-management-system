import { NextFunction, Request, Response } from 'express';

/**
 * Manejo transversal de errores HTTP con el sobre canónico de ADR-005.
 * Solo usa códigos publicados en el catálogo; nunca devuelve el detalle técnico al cliente.
 */

/** Origen rechazado por la política CORS de server.ts. */
export class OriginDeniedError extends Error {
  constructor() {
    super('Origen no permitido por CORS');
    this.name = 'OriginDeniedError';
  }
}

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ success: false, error: { code, message }, timestamp: new Date().toISOString() });
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'El recurso solicitado no existe.');
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof OriginDeniedError) {
    sendError(res, 403, 'ORIGIN_DENIED', 'Origen no permitido.');
    return;
  }
  // Errores de body-parser: se identifican por `type`, no por el mensaje.
  const type = (err as { type?: unknown } | null)?.type;
  if (type === 'entity.parse.failed') {
    sendError(res, 400, 'INVALID_JSON', 'El cuerpo de la solicitud no es JSON válido.');
    return;
  }
  if (type === 'entity.too.large') {
    sendError(res, 413, 'BODY_TOO_LARGE', 'El cuerpo de la solicitud supera el tamaño permitido.');
    return;
  }
  console.error('Error no controlado:', err);
  sendError(res, 500, 'INTERNAL_ERROR', 'Ocurrió un error interno. Intente nuevamente.');
}
