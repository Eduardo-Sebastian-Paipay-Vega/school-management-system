const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.DOCUMENT_HMAC_KEY = 'c'.repeat(64);
process.env.ENCRYPTION_MASTER_KEY = 'd'.repeat(64);
const { parseImportFile, importRow } = require('../dist/services/user-import.service');
const { phoneSchema, httpsUrlSchema, passwordSchema, PASSWORD_POLICY_MESSAGE, clearable } =
  require('../dist/core/validation');
const ExcelJS = require('exceljs');

test('CSV: celdas vacías de campos opcionales cuentan como ausentes', async () => {
  const csv = 'tipo_documento,dni,nombres,apellido_paterno,email,telefono,rol\n' +
    'DNI,12345678,Ana,Quispe,,,\nDNI,12345679,Luis,Huamán,  ,,DOCENTE\n';
  const rows = await parseImportFile('usuarios.csv', Buffer.from(csv).toString('base64'));
  const first = importRow.safeParse(rows[0]);
  assert.equal(first.success, true, JSON.stringify(first.error?.issues));
  assert.equal(first.data.email, undefined);
  assert.equal(first.data.telefono, undefined);
  assert.equal(first.data.rol, undefined);
  const second = importRow.safeParse(rows[1]);
  assert.equal(second.success, false, 'una fila con rol sigue exigiendo correo');
  assert.deepEqual(second.error.issues.map((x) => x.message), ['Correo requerido para activar la cuenta']);
});

test('CSV: las celdas se leen como texto (DNI con cero inicial, teléfono con espacios)', async () => {
  const csv = 'dni,nombres,apellido_paterno,telefono\n01234567,Ana,Quispe,+51 966 123 456\n';
  const rows = await parseImportFile('usuarios.csv', Buffer.from(csv).toString('base64'));
  const row = importRow.parse(rows[0]);
  assert.equal(row.documento, '01234567');
  assert.equal(row.telefono, '+51 966 123 456');
});

test('XLSX: una celda de correo vacía no invalida a la persona sin cuenta', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Padrón');
  sheet.addRow(['tipo_documento', 'dni', 'nombres', 'apellido_paterno', 'email']);
  sheet.addRow(['DNI', '87654321', 'Rosa', 'Mamani', '']);
  const buffer = await workbook.xlsx.writeBuffer();
  const rows = await parseImportFile('padron.xlsx', Buffer.from(buffer).toString('base64'));
  assert.equal(importRow.safeParse(rows[0]).success, true);
});

test('mensajes de zod llegan en español y nombran el campo', () => {
  const result = importRow.safeParse({ documento: '12345678', nombres: '', apellidoPaterno: 'Q',
    email: 'no-es-correo', tipoDocumento: 'OTRO' });
  assert.equal(result.success, false);
  const messages = result.error.issues.map((x) => x.message);
  assert.ok(messages.includes('Correo electrónico: no es un correo electrónico válido.'), messages.join(' | '));
  assert.ok(messages.includes('Nombres: dato obligatorio.'), messages.join(' | '));
  assert.ok(messages.includes('Tipo de documento: opción no válida.'), messages.join(' | '));
  assert.ok(!messages.some((x) => /Invalid|expected/i.test(x)), messages.join(' | '));
});

test('teléfono: dígitos con +, espacios o guiones; rechaza letras', () => {
  for (const ok of ['966123456', '+51 966 123 456', '066-312345', '066312345'])
    assert.equal(phoneSchema.safeParse(ok).success, true, ok);
  for (const bad of ['abc', '12345', '+51 966 abc', '9661234561234567', '--966123456', '+51 966 123 456 789 01'])
    assert.equal(phoneSchema.safeParse(bad).success, false, bad);
  assert.equal(importRow.safeParse({ documento: '12345678', nombres: 'A', apellidoPaterno: 'B',
    telefono: 'abc' }).success, false);
});

test('URL de foto o escudo: solo https', () => {
  assert.equal(httpsUrlSchema.safeParse('https://cdn.example.org/foto.png').success, true);
  for (const bad of ['javascript:alert(1)', 'http://example.org/a.png', 'data:image/png;base64,AA', 'ftp://x.org/a'])
    assert.equal(httpsUrlSchema.safeParse(bad).success, false, bad);
  const field = clearable(httpsUrlSchema);
  assert.equal(field.parse(''), null);
  assert.equal(field.parse(null), null);
  assert.equal(field.parse(undefined), undefined);
});

test('política de contraseña con mensaje propio', () => {
  for (const bad of ['corta1', 'solotexto', '12345678', 'a1'.repeat(37)]) {
    const result = passwordSchema.safeParse(bad);
    assert.equal(result.success, false, bad);
    assert.equal(result.error.issues[0].message, PASSWORD_POLICY_MESSAGE);
  }
  assert.equal(passwordSchema.safeParse('PruebaSegura2026').success, true);
});
