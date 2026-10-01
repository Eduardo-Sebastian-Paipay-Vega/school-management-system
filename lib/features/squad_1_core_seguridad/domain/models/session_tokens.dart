import 'role.dart';

/// Par de tokens emitido por `POST /auth/login` (RF-01, `contratos_api.md`).
class TokenPair {
  const TokenPair({
    required this.accessToken,
    required this.refreshToken,
    required this.accessExpiresAt,
    required this.refreshExpiresAt,
  });

  final String accessToken;
  final String refreshToken;
  final DateTime accessExpiresAt;
  final DateTime refreshExpiresAt;

  int get expiresInSeconds => accessExpiresAt.difference(DateTime.now().toUtc()).inSeconds;
}

/// Sesión autenticada activa en el cliente: claims decodificados del access
/// token vigente, usados por `AccessControlService` y el hub de pantallas.
class AuthSession {
  const AuthSession({
    required this.jti,
    required this.userId,
    required this.tenantId,
    required this.username,
    required this.nombreCompleto,
    required this.roles,
    required this.issuedAt,
    required this.accessExpiresAt,
    required this.accessToken,
    this.refreshToken,
  });

  final String jti;
  final String userId;
  final String tenantId;
  final String username;
  final String nombreCompleto;
  final Set<AppRole> roles;
  final DateTime issuedAt;
  final DateTime accessExpiresAt;
  final String accessToken;

  /// Solo se conoce justo después de `login()`. Al reconstruir la sesión
  /// desde un access token decodificado (`sessionFromAccessToken`) no está
  /// disponible — igual que en el navegador real, donde vive en una cookie
  /// `HttpOnly` inaccesible para JavaScript.
  final String? refreshToken;

  bool isExpiredAt(DateTime moment) => moment.isAfter(accessExpiresAt);

  AuthSession withRefreshToken(String? token) => AuthSession(
        jti: jti,
        userId: userId,
        tenantId: tenantId,
        username: username,
        nombreCompleto: nombreCompleto,
        roles: roles,
        issuedAt: issuedAt,
        accessExpiresAt: accessExpiresAt,
        accessToken: accessToken,
        refreshToken: token,
      );
}

/// Solicitud de restablecimiento de contraseña (RF-03).
/// Solo se conserva el hash SHA-256 del token, nunca el valor plano.
class PasswordResetRequest {
  const PasswordResetRequest({
    required this.id,
    required this.userId,
    required this.tokenHash,
    required this.createdAt,
    required this.expiresAt,
    this.usedAt,
  });

  final String id;
  final String userId;
  final String tokenHash;
  final DateTime createdAt;
  final DateTime expiresAt;
  final DateTime? usedAt;

  bool get isUsed => usedAt != null;

  bool isValidAt(DateTime moment) => !isUsed && moment.isBefore(expiresAt);

  PasswordResetRequest markUsed(DateTime at) => PasswordResetRequest(
        id: id,
        userId: userId,
        tokenHash: tokenHash,
        createdAt: createdAt,
        expiresAt: expiresAt,
        usedAt: at,
      );
}
