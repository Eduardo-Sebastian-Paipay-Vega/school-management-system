import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/auth_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/role.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/sede.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/user.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/password_hasher.dart';

import '../support/fake_clock.dart';

void main() {
  late InMemoryStore store;
  late AuthRepositoryImpl authRepository;
  late FakeClock clock;
  const password = 'Password123!';

  Sede insertSede(String id, String codigo) {
    final sede = Sede(
      id: id,
      codigoModular: codigo,
      nombre: 'Sede $codigo',
      nivelEducativo: 'Secundaria',
      direccion: 'Jr. Test 123',
      telefono: '066-000000',
      directorNombre: 'Director Test',
      activo: true,
      createdAt: DateTime.utc(2026, 1, 1),
    );
    store.sedesById[sede.id] = sede;
    return sede;
  }

  User insertUser(String tenantId, {String dni = '70859632', UserStatus estado = UserStatus.activo}) {
    final user = User(
      id: 'user-$dni',
      tenantId: tenantId,
      username: dni,
      dni: dni,
      email: '$dni@planteles.unsch.edu.pe',
      passwordHash: PasswordHasher().hash(password),
      nombres: 'Brandon',
      apellidos: 'Montero',
      roles: {AppRole.superadmin},
      estado: estado,
      createdAt: DateTime.utc(2026, 1, 1),
      updatedAt: DateTime.utc(2026, 1, 1),
    );
    store.usersById[user.id] = user;
    return user;
  }

  setUp(() {
    store = InMemoryStore();
    clock = FakeClock();
    final auditService = AuditService(repository: AuditRepositoryImpl(store), clock: clock);
    authRepository = AuthRepositoryImpl(store, auditService: auditService, clock: clock);
  });

  group('AuthRepositoryImpl.login (RF-01)', () {
    test('emite tokens válidos con credenciales correctas', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      final pair = await authRepository.login(
        tenantModularCode: '0382910',
        usernameOrDni: '70859632',
        password: password,
        ipAddress: '10.0.0.1',
        userAgent: 'test',
      );

      expect(pair.accessToken, isNotEmpty);
      final session = await authRepository.sessionFromAccessToken(pair.accessToken);
      expect(session, isNotNull);
      expect(session!.tenantId, sede.id);
      expect(session.roles, {AppRole.superadmin});
    });

    test('rechaza contraseña incorrecta con 401', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      expect(
        () => authRepository.login(
          tenantModularCode: '0382910',
          usernameOrDni: '70859632',
          password: 'incorrecta',
          ipAddress: '10.0.0.2',
          userAgent: 'test',
        ),
        throwsA(isA<UnauthorizedFailure>()),
      );
    });

    test('bloquea tras 5 intentos fallidos desde la misma IP (RF-01)', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      for (var i = 0; i < 5; i++) {
        await expectLater(
          authRepository.login(
            tenantModularCode: '0382910',
            usernameOrDni: '70859632',
            password: 'incorrecta',
            ipAddress: '10.0.0.3',
            userAgent: 'test',
          ),
          throwsA(isA<UnauthorizedFailure>()),
        );
      }

      await expectLater(
        authRepository.login(
          tenantModularCode: '0382910',
          usernameOrDni: '70859632',
          password: password,
          ipAddress: '10.0.0.3',
          userAgent: 'test',
        ),
        throwsA(isA<RateLimitedFailure>()),
      );
    });

    test('no bloquea intentos desde una IP distinta', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      for (var i = 0; i < 5; i++) {
        await expectLater(
          authRepository.login(
            tenantModularCode: '0382910',
            usernameOrDni: '70859632',
            password: 'incorrecta',
            ipAddress: '10.0.0.4',
            userAgent: 'test',
          ),
          throwsA(isA<UnauthorizedFailure>()),
        );
      }

      final pair = await authRepository.login(
        tenantModularCode: '0382910',
        usernameOrDni: '70859632',
        password: password,
        ipAddress: '10.0.0.5',
        userAgent: 'test',
      );
      expect(pair.accessToken, isNotEmpty);
    });

    test('aislamiento multi-tenant (RF-07): un usuario no existe fuera de su sede', () async {
      insertSede('sede-1', '0382910');
      final otraSede = insertSede('sede-2', '0382911');
      insertUser('sede-1'); // usuario solo pertenece a sede-1

      expect(
        () => authRepository.login(
          tenantModularCode: otraSede.codigoModular,
          usernameOrDni: '70859632',
          password: password,
          ipAddress: '10.0.0.6',
          userAgent: 'test',
        ),
        throwsA(isA<UnauthorizedFailure>()),
      );
    });

    test('rechaza cuentas bloqueadas o inactivas', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id, estado: UserStatus.bloqueado);

      expect(
        () => authRepository.login(
          tenantModularCode: '0382910',
          usernameOrDni: '70859632',
          password: password,
          ipAddress: '10.0.0.7',
          userAgent: 'test',
        ),
        throwsA(isA<UnauthorizedFailure>()),
      );
    });
  });

  group('AuthRepositoryImpl.logout (RF-02)', () {
    test('revoca el access token: un intento posterior de uso es rechazado', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      final pair = await authRepository.login(
        tenantModularCode: '0382910',
        usernameOrDni: '70859632',
        password: password,
        ipAddress: '10.0.0.8',
        userAgent: 'test',
      );
      expect(await authRepository.sessionFromAccessToken(pair.accessToken), isNotNull);

      await authRepository.logout(accessToken: pair.accessToken);

      expect(await authRepository.sessionFromAccessToken(pair.accessToken), isNull);
    });
  });

  group('AuthRepositoryImpl.requestPasswordReset / confirmPasswordReset (RF-03)', () {
    test('un token expirado (+30 min) es rechazado', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      final rawToken = await authRepository.requestPasswordReset(dniOrEmail: '70859632');
      clock.advance(const Duration(minutes: 31));

      expect(
        () => authRepository.confirmPasswordReset(rawToken: rawToken, newPassword: 'NuevaClave123!'),
        throwsA(isA<UnauthorizedFailure>()),
      );
    });

    test('un token vigente permite actualizar la contraseña una sola vez', () async {
      final sede = insertSede('sede-1', '0382910');
      insertUser(sede.id);

      final rawToken = await authRepository.requestPasswordReset(dniOrEmail: '70859632');
      await authRepository.confirmPasswordReset(rawToken: rawToken, newPassword: 'NuevaClave123!');

      final pair = await authRepository.login(
        tenantModularCode: '0382910',
        usernameOrDni: '70859632',
        password: 'NuevaClave123!',
        ipAddress: '10.0.0.9',
        userAgent: 'test',
      );
      expect(pair.accessToken, isNotEmpty);

      // El token de un solo uso ya no debe servir otra vez.
      expect(
        () => authRepository.confirmPasswordReset(rawToken: rawToken, newPassword: 'OtraClave456!'),
        throwsA(isA<UnauthorizedFailure>()),
      );
    });
  });
}
