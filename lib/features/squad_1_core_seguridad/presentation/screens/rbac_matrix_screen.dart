import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';

/// RF-04: matriz RBAC de solo lectura — qué permiso concede cada uno de
/// los 5 perfiles normativos. La aplicación efectiva de estas reglas
/// ocurre en `AccessControlService.authorize` en cada pantalla/acción.
class RbacMatrixScreen extends StatelessWidget {
  const RbacMatrixScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RF-04 · Matriz RBAC')),
      body: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: DataTable(
            columns: [
              const DataColumn(label: Text('Permiso')),
              ...AppRole.values.map((r) => DataColumn(label: Text(r.label))),
            ],
            rows: Permission.values.map((permission) {
              return DataRow(cells: [
                DataCell(Text(permission.name, style: const TextStyle(fontFamily: 'monospace', fontSize: 12))),
                ...AppRole.values.map((role) {
                  final granted = RbacPolicy.permissionsOf(role).contains(permission);
                  return DataCell(
                    Icon(
                      granted ? Icons.check_circle : Icons.remove_circle_outline,
                      color: granted ? AppTheme.attendancePresente : AppTheme.textMuted,
                      size: 18,
                    ),
                  );
                }),
              ]);
            }).toList(),
          ),
        ),
      ),
    );
  }
}
