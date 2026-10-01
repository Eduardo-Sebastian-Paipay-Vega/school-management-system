import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Botón de acción con los 4 estados exigidos por `sdd_rules.md` §4.2:
/// inactivo, cargando (spinner), éxito (check transitorio) y error
/// (se refleja mostrando el mensaje de [errorText] junto al botón).
class AsyncActionButton extends StatefulWidget {
  const AsyncActionButton({
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.backgroundColor,
    super.key,
  });

  final String label;
  final IconData? icon;
  final Future<bool> Function() onPressed;
  final bool isLoading;
  final Color? backgroundColor;

  @override
  State<AsyncActionButton> createState() => _AsyncActionButtonState();
}

class _AsyncActionButtonState extends State<AsyncActionButton> {
  bool _justSucceeded = false;
  Timer? _resetTimer;

  @override
  void dispose() {
    _resetTimer?.cancel();
    super.dispose();
  }

  Future<void> _handleTap() async {
    if (widget.isLoading) return;
    final success = await widget.onPressed();
    if (!mounted) return;
    if (success) {
      setState(() => _justSucceeded = true);
      _resetTimer?.cancel();
      _resetTimer = Timer(const Duration(seconds: 2), () {
        if (mounted) setState(() => _justSucceeded = false);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final busy = widget.isLoading;
    return ElevatedButton.icon(
      onPressed: busy ? null : _handleTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: _justSucceeded
            ? AppTheme.attendancePresente
            : (widget.backgroundColor ?? AppTheme.primary),
      ),
      icon: busy
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
          : Icon(_justSucceeded ? Icons.check : widget.icon, size: 18),
      label: Text(busy ? 'Procesando…' : (_justSucceeded ? '¡Listo!' : widget.label)),
    );
  }
}
