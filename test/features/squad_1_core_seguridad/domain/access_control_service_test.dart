import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/role.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/session_tokens.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/access_control_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';

AuthSession _sessionWithRole(AppRole role) {
  final now = DateTime.now().toUtc();
  return AuthSession(
    jti: 'jti-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    username: '41582697',
    nombreCompleto: 'Mario Cárdenas',
    roles: {role},
    issuedAt: now,
    accessExpiresAt: now.add(const Duration(minutes: 15)),
    accessToken: 'token',
  );
}

void main() {
  group('AccessControlService (RF-04)', () {
    test('un rol Portería intentando editar notas recibe 403 (criterio de aceptación oficial)', () async {
      final store = InMemoryStore();
      final auditService = AuditService(repository: AuditRepositoryImpl(store));
      final accessControl = AccessControlService(auditService: auditService);
      final porteria = _sessionWithRole(AppRole.porteria);

      expect(
        () => accessControl.authorize(
          porteria,
          Permission.gradesEdit,
          ipAddress: '192.168.1.50',
          userAgent: 'test',
        ),
        throwsA(isA<ForbiddenFailure>()),
      );
    });

    test('la infracción queda registrada en la bitácora de auditoría (postcondición de RF-04)', () async {
      final store = InMemoryStore();
      final auditService = AuditService(repository: AuditRepositoryImpl(store));
      final accessControl = AccessControlService(auditService: auditService);
      final porteria = _sessionWithRole(AppRole.porteria);

      try {
        await accessControl.authorize(
          porteria,
          Permission.gradesEdit,
          ipAddress: '192.168.1.50',
          userAgent: 'test',
        );
      } on ForbiddenFailure {
        // esperado
      }

      final logs = await AuditRepositoryImpl(store).queryLogs(tenantId: 'tenant-1');
      expect(logs.any((l) => l.accion == AuditActions.accessDenied), isTrue);
    });

    test('un DOCENTE sí puede editar notas y asistencia', () async {
      final store = InMemoryStore();
      final auditService = AuditService(repository: AuditRepositoryImpl(store));
      final accessControl = AccessControlService(auditService: auditService);
      final docente = _sessionWithRole(AppRole.docente);

      expect(accessControl.can(docente, Permission.gradesEdit), isTrue);
      expect(accessControl.can(docente, Permission.rbacManage), isFalse);
    });
  });
}
