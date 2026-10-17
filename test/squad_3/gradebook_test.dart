import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/core/theme/app_theme.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/data/repositories/demo_grades_repository.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/data/repositories/grades_repository.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/domain/models/gradebook.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/presentation/controllers/gradebook_controller.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/presentation/screens/squad_3_screen.dart';

const session = GradeSession('teacher-demo', GradeRole.teacher);

class ControlledRepository implements GradesRepository {
  final delegate = DemoGradesRepository(session: session, studentCount: 2);
  int calls = 0;
  bool fail = false;
  bool conflict = false;
  Completer<void>? gate;
  @override
  bool get isDemo => true;
  @override
  Stream<void> get updates => const Stream.empty();
  @override
  Future<Gradebook> load() => delegate.load();
  @override
  Future<Json> annual() => delegate.annual();
  @override
  Future<Gradebook> batch(int revision, List<Json> items) async {
    calls++;
    if (gate != null) await gate!.future;
    if (fail) throw GradesException('No disponible', conflict: conflict);
    return delegate.batch(revision, items);
  }

  @override
  Future<Gradebook> action(int revision, String name, Json payload) =>
      delegate.action(revision, name, payload);
  @override
  void dispose() {}
}

void main() {
  test('conversion, range and non-finite rejection', () {
    final scale = GradingScaleService();
    expect(scale.parse('17.50').literal, 'AD');
    expect(scale.parse('13,5').literal, 'A');
    expect(scale.parse('10.5').literal, 'B');
    expect(scale.parse('10.49').literal, 'C');
    expect(scale.parse('AD').numeric, 19);
    for (final input in ['', 'NaN', 'Infinity', '-1', '21', '1e1', '13.555']) {
      expect(() => scale.parse(input), throwsFormatException);
    }
  });
  test(
    'demo: supervised draft, publication, close and signed rectification',
    () async {
      final repository = DemoGradesRepository(
        session: const GradeSession(
          'practitioner-demo',
          GradeRole.practitioner,
        ),
        studentCount: 1,
      );
      var book = await repository.batch(1, [
        {'studentId': 'mat-1', 'evaluationId': 'ev-1', 'input': '18'},
        {'studentId': 'mat-1', 'evaluationId': 'ev-2', 'input': '18'},
      ]);
      expect(book.grade('mat-1', 'ev-1')!['status'], 'draft');
      repository.session = session;
      await expectLater(
        repository.action(book.revision, 'publish', {}),
        throwsA(isA<GradesException>()),
      );
      book = await repository.action(book.revision, 'approve', {});
      book = await repository.action(book.revision, 'publish', {});
      repository.session = const GradeSession(
        'student-demo',
        GradeRole.student,
        studentId: 'mat-1',
      );
      expect((await repository.load()).grades, hasLength(2));
      repository.session = const GradeSession(
        'director-demo',
        GradeRole.director,
      );
      book = await repository.action(book.revision, 'close', {});
      expect(book.closed, true);
      repository.session = session;
      book = await repository.action(book.revision, 'rectification', {
        'studentId': 'mat-1',
        'evaluationId': 'ev-1',
        'input': '19',
        'reason': 'Error material',
        'document': 'EXP-001',
      });
      repository.session = const GradeSession(
        'director-demo',
        GradeRole.director,
      );
      book = await repository.action(book.revision, 'decide', {
        'requestId': book.requests.first['id'],
        'approve': true,
        'signature': 'Director de demostración',
      });
      expect(book.grade('mat-1', 'ev-1')!['numeric'], 19);
      expect(book.closed, true);
    },
  );
  test(
    'weighted means, missing grades, final-only rounding and primary mode',
    () async {
      final repository = DemoGradesRepository(
        session: session,
        studentCount: 1,
      );
      var book = await repository.load();
      expect(book.summary('mat-1'), isNull);
      book = await repository.batch(1, [
        {'studentId': 'mat-1', 'evaluationId': 'ev-1', 'input': '10'},
        {'studentId': 'mat-1', 'evaluationId': 'ev-2', 'input': '11'},
      ]);
      expect(book.summary('mat-1')!.numeric, 10.6);
      expect(book.summary('mat-1', finalPeriod: true)!.numeric, 11);
      book.json['level'] = 'primary';
      expect(book.summary('mat-1')!.literal, 'B');
    },
  );
  testWidgets('debounce is 400ms and saved only follows repository success', (
    tester,
  ) async {
    final repository = ControlledRepository()..gate = Completer<void>();
    final controller = GradebookController(repository, session);
    await controller.load();
    controller.edit('mat-1', 'ev-1', '18');
    await tester.pump(const Duration(milliseconds: 399));
    expect(repository.calls, 0);
    await tester.pump(const Duration(milliseconds: 1));
    expect(repository.calls, 1);
    expect(controller.saveState, SaveState.saving);
    repository.gate!.complete();
    await tester.pump();
    expect(controller.saveState, SaveState.saved);
    expect(controller.pending, isEmpty);
    controller.dispose();
  });
  testWidgets('new input during an in-flight save survives the old response', (
    tester,
  ) async {
    final repository = ControlledRepository()..gate = Completer<void>();
    final controller = GradebookController(repository, session);
    await controller.load();
    controller.edit('mat-1', 'ev-1', '18');
    await tester.pump(const Duration(milliseconds: 400));
    controller.edit('mat-1', 'ev-1', '19');
    repository.gate!.complete();
    await tester.pump();
    expect(controller.value('mat-1', 'ev-1'), '19');
    expect(controller.pending, hasLength(1));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump();
    expect(controller.book!.grade('mat-1', 'ev-1')!['numeric'], 19);
    expect(repository.calls, 2);
    controller.dispose();
  });
  testWidgets(
    'failed and conflicted saves retain local input; no false saved state',
    (tester) async {
      final repository = ControlledRepository()
        ..fail = true
        ..conflict = true;
      final controller = GradebookController(repository, session);
      await controller.load();
      controller.edit('mat-1', 'ev-1', '18');
      await tester.pump(const Duration(milliseconds: 400));
      expect(controller.saveState, SaveState.conflict);
      expect(controller.pending, hasLength(1));
      await tester.pump(const Duration(seconds: 10));
      expect(repository.calls, 1);
      controller.dispose();
    },
  );
  testWidgets('TSV validates whole block; supports CRLF and rejects overflow', (
    tester,
  ) async {
    final repository = ControlledRepository();
    final controller = GradebookController(repository, session);
    await controller.load();
    expect(
      () => controller.paste(0, 0, '18\t99\r\n15\t16'),
      throwsFormatException,
    );
    expect(controller.pending, isEmpty);
    expect(() => controller.paste(1, 1, '18\t19'), throwsFormatException);
    controller.paste(0, 0, '18\t19\r\n15\t16\r\n');
    expect(controller.pending, hasLength(4));
    await tester.pump(const Duration(milliseconds: 400));
    expect(repository.calls, 1);
    controller.dispose();
  });
  testWidgets('invalid input prevents saving and closing', (tester) async {
    final repository = ControlledRepository();
    final controller = GradebookController(repository, session);
    await controller.load();
    controller.edit('mat-1', 'ev-1', '99');
    await tester.pump(const Duration(seconds: 1));
    expect(repository.calls, 0);
    expect(await controller.action('close'), false);
    expect(controller.invalid, hasLength(1));
    controller.dispose();
  });
  testWidgets(
    'keyboard moves focus and matrix is virtualized for 5000 students',
    (tester) async {
      final repository = DemoGradesRepository(
        session: session,
        studentCount: 5000,
      );
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Squad3Screen(repository: repository),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(TextField).evaluate().length, lessThan(50));
      final first = find.byType(TextField).at(1);
      await tester.tap(first);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      final fields = tester
          .widgetList<TextField>(find.byType(TextField))
          .toList();
      expect(fields[2].focusNode!.hasFocus, true);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(
        tester
            .widgetList<TextField>(find.byType(TextField))
            .where((f) => f.focusNode?.hasFocus ?? false),
        hasLength(1),
      );
      await tester.pumpWidget(const SizedBox());
      await tester.pumpAndSettle();
    },
  );
  testWidgets('responsive module renders without overflow at 360px', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(theme: AppTheme.lightTheme, home: const Squad3Screen()),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.textContaining('DEMOSTRACIÓN'), findsOneWidget);
    await tester.pumpWidget(const SizedBox());
    await tester.pumpAndSettle();
  });
}
