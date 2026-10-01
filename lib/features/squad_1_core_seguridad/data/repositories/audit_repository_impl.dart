import '../../domain/models/audit_log_entry.dart';
import '../../domain/models/change_history_entry.dart';
import '../../domain/repositories/audit_repository.dart';
import '../../domain/services/audit_service.dart';
import '../datasources/in_memory_store.dart';

/// Implementación en memoria del contrato de auditoría inmutable.
///
/// Replica el trigger `fn_prevent_audit_tampering` del esquema PostgreSQL:
/// no expone ningún camino para editar o borrar una entrada ya escrita.
class AuditRepositoryImpl implements AuditRepository {
  AuditRepositoryImpl(this._store);

  final InMemoryStore _store;

  @override
  Future<AuditLogEntry> append(AuditLogEntry entry) async {
    _store.auditLogs.add(entry);
    return entry;
  }

  @override
  String lastHash(String tenantId) => _store.lastAuditHashOf(tenantId);

  @override
  Future<List<AuditLogEntry>> queryLogs({
    required String tenantId,
    DateTime? from,
    DateTime? to,
    String? modulo,
    String? userId,
    String? ipAddress,
  }) async {
    return _store.auditLogs.where((log) {
      if (log.tenantId != tenantId) return false;
      if (from != null && log.createdAt.isBefore(from)) return false;
      if (to != null && log.createdAt.isAfter(to)) return false;
      if (modulo != null && modulo.isNotEmpty && log.entidad != modulo) return false;
      if (userId != null && userId.isNotEmpty && log.userId != userId) return false;
      if (ipAddress != null && ipAddress.isNotEmpty && log.ipAddress != ipAddress) {
        return false;
      }
      return true;
    }).toList();
  }

  @override
  bool verifyChain(String tenantId) {
    final chain = _store.auditLogs.where((log) => log.tenantId == tenantId).toList();
    var expectedPrevious = AuditService.genesisHash;
    for (final entry in chain) {
      if (entry.previousHash != expectedPrevious) return false;

      // Recomputa el hash a partir del contenido actual del registro: si
      // alguien alteró cualquier campo (p. ej. `accion`) sin recalcular el
      // hash, la comparación falla aunque el enlace previousHash siga intacto.
      final recomputed = AuditService.computeHash(
        id: entry.id,
        tenantId: entry.tenantId,
        userId: entry.userId,
        accion: entry.accion,
        entidad: entry.entidad,
        entidadId: entry.entidadId,
        ipAddress: entry.ipAddress,
        createdAt: entry.createdAt,
        payloadAnterior: entry.payloadAnterior,
        payloadNuevo: entry.payloadNuevo,
        previousHash: entry.previousHash,
      );
      if (recomputed != entry.hash) return false;

      expectedPrevious = entry.hash;
    }
    return true;
  }

  @override
  Future<ChangeHistoryEntry> appendChangeHistory(ChangeHistoryEntry entry) async {
    _store.changeHistory.add(entry);
    return entry;
  }

  @override
  Future<List<ChangeHistoryEntry>> historyOf({
    required String tenantId,
    required String recordId,
  }) async {
    final entries = _store.changeHistory
        .where((e) => e.tenantId == tenantId && e.recordId == recordId)
        .toList()
      ..sort((a, b) => a.version.compareTo(b.version));
    return entries;
  }
}
