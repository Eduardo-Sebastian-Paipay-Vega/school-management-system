import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/academic_period.dart';
import '../../domain/models/grade_section.dart';
import '../../domain/models/grading_scale.dart';
import '../../domain/models/institutional_params.dart';
import '../../domain/models/session_tokens.dart';
import '../controllers/academic_config_controller.dart';
import '../scope/squad_1_scope.dart';
import '../widgets/async_action_button.dart';
import '../widgets/letterhead_preview.dart';

/// Configuración escolar — Módulo 3: RF-10 (año lectivo), RF-11
/// (periodos/bimestres), RF-12 (grados y secciones), RF-13 (escala dual
/// CNEB) y RF-14 (parámetros institucionales / membrete).
class AcademicConfigScreen extends StatefulWidget {
  const AcademicConfigScreen({super.key});

  @override
  State<AcademicConfigScreen> createState() => _AcademicConfigScreenState();
}

class _AcademicConfigScreenState extends State<AcademicConfigScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final scope = Squad1Scope.of(context);
      scope.academicConfigController.loadAll(scope.authController.session!.tenantId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('RF-10..14 · Configuración Escolar'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'RF-10 Año Lectivo'),
              Tab(text: 'RF-11 Periodos'),
              Tab(text: 'RF-12 Grados/Secciones'),
              Tab(text: 'RF-13 Escala CNEB'),
              Tab(text: 'RF-14 Membrete'),
            ],
          ),
        ),
        body: const TabBarView(children: [
          _AcademicYearTab(),
          _PeriodsTab(),
          _GradeSectionsTab(),
          _GradingScaleTab(),
          _InstitutionalParamsTab(),
        ]),
      ),
    );
  }
}

class _AcademicYearTab extends StatefulWidget {
  const _AcademicYearTab();
  @override
  State<_AcademicYearTab> createState() => _AcademicYearTabState();
}

class _AcademicYearTabState extends State<_AcademicYearTab> {
  final _anioController = TextEditingController(text: '${DateTime.now().year}');
  final DateTime _inicio = DateTime(DateTime.now().year, 3, 1);
  final DateTime _fin = DateTime(DateTime.now().year, 12, 20);

