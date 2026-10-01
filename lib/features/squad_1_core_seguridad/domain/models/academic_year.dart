/// Entidad `anios_lectivos` (RF-10). Solo puede existir un año lectivo
/// con `activo = true` por sede a la vez.
class AcademicYear {
  const AcademicYear({
    required this.id,
    required this.tenantId,
    required this.anio,
    required this.fechaInicio,
    required this.fechaFin,
    required this.activo,
  });

  final String id;
  final String tenantId;
  final int anio;
  final DateTime fechaInicio;
  final DateTime fechaFin;
  final bool activo;

  AcademicYear copyWith({bool? activo}) => AcademicYear(
        id: id,
        tenantId: tenantId,
        anio: anio,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        activo: activo ?? this.activo,
      );
}
