/// Entidad afectada por un cambio trazado (RF-66).
enum TrackedEntity {
  nota('NOTA'),
  asistencia('ASISTENCIA');

  const TrackedEntity(this.code);
  final String code;
}

/// Entidad `historial_cambios_notas` — versión incremental de cada
/// modificación sobre una nota o asistencia, con autor y justificación
/// obligatoria. Inmutable una vez escrita (no se sobreescribe ni se borra).
class ChangeHistoryEntry {
  const ChangeHistoryEntry({
    required this.id,
    required this.tenantId,
    required this.entity,
    required this.recordId,
    required this.version,
    required this.authorUserId,
    required this.authorDisplay,
    required this.previousValue,
    required this.newValue,
    required this.justification,
    required this.changedAt,
  });

  final String id;
  final String tenantId;
  final TrackedEntity entity;
  final String recordId;
  final int version;
  final String authorUserId;
  final String authorDisplay;
  final String previousValue;
  final String newValue;
  final String justification;
  final DateTime changedAt;
}
