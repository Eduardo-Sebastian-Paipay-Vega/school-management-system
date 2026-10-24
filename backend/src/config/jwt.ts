import dotenv from 'dotenv';

dotenv.config();

// Valores publicados en backend/.env.example: se consideran comprometidos.
const PUBLIC_EXAMPLE_SECRETS = new Set([
  'super_secret_jwt_key_unsch_2026_school_management_system_change_in_prod',
  'super_secret_refresh_jwt_key_unsch_2026_change_in_prod',
]);

/**
 * Lee un secreto JWT obligatorio (RNF-05). Sin valor por defecto: si falta o es débil,
 * el servidor no arranca, para que nunca se firmen tokens con una clave conocida.
 */
function requireSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.length < 32) {
    throw new Error(`${name} es obligatorio y debe tener al menos 32 caracteres.`);
  }
  if (process.env.NODE_ENV === 'production' && PUBLIC_EXAMPLE_SECRETS.has(value)) {
    throw new Error(`${name} usa el valor público de .env.example; genere uno nuevo para producción.`);
  }
  return value;
}

export const JWT_SECRET = requireSecret('JWT_SECRET');
export const JWT_REFRESH_SECRET = requireSecret('JWT_REFRESH_SECRET');
if (JWT_SECRET === JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET y JWT_REFRESH_SECRET deben ser distintos.');
}
