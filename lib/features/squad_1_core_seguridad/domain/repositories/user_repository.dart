import '../../shared/actor_context.dart';
import '../models/import_report.dart';
import '../models/role.dart';
import '../models/user.dart';

/// Fila cruda ya parseada de un archivo `.xlsx`/`.csv` (RF-06), previa a
/// la validación de negocio que ejecuta el repositorio.
class UserImportRow {
  const UserImportRow({
    required this.rowNumber,
    required this.dni,
    required this.nombres,
    required this.apellidos,
    required this.email,
    required this.rolCode,
    this.telefono,
  });

  final int rowNumber;
  final String dni;
  final String nombres;
  final String apellidos;
  final String email;
  final String rolCode;
  final String? telefono;
}

/// Contrato del directorio y administración de personal (RF-05, RF-06,
/// RF-08) y de la asignación de roles que el SDD traza a RF-04
/// (`PUT /users/:id/roles`).
abstract class UserRepository {
  /// RF-05: alta individual. Lanza [ConflictFailure] si el DNI o email
  /// ya existen en el tenant.
  Future<User> createUser({
    required String tenantId,
    required String dni,
    required String nombres,
    required String apellidos,
    required String email,
    required AppRole rolInicial,
    required ActorContext actor,
    String? telefono,
  });

  /// RF-06: inserción transaccional por lotes de filas ya parseadas y
  /// pre-validadas sintácticamente. Solo las filas válidas se insertan;
  /// las inválidas se reportan con su motivo.
  Future<ImportReport> importUsers({
    required String tenantId,
    required List<UserImportRow> rows,
    required ActorContext actor,
  });

  /// RF-08: búsqueda paginada por nombre/apellido/DNI con filtros de rol
  /// y estado, acotada al tenant activo.
  Future<({List<User> items, int totalItems})> searchDirectory({
    required String tenantId,
    String query = '',
    AppRole? role,
    UserStatus? estado,
    int page = 1,
    int pageSize = 20,
  });

  Future<User?> findById(String userId);

  Future<User?> findByDniOrUsername(String tenantId, String value);

  /// RBAC (RF-04, endpoint `PUT /users/:id/roles` del SDD).
  Future<User> updateRoles({
    required String userId,
    required Set<AppRole> roles,
    required ActorContext actor,
  });

  /// RF-09: actualización de teléfono y foto de perfil.
  Future<User> updateProfile({
    required String userId,
    String? telefono,
    String? fotoUrl,
  });

  Future<User> updatePasswordHash({required String userId, required String passwordHash});
}
