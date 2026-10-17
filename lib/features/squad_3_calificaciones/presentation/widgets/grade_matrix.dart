import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/gradebook.dart';
import '../controllers/gradebook_controller.dart';

class GradeMatrix extends StatefulWidget {
  const GradeMatrix({
    super.key,
    required this.controller,
    required this.search,
    required this.onConclusion,
    required this.onRectify,
  });
  final GradebookController controller;
  final String search;
  final ValueChanged<Json> onConclusion;
  final ValueChanged<Json> onRectify;
  @override
  State<GradeMatrix> createState() => _GradeMatrixState();
}

class _GradeMatrixState extends State<GradeMatrix> {
  final _vertical = ScrollController();
  final _horizontal = ScrollController();
  final _nodes = <String, FocusNode>{};
  static const double _rowHeight = 88;
  FocusNode _node(String key) => _nodes.putIfAbsent(key, FocusNode.new);
  Future<void> _move(
    int row,
    int col,
    List<Json> students,
    List<Json> evaluations,
  ) async {
    if (row < 0 ||
        row >= students.length ||
        col < 0 ||
        col >= evaluations.length) {
      return;
    }
    final offset = row * _rowHeight;
    if (offset < _vertical.offset ||
        offset + _rowHeight >
            _vertical.offset + _vertical.position.viewportDimension) {
      _vertical.jumpTo(offset.clamp(0.0, _vertical.position.maxScrollExtent));
    }
    final x = 260.0 + col * 116;
    if (x < _horizontal.offset ||
        x + 116 > _horizontal.offset + _horizontal.position.viewportDimension) {
      _horizontal.jumpTo(
        (x - 260).clamp(0.0, _horizontal.position.maxScrollExtent),
      );
    }
    await WidgetsBinding.instance.endOfFrame;
    if (mounted) {
      _node('${students[row]['id']}/${evaluations[col]['id']}').requestFocus();
    }
  }

