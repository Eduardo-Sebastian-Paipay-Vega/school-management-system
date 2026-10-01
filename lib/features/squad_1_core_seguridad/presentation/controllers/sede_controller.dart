import 'package:flutter/foundation.dart';

import '../../domain/models/role.dart';
import '../../domain/models/sede.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/repositories/sede_repository.dart';
import '../../domain/services/access_control_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Administración de sedes multi-tenant (RF-07). Crear una sede exige el
/// permiso [Permission.sedesManage] (RF-04).
class SedeController extends ChangeNotifier {
  SedeController({
    required SedeRepository sedeRepository,
    required AccessControlService accessControl,
  })  : _sedeRepository = sedeRepository,
        _accessControl = accessControl;

  final SedeRepository _sedeRepository;
  final AccessControlService _accessControl;

  bool isLoading = false;
  String? errorMessage;
  List<Sede> sedes = const [];

  Future<void> loadAll() async {
    isLoading = true;
    notifyListeners();
    sedes = await _sedeRepository.listAll();
    isLoading = false;
    notifyListeners();
  }

  Future<bool> createSede({
    required AuthSession actingSession,
    required String nombre,
    required String codigoModular,
    required String nivelEducativo,
    required String direccion,
    required String telefono,
    required String directorNombre,
  }) async {
    errorMessage = null;
    isLoading = true;
    notifyListeners();
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.sedesManage,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      await _sedeRepository.create(
        nombre: nombre,
        codigoModular: codigoModular,
        nivelEducativo: nivelEducativo,
        direccion: direccion,
        telefono: telefono,
        directorNombre: directorNombre,
        actor: ActorContext(
          session: actingSession,
          ipAddress: ClientContext.instance.ipAddress,
          userAgent: ClientContext.userAgent,
        ),
      );
      await loadAll();
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
