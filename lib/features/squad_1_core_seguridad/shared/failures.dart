/// Errores de dominio del Squad 1, alineados a los códigos HTTP normados
/// en `.agents/rules/sdd_rules.md` (400/401/403/422).
library;

/// Códigos de error estandarizados para el contrato `{ success:false, error:{code,message} }`.
class ErrorCodes {
  static const String validation = 'ERR_VALIDATION';
  static const String unauthorized = 'ERR_UNAUTHORIZED';
  static const String forbidden = 'ERR_FORBIDDEN';
  static const String businessRule = 'ERR_BUSINESS_RULE';
  static const String notFound = 'ERR_NOT_FOUND';
  static const String conflict = 'ERR_CONFLICT';
  static const String rateLimited = 'ERR_RATE_LIMITED';
  static const String immutableViolation = 'ERR_IMMUTABLE_VIOLATION';

  const ErrorCodes._();
}

/// Excepción base de dominio para el Squad 1.
sealed class Squad1Failure implements Exception {
  const Squad1Failure(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => '$code: $message';
}

/// HTTP 400 — Entrada inválida (formato de DNI, email, clave, columnas de import, etc.).
class ValidationFailure extends Squad1Failure {
  const ValidationFailure(String message) : super(ErrorCodes.validation, message);
}

/// HTTP 401 — Credenciales inválidas o token no válido/expirado/revocado.
class UnauthorizedFailure extends Squad1Failure {
  const UnauthorizedFailure(String message) : super(ErrorCodes.unauthorized, message);
}

/// HTTP 403 — RBAC denegado (RF-04).
class ForbiddenFailure extends Squad1Failure {
  const ForbiddenFailure(String message) : super(ErrorCodes.forbidden, message);
}

/// HTTP 422 — Regla de negocio pedagógica/institucional violada
/// (año lectivo duplicado, periodo cerrado, aforo excedido, etc.).
class BusinessRuleFailure extends Squad1Failure {
  const BusinessRuleFailure(String message) : super(ErrorCodes.businessRule, message);
}

/// HTTP 404 — Entidad no encontrada.
class NotFoundFailure extends Squad1Failure {
  const NotFoundFailure(String message) : super(ErrorCodes.notFound, message);
}

/// HTTP 409 — Conflicto de unicidad (DNI/email/código modular duplicado).
class ConflictFailure extends Squad1Failure {
  const ConflictFailure(String message) : super(ErrorCodes.conflict, message);
}

/// HTTP 429 — Rate limiting de intentos de login (RF-01, máx. 5/15min).
class RateLimitedFailure extends Squad1Failure {
  const RateLimitedFailure(String message) : super(ErrorCodes.rateLimited, message);
}

/// Intento de alterar la bitácora de auditoría inmutable (RF-65).
class ImmutableAuditViolation extends Squad1Failure {
  const ImmutableAuditViolation(String message) : super(ErrorCodes.immutableViolation, message);
}
