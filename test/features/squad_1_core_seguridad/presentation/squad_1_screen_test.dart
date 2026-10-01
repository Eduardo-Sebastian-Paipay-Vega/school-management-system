import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/squad_1_core.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/presentation/widgets/async_action_button.dart';

void main() {
  testWidgets('Squad1Screen muestra el formulario de login cuando no hay sesión (RF-01)', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Squad1Screen()));
    await tester.pumpAndSettle();

    expect(find.text('Acceso Institucional'), findsOneWidget);
    expect(find.widgetWithText(AsyncActionButton, 'Iniciar sesión'), findsOneWidget);
  });

  testWidgets('login con credenciales de demo abre el hub del squad', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Squad1Screen()));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextFormField, 'DNI / Usuario institucional'), '70859632');
    await tester.enterText(find.widgetWithText(TextFormField, 'Contraseña'), 'Demo2026!');
    await tester.tap(find.widgetWithText(AsyncActionButton, 'Iniciar sesión'));

    // Nota: no se usa pumpAndSettle() porque RF-02 arranca un
    // Timer.periodic(1s) de inactividad en el login exitoso, que nunca
    // "asienta" por diseño. Se avanzan frames acotados en su lugar.
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Squad 1: Core y Seguridad'), findsOneWidget);
    // RF-68: el primer ingreso muestra el aviso de protección de datos.
    expect(find.text('Protección de Datos Personales'), findsOneWidget);

    // Desmonta el árbol para cancelar el Timer.periodic de RF-02
    // (SessionActivityController) antes de que termine el test.
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
  });
}
