import '../domain/models/session_tokens.dart';

/// Quién ejecuta una operación mutable y desde dónde — lo que en un
/// backend real vendría del contexto del request HTTP (usuario del JWT +
/// IP + User-Agent). Los repositorios lo reciben para poder auditar cada
/// creación/modificación tal como exige RF-65 ("intercepta... todas las
/// operaciones de creación, modificación, eliminación y acceso sensible").
class ActorContext {
  const ActorContext({required this.session, required this.ipAddress, required this.userAgent});

  final AuthSession session;
  final String ipAddress;
  final String userAgent;
}
