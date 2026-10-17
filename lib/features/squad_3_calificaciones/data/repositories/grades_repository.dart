import '../../domain/models/gradebook.dart';

abstract interface class GradesRepository {
  bool get isDemo;
  Stream<void> get updates;
  Future<Gradebook> load();
  Future<Json> annual();
  Future<Gradebook> batch(int revision, List<Json> items);
  Future<Gradebook> action(int revision, String action, Json payload);
  void dispose();
}

class GradesException implements Exception {
  const GradesException(
    this.message, {
    this.conflict = false,
    this.retryable = false,
  });
  final String message;
  final bool conflict;
  final bool retryable;
  @override
  String toString() => message;
}
