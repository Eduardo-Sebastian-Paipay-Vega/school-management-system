import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/privacy_policy_dialog.dart';
import '../widgets/session_timer_widget.dart';
import 'academic_config_screen.dart';
import 'audit_viewer_screen.dart';
import 'directory_screen.dart';
import 'login_screen.dart';
import 'profile_screen.dart';
import 'rbac_matrix_screen.dart';
import 'sdd_viewer_screen.dart';
import 'sedes_screen.dart';
import 'user_admin_screen.dart';

/// Pantalla Principal del Squad 1: Core, Seguridad, Configuración y Auditoría.
/// Responsable: Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
///
/// Encapsula su propio [Squad1Root] de composición para no requerir
/// cambios en `main.dart`: mientras no haya sesión activa se muestra
/// [LoginScreen] (RF-01); autenticado, se despliega el hub de los 18 RFs
/// bajo el vigía de inactividad de RF-02.
class Squad1Screen extends StatelessWidget {
  const Squad1Screen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Squad1Root(child: _Squad1Gate());
  }
}

class _Squad1Gate extends StatelessWidget {
  const _Squad1Gate();

  @override
  Widget build(BuildContext context) {
    final auth = Squad1Scope.of(context).authController;
    return ListenableBuilder(
      listenable: auth,
      builder: (context, _) {
        if (!auth.isAuthenticated) return const LoginScreen();
        return const SessionTimerGate(child: _Squad1Hub());
      },
    );
  }
}

class _Squad1Hub extends StatefulWidget {
  const _Squad1Hub();

  @override
  State<_Squad1Hub> createState() => _Squad1HubState();
}

class _Squad1HubState extends State<_Squad1Hub> {
  bool _policyShown = false;

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final session = scope.authController.session!;

    if (!_policyShown) {
      _policyShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) showPrivacyPolicyDialog(context);
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 1: Core y Seguridad'),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu_book),
            tooltip: 'Ver SDD Oficial (IEEE 1016)',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SddViewerScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            tooltip: 'Mi perfil (RF-09)',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión (RF-02)',
            onPressed: () => scope.authController.logout(),
          ),
        ],
      ),
      // RF-04: la navegación principal solo ofrece los módulos para los
      // que el rol activo tiene permiso; el intento directo (ej. deep
      // link) igual queda bloqueado por `AccessControlService` en cada
      // controlador, que es la barrera de seguridad real.
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSessionCard(session),
          const SizedBox(height: 16),
          const Text('Módulo 1 — Acceso y Seguridad (RF-01..04)',
              style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          if (RbacPolicy.grants(session.roles, Permission.rbacView))
            _ModuleCard(
              icon: Icons.rule,
              title: 'Matriz RBAC',
              subtitle: 'RF-04 · Control de privilegios por rol',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RbacMatrixScreen())),
            ),
          const SizedBox(height: 16),
          const Text('Módulo 2 — Usuarios y Directorio (RF-05..09)',
              style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          if (RbacPolicy.grants(session.roles, Permission.usersCreate)) ...[
            _ModuleCard(
              icon: Icons.person_add_alt,
              title: 'Alta e Importación de Personal',
              subtitle: 'RF-05 alta individual · RF-06 importación masiva CSV/XLSX',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UserAdminScreen())),
            ),
            const SizedBox(height: 8),
          ],
          if (RbacPolicy.grants(session.roles, Permission.directoryView))
            _ModuleCard(
              icon: Icons.groups_2_outlined,
              title: 'Directorio Escolar',
              subtitle: 'RF-08 búsqueda y filtros · RF-04 roles · RF-68 datos enmascarados',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DirectoryScreen())),
            ),
          const SizedBox(height: 16),
          const Text('Módulo 3 — Configuración Escolar (RF-07, RF-10..14)',
              style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          if (RbacPolicy.grants(session.roles, Permission.sedesManage)) ...[
            _ModuleCard(
              icon: Icons.apartment,
              title: 'Sedes Multi-Tenant',
              subtitle: 'RF-07 · Aislamiento lógico por tenant_id',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SedesScreen())),
            ),
            const SizedBox(height: 8),
          ],
          if (RbacPolicy.grants(session.roles, Permission.academicYearManage))
            _ModuleCard(
              icon: Icons.settings_suggest_outlined,
              title: 'Configuración Escolar',
              subtitle: 'RF-10 año lectivo · RF-11 periodos · RF-12 secciones · RF-13 escala CNEB · RF-14 membrete',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AcademicConfigScreen())),
            ),
          const SizedBox(height: 16),
          const Text('Módulo 12 — Auditoría (RF-65..68)',
              style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          if (RbacPolicy.grants(session.roles, Permission.auditView)) ...[
            _ModuleCard(
              icon: Icons.history,
              title: 'Bitácora de Auditoría',
              subtitle: 'RF-65 inmutable · RF-66 historial de cambios · RF-67 búsqueda forense',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuditViewerScreen())),
            ),
            const SizedBox(height: 8),
          ],
          _ModuleCard(
            icon: Icons.privacy_tip_outlined,
            title: 'Protección de Datos Personales',
            subtitle: 'RF-68 · Ley N.° 29733',
            onTap: () => showPrivacyPolicyDialog(context),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionCard(AuthSession session) {
    return Card(
      color: AppTheme.primary,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              session.nombreCompleto,
              style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Roles: ${session.roles.map((AppRole r) => r.label).join(", ")}',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Access Token JWT activo (15 min) · Refresh Token 7 días · Tenant: ${session.tenantId.substring(0, 8)}…',
                style: const TextStyle(color: Colors.amberAccent, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  const _ModuleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(backgroundColor: AppTheme.backgroundLight, child: Icon(icon, color: AppTheme.primary)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
