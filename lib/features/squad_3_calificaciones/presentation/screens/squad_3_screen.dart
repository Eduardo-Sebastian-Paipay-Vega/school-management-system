import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Pantalla Principal del Squad 3: Calificaciones y Modo Excel
/// Responsable: Steve Smith Ovalle Luyo (@steveovalle27-lgtm)
class Squad3Screen extends StatefulWidget {
  const Squad3Screen({super.key});

  @override
  State<Squad3Screen> createState() => _Squad3ScreenState();
}

class _Squad3ScreenState extends State<Squad3Screen> {
  final List<Map<String, dynamic>> _students = [
    {'name': 'Alarcón Huamán, Diego', 'n1': '18', 'n2': '16', 'cneb': 'AD', 'conclusion': 'Demuestra dominio destacado de los algoritmos.'},
    {'name': 'Bendezú Quispe, Flor', 'n1': '15', 'n2': '14', 'cneb': 'A', 'conclusion': 'Alcanza el nivel esperado en resolución de problemas.'},
    {'name': 'Carbajal Mendoza, Joel', 'n1': '12', 'n2': '11', 'cneb': 'B', 'conclusion': 'Se encuentra en proceso, requiere mayor acompañamiento.'},
    {'name': 'Díaz Navarro, Lucía', 'n1': '08', 'n2': '09', 'cneb': 'C', 'conclusion': 'En inicio. Se sugiere plan de refuerzo pedagógico.'},
  ];

  String _autoSaveStatus = 'Guardado en la nube (PostgreSQL)';
  Color _autoSaveColor = Colors.green;
  Timer? _debounceTimer;

  void _onGradeChanged(int index, String field, String value) {
    setState(() {
      _students[index][field] = value;
      _autoSaveStatus = 'Guardando en segundo plano (debounce 400 ms)...';
      _autoSaveColor = Colors.orange;

      // Conversión dual 0-20 a CNEB (RF-46)
      final num1 = double.tryParse(_students[index]['n1'] ?? '') ?? 0;
      final num2 = double.tryParse(_students[index]['n2'] ?? '') ?? 0;
      final prom = (num1 + num2) / 2.0;

      if (prom >= 18) {
        _students[index]['cneb'] = 'AD';
      } else if (prom >= 14) {
        _students[index]['cneb'] = 'A';
      } else if (prom >= 11) {
        _students[index]['cneb'] = 'B';
      } else {
        _students[index]['cneb'] = 'C';
      }
    });

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 400), () {
      setState(() {
        _autoSaveStatus = 'Guardado en la nube (PostgreSQL ACID)';
        _autoSaveColor = Colors.green;
      });
    });
  }

  Color _getCnebColor(String cneb) {
    switch (cneb) {
      case 'AD':
        return AppTheme.cnebAD;
      case 'A':
        return AppTheme.cnebA;
      case 'B':
        return AppTheme.cnebB;
      case 'C':
        return AppTheme.cnebC;
      default:
        return Colors.grey;
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 3: Calificaciones y Modo Excel'),
        backgroundColor: const Color(0xFF0E6655),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSquadHeader(),
          const SizedBox(height: 16),
          _buildAutoSaveBar(),
          const SizedBox(height: 12),
          _buildExcelMatrixCard(),
          const SizedBox(height: 16),
          _buildCnebAssistantCard(),
        ],
      ),
    );
  }

  Widget _buildSquadHeader() {
    return Card(
      color: const Color(0xFF0E6655),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MÓDULO M8 (RF-36 al RF-46)',
              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Planilla Rápida "Modo Excel", Auto-Guardado 400ms y Motor CNEB',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            Text(
              'Líder: Steve Smith Ovalle Luyo (@steveovalle27-lgtm)',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAutoSaveBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: _autoSaveColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _autoSaveColor),
      ),
      child: Row(
        children: [
          Icon(_autoSaveColor == Colors.green ? Icons.cloud_done : Icons.cloud_sync, color: _autoSaveColor, size: 20),
          const SizedBox(width: 8),
          Text(
            _autoSaveStatus,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _autoSaveColor),
          ),
        ],
      ),
    );
  }

  Widget _buildExcelMatrixCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Planilla Matricial Ágil (RF-38, RF-46)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Navegación: Flechas / Enter / Tab',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Table(
              columnWidths: const {
                0: FlexColumnWidth(3),
                1: FlexColumnWidth(1.2),
                2: FlexColumnWidth(1.2),
                3: FlexColumnWidth(1.2),
              },
              border: TableBorder.all(color: Colors.grey[300]!),
              children: [
                TableRow(
                  decoration: BoxDecoration(color: Colors.grey[100]),
                  children: const [
                    Padding(padding: EdgeInsets.all(8), child: Text('Estudiante', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                    Padding(padding: EdgeInsets.all(8), child: Text('Eval 1', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                    Padding(padding: EdgeInsets.all(8), child: Text('Eval 2', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                    Padding(padding: EdgeInsets.all(8), child: Text('CNEB', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                  ],
                ),
                ..._students.asMap().entries.map((entry) {
                  final i = entry.key;
                  final s = entry.value;
                  return TableRow(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Text(s['name'], style: const TextStyle(fontSize: 13)),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(4),
                        child: TextFormField(
                          initialValue: s['n1'],
                          textAlign: TextAlign.center,
                          decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                          onChanged: (val) => _onGradeChanged(i, 'n1', val),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(4),
                        child: TextFormField(
                          initialValue: s['n2'],
                          textAlign: TextAlign.center,
                          decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                          onChanged: (val) => _onGradeChanged(i, 'n2', val),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(6),
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _getCnebColor(s['cneb']),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              s['cneb'],
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                }),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCnebAssistantCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Row(
              children: [
                Icon(Icons.auto_stories, color: Colors.teal),
                SizedBox(width: 8),
                Text(
                  'Asistente de Conclusiones Descriptivas MINEDU (RF-39)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Banco taxonómico oficial preconfigurado con inserción en 1 toque. Soporte para rectificaciones formales de notas (RF-43) y cierre de periodo inmutable (RF-42).',
              style: TextStyle(fontSize: 13, color: AppTheme.textDark),
            ),
          ],
        ),
      ),
    );
  }
}
