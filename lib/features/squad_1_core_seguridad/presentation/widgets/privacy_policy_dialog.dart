import 'package:flutter/material.dart';

/// Aviso de protección de datos personales (RF-68, Ley N.° 29733).
Future<void> showPrivacyPolicyDialog(BuildContext context) {
  return showDialog<void>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Protección de Datos Personales'),
      content: const SingleChildScrollView(
        child: Text(
          'De acuerdo con la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú), '
          'los datos sensibles de estudiantes y personal (teléfonos de apoderados, direcciones, '
          'información de menores de edad) se almacenan cifrados y se muestran enmascarados '
          '(ej. 987***321) en las pantallas de este sistema.\n\n'
          'El desenmascarado de un dato solo está disponible para roles autorizados, exige '
          'registrar un motivo y queda registrado de forma inmutable en la bitácora de '
          'auditoría institucional (RF-65, RF-67).\n\n'
          'La extracción masiva de datos personales requiere autorización directiva explícita.',
        ),
      ),
      actions: [
        FilledButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Entendido'),
        ),
      ],
    ),
  );
}
