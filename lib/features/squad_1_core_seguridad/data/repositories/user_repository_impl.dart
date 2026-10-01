import '../../domain/models/import_report.dart';
import '../../domain/models/role.dart';
import '../../domain/models/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/services/audit_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/clock.dart';
import '../../shared/failures.dart';
import '../../shared/id_generator.dart';
import '../../shared/password_hasher.dart';
import '../../shared/validators.dart';
import '../datasources/in_memory_store.dart';

/// Implementación en memoria de administración de usuarios y directorio
/// (RF-05, RF-06, RF-08, RF-09) y de reasignación de roles (RF-04). Cada
/// mutación se audita (RF-65), replicando el `AuditInterceptor` del SDD.
class UserRepositoryImpl implements UserRepository {
  UserRepositoryImpl(
    this._store, {
    required AuditService auditService,
    Clock clock = const SystemClock(),
    IdGenerator? idGenerator,
    PasswordHasher? passwordHasher,
  })  : _auditService = auditService,
        _clock = clock,
        _ids = idGenerator ?? IdGenerator(),
        _hasher = passwordHasher ?? PasswordHasher();

  final InMemoryStore _store;
  final AuditService _auditService;
  final Clock _clock;
  final IdGenerator _ids;
  final PasswordHasher _hasher;

