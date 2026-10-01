import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/audit_log_entry.dart';

/// Fila de la bitácora forense (RF-67): acción, usuario, IP y hora, con
/// panel expandible de diferencias cromáticas rojo/verde entre
/// `payloadAnterior` y `payloadNuevo`.
class AuditLogRow extends StatelessWidget {
  const AuditLogRow({required this.entry, super.key});

  final AuditLogEntry entry;

  bool get _isSecurityEvent => entry.accion.startsWith('AUTH_') || entry.accion.startsWith('RBAC_');

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      leading: Icon(
        _isSecurityEvent ? Icons.shield_outlined : Icons.edit_note,
        color: entry.accion.contains('FAILED') || entry.accion.contains('DENIED')
            ? AppTheme.attendanceFalta
            : AppTheme.primary,
      ),
      title: Text(
        entry.accion,
        style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 13),
      ),
      subtitle: Text(
        '${entry.usuarioDisplay} · ${entry.entidad} · ${entry.ipAddress} · '
        '${entry.createdAt.toIso8601String()}',
        style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DiffView(before: entry.payloadAnterior, after: entry.payloadNuevo),
              const SizedBox(height: 6),
              SelectableText(
                'hash: ${entry.hash}\nprev: ${entry.previousHash}',
                style: const TextStyle(fontSize: 9, color: AppTheme.textMuted, fontFamily: 'monospace'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Comparación campo a campo entre dos mapas: rojo = valor eliminado,
/// verde = valor nuevo (criterio de aceptación de RF-67).
class DiffView extends StatelessWidget {
  const DiffView({this.before, this.after, super.key});

  final Map<String, dynamic>? before;
  final Map<String, dynamic>? after;

  @override
  Widget build(BuildContext context) {
    if (before == null && after == null) {
      return const Text('Sin datos adicionales.', style: TextStyle(fontSize: 11, color: AppTheme.textMuted));
    }
    final keys = {...?before?.keys, ...?after?.keys};
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: keys.map((key) {
        final oldValue = before?[key];
        final newValue = after?[key];
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text('$key: ', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              if (oldValue != null && oldValue != newValue)
                Container(
                  margin: const EdgeInsets.only(right: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  color: AppTheme.attendanceFalta.withValues(alpha: 0.15),
                  child: Text(
                    '$oldValue',
                    style: const TextStyle(
                      fontSize: 11,
                      decoration: TextDecoration.lineThrough,
                      color: AppTheme.attendanceFalta,
                    ),
                  ),
                ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                color: AppTheme.attendancePresente.withValues(alpha: 0.15),
                child: Text(
                  '$newValue',
                  style: const TextStyle(fontSize: 11, color: AppTheme.attendancePresente),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
