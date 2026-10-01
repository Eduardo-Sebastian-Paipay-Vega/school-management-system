import '../../domain/models/sede.dart';
import '../../domain/repositories/sede_repository.dart';
import '../../domain/services/audit_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/clock.dart';
import '../../shared/failures.dart';
import '../../shared/id_generator.dart';
import '../datasources/in_memory_store.dart';

/// Implementación en memoria de gestión de sedes multi-tenant (RF-07).
class SedeRepositoryImpl implements SedeRepository {
  SedeRepositoryImpl(
    this._store, {
    required AuditService auditService,
    Clock clock = const SystemClock(),
    IdGenerator? idGenerator,
  })  : _auditService = auditService,
        _clock = clock,
        _ids = idGenerator ?? IdGenerator();

  final InMemoryStore _store;
  final AuditService _auditService;
  final Clock _clock;
  final IdGenerator _ids;

  @override
  Future<List<Sede>> listAll() async => _store.sedesById.values.toList()
    ..sort((a, b) => a.nombre.compareTo(b.nombre));

  @override
  Future<Sede?> findById(String sedeId) async => _store.sedesById[sedeId];

  @override
  Future<Sede> create({
    required String nombre,
    required String codigoModular,
    required String nivelEducativo,
    required String direccion,
    required String telefono,
    required String directorNombre,
    required ActorContext actor,
  }) async {
    final exists = _store.sedesById.values.any((s) => s.codigoModular == codigoModular);
    if (exists) {
      throw ConflictFailure('Ya existe una sede con el código modular $codigoModular.');
    }
    final sede = Sede(
      id: _ids.next(),
      codigoModular: codigoModular,
      nombre: nombre,
      nivelEducativo: nivelEducativo,
      direccion: direccion,
      telefono: telefono,
      directorNombre: directorNombre,
      activo: true,
      createdAt: _clock.now(),
    );
    _store.sedesById[sede.id] = sede;
    await _auditService.recordSession(
      actor.session,
      accion: AuditActions.sedeCreated,
      entidad: 'instituciones',
      entidadId: sede.id,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      payloadNuevo: {'nombre': nombre, 'codigoModular': codigoModular},
    );
    return sede;
  }

  @override
  Future<Sede> update(Sede sede) async {
    if (!_store.sedesById.containsKey(sede.id)) {
      throw NotFoundFailure('Sede no encontrada: ${sede.id}');
    }
    _store.sedesById[sede.id] = sede;
    return sede;
  }
}
