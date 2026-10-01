import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../shared/validators.dart';
import '../controllers/auth_controller.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';

/// RF-03: restablecimiento asistido de contraseña mediante token de un
/// solo uso con vigencia de 30 minutos. Sin servidor SMTP real, el token
/// se muestra en una "bandeja simulada" dentro de la propia pantalla.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _requestFormKey = GlobalKey<FormState>();
  final _confirmFormKey = GlobalKey<FormState>();
  final _dniOrEmailController = TextEditingController();
  final _tokenController = TextEditingController();
  final _newPasswordController = TextEditingController();

  @override
  void dispose() {
    _dniOrEmailController.dispose();
    _tokenController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Squad1Scope.of(context).authController;
    return Scaffold(
      appBar: AppBar(title: const Text('RF-03 · Restablecer Contraseña')),
      body: ListenableBuilder(
        listenable: auth,
        builder: (context, _) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildRequestCard(auth),
                const SizedBox(height: 16),
                if (auth.lastPasswordResetToken != null) _buildSimulatedInboxCard(auth),
                const SizedBox(height: 16),
                _buildConfirmCard(auth),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRequestCard(AuthController auth) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _requestFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('1. Solicitar enlace de restablecimiento',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              TextFormField(
                controller: _dniOrEmailController,
                decoration: const InputDecoration(
                  labelText: 'DNI o correo institucional',
                  border: OutlineInputBorder(),
                ),
                validator: (v) => Validators.validateRequired(v, 'Este campo'),
              ),
              const SizedBox(height: 10),
              AsyncActionButton(
                label: 'Enviar enlace',
                icon: Icons.mail_outline,
                isLoading: auth.isLoading,
                onPressed: () async {
                  if (!_requestFormKey.currentState!.validate()) return false;
                  return auth.requestPasswordReset(_dniOrEmailController.text.trim());
                },
              ),
              if (auth.errorMessage != null) ...[
                const SizedBox(height: 8),
                Text(auth.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSimulatedInboxCard(AuthController auth) {
    return Card(
      color: AppTheme.backgroundLight,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.inbox, size: 16, color: AppTheme.unschBlue),
                SizedBox(width: 6),
                Text('Bandeja simulada (sin SMTP real)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Enlace de un solo uso, vigente 30 minutos:',
              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
            SelectableText(
              auth.lastPasswordResetToken!,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
            ),
            TextButton(
              onPressed: () => setState(() => _tokenController.text = auth.lastPasswordResetToken!),
              child: const Text('Usar este token'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConfirmCard(AuthController auth) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _confirmFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('2. Confirmar nueva contraseña', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              TextFormField(
                controller: _tokenController,
                decoration: const InputDecoration(labelText: 'Token recibido', border: OutlineInputBorder()),
                validator: (v) => Validators.validateRequired(v, 'El token'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _newPasswordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Nueva contraseña', border: OutlineInputBorder()),
                validator: Validators.validatePassword,
              ),
              const SizedBox(height: 10),
              AsyncActionButton(
                label: 'Restablecer contraseña',
                icon: Icons.lock_reset,
                isLoading: auth.isLoading,
                onPressed: () async {
                  if (!_confirmFormKey.currentState!.validate()) return false;
                  final ok = await auth.confirmPasswordReset(
                    rawToken: _tokenController.text.trim(),
                    newPassword: _newPasswordController.text,
                  );
                  if (ok && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Contraseña actualizada. Ya puede iniciar sesión.')),
                    );
                    Navigator.pop(context);
                  }
                  return ok;
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
