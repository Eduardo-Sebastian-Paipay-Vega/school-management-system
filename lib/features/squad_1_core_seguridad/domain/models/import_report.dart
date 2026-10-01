/// Fila rechazada durante la importación masiva (RF-06) con su motivo.
class ImportRowError {
  const ImportRowError({
    required this.rowNumber,
    required this.rawData,
    required this.reason,
  });

  final int rowNumber;
  final String rawData;
  final String reason;
}

/// Resultado de `POST /users/import` (RF-06): resumen cuantitativo +
/// detalle descargable de las filas rechazadas, según el criterio de
/// aceptación oficial ("198 válidas, 2 rechazadas con su motivo").
class ImportReport {
  const ImportReport({
    required this.totalRows,
    required this.importedCount,
    required this.rejected,
    required this.finishedAt,
  });

  final int totalRows;
  final int importedCount;
  final List<ImportRowError> rejected;
  final DateTime finishedAt;

  int get rejectedCount => rejected.length;
}
