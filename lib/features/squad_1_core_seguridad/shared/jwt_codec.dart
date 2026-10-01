import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Codificador/decodificador de JWT HS256 minimalista.
///
/// El SDD (sección 4.2 de `stack_tecnologico_proyecto.md`) especifica JWT
/// HMAC-SHA256 emitido por el backend Node.js. Este repositorio no contiene
/// backend: esta clase simula la emisión y verificación de la firma en el
/// cliente únicamente para sostener la demo Flutter de RF-01/RF-02/RF-04.
/// En producción la emisión y verificación de firma deben ocurrir en el
/// servidor; el cliente solo debe decodificar el payload recibido.
class JwtCodec {
  const JwtCodec(this._secret);

  final String _secret;

  String encode(Map<String, dynamic> claims) {
    final header = _b64(utf8.encode(jsonEncode({'alg': 'HS256', 'typ': 'JWT'})));
    final payload = _b64(utf8.encode(jsonEncode(claims)));
    final signature = _sign('$header.$payload');
    return '$header.$payload.$signature';
  }

  /// Devuelve el payload decodificado o `null` si la firma no es válida
  /// o la estructura del token está corrupta.
  Map<String, dynamic>? verifyAndDecode(String token) {
    final parts = token.split('.');
    if (parts.length != 3) return null;
    final expectedSignature = _sign('${parts[0]}.${parts[1]}');
    if (expectedSignature != parts[2]) return null;
    try {
      final payloadJson = utf8.decode(base64Url.decode(_padded(parts[1])));
      return jsonDecode(payloadJson) as Map<String, dynamic>;
    } on FormatException {
      return null;
    }
  }

  String _sign(String data) {
    final hmac = Hmac(sha256, utf8.encode(_secret));
    return _b64(hmac.convert(utf8.encode(data)).bytes);
  }

  String _b64(List<int> bytes) => base64Url.encode(bytes).replaceAll('=', '');

  String _padded(String input) {
    final remainder = input.length % 4;
    if (remainder == 0) return input;
    return input + ('=' * (4 - remainder));
  }
}
