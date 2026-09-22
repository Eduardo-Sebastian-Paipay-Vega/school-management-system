import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'sdd_viewer_screen.dart';

/// Pantalla Principal del Squad 1: Core, Seguridad y Auditoría
/// Responsable: Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
class Squad1Screen extends StatefulWidget {
  const Squad1Screen({super.key});

  @override
  State<Squad1Screen> createState() => _Squad1ScreenState();
}

class _Squad1ScreenState extends State<Squad1Screen> {
  final _usernameController = TextEditingController(text: '70859632');
  final _passwordController = TextEditingController(text: '••••••••••••');
  bool _isLogged = false;
  String _selectedRole = 'DIRECTOR';

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 1: Core y Seguridad'),
        backgroundColor: const Color(0xFF2C3E50),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu_book),
            tooltip: 'Ver SDD Oficial (IEEE 1016)',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SddViewerScreen()),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSquadHeader(),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SddViewerScreen()),
              );
            },
            icon: const Icon(Icons.description, color: Colors.amber),
            label: const Text('📄 Ver Documento de Diseño de Software (SDD - IEEE 1016)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A252F),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
          const SizedBox(height: 16),
          _buildAuthCard(),
          const SizedBox(height: 16),
          _buildRbacCard(),
          const SizedBox(height: 16),
          _buildAuditLogPreview(),
        ],
      ),
    );
  }

  Widget _buildSquadHeader() {
    return Card(
      color: const Color(0xFF2C3E50),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MÓDULOS M1, M2, M3, M12 (RF-01 al RF-14, RF-65 al RF-68)',
              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Autenticación JWT, RBAC, Multi-Tenant y Auditoría Inmutable',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            Text(
              'Líder: Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.security, color: Color(0xFF2C3E50)),
                const SizedBox(width: 8),
                const Text(
                  'Prueba de Autenticación JWT (RF-01, RF-02)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'DNI / Usuario Institucional',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Contraseña (bcrypt hash)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _isLogged = !_isLogged;
                    });
                  },
                  icon: Icon(_isLogged ? Icons.logout : Icons.login),
                  label: Text(_isLogged ? 'Cerrar Sesión (Invalidar JWT)' : 'Iniciar Sesión (Generar Access/Refresh)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isLogged ? Colors.red[700] : const Color(0xFF2C3E50),
                  ),
                ),
              ],
            ),
            if (_isLogged) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Token JWT activo (15 min) • Refresh Token en cookie HttpOnly • Tenant: GP-AYACUCHO-2026',
                        style: TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRbacCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Control de Acceso Basado en Roles (RBAC - RF-04)',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: ['SUPERADMIN', 'DIRECTOR', 'DOCENTE', 'PRACTICANTE', 'PORTERIA', 'ESTUDIANTE'].map((role) {
                final isSelected = _selectedRole == role;
                return ChoiceChip(
                  label: Text(role),
                  selected: isSelected,
                  selectedColor: const Color(0xFF2C3E50),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
                  onSelected: (val) {
                    setState(() {
                      _selectedRole = role;
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 8),
            Text(
              'Permisos concedidos: ${_getPermissionsForRole(_selectedRole)}',
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  String _getPermissionsForRole(String role) {
    switch (role) {
      case 'SUPERADMIN':
        return 'Control total del sistema, configuración de sedes, gestión de roles y auditoría.';
      case 'DIRECTOR':
        return 'Aprobación de actas, supervisión general, mapas de calor, reportes de impacto.';
      case 'DOCENTE':
        return 'Registro de calificaciones (Modo Excel), conclusiones CNEB, asistencia de aula.';
      case 'PRACTICANTE':
        return 'Marcación de permanencia SSU, asistencia asistida de notas bajo supervisión.';
      case 'PORTERIA':
        return 'Acceso exclusivo al Kiosco de Asistencia Offline-First y lector de carnés QR.';
      case 'ESTUDIANTE':
        return 'Consulta de notas publicadas, récord de asistencia y carné digital institucional.';
      default:
        return 'Acceso restringido.';
    }
  }

  Widget _buildAuditLogPreview() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.history, color: Colors.blueGrey),
                SizedBox(width: 8),
                Text(
                  'Bitácora Inmutable de Auditoría (Ley 29733 - RF-65, RF-66)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _buildAuditRow('AUTH_LOGIN_SUCCESS', '70859632', '190.237.12.44', 'Hace 2 min'),
            _buildAuditRow('GRADE_MODIFIED_AUDIT', 'DOC-2026-04', '192.168.1.105', 'Hace 15 min'),
            _buildAuditRow('SESSION_TIMEOUT_EXPIRE', 'ALU-2026-118', '192.168.1.80', 'Hace 45 min'),
          ],
        ),
      ),
    );
  }

  Widget _buildAuditRow(String action, String user, String ip, String time) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(action, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace')),
          Text('Usuario: $user', style: const TextStyle(fontSize: 12, color: Colors.black54)),
          Text(ip, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          Text(time, style: const TextStyle(fontSize: 11, color: Colors.blueGrey)),
        ],
      ),
    );
  }
}
