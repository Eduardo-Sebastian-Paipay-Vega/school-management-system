import 'role.dart';

/// `estado_usuario_enum` del DDL de `esquema_datos.sql`.
enum UserStatus {
  activo('ACTIVO'),
  inactivo('INACTIVO'),
  bloqueado('BLOQUEADO'),
  pendienteCambioClave('PENDIENTE_CAMBIO_CLAVE');

  const UserStatus(this.code);
  final String code;
}

/// Entidad `usuarios` (tabla `usuarios`, RF-01, RF-05..RF-09).
class User {
  const User({
    required this.id,
    required this.tenantId,
    required this.username,
    required this.dni,
    required this.email,
    required this.passwordHash,
    required this.nombres,
    required this.apellidos,
    required this.roles,
    required this.estado,
    required this.createdAt,
    required this.updatedAt,
    this.telefono,
    this.fotoUrl,
  });

  final String id;
  final String tenantId;
  final String username;
  final String dni;
  final String email;
  final String passwordHash;
  final String nombres;
  final String apellidos;
  final Set<AppRole> roles;
  final UserStatus estado;
  final String? telefono;
  final String? fotoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  String get nombreCompleto => '$nombres $apellidos';

  bool get isActive => estado == UserStatus.activo;

  User copyWith({
    String? username,
    String? email,
    String? passwordHash,
    String? nombres,
    String? apellidos,
    Set<AppRole>? roles,
    UserStatus? estado,
    String? telefono,
    String? fotoUrl,
    DateTime? updatedAt,
  }) {
    return User(
      id: id,
      tenantId: tenantId,
      username: username ?? this.username,
      dni: dni,
      email: email ?? this.email,
      passwordHash: passwordHash ?? this.passwordHash,
      nombres: nombres ?? this.nombres,
      apellidos: apellidos ?? this.apellidos,
      roles: roles ?? this.roles,
      estado: estado ?? this.estado,
      telefono: telefono ?? this.telefono,
      fotoUrl: fotoUrl ?? this.fotoUrl,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
