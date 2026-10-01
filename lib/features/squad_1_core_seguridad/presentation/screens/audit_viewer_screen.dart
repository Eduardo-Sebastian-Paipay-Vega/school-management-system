import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/change_history_entry.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/audit_row_widget.dart';
import '../widgets/change_timeline.dart';

/// Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría — RF-65
/// (estado de integridad de la cadena), RF-67 (filtros + exportación
/// forense) y RF-66 (historial de una nota/asistencia puntual).
class AuditViewerScreen extends StatefulWidget {
  const AuditViewerScreen({super.key});

  @override
  State<AuditViewerScreen> createState() => _AuditViewerScreenState();
}

class _AuditViewerScreenState extends State<AuditViewerScreen> {
  final _userIdController = TextEditingController();
  final _recordIdController = TextEditingController();
  List<ChangeHistoryEntry>? _historyResult;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final scope = Squad1Scope.of(context);
      scope.auditController.query(actingSession: scope.authController.session!);
    });
  }

  @override
  void dispose() {
    _userIdController.dispose();
    _recordIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.auditController;
    final session = scope.authController.session!;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('RF-65/66/67 · Auditoría'),
          bottom: const TabBar(tabs: [
            Tab(text: 'Bitácora (RF-65/67)'),
            Tab(text: 'Historial de cambios (RF-66)'),
          ]),
        ),
        body: TabBarView(
          children: [
            ListenableBuilder(
              listenable: controller,
              builder: (context, _) => Column(
                children: [
                  if (controller.chainVerified != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      color: controller.chainVerified!
                          ? AppTheme.attendancePresente.withValues(alpha: 0.12)
                          : AppTheme.attendanceFalta.withValues(alpha: 0.12),
                      child: Row(
                        children: [
                          Icon(
                            controller.chainVerified! ? Icons.verified_outlined : Icons.warning_amber_outlined,
                            color: controller.chainVerified! ? AppTheme.attendancePresente : AppTheme.attendanceFalta,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            controller.chainVerified!
                                ? 'Cadena de hashes íntegra (RF-65): ningún registro fue alterado.'
                                : '¡Alerta! La cadena de auditoría presenta inconsistencias.',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _userIdController,
                            decoration: const InputDecoration(
                              labelText: 'Filtrar por ID de usuario',
                              isDense: true,
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.filter_alt),
                          tooltip: 'Aplicar filtro',
                          onPressed: () {
                            controller.userIdFilter =
                                _userIdController.text.trim().isEmpty ? null : _userIdController.text.trim();
                            controller.query(actingSession: session);
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.picture_as_pdf_outlined),
                          tooltip: 'Exportar PDF sellado (RF-67)',
                          onPressed: () => controller.exportToPdf(actingSession: session, tenantName: session.tenantId),
                        ),
                      ],
                    ),
                  ),
                  if (controller.isLoading) const LinearProgressIndicator(),
                  if (controller.errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta)),
                    ),
                  Expanded(
                    child: ListView(
                      children: controller.entries.map((e) => AuditLogRow(entry: e)).toList(),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _recordIdController,
                          decoration: const InputDecoration(
                            labelText: 'ID de la nota/asistencia',
                            border: OutlineInputBorder(),
                            isDense: true,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton(
                        onPressed: () async {
                          final history = await controller.changeHistoryOf(
                            tenantId: session.tenantId,
                            recordId: _recordIdController.text.trim(),
                          );
                          setState(() => _historyResult = history);
                        },
                        child: const Text('Buscar'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: _historyResult == null
                        ? const Center(
                            child: Text('Ingrese un ID para ver su trazabilidad histórica.', style: TextStyle(color: AppTheme.textMuted)),
                          )
                        : SingleChildScrollView(child: ChangeTimeline(entries: _historyResult!)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
