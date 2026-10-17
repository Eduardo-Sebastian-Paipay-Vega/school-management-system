import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/repositories/api_grades_repository.dart';
import '../../data/repositories/demo_grades_repository.dart';
import '../../data/repositories/grades_repository.dart';
import '../../domain/models/gradebook.dart';
import '../controllers/gradebook_controller.dart';
import '../widgets/grade_matrix.dart';

class Squad3Screen extends StatefulWidget {
  const Squad3Screen({
    super.key,
    this.repository,
    this.accessToken,
    this.registerLeaveGuard,
    this.session = const GradeSession('teacher-demo', GradeRole.teacher),
  });
  final GradesRepository? repository;
  final String Function()? accessToken;
  final void Function(Future<bool> Function()? guard)? registerLeaveGuard;
  final GradeSession session;
  @override
  State<Squad3Screen> createState() => _Squad3ScreenState();
}

class _Squad3ScreenState extends State<Squad3Screen> {
  late GradebookController controller;
  late GradeSession _session;
  Timer? _refresh;
  StreamSubscription<void>? _live;
  String search = '';
  String roleLabel(GradeRole role) => switch (role) {
    GradeRole.teacher => 'Docente',
    GradeRole.practitioner => 'Practicante',
    GradeRole.coordinator => 'Coordinación',
    GradeRole.director => 'Dirección',
    GradeRole.student => 'Estudiante',
  };
  @override
  void initState() {
    super.initState();
    _session = widget.session;
    const url = String.fromEnvironment('GRADES_API_URL');
    const book = String.fromEnvironment('GRADES_BOOK_ID');
    // Authenticated hosts inject a repository with a refreshing token callback.
    final repository =
        widget.repository ??
        (url.isEmpty
            ? DemoGradesRepository(session: _session)
            : ApiGradesRepository(
                baseUrl: url,
                bookId: book,
                token: () => widget.accessToken?.call() ?? '',
              ));
    controller = GradebookController(repository, _session)..load();
    widget.registerLeaveGuard?.call(confirmLeave);
    _live = repository.updates.listen((_) {
      if (controller.clean) controller.load();
    });
    _refresh = Timer.periodic(const Duration(seconds: 10), (_) {
      if (controller.clean && !controller.busy && !controller.loading) {
        controller.load();
      }
    });
  }

  @override
  void dispose() {
    widget.registerLeaveGuard?.call(null);
    _refresh?.cancel();
    _live?.cancel();
    controller.dispose();
    super.dispose();
  }

