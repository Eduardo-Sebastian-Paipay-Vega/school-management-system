import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Pantalla Principal del Squad 2: Matrícula y Asistencia Offline-First
/// Responsable: Eduardo Sebastian Paipay Vega (@Eduardo-Sebastian-Paipay-Vega)
class Squad2Screen extends StatefulWidget {
  const Squad2Screen({super.key});

  @override
  State<Squad2Screen> createState() => _Squad2ScreenState();
}

class _Squad2ScreenState extends State<Squad2Screen> {
  bool _isOfflineMode = false;
  int _localQueueCount = 42;
  String _lastScannedStudent = 'Paipay Vega, Eduardo Sebastian';
  String _scanStatus = 'PUNTUAL';
  Color _statusColor = AppTheme.attendancePresente;
  final TextEditingController _qrInputController = TextEditingController(text: 'QR-EST-2026-0842');

  @override
  void dispose() {
    _qrInputController.dispose();
    super.dispose();
  }

  void _simulateQrScan() {
    setState(() {
      final now = DateTime.now();
      if (now.minute % 2 == 0) {
        _scanStatus = 'PUNTUAL (07:38 AM)';
        _statusColor = AppTheme.attendancePresente;
        _lastScannedStudent = 'Paipay Vega, Eduardo Sebastian';
      } else {
        _scanStatus = 'TARDANZA (07:52 AM)';
        _statusColor = AppTheme.attendanceTardanza;
        _lastScannedStudent = 'Quispe Mendoza, Carlos';
      }
      if (_isOfflineMode) {
        _localQueueCount++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 2: Matrícula y Asistencia Offline'),
        backgroundColor: const Color(0xFF1B4F72),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSquadHeader(),
          const SizedBox(height: 16),
          _buildKioskCard(),
          const SizedBox(height: 16),
          _buildOfflineBufferCard(),
          const SizedBox(height: 16),
          _buildQuickAttendanceCard(),
        ],
      ),
    );
  }

  Widget _buildSquadHeader() {
    return Card(
      color: const Color(0xFF1B4F72),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MÓDULOS M4, M5, M6, M7 (RF-15 al RF-35)',
              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Kiosco de Portería Offline-First, Carnés QR y Control de Horas',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            Text(
              'Líder: Eduardo Sebastian Paipay Vega (@Eduardo-Sebastian-Paipay-Vega)',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKioskCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.qr_code_scanner, color: Color(0xFF1B4F72)),
                    SizedBox(width: 8),
                    Text(
                      'Modo Kiosco de Portería (RF-21, RF-25)',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _isOfflineMode ? Colors.orange : Colors.green,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(_isOfflineMode ? Icons.cloud_off : Icons.cloud_done, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        _isOfflineMode ? 'MODO OFFLINE' : 'ONLINE',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _statusColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _statusColor, width: 2),
              ),
              child: Column(
                children: [
                  Text(
                    _scanStatus,
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: _statusColor),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _lastScannedStudent,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Text('3° Grado "B" • Nivel Secundaria • DNI: 74128956', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 8),
                  const Text('Procesado en < 280 ms • Verificado criptográficamente', style: TextStyle(fontSize: 11, color: Colors.blueGrey)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _qrInputController,
                    decoration: const InputDecoration(
                      labelText: 'Simulador de Escaneo de Carné QR',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.badge),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: _simulateQrScan,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Escanear'),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1B4F72)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOfflineBufferCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Resiliencia y Búfer Local (IndexedDB / Hive - RF-25)',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Simular Corte de Red en Garita:', style: TextStyle(color: Colors.grey[800])),
                Switch(
                  value: _isOfflineMode,
                  activeThumbColor: Colors.orange,
                  onChanged: (val) {
                    setState(() {
                      _isOfflineMode = val;
                    });
                  },
                ),
              ],
            ),
            LinearProgressIndicator(
              value: _localQueueCount / 100,
              backgroundColor: Colors.grey[200],
              color: _isOfflineMode ? Colors.orange : Colors.green,
            ),
            const SizedBox(height: 8),
            Text(
              'Cola local: $_localQueueCount marcaciones almacenadas en disco local • Capacidad: 2,000',
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAttendanceCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Row(
              children: [
                Icon(Icons.wifi_tethering, color: Colors.teal),
                SizedBox(width: 8),
                Text(
                  'Difusión en Tiempo Real vía WebSockets (RF-27)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Evento: ATTENDANCE_TAKEN transmitido a Dirección en < 400 ms.\nMonitoreo de horas de practicantes EPIS-UNSCH y control de clases de docentes contratados.',
              style: TextStyle(fontSize: 13, color: AppTheme.textDark),
            ),
          ],
        ),
      ),
    );
  }
}
