import 'package:flutter/foundation.dart';

import '../../data/export/pdf_exporter.dart';
import '../../data/import/user_import_parser.dart';
import '../../domain/models/import_report.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/models/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/services/access_control_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Alta individual (RF-05) e importación masiva (RF-06) de personal.
/// Cada acción exige el permiso RBAC correspondiente (RF-04) antes de
/// tocar el repositorio.
class UserAdminController extends ChangeNotifier {
  UserAdminController({
    required UserRepository userRepository,
    required AccessControlService accessControl,
    UserImportParser? parser,
    PdfExporter? pdfExporter,
  })  : _userRepository = userRepository,
        _accessControl = accessControl,
        _parser = parser ?? const UserImportParser(),
        _pdfExporter = pdfExporter ?? const PdfExporter();

  final UserRepository _userRepository;
  final AccessControlService _accessControl;
  final UserImportParser _parser;
  final PdfExporter _pdfExporter;

  bool isLoading = false;
  String? errorMessage;
  User? lastCreatedUser;
  ImportReport? lastImportReport;

  Future<bool> createUser({
    required AuthSession actingSession,
    required String dni,
    required String nombres,
    required String apellidos,
    required String email,
    required AppRole rolInicial,
    String? telefono,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.usersCreate,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      lastCreatedUser = await _userRepository.createUser(
        tenantId: actingSession.tenantId,
        dni: dni,
        nombres: nombres,
        apellidos: apellidos,
        email: email,
        rolInicial: rolInicial,
        telefono: telefono,
        actor: _actorFrom(actingSession),
      );
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> importFromCsv({
    required AuthSession actingSession,
    required String csvContent,
  }) async {
    return _runImport(actingSession, () => _parser.parseCsv(csvContent));
  }

  Future<bool> importFromXlsx({
    required AuthSession actingSession,
    required Uint8List bytes,
  }) async {
    return _runImport(actingSession, () => _parser.parseXlsx(bytes));
  }

  Future<bool> _runImport(
    AuthSession actingSession,
    List<UserImportRow> Function() parse,
  ) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.usersImport,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      final rows = parse();
      lastImportReport = await _userRepository.importUsers(
        tenantId: actingSession.tenantId,
        rows: rows,
        actor: _actorFrom(actingSession),
      );
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// RF-06: descarga en PDF el detalle de filas rechazadas del último import.
  Future<void> exportLastImportReport({required String tenantName}) async {
    final report = lastImportReport;
    if (report == null) return;
    final bytes = await _pdfExporter.buildImportRejectionReport(
      report: report,
      tenantName: tenantName,
    );
    await _pdfExporter.printOrShare(bytes, 'reporte-importacion-rf06.pdf');
  }

  ActorContext _actorFrom(AuthSession session) => ActorContext(
        session: session,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
}
