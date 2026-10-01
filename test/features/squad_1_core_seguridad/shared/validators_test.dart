import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/validators.dart';

void main() {
  group('Validators (RF-01, RF-05, RF-09)', () {
    test('acepta DNI de 8 dígitos', () {
      expect(Validators.isValidDni('70859632'), isTrue);
    });

    test('rechaza DNI con menos u otros caracteres', () {
      expect(Validators.isValidDni('1234567'), isFalse);
      expect(Validators.isValidDni('7085963A'), isFalse);
    });

    test('valida formato de correo institucional', () {
      expect(Validators.isValidEmail('bmontero@planteles.unsch.edu.pe'), isTrue);
      expect(Validators.isValidEmail('no-es-un-correo'), isFalse);
    });

    test('exige contraseña con letras y números, mínimo 8 caracteres (RF-03)', () {
      expect(Validators.isStrongPassword('Password123!'), isTrue);
      expect(Validators.isStrongPassword('soloLetras'), isFalse);
      expect(Validators.isStrongPassword('12345678'), isFalse);
      expect(Validators.isStrongPassword('abc123'), isFalse);
    });
  });
}
