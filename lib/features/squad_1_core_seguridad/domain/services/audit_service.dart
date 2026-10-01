import 'dart:convert';
import 'package:crypto/crypto.dart';

import '../../shared/clock.dart';
import '../../shared/id_generator.dart';
import '../models/audit_log_entry.dart';
import '../models/change_history_entry.dart';
import '../models/session_tokens.dart';
import '../repositories/audit_repository.dart';

/// Accion estándar de auditoría propuesta para eventos de seguridad (RF-65).
class AuditActions {
  static const String loginSuccess = 'AUTH_LOGIN_SUCCESS';
  static const String loginFailed = 'AUTH_LOGIN_FAILED';
  static const String logout = 'AUTH_LOGOUT';
  static const String sessionExpired = 'AUTH_SESSION_TIMEOUT_EXPIRE';
  static const String passwordResetRequested = 'AUTH_PASSWORD_RESET_REQUESTED';
  static const String passwordResetCompleted = 'AUTH_PASSWORD_RESET_COMPLETED';
  static const String passwordChanged = 'AUTH_PASSWORD_CHANGED';
  static const String accessDenied = 'RBAC_ACCESS_DENIED';
  static const String rolesUpdated = 'RBAC_ROLES_UPDATED';
  static const String userCreated = 'USER_CREATED';
  static const String usersImported = 'USER_BULK_IMPORTED';
  static const String sedeCreated = 'SEDE_CREATED';
  static const String academicYearOpened = 'ACADEMIC_YEAR_OPENED';
  static const String periodCreated = 'ACADEMIC_PERIOD_CREATED';
  static const String periodClosed = 'ACADEMIC_PERIOD_CLOSED';
  static const String gradeSectionCreated = 'GRADE_SECTION_CREATED';
  static const String institutionalParamsUpdated = 'INSTITUTIONAL_PARAMS_UPDATED';
  static const String gradingScaleUpdated = 'GRADING_SCALE_UPDATED';
  static const String auditQueried = 'AUDIT_LOG_QUERIED';
  static const String auditExported = 'AUDIT_LOG_EXPORTED';
  static const String privacyUnmasked = 'PRIVACY_FIELD_UNMASKED';

  const AuditActions._();
}

/// Servicio de dominio de auditoría inmutable (RF-65, RF-66, RF-67).
///
/// Encadena cada registro con el hash SHA-256 del anterior
/// (`hash = SHA256(previousHash + datosCanonicos)`), replicando en memoria
/// el trigger `fn_prevent_audit_tampering` del esquema PostgreSQL real
/// (`esquema_datos.sql`): una vez escrita, una entrada no se puede alterar.
class AuditService {
  AuditService({
    required AuditRepository repository,
    Clock clock = const SystemClock(),
    IdGenerator? idGenerator,
  })  : _repository = repository,
        _clock = clock,
        _ids = idGenerator ?? IdGenerator();

  final AuditRepository _repository;
  final Clock _clock;
  final IdGenerator _ids;

  static const String genesisHash = '0' * 64;

  /// Hash canónico de una entrada de auditoría: `SHA256(previousHash +
  /// datos_del_registro)`. Es una función pura, reutilizada tanto para
  /// emitir cada nuevo registro como para que `AuditRepository.verifyChain`
  /// pueda recomputar y comparar cada entrada existente (detectando no
  /// solo enlaces rotos entre registros, sino también contenido alterado
  /// de un registro individual).
  static String computeHash({
    required String id,
    required String tenantId,
    required String? userId,
    required String accion,
    required String entidad,
    required String? entidadId,
    required String ipAddress,
    required DateTime createdAt,
    required Map<String, dynamic>? payloadAnterior,
    required Map<String, dynamic>? payloadNuevo,
    required String previousHash,
  }) {
    final canonical = jsonEncode({
      'id': id,
      'tenantId': tenantId,
      'userId': userId,
      'accion': accion,
      'entidad': entidad,
      'entidadId': entidadId,
      'ipAddress': ipAddress,
      'createdAt': createdAt.toIso8601String(),
      'payloadAnterior': payloadAnterior,
      'payloadNuevo': payloadNuevo,
      'previousHash': previousHash,
    });
    return sha256.convert(utf8.encode(canonical)).toString();
  }

