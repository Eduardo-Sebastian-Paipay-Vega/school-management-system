import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/user_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/role.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/session_tokens.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/repositories/user_repository.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/actor_context.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';

import '../support/fake_clock.dart';

AuthSession _systemActor(String tenantId) {
  final now = DateTime.now().toUtc();
  return AuthSession(
    jti: 'jti-admin',
    userId: 'admin-1',
    tenantId: tenantId,
    username: '70859632',
    nombreCompleto: 'Brandon Montero',
    roles: const {AppRole.superadmin},
    issuedAt: now,
    accessExpiresAt: now.add(const Duration(minutes: 15)),
    accessToken: 'token',
  );
}

void main() {
  late InMemoryStore store;
  late UserRepositoryImpl repository;
  late ActorContext actor;
  const tenantId = 'tenant-1';

  setUp(() {
    store = InMemoryStore();
    final auditService = AuditService(repository: AuditRepositoryImpl(store), clock: FakeClock());
    repository = UserRepositoryImpl(store, auditService: auditService, clock: FakeClock());
    actor = ActorContext(session: _systemActor(tenantId), ipAddress: '127.0.0.1', userAgent: 'test');
  });

  group('UserRepositoryImpl.createUser (RF-05)', () {
    test('rechaza un DNI duplicado en el mismo tenant', () async {
      await repository.createUser(
        tenantId: tenantId,
        dni: '70859632',
        nombres: 'Brandon',
        apellidos: 'Montero',
        email: 'b1@planteles.unsch.edu.pe',
        rolInicial: AppRole.docente,
        actor: actor,
      );

      expect(
        () => repository.createUser(
          tenantId: tenantId,
          dni: '70859632',
          nombres: 'Otro',
          apellidos: 'Usuario',
          email: 'b2@planteles.unsch.edu.pe',
          rolInicial: AppRole.docente,
          actor: actor,
        ),
        throwsA(isA<ConflictFailure>()),
      );
    });

    test('el usuario creado exige cambio de clave en el primer ingreso', () async {
      final user = await repository.createUser(
        tenantId: tenantId,
        dni: '70859632',
        nombres: 'Brandon',
        apellidos: 'Montero',
        email: 'b1@planteles.unsch.edu.pe',
        rolInicial: AppRole.docente,
        actor: actor,
      );
      expect(user.estado, UserStatus.pendienteCambioClave);
    });
  });

  group('UserRepositoryImpl.importUsers (RF-06)', () {
    test('importa 198 filas válidas de 200, rechazando 2 duplicadas con su motivo', () async {
      final rows = List.generate(200, (i) {
        final dni = (70000000 + i).toString();
        return UserImportRow(
          rowNumber: i + 2,
          dni: dni,
          nombres: 'Nombre$i',
          apellidos: 'Apellido$i',
          email: 'user$i@planteles.unsch.edu.pe',
          rolCode: 'DOCENTE',
        );
      });
      // Duplica 2 DNIs ya presentes en el propio lote.
      rows[150] = UserImportRow(
        rowNumber: 152,
        dni: rows[0].dni,
        nombres: 'Duplicado',
        apellidos: 'Uno',
        email: 'dup1@planteles.unsch.edu.pe',
        rolCode: 'DOCENTE',
      );
      rows[151] = UserImportRow(
        rowNumber: 153,
        dni: rows[1].dni,
        nombres: 'Duplicado',
        apellidos: 'Dos',
        email: 'dup2@planteles.unsch.edu.pe',
        rolCode: 'DOCENTE',
      );

      final report = await repository.importUsers(tenantId: tenantId, rows: rows, actor: actor);

      expect(report.totalRows, 200);
      expect(report.importedCount, 198);
      expect(report.rejectedCount, 2);
      expect(report.rejected.every((r) => r.reason.contains('duplicado')), isTrue);
    });

    test('rechaza filas con DNI o correo con formato inválido', () async {
      final rows = [
        const UserImportRow(rowNumber: 2, dni: '123', nombres: 'A', apellidos: 'B', email: 'a@b.com', rolCode: 'DOCENTE'),
        const UserImportRow(rowNumber: 3, dni: '70000099', nombres: 'A', apellidos: 'B', email: 'correo-invalido', rolCode: 'DOCENTE'),
        const UserImportRow(rowNumber: 4, dni: '70000098', nombres: 'A', apellidos: 'B', email: 'ok@planteles.unsch.edu.pe', rolCode: 'ROL_INVENTADO'),
      ];

      final report = await repository.importUsers(tenantId: tenantId, rows: rows, actor: actor);

      expect(report.importedCount, 0);
      expect(report.rejectedCount, 3);
    });
  });

  group('UserRepositoryImpl.updateRoles (RF-04)', () {
    test('actualiza el conjunto de roles de un usuario', () async {
      final user = await repository.createUser(
        tenantId: tenantId,
        dni: '70859632',
        nombres: 'Brandon',
        apellidos: 'Montero',
        email: 'b1@planteles.unsch.edu.pe',
        rolInicial: AppRole.docente,
        actor: actor,
      );

      final updated = await repository.updateRoles(
        userId: user.id,
        roles: {AppRole.directivo, AppRole.docente},
        actor: actor,
      );

      expect(updated.roles, {AppRole.directivo, AppRole.docente});
    });
  });
}
