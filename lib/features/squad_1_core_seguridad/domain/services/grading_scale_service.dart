import '../../shared/failures.dart';
import '../models/grading_scale.dart';

/// Motor de conversión y consulta de la escala dual CNEB (RF-13).
///
/// `Squad 3` (RF-46: motor de conversión vigesimal → literal) debe
/// consumir esta configuración institucional en lugar de duplicar los
/// umbrales de corte, para que una recalibración hecha aquí por
/// Coordinación Académica se propague automáticamente a las boletas.
class GradingScaleService {
  const GradingScaleService();

  /// Convierte una nota vigesimal (0-20) a su letra CNEB según los
  /// umbrales parametrizados en [scale]. Ej.: `15.6` → `'A'`.
  String literalFor(GradingScale scale, double vigesimalScore) {
    if (vigesimalScore < 0 || vigesimalScore > 20) {
      throw ValidationFailure(
        'La nota vigesimal debe estar entre 0 y 20 (recibido: $vigesimalScore).',
      );
    }
    for (final threshold in scale.thresholds) {
      if (threshold.contains(vigesimalScore)) return threshold.literal;
    }
    throw BusinessRuleFailure(
      'No hay un tramo de la escala "${scale.nivelEducativo}" que cubra la nota $vigesimalScore.',
    );
  }

  bool isApproved(GradingScale scale, double vigesimalScore) {
    return vigesimalScore >= scale.notaMinimaAprobatoria;
  }

  /// Redondeo reglamentario a favor del estudiante: una fracción de 0.5
  /// o más sube al entero superior (RF-13, `sdd_squad_1.md` §6).
  int roundFavoringStudent(double average) => average.round();
}
