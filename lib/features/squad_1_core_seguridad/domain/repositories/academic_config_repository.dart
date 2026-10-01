import '../../shared/actor_context.dart';
import '../models/academic_period.dart';
import '../models/academic_year.dart';
import '../models/grade_section.dart';
import '../models/grading_scale.dart';
import '../models/institutional_params.dart';

/// Contrato de configuración escolar — Módulo 3 (RF-10..RF-14).
/// Unifica año lectivo, periodos, estructura de grados/secciones, escala
/// dual de calificación y parámetros institucionales globales, siguiendo
/// la agrupación por módulo que usa el propio SDD del Squad 1.
abstract class AcademicConfigRepository {
  // RF-10: Año lectivo.
  Future<List<AcademicYear>> listAcademicYears(String tenantId);
  Future<AcademicYear?> activeAcademicYear(String tenantId);

  /// Lanza [BusinessRuleFailure] si ya existe un año lectivo activo (RF-10
  /// exige exactamente uno abierto por sede).
  Future<AcademicYear> openAcademicYear({
    required String tenantId,
    required int anio,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required ActorContext actor,
  });

  // RF-11: Periodos académicos (bimestres).
  Future<List<AcademicPeriod>> listPeriods(String academicYearId);
  Future<AcademicPeriod> createPeriod({
    required String academicYearId,
    required String nombre,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required DateTime fechaLimiteNotas,
    required int toleranciaDias,
    required ActorContext actor,
  });
  Future<AcademicPeriod> closePeriod(String periodId, {required ActorContext actor});

  // RF-12: Niveles, grados y secciones.
  Future<List<GradeSection>> listGradeSections(String academicYearId);
  Future<GradeSection> createGradeSection({
    required String academicYearId,
    required String nivelEducativo,
    required String grado,
    required String seccion,
    required int aforoMaximo,
    required Shift turno,
    required ActorContext actor,
  });

  // RF-13: Escala dual de calificación.
  Future<List<GradingScale>> listGradingScales(String tenantId);
  Future<GradingScale> upsertGradingScale(GradingScale scale, {required ActorContext actor});

  // RF-14: Parámetros institucionales / membrete.
  Future<InstitutionalParams> getInstitutionalParams(String tenantId);
  Future<InstitutionalParams> updateInstitutionalParams(
    InstitutionalParams params, {
    required ActorContext actor,
  });
}
