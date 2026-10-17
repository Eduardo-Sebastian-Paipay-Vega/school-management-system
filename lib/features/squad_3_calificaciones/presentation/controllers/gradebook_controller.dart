import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../data/repositories/grades_repository.dart';
import '../../domain/models/gradebook.dart';

enum SaveState { idle, pending, saving, saved, error, conflict }

class GradebookController extends ChangeNotifier {
  GradebookController(this.repository, this.session);
  final GradesRepository repository;
  final GradeSession session;
  Gradebook? book;
  bool loading = false;
  bool busy = false;
  bool disposed = false;
  String? error;
  SaveState saveState = SaveState.idle;
  final Map<String, Json> pending = {};
  final Map<String, String> invalid = {};
  Timer? _timer;
  Timer? _retry;
  int _attempts = 0;
  bool _inFlight = false;
  bool get canEdit =>
      session.canEdit &&
      book != null &&
      !book!.closed &&
      !busy &&
      !loading &&
      saveState != SaveState.conflict;
  bool get clean => pending.isEmpty && invalid.isEmpty && !_inFlight;
  void _emit() {
    if (!disposed) notifyListeners();
  }

  Future<void> load({bool discard = false}) async {
    if (loading || _inFlight || busy || (!clean && !discard)) return;
    loading = true;
    if (discard) {
      _timer?.cancel();
      _retry?.cancel();
    }
    error = null;
    _emit();
    try {
      final loaded = await repository.load();
      if (disposed) return;
      book = loaded;
      if (discard) {
        pending.clear();
        invalid.clear();
        _timer?.cancel();
        _retry?.cancel();
      }
      saveState = SaveState.idle;
    } catch (e) {
      error = '$e';
    }
    loading = false;
    _emit();
  }

  String value(String student, String evaluation) {
    final key = book!.key(student, evaluation);
    if (pending.containsKey(key)) return pending[key]!['input'] as String;
    final grade = book!.grade(student, evaluation);
    return grade == null
        ? ''
        : book!.json['level'] == 'primary'
        ? grade['literal'] as String
        : '${grade['numeric']}';
  }

  Gradebook get preview {
    final grades = Map<String, dynamic>.from(book!.grades);
    for (final entry in pending.entries) {
      try {
        grades[entry.key] = {
          ...book!.scale.parse(entry.value['input'] as String).toJson(),
          'status': session.canTeach ? 'approved' : 'draft',
        };
      } on FormatException {
        /* Display the validation error without converting it to zero. */
      }
    }
    return Gradebook({...book!.json, 'grades': grades});
  }

  void edit(String student, String evaluation, String input) {
    if (!canEdit) return;
    final key = book!.key(student, evaluation);
    pending[key] = {
      'studentId': student,
      'evaluationId': evaluation,
      'input': input,
    };
    try {
      book!.scale.parse(input);
      invalid.remove(key);
    } on FormatException catch (e) {
      invalid[key] = e.message;
    }
    if (!_inFlight) saveState = SaveState.pending;
    error = null;
    _attempts = 0;
    _timer?.cancel();
    _retry?.cancel();
    if (invalid.isEmpty) {
      _timer = Timer(const Duration(milliseconds: 400), flush);
    }
    _emit();
  }

  /// Validate an entire TSV block before changing any local cell.
  void paste(int row, int column, String text) {
    if (!canEdit) return;
    final normalized = text
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .replaceFirst(RegExp(r'\n$'), '');
    final rows = normalized.split('\n').map((r) => r.split('\t')).toList();
    final changes = <Json>[];
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        if (r + row >= book!.students.length ||
            c + column >= book!.evaluations.length) {
          throw const FormatException(
            'El bloque excede los límites de la planilla',
          );
        }
        book!.scale.parse(rows[r][c]);
        changes.add({
          'studentId': book!.students[r + row]['id'],
          'evaluationId': book!.evaluations[c + column]['id'],
          'input': rows[r][c],
        });
      }
    }
    for (final change in changes) {
      edit(
        change['studentId'] as String,
        change['evaluationId'] as String,
        change['input'] as String,
      );
    }
  }

  Future<void> flush() async {
    _timer?.cancel();
    if (disposed ||
        loading ||
        pending.isEmpty ||
        invalid.isNotEmpty ||
        _inFlight ||
        saveState == SaveState.conflict) {
      return;
    }
    final sent = Map<String, Json>.from(pending);
    _inFlight = true;
    saveState = SaveState.saving;
    _emit();
    try {
      final saved = await repository.batch(
        book!.revision,
        sent.values.toList(),
      );
      if (disposed) return;
      book = saved;
      for (final entry in sent.entries) {
        if (identical(pending[entry.key], entry.value)) {
          pending.remove(entry.key);
        }
      }
      _attempts = 0;
      error = null;
      saveState = pending.isEmpty ? SaveState.saved : SaveState.pending;
      if (pending.isNotEmpty && invalid.isEmpty) {
        _timer = Timer(const Duration(milliseconds: 400), flush);
      }
    } catch (e) {
      if (disposed) return;
      error = '$e';
      saveState = e is GradesException && e.conflict
          ? SaveState.conflict
          : SaveState.error;
      if (saveState != SaveState.conflict &&
          _attempts < 3 &&
          (e is! GradesException || e.retryable)) {
        _retry = Timer(Duration(seconds: 1 << _attempts++), flush);
      }
    } finally {
      _inFlight = false;
    }
    _emit();
  }

  Future<bool> action(String name, [Json payload = const {}]) async {
    if (busy || !clean || book == null) {
      error = 'Guarde o corrija las celdas pendientes antes de continuar';
      _emit();
      return false;
    }
    busy = true;
    error = null;
    _emit();
    var success = false;
    try {
      final saved = await repository.action(book!.revision, name, payload);
      if (!disposed) {
        book = saved;
        success = true;
      }
    } catch (e) {
      error = '$e';
      if (e is GradesException && e.conflict) saveState = SaveState.conflict;
    }
    busy = false;
    _emit();
    return success;
  }

  @override
  void dispose() {
    disposed = true;
    _timer?.cancel();
    _retry?.cancel();
    repository.dispose();
    super.dispose();
  }
}
