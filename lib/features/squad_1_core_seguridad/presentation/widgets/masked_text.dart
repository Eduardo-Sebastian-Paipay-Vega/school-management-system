import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Campo sensible enmascarado (RF-68). Al desenmascarar exige un motivo
/// justificado y vuelve a ocultar el valor automáticamente a los 10s.
class MaskedText extends StatefulWidget {
  const MaskedText({
    required this.maskedValue,
    required this.onUnmask,
    this.canUnmask = true,
    super.key,
  });

  final String maskedValue;
  final bool canUnmask;

  /// Devuelve el valor en claro, o `null` si fue denegado (403) o el
  /// usuario canceló el diálogo de motivo.
  final Future<String?> Function(String reason) onUnmask;

  @override
  State<MaskedText> createState() => _MaskedTextState();
}

class _MaskedTextState extends State<MaskedText> {
  String? _revealed;
  bool _loading = false;

  Future<void> _promptAndUnmask() async {
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Desenmascarar dato sensible (Ley 29733)'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'Motivo (mínimo 5 caracteres)',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, reasonController.text.trim()),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
    if (reason == null || reason.isEmpty) return;

    setState(() => _loading = true);
    final value = await widget.onUnmask(reason);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _revealed = value;
    });
    if (value != null) {
      Future.delayed(const Duration(seconds: 10), () {
        if (mounted) setState(() => _revealed = null);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          _revealed ?? widget.maskedValue,
          style: TextStyle(
            fontFamily: 'monospace',
            color: _revealed != null ? AppTheme.textDark : AppTheme.textMuted,
            fontWeight: _revealed != null ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        if (widget.canUnmask) ...[
          const SizedBox(width: 4),
          if (_loading)
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            InkWell(
              onTap: _revealed == null ? _promptAndUnmask : () => setState(() => _revealed = null),
              child: Icon(
                _revealed == null ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 16,
                color: AppTheme.unschBlue,
              ),
            ),
        ],
      ],
    );
  }
}
