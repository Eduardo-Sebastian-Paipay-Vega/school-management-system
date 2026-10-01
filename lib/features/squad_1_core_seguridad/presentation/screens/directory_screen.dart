import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/models/user.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/masked_text.dart';
import '../widgets/rbac_role_chip.dart';

/// RF-08: directorio institucional con búsqueda en tiempo real y filtros;
/// incluye reasignación de roles (RF-04) y desenmascarado auditado del
/// teléfono de contacto (RF-68).
class DirectoryScreen extends StatefulWidget {
  const DirectoryScreen({super.key});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final scope = Squad1Scope.of(context);
      scope.directoryController.search(session: scope.authController.session!);
    });
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.directoryController;
    final session = scope.authController.session!;

    return Scaffold(
      appBar: AppBar(title: const Text('RF-08 · Directorio Escolar')),
      body: ListenableBuilder(
        listenable: controller,
        builder: (context, _) {
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: const InputDecoration(
                          hintText: 'Buscar por nombre, apellido o DNI…',
                          prefixIcon: Icon(Icons.search),
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        onChanged: (v) => controller.onQueryChanged(v, session: session),
                      ),
                    ),
                    const SizedBox(width: 8),
                    DropdownButton<AppRole?>(
                      value: controller.roleFilter,
                      hint: const Text('Rol'),
                      items: [
                        const DropdownMenuItem<AppRole?>(value: null, child: Text('Todos los roles')),
                        ...AppRole.values.map((r) => DropdownMenuItem(value: r, child: Text(r.label))),
                      ],
                      onChanged: (v) => controller.setRoleFilter(v, session: session),
                    ),
                  ],
                ),
              ),
              if (controller.isLoading) const LinearProgressIndicator(),
              Expanded(
                child: controller.results.isEmpty && !controller.isLoading
                    ? const Center(child: Text('Sin resultados.', style: TextStyle(color: AppTheme.textMuted)))
                    : ListView.builder(
                        itemCount: controller.results.length,
                        itemBuilder: (context, index) {
                          final user = controller.results[index];
                          return _DirectoryTile(user: user, session: session);
                        },
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Text(
                  '${controller.totalItems} resultados · página ${controller.page}',
                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _DirectoryTile extends StatelessWidget {
  const _DirectoryTile({required this.user, required this.session});

  final User user;
  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.directoryController;
    final canManageRbac = controller.canManageRbac(session);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primary,
          child: Text(user.nombres.isNotEmpty ? user.nombres[0] : '?', style: const TextStyle(color: Colors.white)),
        ),
        title: Text(user.nombreCompleto),
        subtitle: Text('${user.roles.map((r) => r.label).join(", ")} · ${user.estado.code}'),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('DNI: ${user.dni}', style: const TextStyle(fontSize: 12)),
                Text('Correo: ${user.email}', style: const TextStyle(fontSize: 12)),
                Row(
                  children: [
                    const Text('Teléfono: ', style: TextStyle(fontSize: 12)),
                    MaskedText(
                      maskedValue: scope.dataProtection.mask(user.telefono ?? 'No registrado'),
                      onUnmask: (reason) async {
                        final cipher = scope.dataProtection.encryptSensitive(user.telefono ?? 'No registrado');
                        return controller.unmaskField(
                          actingSession: session,
                          storedCipherText: cipher,
                          fieldName: 'telefono',
                          reason: reason,
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text('Roles (RF-04):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                RbacRoleChips(
                  selected: user.roles,
                  onChanged: canManageRbac
                      ? (roles) => controller.updateRoles(actingSession: session, userId: user.id, roles: roles)
                      : null,
                ),
                if (!canManageRbac)
                  const Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Text(
                      'Su rol no tiene permiso para reasignar roles (RBAC, RF-04).',
                      style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
