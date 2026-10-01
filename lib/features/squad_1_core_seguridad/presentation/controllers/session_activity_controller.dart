import 'dart:async';
import 'package:flutter/foundation.dart';

/// Vigía de inactividad (RF-02): cierra la sesión tras 30 minutos sin
/// actividad, mostrando una advertencia con cuenta regresiva de 60
/// segundos antes del cierre forzoso (SDD §5.2).
class SessionActivityController extends ChangeNotifier {
  SessionActivityController({
    required this.onTimeout,
    this.totalDuration = const Duration(minutes: 30),
    this.warningDuration = const Duration(seconds: 60),
  });

  final Future<void> Function() onTimeout;
  final Duration totalDuration;
  final Duration warningDuration;

  Timer? _ticker;
  DateTime _lastActivity = DateTime.now();
  bool _active = false;
  bool _timeoutFired = false;

  bool get isActive => _active;

  Duration get remaining {
    final elapsed = DateTime.now().difference(_lastActivity);
    final left = totalDuration - elapsed;
    return left.isNegative ? Duration.zero : left;
  }

  bool get isWarning => _active && remaining <= warningDuration;

  void start() {
    _active = true;
    _timeoutFired = false;
    _lastActivity = DateTime.now();
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
    notifyListeners();
  }

  void stop() {
    _active = false;
    _ticker?.cancel();
    _ticker = null;
  }

  /// Debe invocarse ante cualquier gesto táctil, tecla o clic del usuario
  /// mientras hay sesión activa (envuelto por `SessionActivityGate`).
  void registerActivity() {
    if (!_active) return;
    _lastActivity = DateTime.now();
    notifyListeners();
  }

  void _tick() {
    if (!_active) return;
    if (remaining <= Duration.zero && !_timeoutFired) {
      _timeoutFired = true;
      stop();
      onTimeout();
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }
}
