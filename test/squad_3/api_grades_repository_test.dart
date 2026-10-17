import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/data/repositories/api_grades_repository.dart';
import 'package:flutter_application_1/features/squad_3_calificaciones/data/repositories/grades_repository.dart';

void main() {
  test(
    'REST repository sends authenticated canonical batch and accepts committed revision',
    () async {
      final repository = ApiGradesRepository(
        baseUrl: 'https://school.example',
        bookId: 'book-id',
        token: () => 'current-token',
        client: MockClient((request) async {
          expect(request.method, 'PATCH');
          expect(request.url.path, '/api/v1/grades/batch');
          expect(request.headers['Authorization'], 'Bearer current-token');
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['bookId'], 'book-id');
          expect(body['revision'], 7);
          expect(body['items'], hasLength(1));
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {'id': 'book-id', 'revision': 8},
            }),
            200,
          );
        }),
      );
      expect(
        (await repository.batch(7, [
          {'studentId': 'm1', 'evaluationId': 'e1', 'input': '18'},
        ])).revision,
        8,
      );
      repository.dispose();
    },
  );
  test('409 is a conflict, 422 is not retried, and 503 is retryable', () async {
    for (final status in [409, 422, 503]) {
      final repository = ApiGradesRepository(
        baseUrl: 'https://school.example',
        bookId: 'book-id',
        token: () => 'token',
        client: MockClient(
          (request) async => http.Response(
            jsonEncode({
              'success': false,
              'error': {'message': 'Mensaje del servidor'},
            }),
            status,
          ),
        ),
      );
      try {
        await repository.load();
        fail('Debe fallar');
      } on GradesException catch (e) {
        expect(e.conflict, status == 409);
        expect(e.retryable, status == 503);
        expect(e.message, 'Mensaje del servidor');
      }
      repository.dispose();
    }
  });
}
