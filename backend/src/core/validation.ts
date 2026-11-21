import { z } from 'zod';

/**
 * Validación compartida del Core: mensajes en español para el usuario y reglas de
 * formato reutilizadas por rutas y servicios. Importar este módulo fija una sola vez
 * el mapa de errores de zod; los mensajes explícitos de cada esquema siguen mandando.
 */

const FIELD_LABELS: Record<string, string> = {
  tipoDocumento: 'Tipo de documento', documento: 'Documento', codigoSiagie: 'Código SIAGIE',
  nombres: 'Nombres', apellidoPaterno: 'Apellido paterno', apellidoMaterno: 'Apellido materno',
  email: 'Correo electrónico', telefono: 'Teléfono', username: 'Usuario', rol: 'Rol',
  fotoUrl: 'Foto', escudoUrl: 'Escudo', password: 'Contraseña', nueva: 'Contraseña nueva',
  actual: 'Contraseña actual', motivo: 'Motivo', codigoModular: 'Código modular',
  identifier: 'Usuario o correo', token: 'Enlace',
};

function fieldLabel(path: readonly PropertyKey[] | undefined): string {
  const key = path?.length ? String(path[path.length - 1]) : '';
  return FIELD_LABELS[key] ?? (key && !/^\d+$/.test(key) ? `Campo ${key}` : 'Valor');
}

type Issue = Parameters<z.core.$ZodErrorMap>[0];

function problem(issue: Issue): string {
  const data = issue as unknown as Record<string, unknown>;
  switch (issue.code) {
    case 'invalid_type':
      return issue.input === undefined ? 'dato obligatorio' : 'tipo de dato inválido';
    case 'too_small':
      if (data.origin === 'string') return Number(data.minimum) <= 1
        ? 'dato obligatorio' : `debe tener al menos ${String(data.minimum)} caracteres`;
      if (data.origin === 'array') return `debe tener al menos ${String(data.minimum)} elementos`;
      return `debe ser mayor o igual a ${String(data.minimum)}`;
    case 'too_big':
      if (data.origin === 'string') return `no debe superar ${String(data.maximum)} caracteres`;
      if (data.origin === 'array') return `no debe superar ${String(data.maximum)} elementos`;
      return `debe ser menor o igual a ${String(data.maximum)}`;
    case 'invalid_format':
      if (data.format === 'email') return 'no es un correo electrónico válido';
      if (data.format === 'url') return 'no es una URL válida';
      return 'formato inválido';
    case 'invalid_value':
      return 'opción no válida';
    case 'unrecognized_keys':
      return 'contiene campos no admitidos';
    default:
      return 'dato inválido';
  }
}

/** Mensaje en español («Campo: problema.») para un problema sin mensaje propio en el esquema. */
export function spanishIssueMessage(issue: Issue): string {
  return `${fieldLabel(issue.path)}: ${problem(issue)}.`;
}

z.config({ customError: spanishIssueMessage });

/** Convierte un texto vacío o solo con espacios en ausente (celdas vacías, campos opcionales). */
export const blankAsAbsent = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** Campo opcional de PATCH: ausente = sin cambios; texto vacío o solo espacios o null = borrar (null). */
export const clearable = <T extends z.ZodType<string>>(schema: T) =>
  z.preprocess((value) => value !== undefined && blankAsAbsent(value) === undefined ? null : value,
    schema.nullable().optional());

/**
 * Teléfono (RF-09 «número telefónico»): dígitos con `+` inicial opcional, espacios o
 * guiones; entre 6 y 15 dígitos (fijos con código de área, móviles de 9 dígitos y +51)
 * y hasta 20 caracteres, el tamaño de `personas.telefono`.
 */
export const PHONE_MESSAGE = 'El teléfono solo admite dígitos, un «+» inicial, espacios o guiones (6 a 15 dígitos).';
export const phoneSchema = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, '').length;
  return value.length <= 20 && /^\+?\d[\d -]*\d$/.test(value) && digits >= 6 && digits <= 15;
}, { error: PHONE_MESSAGE });

/** URL de imagen pública: solo `https:` (bloquea `javascript:`, `data:`, `http:` y otros esquemas). */
export const HTTPS_URL_MESSAGE = 'La URL debe ser una dirección https:// válida.';
export const httpsUrlSchema = z.string().trim().refine((value) => {
  if (value.length > 1000) return false;
  try { const url = new URL(value); return url.protocol === 'https:' && !!url.hostname; } catch { return false; }
}, { error: HTTPS_URL_MESSAGE });

/**
 * Política de contraseña (RF-03: «complejidad mínima (8 caracteres, letras y números)»;
 * RF-09: «contraseña nueva (mínimo 8 caracteres)»). El tope de 72 bytes es el límite de bcrypt.
 */
export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, incluir letras y números, y no superar 72 bytes.';
export const passwordSchema = z.string({ error: PASSWORD_POLICY_MESSAGE }).refine((value) =>
  value.length >= 8 && Buffer.byteLength(value, 'utf8') <= 72 && /[A-Za-z]/.test(value) && /\d/.test(value),
{ error: PASSWORD_POLICY_MESSAGE });

/** Mensajes de una validación fallida, sin repetidos, separados por «; ». */
export function issueMessages(error: z.ZodError): string {
  return [...new Set(error.issues.map((item) => item.message))].join('; ');
}

/** Mensaje del primer problema en uno de `fields`; si no hay, `fallback` (el código no cambia). */
export function messageFor(error: z.ZodError, fields: string[], fallback: string): string {
  const issue = error.issues.find((item) => fields.includes(String(item.path[0])));
  return issue?.message ?? fallback;
}
