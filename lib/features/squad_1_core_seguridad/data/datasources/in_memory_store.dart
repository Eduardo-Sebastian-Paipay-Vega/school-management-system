import '../../domain/models/academic_period.dart';
import '../../domain/models/academic_year.dart';
import '../../domain/models/audit_log_entry.dart';
import '../../domain/models/change_history_entry.dart';
import '../../domain/models/grade_section.dart';
import '../../domain/models/grading_scale.dart';
import '../../domain/models/institutional_params.dart';
import '../../domain/models/sede.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/models/user.dart';

/// Almacén en memoria compartido por todos los repositorios del Squad 1.
///
/// Sustituye a PostgreSQL + Redis para esta demo Flutter-only. Cada
/// repositorio (`data/repositories/*_impl.dart`) opera exclusivamente sobre
/// esta clase, de modo que reemplazarla por clientes HTTP reales en el
/// futuro no requiere tocar `domain/` ni `presentation/`.
class InMemoryStore {
  // Multi-tenant (RF-07).
  final Map<String, Sede> sedesById = {};

  // Usuarios (RF-05, RF-06, RF-08, RF-09).
  final Map<String, User> usersById = {};

  // Configuración escolar (RF-10..RF-14).
  final Map<String, AcademicYear> academicYearsById = {};
  final Map<String, List<AcademicPeriod>> periodsByYearId = {};
  final Map<String, List<GradeSection>> sectionsByYearId = {};
  final Map<String, List<GradingScale>> gradingScalesByTenantId = {};
  final Map<String, InstitutionalParams> institutionalParamsByTenantId = {};

  // Auditoría inmutable (RF-65, RF-66, RF-67).
  final List<AuditLogEntry> auditLogs = [];
  final List<ChangeHistoryEntry> changeHistory = [];

  // Sesiones (RF-01, RF-02).
  /// jti revocado → expiración remanente del access token (equivalente al
  /// TTL de la lista negra de Redis descrita en el SDD).
  final Map<String, DateTime> revokedJtiExpiry = {};

  /// Intentos de login fallidos por clave `tenantId|username` (RF-01: máx.
  /// 5 intentos / 15 min).
  final Map<String, List<DateTime>> failedLoginAttempts = {};

  /// Restablecimiento de contraseña (RF-03): hash del token → solicitud.
  final Map<String, PasswordResetRequest> passwordResetsByTokenHash = {};

  String lastAuditHashOf(String tenantId) {
    for (var i = auditLogs.length - 1; i >= 0; i--) {
      if (auditLogs[i].tenantId == tenantId) return auditLogs[i].hash;
    }
    return '0' * 64;
  }

  List<User> usersOfTenant(String tenantId) =>
      usersById.values.where((u) => u.tenantId == tenantId).toList();

  User? userByDniOrUsername(String tenantId, String value) {
    final normalized = value.trim();
    for (final user in usersOfTenant(tenantId)) {
      if (user.dni == normalized || user.username == normalized) return user;
    }
    return null;
  }

  bool dniExists(String tenantId, String dni) =>
      usersOfTenant(tenantId).any((u) => u.dni == dni);

  bool emailExists(String tenantId, String email) => usersOfTenant(
        tenantId,
      ).any((u) => u.email.toLowerCase() == email.toLowerCase());
}