  @override
  Future<User> createUser({
    required String tenantId,
    required String dni,
    required String nombres,
    required String apellidos,
    required String email,
    required AppRole rolInicial,
    required ActorContext actor,
    String? telefono,
  }) async {
    if (!Validators.isValidDni(dni)) {
      throw const ValidationFailure('El DNI debe tener exactamente 8 dígitos numéricos.');
    }
    if (!Validators.isValidEmail(email)) {
      throw const ValidationFailure('Ingrese un correo electrónico institucional válido.');
    }
    if (_store.dniExists(tenantId, dni)) {
      throw ConflictFailure('Ya existe un usuario registrado con el DNI $dni.');
    }
    if (_store.emailExists(tenantId, email)) {
      throw ConflictFailure('Ya existe un usuario registrado con el correo $email.');
    }

    final now = _clock.now();
    // Credencial provisional: el propio DNI, forzando cambio en primer ingreso
    // (postcondición de RF-05: "requerimiento de cambio de clave en primer inicio").
    final provisionalPassword = 'Bienvenido$dni!';
    final user = User(
      id: _ids.next(),
      tenantId: tenantId,
      username: dni,
      dni: dni,
      email: email,
      passwordHash: _hasher.hash(provisionalPassword),
      nombres: nombres,
      apellidos: apellidos,
      roles: {rolInicial},
      estado: UserStatus.pendienteCambioClave,
      telefono: telefono,
      createdAt: now,
      updatedAt: now,
    );
    _store.usersById[user.id] = user;
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.userCreated,
      entidad: 'usuarios',
      entidadId: user.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'dni': dni, 'email': email, 'rol': rolInicial.code},
    );
    return user;
  }

  @override
  Future<ImportReport> importUsers({
    required String tenantId,
    required List<UserImportRow> rows,
    required ActorContext actor,
  }) async {
    final rejected = <ImportRowError>[];
    final toInsert = <User>[];
    final dniSeenInBatch = <String>{};
    final now = _clock.now();

    for (final row in rows) {
      final raw = '${row.dni},${row.nombres},${row.apellidos},${row.email},${row.rolCode}';
      String? reason;
      if (!Validators.isValidDni(row.dni)) {
        reason = 'DNI inválido (debe tener 8 dígitos numéricos).';
      } else if (!Validators.isValidEmail(row.email)) {
        reason = 'Correo electrónico con formato inválido.';
      } else if (row.nombres.trim().isEmpty || row.apellidos.trim().isEmpty) {
        reason = 'Nombres y apellidos son obligatorios.';
      } else if (_store.dniExists(tenantId, row.dni) || dniSeenInBatch.contains(row.dni)) {
        reason = 'DNI duplicado (ya existe en el sistema o repetido en el archivo).';
      } else {
        AppRole? role;
        try {
          role = AppRole.fromCode(row.rolCode.trim().toUpperCase());
        } catch (_) {
          reason = 'Rol "${row.rolCode}" no reconocido.';
        }
        if (role != null) {
          dniSeenInBatch.add(row.dni);
          toInsert.add(User(
            id: _ids.next(),
            tenantId: tenantId,
            username: row.dni,
            dni: row.dni,
            email: row.email,
            passwordHash: _hasher.hash('Bienvenido${row.dni}!'),
            nombres: row.nombres,
            apellidos: row.apellidos,
            roles: {role},
            estado: UserStatus.pendienteCambioClave,
            telefono: row.telefono,
            createdAt: now,
            updatedAt: now,
          ));
        }
      }
      if (reason != null) {
        rejected.add(ImportRowError(rowNumber: row.rowNumber, rawData: raw, reason: reason));
      }
    }

    // Inserción transaccional: todo el lote válido se aplica de una vez.
    for (final user in toInsert) {
      _store.usersById[user.id] = user;
    }

    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.usersImported,
      entidad: 'usuarios',
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {
        'totalFilas': rows.length,
        'importados': toInsert.length,
        'rechazados': rejected.length,
      },
    );

    return ImportReport(
      totalRows: rows.length,
      importedCount: toInsert.length,
      rejected: rejected,
      finishedAt: now,
    );
  }

  @override
  Future<({List<User> items, int totalItems})> searchDirectory({
    required String tenantId,
    String query = '',
    AppRole? role,
    UserStatus? estado,
    int page = 1,
    int pageSize = 20,
  }) async {
    final normalizedQuery = query.trim().toLowerCase();
    var results = _store.usersOfTenant(tenantId).where((u) {
      if (role != null && !u.roles.contains(role)) return false;
      if (estado != null && u.estado != estado) return false;
      if (normalizedQuery.isEmpty) return true;
      return u.nombres.toLowerCase().contains(normalizedQuery) ||
          u.apellidos.toLowerCase().contains(normalizedQuery) ||
          u.dni.contains(normalizedQuery);
    }).toList()
      ..sort((a, b) => a.apellidos.compareTo(b.apellidos));

    final totalItems = results.length;
    final start = ((page - 1) * pageSize).clamp(0, results.length);
    final end = (start + pageSize).clamp(0, results.length);
    return (items: results.sublist(start, end), totalItems: totalItems);
  }

  @override
  Future<User?> findById(String userId) async => _store.usersById[userId];

  @override
  Future<User?> findByDniOrUsername(String tenantId, String value) async =>
      _store.userByDniOrUsername(tenantId, value);

  @override
  Future<User> updateRoles({
    required String userId,
    required Set<AppRole> roles,
    required ActorContext actor,
  }) async {
    final user = _store.usersById[userId];
    if (user == null) throw NotFoundFailure('Usuario no encontrado: $userId');
    final previousRoles = user.roles.map((r) => r.code).toList();
    final updated = user.copyWith(roles: roles, updatedAt: _clock.now());
    _store.usersById[userId] = updated;
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.rolesUpdated,
      entidad: 'usuario_roles',
      entidadId: userId,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadAnterior: {'roles': previousRoles},
      payloadNuevo: {'roles': roles.map((r) => r.code).toList()},
    );
    return updated;
  }

  @override
  Future<User> updateProfile({
    required String userId,
    String? telefono,
    String? fotoUrl,
  }) async {
    final user = _store.usersById[userId];
    if (user == null) throw NotFoundFailure('Usuario no encontrado: $userId');
    final updated = user.copyWith(
      telefono: telefono,
      fotoUrl: fotoUrl,
      updatedAt: _clock.now(),
    );
    _store.usersById[userId] = updated;
    return updated;
  }

  @override
  Future<User> updatePasswordHash({required String userId, required String passwordHash}) async {
    final user = _store.usersById[userId];
    if (user == null) throw NotFoundFailure('Usuario no encontrado: $userId');
    final updated = user.copyWith(
      passwordHash: passwordHash,
      estado: user.estado == UserStatus.pendienteCambioClave ? UserStatus.activo : user.estado,
      updatedAt: _clock.now(),
    );
    _store.usersById[userId] = updated;
    return updated;
  }
}
