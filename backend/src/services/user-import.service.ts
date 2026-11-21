import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import yauzl from 'yauzl';
import { z } from 'zod';
import { blankAsAbsent, phoneSchema } from '../core/validation';

// Una celda vacía (o un campo JSON con solo espacios) equivale a un dato ausente: así
// los opcionales no se validan como texto vacío y los obligatorios informan que faltan.
const text = <T extends z.ZodType>(schema: T) => z.preprocess(blankAsAbsent, schema);

export const importRow = z.object({
  tipoDocumento: text(z.enum(['DNI', 'CE', 'PASAPORTE', 'PTP', 'SIN_DOCUMENTO']).default('DNI')),
  documento: text(z.string().trim().optional()),
  codigoSiagie: text(z.string().trim().max(20).optional()),
  nombres: text(z.string().trim().min(1).max(100)),
  apellidoPaterno: text(z.string().trim().min(1).max(100)),
  apellidoMaterno: text(z.string().trim().max(100).optional()),
  email: text(z.string().trim().email().max(254).optional()),
  telefono: text(phoneSchema.optional()),
  username: text(z.string().trim().max(50).optional()),
  rol: text(z.string().trim().max(40).optional()),
}).superRefine((row, ctx) => {
  if (row.tipoDocumento === 'DNI' && !/^\d{8}$/.test(row.documento ?? '')) {
    ctx.addIssue({ code: 'custom', message: 'DNI inválido', path: ['documento'] });
  }
  if (row.tipoDocumento !== 'SIN_DOCUMENTO' && !row.documento) {
    ctx.addIssue({ code: 'custom', message: 'Documento requerido', path: ['documento'] });
  }
  if (row.tipoDocumento === 'SIN_DOCUMENTO' && !row.codigoSiagie) {
    ctx.addIssue({ code: 'custom', message: 'Código SIAGIE requerido sin documento', path: ['codigoSiagie'] });
  }
  if (row.rol && !row.email) {
    ctx.addIssue({ code: 'custom', message: 'Correo requerido para activar la cuenta', path: ['email'] });
  }
});
export type ImportRow = z.infer<typeof importRow>;

const headers: Record<string, keyof ImportRow> = {
  tipo_documento: 'tipoDocumento', documento: 'documento', dni: 'documento',
  codigo_siagie: 'codigoSiagie', nombres: 'nombres',
  apellido_paterno: 'apellidoPaterno', apellido_materno: 'apellidoMaterno',
  email: 'email', telefono: 'telefono', usuario: 'username', rol: 'rol',
};

function assertZipSize(buffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (cause, zip) => {
      if (cause || !zip) { reject(cause ?? new Error('XLSX inválido')); return; }
      let count = 0;
      let total = 0;
      zip.on('entry', (entry) => {
        count++;
        total += entry.uncompressedSize;
        if (count > 100 || total > 20 * 1024 * 1024 ||
            entry.uncompressedSize > 10 * 1024 * 1024 ||
            entry.uncompressedSize > Math.max(1, entry.compressedSize) * 100) {
          zip.close(); reject(new Error('XLSX excede límites de tamaño')); return;
        }
        zip.readEntry();
      });
      zip.on('end', () => resolve());
      zip.on('error', reject);
      zip.readEntry();
    });
  });
}

export async function parseImportFile(filename: string, base64: string): Promise<unknown[]> {
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
    throw new Error('El archivo debe medir hasta 2 MB.');
  }
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet | undefined;
  if (filename.toLowerCase().endsWith('.xlsx')) {
    await assertZipSize(buffer);
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    sheet = workbook.worksheets[0];
  } else if (filename.toLowerCase().endsWith('.csv')) {
    // Sin `map`, ExcelJS convierte cada celda a número o fecha: «  » llega como 0 y un
    // DNI «01234567» pierde el cero. El padrón se lee como texto, tal como se escribió.
    sheet = await workbook.csv.read(Readable.from([buffer]),
      { map: (value: string) => (value === '' ? null : value) });
  } else {
    throw new Error('Formato permitido: CSV o XLSX.');
  }
  if (!sheet) throw new Error('El archivo no contiene una hoja.');
  const first = sheet.getRow(1);
  const columns: Array<keyof ImportRow | null> = [];
  first.eachCell({ includeEmpty: true }, (cell, number) => {
    const key = cell.text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '_');
    columns[number - 1] = headers[key] ?? null;
  });
  if (!columns.includes('nombres') || !columns.includes('apellidoPaterno') ||
      (!columns.includes('documento') && !columns.includes('codigoSiagie')))
    throw new Error('Faltan columnas obligatorias.');
  const rows: unknown[] = [];
  sheet.eachRow((row, number) => {
    if (number === 1) return;
    if (rows.length >= 1000) throw new Error('Máximo 1000 filas por lote.');
    const item: Record<string, string> = {};
    columns.forEach((key, index) => { if (key) item[key] = row.getCell(index + 1).text.trim(); });
    if (Object.values(item).some(Boolean)) rows.push(item);
  });
  return rows;
}
