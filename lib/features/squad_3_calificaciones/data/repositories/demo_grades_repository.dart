import 'dart:convert';
import '../../domain/models/gradebook.dart';
import 'grades_repository.dart';

/// Volatile fixture for exploring the UI. Never reports a cloud persistence.
class DemoGradesRepository implements GradesRepository {
  DemoGradesRepository({required this.session, int studentCount = 32}) {
    _data = {
      'id': 'demo',
      'revision': 1,
      'title': 'Matemática · 3.º A · Bimestre I',
      'tenantId': 'demo',
      'teacherId': 'teacher-demo',
      'practitionerIds': ['practitioner-demo'],
      'level': 'secondary',
      'closed': false,
      'deadline': '2099-12-31T23:59:59Z',
      'scale': {'ad': 17.5, 'a': 13.5, 'b': 10.5},
      'competencies': ['Resuelve problemas de cantidad'],
      'evaluations': [
        {
          'id': 'ev-1',
          'name': 'Práctica',
          'weight': 1.0,
          'competency': 'Resuelve problemas de cantidad',
          'rubric': 'Comprende, representa y argumenta',
        },
        {
          'id': 'ev-2',
          'name': 'Proyecto',
          'weight': 1.5,
          'competency': 'Resuelve problemas de cantidad',
          'rubric': 'Modela y sustenta su procedimiento',
        },
      ],
      'students': List.generate(
        studentCount,
        (i) => {
          'id': 'mat-${i + 1}',
          'name': 'Estudiante de ejemplo ${(i + 1).toString().padLeft(3, '0')}',
        },
      ),
      'grades': <String, dynamic>{},
      'conclusions': <String, dynamic>{},
      'publishedGrades': <String, dynamic>{},
      'publishedConclusions': <String, dynamic>{},
      'requests': <Json>[],
      'history': <Json>[],
      'conclusionBank': [
        for (final level in ['AD', 'A', 'B', 'C'])
          {
            'level': level,
            'competency': 'Resuelve problemas de cantidad',
            'text':
                '$level: describe sus estrategias para resolver problemas de cantidad. Revisar y contextualizar con evidencias del estudiante.',
          },
      ],
    };
  }
  GradeSession session;
  late Json _data;
  @override
  bool get isDemo => true;
  @override
  Stream<void> get updates => const Stream.empty();
  Json _copy(Json data) => jsonDecode(jsonEncode(data)) as Json;
  @override
  Future<Json> annual() async => {
    'students': [
      for (final student in (await load()).students)
        {
          'id': student['id'],
          'name': student['name'],
          'annual': null,
          'periods': [],
          'message':
              'La demostración contiene un solo bimestre; el consolidado anual requiere todos los periodos cerrados.',
        },
    ],
  };
  @override
  Future<Gradebook> load() async {
    final data = _copy(_data);
    if (session.role == GradeRole.student) {
      final id = session.studentId;
      data['students'] = (data['students'] as List)
          .where((s) => s['id'] == id)
          .toList();
      data['grades'] = Map<String, dynamic>.fromEntries(
        (data['publishedGrades'] as Json).entries.where(
          (e) => e.key.startsWith('$id/'),
        ),
      );
      data['conclusions'] = {
        if ((data['publishedConclusions'] as Json).containsKey(id))
          id!: data['publishedConclusions'][id],
      };
      data['requests'] = <Json>[];
      data['history'] = <Json>[];
      data.remove('publishedGrades');
      data.remove('publishedConclusions');
    }
    return Gradebook(data);
  }

  void _check(int revision) {
    if (revision != _data['revision']) {
      throw const GradesException(
        'La planilla cambió. Recargue antes de continuar.',
        conflict: true,
      );
    }
  }

  void _open() {
    if (Gradebook(_data).closed) {
      throw const GradesException('El periodo está cerrado');
    }
  }

  void _require(bool condition) {
    if (!condition) {
      throw const GradesException('No tiene permiso para esta acción');
    }
  }

  @override
  Future<Gradebook> batch(int revision, List<Json> items) async {
    _check(revision);
    _open();
    _require(session.canEdit);
    final changes = <String, Json>{};
    final book = Gradebook(_data);
    for (final item in items) {
      final student = item['studentId'] as String;
      final evaluation = item['evaluationId'] as String;
      if (!book.students.any((s) => s['id'] == student) ||
          !book.evaluations.any((e) => e['id'] == evaluation)) {
        throw const GradesException('Celda fuera de la planilla');
      }
      final value = book.scale.parse(item['input'] as String);
      final previous = book.grade(student, evaluation);
      changes[book.key(student, evaluation)] = {
        ...value.toJson(),
        'status': session.canTeach ? 'approved' : 'draft',
        'authorId': session.userId,
        if (!session.canTeach && previous != null)
          'previous': previous['status'] == 'draft'
              ? previous['previous']
              : _copy(previous),
      };
    }
    (_data['grades'] as Json).addAll(changes);
    _data['revision'] = revision + 1;
    return load();
  }

