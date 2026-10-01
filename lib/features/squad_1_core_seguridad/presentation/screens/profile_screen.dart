import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../shared/validators.dart';
import '../controllers/auth_controller.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';
import '../widgets/rbac_role_chip.dart';

/// RF-09: gestión de perfil personal (teléfono, foto) y cambio autónomo
/// de contraseña con verificación de la clave actual.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _profileFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Squad1Scope.of(context).authController;
    final session = auth.session!;
    return Scaffold(
      appBar: AppBar(title: const Text('RF-09 · Mi Perfil')),
      body: ListenableBuilder(
        listenable: auth,
        builder: (context, _) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(session.nombreCompleto, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('Usuario: ${session.username}', style: const TextStyle(color: AppTheme.textMuted)),
                        const SizedBox(height: 8),
                        RbacRoleChips(selected: session.roles),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: _profileFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Actualizar teléfono de contacto', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 10),
                          TextFormField(
                            controller: _phoneController,
                            decoration: const InputDecoration(labelText: 'Teléfono', border: OutlineInputBorder()),
                          ),
                          const SizedBox(height: 10),
                          AsyncActionButton(
                            label: 'Guardar perfil',
                            icon: Icons.save_outlined,
                            isLoading: auth.isLoading,
                            onPressed: () => auth.updateOwnProfile(telefono: _phoneController.text.trim()),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: _passwordFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Cambiar contraseña', style: TextStyle(fontWeight: FontWeight.bold)),
                          const Text(
                            'Al cambiarla se cerrarán las demás sesiones activas.',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                          const SizedBox(height: 10),
                          TextFormField(
                            controller: _currentPasswordController,
                            obscureText: true,
                            decoration: const InputDecoration(labelText: 'Contraseña actual', border: OutlineInputBorder()),
                            validator: (v) => Validators.validateRequired(v, 'La contraseña actual'),
                          ),
                          const SizedBox(height: 10),
                          TextFormField(
                            controller: _newPasswordController,
                            obscureText: true,
                            decoration: const InputDecoration(labelText: 'Nueva contraseña', border: OutlineInputBorder()),
                            validator: Validators.validatePassword,
                          ),
                          if (auth.errorMessage != null) ...[
                            const SizedBox(height: 8),
                            Text(auth.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
                          ],
                          const SizedBox(height: 10),
                          AsyncActionButton(
                            label: 'Cambiar contraseña',
                            icon: Icons.lock_reset,
                            isLoading: auth.isLoading,
                            backgroundColor: AppTheme.unschBlue,
                            onPressed: () async {
                              if (!_passwordFormKey.currentState!.validate()) return false;
                              final ok = await auth.changeOwnPassword(
                                currentPassword: _currentPasswordController.text,
                                newPassword: _newPasswordController.text,
                              );
                              if (ok && mounted) Navigator.popUntil(context, (route) => route.isFirst);
                              return ok;
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
        ),
      ),
    );
  }
}
