import 'package:flutter/material.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/squad_card.dart';
import 'features/squad_1_core_seguridad/squad_1_core.dart';
import 'features/squad_2_matricula_asistencia/squad_2_academic.dart';
import 'features/squad_3_calificaciones/squad_3_grades.dart';
import 'features/squad_4_analitica_dashboards/squad_4_analytics.dart';
import 'features/squad_5_secretaria_portal/squad_5_portal.dart';

void main() {
  runApp(const SchoolManagementApp());
}

/// Aplicación Principal del Sistema de Gestión Escolar
/// Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (SSU IS-480)
class SchoolManagementApp extends StatelessWidget {
  const SchoolManagementApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigationShell(),
    );
  }
}

/// Contenedor Principal con Navegación Modular por Squads
class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    SquadOverviewScreen(),
    Squad1Screen(),
    Squad2Screen(),
    Squad3Screen(),
    Squad4Screen(),
    Squad5Screen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard),
            label: 'Visión General',
          ),
          NavigationDestination(
            icon: Icon(Icons.security),
            label: 'Squad 1',
          ),
          NavigationDestination(
            icon: Icon(Icons.how_to_reg),
            label: 'Squad 2',
          ),
          NavigationDestination(
            icon: Icon(Icons.table_chart),
            label: 'Squad 3',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics),
            label: 'Squad 4',
          ),
          NavigationDestination(
            icon: Icon(Icons.verified),
            label: 'Squad 5',
          ),
        ],
      ),
    );
  }
}

/// Pantalla de Visión General e Inducción de los 5 Squads
class SquadOverviewScreen extends StatelessWidget {
  const SquadOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          AppConstants.institutionName,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _showAboutDialog(context),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          _buildHeroBanner(),
          const SizedBox(height: 10),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Módulos y Squads de Trabajo (Fase 2)',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textDark,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Selecciona cualquier squad para inspeccionar su módulo de desarrollo:',
                  style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
          SquadCard(
            squadNumber: 'Squad 1',
            title: 'Core, Seguridad, Configuración y Auditoría',
            leaderName: 'Brandon Fernando Montero Gutiérrez',
            githubHandle: '@brandonmontero27-g',
            rfsRange: '18 RFs (RF-01..14, RF-65..68)',
            icon: Icons.security,
            accentColor: const Color(0xFF2C3E50),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Squad1Screen()),
              );
            },
          ),
          SquadCard(
            squadNumber: 'Squad 2',
            title: 'Matrícula y Asistencia Offline-First',
            leaderName: 'Eduardo Sebastian Paipay Vega',
            githubHandle: '@Eduardo-Sebastian-Paipay-Vega',
            rfsRange: '21 RFs (RF-15 al RF-35)',
            icon: Icons.qr_code_scanner,
            accentColor: const Color(0xFF1B4F72),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Squad2Screen()),
              );
            },
          ),
          SquadCard(
            squadNumber: 'Squad 3',
            title: 'Calificaciones, Modo Excel y Motor CNEB',
            leaderName: 'Steve Smith Ovalle Luyo',
            githubHandle: '@steveovalle27-lgtm',
            rfsRange: '11 RFs (RF-36 al RF-46)',
            icon: Icons.table_chart,
            accentColor: const Color(0xFF0E6655),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Squad3Screen()),
              );
            },
          ),
          SquadCard(
            squadNumber: 'Squad 4',
            title: 'Inteligencia de Datos, Mapas de Calor y Dashboards',
            leaderName: 'Grissel Arascely Rodríguez Quispe',
            githubHandle: '@Arascely',
            rfsRange: '12 RFs (RF-47 al RF-58)',
            icon: Icons.insights,
            accentColor: const Color(0xFF6C3483),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Squad4Screen()),
              );
            },
          ),
          SquadCard(
            squadNumber: 'Squad 5',
            title: 'Secretaría Digital, Criptografía SHA-256 y Portal Web',
            leaderName: 'Cesar Antonio Leon Reyna',
            githubHandle: '@cesarleon27-ai',
            rfsRange: '9 RFs (RF-59..64, RF-69..71)',
            icon: Icons.verified,
            accentColor: const Color(0xFF784212),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Squad5Screen()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, AppTheme.unschBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'SSU IS-480 • INGENIERÍA DE SISTEMAS — UNSCH',
            style: TextStyle(
              color: Colors.amber,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Sistema Integral de Gestión Escolar',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Arquitectura Flutter Modular dividida en 5 Squads Técnicos Especializados. 71 Requisitos Funcionales y 71 Casos de Uso integrados.',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Acerca del Sistema'),
        content: const Text(
          'Planteles de Aplicación "Guamán Poma de Ayala"\n'
          'Universidad Nacional de San Cristóbal de Huamanga\n\n'
          'Servicio Social Universitario IS-480 (2026-II)\n'
          'Total: 71 Requisitos Funcionales organizados en 5 Squads.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}
