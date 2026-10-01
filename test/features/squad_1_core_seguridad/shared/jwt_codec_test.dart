import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/jwt_codec.dart';

void main() {
  group('JwtCodec (RF-01 firma HS256)', () {
    test('codifica y decodifica un payload íntegro', () {
      final codec = const JwtCodec('test-secret');
      final token = codec.encode({'sub': 'user-1', 'roles': ['DOCENTE']});
      final decoded = codec.verifyAndDecode(token);

      expect(decoded, isNotNull);
      expect(decoded!['sub'], 'user-1');
      expect(decoded['roles'], ['DOCENTE']);
    });

    test('rechaza un token firmado con otro secreto', () {
      final codec = const JwtCodec('secret-a');
      final otherCodec = const JwtCodec('secret-b');
      final token = codec.encode({'sub': 'user-1'});

      expect(otherCodec.verifyAndDecode(token), isNull);
    });

    test('rechaza un token manipulado', () {
      final codec = const JwtCodec('test-secret');
      final token = codec.encode({'sub': 'user-1', 'roles': ['ESTUDIANTE']});
      final parts = token.split('.');
      final tampered = '${parts[0]}.${parts[1]}x.${parts[2]}';

      expect(codec.verifyAndDecode(tampered), isNull);
    });

    test('rechaza texto con estructura inválida', () {
      final codec = const JwtCodec('test-secret');
      expect(codec.verifyAndDecode('no-es-un-jwt'), isNull);
    });
  });
}
