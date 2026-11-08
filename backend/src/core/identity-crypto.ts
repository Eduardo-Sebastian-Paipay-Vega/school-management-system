import crypto from 'crypto';

const cipherHeader=Buffer.from('SMSENC01');

function encryptionKeys(): Map<number,Buffer> {
  const result=new Map<number,Buffer>();
  const raw=process.env.ENCRYPTION_KEYS_JSON;
  if(!raw)return result;
  let parsed:unknown;
  try{parsed=JSON.parse(raw);}catch{throw new Error('ENCRYPTION_KEYS_JSON no es JSON válido.');}
  if(!parsed || typeof parsed!=='object' || Array.isArray(parsed))
    throw new Error('ENCRYPTION_KEYS_JSON debe ser un objeto de versiones y claves.');
  for(const [id,value] of Object.entries(parsed)){
    const version=Number(id);
    if(!Number.isInteger(version) || version<2 || version>255 || String(version)!==id ||
      typeof value!=='string' || !/^[a-fA-F0-9]{64}$/.test(value))
      throw new Error('ENCRYPTION_KEYS_JSON contiene una versión o clave inválida.');
    result.set(version,Buffer.from(value,'hex'));
  }
  return result;
}

function activeEncryptionKey(): { version:number|null;key:Buffer } {
  const id=process.env.ENCRYPTION_ACTIVE_KEY_ID;
  if(!id)return {version:null,key:secret('ENCRYPTION_MASTER_KEY',32)};
  const version=Number(id);
  if(!Number.isInteger(version) || version<2 || version>255 || String(version)!==id)
    throw new Error('ENCRYPTION_ACTIVE_KEY_ID inválida.');
  const key=encryptionKeys().get(version);
  if(!key)throw new Error('La clave de cifrado activa no está configurada.');
  return {version,key};
}

export function encryptionKeyVersion(data:Buffer): number|null {
  return data.length>=cipherHeader.length+1 &&
    data.subarray(0,cipherHeader.length).equals(cipherHeader)
    ? data.readUInt8(cipherHeader.length) : null;
}

function secret(name: string, bytes: number): Buffer {
  const raw = process.env[name];
  if (!raw || !new RegExp(`^[a-fA-F0-9]{${bytes * 2}}$`).test(raw)) {
    throw new Error(`${name} debe ser una clave hexadecimal de ${bytes} bytes.`);
  }
  return Buffer.from(raw, 'hex');
}

export function assertIdentityKeys(): void {
  const lookup=secret('DOCUMENT_HMAC_KEY',32);
  const legacy=process.env.ENCRYPTION_MASTER_KEY ? secret('ENCRYPTION_MASTER_KEY',32) : null;
  const seen=legacy?[legacy]:[];
  if(legacy?.equals(lookup)) throw new Error('Las claves de cifrado y búsqueda deben ser distintas.');
  for(const key of encryptionKeys().values()){
    if(key.equals(lookup) || seen.some(previous=>previous.equals(key)))
      throw new Error('Las versiones de claves de identidad deben ser distintas.');
    seen.push(key);
  }
  activeEncryptionKey();
  if(process.env.NODE_ENV==='production' && legacy &&
      legacy.toString('hex')==='0123456789abcdef'.repeat(4))
    throw new Error('ENCRYPTION_MASTER_KEY usa el ejemplo público.');
}

export function documentHash(document: string): string {
  return crypto.createHmac('sha256', secret('DOCUMENT_HMAC_KEY', 32))
    .update(document.trim().toUpperCase()).digest('hex');
}

export function encryptDocument(document: string): Buffer {
  const {version,key}=activeEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()]);
  const payload=Buffer.concat([iv, cipher.getAuthTag(), body]);
  return version===null ? payload : Buffer.concat([cipherHeader,Buffer.from([version]),payload]);
}

export function decryptDocument(data: Buffer): string {
  const version=encryptionKeyVersion(data);
  const offset=version===null?0:cipherHeader.length+1;
  if(data.length<offset+28)throw new Error('Documento cifrado incompleto.');
  const key=version===null?secret('ENCRYPTION_MASTER_KEY',32):encryptionKeys().get(version);
  if(!key)throw new Error('Falta la versión de clave requerida para descifrar el documento.');
  const iv = data.subarray(offset, offset+12);
  const tag = data.subarray(offset+12, offset+28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data.subarray(offset+28)), decipher.final()]).toString('utf8');
}

export function randomToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
