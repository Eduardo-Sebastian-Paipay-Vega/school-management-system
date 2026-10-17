import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/main.dart';

void main() {
  testWidgets('navigation protects unsaved invalid grades', (tester) async {
    await tester.pumpWidget(const SchoolManagementApp());
    await tester.pumpAndSettle();
    final navigation = find.byType(NavigationBar);
    await tester.tap(
      find.descendant(of: navigation, matching: find.text('Squad 3')),
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).at(1), '99');
    await tester.pump();
    await tester.tap(
      find.descendant(of: navigation, matching: find.text('Squad 1')),
    );
    await tester.pumpAndSettle();
    expect(find.text('Hay notas sin guardar'), findsOneWidget);
    await tester.tap(find.text('Permanecer'));
    await tester.pumpAndSettle();
    expect(find.text('Calificaciones · Modo Excel'), findsOneWidget);
    await tester.tap(
      find.descendant(of: navigation, matching: find.text('Squad 1')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Salir y descartar'));
    await tester.pumpAndSettle();
    expect(find.text('Calificaciones · Modo Excel'), findsNothing);
  });
}
