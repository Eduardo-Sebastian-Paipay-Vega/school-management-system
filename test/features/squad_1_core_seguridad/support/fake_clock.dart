import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/clock.dart';

/// Reloj controlable para pruebas deterministas de expiración de tokens,
/// rate-limiting (RF-01) y cierre de periodos (RF-11).
class FakeClock implements Clock {
  FakeClock([DateTime? initial]) : _now = initial ?? DateTime.utc(2026, 5, 20, 8);

  DateTime _now;

  @override
  DateTime now() => _now;

  void advance(Duration duration) => _now = _now.add(duration);

  void set(DateTime value) => _now = value;
}