  Future<bool> confirmLeave() async {
    if (controller.clean) return true;
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Hay notas sin guardar'),
            content: const Text(
              'Sus cambios locales se perderán al salir. Puede permanecer y resolver el guardado.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Permanecer'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Salir y descartar'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Future<void> messageAction(String action, [Json payload = const {}]) async {
    final success = await controller.action(action, payload);
    if (mounted && success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Operación completada')));
    }
  }

  void changeDemoRole(GradeRole? role) {
    final repository = controller.repository;
    if (role == null ||
        repository is! DemoGradesRepository ||
        !controller.clean ||
        controller.busy) {
      return;
    }
    final next = GradeSession(
      '${role.name}-demo',
      role,
      studentId: role == GradeRole.student ? 'mat-1' : null,
    );
    controller.dispose();
    repository.session = next;
    setState(() {
      _session = next;
      search = '';
      controller = GradebookController(repository, next)..load();
    });
  }

  Future<void> showAnnual() async {
    try {
      final report = await controller.repository.annual();
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Consolidado anual'),
          content: SizedBox(
            width: 520,
            height: 360,
            child: ListView(
              children: [
                for (final student in report['students'] as List)
                  ListTile(
                    title: Text(student['name'] as String),
                    subtitle: Text(
                      student['annual'] == null
                          ? 'Incompleto: se requieren todos los periodos cerrados y las notas correspondientes.'
                          : '${student['annual']['literal']}${student['annual']['numeric'] == null ? '' : ' · ${student['annual']['numeric']}'}',
                    ),
                  ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  Future<Json?> form(
    String title,
    Map<String, String> fields, {
    Map<String, String> initial = const {},
  }) async {
    final editors = {
      for (final field in fields.keys)
        field: TextEditingController(text: initial[field] ?? ''),
    };
    final key = GlobalKey<FormState>();
    final result = await showDialog<Json>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SizedBox(
          width: 440,
          child: SingleChildScrollView(
            child: Form(
              key: key,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final field in fields.entries)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: field.key == 'competency'
                          ? DropdownButtonFormField<String>(
                              isExpanded: true,
                              decoration: InputDecoration(
                                labelText: field.value,
                              ),
                              items: [
                                for (final competency
                                    in controller.book!.json['competencies']
                                        as List)
                                  DropdownMenuItem(
                                    value: competency as String,
                                    child: Text(
                                      competency,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                              ],
                              onChanged: (value) =>
                                  editors[field.key]!.text = value ?? '',
                              validator: (value) => value == null
                                  ? 'Seleccione una competencia'
                                  : null,
                            )
                          : TextFormField(
                              controller: editors[field.key],
                              decoration: InputDecoration(
                                labelText: field.value,
                              ),
                              maxLines:
                                  field.key == 'text' || field.key == 'reason'
                                  ? 3
                                  : 1,
                              validator: (v) => field.key == 'conclusion'
                                  ? null
                                  : v == null || v.trim().isEmpty
                                  ? 'Campo obligatorio'
                                  : null,
                            ),
                    ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (key.currentState!.validate()) {
                Navigator.pop(context, {
                  for (final e in editors.entries) e.key: e.value.text.trim(),
                });
              }
            },
            child: const Text('Continuar'),
          ),
        ],
      ),
    );
    await Future<void>.delayed(const Duration(milliseconds: 250));
    for (final editor in editors.values) {
      editor.dispose();
    }
    return result;
  }

  Future<void> confirm(String title, String action) async {
    final accepted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: const Text(
          'La operación se aplicará a esta sección, curso y periodo. Compruebe las notas antes de continuar.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
    if (accepted == true) await messageAction(action);
  }

  Future<void> conclusion(Json student) async {
    final book = controller.preview;
    final summary = book.summary(student['id'] as String);
    final bank = (book.json['conclusionBank'] as List)
        .cast<Json>()
        .where(
          (entry) =>
              entry['level'] == summary?.literal &&
              book.evaluations.any(
                (e) => e['competency'] == entry['competency'],
              ),
        )
        .toList();
    final suggested = bank.isEmpty ? '' : bank.first['text'] as String;
    final result = await form(
      'Conclusión · ${student['name']}',
      {'text': 'Conclusión descriptiva (revise la sugerencia)'},
      initial: {
        'text': book.conclusions[student['id']] as String? ?? suggested,
      },
    );
    if (result != null) {
      await messageAction('conclusion', {
        'studentId': student['id'],
        ...result,
      });
    }
  }

  Future<void> rectify(Json student) async {
    final selected = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Evaluación a rectificar'),
        children: [
          for (final e in controller.book!.evaluations)
            SimpleDialogOption(
              onPressed: () => Navigator.pop(context, e['id'] as String),
              child: Text(e['name'] as String),
            ),
        ],
      ),
    );
    if (selected == null || !mounted) return;
    final result = await form('Solicitar rectificación', {
      'input': 'Nueva nota',
      'reason': 'Justificación',
      'document': 'Referencia del documento / evidencia institucional',
      'conclusion': 'Conclusión posterior (obligatoria si resulta B/C)',
    });
    if (result != null) {
      await messageAction('rectification', {
        'studentId': student['id'],
        'evaluationId': selected,
        ...result,
      });
    }
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: controller,
    builder: (context, _) {
      final book = controller.book;
      return Scaffold(
        appBar: AppBar(
          title: const Text('Calificaciones · Modo Excel'),
          actions: [
            IconButton(
              tooltip: 'Consolidado anual',
              onPressed: book == null || controller.busy || !controller.clean
                  ? null
                  : showAnnual,
              icon: const Icon(Icons.summarize_outlined),
            ),
            IconButton(
              tooltip: 'Actualizar',
              onPressed: controller.clean && !controller.busy
                  ? controller.load
                  : null,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        body: book == null
            ? Center(
                child: controller.loading
                    ? const CircularProgressIndicator()
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            controller.error ?? 'No hay planilla disponible',
                          ),
                          TextButton(
                            onPressed: controller.load,
                            child: const Text('Reintentar'),
                          ),
                        ],
                      ),
              )
            : LayoutBuilder(
                builder: (context, constraints) {
                  final minimum = book.requests.isEmpty ? 760.0 : 920.0;
                  return SingleChildScrollView(
                    child: SizedBox(
                      height: constraints.maxHeight < minimum
                          ? minimum
                          : constraints.maxHeight,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (controller.repository.isDemo)
                            const Material(
                              color: AppTheme.accentGold,
                              child: Padding(
                                padding: EdgeInsets.all(8),
                                child: Text(
                                  'DEMOSTRACIÓN · Datos ficticios en memoria. Los cambios se pierden al salir.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppTheme.textDark),
                                ),
                              ),
                            ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                            child: Wrap(
                              spacing: 12,
                              runSpacing: 8,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Text(
                                  book.title,
                                  style: Theme.of(
                                    context,
                                  ).textTheme.titleMedium,
                                ),
                                Chip(
                                  avatar: Icon(
                                    book.closed ? Icons.lock : Icons.edit,
                                    size: 16,
                                  ),
                                  label: Text(
                                    book.closed
                                        ? 'Periodo cerrado'
                                        : 'Periodo abierto',
                                  ),
                                ),
                                if (controller.repository
                                    is DemoGradesRepository)
                                  DropdownButton<GradeRole>(
                                    isExpanded: false,
                                    value: _session.role,
                                    hint: const Text('Perfil demo'),
                                    items: [
                                      for (final role in GradeRole.values)
                                        DropdownMenuItem(
                                          value: role,
                                          child: Text(roleLabel(role)),
                                        ),
                                    ],
                                    onChanged:
                                        controller.clean && !controller.busy
                                        ? changeDemoRole
                                        : null,
                                  )
                                else
                                  Text('Perfil: ${roleLabel(_session.role)}'),
                                if (controller.busy || controller.loading)
                                  const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                SizedBox(
                                  width: 240,
                                  child: TextField(
                                    decoration: const InputDecoration(
                                      labelText: 'Buscar estudiante',
                                      prefixIcon: Icon(Icons.search),
                                      isDense: true,
                                    ),
                                    onChanged: (value) =>
                                        setState(() => search = value),
                                  ),
                                ),
                                if (_session.canTeach && !book.closed) ...[
                                  OutlinedButton(
                                    onPressed:
                                        controller.clean && !controller.busy
                                        ? () async {
                                            final result = await form(
                                              'Observaciones al practicante',
                                              {
                                                'reason':
                                                    'Motivo de rechazo del borrador',
                                              },
                                            );
                                            if (result != null) {
                                              await messageAction(
                                                'reject',
                                                result,
                                              );
                                            }
                                          }
                                        : null,
                                    child: const Text('Observar borradores'),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed:
                                        controller.clean && !controller.busy
                                        ? () async {
                                            final result = await form(
                                              'Nueva evaluación y rúbrica',
                                              {
                                                'name': 'Nombre',
                                                'weight': 'Peso positivo',
                                                'competency':
                                                    'Competencia CNEB',
                                                'rubric':
                                                    'Criterios de rúbrica',
                                              },
                                            );
                                            if (result != null) {
                                              await messageAction(
                                                'evaluation',
                                                result,
                                              );
                                            }
                                          }
                                        : null,
                                    icon: const Icon(Icons.add),
                                    label: const Text('Evaluación'),
                                  ),
                                  OutlinedButton(
                                    onPressed:
                                        controller.clean && !controller.busy
                                        ? () => confirm(
                                            'Aprobar borradores de practicantes',
                                            'approve',
                                          )
                                        : null,
                                    child: const Text('Aprobar borradores'),
                                  ),
                                  FilledButton(
                                    onPressed:
                                        controller.clean && !controller.busy
                                        ? () => confirm(
                                            'Publicar calificaciones',
                                            'publish',
                                          )
                                        : null,
                                    child: const Text('Publicar'),
                                  ),
                                ],
                                if (_session.canClose && !book.closed)
                                  OutlinedButton.icon(
                                    onPressed:
                                        controller.clean && !controller.busy
                                        ? () =>
                                              confirm('Cerrar periodo', 'close')
                                        : null,
                                    icon: const Icon(Icons.lock),
                                    label: const Text('Cerrar periodo'),
                                  ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 4,
                            ),
                            child: Wrap(
                              spacing: 8,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Icon(
                                  controller.error == null
                                      ? Icons.cloud_outlined
                                      : Icons.error_outline,
                                  size: 18,
                                  color: controller.error == null
                                      ? AppTheme.primary
                                      : AppTheme.cnebC,
                                ),
                                Text(
                                  _status(),
                                  style: const TextStyle(
                                    color: AppTheme.textDark,
                                  ),
                                ),
                                if (controller.saveState == SaveState.error)
                                  TextButton(
                                    onPressed: controller.flush,
                                    child: const Text('Reintentar guardado'),
                                  ),
                                if (controller.saveState ==
                                        SaveState.conflict ||
                                    controller.invalid.isNotEmpty)
                                  TextButton(
                                    onPressed: () async {
                                      final discard = await showDialog<bool>(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: const Text(
                                            '¿Descartar cambios locales y recargar?',
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(context, false),
                                              child: const Text('Cancelar'),
                                            ),
                                            TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(context, true),
                                              child: const Text(
                                                'Descartar y recargar',
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                      if (discard == true) {
                                        await controller.load(discard: true);
                                      }
                                    },
                                    child: const Text('Resolver / recargar'),
                                  ),
                              ],
                            ),
                          ),
                          if (controller.error != null)
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Text(
                                controller.error!,
                                style: const TextStyle(color: AppTheme.cnebC),
                              ),
                            ),
                          if (book.json['draftFeedback'] != null)
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Text(
                                'Observaciones del docente: ${book.json['draftFeedback']}',
                                style: const TextStyle(color: AppTheme.cnebB),
                              ),
                            ),
                          const Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 6,
                            ),
                            child: Text(
                              'Flechas: mover · Tab: siguiente · Enter: bajar · Esc: restaurar · Ctrl+V: pegar bloque',
                              style: TextStyle(
                                color: AppTheme.textMuted,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          Expanded(
                            child: GradeMatrix(
                              controller: controller,
                              search: search,
                              onConclusion: conclusion,
                              onRectify: rectify,
                            ),
                          ),
                          if (book.requests.isNotEmpty)
                            SizedBox(
                              height: 128,
                              child: ListView(
                                children: [
                                  for (final request in book.requests)
                                    ListTile(
                                      dense: true,
                                      title: Text(
                                        'Rectificación ${request['id']} · ${request['status']}',
                                      ),
                                      subtitle: Text(
                                        '${request['reason']} · ${request['document']}',
                                      ),
                                      trailing:
                                          _session.canDirect &&
                                              request['status'] == 'pending'
                                          ? Wrap(
                                              children: [
                                                IconButton(
                                                  tooltip:
                                                      'Aprobar rectificación',
                                                  onPressed: controller.busy
                                                      ? null
                                                      : () async {
                                                          final signature = await form(
                                                            'Confirmar aprobación directiva',
                                                            {
                                                              'signature':
                                                                  'Confirmación electrónica: nombre completo',
                                                            },
                                                          );
                                                          if (signature !=
                                                              null) {
                                                            await messageAction(
                                                              'decide',
                                                              {
                                                                'requestId':
                                                                    request['id'],
                                                                'approve': true,
                                                                ...signature,
                                                              },
                                                            );
                                                          }
                                                        },
                                                  icon: const Icon(Icons.check),
                                                ),
                                                IconButton(
                                                  tooltip:
                                                      'Rechazar rectificación',
                                                  onPressed: controller.busy
                                                      ? null
                                                      : () async {
                                                          final reason = await form(
                                                            'Rechazar solicitud',
                                                            {
                                                              'reason':
                                                                  'Motivo de rechazo',
                                                            },
                                                          );
                                                          if (reason != null) {
                                                            await messageAction(
                                                              'decide',
                                                              {
                                                                'requestId':
                                                                    request['id'],
                                                                'approve':
                                                                    false,
                                                                ...reason,
                                                              },
                                                            );
                                                          }
                                                        },
                                                  icon: const Icon(Icons.close),
                                                ),
                                              ],
                                            )
                                          : null,
                                    ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      );
    },
  );

  String _status() {
    if (controller.invalid.isNotEmpty) {
      return '${controller.invalid.length} celda(s) inválida(s); guardado detenido';
    }
    return switch (controller.saveState) {
      SaveState.idle => 'Sin cambios pendientes',
      SaveState.pending => 'Cambios pendientes · autoguardado 400 ms',
      SaveState.saving => 'Guardando…',
      SaveState.saved =>
        controller.repository.isDemo
            ? 'Guardado en memoria de demostración'
            : 'Guardado en el servidor',
      SaveState.error => 'No guardado · sus cambios siguen pendientes',
      SaveState.conflict => 'Conflicto de versión · recargue para conciliar',
    };
  }
}
