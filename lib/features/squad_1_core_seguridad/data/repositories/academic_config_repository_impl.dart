import '../../domain/models/academic_period.dart';
import '../../domain/models/academic_year.dart';
import '../../domain/models/grade_section.dart';
import '../../domain/models/grading_scale.dart';
import '../../domain/models/institutional_params.dart';
import '../../domain/repositories/academic_config_repository.dart';
import '../../domain/services/audit_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/clock.dart';
import '../../shared/failures.dart';
import '../../shared/id_generator.dart';
import '../datasources/in_memory_store.dart';

/// Implementación en memoria de configuración escolar — Módulo 3
/// (RF-10 año lectivo, RF-11 periodos, RF-12 grados/secciones, RF-13
/// escala dual, RF-14 parámetros institucionales/membrete).
class AcademicConfigRepositoryImpl implements AcademicConfigRepository {
  AcademicConfigRepositoryImpl(
    this._store, {
    required AuditService auditService,
    Clock clock = const SystemClock(),
    IdGenerator? idGenerator,
  })  : _auditService = auditService,
        _clock = clock,
        _ids = idGenerator ?? IdGenerator();

  final InMemoryStore _store;
  final AuditService _auditService;
  final Clock _clock;
  final IdGenerator _ids;

  @override
  Future<List<AcademicYear>> listAcademicYears(String tenantId) async {
    return _store.academicYearsById.values.where((y) => y.tenantId == tenantId).toList()
      ..sort((a, b) => b.anio.compareTo(a.anio));
  }

  @override
  Future<AcademicYear?> activeAcademicYear(String tenantId) async {
    for (final year in _store.academicYearsById.values) {
      if (year.tenantId == tenantId && year.activo) return year;
    }
    return null;
  }

  @override
  Future<AcademicYear> openAcademicYear({
    required String tenantId,
    required int anio,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required ActorContext actor,
  }) async {
    final existingActive = await activeAcademicYear(tenantId);
    if (existingActive != null) {
      throw BusinessRuleFailure(
        'Ya existe el año lectivo ${existingActive.anio} abierto para esta sede. '
        'Ciérrelo antes de aperturar uno nuevo.',
      );
    }
    final year = AcademicYear(
      id: _ids.next(),
      tenantId: tenantId,
      anio: anio,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      activo: true,
    );
    _store.academicYearsById[year.id] = year;
    _store.periodsByYearId[year.id] = [];
    _store.sectionsByYearId[year.id] = [];

    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.academicYearOpened,
      entidad: 'anios_lectivos',
      entidadId: year.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'anio': anio},
    );
    return year;
  }

  @override
  Future<List<AcademicPeriod>> listPeriods(String academicYearId) async {
    return List.unmodifiable(_store.periodsByYearId[academicYearId] ?? const []);
  }

  @override
  Future<AcademicPeriod> createPeriod({
    required String academicYearId,
    required String nombre,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required DateTime fechaLimiteNotas,
    required int toleranciaDias,
    required ActorContext actor,
  }) async {
    if (!_store.academicYearsById.containsKey(academicYearId)) {
      throw NotFoundFailure('Año lectivo no encontrado: $academicYearId');
    }
    final period = AcademicPeriod(
      id: _ids.next(),
      academicYearId: academicYearId,
      nombre: nombre,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      fechaLimiteNotas: fechaLimiteNotas,
      toleranciaDias: toleranciaDias,
      estado: PeriodStatus.planificado,
    );
    _store.periodsByYearId.putIfAbsent(academicYearId, () => []).add(period);
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.periodCreated,
      entidad: 'periodos_academicos',
      entidadId: period.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'nombre': nombre, 'fechaLimiteNotas': fechaLimiteNotas.toIso8601String()},
    );
    return period;
  }

  @override
  Future<AcademicPeriod> closePeriod(String periodId, {required ActorContext actor}) async {
    for (final entry in _store.periodsByYearId.entries) {
      final index = entry.value.indexWhere((p) => p.id == periodId);
      if (index != -1) {
        final closed = entry.value[index].copyWith(estado: PeriodStatus.cerrado);
        entry.value[index] = closed;
        await _auditService.recordSession(
          actor.session,
          accion: AuditActions.periodClosed,
          entidad: 'periodos_academicos',
          entidadId: periodId,
          ipAddress: actor.ipAddress,
          userAgent: actor.userAgent,
          payloadNuevo: {'estado': PeriodStatus.cerrado.code},
        );
        return closed;
      }
    }
    throw NotFoundFailure('Periodo académico no encontrado: $periodId');
  }

  @override
  Future<List<GradeSection>> listGradeSections(String academicYearId) async {
    return List.unmodifiable(_store.sectionsByYearId[academicYearId] ?? const []);
  }

  @override
  Future<GradeSection> createGradeSection({
    required String academicYearId,
    required String nivelEducativo,
    required String grado,
    required String seccion,
    required int aforoMaximo,
    required Shift turno,
    required ActorContext actor,
  }) async {
    final existing = _store.sectionsByYearId[academicYearId] ?? [];
    final duplicated = existing.any(
      (s) => s.nivelEducativo == nivelEducativo && s.grado == grado && s.seccion == seccion,
    );
    if (duplicated) {
      throw ConflictFailure('La sección "$grado $seccion" de $nivelEducativo ya existe.');
    }
    final section = GradeSection(
      id: _ids.next(),
      academicYearId: academicYearId,
      nivelEducativo: nivelEducativo,
      grado: grado,
      seccion: seccion,
      aforoMaximo: aforoMaximo,
      turno: turno,
    );
    _store.sectionsByYearId.putIfAbsent(academicYearId, () => []).add(section);
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.gradeSectionCreated,
      entidad: 'grados_secciones',
      entidadId: section.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'grado': grado, 'seccion': seccion, 'aforoMaximo': aforoMaximo},
    );
    return section;
  }

  @override
  Future<List<GradingScale>> listGradingScales(String tenantId) async {
    return List.unmodifiable(_store.gradingScalesByTenantId[tenantId] ?? const []);
  }

  @override
  Future<GradingScale> upsertGradingScale(
    GradingScale scale, {
    required ActorContext actor,
  }) async {
    final list = _store.gradingScalesByTenantId.putIfAbsent(scale.tenantId, () => []);
    final index = list.indexWhere((s) => s.id == scale.id);
    if (index == -1) {
      list.add(scale);
    } else {
      list[index] = scale;
    }
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.gradingScaleUpdated,
      entidad: 'escalas_calificacion',
      entidadId: scale.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {
        'nivelEducativo': scale.nivelEducativo,
        'notaMinimaAprobatoria': scale.notaMinimaAprobatoria,
      },
    );
    return scale;
  }

  @override
  Future<InstitutionalParams> getInstitutionalParams(String tenantId) async {
    final params = _store.institutionalParamsByTenantId[tenantId];
    if (params == null) {
      throw NotFoundFailure('Parámetros institucionales no configurados para $tenantId.');
    }
    return params;
  }

  @override
  Future<InstitutionalParams> updateInstitutionalParams(
    InstitutionalParams params, {
    required ActorContext actor,
  }) async {
    final withTimestamp = params.copyWith(updatedAt: _clock.now());
    _store.institutionalParamsByTenantId[params.tenantId] = withTimestamp;
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.institutionalParamsUpdated,
      entidad: 'parametros_globales',
      entidadId: params.tenantId,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'lemaDelAnio': params.lemaDelAnio, 'nombreOficial': params.nombreOficial},
    );
    return withTimestamp;
  }
}
