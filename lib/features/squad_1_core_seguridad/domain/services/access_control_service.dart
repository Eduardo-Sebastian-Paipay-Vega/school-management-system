import '../../shared/failures.dart';
import '../models/role.dart';
import '../models/session_tokens.dart';
import 'audit_service.dart';

/// Motor RBAC (RF-04): gobierna el acceso a cada pantalla/acción del
/// sistema según la matriz `RbacPolicy`. Cada intento denegado se registra
/// en la bitácora inmutable (RF-65), tal como exige la postcondición de
/// RF-04 ("intento de acceso denegado registrado en el log de seguridad").
class AccessControlService {
  AccessControlService({required AuditService auditService}) : _auditService = auditService;

  final AuditService _auditService;

  bool can(AuthSession session, Permission permission) {
    return RbacPolicy.grants(session.roles, permission);
  }

  /// Lanza [ForbiddenFailure] (HTTP 403) si el rol no tiene el permiso,
  /// registrando la infracción en auditoría antes de propagar el error.
  Future<void> authorize(
    AuthSession session,
    Permission permission, {
    required String ipAddress,
    required String userAgent,
  }) async {
    if (can(session, permission)) return;

    await _auditService.recordSession(
      session,
      accion: AuditActions.accessDenied,
      entidad: permission.name,
      ipAddress: ipAddress,
      userAgent: userAgent,
      payloadNuevo: {
        'rolesUsuario': session.roles.map((r) => r.code).toList(),
        'permisoRequerido': permission.name,
      },
    );

    throw ForbiddenFailure(
      'El rol ${session.roles.map((r) => r.label).join(", ")} no tiene el '
      'permiso "${permission.name}" requerido para esta operación.',
    );
  }
}
