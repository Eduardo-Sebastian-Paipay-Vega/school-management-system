/// Un tramo de la escala cualitativa CNEB (ej. AD = 18-20).
class GradingScaleThreshold {
  const GradingScaleThreshold({
    required this.literal,
    required this.minScore,
    required this.maxScore,
  });

  final String literal;
  final double minScore;
  final double maxScore;

  bool contains(double score) => score >= minScore && score <= maxScore;
}

/// Entidad `escalas_calificacion` (RF-13): escala dual oficial
/// (vigesimal 0-20 + literal CNEB AD/A/B/C) parametrizable por nivel
/// educativo, con nota mínima aprobatoria configurable (11 o 14) y
/// redondeo reglamentario a favor del estudiante.
class GradingScale {
  const GradingScale({
    required this.id,
    required this.tenantId,
    required this.nivelEducativo,
    required this.notaMinimaAprobatoria,
    required this.thresholds,
  });

  final String id;
  final String tenantId;
  final String nivelEducativo;
  final double notaMinimaAprobatoria;
  final List<GradingScaleThreshold> thresholds;

  /// Escala por defecto del CNEB (MINEDU), usada como semilla institucional.
  factory GradingScale.cnebDefault({
    required String id,
    required String tenantId,
    required String nivelEducativo,
    required double notaMinimaAprobatoria,
  }) {
    return GradingScale(
      id: id,
      tenantId: tenantId,
      nivelEducativo: nivelEducativo,
      notaMinimaAprobatoria: notaMinimaAprobatoria,
      thresholds: const [
        GradingScaleThreshold(literal: 'AD', minScore: 18, maxScore: 20),
        GradingScaleThreshold(literal: 'A', minScore: 14, maxScore: 17.999),
        GradingScaleThreshold(literal: 'B', minScore: 11, maxScore: 13.999),
        GradingScaleThreshold(literal: 'C', minScore: 0, maxScore: 10.999),
      ],
    );
  }
}
