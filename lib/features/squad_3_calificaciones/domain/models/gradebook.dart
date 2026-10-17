typedef Json = Map<String, dynamic>;

enum GradeRole { teacher, practitioner, coordinator, director, student }

class GradeSession {
  const GradeSession(this.userId, this.role, {this.studentId});
  final String userId;
  final GradeRole role;
  final String? studentId;
  bool get canTeach => role == GradeRole.teacher;
  bool get canDirect => role == GradeRole.director;
  bool get canClose => canDirect || role == GradeRole.coordinator;
  bool get canEdit => canTeach || role == GradeRole.practitioner;
}

class GradeValue {
  const GradeValue(this.numeric, this.literal);
  final double numeric;
  final String literal;
  Json toJson() => {'numeric': numeric, 'literal': literal};
}

/// Local preview; the authoritative policy is supplied by Squad 1.
class GradingScaleService {
  GradingScaleService({this.ad = 17.5, this.a = 13.5, this.b = 10.5}) {
    if (!(0 < b && b < a && a < ad && ad <= 20)) {
      throw ArgumentError('Escala CNEB inválida');
    }
  }
  final double ad;
  final double a;
  final double b;
  GradeValue parse(String input) {
    final text = input.trim().toUpperCase();
    const representatives = {'AD': 19.0, 'A': 15.0, 'B': 12.0, 'C': 8.0};
    if (representatives.containsKey(text)) {
      return GradeValue(representatives[text]!, text);
    }
    if (!RegExp(r'^\d{1,2}(?:[.,]\d{1,2})?$').hasMatch(text)) {
      throw const FormatException('Ingrese 0–20 o AD, A, B, C');
    }
    final value = double.tryParse(text.replaceAll(',', '.'));
    if (value == null || !value.isFinite || value < 0 || value > 20) {
      throw const FormatException('Ingrese 0–20 o AD, A, B, C');
    }
    if ((value * 100 - (value * 100).round()).abs() > 0.000001) {
      throw const FormatException('Use como máximo dos decimales');
    }
    return GradeValue(value, literal(value));
  }

  String literal(double value) => value >= ad
      ? 'AD'
      : value >= a
      ? 'A'
      : value >= b
      ? 'B'
      : 'C';
}

class Gradebook {
  Gradebook(this.json);
  final Json json;
  String get id => json['id'] as String;
  int get revision => json['revision'] as int;
  bool get closed =>
      json['closed'] == true ||
      DateTime.parse(
        json['deadline'] as String,
      ).isBefore(DateTime.now().toUtc());
  String get title => json['title'] as String;
  List<Json> get evaluations => (json['evaluations'] as List).cast<Json>();
  List<Json> get students => (json['students'] as List).cast<Json>();
  List<Json> get requests => (json['requests'] as List).cast<Json>();
  Json get grades => json['grades'] as Json;
  Json get conclusions => json['conclusions'] as Json;
  String key(String student, String evaluation) => '$student/$evaluation';
  Json? grade(String student, String evaluation) =>
      grades[key(student, evaluation)] as Json?;
  GradingScaleService get scale {
    final policy = json['scale'] as Json;
    return GradingScaleService(
      ad: (policy['ad'] as num).toDouble(),
      a: (policy['a'] as num).toDouble(),
      b: (policy['b'] as num).toDouble(),
    );
  }

  /// Null for incomplete rows; missing grades never silently become zero.
  GradeValue? summary(
    String student, {
    bool finalPeriod = false,
    String? competency,
  }) {
    final selected = evaluations
        .where((e) => competency == null || e['competency'] == competency)
        .toList();
    if (selected.isEmpty) return null;
    final values = <({double score, double weight, String literal})>[];
    for (final evaluation in selected) {
      final value = grade(student, evaluation['id'] as String);
      if (value == null) return null;
      values.add((
        score: (value['numeric'] as num).toDouble(),
        weight: (evaluation['weight'] as num).toDouble(),
        literal: value['literal'] as String,
      ));
    }
    if (json['level'] == 'primary') {
      // Tie is resolved by the latest evaluation, as configured for this module.
      final counts = <String, int>{};
      for (final value in values) {
        counts.update(value.literal, (n) => n + 1, ifAbsent: () => 1);
      }
      final maximum = counts.values.reduce((a, b) => a > b ? a : b);
      final predominant = values
          .lastWhere((value) => counts[value.literal] == maximum)
          .literal;
      return scale.parse(predominant);
    }
    final totalWeight = values.fold<double>(0, (sum, v) => sum + v.weight);
    final raw =
        values.fold<double>(0, (sum, v) => sum + v.score * v.weight) /
        totalWeight;
    final score = finalPeriod ? raw.roundToDouble() : raw;
    return GradeValue(score, scale.literal(score));
  }
}
