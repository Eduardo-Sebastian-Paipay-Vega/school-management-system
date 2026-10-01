/// Estado del periodo académico (RF-11).
enum PeriodStatus {
  planificado('PLANIFICADO'),
  enCurso('EN_CURSO'),
  cerrado('CERRADO');

  const PeriodStatus(this.code);
  final String code;
}

/// Entidad `periodos_academicos` — bimestres/trimestres del año lectivo.
/// `Squad 3` consulta `fechaLimiteNotas` + `toleranciaDias` para bloquear
/// la edición de notas fuera de plazo (RF-11, RF-42 de Squad 3).
class AcademicPeriod {
  const AcademicPeriod({
    required this.id,
    required this.academicYearId,
    required this.nombre,
    required this.fechaInicio,
    required this.fechaFin,
    required this.fechaLimiteNotas,
    required this.toleranciaDias,
    required this.estado,
  });

  final String id;
  final String academicYearId;
  final String nombre;
  final DateTime fechaInicio;
  final DateTime fechaFin;
  final DateTime fechaLimiteNotas;
  final int toleranciaDias;
  final PeriodStatus estado;

  /// Fecha tope real de edición de notas, incluyendo la tolerancia para
  /// actas extraordinarias mencionada en el enunciado normativo de RF-11.
  DateTime get fechaLimiteConTolerancia =>
      fechaLimiteNotas.add(Duration(days: toleranciaDias));

  bool allowsGradeEditingAt(DateTime moment) {
    if (estado == PeriodStatus.cerrado) return false;
    return moment.isBefore(fechaLimiteConTolerancia);
  }

  AcademicPeriod copyWith({PeriodStatus? estado}) => AcademicPeriod(
        id: id,
        academicYearId: academicYearId,
        nombre: nombre,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        fechaLimiteNotas: fechaLimiteNotas,
        toleranciaDias: toleranciaDias,
        estado: estado ?? this.estado,
      );
}
