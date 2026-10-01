import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../shared/validators.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';

/// RF-07: gestión de sedes multi-tenant. Cada sede creada aquí es un
/// `tenant_id` aislado; los usuarios de una sede jamás ven datos de otra.
class SedesScreen extends StatefulWidget {
  const SedesScreen({super.key});

  @override
  State<SedesScreen> createState() => _SedesScreenState();
}

class _SedesScreenState extends State<SedesScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _codigoController = TextEditingController();
  final _nivelController = TextEditingController(text: 'Secundaria');
  final _direccionController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _directorController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Squad1Scope.of(context).sedeController.loadAll();
    });
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _codigoController.dispose();
    _nivelController.dispose();
    _direccionController.dispose();
    _telefonoController.dispose();
    _directorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.sedeController;
    final session = scope.authController.session!;

    return Scaffold(
      appBar: AppBar(title: const Text('RF-07 · Sedes Multi-Tenant')),
      body: ListenableBuilder(
        listenable: controller,
        builder: (context, _) => Row(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: controller.sedes
                    .map((sede) => Card(
                          child: ListTile(
                            leading: Icon(
                              Icons.apartment,
                              color: sede.id == session.tenantId ? AppTheme.primary : AppTheme.textMuted,
                            ),
                            title: Text(sede.nombre),
                            subtitle: Text(
                              'Código modular: ${sede.codigoModular} · ${sede.nivelEducativo}\n'
                              'Director: ${sede.directorNombre}',
                            ),
                            trailing: sede.id == session.tenantId
                                ? const Chip(label: Text('Su sede'), visualDensity: VisualDensity.compact)
                                : null,
                            isThreeLine: true,
                          ),
                        ))
                    .toList(),
              ),
            ),
            SizedBox(
              width: 340,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Nueva sede', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: _nombreController,
                        decoration: const InputDecoration(labelText: 'Nombre', border: OutlineInputBorder()),
                        validator: (v) => Validators.validateRequired(v, 'El nombre'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _codigoController,
                        decoration: const InputDecoration(labelText: 'Código modular', border: OutlineInputBorder()),
                        validator: (v) => Validators.validateRequired(v, 'El código modular'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _nivelController,
                        decoration: const InputDecoration(labelText: 'Nivel educativo', border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _direccionController,
                        decoration: const InputDecoration(labelText: 'Dirección', border: OutlineInputBorder()),
                        validator: (v) => Validators.validateRequired(v, 'La dirección'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _telefonoController,
                        decoration: const InputDecoration(labelText: 'Teléfono', border: OutlineInputBorder()),
                        validator: (v) => Validators.validateRequired(v, 'El teléfono'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _directorController,
                        decoration: const InputDecoration(labelText: 'Director de sede', border: OutlineInputBorder()),
                        validator: (v) => Validators.validateRequired(v, 'El director'),
                      ),
                      if (controller.errorMessage != null) ...[
                        const SizedBox(height: 8),
                        Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
                      ],
                      const SizedBox(height: 12),
                      AsyncActionButton(
                        label: 'Crear sede',
                        icon: Icons.add_business,
                        isLoading: controller.isLoading,
                        onPressed: () {
                          if (!_formKey.currentState!.validate()) return Future.value(false);
                          return controller.createSede(
                            actingSession: session,
                            nombre: _nombreController.text.trim(),
                            codigoModular: _codigoController.text.trim(),
                            nivelEducativo: _nivelController.text.trim(),
                            direccion: _direccionController.text.trim(),
                            telefono: _telefonoController.text.trim(),
                            directorNombre: _directorController.text.trim(),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
