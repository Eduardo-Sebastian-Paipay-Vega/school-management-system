import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/role.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/session_tokens.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/access_control_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/data_protection_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';

AuthSession _sessionWithRole(AppRole role) {
  final now = DateTime.now().toUtc();
  return AuthSession(
    jti: 'jti-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    username: '12345678',
    nombreCompleto: 'Usuario de Prueba',
    roles: {role},
    issuedAt: now,
    accessExpiresAt: now.add(const Duration(minutes: 15)),
    accessToken: 'token',
  );
}

void main() {
  late DataProtectionService dataProtection;
  late AuditService auditService;

  setUp(() {
    final store = InMemoryStore();
    auditService = AuditService(repository: AuditRepositoryImpl(store));
    final accessControl = AccessControlService(auditService: auditService);
    dataProtection = DataProtectionService(accessControl: accessControl, auditService: auditService);
  });

  group('DataProtectionService (RF-68, Ley N.° 29733)', () {
    test('mask() enmascara conservando los primeros y últimos 3 caracteres', () {
      expect(dataProtection.mask('987654321'), '987***321');
    });

    test('encryptSensitive/decryptSensitive hacen roundtrip exacto (AES-256)', () {
      final cipher = dataProtection.encryptSensitive('987654321');
      expect(cipher, isNot(contains('987654321')));
      expect(dataProtection.decryptSensitive(cipher), '987654321');
    });

    test('un rol sin privacyUnmask (DOCENTE) recibe 403 al desenmascarar', () async {
      final session = _sessionWithRole(AppRole.docente);
      final cipher = dataProtection.encryptSensitive('987654321');

      expect(
        () => dataProtection.unmask(
          requester: session,
          storedCipherText: cipher,
          fieldName: 'telefono',
          reason: 'Verificación de contacto',
          ipAddress: '127.0.0.1',
          userAgent: 'test',
        ),
        throwsA(isA<ForbiddenFailure>()),
      );
    });

    test('un rol con privacyUnmask (DIRECTIVO) puede desenmascarar con motivo válido', () async {
      final session = _sessionWithRole(AppRole.directivo);
      final cipher = dataProtection.encryptSensitive('987654321');

      final plain = await dataProtection.unmask(
        requester: session,
        storedCipherText: cipher,
        fieldName: 'telefono',
        reason: 'Verificación de contacto',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );

      expect(plain, '987654321');
    });

    test('exige un motivo de al menos 5 caracteres', () async {
      final session = _sessionWithRole(AppRole.directivo);
      final cipher = dataProtection.encryptSensitive('987654321');

      expect(
        () => dataProtection.unmask(
          requester: session,
          storedCipherText: cipher,
          fieldName: 'telefono',
          reason: 'ab',
          ipAddress: '127.0.0.1',
          userAgent: 'test',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });
  });
}
