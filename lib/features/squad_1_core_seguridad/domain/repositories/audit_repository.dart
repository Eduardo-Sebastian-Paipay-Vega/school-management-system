import '../models/audit_log_entry.dart';
import '../models/change_history_entry.dart';

/// Contrato de persistencia de auditoría — Módulo 12 (RF-65, RF-66, RF-67).
///
/// No expone ningún método de actualización o borrado: `AuditLogEntry` y
/// `ChangeHistoryEntry` son append-only por diseño (RF-65, RF-66). Intentar
/// sortear esto debe lanzar [ImmutableAuditViolation] en la implementación.
abstract class AuditRepository {
  /// RF-65: inserta la entrada calculando su lugar en la cadena de hashes.
  Future<AuditLogEntry> append(AuditLogEntry entry);

  String lastHash(String tenantId);

  /// RF-67: consulta forense filtrable, orden cronológico inverso.
  Future<List<AuditLogEntry>> queryLogs({
    required String tenantId,
    DateTime? from,
    DateTime? to,
    String? modulo,
    String? userId,
    String? ipAddress,
  });

  /// RF-65: verifica que la cadena de hashes no haya sido alterada.
  bool verifyChain(String tenantId);

  /// RF-66: agrega una versión al historial de cambios de una nota/asistencia.
  Future<ChangeHistoryEntry> appendChangeHistory(ChangeHistoryEntry entry);

  Future<List<ChangeHistoryEntry>> historyOf({
    required String tenantId,
    required String recordId,
  });
}
