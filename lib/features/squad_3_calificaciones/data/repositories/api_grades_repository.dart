import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../domain/models/gradebook.dart';
import 'grades_repository.dart';

class ApiGradesRepository implements GradesRepository {
  ApiGradesRepository({
    required this.baseUrl,
    required this.bookId,
    required this.token,
    http.Client? client,
  }) : _client = client ?? http.Client();
  final String baseUrl;
  final String bookId;
  final String Function() token;
  final http.Client _client;
  final _updates = StreamController<void>.broadcast();
  WebSocketChannel? _channel;
  Timer? _reconnect;
  bool _disposed = false;
  bool _liveStarted = false;
  @override
  Stream<void> get updates {
    if (!_liveStarted) {
      _liveStarted = true;
      _connect();
    }
    return _updates.stream;
  }

  Future<void> _connect() async {
    if (_disposed) return;
    try {
      final uri = Uri.parse('$baseUrl/api/v1/grades/live');
      final channel = WebSocketChannel.connect(
        uri.replace(scheme: uri.scheme == 'https' ? 'wss' : 'ws'),
      );
      _channel = channel;
      channel.stream.listen(
        (event) {
          final data = jsonDecode(event as String) as Json;
          if (data['event'] == 'GRADE_UPDATED') _updates.add(null);
        },
        onError: (Object error) {},
        onDone: () {
          if (!_disposed) {
            _reconnect = Timer(const Duration(seconds: 3), _connect);
          }
        },
      );
      await channel.ready;
      if (!_disposed) {
        channel.sink.add(jsonEncode({'token': token(), 'bookId': bookId}));
      }
    } catch (_) {
      if (!_disposed && !(_reconnect?.isActive ?? false)) {
        _reconnect = Timer(const Duration(seconds: 3), _connect);
      }
    }
  }

  @override
  bool get isDemo => false;
  Future<Gradebook> _request(String method, String path, [Json? body]) async {
    final request = http.Request(
      method,
      Uri.parse('$baseUrl/api/v1/grades/$path'),
    );
    request.headers.addAll({
      'Authorization': 'Bearer ${token()}',
      'Content-Type': 'application/json',
    });
    if (body != null) request.body = jsonEncode(body);
    final response = await http.Response.fromStream(
      await _client.send(request).timeout(const Duration(seconds: 15)),
    );
    final decoded = jsonDecode(response.body) as Json;
    if (response.statusCode != 200 || decoded['success'] != true) {
      throw GradesException(
        (decoded['error'] as Json?)?['message'] as String? ??
            'No se pudo completar la operación',
        conflict: response.statusCode == 409,
        retryable: response.statusCode >= 500 || response.statusCode == 429,
      );
    }
    return Gradebook(decoded['data'] as Json);
  }

  @override
  Future<Gradebook> load() =>
      _request('GET', 'matrix?bookId=${Uri.encodeQueryComponent(bookId)}');
  @override
  Future<Json> annual() async => (await _request(
    'GET',
    'annual?bookId=${Uri.encodeQueryComponent(bookId)}',
  )).json;
  @override
  Future<Gradebook> batch(int revision, List<Json> items) => _request(
    'PATCH',
    'batch',
    {'bookId': bookId, 'revision': revision, 'items': items},
  );
  @override
  Future<Gradebook> action(int revision, String action, Json payload) =>
      _request('POST', 'actions', {
        'bookId': bookId,
        'revision': revision,
        'action': action,
        ...payload,
      });
  @override
  void dispose() {
    _disposed = true;
    _reconnect?.cancel();
    _channel?.sink.close();
    _updates.close();
    _client.close();
  }
}
