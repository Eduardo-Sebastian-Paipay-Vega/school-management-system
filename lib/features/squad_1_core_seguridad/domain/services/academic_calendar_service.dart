import '../../shared/clock.dart';
import '../models/academic_year.dart';
import '../repositories/academic_config_repository.dart';

/// Fachada de solo consulta sobre la configuración escolar (RF-10..RF-12),
/// pensada para que otros squads la consuman sin duplicar reglas ni violar
/// el aislamiento multi-tenant (RF-07): toda consulta exige `tenantId`.
/// - Squad 3 usa [isGradeEditingAllowed] antes de aceptar un guardado de notas.
/// - Squad 2 usa [hasCapacity] antes de confirmar una matrícula.
class AcademicCalendarService {
  AcademicCalendarService({
    required AcademicConfigRepository repository,
    Clock clock = const SystemClock(),
  })  : _repository = repository,
        _clock = clock;

  final AcademicConfigRepository _repository;
  final Clock _clock;

  Future<AcademicYear?> activeYear(String tenantId) => _repository.activeAcademicYear(tenantId);

  /// RF-11: un periodo cerrado, o cuya fecha límite (+ tolerancia) ya pasó,
  /// bloquea la edición ordinaria de notas.
  Future<bool> isGradeEditingAllowed({
    required String tenantId,
    required String academicYearId,
    required String periodId,
    DateTime? at,
  }) async {
    final moment = at ?? _clock.now();
    final periods = await _repository.listPeriods(academicYearId);
    for (final period in periods) {
      if (period.id == periodId) return period.allowsGradeEditingAt(moment);
    }
    return false;
  }

  /// RF-12: valida el aforo máximo de una sección frente al conteo de
  /// matriculados que administra Squad 2.
  Future<bool> hasCapacity({
    required String academicYearId,
    required String sectionId,
    required int currentlyEnrolled,
  }) async {
    final sections = await _repository.listGradeSections(academicYearId);
    for (final section in sections) {
      if (section.id == sectionId) return currentlyEnrolled < section.aforoMaximo;
    }
    return false;
  }
}
