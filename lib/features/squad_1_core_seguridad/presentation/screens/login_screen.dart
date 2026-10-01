import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../shared/validators.dart';
import '../controllers/auth_controller.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';
import 'reset_password_screen.dart';

/// RF-01: autenticación segura con código de institución, DNI/usuario y
/// contraseña. Emite el par de tokens JWT (RF-01) y arranca el vigía de
/// inactividad de RF-02 al autenticar con éxito.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tenantController = TextEditingController(text: '0382910');
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _tenantController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<bool> _submit(AuthController auth) async {
    if (!_formKey.currentState!.validate()) return false;
    return auth.login(
      tenantModularCode: _tenantController.text.trim(),
      usernameOrDni: _usernameController.text.trim(),
      password: _passwordController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Squad1Scope.of(context).authController;
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: ListenableBuilder(
              listenable: auth,
              builder: (context, _) => Card(
                elevation: 3,
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield, color: AppTheme.primary, size: 36),
                        const SizedBox(height: 8),
                        const Text(
                          'Acceso Institucional',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                        ),
                        const Text(
                          'RF-01 · Squad 1: Core y Seguridad',
                          style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: _tenantController,
                          decoration: const InputDecoration(
                            labelText: 'Código modular de la institución',
                            prefixIcon: Icon(Icons.apartment),
                            border: OutlineInputBorder(),
                          ),
                          validator: (v) => Validators.validateRequired(v, 'El código modular'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _usernameController,
                          decoration: const InputDecoration(
                            labelText: 'DNI / Usuario institucional',
                            prefixIcon: Icon(Icons.person),
                            border: OutlineInputBorder(),
                          ),
                          validator: (v) => Validators.validateRequired(v, 'El usuario'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscure,
                          decoration: InputDecoration(
                            labelText: 'Contraseña',
                            prefixIcon: const Icon(Icons.lock),
                            border: const OutlineInputBorder(),
                            suffixIcon: IconButton(
                              icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                              onPressed: () => setState(() => _obscure = !_obscure),
                            ),
                          ),
                          onFieldSubmitted: (_) => _submit(auth),
                          validator: (v) => (v == null || v.isEmpty) ? 'Ingrese su contraseña.' : null,
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ResetPasswordScreen()),
                            ),
                            child: const Text('¿Olvidó su contraseña?'),
                          ),
                        ),
                        if (auth.errorMessage != null) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.attendanceFalta.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              auth.errorMessage!,
                              style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12),
                            ),
                          ),
                          const SizedBox(height: 8),
                        ],
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: AsyncActionButton(
                            label: 'Iniciar sesión',
                            icon: Icons.login,
                            isLoading: auth.isLoading,
                            onPressed: () => _submit(auth),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Divider(),
                        const Text(
                          'Demo: Sede Secundaria "0382910" · DNI 70859632 (SUPERADMIN) · Clave Demo2026!',
                          style: TextStyle(fontSize: 10, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
