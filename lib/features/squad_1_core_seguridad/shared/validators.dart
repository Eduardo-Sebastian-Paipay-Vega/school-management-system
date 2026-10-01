/// Validadores compartidos por M1/M2/M3 (RF-01, RF-05, RF-06, RF-09).
class Validators {
  const Validators._();

  static final RegExp _dni = RegExp(r'^\d{8}$');
  static final RegExp _email = RegExp(r'^[\w.+-]+@(?:[\w-]+\.)+[a-zA-Z]{2,}$');
  static final RegExp _hasLetter = RegExp(r'[A-Za-z]');
  static final RegExp _hasDigit = RegExp(r'\d');

  /// DNI peruano: exactamente 8 dígitos numéricos (RF-05).
  static bool isValidDni(String value) => _dni.hasMatch(value.trim());

  static bool isValidEmail(String value) => _email.hasMatch(value.trim());

  /// Clave con mínimo 8 caracteres, letras y números (RF-03, RF-09).
  static bool isStrongPassword(String value) {
    return value.length >= 8 && _hasLetter.hasMatch(value) && _hasDigit.hasMatch(value);
  }

  static String? validateDni(String? value) {
    if (value == null || value.trim().isEmpty) return 'El DNI es obligatorio.';
    if (!isValidDni(value)) return 'El DNI debe tener exactamente 8 dígitos numéricos.';
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return 'El correo es obligatorio.';
    if (!isValidEmail(value)) return 'Ingrese un correo electrónico válido.';
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'La contraseña es obligatoria.';
    if (!isStrongPassword(value)) {
      return 'Mínimo 8 caracteres, combinando letras y números.';
    }
    return null;
  }

  static String? validateRequired(String? value, String fieldLabel) {
    if (value == null || value.trim().isEmpty) return '$fieldLabel es obligatorio.';
    return null;
  }
}
