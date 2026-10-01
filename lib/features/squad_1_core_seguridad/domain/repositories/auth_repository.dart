import '../models/session_tokens.dart';

/// Contrato de autenticación (RF-01, RF-02, RF-03).
///
/// `data/repositories/auth_repository_impl.dart` lo implementa en memoria
/// para esta demo Flutter-only. Sustituir por un cliente HTTP/Dio contra
/// el backend Node.js del SDD no requiere cambiar ningún consumidor de
/// esta interfaz.
abstract class AuthRepository {
  /// RF-01: autentica y emite el par de tokens JWT.
  /// Lanza [RateLimitedFailure], [UnauthorizedFailure] o [ValidationFailure].
  Future<TokenPair> login({
    required String tenantModularCode,
    required String usernameOrDni,
    required String password,
    required String ipAddress,
    required String userAgent,
  });

  /// RF-02: revoca el access token (blacklist) y destruye el refresh token.
  Future<void> logout({required String accessToken});

  /// Decodifica y valida un access token, devolviendo `null` si expiró,
  /// tiene firma inválida o fue revocado (lista negra, RF-02).
  Future<AuthSession?> sessionFromAccessToken(String accessToken);

  /// RF-03: genera un token de recuperación de 32 bytes (vigencia 30 min)
  /// para el DNI o correo indicado. Devuelve el token en claro únicamente
  /// para que la UI lo muestre en la "bandeja simulada" — en producción se
  /// enviaría por correo y jamás se devolvería en la respuesta HTTP.
  Future<String> requestPasswordReset({required String dniOrEmail});

  /// RF-03: valida el token de un solo uso y actualiza la contraseña.
  /// Lanza [UnauthorizedFailure] si expiró o ya fue usado.
  Future<void> confirmPasswordReset({
    required String rawToken,
    required String newPassword,
  });

  /// RF-09: cambio autónomo de contraseña verificando la actual.
  Future<void> changeOwnPassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  });
}
