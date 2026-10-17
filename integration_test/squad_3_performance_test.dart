import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_application_1/core/theme/app_theme.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/data/repositories/demo_grades_repository.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/domain/models/gradebook.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/presentation/screens/squad_3_screen.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Squad 3: profile de escritura y scroll con 5000 estudiantes', (
    tester,
  ) async {
    expect(
      kProfileMode,
      true,
      reason: 'Ejecutar con flutter drive --profile en un dispositivo real',
    );
    final repository = DemoGradesRepository(
      session: const GradeSession('teacher-demo', GradeRole.teacher),
      studentCount: 5000,
    );
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Squad3Screen(repository: repository),
      ),
    );
    await tester.pumpAndSettle();
    await binding.watchPerformance(() async {
      for (var i = 0; i < 12; i++) {
        await tester.enterText(find.byType(TextField).at(1), '${10 + i % 10}');
        await tester.pump(const Duration(milliseconds: 40));
      }
      for (var i = 0; i < 12; i++) {
        await tester.fling(
          find.byType(ListView).first,
          const Offset(0, -400),
          1200,
        );
        await tester.pumpAndSettle();
      }
    }, reportKey: 'squad3_5000_students');
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
  });
}
