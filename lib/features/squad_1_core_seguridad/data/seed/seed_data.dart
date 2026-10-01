import '../../domain/models/academic_period.dart';
import '../../domain/models/academic_year.dart';
import '../../domain/models/grade_section.dart';
import '../../domain/models/grading_scale.dart';
import '../../domain/models/institutional_params.dart';
import '../../domain/models/role.dart';
import '../../domain/models/sede.dart';
import '../../domain/models/user.dart';
import '../../shared/id_generator.dart';
import '../../shared/password_hasher.dart';
import '../datasources/in_memory_store.dart';

/// Datos semilla para la demo del Squad 1: dos sedes (para evidenciar el
/// aislamiento multi-tenant de RF-07), un usuario por cada uno de los 5
/// roles normativos de RF-04 y la configuración escolar base (RF-10..14).
///
/// Todas las contraseñas de demostración son `Demo2026!`.
class SeedResult {
  const SeedResult({
    required this.sedeSecundariaId,
    required this.sedePrimariaId,
    required this.academicYearId,
    required this.demoPasswordPlain,
  });

  /// Sede "Secundaria": tenant principal usado por los usuarios demo y por
  /// la configuración escolar (RF-10..14).
  final String sedeSecundariaId;

  /// Sede "Primaria": segundo tenant, usado solo para evidenciar el
  /// aislamiento multi-tenant de RF-07.
  final String sedePrimariaId;
  final String academicYearId;
  final String demoPasswordPlain;
}

