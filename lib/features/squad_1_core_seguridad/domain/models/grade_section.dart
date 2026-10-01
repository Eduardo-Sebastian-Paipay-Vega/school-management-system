/// Turno de dictado de una sección (RF-12).
enum Shift {
  manana('Mañana'),
  tarde('Tarde');

  const Shift(this.label);
  final String label;
}

/// Entidad `grados_secciones`: nivel educativo + grado + sección física
/// con aforo máximo (RF-12). La matrícula real (contar vacantes ocupadas)
/// es responsabilidad de Squad 2; este módulo solo expone la configuración
/// y la regla de aforo vía `AcademicCalendarService.hasCapacity`.
class GradeSection {
  const GradeSection({
    required this.id,
    required this.academicYearId,
    required this.nivelEducativo,
    required this.grado,
    required this.seccion,
    required this.aforoMaximo,
    required this.turno,
  });

  final String id;
  final String academicYearId;
  final String nivelEducativo;
  final String grado;
  final String seccion;
  final int aforoMaximo;
  final Shift turno;

  String get etiqueta => '$grado "$seccion" — $nivelEducativo (${turno.label})';
}
