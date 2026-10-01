import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';

/// Oculta (o reemplaza por un aviso) cualquier parte de la UI a la que el
/// rol activo no tenga acceso (RF-04): gobierna pantallas, no solo
/// endpoints, replicando en el cliente la misma matriz RBAC del backend.
class RbacGuard extends StatelessWidget {
  const RbacGuard({
    required this.session,
    required this.permission,
    required this.child,
    this.showDeniedMessage = true,
    super.key,
  });

  final AuthSession session;
  final Permission permission;
  final Widget child;
  final bool showDeniedMessage;

  @override
  Widget build(BuildContext context) {
    if (RbacPolicy.grants(session.roles, permission)) return child;
    if (!showDeniedMessage) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.attendanceFalta.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.attendanceFalta.withValues(alpha: 0.4)),
      ),
      child: const Row(
        children: [
          Icon(Icons.block, color: AppTheme.attendanceFalta),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Acceso denegado (403). Su rol no tiene permiso para ver esta sección.',
              style: TextStyle(color: AppTheme.attendanceFalta, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
