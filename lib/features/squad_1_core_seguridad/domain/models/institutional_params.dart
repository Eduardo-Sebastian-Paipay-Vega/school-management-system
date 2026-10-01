import 'dart:typed_data';

/// Entidad `parametros_globales` (RF-14): membrete institucional consumido
/// por las boletas y actas de Squad 5, y por el pie de página público.
class InstitutionalParams {
  const InstitutionalParams({
    required this.tenantId,
    required this.nombreOficial,
    required this.lemaDelAnio,
    required this.directorGeneralNombre,
    required this.piePaginaBoletas,
    required this.updatedAt,
    this.escudoBytes,
    this.escudoFileName,
  });

  final String tenantId;
  final String nombreOficial;
  final String lemaDelAnio;
  final String directorGeneralNombre;
  final String piePaginaBoletas;
  final DateTime updatedAt;
  final Uint8List? escudoBytes;
  final String? escudoFileName;

  InstitutionalParams copyWith({
    String? nombreOficial,
    String? lemaDelAnio,
    String? directorGeneralNombre,
    String? piePaginaBoletas,
    Uint8List? escudoBytes,
    String? escudoFileName,
    DateTime? updatedAt,
  }) {
    return InstitutionalParams(
      tenantId: tenantId,
      nombreOficial: nombreOficial ?? this.nombreOficial,
      lemaDelAnio: lemaDelAnio ?? this.lemaDelAnio,
      directorGeneralNombre: directorGeneralNombre ?? this.directorGeneralNombre,
      piePaginaBoletas: piePaginaBoletas ?? this.piePaginaBoletas,
      escudoBytes: escudoBytes ?? this.escudoBytes,
      escudoFileName: escudoFileName ?? this.escudoFileName,
      updatedAt: updatedAt ?? DateTime.now().toUtc(),
    );
  }
}
