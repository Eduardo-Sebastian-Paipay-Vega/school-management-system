import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';

import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/models/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/services/audit_service.dart';
import '../../shared/clock.dart';
import '../../shared/failures.dart';
import '../../shared/id_generator.dart';
import '../../shared/jwt_codec.dart';
import '../../shared/password_hasher.dart';
import '../../shared/validators.dart';
import '../datasources/in_memory_store.dart';

/// Implementación en memoria de autenticación (RF-01, RF-02, RF-03, RF-09).
///
/// Ver la nota de [JwtCodec] y [PasswordHasher]: la firma criptográfica y
/// el hashing ocurren aquí solo para sostener la demo Flutter-only; en
/// producción ambas responsabilidades pertenecen al backend.
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(
    this._store, {
    required AuditService auditService,
    JwtCodec? jwtCodec,
    PasswordHasher? passwordHasher,
    Clock clock = const SystemClock(),
    IdGenerator? idGenerator,
    Random? random,
  })  : _auditService = auditService,
        _jwtCodec = jwtCodec ?? const JwtCodec('squad1-demo-secret-ssu-is480'),
        _hasher = passwordHasher ?? PasswordHasher(),
        _clock = clock,
        _ids = idGenerator ?? IdGenerator(),
        _random = random ?? Random.secure();

  static const Duration accessTtl = Duration(minutes: 15);
  static const Duration refreshTtl = Duration(days: 7);
  static const Duration rateLimitWindow = Duration(minutes: 15);
  static const int rateLimitMaxAttempts = 5;
  static const Duration resetTokenTtl = Duration(minutes: 30);

  final InMemoryStore _store;
  final AuditService _auditService;
  final JwtCodec _jwtCodec;
  final PasswordHasher _hasher;
  final Clock _clock;
  final IdGenerator _ids;
  final Random _random;

  @override
  Future<TokenPair> login({
    required String tenantModularCode,
    required String usernameOrDni,
    required String password,
    required String ipAddress,
    required String userAgent,
  }) async {
    if (usernameOrDni.trim().isEmpty || password.isEmpty) {
      throw const ValidationFailure('Ingrese usuario/DNI y contraseña.');
    }

    _enforceRateLimit(ipAddress);

    final sede = _store.sedesById.values
        .where((s) => s.codigoModular == tenantModularCode.trim())
        .toList();
    if (sede.isEmpty) {
      _registerFailedAttempt(ipAddress);
      throw const UnauthorizedFailure('Código de institución, usuario o contraseña inválidos.');
    }
    final tenantId = sede.first.id;

    final user = _store.userByDniOrUsername(tenantId, usernameOrDni);
    if (user == null) {
      _registerFailedAttempt(ipAddress);
      await _auditService.record(
        tenantId: tenantId,
        accion: AuditActions.loginFailed,
        entidad: 'usuarios',
        ipAddress: ipAddress,
        userAgent: userAgent,
        payloadNuevo: {'usuarioIntentado': usernameOrDni, 'motivo': 'usuario_no_encontrado'},
      );
      throw const UnauthorizedFailure('Código de institución, usuario o contraseña inválidos.');
    }

    if (user.estado == UserStatus.bloqueado || user.estado == UserStatus.inactivo) {
      await _auditService.record(
        tenantId: tenantId,
        userId: user.id,
        usuarioDisplay: user.nombreCompleto,
        accion: AuditActions.loginFailed,
        entidad: 'usuarios',
        ipAddress: ipAddress,
        userAgent: userAgent,
        payloadNuevo: {'motivo': 'cuenta_${user.estado.code.toLowerCase()}'},
      );
      throw UnauthorizedFailure(
        'La cuenta se encuentra ${user.estado.code.toLowerCase()}. Contacte al Administrador TI.',
      );
    }

    if (!_hasher.verify(password, user.passwordHash)) {
      _registerFailedAttempt(ipAddress);
      await _auditService.record(
        tenantId: tenantId,
        userId: user.id,
        usuarioDisplay: user.nombreCompleto,
        accion: AuditActions.loginFailed,
        entidad: 'usuarios',
        ipAddress: ipAddress,
        userAgent: userAgent,
        payloadNuevo: {'motivo': 'contrasena_incorrecta'},
      );
      throw const UnauthorizedFailure('Código de institución, usuario o contraseña inválidos.');
    }

    _store.failedLoginAttempts.remove(ipAddress);

    final now = _clock.now();
    final jti = _ids.next();
    final accessExpiresAt = now.add(accessTtl);
    final refreshExpiresAt = now.add(refreshTtl);

    final baseClaims = {
      'sub': user.id,
      'jti': jti,
      'tenant_id': tenantId,
      'username': user.username,
      'name': user.nombreCompleto,
      'roles': user.roles.map((r) => r.code).toList(),
      'iat': now.millisecondsSinceEpoch ~/ 1000,
    };
    final accessToken = _jwtCodec.encode({
      ...baseClaims,
      'type': 'access',
      'exp': accessExpiresAt.millisecondsSinceEpoch ~/ 1000,
    });
    final refreshToken = _jwtCodec.encode({
      ...baseClaims,
      'type': 'refresh',
      'exp': refreshExpiresAt.millisecondsSinceEpoch ~/ 1000,
    });

    await _auditService.record(
      tenantId: tenantId,
      userId: user.id,
      usuarioDisplay: user.nombreCompleto,
      accion: AuditActions.loginSuccess,
      entidad: 'usuarios',
      entidadId: user.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      payloadNuevo: {'roles': user.roles.map((r) => r.code).toList()},
    );

    return TokenPair(
      accessToken: accessToken,
      refreshToken: refreshToken,
      accessExpiresAt: accessExpiresAt,
      refreshExpiresAt: refreshExpiresAt,
    );
  }

  @override
  Future<void> logout({required String accessToken}) async {
    final claims = _jwtCodec.verifyAndDecode(accessToken);
    if (claims == null) return;
    final jti = claims['jti'] as String?;
    final exp = claims['exp'] as int?;
    if (jti == null || exp == null) return;
    _store.revokedJtiExpiry[jti] = DateTime.fromMillisecondsSinceEpoch(exp * 1000, isUtc: true);
  }

  @override
  Future<AuthSession?> sessionFromAccessToken(String accessToken) async {
    final claims = _jwtCodec.verifyAndDecode(accessToken);
    if (claims == null) return null;
    if (claims['type'] != 'access') return null;

    final jti = claims['jti'] as String?;
    final exp = claims['exp'] as int?;
    if (jti == null || exp == null) return null;

    final expiresAt = DateTime.fromMillisecondsSinceEpoch(exp * 1000, isUtc: true);
    if (_clock.now().isAfter(expiresAt)) return null;

    // Token revocado (RF-02): rechazo inmediato aunque no haya expirado.
    if (_store.revokedJtiExpiry.containsKey(jti)) return null;

    final iat = claims['iat'] as int;
    final roles = (claims['roles'] as List).map((c) => AppRole.fromCode(c as String)).toSet();

    return AuthSession(
      jti: jti,
      userId: claims['sub'] as String,
      tenantId: claims['tenant_id'] as String,
      username: claims['username'] as String,
      nombreCompleto: claims['name'] as String,
      roles: roles,
      issuedAt: DateTime.fromMillisecondsSinceEpoch(iat * 1000, isUtc: true),
      accessExpiresAt: expiresAt,
      accessToken: accessToken,
    );
  }

  @override
  Future<String> requestPasswordReset({required String dniOrEmail}) async {
    User? target;
    for (final user in _store.usersById.values) {
      if (user.dni == dniOrEmail.trim() ||
          user.email.toLowerCase() == dniOrEmail.trim().toLowerCase()) {
        target = user;
        break;
      }
    }
    if (target == null) {
      throw const NotFoundFailure(
        'No existe una cuenta registrada con ese DNI o correo electrónico.',
      );
    }

    final rawToken = _generateSecureToken(32);
    final tokenHash = sha256.convert(utf8.encode(rawToken)).toString();
    final now = _clock.now();
    final request = PasswordResetRequest(
      id: _ids.next(),
      userId: target.id,
      tokenHash: tokenHash,
      createdAt: now,
      expiresAt: now.add(resetTokenTtl),
    );
    _store.passwordResetsByTokenHash[tokenHash] = request;

    await _auditService.record(
      tenantId: target.tenantId,
      userId: target.id,
      usuarioDisplay: target.nombreCompleto,
      accion: AuditActions.passwordResetRequested,
      entidad: 'usuarios',
      entidadId: target.id,
      ipAddress: 'n/a',
      userAgent: 'n/a',
    );

    return rawToken;
  }

  @override
  Future<void> confirmPasswordReset({
    required String rawToken,
    required String newPassword,
  }) async {
    final tokenHash = sha256.convert(utf8.encode(rawToken)).toString();
    final request = _store.passwordResetsByTokenHash[tokenHash];
    if (request == null || !request.isValidAt(_clock.now())) {
      throw const UnauthorizedFailure(
        'El enlace de restablecimiento no es válido o ya expiró (30 minutos de vigencia).',
      );
    }
    final error = Validators.validatePassword(newPassword);
    if (error != null) throw ValidationFailure(error);

    final user = _store.usersById[request.userId];
    if (user == null) throw const NotFoundFailure('Usuario no encontrado.');

    _store.usersById[user.id] = user.copyWith(
      passwordHash: _hasher.hash(newPassword),
      estado: UserStatus.activo,
      updatedAt: _clock.now(),
    );
    _store.passwordResetsByTokenHash[tokenHash] = request.markUsed(_clock.now());

    await _auditService.record(
      tenantId: user.tenantId,
      userId: user.id,
      usuarioDisplay: user.nombreCompleto,
      accion: AuditActions.passwordResetCompleted,
      entidad: 'usuarios',
      entidadId: user.id,
      ipAddress: 'n/a',
      userAgent: 'n/a',
    );
  }

  @override
  Future<void> changeOwnPassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  }) async {
    final user = _store.usersById[userId];
    if (user == null) throw const NotFoundFailure('Usuario no encontrado.');
    if (!_hasher.verify(currentPassword, user.passwordHash)) {
      throw const UnauthorizedFailure('La contraseña actual no es correcta.');
    }
    final error = Validators.validatePassword(newPassword);
    if (error != null) throw ValidationFailure(error);

    _store.usersById[userId] = user.copyWith(
      passwordHash: _hasher.hash(newPassword),
      estado: UserStatus.activo,
      updatedAt: _clock.now(),
    );

    await _auditService.record(
      tenantId: user.tenantId,
      userId: user.id,
      usuarioDisplay: user.nombreCompleto,
      accion: AuditActions.passwordChanged,
      entidad: 'usuarios',
      entidadId: user.id,
      ipAddress: 'n/a',
      userAgent: 'n/a',
    );
  }

  void _enforceRateLimit(String ipAddress) {
    final attempts = _store.failedLoginAttempts[ipAddress] ?? const [];
    final windowStart = _clock.now().subtract(rateLimitWindow);
    final recent = attempts.where((t) => t.isAfter(windowStart)).toList();
    _store.failedLoginAttempts[ipAddress] = recent;
    if (recent.length >= rateLimitMaxAttempts) {
      throw const RateLimitedFailure(
        'Demasiados intentos fallidos. Intente nuevamente en unos minutos.',
      );
    }
  }

  void _registerFailedAttempt(String ipAddress) {
    _store.failedLoginAttempts.putIfAbsent(ipAddress, () => []).add(_clock.now());
  }

  String _generateSecureToken(int byteLength) {
    final bytes = List<int>.generate(byteLength, (_) => _random.nextInt(256));
    return base64Url.encode(bytes).replaceAll('=', '');
  }
}
