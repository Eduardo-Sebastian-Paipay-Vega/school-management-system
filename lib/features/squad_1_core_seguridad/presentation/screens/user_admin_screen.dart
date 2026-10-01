import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../shared/validators.dart';
import '../controllers/user_admin_controller.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';

/// RF-05 (alta individual) y RF-06 (importación masiva `.csv`/`.xlsx`) de
/// personal institucional.
class UserAdminScreen extends StatelessWidget {
  const UserAdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('RF-05 / RF-06 · Alta de Personal'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Alta individual (RF-05)'),
              Tab(text: 'Importación masiva (RF-06)'),
            ],
          ),
        ),
        body: const TabBarView(children: [_CreateUserTab(), _ImportUsersTab()]),
      ),
    );
  }
}

class _CreateUserTab extends StatefulWidget {
  const _CreateUserTab();

  @override
  State<_CreateUserTab> createState() => _CreateUserTabState();
}

class _CreateUserTabState extends State<_CreateUserTab> {
  final _formKey = GlobalKey<FormState>();
  final _dniController = TextEditingController();
  final _nombresController = TextEditingController();
  final _apellidosController = TextEditingController();
  final _emailController = TextEditingController();
  final _telefonoController = TextEditingController();
  AppRole _rol = AppRole.docente;

  @override
  void dispose() {
    _dniController.dispose();
    _nombresController.dispose();
    _apellidosController.dispose();
    _emailController.dispose();
    _telefonoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = Squad1Scope.of(context).userAdminController;
    final session = Squad1Scope.of(context).authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  controller: _dniController,
                  decoration: const InputDecoration(labelText: 'DNI (8 dígitos)', border: OutlineInputBorder()),
                  validator: Validators.validateDni,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _nombresController,
                  decoration: const InputDecoration(labelText: 'Nombres', border: OutlineInputBorder()),
                  validator: (v) => Validators.validateRequired(v, 'Los nombres'),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _apellidosController,
                  decoration: const InputDecoration(labelText: 'Apellidos', border: OutlineInputBorder()),
                  validator: (v) => Validators.validateRequired(v, 'Los apellidos'),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Correo institucional', border: OutlineInputBorder()),
                  validator: Validators.validateEmail,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _telefonoController,
                  decoration: const InputDecoration(labelText: 'Teléfono (opcional)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<AppRole>(
                  value: _rol,
                  decoration: const InputDecoration(labelText: 'Rol inicial', border: OutlineInputBorder()),
                  items: AppRole.values
                      .map((r) => DropdownMenuItem(value: r, child: Text(r.label)))
                      .toList(),
                  onChanged: (v) => setState(() => _rol = v!),
                ),
                if (controller.errorMessage != null) ...[
                  const SizedBox(height: 8),
                  Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
                ],
                if (controller.lastCreatedUser != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.attendancePresente.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Usuario ${controller.lastCreatedUser!.nombreCompleto} creado. '
                      'Credencial provisional enviada; debe cambiar su clave en el primer ingreso.',
                      style: const TextStyle(fontSize: 12, color: AppTheme.attendancePresente),
                    ),
                  ),
                ],
                const SizedBox(height: 14),
                AsyncActionButton(
                  label: 'Registrar personal',
                  icon: Icons.person_add_alt,
                  isLoading: controller.isLoading,
                  onPressed: () {
                    if (!_formKey.currentState!.validate()) return Future.value(false);
                    return controller.createUser(
                      actingSession: session,
                      dni: _dniController.text.trim(),
                      nombres: _nombresController.text.trim(),
                      apellidos: _apellidosController.text.trim(),
                      email: _emailController.text.trim(),
                      rolInicial: _rol,
                      telefono: _telefonoController.text.trim().isEmpty ? null : _telefonoController.text.trim(),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ImportUsersTab extends StatefulWidget {
  const _ImportUsersTab();

  @override
  State<_ImportUsersTab> createState() => _ImportUsersTabState();
}

class _ImportUsersTabState extends State<_ImportUsersTab> {
  String? _pickedFileName;

  Future<void> _pickAndImport(UserAdminController controller, AuthSession session) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv', 'xlsx'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.single;
    final bytes = file.bytes;
    if (bytes == null) return;
    setState(() => _pickedFileName = file.name);

    if (file.name.toLowerCase().endsWith('.csv')) {
      await controller.importFromCsv(actingSession: session, csvContent: utf8.decode(bytes));
    } else {
      await controller.importFromXlsx(actingSession: session, bytes: bytes);
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Squad1Scope.of(context).userAdminController;
    final session = Squad1Scope.of(context).authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Plantilla reglamentaria: columnas dni, nombres, apellidos, email, rol[, telefono] '
                '(.csv o .xlsx).',
                style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 12),
              AsyncActionButton(
                label: _pickedFileName ?? 'Seleccionar archivo',
                icon: Icons.upload_file,
                isLoading: controller.isLoading,
                onPressed: () async {
                  await _pickAndImport(controller, session);
                  return controller.lastImportReport != null && controller.errorMessage == null;
                },
              ),
              if (controller.errorMessage != null) ...[
                const SizedBox(height: 8),
                Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
              ],
              if (controller.lastImportReport != null) ...[
                const SizedBox(height: 16),
                _ImportReportCard(controller: controller),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ImportReportCard extends StatelessWidget {
  const _ImportReportCard({required this.controller});

  final UserAdminController controller;

  @override
  Widget build(BuildContext context) {
    final report = controller.lastImportReport!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${report.importedCount} usuarios importados de ${report.totalRows} filas · '
              '${report.rejectedCount} rechazadas',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            if (report.rejected.isNotEmpty) ...[
              const SizedBox(height: 10),
              ...report.rejected.map((r) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      'Fila ${r.rowNumber}: ${r.reason}',
                      style: const TextStyle(fontSize: 12, color: AppTheme.attendanceFalta),
                    ),
                  )),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () => controller.exportLastImportReport(tenantName: 'Sede activa'),
                icon: const Icon(Icons.picture_as_pdf_outlined, size: 18),
                label: const Text('Descargar reporte de rechazados (PDF)'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
