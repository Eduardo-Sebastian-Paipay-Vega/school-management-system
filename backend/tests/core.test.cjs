const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.DOCUMENT_HMAC_KEY = 'c'.repeat(64);
process.env.ENCRYPTION_MASTER_KEY = 'd'.repeat(64);
const { documentHash, encryptDocument, decryptDocument, encryptionKeyVersion,
  assertIdentityKeys, randomToken, tokenHash } =
  require('../dist/core/identity-crypto');
const { parseImportFile, importRow } = require('../dist/services/user-import.service');
const ExcelJS = require('exceljs');

test('documento cifrado aleatorio y búsqueda determinista sin exponer DNI', () => {
  const a=encryptDocument('12345678');
  const b=encryptDocument('12345678');
  assert.notDeepEqual(a,b);
  assert.equal(decryptDocument(a),'12345678');
  assert.equal(documentHash('12345678'),documentHash(' 12345678 '));
  assert.notEqual(documentHash('12345678'),documentHash('12345679'));
  a[30]^=1;
  assert.throws(()=>decryptDocument(a));
});

test('cifrado versionado permite recifrar sin perder datos legados', () => {
  const legacy=encryptDocument('87654321');
  assert.equal(encryptionKeyVersion(legacy),null);
  const originalHash=documentHash('87654321');
  const originalLegacyKey=process.env.ENCRYPTION_MASTER_KEY;
  process.env.ENCRYPTION_KEYS_JSON=JSON.stringify({2:'e'.repeat(64),3:'f'.repeat(64)});
  process.env.ENCRYPTION_ACTIVE_KEY_ID='2';
  try{
    assertIdentityKeys();
    const v2=encryptDocument(decryptDocument(legacy));
    assert.equal(encryptionKeyVersion(v2),2);
    assert.equal(decryptDocument(v2),'87654321');
    process.env.ENCRYPTION_ACTIVE_KEY_ID='3';
    const v3=encryptDocument(decryptDocument(v2));
    assert.equal(encryptionKeyVersion(v3),3);
    assert.equal(decryptDocument(v3),'87654321');
    assert.equal(documentHash('87654321'),originalHash);
    delete process.env.ENCRYPTION_MASTER_KEY;
    process.env.ENCRYPTION_KEYS_JSON=JSON.stringify({3:'f'.repeat(64)});
    assertIdentityKeys();
    assert.equal(decryptDocument(v3),'87654321');
    assert.throws(()=>decryptDocument(v2),/Falta la versión/);
    delete process.env.ENCRYPTION_KEYS_JSON;
    assert.throws(()=>decryptDocument(v3),/Falta la versión/);
  }finally{
    process.env.ENCRYPTION_MASTER_KEY=originalLegacyKey;
    delete process.env.ENCRYPTION_ACTIVE_KEY_ID;
    delete process.env.ENCRYPTION_KEYS_JSON;
  }
});

test('tokens aleatorios de un uso se guardan solo como SHA-256', () => {
  const a=randomToken(),b=randomToken();
  assert.notEqual(a,b);
  assert.equal(tokenHash(a).length,64);
  assert.ok(!tokenHash(a).includes(a));
});

test('CSV importa filas sin contraseñas y valida identidad', async () => {
  const csv='tipo_documento,dni,nombres,apellido_paterno,email,rol\nDNI,12345678,Ana,Quispe,ana@example.org,ESTUDIANTE\n';
  const rows=await parseImportFile('usuarios.csv',Buffer.from(csv).toString('base64'));
  assert.equal(rows.length,1);
  assert.equal(importRow.parse(rows[0]).documento,'12345678');
  assert.equal(importRow.safeParse({...rows[0],documento:'123'}).success,false);
});

test('XLSX importa el mismo padrón con dependencias actualizadas', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Padrón');
  sheet.addRow(['tipo_documento', 'dni', 'nombres', 'apellido_paterno', 'email', 'rol']);
  sheet.addRow(['DNI', '87654321', 'Luis', 'Huamán', 'luis@example.org', 'DOCENTE']);
  const buffer = await workbook.xlsx.writeBuffer();
  const rows = await parseImportFile('padron.xlsx', Buffer.from(buffer).toString('base64'));
  assert.equal(rows.length, 1);
  assert.equal(importRow.parse(rows[0]).documento, '87654321');
});