  Color _color(String level) => switch (level) {
    'AD' => AppTheme.cnebAD,
    'A' => AppTheme.cnebA,
    'B' => AppTheme.cnebB,
    _ => AppTheme.cnebC,
  };
  Widget _label(String text, double width, {bool bold = false}) => SizedBox(
    width: width,
    child: Padding(
      padding: const EdgeInsets.all(8),
      child: Text(
        text,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(fontWeight: bold ? FontWeight.bold : null),
      ),
    ),
  );
  @override
  void dispose() {
    _vertical.dispose();
    _horizontal.dispose();
    for (final node in _nodes.values) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.controller;
    final book = controller.preview;
    final students = book.students
        .where(
          (s) => (s['name'] as String).toLowerCase().contains(
            widget.search.toLowerCase(),
          ),
        )
        .toList();
    final evaluations = book.evaluations;
    if (students.isEmpty) {
      return const Center(child: Text('No hay estudiantes para mostrar'));
    }
    final width = 260.0 + evaluations.length * 116 + 340;
    return Scrollbar(
      controller: _horizontal,
      thumbVisibility: true,
      child: SingleChildScrollView(
        controller: _horizontal,
        scrollDirection: Axis.horizontal,
        child: SizedBox(
          width: width,
          child: Column(
            children: [
              Material(
                color: AppTheme.backgroundLight,
                child: Row(
                  children: [
                    _label('Estudiante', 260, bold: true),
                    for (final e in evaluations)
                      Tooltip(
                        message:
                            '${e['competency']}\nRúbrica: ${e['rubric']}\nPeso: ${e['weight']}',
                        child: _label(e['name'] as String, 116, bold: true),
                      ),
                    _label(
                      book.json['level'] == 'primary'
                          ? 'Logro predominante'
                          : 'Parcial / bimestral',
                      140,
                      bold: true,
                    ),
                    _label('Conclusión / acciones', 200, bold: true),
                  ],
                ),
              ),
              Expanded(
                child: Scrollbar(
                  controller: _vertical,
                  child: ListView.builder(
                    controller: _vertical,
                    itemExtent: _rowHeight,
                    itemCount: students.length,
                    itemBuilder: (context, row) {
                      final student = students[row];
                      final id = student['id'] as String;
                      final summary = book.summary(id);
                      final finalSummary = book.summary(id, finalPeriod: true);
                      return RepaintBoundary(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: row.isEven
                                ? AppTheme.surfaceWhite
                                : AppTheme.backgroundLight,
                            border: const Border(
                              bottom: BorderSide(
                                color: AppTheme.backgroundLight,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              _label('${row + 1}. ${student['name']}', 260),
                              for (var col = 0; col < evaluations.length; col++)
                                SizedBox(
                                  width: 116,
                                  child: Padding(
                                    padding: const EdgeInsets.all(4),
                                    child: GradeCell(
                                      key: ValueKey(
                                        '$id/${evaluations[col]['id']}',
                                      ),
                                      focusNode: _node(
                                        '$id/${evaluations[col]['id']}',
                                      ),
                                      label:
                                          '${student['name']} · ${evaluations[col]['name']}',
                                      value: controller.value(
                                        id,
                                        evaluations[col]['id'] as String,
                                      ),
                                      enabled: controller.canEdit,
                                      error: controller
                                          .invalid['$id/${evaluations[col]['id']}'],
                                      draft:
                                          book.grade(
                                            id,
                                            evaluations[col]['id'] as String,
                                          )?['status'] ==
                                          'draft',
                                      onChanged: (value) => controller.edit(
                                        id,
                                        evaluations[col]['id'] as String,
                                        value,
                                      ),
                                      onMove: (dr, dc, linear) {
                                        var r = row + dr;
                                        var c = col + dc;
                                        if (linear) {
                                          if (c >= evaluations.length) {
                                            r++;
                                            c = 0;
                                          }
                                          if (c < 0) {
                                            r--;
                                            c = evaluations.length - 1;
                                          }
                                        }
                                        _move(r, c, students, evaluations);
                                      },
                                      onPaste: (text) {
                                        if (widget.search.isNotEmpty) {
                                          throw const FormatException(
                                            'Quite el filtro antes de pegar un bloque',
                                          );
                                        }
                                        controller.paste(row, col, text);
                                      },
                                    ),
                                  ),
                                ),
                              SizedBox(
                                width: 140,
                                child: summary == null
                                    ? const Text(
                                        'Incompleto',
                                        style: TextStyle(
                                          color: AppTheme.textMuted,
                                        ),
                                      )
                                    : Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            summary.literal,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: _color(summary.literal),
                                            ),
                                          ),
                                          if (book.json['level'] != 'primary')
                                            Text(
                                              '${summary.numeric.toStringAsFixed(2)} / ${finalSummary!.numeric.toInt()}',
                                              style: const TextStyle(
                                                color: AppTheme.textMuted,
                                              ),
                                            ),
                                        ],
                                      ),
                              ),
                              SizedBox(
                                width: 200,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    if (book.conclusions[id] != null)
                                      Text(
                                        book.conclusions[id] as String,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 11),
                                      ),
                                    if (controller.session.canTeach &&
                                        !book.closed)
                                      TextButton(
                                        onPressed:
                                            controller.clean && !controller.busy
                                            ? () => widget.onConclusion(student)
                                            : null,
                                        child: const Text('Conclusión'),
                                      ),
                                    if (controller.session.canTeach &&
                                        book.closed)
                                      TextButton(
                                        onPressed:
                                            controller.clean && !controller.busy
                                            ? () => widget.onRectify(student)
                                            : null,
                                        child: const Text('Rectificar'),
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
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class GradeCell extends StatefulWidget {
  const GradeCell({
    super.key,
    required this.focusNode,
    required this.label,
    required this.value,
    required this.enabled,
    required this.onChanged,
    required this.onMove,
    required this.onPaste,
    this.error,
    this.draft = false,
  });
  final FocusNode focusNode;
  final String label;
  final String value;
  final bool enabled;
  final String? error;
  final bool draft;
  final ValueChanged<String> onChanged;
  final void Function(int dr, int dc, bool linear) onMove;
  final ValueChanged<String> onPaste;
  @override
  State<GradeCell> createState() => _GradeCellState();
}

class _GradeCellState extends State<GradeCell> {
  late final TextEditingController _editor = TextEditingController(
    text: widget.value,
  );
  late String _before = widget.value;
  @override
  void initState() {
    super.initState();
    widget.focusNode.addListener(_focus);
  }

  void _focus() {
    if (widget.focusNode.hasFocus) {
      _before = _editor.text;
      _editor.selection = TextSelection(
        baseOffset: 0,
        extentOffset: _editor.text.length,
      );
    }
  }

  @override
  void didUpdateWidget(GradeCell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_editor.text != widget.value) {
      _editor.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    widget.focusNode.removeListener(_focus);
    _editor.dispose();
    super.dispose();
  }

  KeyEventResult _key(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent || !widget.enabled) {
      return KeyEventResult.ignored;
    }
    final key = event.logicalKey;
    if ((HardwareKeyboard.instance.isControlPressed ||
            HardwareKeyboard.instance.isMetaPressed) &&
        key == LogicalKeyboardKey.keyV) {
      Clipboard.getData(Clipboard.kTextPlain).then((data) {
        if (!mounted || data?.text == null || !widget.enabled) return;
        try {
          widget.onPaste(data!.text!);
        } on FormatException catch (e) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(e.message)));
        }
      });
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.escape) {
      _editor.text = _before;
      widget.onChanged(_before);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowDown ||
        key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter) {
      widget.onMove(1, 0, false);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowUp) {
      widget.onMove(-1, 0, false);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowLeft) {
      widget.onMove(0, -1, false);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowRight) {
      widget.onMove(0, 1, false);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.tab) {
      widget.onMove(0, HardwareKeyboard.instance.isShiftPressed ? -1 : 1, true);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) => Focus(
    onKeyEvent: _key,
    child: TextField(
      controller: _editor,
      focusNode: widget.focusNode,
      readOnly: !widget.enabled,
      keyboardType: TextInputType.text,
      textAlign: TextAlign.center,
      decoration: InputDecoration(
        isDense: true,
        border: const OutlineInputBorder(),
        errorText: widget.error,
        errorMaxLines: 2,
        helperText: widget.draft ? 'Borrador' : null,
        labelText: widget.label,
        floatingLabelBehavior: FloatingLabelBehavior.never,
      ),
      onChanged: widget.onChanged,
    ),
  );
}
