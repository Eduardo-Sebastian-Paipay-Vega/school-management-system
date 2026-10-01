import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart' as crypto;
import 'package:encrypt/encrypt.dart' as enc;

import '../../shared/failures.dart';
import '../models/role.dart';
import '../models/session_tokens.dart';
import 'access_control_service.dart';
import 'audit_service.dart';

/// Cumplimiento de la Ley N.° 29733 de Protección de Datos Personales
/// (RF-68): cifrado AES-256 en reposo de campos sensibles, enmascaramiento
/// en pantalla y desenmascarado auditado bajo motivo justificado.
class DataProtectionService {
  DataProtectionService({
    required AccessControlService accessControl,
    required AuditService auditService,
    String encryptionSecret = 'guaman-poma-ayala-ssu-is480-2026',
  })  : _accessControl = accessControl,
        _auditService = auditService,
        _key = enc.Key(
          Uint8List.fromList(crypto.sha256.convert(utf8.encode(encryptionSecret)).bytes),
        ) {
    _encrypter = enc.Encrypter(enc.AES(_key, mode: enc.AESMode.cbc));
  }

  final AccessControlService _accessControl;
  final AuditService _auditService;
  final enc.Key _key;
  late final enc.Encrypter _encrypter;

  /// Cifra un valor sensible (teléfono de apoderado, dirección, diagnóstico
  /// psicológico, etc.) en reposo, con AES-256-CBC e IV aleatorio por campo.
  String encryptSensitive(String plainText) {
    final iv = enc.IV.fromSecureRandom(16);
    final encrypted = _encrypter.encrypt(plainText, iv: iv);
    return '${iv.base64}:${encrypted.base64}';
  }

  String decryptSensitive(String stored) {
    final parts = stored.split(':');
    if (parts.length != 2) return stored;
    final iv = enc.IV.fromBase64(parts[0]);
    return _encrypter.decrypt(enc.Encrypted.fromBase64(parts[1]), iv: iv);
  }

  /// Enmascaramiento para vistas públicas/no autorizadas (ej. `987654321`
  /// → `987***321`), tal como exige el criterio de aceptación de RF-68.
  String mask(String value) {
    final v = value.trim();
    if (v.length <= 4) return '*' * v.length;
    final visibleStart = v.substring(0, 3);
    final visibleEnd = v.substring(v.length - 3);
    final middleLength = (v.length - 6).clamp(3, 6);
    return '$visibleStart${'*' * middleLength}$visibleEnd';
  }

  /// Desenmascara un campo cifrado solo si el rol tiene el permiso
  /// [Permission.privacyUnmask] y se registra un motivo, auditando el acceso.
  Future<String> unmask({
    required AuthSession requester,
    required String storedCipherText,
    required String fieldName,
    required String reason,
    required String ipAddress,
    required String userAgent,
  }) async {
    await _accessControl.authorize(
      requester,
      Permission.privacyUnmask,
      ipAddress: ipAddress,
      userAgent: userAgent,
    );
    if (reason.trim().length < 5) {
      throw const ValidationFailure(
        'Debe registrar un motivo (mínimo 5 caracteres) para desenmascarar el dato.',
      );
    }
    final plain = decryptSensitive(storedCipherText);
    await _auditService.recordSession(
      requester,
      accion: AuditActions.privacyUnmasked,
      entidad: fieldName,
      ipAddress: ipAddress,
      userAgent: userAgent,
      payloadNuevo: {'campo': fieldName, 'motivo': reason},
    );
    return plain;
  }

  /// RF-68: bloquea la extracción masiva de datos sensibles sin
  /// autorización directiva explícita.
  Future<void> authorizeBulkExport(
    AuthSession requester, {
    required String ipAddress,
    required String userAgent,
  }) {
    return _accessControl.authorize(
      requester,
      Permission.privacyBulkExport,
      ipAddress: ipAddress,
      userAgent: userAgent,
    );
  }
}