SeedResult seedDemoData(InMemoryStore store) {
  final ids = IdGenerator();
  final hasher = PasswordHasher();
  const demoPassword = 'Demo2026!';
  final demoHash = hasher.hash(demoPassword);
  final now = DateTime.now().toUtc();

  final sedeSecundaria = Sede(
    id: ids.next(),
    codigoModular: '0382910',
    nombre: 'Planteles de Aplicación Guamán Poma de Ayala — Secundaria',
    nivelEducativo: 'Secundaria',
    direccion: 'Jr. Asamblea 481, Ayacucho',
    telefono: '066-312233',
    directorNombre: 'Dr. Walter Curo Ccorahua',
    activo: true,
    createdAt: now,
  );

  final sedePrimaria = Sede(
    id: ids.next(),
    codigoModular: '0382911',
    nombre: 'Planteles de Aplicación Guamán Poma de Ayala — Primaria',
    nivelEducativo: 'Primaria',
    direccion: 'Jr. Asamblea 481, Ayacucho',
    telefono: '066-312234',
    directorNombre: 'Mg. Rosa Huamán Quispe',
    activo: true,
    createdAt: now,
  );

  store.sedesById[sedeSecundaria.id] = sedeSecundaria;
  store.sedesById[sedePrimaria.id] = sedePrimaria;

  void addUser({
    required String tenantId,
    required String dni,
    required String nombres,
    required String apellidos,
    required String email,
    required AppRole role,
  }) {
    final user = User(
      id: ids.next(),
      tenantId: tenantId,
      username: dni,
      dni: dni,
      email: email,
      passwordHash: demoHash,
      nombres: nombres,
      apellidos: apellidos,
      roles: {role},
      estado: UserStatus.activo,
      createdAt: now,
      updatedAt: now,
    );
    store.usersById[user.id] = user;
  }

  addUser(
    tenantId: sedeSecundaria.id,
    dni: '70859632',
    nombres: 'Brandon Fernando',
    apellidos: 'Montero Gutiérrez',
    email: 'bmontero@planteles.unsch.edu.pe',
    role: AppRole.superadmin,
  );
  addUser(
    tenantId: sedeSecundaria.id,
    dni: '40123456',
    nombres: 'Walter',
    apellidos: 'Curo Ccorahua',
    email: 'wcuro@planteles.unsch.edu.pe',
    role: AppRole.directivo,
  );
  addUser(
    tenantId: sedeSecundaria.id,
    dni: '72819203',
    nombres: 'Juan Carlos',
    apellidos: 'Quispe Flores',
    email: 'jquispe@planteles.unsch.edu.pe',
    role: AppRole.docente,
  );
  addUser(
    tenantId: sedeSecundaria.id,
    dni: '75412369',
    nombres: 'Ana Lucía',
    apellidos: 'Palomino Rojas',
    email: 'apalomino.alu@planteles.unsch.edu.pe',
    role: AppRole.estudiante,
  );
  addUser(
    tenantId: sedeSecundaria.id,
    dni: '41582697',
    nombres: 'Mario',
    apellidos: 'Cárdenas Huayta',
    email: 'mcardenas@planteles.unsch.edu.pe',
    role: AppRole.porteria,
  );
  addUser(
    tenantId: sedePrimaria.id,
    dni: '45123789',
    nombres: 'Rosa',
    apellidos: 'Huamán Quispe',
    email: 'rhuaman@planteles.unsch.edu.pe',
    role: AppRole.directivo,
  );

  // RF-10: año lectivo activo (solo en la sede Secundaria para la demo).
  final academicYear = AcademicYear(
    id: ids.next(),
    tenantId: sedeSecundaria.id,
    anio: 2026,
    fechaInicio: DateTime.utc(2026, 3, 2),
    fechaFin: DateTime.utc(2026, 12, 18),
    activo: true,
  );
  store.academicYearsById[academicYear.id] = academicYear;

  // RF-11: 4 bimestres, con el segundo en curso y el primero cerrado.
  final periodDefs = [
    (
      nombre: 'Bimestre I',
      inicio: DateTime.utc(2026, 3, 2),
      fin: DateTime.utc(2026, 5, 8),
      limite: DateTime.utc(2026, 5, 11),
      estado: PeriodStatus.cerrado,
    ),
    (
      nombre: 'Bimestre II',
      inicio: DateTime.utc(2026, 5, 12),
      fin: DateTime.utc(2026, 7, 17),
      limite: DateTime.utc(2026, 7, 20),
      estado: PeriodStatus.enCurso,
    ),
    (
      nombre: 'Bimestre III',
      inicio: DateTime.utc(2026, 8, 3),
      fin: DateTime.utc(2026, 10, 2),
      limite: DateTime.utc(2026, 10, 5),
      estado: PeriodStatus.planificado,
    ),
    (
      nombre: 'Bimestre IV',
      inicio: DateTime.utc(2026, 10, 5),
      fin: DateTime.utc(2026, 12, 18),
      limite: DateTime.utc(2026, 12, 21),
      estado: PeriodStatus.planificado,
    ),
  ];
  store.periodsByYearId[academicYear.id] = periodDefs
      .map((p) => AcademicPeriod(
            id: ids.next(),
            academicYearId: academicYear.id,
            nombre: p.nombre,
            fechaInicio: p.inicio,
            fechaFin: p.fin,
            fechaLimiteNotas: p.limite,
            toleranciaDias: 5,
            estado: p.estado,
          ))
      .toList();

  // RF-12: estructura de grados y secciones.
  store.sectionsByYearId[academicYear.id] = [
    GradeSection(
      id: ids.next(),
      academicYearId: academicYear.id,
      nivelEducativo: 'Secundaria',
      grado: '1°',
      seccion: 'A',
      aforoMaximo: 35,
      turno: Shift.manana,
    ),
    GradeSection(
      id: ids.next(),
      academicYearId: academicYear.id,
      nivelEducativo: 'Secundaria',
      grado: '2°',
      seccion: 'B',
      aforoMaximo: 35,
      turno: Shift.manana,
    ),
  ];

  // RF-13: escala dual CNEB.
  store.gradingScalesByTenantId[sedeSecundaria.id] = [
    GradingScale.cnebDefault(
      id: ids.next(),
      tenantId: sedeSecundaria.id,
      nivelEducativo: 'Secundaria',
      notaMinimaAprobatoria: 11,
    ),
  ];

  // RF-14: parámetros institucionales.
  store.institutionalParamsByTenantId[sedeSecundaria.id] = InstitutionalParams(
    tenantId: sedeSecundaria.id,
    nombreOficial: 'Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH',
    lemaDelAnio: 'Año de la Consolidación de Nuestra Independencia',
    directorGeneralNombre: 'Dr. Walter Curo Ccorahua',
    piePaginaBoletas:
        'Documento oficial emitido por los Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH.',
    updatedAt: now,
  );

  return SeedResult(
    sedeSecundariaId: sedeSecundaria.id,
    sedePrimariaId: sedePrimaria.id,
    academicYearId: academicYear.id,
    demoPasswordPlain: demoPassword,
  );
}
