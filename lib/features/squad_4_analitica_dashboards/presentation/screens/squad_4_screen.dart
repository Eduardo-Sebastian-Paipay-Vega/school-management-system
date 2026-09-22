import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Pantalla Principal del Squad 4: Analítica y Dashboards 360°
/// Responsable: Grissel Arascely Rodríguez Quispe (@Arascely)
class Squad4Screen extends StatefulWidget {
  const Squad4Screen({super.key});

  @override
  State<Squad4Screen> createState() => _Squad4ScreenState();
}

class _Squad4ScreenState extends State<Squad4Screen> {
  String _currentZoomLevel = 'Colegio Guamán Poma';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 4: Analítica y Dashboards'),
        backgroundColor: const Color(0xFF6C3483),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSquadHeader(),
          const SizedBox(height: 16),
          _buildKpisRow(),
          const SizedBox(height: 16),
          _buildHeatmapCard(),
          const SizedBox(height: 16),
          _buildStudent360Card(),
          const SizedBox(height: 16),
          _buildSsuImpactCard(),
        ],
      ),
    );
  }

  Widget _buildSquadHeader() {
    return Card(
      color: const Color(0xFF6C3483),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MÓDULOS M9, M10 (RF-47 al RF-58)',
              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Mapas de Calor Drill-Down, Ficha 360° y Métricas SSU IS-480',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            Text(
              'Líder: Grissel Arascely Rodríguez Quispe (@Arascely)',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpisRow() {
    return Row(
      children: [
        Expanded(child: _buildKpiBox('Matrícula', '680', '+4.2%', Colors.blue)),
        const SizedBox(width: 8),
        Expanded(child: _buildKpiBox('Asistencia', '94.8%', 'Normal', Colors.green)),
        const SizedBox(width: 8),
        Expanded(child: _buildKpiBox('En Riesgo', '12', 'Atención', Colors.red)),
      ],
    );
  }

  Widget _buildKpiBox(String label, String value, String trend, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          Text(trend, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildHeatmapCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Mapa de Calor con Drill-Down (RF-47, RF-49)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _currentZoomLevel = 'Colegio Guamán Poma';
                    });
                  },
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Reset Zoom', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.purple[50], borderRadius: BorderRadius.circular(4)),
              child: Text(
                'Ruta de navegación: $_currentZoomLevel',
                style: const TextStyle(fontSize: 12, color: Colors.purple, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildHeatmapCell('1° Sec - Sec. A', AppTheme.cnebA, '88% Aprob.'),
                _buildHeatmapCell('1° Sec - Sec. B', AppTheme.cnebAD, '94% Aprob.'),
                _buildHeatmapCell('2° Sec - Sec. A', AppTheme.cnebB, '72% Aprob.'),
                _buildHeatmapCell('2° Sec - Sec. B (Crítico)', AppTheme.cnebC, '54% Aprob.'),
                _buildHeatmapCell('3° Sec - Sec. A', AppTheme.cnebA, '85% Aprob.'),
                _buildHeatmapCell('3° Sec - Sec. B', AppTheme.cnebA, '89% Aprob.'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeatmapCell(String name, Color color, String metric) {
    return InkWell(
      onTap: () {
        setState(() {
          _currentZoomLevel = 'Colegio > $name > Detalle de Alumnos';
        });
      },
      child: Container(
        width: 150,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.85),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
            const SizedBox(height: 4),
            Text(metric, style: const TextStyle(color: Colors.white70, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _buildStudent360Card() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Row(
              children: [
                Icon(Icons.person_pin, color: Color(0xFF6C3483)),
                SizedBox(width: 8),
                Text(
                  'Ficha Radiografía Escolar 360° en 1 Clic (RF-56)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Unificación instantánea: Datos del estudiante, historial de notas, récord de asistencia, contactos de apoderados y detección temprana de deserción (RF-55).',
              style: TextStyle(fontSize: 13, color: AppTheme.textDark),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSsuImpactCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Tablero de Acreditación SSU IS-480 (RF-57)',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              '5 Practicantes EPIS-UNSCH activos • 480 horas proyectadas • 680 escolares beneficiados • Reporte listo para SUNEDU / SINEACE.',
              style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
