import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Visor Visual Interactivo del SDD (Software Design Document)
/// Demuestra el estándar normativo IEEE 1016 aplicado al Squad 1
class SddViewerScreen extends StatelessWidget {
  const SddViewerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('SDD: Squad 1 — Core y Seguridad (IEEE 1016)'),
          backgroundColor: const Color(0xFF2C3E50),
          bottom: const TabBar(
            isScrollable: true,
            indicatorColor: Colors.amber,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white60,
            tabs: [
              Tab(icon: Icon(Icons.info_outline), text: '1. Alcance & Metadatos'),
              Tab(icon: Icon(Icons.account_tree), text: '2. Arquitectura C4'),
              Tab(icon: Icon(Icons.storage), text: '3. PostgreSQL DDL'),
              Tab(icon: Icon(Icons.api), text: '4. Contratos API'),
              Tab(icon: Icon(Icons.check_circle_outline), text: '5. Trazabilidad'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _TabScopeAndMetadata(),
            _TabArchitectureC4(),
            _TabDatabaseSchema(),
            _TabApiContracts(),
            _TabTraceability(),
          ],
        ),
      ),
    );
  }
}

class _TabScopeAndMetadata extends StatelessWidget {
  const _TabScopeAndMetadata();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Ubicación Física del Archivo en el Repositorio:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blueGrey),
                ),
                SizedBox(height: 4),
                SelectableText(
                  'D - Base 1 - 01092026/Fase 2/Arquitectura/Squad 1 - Core y Seguridad/sdd_squad_1.md',
                  style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Ficha Técnica del SDD', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Divider(),
                _buildInfoRow('Estándar:', 'IEEE 1016-2009 / ISO/IEC/IEEE 42010'),
                _buildInfoRow('Squad:', 'Squad 1: Core, Seguridad y Auditoría'),
                _buildInfoRow('Líder:', 'Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)'),
                _buildInfoRow('Rama Git:', 'feature/squad-1/auth-core'),
                _buildInfoRow('Módulos:', 'M1 (Auth), M2 (Usuarios), M3 (Config Escolar), M12 (Auditoría)'),
                _buildInfoRow('Requisitos:', '18 RFs (RF-01 al RF-14, RF-65 al RF-68)'),
                _buildInfoRow('Casos de Uso:', '18 CUs (CU-SEG-01..04, CU-USR-01..05, CU-INS, CU-AUD)'),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
          Expanded(child: Text(val, style: const TextStyle(fontSize: 12))),
        ],
      ),
    );
  }
}

