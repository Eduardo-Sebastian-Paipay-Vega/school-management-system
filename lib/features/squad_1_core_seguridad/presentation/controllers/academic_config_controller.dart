import 'package:flutter/foundation.dart';

import '../../domain/models/academic_period.dart';
import '../../domain/models/academic_year.dart';
import '../../domain/models/grade_section.dart';
import '../../domain/models/grading_scale.dart';
import '../../domain/models/institutional_params.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/repositories/academic_config_repository.dart';
import '../../domain/services/access_control_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Configuración escolar — Módulo 3 (RF-10 año lectivo, RF-11 periodos,
/// RF-12 grados/secciones, RF-13 escala dual, RF-14 parámetros/membrete).
/// Cada mutación exige su permiso RBAC (RF-04) antes de tocar el repositorio.
class AcademicConfigController extends ChangeNotifier {
  AcademicConfigController({
    required AcademicConfigRepository repository,
    required AccessControlService accessControl,
  })  : _repository = repository,
        _accessControl = accessControl;

  final AcademicConfigRepository _repository;
  final AccessControlService _accessControl;

  bool isLoading = false;
  String? errorMessage;

  AcademicYear? activeYear;
  List<AcademicYear> years = const [];
  List<AcademicPeriod> periods = const [];
  List<GradeSection> gradeSections = const [];
  List<GradingScale> gradingScales = const [];
  InstitutionalParams? institutionalParams;

  Future<void> loadAll(String tenantId) async {
    isLoading = true;
    notifyListeners();
    years = await _repository.listAcademicYears(tenantId);
    activeYear = await _repository.activeAcademicYear(tenantId);
    if (activeYear != null) {
      periods = await _repository.listPeriods(activeYear!.id);
      gradeSections = await _repository.listGradeSections(activeYear!.id);
    }
    gradingScales = await _repository.listGradingScales(tenantId);
    try {
      institutionalParams = await _repository.getInstitutionalParams(tenantId);
    } on NotFoundFailure {
      institutionalParams = null;
    }
    isLoading = false;
    notifyListeners();
  }

  Future<bool> openAcademicYear({
    required AuthSession actingSession,
    required int anio,
    required DateTime fechaInicio,
    required DateTime fechaFin,
  }) => _run(actingSession, () async {
        await _authorize(actingSession, Permission.academicYearManage);
        await _repository.openAcademicYear(
          tenantId: actingSession.tenantId,
          anio: anio,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          actor: _actorFrom(actingSession),
        );
        await loadAll(actingSession.tenantId);
      });

  Future<bool> createPeriod({
    required AuthSession actingSession,
    required String nombre,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required DateTime fechaLimiteNotas,
    required int toleranciaDias,
  }) => _run(actingSession, () async {
        await _authorize(actingSession, Permission.academicPeriodManage);
        final year = activeYear;
        if (year == null) {
          throw const BusinessRuleFailure('Debe aperturar un año lectivo antes de crear periodos.');
        }
        await _repository.createPeriod(
          academicYearId: year.id,
          nombre: nombre,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          fechaLimiteNotas: fechaLimiteNotas,
          toleranciaDias: toleranciaDias,
          actor: _actorFrom(actingSession),
        );
        await loadAll(actingSession.tenantId);
      });

  Future<bool> closePeriod({required AuthSession actingSession, required String periodId}) =>
      _run(actingSession, () async {
        await _authorize(actingSession, Permission.academicPeriodManage);
        await _repository.closePeriod(periodId, actor: _actorFrom(actingSession));
        await loadAll(actingSession.tenantId);
      });

  Future<bool> createGradeSection({
    required AuthSession actingSession,
    required String nivelEducativo,
    required String grado,
    required String seccion,
    required int aforoMaximo,
    required Shift turno,
  }) => _run(actingSession, () async {
        await _authorize(actingSession, Permission.gradeSectionsManage);
        final year = activeYear;
        if (year == null) {
          throw const BusinessRuleFailure('Debe aperturar un año lectivo antes de crear secciones.');
        }
        await _repository.createGradeSection(
          academicYearId: year.id,
          nivelEducativo: nivelEducativo,
          grado: grado,
          seccion: seccion,
          aforoMaximo: aforoMaximo,
          turno: turno,
          actor: _actorFrom(actingSession),
        );
        await loadAll(actingSession.tenantId);
      });

  Future<bool> saveGradingScale({
    required AuthSession actingSession,
    required GradingScale scale,
  }) => _run(actingSession, () async {
        await _authorize(actingSession, Permission.gradingScaleManage);
        await _repository.upsertGradingScale(scale, actor: _actorFrom(actingSession));
        await loadAll(actingSession.tenantId);
      });

  Future<bool> saveInstitutionalParams({
    required AuthSession actingSession,
    required InstitutionalParams params,
  }) => _run(actingSession, () async {
        await _authorize(actingSession, Permission.institutionalParamsManage);
        await _repository.updateInstitutionalParams(params, actor: _actorFrom(actingSession));
        await loadAll(actingSession.tenantId);
      });

  Future<bool> _run(AuthSession session, Future<void> Function() action) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await action();
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _authorize(AuthSession session, Permission permission) {
    return _accessControl.authorize(
      session,
      permission,
      ipAddress: ClientContext.instance.ipAddress,
      userAgent: ClientContext.userAgent,
    );
  }

  ActorContext _actorFrom(AuthSession session) => ActorContext(
        session: session,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
}
