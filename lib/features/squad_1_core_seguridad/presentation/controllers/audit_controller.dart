import 'package:flutter/foundation.dart';

import '../../data/export/pdf_exporter.dart';
import '../../domain/models/audit_log_entry.dart';
import '../../domain/models/change_history_entry.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/services/access_control_service.dart';
import '../../domain/services/audit_service.dart';
import '../../domain/services/data_protection_service.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Bitácora forense de auditoría — Módulo 12 (RF-65, RF-66, RF-67).
class AuditController extends ChangeNotifier {
  AuditController({
    required AuditService auditService,
    required AccessControlService accessControl,
    required DataProtectionService dataProtection,
    PdfExporter? pdfExporter,
  })  : _auditService = auditService,
        _accessControl = accessControl,
        _dataProtection = dataProtection,
        _pdfExporter = pdfExporter ?? const PdfExporter();

  final AuditService _auditService;
  final AccessControlService _accessControl;
  final DataProtectionService _dataProtection;
  final PdfExporter _pdfExporter;

  bool isLoading = false;
  String? errorMessage;
  List<AuditLogEntry> entries = const [];
  bool? chainVerified;

  DateTime? from;
  DateTime? to;
  String? moduloFilter;
  String? userIdFilter;
  String? ipFilter;

  /// RF-67: consulta forense filtrable (requiere `auditView`); la propia
  /// consulta queda auditada por `AuditService.queryLogsAudited`.
  Future<void> query({required AuthSession actingSession}) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.auditView,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      entries = await _auditService.queryLogsAudited(
        requestedBy: actingSession,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
        from: from,
        to: to,
        modulo: moduloFilter,
        userId: userIdFilter,
        ipFilter: ipFilter,
      );
      // RF-65: verificación de integridad de la cadena de hashes.
      chainVerified = _auditService.verifyChain(actingSession.tenantId);
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// RF-67: exportación sellada en PDF (requiere `auditExport`).
  Future<bool> exportToPdf({required AuthSession actingSession, required String tenantName}) async {
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.auditExport,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      final bytes = await _pdfExporter.buildAuditExport(
        entries: entries,
        tenantName: tenantName,
        requestedBy: actingSession.nombreCompleto,
      );
      await _pdfExporter.printOrShare(bytes, 'bitacora-auditoria-rf67.pdf');
      await _auditService.recordSession(
        actingSession,
        accion: AuditActions.auditExported,
        entidad: 'audit_logs',
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
        payloadNuevo: {'totalRegistros': entries.length},
      );
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  /// RF-66: historial de versiones de una nota/asistencia puntual.
  Future<List<ChangeHistoryEntry>> changeHistoryOf({
    required String tenantId,
    required String recordId,
  }) {
    return _auditService.changeHistoryOf(tenantId: tenantId, recordId: recordId);
  }

  /// RF-68: desenmascara el `payloadAnterior`/`payloadNuevo` de un campo
  /// sensible mostrado en la bitácora, bajo motivo justificado.
  Future<String?> unmask({
    required AuthSession actingSession,
    required String storedCipherText,
    required String fieldName,
    required String reason,
  }) async {
    try {
      return await _dataProtection.unmask(
        requester: actingSession,
        storedCipherText: storedCipherText,
        fieldName: fieldName,
        reason: reason,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }
}