class _TabArchitectureC4 extends StatelessWidget {
  const _TabArchitectureC4();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Diagrama C4: Contenedores e Interacciones', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                SizedBox(height: 10),
                Text('• Frontend: Flutter Web / Mobile bajo Feature-First (lib/features/squad_1_core_seguridad/)'),
                Text('• Seguridad: Interceptor JWT + Redis Blacklist + Rate Limiting (5 req/15 min)'),
                Text('• Backend: API RESTful en Node.js/Dart con bcrypt (factor de coste 12)'),
                Text('• Base de Datos: PostgreSQL 16 Multi-Tenant con partición lógica por tenant_id'),
                Text('• Auditoría: Triggers en audit_logs que impiden UPDATE y DELETE (Ley 29733)'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TabDatabaseSchema extends StatelessWidget {
  const _TabDatabaseSchema();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: const Color(0xFF1E1E1E),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'PostgreSQL DDL (esquema_datos.sql):',
                  style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                SizedBox(height: 8),
                SelectableText(
                  'CREATE TABLE usuarios (\n'
                  '    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n'
                  '    tenant_id UUID NOT NULL REFERENCES instituciones(id),\n'
                  '    username VARCHAR(50) NOT NULL,\n'
                  '    dni CHAR(8) NOT NULL,\n'
                  '    password_hash VARCHAR(255) NOT NULL, -- bcrypt cost 12\n'
                  '    estado estado_usuario_enum DEFAULT \'ACTIVO\',\n'
                  '    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n'
                  ');\n\n'
                  'CREATE TABLE audit_logs (\n'
                  '    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n'
                  '    tenant_id UUID NOT NULL,\n'
                  '    user_id UUID REFERENCES usuarios(id),\n'
                  '    accion VARCHAR(100) NOT NULL,\n'
                  '    ip_address VARCHAR(45) NOT NULL,\n'
                  '    payload_diff JSONB,\n'
                  '    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n'
                  ');\n'
                  '-- Trigger inmutable: Prohibido UPDATE/DELETE',
                  style: TextStyle(color: Colors.lightGreenAccent, fontFamily: 'monospace', fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TabApiContracts extends StatelessWidget {
  const _TabApiContracts();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: const Color(0xFF1E1E1E),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('POST /api/v1/auth/login', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                SelectableText(
                  'Request:\n'
                  '{\n'
                  '  "tenantModularCode": "0382910",\n'
                  '  "username": "70859632",\n'
                  '  "password": "Password123!"\n'
                  '}\n\n'
                  'Response 200 OK:\n'
                  '{\n'
                  '  "success": true,\n'
                  '  "data": {\n'
                  '    "accessToken": "eyJhbGciOi...",\n'
                  '    "expiresIn": 900,\n'
                  '    "user": { "roles": ["SUPERADMIN"] }\n'
                  '  }\n'
                  '}\n'
                  'Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict',
                  style: TextStyle(color: Colors.white70, fontFamily: 'monospace', fontSize: 11),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TabTraceability extends StatelessWidget {
  const _TabTraceability();

  @override
  Widget build(BuildContext context) {
    final rows = [
      {'rf': 'RF-01', 'cu': 'CU-SEG-01', 'sql': 'usuarios', 'api': 'POST /auth/login', 'ui': 'LoginScreen'},
      {'rf': 'RF-02', 'cu': 'CU-SEG-02', 'sql': 'Redis Blacklist', 'api': 'POST /auth/logout', 'ui': 'SessionTimerGate'},
      {'rf': 'RF-03', 'cu': 'CU-SEG-03', 'sql': 'usuarios', 'api': 'POST /auth/reset-password', 'ui': 'ResetPasswordScreen'},
      {'rf': 'RF-04', 'cu': 'CU-SEG-04', 'sql': 'roles, usuario_roles', 'api': 'PUT /users/:id/roles', 'ui': 'RbacMatrixScreen / RbacRoleChips'},
      {'rf': 'RF-05', 'cu': 'CU-USR-01', 'sql': 'usuarios', 'api': 'POST /users', 'ui': 'UserAdminScreen (alta)'},
      {'rf': 'RF-06', 'cu': 'CU-USR-02', 'sql': 'usuarios (lote)', 'api': 'POST /users/import', 'ui': 'UserAdminScreen (import)'},
      {'rf': 'RF-07', 'cu': 'CU-USR-03', 'sql': 'instituciones', 'api': 'POST /sedes', 'ui': 'SedesScreen'},
      {'rf': 'RF-08', 'cu': 'CU-USR-04', 'sql': 'usuarios (trgm)', 'api': 'GET /users', 'ui': 'DirectoryScreen'},
      {'rf': 'RF-09', 'cu': 'CU-USR-05', 'sql': 'usuarios', 'api': 'PATCH /users/me', 'ui': 'ProfileScreen'},
      {'rf': 'RF-10', 'cu': 'CU-INS-01', 'sql': 'anios_lectivos', 'api': 'POST /academic-years', 'ui': 'AcademicConfigScreen'},
      {'rf': 'RF-11', 'cu': 'CU-INS-02', 'sql': 'periodos_academicos', 'api': 'POST /periods', 'ui': 'AcademicConfigScreen'},
      {'rf': 'RF-12', 'cu': 'CU-INS-03', 'sql': 'grados_secciones', 'api': 'POST /grade-sections', 'ui': 'AcademicConfigScreen'},
      {'rf': 'RF-13', 'cu': 'CU-INS-04', 'sql': 'escalas_calificacion', 'api': 'PUT /grading-scales', 'ui': 'AcademicConfigScreen'},
      {'rf': 'RF-14', 'cu': 'CU-INS-05', 'sql': 'parametros_globales', 'api': 'PUT /institutional-params', 'ui': 'LetterheadPreview'},
      {'rf': 'RF-65', 'cu': 'CU-AUD-01', 'sql': 'audit_logs', 'api': 'POST /audit/logs', 'ui': 'AuditService (interceptor)'},
      {'rf': 'RF-66', 'cu': 'CU-AUD-02', 'sql': 'historial_cambios_notas', 'api': 'AuditService.recordChange', 'ui': 'ChangeTimeline'},
      {'rf': 'RF-67', 'cu': 'CU-AUD-03', 'sql': 'audit_logs', 'api': 'GET /audit/logs', 'ui': 'AuditViewerScreen'},
      {'rf': 'RF-68', 'cu': 'CU-AUD-04', 'sql': 'audit_logs, usuarios', 'api': 'DataProtectionService.unmask', 'ui': 'MaskedText / PrivacyPolicyDialog'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Table(
          border: TableBorder.all(color: Colors.grey[300]!),
          children: [
            TableRow(
              decoration: BoxDecoration(color: Colors.grey[200]),
              children: const [
                Padding(padding: EdgeInsets.all(8), child: Text('RF', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                Padding(padding: EdgeInsets.all(8), child: Text('CU', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                Padding(padding: EdgeInsets.all(8), child: Text('Tabla SQL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                Padding(padding: EdgeInsets.all(8), child: Text('Endpoint', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                Padding(padding: EdgeInsets.all(8), child: Text('UI Flutter', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
              ],
            ),
            ...rows.map((r) => TableRow(
              children: [
                Padding(padding: const EdgeInsets.all(6), child: Text(r['rf']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.primary))),
                Padding(padding: const EdgeInsets.all(6), child: Text(r['cu']!, style: const TextStyle(fontSize: 11))),
                Padding(padding: const EdgeInsets.all(6), child: Text(r['sql']!, style: const TextStyle(fontSize: 10, fontFamily: 'monospace'))),
                Padding(padding: const EdgeInsets.all(6), child: Text(r['api']!, style: const TextStyle(fontSize: 10, fontFamily: 'monospace'))),
                Padding(padding: const EdgeInsets.all(6), child: Text(r['ui']!, style: const TextStyle(fontSize: 11))),
              ],
            )),
          ],
        ),
      ],
    );
  }
}
