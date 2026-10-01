import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';

/// Hashing de contraseñas para el repositorio en memoria de esta demo.
///
/// El SDD (`stack_tecnologico_proyecto.md` §4.2) exige `bcrypt` con factor
/// de coste 12 en el backend real. `bcrypt` es deliberadamente lento
/// (segundos por hash) para resistir fuerza bruta — inviable para un mock
/// que corre en el hilo de UI de Flutter Web sin backend, donde el
/// criterio de aceptación de RF-01 exige login en <500ms. Este
/// `PasswordHasher` usa SHA-256 con sal aleatoria por usuario únicamente
/// para sostener la demo; la implementación productiva debe vivir en el
/// backend con `bcryptjs` (rounds = 12).
class PasswordHasher {
  PasswordHasher({Random? random}) : _random = random ?? Random.secure();

  final Random _random;

  /// Devuelve `"<saltHex>:<sha256Hex>"`.
  String hash(String plainPassword) {
    final salt = _generateSalt();
    return '$salt:${_digest(salt, plainPassword)}';
  }

  bool verify(String plainPassword, String storedHash) {
    final parts = storedHash.split(':');
    if (parts.length != 2) return false;
    return _digest(parts[0], plainPassword) == parts[1];
  }

  String _digest(String salt, String plainPassword) {
    return sha256.convert(utf8.encode('$salt:$plainPassword')).toString();
  }

  String _generateSalt() {
    final bytes = List<int>.generate(16, (_) => _random.nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }
}
