import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../domain/models/audit_log_entry.dart';
import '../../domain/models/import_report.dart';

/// Generación de PDF sellados (RF-06 reporte de importación, RF-67
/// exportación forense "no alterable" de bitácoras de auditoría).
class PdfExporter {
  const PdfExporter();

  Future<Uint8List> buildImportRejectionReport({
    required ImportReport report,
    required String tenantName,
  }) async {
    final doc = pw.Document();
    doc.addPage(
      pw.MultiPage(
        build: (context) => [
          pw.Header(text: 'Reporte de Importación Masiva de Usuarios — RF-06'),
          pw.Text(tenantName, style: const pw.TextStyle(fontSize: 10)),
          pw.SizedBox(height: 12),
          pw.Text(
            'Total de filas: ${report.totalRows}  |  Importadas: ${report.importedCount}  |  '
            'Rechazadas: ${report.rejectedCount}',
          ),
          pw.SizedBox(height: 12),
          if (report.rejected.isNotEmpty)
            pw.Table.fromTextArray(
              headers: ['Fila', 'Datos', 'Motivo de rechazo'],
              data: report.rejected
                  .map((r) => [r.rowNumber.toString(), r.rawData, r.reason])
                  .toList(),
            ),
          pw.SizedBox(height: 16),
          pw.Text(
            'Generado: ${report.finishedAt.toIso8601String()}',
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700),
          ),
        ],
      ),
    );
    return doc.save();
  }

  Future<Uint8List> buildAuditExport({
    required List<AuditLogEntry> entries,
    required String tenantName,
    required String requestedBy,
  }) async {
    final doc = pw.Document();
    doc.addPage(
      pw.MultiPage(
        build: (context) => [
          pw.Header(text: 'Bitácora de Auditoría — RF-67 (Ley N.° 29733)'),
          pw.Text(tenantName, style: const pw.TextStyle(fontSize: 10)),
          pw.Text('Exportado por: $requestedBy', style: const pw.TextStyle(fontSize: 9)),
          pw.SizedBox(height: 12),
          pw.Table.fromTextArray(
            headers: ['Fecha UTC', 'Usuario', 'Acción', 'Entidad', 'IP', 'Hash'],
            data: entries
                .map((e) => [
                      e.createdAt.toIso8601String(),
                      e.usuarioDisplay,
                      e.accion,
                      e.entidad,
                      e.ipAddress,
                      '${e.hash.substring(0, 12)}…',
                    ])
                .toList(),
            cellStyle: const pw.TextStyle(fontSize: 7),
            headerStyle: const pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold),
          ),
        ],
      ),
    );
    return doc.save();
  }

  /// Abre el diálogo de impresión/descarga del navegador (multiplataforma
  /// vía el paquete `printing`).
  Future<void> printOrShare(Uint8List bytes, String filename) {
    return Printing.layoutPdf(onLayout: (format) async => bytes, name: filename);
  }
}
