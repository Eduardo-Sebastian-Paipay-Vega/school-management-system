import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../controllers/session_activity_controller.dart';
import '../scope/squad_1_scope.dart';

/// Envuelve el contenido autenticado: reinicia el temporizador de 30 min
/// ante cualquier toque/clic (RF-02) y muestra un aviso con cuenta
/// regresiva de 60s antes del cierre forzoso de sesión.
class SessionTimerGate extends StatelessWidget {
  const SessionTimerGate({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final sessionActivity = Squad1Scope.of(context).sessionActivity;
    return Listener(
      onPointerDown: (_) => sessionActivity.registerActivity(),
      onPointerMove: (_) => sessionActivity.registerActivity(),
      behavior: HitTestBehavior.translucent,
      child: ListenableBuilder(
        listenable: sessionActivity,
        builder: (context, _) {
          return Stack(
            children: [
              child,
              if (sessionActivity.isWarning) _WarningBanner(controller: sessionActivity),
            ],
          );
        },
      ),
    );
  }
}

class _WarningBanner extends StatelessWidget {
  const _WarningBanner({required this.controller});

  final SessionActivityController controller;

  @override
  Widget build(BuildContext context) {
    final seconds = controller.remaining.inSeconds;
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        child: Material(
          color: AppTheme.attendanceTardanza,
          child: InkWell(
            onTap: controller.registerActivity,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Su sesión se cerrará por inactividad en $seconds s. Toque aquí para continuar.',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
