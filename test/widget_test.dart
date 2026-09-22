import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/main.dart';

void main() {
  testWidgets('Smoke test de carga institucional y visualización de squads', (WidgetTester tester) async {
    // Construir la aplicación
    await tester.pumpWidget(const SchoolManagementApp());
    await tester.pumpAndSettle();

    // Verificar que el título institucional y los 5 squads se renderizan correctamente
    expect(find.text('Sistema Integral de Gestión Escolar'), findsOneWidget);
    expect(find.text('Squad 1'), findsWidgets);
    expect(find.text('Squad 2'), findsWidgets);
    expect(find.text('Squad 3'), findsWidgets);
    expect(find.text('Squad 4'), findsWidgets);
    expect(find.text('Squad 5'), findsWidgets);
  });
}
