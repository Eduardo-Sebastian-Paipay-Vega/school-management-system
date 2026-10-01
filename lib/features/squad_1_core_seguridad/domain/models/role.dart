/// 5 perfiles normativos definidos en RF-04 / SDD Squad 1 §1.2.
enum AppRole {
  superadmin('SUPERADMIN', 'Super Administrador'),
  directivo('DIRECTIVO', 'Directivo'),
  docente('DOCENTE', 'Docente'),
  estudiante('ESTUDIANTE', 'Estudiante'),
  porteria('PORTERIA', 'Portería / Auxiliar');

  const AppRole(this.code, this.label);

  final String code;
  final String label;

  static AppRole fromCode(String code) => AppRole.values.firstWhere(
        (r) => r.code == code,
        orElse: () => throw ArgumentError('Rol desconocido: $code'),
      );
}

/// Catálogo de permisos que gobierna endpoints y pantallas (RF-04).
///
/// Incluye recursos propios del Squad 1 (usuarios, sedes, configuración
/// escolar, auditoría) y recursos representativos de otros squads
/// (`gradesEdit`, `attendanceEdit`) únicamente para que `AccessControlService`
/// pueda demostrar el criterio de aceptación oficial de RF-04: un usuario
/// con rol Portería que intenta editar notas recibe 403.
enum Permission {
  usersCreate,
  usersEdit,
  usersImport,
  directoryView,
  profileManageSelf,
  sedesManage,
  academicYearManage,
  academicPeriodManage,
  gradeSectionsManage,
  gradingScaleManage,
  institutionalParamsManage,
  rbacView,
  rbacManage,
  auditView,
  auditExport,
  privacyUnmask,
  privacyBulkExport,
  dashboardView,
  gradesEdit,
  attendanceEdit,
}

/// Matriz RBAC: rol → conjunto de permisos concedidos.
class RbacPolicy {
  const RbacPolicy._();

  static const Map<AppRole, Set<Permission>> _matrix = {
    AppRole.superadmin: {
      Permission.usersCreate,
      Permission.usersEdit,
      Permission.usersImport,
      Permission.directoryView,
      Permission.profileManageSelf,
      Permission.sedesManage,
      Permission.academicYearManage,
      Permission.academicPeriodManage,
      Permission.gradeSectionsManage,
      Permission.gradingScaleManage,
      Permission.institutionalParamsManage,
      Permission.rbacView,
      Permission.rbacManage,
      Permission.auditView,
      Permission.auditExport,
      Permission.privacyUnmask,
      Permission.privacyBulkExport,
      Permission.dashboardView,
      Permission.gradesEdit,
      Permission.attendanceEdit,
    },
    AppRole.directivo: {
      Permission.usersCreate,
      Permission.usersEdit,
      Permission.usersImport,
      Permission.directoryView,
      Permission.profileManageSelf,
      Permission.academicYearManage,
      Permission.academicPeriodManage,
      Permission.gradeSectionsManage,
      Permission.gradingScaleManage,
      Permission.institutionalParamsManage,
      Permission.rbacView,
      Permission.auditView,
      Permission.auditExport,
      Permission.privacyUnmask,
      Permission.privacyBulkExport,
      Permission.dashboardView,
    },
    AppRole.docente: {
      Permission.directoryView,
      Permission.profileManageSelf,
      Permission.dashboardView,
      Permission.gradesEdit,
      Permission.attendanceEdit,
    },
    AppRole.estudiante: {
      Permission.profileManageSelf,
      Permission.dashboardView,
    },
    AppRole.porteria: {
      Permission.profileManageSelf,
      Permission.dashboardView,
      Permission.attendanceEdit,
    },
  };

  static Set<Permission> permissionsOf(AppRole role) => _matrix[role] ?? const {};

  static Set<Permission> permissionsOfAll(Iterable<AppRole> roles) {
    final result = <Permission>{};
    for (final role in roles) {
      result.addAll(permissionsOf(role));
    }
    return result;
  }

  static bool grants(Iterable<AppRole> roles, Permission permission) {
    return roles.any((role) => permissionsOf(role).contains(permission));
  }
}
