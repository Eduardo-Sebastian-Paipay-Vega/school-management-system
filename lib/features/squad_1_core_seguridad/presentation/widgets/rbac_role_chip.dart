import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/role.dart';

/// Selector visual de roles (RF-04). En modo editable permite alternar la
/// pertenencia de cada rol; en modo solo lectura únicamente resalta los
/// roles vigentes del usuario.
class RbacRoleChips extends StatelessWidget {
  const RbacRoleChips({
    required this.selected,
    this.onChanged,
    super.key,
  });

  final Set<AppRole> selected;
  final ValueChanged<Set<AppRole>>? onChanged;

  bool get isReadOnly => onChanged == null;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 4,
      children: AppRole.values.map((role) {
        final isSelected = selected.contains(role);
        return ChoiceChip(
          label: Text(role.label),
          selected: isSelected,
          selectedColor: AppTheme.primary,
          labelStyle: TextStyle(
            color: isSelected ? Colors.white : AppTheme.textDark,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
          onSelected: isReadOnly
              ? null
              : (value) {
                  final updated = Set<AppRole>.from(selected);
                  if (value) {
                    updated.add(role);
                  } else {
                    if (updated.length > 1) updated.remove(role);
                  }
                  onChanged!(updated);
                },
        );
      }).toList(),
    );
  }
}
