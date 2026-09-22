import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// Pantalla Principal del Squad 5: Secretaría Digital, Criptografía y Portal Web
/// Responsable: Cesar Antonio Leon Reyna (@cesarleon27-ai)
class Squad5Screen extends StatefulWidget {
  const Squad5Screen({super.key});

  @override
  State<Squad5Screen> createState() => _Squad5ScreenState();
}

class _Squad5ScreenState extends State<Squad5Screen> {
  final TextEditingController _hashController = TextEditingController(
    text: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );
  bool _isVerified = true;

  @override
  void dispose() {
    _hashController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Squad 5: Secretaría y Portal Web'),
        backgroundColor: const Color(0xFF784212),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSquadHeader(),
          const SizedBox(height: 16),
          _buildQrVerificationCard(),
          const SizedBox(height: 16),
          _buildReportsCard(),
          const SizedBox(height: 16),
          _buildPublicPortalCard(),
        ],
      ),
    );
  }

  Widget _buildSquadHeader() {
    return Card(
      color: const Color(0xFF784212),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MÓDULOS M11, M13 (RF-59 al RF-64, RF-69 al RF-71)',
              style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Sellado Criptográfico SHA-256 + QR, Libretas PDF y Portal Web',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            Text(
              'Líder: Cesar Antonio Leon Reyna (@cesarleon27-ai)',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQrVerificationCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.verified, color: Colors.green),
                SizedBox(width: 8),
                Text(
                  'Verificador Público de Documentos Criptográficos (RF-60)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Text(
              'Cualquier ciudadano puede verificar la autenticidad de una boleta de notas escaneando el código QR impreso sin requerir usuario ni contraseña.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _hashController,
              decoration: const InputDecoration(
                labelText: 'Hash SHA-256 del Documento Oficial',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.tag),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _isVerified = true;
                });
              },
              icon: const Icon(Icons.search),
              label: const Text('Validar Integridad Criptográfica'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF784212)),
            ),
            if (_isVerified) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green),
                        SizedBox(width: 8),
                        Text('DOCUMENTO AUTÉNTICO Y VÁLIDO', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    SizedBox(height: 4),
                    Text('Boleta Oficial: 3° Grado "B" • Emitido: 21/09/2026', style: TextStyle(fontSize: 12)),
                    Text('Firmante: Dirección General — Planteles de Aplicación Guamán Poma de Ayala', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReportsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Emisión de Reportes Oficiales y SIAGIE (RF-59, RF-64)',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.picture_as_pdf, color: Colors.red, size: 18),
                  label: const Text('Boletas en PDF'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.table_chart, color: Colors.green, size: 18),
                  label: const Text('Plantillas SIAGIE MINEDU'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.emoji_events, color: Colors.amber, size: 18),
                  label: const Text('Cuadro de Mérito (RF-61)'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.assignment, color: Colors.blue, size: 18),
                  label: const Text('Actas y Registro Auxiliar (RF-62)'),
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPublicPortalCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Row(
              children: [
                Icon(Icons.public, color: Colors.indigo),
                SizedBox(width: 8),
                Text(
                  'Cartelera Digital y Portal Web Institucional (RF-69, RF-71)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Publicación de circulares institucionales, calendario cívico escolar interactivo (RF-70) y portal institucional con normas de convivencia de acceso abierto.',
              style: TextStyle(fontSize: 13, color: AppTheme.textDark),
            ),
          ],
        ),
      ),
    );
  }
}
