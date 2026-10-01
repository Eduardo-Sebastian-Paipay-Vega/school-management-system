/// Squad 1 — Core, Seguridad, Configuración Institucional y Auditoría.
/// Módulos M1, M2, M3, M12 · RF-01 al RF-14, RF-65 al RF-68 (18 RFs).
///
/// Punto de entrada público del squad. Las pantallas se exportan para que
/// `main.dart` y otras squads puedan navegar hacia ellas; los servicios de
/// dominio se exportan para que **otros squads consuman Core/Seguridad sin
/// duplicar lógica**, por ejemplo:
/// - `AccessControlService.can(session, Permission.gradesEdit)` antes de
///   mostrar la planilla de notas de Squad 3.
/// - `AcademicCalendarService.isGradeEditingAllowed(...)` antes de aceptar
///   un guardado de notas (Squad 3) o `hasCapacity(...)` antes de
///   confirmar una matrícula (Squad 2).
/// - `AuditService.recordChange(...)` para dejar traza de cambios en notas
///   o asistencias (RF-66), consumible por Squad 2 y Squad 3.
/// - `DataProtectionService.mask/unmask` para cumplir Ley N.° 29733 al
///   mostrar datos sensibles de estudiantes en cualquier squad.
library;

export 'presentation/screens/squad_1_screen.dart';
export 'presentation/screens/sdd_viewer_screen.dart';

export 'presentation/scope/squad_1_scope.dart';

export 'domain/models/role.dart';
export 'domain/models/session_tokens.dart';
export 'domain/models/user.dart';
export 'domain/models/sede.dart';
export 'domain/models/academic_year.dart';
export 'domain/models/academic_period.dart';
export 'domain/models/grade_section.dart';
export 'domain/models/grading_scale.dart';
export 'domain/models/institutional_params.dart';
export 'domain/models/audit_log_entry.dart';
export 'domain/models/change_history_entry.dart';

export 'domain/services/access_control_service.dart';
export 'domain/services/academic_calendar_service.dart';
export 'domain/services/audit_service.dart';
export 'domain/services/data_protection_service.dart';
export 'domain/services/grading_scale_service.dart';

export 'shared/failures.dart';
export 'shared/actor_context.dart';
