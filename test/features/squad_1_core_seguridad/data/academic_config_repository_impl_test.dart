import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/academic_config_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/grade_section.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/role.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/session_tokens.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/academic_calendar_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/actor_context.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';

import '../support/fake_clock.dart';

void main() {
  late InMemoryStore store;
  late AcademicConfigRepositoryImpl repository;
  late AcademicCalendarService calendar;
  late FakeClock clock;
  late ActorContext actor;
  const tenantId = 'tenant-1';

  setUp(() {
    store = InMemoryStore();
    clock = FakeClock(DateTime.utc(2026, 5, 1));
    final auditService = AuditService(repository: AuditRepositoryImpl(store), clock: clock);
    repository = AcademicConfigRepositoryImpl(store, auditService: auditService, clock: clock);
    calendar = AcademicCalendarService(repository: repository, clock: clock);
    final now = clock.now();
    actor = ActorContext(
      session: AuthSession(
        jti: 'jti',
        userId: 'admin-1',
        tenantId: tenantId,
        username: '70859632',
        nombreCompleto: 'Brandon Montero',
        roles: const {AppRole.superadmin},
        issuedAt: now,
        accessExpiresAt: now.add(const Duration(minutes: 15)),
        accessToken: 'token',
      ),
      ipAddress: '127.0.0.1',
      userAgent: 'test',
    );
  });

  group('AcademicConfigRepositoryImpl (RF-10)', () {
    test('no permite dos años lectivos activos simultáneos en la misma sede', () async {
      await repository.openAcademicYear(
        tenantId: tenantId,
        anio: 2026,
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 12, 20),
        actor: actor,
      );

      expect(
        () => repository.openAcademicYear(
          tenantId: tenantId,
          anio: 2027,
          fechaInicio: DateTime.utc(2027, 3, 1),
          fechaFin: DateTime.utc(2027, 12, 20),
          actor: actor,
        ),
        throwsA(isA<BusinessRuleFailure>()),
      );
    });
  });

  group('AcademicCalendarService.isGradeEditingAllowed (RF-11)', () {
    test('un periodo cerrado bloquea la edición de notas', () async {
      final year = await repository.openAcademicYear(
        tenantId: tenantId,
        anio: 2026,
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 12, 20),
        actor: actor,
      );
      final period = await repository.createPeriod(
        academicYearId: year.id,
        nombre: 'Bimestre I',
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 5, 8),
        fechaLimiteNotas: DateTime.utc(2026, 5, 11),
        toleranciaDias: 5,
        actor: actor,
      );

      expect(
        await calendar.isGradeEditingAllowed(
          tenantId: tenantId,
          academicYearId: year.id,
          periodId: period.id,
          at: DateTime.utc(2026, 5, 2),
        ),
        isTrue,
      );

      await repository.closePeriod(period.id, actor: actor);

      expect(
        await calendar.isGradeEditingAllowed(
          tenantId: tenantId,
          academicYearId: year.id,
          periodId: period.id,
          at: DateTime.utc(2026, 5, 2),
        ),
        isFalse,
      );
    });

    test('bloquea automáticamente tras la fecha límite + tolerancia', () async {
      final year = await repository.openAcademicYear(
        tenantId: tenantId,
        anio: 2026,
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 12, 20),
        actor: actor,
      );
      final period = await repository.createPeriod(
        academicYearId: year.id,
        nombre: 'Bimestre I',
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 5, 8),
        fechaLimiteNotas: DateTime.utc(2026, 5, 11),
        toleranciaDias: 5,
        actor: actor,
      );

      expect(
        await calendar.isGradeEditingAllowed(
          tenantId: tenantId,
          academicYearId: year.id,
          periodId: period.id,
          at: DateTime.utc(2026, 5, 15),
        ),
        isTrue,
        reason: 'dentro de los 5 días de tolerancia',
      );
      expect(
        await calendar.isGradeEditingAllowed(
          tenantId: tenantId,
          academicYearId: year.id,
          periodId: period.id,
          at: DateTime.utc(2026, 5, 17),
        ),
        isFalse,
        reason: 'fuera de la tolerancia',
      );
    });
  });

  group('AcademicCalendarService.hasCapacity (RF-12)', () {
    test('respeta el aforo máximo de la sección', () async {
      final year = await repository.openAcademicYear(
        tenantId: tenantId,
        anio: 2026,
        fechaInicio: DateTime.utc(2026, 3, 1),
        fechaFin: DateTime.utc(2026, 12, 20),
        actor: actor,
      );
      final section = await repository.createGradeSection(
        academicYearId: year.id,
        nivelEducativo: 'Secundaria',
        grado: '1°',
        seccion: 'A',
        aforoMaximo: 35,
        turno: Shift.manana,
        actor: actor,
      );

      expect(
        await calendar.hasCapacity(academicYearId: year.id, sectionId: section.id, currentlyEnrolled: 34),
        isTrue,
      );
      expect(
        await calendar.hasCapacity(academicYearId: year.id, sectionId: section.id, currentlyEnrolled: 35),
        isFalse,
      );
    });
  });
}