  /// RF-65: registra un evento de auditoría inmutable.
  Future<AuditLogEntry> record({
    required String tenantId,
    required String accion,
    required String entidad,
    required String ipAddress,
    required String userAgent,
    String? userId,
    String usuarioDisplay = 'Sistema',
    String? entidadId,
    Map<String, dynamic>? payloadAnterior,
    Map<String, dynamic>? payloadNuevo,
  }) {
    final previousHash = _repository.lastHash(tenantId);
    final createdAt = _clock.now();
    final id = _ids.next();
    final hash = computeHash(
      id: id,
      tenantId: tenantId,
      userId: userId,
      accion: accion,
      entidad: entidad,
      entidadId: entidadId,
      ipAddress: ipAddress,
      createdAt: createdAt,
      payloadAnterior: payloadAnterior,
      payloadNuevo: payloadNuevo,
      previousHash: previousHash,
    );

    final entry = AuditLogEntry(
      id: id,
      tenantId: tenantId,
      userId: userId,
      usuarioDisplay: usuarioDisplay,
      accion: accion,
      entidad: entidad,
      entidadId: entidadId,
      ipAddress: ipAddress,
      userAgent: userAgent,
      payloadAnterior: payloadAnterior,
      payloadNuevo: payloadNuevo,
      createdAt: createdAt,
      previousHash: previousHash,
      hash: hash,
    );
    return _repository.append(entry);
  }

  Future<AuditLogEntry> recordSession(
    AuthSession session, {
    required String accion,
    required String entidad,
    required String ipAddress,
    required String userAgent,
    String? entidadId,
    Map<String, dynamic>? payloadAnterior,
    Map<String, dynamic>? payloadNuevo,
  }) {
    return record(
      tenantId: session.tenantId,
      accion: accion,
      entidad: entidad,
      ipAddress: ipAddress,
      userAgent: userAgent,
      userId: session.userId,
      usuarioDisplay: session.nombreCompleto,
      entidadId: entidadId,
      payloadAnterior: payloadAnterior,
      payloadNuevo: payloadNuevo,
    );
  }

  /// RF-67: la propia consulta forense queda auditada ("se audita a sí misma").
  Future<List<AuditLogEntry>> queryLogsAudited({
    required AuthSession requestedBy,
    required String ipAddress,
    required String userAgent,
    DateTime? from,
    DateTime? to,
    String? modulo,
    String? userId,
    String? ipFilter,
  }) async {
    final results = await _repository.queryLogs(
      tenantId: requestedBy.tenantId,
      from: from,
      to: to,
      modulo: modulo,
      userId: userId,
      ipAddress: ipFilter,
    );
    await recordSession(
      requestedBy,
      accion: AuditActions.auditQueried,
      entidad: 'audit_logs',
      ipAddress: ipAddress,
      userAgent: userAgent,
      payloadNuevo: {
        'from': from?.toIso8601String(),
        'to': to?.toIso8601String(),
        'modulo': modulo,
        'userId': userId,
      },
    );
    return results..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  bool verifyChain(String tenantId) => _repository.verifyChain(tenantId);

  /// RF-66: agrega una versión trazada al historial de una nota/asistencia.
  Future<ChangeHistoryEntry> recordChange({
    required AuthSession author,
    required TrackedEntity entity,
    required String recordId,
    required String previousValue,
    required String newValue,
    required String justification,
    required int nextVersion,
  }) {
    final entry = ChangeHistoryEntry(
      id: _ids.next(),
      tenantId: author.tenantId,
      entity: entity,
      recordId: recordId,
      version: nextVersion,
      authorUserId: author.userId,
      authorDisplay: author.nombreCompleto,
      previousValue: previousValue,
      newValue: newValue,
      justification: justification,
      changedAt: _clock.now(),
    );
    return _repository.appendChangeHistory(entry);
  }

  Future<List<ChangeHistoryEntry>> changeHistoryOf({
    required String tenantId,
    required String recordId,
  }) {
    return _repository.historyOf(tenantId: tenantId, recordId: recordId);
  }
}