  @override
  void dispose() {
    _anioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.academicConfigController;
    final session = scope.authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (controller.activeYear != null)
                Card(
                  color: AppTheme.attendancePresente.withValues(alpha: 0.08),
                  child: ListTile(
                    leading: const Icon(Icons.event_available, color: AppTheme.attendancePresente),
                    title: Text('Año lectivo activo: ${controller.activeYear!.anio}'),
                    subtitle: Text(
                      '${controller.activeYear!.fechaInicio.toIso8601String().substring(0, 10)} → '
                      '${controller.activeYear!.fechaFin.toIso8601String().substring(0, 10)}',
                    ),
                  ),
                )
              else
                const Text('No hay un año lectivo abierto para esta sede.', style: TextStyle(color: AppTheme.textMuted)),
              const SizedBox(height: 16),
              const Text('Aperturar nuevo año lectivo', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              TextField(
                controller: _anioController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Año', border: OutlineInputBorder()),
              ),
              if (controller.errorMessage != null) ...[
                const SizedBox(height: 8),
                Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
              ],
              const SizedBox(height: 10),
              AsyncActionButton(
                label: 'Aperturar año lectivo',
                icon: Icons.event_available,
                isLoading: controller.isLoading,
                onPressed: () => controller.openAcademicYear(
                  actingSession: session,
                  anio: int.tryParse(_anioController.text.trim()) ?? DateTime.now().year,
                  fechaInicio: _inicio,
                  fechaFin: _fin,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PeriodsTab extends StatefulWidget {
  const _PeriodsTab();
  @override
  State<_PeriodsTab> createState() => _PeriodsTabState();
}

class _PeriodsTabState extends State<_PeriodsTab> {
  final _nombreController = TextEditingController(text: 'Bimestre I');
  final _toleranciaController = TextEditingController(text: '5');

  @override
  void dispose() {
    _nombreController.dispose();
    _toleranciaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.academicConfigController;
    final session = scope.authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ListView(
                children: controller.periods.map((p) => _PeriodTile(period: p, controller: controller, session: session)).toList(),
              ),
            ),
            const Divider(),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _nombreController,
                    decoration: const InputDecoration(labelText: 'Nombre del periodo', border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  width: 120,
                  child: TextField(
                    controller: _toleranciaController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Tolerancia (días)', border: OutlineInputBorder()),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            AsyncActionButton(
              label: 'Crear periodo',
              icon: Icons.calendar_month,
              isLoading: controller.isLoading,
              onPressed: () {
                final now = DateTime.now().toUtc();
                return controller.createPeriod(
                  actingSession: session,
                  nombre: _nombreController.text.trim(),
                  fechaInicio: now,
                  fechaFin: now.add(const Duration(days: 60)),
                  fechaLimiteNotas: now.add(const Duration(days: 63)),
                  toleranciaDias: int.tryParse(_toleranciaController.text.trim()) ?? 5,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _PeriodTile extends StatelessWidget {
  const _PeriodTile({required this.period, required this.controller, required this.session});

  final AcademicPeriod period;
  final AcademicConfigController controller;
  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(
          period.estado == PeriodStatus.cerrado
              ? Icons.lock_outline
              : (period.estado == PeriodStatus.enCurso ? Icons.play_circle_outline : Icons.schedule),
        ),
        title: Text('${period.nombre} · ${period.estado.code}'),
        subtitle: Text(
          'Límite de notas: ${period.fechaLimiteNotas.toIso8601String().substring(0, 10)} '
          '(+${period.toleranciaDias}d tolerancia)',
        ),
        trailing: period.estado == PeriodStatus.cerrado
            ? null
            : TextButton(
                onPressed: () => controller.closePeriod(actingSession: session, periodId: period.id),
                child: const Text('Cerrar'),
              ),
      ),
    );
  }
}

class _GradeSectionsTab extends StatefulWidget {
  const _GradeSectionsTab();
  @override
  State<_GradeSectionsTab> createState() => _GradeSectionsTabState();
}

class _GradeSectionsTabState extends State<_GradeSectionsTab> {
  final _nivelController = TextEditingController(text: 'Secundaria');
  final _gradoController = TextEditingController(text: '1°');
  final _seccionController = TextEditingController(text: 'A');
  final _aforoController = TextEditingController(text: '35');
  Shift _turno = Shift.manana;

  @override
  void dispose() {
    _nivelController.dispose();
    _gradoController.dispose();
    _seccionController.dispose();
    _aforoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.academicConfigController;
    final session = scope.authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ListView(
                children: controller.gradeSections
                    .map((s) => Card(
                          child: ListTile(
                            leading: const Icon(Icons.groups_outlined),
                            title: Text(s.etiqueta),
                            trailing: Text('Aforo: ${s.aforoMaximo}'),
                          ),
                        ))
                    .toList(),
              ),
            ),
            const Divider(),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SizedBox(width: 140, child: TextField(controller: _nivelController, decoration: const InputDecoration(labelText: 'Nivel', border: OutlineInputBorder()))),
                SizedBox(width: 90, child: TextField(controller: _gradoController, decoration: const InputDecoration(labelText: 'Grado', border: OutlineInputBorder()))),
                SizedBox(width: 90, child: TextField(controller: _seccionController, decoration: const InputDecoration(labelText: 'Sección', border: OutlineInputBorder()))),
                SizedBox(width: 90, child: TextField(controller: _aforoController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Aforo', border: OutlineInputBorder()))),
                DropdownButton<Shift>(
                  value: _turno,
                  items: Shift.values.map((t) => DropdownMenuItem(value: t, child: Text(t.label))).toList(),
                  onChanged: (v) => setState(() => _turno = v!),
                ),
              ],
            ),
            const SizedBox(height: 8),
            AsyncActionButton(
              label: 'Crear sección',
              icon: Icons.add_box_outlined,
              isLoading: controller.isLoading,
              onPressed: () => controller.createGradeSection(
                actingSession: session,
                nivelEducativo: _nivelController.text.trim(),
                grado: _gradoController.text.trim(),
                seccion: _seccionController.text.trim(),
                aforoMaximo: int.tryParse(_aforoController.text.trim()) ?? 35,
                turno: _turno,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GradingScaleTab extends StatelessWidget {
  const _GradingScaleTab();

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.academicConfigController;
    final gradingScaleService = scope.gradingScaleService;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...controller.gradingScales.map((scale) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${scale.nivelEducativo} · Nota mínima aprobatoria: ${scale.notaMinimaAprobatoria}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 8,
                        children: scale.thresholds
                            .map((t) => Chip(label: Text('${t.literal}: ${t.minScore}-${t.maxScore}')))
                            .toList(),
                      ),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 12),
          Card(
            color: AppTheme.backgroundLight,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Simulador de conversión (RF-13):', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  if (controller.gradingScales.isNotEmpty)
                    Text(
                      '15.6 → ${gradingScaleService.literalFor(controller.gradingScales.first, 15.6)} '
                      '(el motor de conversión de Squad 3 / RF-46 debe consumir esta escala)',
                      style: const TextStyle(fontSize: 12),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InstitutionalParamsTab extends StatefulWidget {
  const _InstitutionalParamsTab();
  @override
  State<_InstitutionalParamsTab> createState() => _InstitutionalParamsTabState();
}

class _InstitutionalParamsTabState extends State<_InstitutionalParamsTab> {
  late final TextEditingController _nombreController;
  late final TextEditingController _lemaController;
  late final TextEditingController _directorController;
  late final TextEditingController _pieController;
  Uint8List? _escudoBytes;
  String? _escudoFileName;
  bool _initialized = false;

  void _initFrom(InstitutionalParams? params) {
    if (_initialized) return;
    _nombreController = TextEditingController(text: params?.nombreOficial ?? '');
    _lemaController = TextEditingController(text: params?.lemaDelAnio ?? '');
    _directorController = TextEditingController(text: params?.directorGeneralNombre ?? '');
    _pieController = TextEditingController(text: params?.piePaginaBoletas ?? '');
    _escudoBytes = params?.escudoBytes;
    _initialized = true;
  }

  Future<void> _pickShield() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
    if (result == null || result.files.isEmpty) return;
    setState(() {
      _escudoBytes = result.files.single.bytes;
      _escudoFileName = result.files.single.name;
    });
  }

  @override
  void dispose() {
    if (_initialized) {
      _nombreController.dispose();
      _lemaController.dispose();
      _directorController.dispose();
      _pieController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = Squad1Scope.of(context);
    final controller = scope.academicConfigController;
    final session = scope.authController.session!;
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        _initFrom(controller.institutionalParams);
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LetterheadPreview(
                  params: InstitutionalParams(
                    tenantId: session.tenantId,
                    nombreOficial: _nombreController.text,
                    lemaDelAnio: _lemaController.text,
                    directorGeneralNombre: _directorController.text,
                    piePaginaBoletas: _pieController.text,
                    updatedAt: DateTime.now().toUtc(),
                    escudoBytes: _escudoBytes,
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: _pickShield,
                  icon: const Icon(Icons.image_outlined),
                  label: Text(_escudoFileName ?? 'Cargar escudo institucional (PNG)'),
                ),
                const SizedBox(height: 12),
                TextField(controller: _nombreController, decoration: const InputDecoration(labelText: 'Nombre oficial', border: OutlineInputBorder()), onChanged: (_) => setState(() {})),
                const SizedBox(height: 8),
                TextField(controller: _lemaController, decoration: const InputDecoration(labelText: 'Lema del año', border: OutlineInputBorder()), onChanged: (_) => setState(() {})),
                const SizedBox(height: 8),
                TextField(controller: _directorController, decoration: const InputDecoration(labelText: 'Director General', border: OutlineInputBorder()), onChanged: (_) => setState(() {})),
                const SizedBox(height: 8),
                TextField(controller: _pieController, decoration: const InputDecoration(labelText: 'Pie de página de boletas', border: OutlineInputBorder()), maxLines: 2, onChanged: (_) => setState(() {})),
                if (controller.errorMessage != null) ...[
                  const SizedBox(height: 8),
                  Text(controller.errorMessage!, style: const TextStyle(color: AppTheme.attendanceFalta, fontSize: 12)),
                ],
                const SizedBox(height: 12),
                AsyncActionButton(
                  label: 'Guardar membrete institucional',
                  icon: Icons.save_outlined,
                  isLoading: controller.isLoading,
                  onPressed: () => controller.saveInstitutionalParams(
                    actingSession: session,
                    params: InstitutionalParams(
                      tenantId: session.tenantId,
                      nombreOficial: _nombreController.text.trim(),
                      lemaDelAnio: _lemaController.text.trim(),
                      directorGeneralNombre: _directorController.text.trim(),
                      piePaginaBoletas: _pieController.text.trim(),
                      updatedAt: DateTime.now().toUtc(),
                      escudoBytes: _escudoBytes,
                      escudoFileName: _escudoFileName,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
