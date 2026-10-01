import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/grading_scale.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/grading_scale_service.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/shared/failures.dart';

void main() {
  final scale = GradingScale.cnebDefault(
    id: 'scale-1',
    tenantId: 'tenant-1',
    nivelEducativo: 'Secundaria',
    notaMinimaAprobatoria: 11,
  );
  const service = GradingScaleService();

  group('GradingScaleService (RF-13, consumido por RF-46 de Squad 3)', () {
    test('15.6 se mapea a A (Logro Esperado), criterio de aceptación oficial', () {
      expect(service.literalFor(scale, 15.6), 'A');
    });

    test('18 a 20 es AD, 11 a 13 es B, 0 a 10 es C', () {
      expect(service.literalFor(scale, 20), 'AD');
      expect(service.literalFor(scale, 18), 'AD');
      expect(service.literalFor(scale, 12), 'B');
      expect(service.literalFor(scale, 0), 'C');
      expect(service.literalFor(scale, 10.5), 'C');
    });

    test('rechaza notas fuera de 0-20', () {
      expect(() => service.literalFor(scale, 21), throwsA(isA<ValidationFailure>()));
      expect(() => service.literalFor(scale, -1), throwsA(isA<ValidationFailure>()));
    });

    test('isApproved respeta la nota mínima aprobatoria configurada', () {
      expect(service.isApproved(scale, 11), isTrue);
      expect(service.isApproved(scale, 10.9), isFalse);
    });
  });
}
