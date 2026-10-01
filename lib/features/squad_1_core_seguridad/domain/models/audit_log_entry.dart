/// Entidad `audit_logs` / `logs_auditoria` (RF-65, RF-67).
///
/// Estrictamente append-only: no existe `copyWith` ni setters porque la
/// tabla real está protegida por un trigger de PostgreSQL que rechaza
/// `UPDATE`/`DELETE` (`fn_prevent_audit_tampering`, `sdd_squad_1.md` §3.2).
/// Cada entrada encadena el hash SHA-256 de la anterior (`previousHash`)
/// para que `AuditService.verifyChain()` pueda detectar manipulación.
class AuditLogEntry {
  const AuditLogEntry({
    required this.id,
    required this.tenantId,
    required this.userId,
    required this.usuarioDisplay,
    required this.accion,
    required this.entidad,
    required this.ipAddress,
    required this.userAgent,
    required this.createdAt,
    required this.previousHash,
    required this.hash,
    this.entidadId,
    this.payloadAnterior,
    this.payloadNuevo,
  });

  final String id;
  final String tenantId;
  final String? userId;
  final String usuarioDisplay;
  final String accion;
  final String entidad;
  final String? entidadId;
  final String ipAddress;
  final String userAgent;
  final Map<String, dynamic>? payloadAnterior;
  final Map<String, dynamic>? payloadNuevo;
  final DateTime createdAt;
  final String previousHash;
  final String hash;
}
