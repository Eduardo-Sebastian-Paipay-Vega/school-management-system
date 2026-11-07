// Punto único de acceso HTTP al backend común (ADR-005). Los módulos no crean su propio cliente:
// las rutas autenticadas usan useCoreSession().request y las públicas las funciones de este archivo.
import type { components, paths } from 'school-contracts';

export type CoreUser = components['schemas']['CoreUser'];
export type CoreSessionData = paths['/auth/login']['post']['responses'][200]['content']['application/json']['data'];

export const API_BASE_URL = (process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/api/v1${path}`;
}

export const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';

/**
 * fetch con el error de red traducido. El navegador rechaza fetch con un TypeError en inglés
 * («Failed to fetch») cuando no hay conexión o el servidor no responde; las vistas muestran
 * `error.message`, así que se sustituye aquí, en el único punto de acceso HTTP.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new Error(NETWORK_ERROR_MESSAGE, { cause });
  }
}

/** Sobre canónico de respuesta: `{ success, data | error: { code, message }, timestamp }`. */
export type ApiEnvelope<T> =
  { success: true; data: T; timestamp: string } | components['schemas']['Error'];

export async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !body.success || body.data === undefined)
    throw new Error(!body.success ? body.error.message : 'No se pudo completar la solicitud.');
  return body.data;
}

export async function publicPost<T>(path: string, body: object): Promise<T> {
  return parseEnvelope<T>(await apiFetch(apiUrl(path), { method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

export async function publicGet<T>(path: string): Promise<T> {
  return parseEnvelope<T>(await apiFetch(apiUrl(path), { credentials: 'include' }));
}
