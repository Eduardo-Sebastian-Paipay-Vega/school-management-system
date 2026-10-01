import 'package:flutter/widgets.dart';

import '../../data/datasources/in_memory_store.dart';
import '../../data/repositories/academic_config_repository_impl.dart';
import '../../data/repositories/audit_repository_impl.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/sede_repository_impl.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/seed/seed_data.dart';
import '../../domain/repositories/academic_config_repository.dart';
import '../../domain/repositories/audit_repository.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/sede_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/services/access_control_service.dart';
import '../../domain/services/academic_calendar_service.dart';
import '../../domain/services/audit_service.dart';
import '../../domain/services/data_protection_service.dart';
import '../../domain/services/grading_scale_service.dart';
import '../../shared/client_context.dart';
import '../controllers/academic_config_controller.dart';
import '../controllers/audit_controller.dart';
import '../controllers/auth_controller.dart';
import '../controllers/directory_controller.dart';
import '../controllers/sede_controller.dart';
import '../controllers/session_activity_controller.dart';
import '../controllers/user_admin_controller.dart';

/// Raíz de composición del Squad 1: construye el almacén en memoria, los
/// repositorios, los servicios de dominio y los controladores de
/// presentación una única vez por sesión de la app, y los expone al árbol
/// de widgets mediante [Squad1Scope].
class Squad1Container {
  Squad1Container._({
    required this.store,
    required this.seed,
    required this.auditRepository,
    required this.authRepository,
    required this.userRepository,
    required this.sedeRepository,
    required this.academicConfigRepository,
    required this.auditService,
    required this.accessControl,
    required this.dataProtection,
    required this.gradingScaleService,
    required this.academicCalendar,
    required this.authController,
    required this.sessionActivity,
    required this.userAdminController,
    required this.directoryController,
    required this.sedeController,
    required this.academicConfigController,
    required this.auditController,
  });

  factory Squad1Container.build() {
    final store = InMemoryStore();
    final seed = seedDemoData(store);

    final auditRepository = AuditRepositoryImpl(store);
    final auditService = AuditService(repository: auditRepository);
    final accessControl = AccessControlService(auditService: auditService);
    final dataProtection = DataProtectionService(
      accessControl: accessControl,
      auditService: auditService,
    );

    final authRepository = AuthRepositoryImpl(store, auditService: auditService);
    final userRepository = UserRepositoryImpl(store, auditService: auditService);
    final sedeRepository = SedeRepositoryImpl(store, auditService: auditService);
    final academicConfigRepository = AcademicConfigRepositoryImpl(
      store,
      auditService: auditService,
    );

    final gradingScaleService = const GradingScaleService();
    final academicCalendar = AcademicCalendarService(repository: academicConfigRepository);

    final authController = AuthController(
      authRepository: authRepository,
      userRepository: userRepository,
    );
    final sessionActivity = SessionActivityController(
      onTimeout: () async {
        final session = authController.session;
        if (session != null) {
          await auditService.recordSession(
            session,
            accion: AuditActions.sessionExpired,
            entidad: 'usuarios',
            ipAddress: ClientContext.instance.ipAddress,
            userAgent: ClientContext.userAgent,
          );
        }
        await authController.logout();
      },
    );
    authController.onAuthenticated = sessionActivity.start;
    authController.onLoggedOut = sessionActivity.stop;

    return Squad1Container._(
      store: store,
      seed: seed,
      auditRepository: auditRepository,
      authRepository: authRepository,
      userRepository: userRepository,
      sedeRepository: sedeRepository,
      academicConfigRepository: academicConfigRepository,
      auditService: auditService,
      accessControl: accessControl,
      dataProtection: dataProtection,
      gradingScaleService: gradingScaleService,
      academicCalendar: academicCalendar,
      authController: authController,
      sessionActivity: sessionActivity,
      userAdminController: UserAdminController(
        userRepository: userRepository,
        accessControl: accessControl,
      ),
      directoryController: DirectoryController(
        userRepository: userRepository,
        accessControl: accessControl,
        dataProtection: dataProtection,
      ),
      sedeController: SedeController(sedeRepository: sedeRepository, accessControl: accessControl),
      academicConfigController: AcademicConfigController(
        repository: academicConfigRepository,
        accessControl: accessControl,
      ),
      auditController: AuditController(
        auditService: auditService,
        accessControl: accessControl,
        dataProtection: dataProtection,
      ),
    );
  }

  final InMemoryStore store;
  final SeedResult seed;

  final AuditRepository auditRepository;
  final AuthRepository authRepository;
  final UserRepository userRepository;
  final SedeRepository sedeRepository;
  final AcademicConfigRepository academicConfigRepository;

  final AuditService auditService;
  final AccessControlService accessControl;
  final DataProtectionService dataProtection;
  final GradingScaleService gradingScaleService;
  final AcademicCalendarService academicCalendar;

  final AuthController authController;
  final SessionActivityController sessionActivity;
  final UserAdminController userAdminController;
  final DirectoryController directoryController;
  final SedeController sedeController;
  final AcademicConfigController academicConfigController;
  final AuditController auditController;

  void dispose() {
    authController.dispose();
    sessionActivity.dispose();
    userAdminController.dispose();
    directoryController.dispose();
    sedeController.dispose();
    academicConfigController.dispose();
    auditController.dispose();
  }
}

/// Widget raíz que crea el [Squad1Container] una sola vez y lo publica en
/// el árbol. Envolver `Squad1Screen` (u otra pantalla del squad) con este
/// widget en el punto de entrada correspondiente.
class Squad1Root extends StatefulWidget {
  const Squad1Root({required this.child, super.key});

  final Widget child;

  @override
  State<Squad1Root> createState() => _Squad1RootState();
}

class _Squad1RootState extends State<Squad1Root> {
  late final Squad1Container container = Squad1Container.build();

  @override
  void dispose() {
    container.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Squad1Scope(container: container, child: widget.child);
  }
}

class Squad1Scope extends InheritedWidget {
  const Squad1Scope({required this.container, required super.child, super.key});

  final Squad1Container container;

  static Squad1Container of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<Squad1Scope>();
    assert(scope != null, 'Squad1Scope no encontrado en el árbol de widgets.');
    return scope!.container;
  }

  @override
  bool updateShouldNotify(Squad1Scope oldWidget) => container != oldWidget.container;
}
