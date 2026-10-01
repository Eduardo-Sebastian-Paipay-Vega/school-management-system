import '../../shared/actor_context.dart';
import '../models/sede.dart';

/// Contrato de administración de sedes multi-tenant (RF-07).
abstract class SedeRepository {
  Future<List<Sede>> listAll();

  Future<Sede?> findById(String sedeId);

  /// Lanza [ConflictFailure] si el código modular ya existe.
  Future<Sede> create({
    required String nombre,
    required String codigoModular,
    required String nivelEducativo,
    required String direccion,
    required String telefono,
    required String directorNombre,
    required ActorContext actor,
  });

  Future<Sede> update(Sede sede);
}
