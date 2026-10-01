import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/change_history_entry.dart';

/// Línea de tiempo de versiones de una nota/asistencia (RF-66): quién
/// cambió, de qué valor a cuál, cuándo y bajo qué justificación.
class ChangeTimeline extends StatelessWidget {
  const ChangeTimeline({required this.entries, super.key});

  final List<ChangeHistoryEntry> entries;

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(12),
        child: Text('Sin historial de modificaciones registrado.', style: TextStyle(color: AppTheme.textMuted)),
      );
    }
    return Column(
      children: entries.map((entry) {
        return ListTile(
          dense: true,
          leading: CircleAvatar(
            radius: 12,
            backgroundColor: AppTheme.unschBlue,
            child: Text('v${entry.version}', style: const TextStyle(fontSize: 9, color: Colors.white)),
          ),
          title: Row(
            children: [
              Text(entry.previousValue, style: const TextStyle(decoration: TextDecoration.lineThrough, color: AppTheme.attendanceFalta)),
              const Icon(Icons.arrow_right_alt, size: 16),
              Text(entry.newValue, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.attendancePresente)),
            ],
          ),
          subtitle: Text(
            '${entry.authorDisplay} · ${entry.changedAt.toIso8601String()}\nMotivo: ${entry.justification}',
            style: const TextStyle(fontSize: 11),
          ),
          isThreeLine: true,
        );
      }).toList(),
    );
  }
}
