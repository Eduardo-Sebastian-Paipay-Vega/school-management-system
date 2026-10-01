import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/institutional_params.dart';

/// Previsualización del membrete institucional (RF-14), tal como se
/// insertará en boletas, actas y el encabezado de la página pública.
class LetterheadPreview extends StatelessWidget {
  const LetterheadPreview({required this.params, super.key});

  final InstitutionalParams params;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.unschBlue, width: 1.5),
        borderRadius: BorderRadius.circular(10),
        color: Colors.white,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppTheme.backgroundLight,
            backgroundImage: params.escudoBytes != null ? MemoryImage(params.escudoBytes!) : null,
            child: params.escudoBytes == null
                ? const Icon(Icons.shield_outlined, color: AppTheme.unschBlue)
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  params.nombreOficial,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textDark),
                ),
                const SizedBox(height: 2),
                Text(
                  params.lemaDelAnio,
                  style: const TextStyle(fontStyle: FontStyle.italic, fontSize: 12, color: AppTheme.unschBlue),
                ),
                const SizedBox(height: 6),
                Text('Director General: ${params.directorGeneralNombre}', style: const TextStyle(fontSize: 11)),
                const Divider(height: 16),
                Text(
                  params.piePaginaBoletas,
                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
