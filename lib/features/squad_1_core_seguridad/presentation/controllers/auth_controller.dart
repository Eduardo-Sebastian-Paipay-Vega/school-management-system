import 'package:flutter/foundation.dart';

import '../../domain/models/session_tokens.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Controlador de sesión (RF-01 login, RF-02 logout, RF-09 perfil propio).
///
/// Expuesto vía `Squad1Scope` para que cualquier pantalla del squad (y, en
/// el futuro, de otros squads) conozca la sesión activa sin duplicar el
/// estado de autenticación.
class AuthController extends ChangeNotifier {
  AuthController({required AuthRepository authRepository, required UserRepository userRepository})
      : _authRepository = authRepository,
        _userRepository = userRepository;

  final AuthRepository _authRepository;
  final UserRepository _userRepository;

  AuthSession? _session;
  bool isLoading = false;
  String? errorMessage;

  /// Enganchados por `Squad1Container` para arrancar/detener el vigía de
  /// inactividad (RF-02) en sincronía con el ciclo de vida de la sesión.
  VoidCallback? onAuthenticated;
  VoidCallback? onLoggedOut;

  /// Último token de restablecimiento emitido (RF-03), mostrado en la
  /// "bandeja simulada" de la UI a falta de un servidor SMTP real.
  String? lastPasswordResetToken;

  AuthSession? get session => _session;
  bool get isAuthenticated => _session != null;

  Future<bool> login({
    required String tenantModularCode,
    required String usernameOrDni,
    required String password,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      final pair = await _authRepository.login(
        tenantModularCode: tenantModularCode,
        usernameOrDni: usernameOrDni,
        password: password,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      final decoded = await _authRepository.sessionFromAccessToken(pair.accessToken);
      _session = decoded?.withRefreshToken(pair.refreshToken);
      if (_session != null) onAuthenticated?.call();
      return _session != null;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final current = _session;
    if (current != null) {
      await _authRepository.logout(accessToken: current.accessToken);
    }
    _session = null;
    onLoggedOut?.call();
    notifyListeners();
  }

  Future<bool> requestPasswordReset(String dniOrEmail) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      lastPasswordResetToken = await _authRepository.requestPasswordReset(
        dniOrEmail: dniOrEmail,
      );
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> confirmPasswordReset({
    required String rawToken,
    required String newPassword,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _authRepository.confirmPasswordReset(rawToken: rawToken, newPassword: newPassword);
      lastPasswordResetToken = null;
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// RF-09: cambio autónomo de contraseña. Revoca la sesión actual para
  /// forzar un nuevo login, tal como exige la postcondición del requisito
  /// ("sesiones en otros dispositivos revocadas").
  Future<bool> changeOwnPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final current = _session;
    if (current == null) return false;
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _authRepository.changeOwnPassword(
        userId: current.userId,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      await logout();
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// RF-09: actualización de teléfono / foto de perfil.
  Future<bool> updateOwnProfile({String? telefono, String? fotoUrl}) async {
    final current = _session;
    if (current == null) return false;
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _userRepository.updateProfile(
        userId: current.userId,
        telefono: telefono,
        fotoUrl: fotoUrl,
      );
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    errorMessage = null;
    notifyListeners();
  }
}
