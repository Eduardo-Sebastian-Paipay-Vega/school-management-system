import crypto from 'crypto';

function secret(name: string, bytes: number): Buffer {
  const raw = process.env[name];
  if (!raw || !new RegExp(`^[a-fA-F0-9]{${bytes * 2}}$`).test(raw)) {
    throw new Error(`${name} debe ser una clave hexadecimal de ${bytes} bytes.`);
  }
  return Buffer.from(raw, 'hex');
}

export function assertIdentityKeys(): void {
  const encryption=secret('ENCRYPTION_MASTER_KEY',32);
  const lookup=secret('DOCUMENT_HMAC_KEY',32);
  if(encryption.equals(lookup)) throw new Error('Las claves de cifrado y búsqueda deben ser distintas.');
  if(process.env.NODE_ENV==='production' &&
      encryption.toString('hex')==='0123456789abcdef'.repeat(4))
    throw new Error('ENCRYPTION_MASTER_KEY usa el ejemplo público.');
}

export function documentHash(document: string): string {
  return crypto.createHmac('sha256', secret('DOCUMENT_HMAC_KEY', 32))
    .update(document.trim().toUpperCase()).digest('hex');
}

export function encryptDocument(document: string): Buffer {
  const key = secret('ENCRYPTION_MASTER_KEY', 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

export function decryptDocument(data: Buffer): string {
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', secret('ENCRYPTION_MASTER_KEY', 32), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
}

export function randomToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
