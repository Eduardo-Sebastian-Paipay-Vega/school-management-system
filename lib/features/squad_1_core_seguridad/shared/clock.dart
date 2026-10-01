/// Fuente de tiempo inyectable para permitir pruebas deterministas
/// de expiración de tokens, bloqueo de periodos y rate limiting.
abstract class Clock {
  DateTime now();
}

class SystemClock implements Clock {
  const SystemClock();

  @override
  DateTime now() => DateTime.now().toUtc();
}