  @override
  Future<Gradebook> action(int revision, String action, Json payload) async {
    _check(revision);
    final book = Gradebook(_data);
    switch (action) {
      case 'evaluation':
        _open();
        _require(session.canTeach);
        final weight = double.tryParse('${payload['weight']}');
        if (weight == null ||
            !weight.isFinite ||
            weight <= 0 ||
            weight > 100 ||
            book.evaluations.length >= 40 ||
            '${payload['name']}'.trim().isEmpty ||
            '${payload['competency']}'.trim().isEmpty ||
            '${payload['rubric']}'.trim().isEmpty) {
          throw const GradesException(
            'Complete la evaluación y un peso positivo',
          );
        }
        if (!(_data['competencies'] as List).contains(payload['competency'])) {
          throw const GradesException(
            'Seleccione una competencia oficial de la asignatura',
          );
        }
        book.evaluations.add({
          'id': 'ev-${book.evaluations.length + 1}',
          ...payload,
          'weight': weight,
        });
      case 'approve':
        _open();
        _require(session.canTeach);
        for (final grade in book.grades.values) {
          (grade as Json)['status'] = 'approved';
          grade.remove('previous');
        }
      case 'reject':
        _open();
        _require(session.canTeach);
        if ('${payload['reason'] ?? ''}'.trim().isEmpty) {
          throw const GradesException('Indique las observaciones');
        }
        _data['draftFeedback'] = payload['reason'];
        for (final entry in book.grades.entries.toList()) {
          if (entry.value['status'] == 'draft') {
            if (entry.value['previous'] == null) {
              book.grades.remove(entry.key);
            } else {
              book.grades[entry.key] = entry.value['previous'];
            }
          }
        }
      case 'publish':
        _open();
        _require(session.canTeach);
        if (book.grades.isEmpty ||
            book.grades.values.any((g) => g['status'] != 'approved')) {
          throw const GradesException(
            'Apruebe los borradores antes de publicar',
          );
        }
        _requireConclusions(book);
        _data['publishedGrades'] = _copy(book.grades);
        _data['publishedConclusions'] = _copy(book.conclusions);
      case 'conclusion':
        _open();
        _require(session.canTeach);
        final text = '${payload['text']}'.trim();
        if (text.isEmpty ||
            text.length > 500 ||
            !book.students.any((s) => s['id'] == payload['studentId'])) {
          throw const GradesException('Conclusión o estudiante inválido');
        }
        book.conclusions[payload['studentId'] as String] = text;
      case 'close':
        _open();
        _require(session.canClose);
        if (book.students.any((s) => book.summary(s['id'] as String) == null) ||
            book.grades.values.any((g) => g['status'] != 'approved')) {
          throw const GradesException(
            'Complete y apruebe todas las notas antes del cierre',
          );
        }
        _requireConclusions(book);
        _data['closed'] = true;
      case 'rectification':
        _require(session.canTeach && book.closed);
        final key = book.key(
          payload['studentId'] as String,
          payload['evaluationId'] as String,
        );
        final grade = book.grades[key];
        if (grade == null ||
            '${payload['reason']}'.trim().isEmpty ||
            '${payload['document']}'.trim().isEmpty) {
          throw const GradesException(
            'Indique nota existente, motivo y documento de sustento',
          );
        }
        final value = book.scale.parse(payload['input'] as String);
        final proposed = Gradebook(_copy(_data));
        proposed.grades[key] = {
          ...value.toJson(),
          'status': 'approved',
          'authorId': session.userId,
        };
        final proposedConclusion = '${payload['conclusion'] ?? ''}'.trim();
        if (proposedConclusion.length > 500) {
          throw const GradesException(
            'La conclusión admite hasta 500 caracteres',
          );
        }
        if (proposedConclusion.isNotEmpty) {
          proposed.conclusions[payload['studentId'] as String] =
              proposedConclusion;
        }
        _requireConclusions(proposed);
        book.requests.add({
          'id': 'req-${book.requests.length + 1}',
          ...payload,
          'value': value.toJson(),
          'old': _copy(grade as Json),
          'status': 'pending',
          'requesterId': session.userId,
        });
      case 'decide':
        _require(session.canDirect);
        final request = book.requests.firstWhere(
          (r) => r['id'] == payload['requestId'],
        );
        if (request['status'] != 'pending') {
          throw const GradesException('La solicitud ya fue resuelta');
        }
        final key = book.key(
          request['studentId'] as String,
          request['evaluationId'] as String,
        );
        if (jsonEncode(request['old']) != jsonEncode(book.grades[key])) {
          throw const GradesException(
            'La nota original cambió',
            conflict: true,
          );
        }
        if (payload['approve'] == true) {
          if ('${payload['signature'] ?? ''}'.trim().isEmpty) {
            throw const GradesException(
              'Confirme electrónicamente la aprobación',
            );
          }
          book.grades[key] = {
            ...request['value'] as Json,
            'status': 'approved',
            'authorId': session.userId,
          };
          if ('${request['conclusion'] ?? ''}'.trim().isNotEmpty) {
            book.conclusions[request['studentId'] as String] =
                request['conclusion'];
          }
          if ((_data['publishedGrades'] as Json).containsKey(key)) {
            _data['publishedGrades'][key] = _copy(book.grades[key] as Json);
            if ('${request['conclusion'] ?? ''}'.trim().isNotEmpty) {
              _data['publishedConclusions'][request['studentId']] =
                  request['conclusion'];
            }
          }
        } else if ('${payload['reason'] ?? ''}'.trim().isEmpty) {
          throw const GradesException('Indique el motivo del rechazo');
        }
        request.addAll({
          'status': payload['approve'] == true ? 'approved' : 'rejected',
          'decidedBy': session.userId,
          'decisionReason': payload['reason'] ?? '',
        });
      default:
        throw const GradesException('Acción desconocida');
    }
    (_data['history'] as List).add({
      'action': action,
      'actor': session.userId,
      'at': DateTime.now().toUtc().toIso8601String(),
    });
    _data['revision'] = revision + 1;
    return load();
  }

  @override
  void dispose() {}

  void _requireConclusions(Gradebook book) {
    for (final student in book.students) {
      final id = student['id'] as String;
      final level = book.summary(id, finalPeriod: true)?.literal;
      if (['B', 'C'].contains(level) &&
          '${book.conclusions[id] ?? ''}'.trim().isEmpty) {
        throw GradesException(
          'Registre la conclusión obligatoria para ${student['name']}',
        );
      }
    }
  }
}
