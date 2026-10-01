import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/password_hasher.dart';

void main() {
  group('PasswordHasher', () {
    test('verifica correctamente la contraseña correcta', () {
      final hasher = PasswordHasher();
      final hash = hasher.hash('Password123!');
      expect(hasher.verify('Password123!', hash), isTrue);
    });

    test('rechaza una contraseña incorrecta', () {
      final hasher = PasswordHasher();
      final hash = hasher.hash('Password123!');
      expect(hasher.verify('OtraClave456!', hash), isFalse);
    });

    test('genera sales distintas para el mismo texto plano', () {
      final hasher = PasswordHasher();
      final hashA = hasher.hash('Password123!');
      final hashB = hasher.hash('Password123!');
      expect(hashA, isNot(equals(hashB)));
      expect(hasher.verify('Password123!', hashA), isTrue);
      expect(hasher.verify('Password123!', hashB), isTrue);
    });
  });
}
