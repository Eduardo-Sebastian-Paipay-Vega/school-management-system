import 'dart:async';
import 'package:flutter/foundation.dart';

import '../../domain/models/role.dart';
import '../../domain/models/session_tokens.dart';
import '../../domain/models/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/services/access_control_service.dart';
import '../../domain/services/data_protection_service.dart';
import '../../shared/actor_context.dart';
import '../../shared/client_context.dart';
import '../../shared/failures.dart';

/// Directorio escolar con búsqueda en tiempo real (RF-08), reasignación de
/// roles (RF-04) y desenmascarado auditado de campos sensibles (RF-68).
class DirectoryController extends ChangeNotifier {
  DirectoryController({
    required UserRepository userRepository,
    required AccessControlService accessControl,
    required DataProtectionService dataProtection,
  })  : _userRepository = userRepository,
        _accessControl = accessControl,
        _dataProtection = dataProtection;

  final UserRepository _userRepository;
  final AccessControlService _accessControl;
  final DataProtectionService _dataProtection;

  static const int pageSize = 20;

  bool isLoading = false;
  String? errorMessage;
  List<User> results = const [];
  int totalItems = 0;
  int page = 1;
  String query = '';
  AppRole? roleFilter;
  UserStatus? statusFilter;

  Timer? _debounce;

  bool canManageRbac(AuthSession session) => _accessControl.can(session, Permission.rbacManage);

  /// RF-08: búsqueda con debounce de 300ms (motor de trigramas simulado).
  void onQueryChanged(String value, {required AuthSession session}) {
    query = value;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () => search(session: session));
  }

  Future<void> search({required AuthSession session, int? goToPage}) async {
    page = goToPage ?? 1;
    isLoading = true;
    notifyListeners();
    final response = await _userRepository.searchDirectory(
      tenantId: session.tenantId,
      query: query,
      role: roleFilter,
      estado: statusFilter,
      page: page,
      pageSize: pageSize,
    );
    results = response.items;
    totalItems = response.totalItems;
    isLoading = false;
    notifyListeners();
  }

  void setRoleFilter(AppRole? role, {required AuthSession session}) {
    roleFilter = role;
    search(session: session);
  }

  void setStatusFilter(UserStatus? status, {required AuthSession session}) {
    statusFilter = status;
    search(session: session);
  }

  /// RF-04 (endpoint `PUT /users/:id/roles` del SDD): requiere el permiso
  /// [Permission.rbacManage]; lanza 403 y audita si el rol no lo concede.
  Future<bool> updateRoles({
    required AuthSession actingSession,
    required String userId,
    required Set<AppRole> roles,
  }) async {
    errorMessage = null;
    try {
      await _accessControl.authorize(
        actingSession,
        Permission.rbacManage,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
      await _userRepository.updateRoles(
        userId: userId,
        roles: roles,
        actor: _actorFrom(actingSession),
      );
      await search(session: actingSession, goToPage: page);
      return true;
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  /// RF-68: desenmascara un campo cifrado (ej. teléfono) bajo motivo
  /// justificado; retorna `null` si fue denegado.
  Future<String?> unmaskField({
    required AuthSession actingSession,
    required String storedCipherText,
    required String fieldName,
    required String reason,
  }) async {
    try {
      return await _dataProtection.unmask(
        requester: actingSession,
        storedCipherText: storedCipherText,
        fieldName: fieldName,
        reason: reason,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );
    } on Squad1Failure catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  ActorContext _actorFrom(AuthSession session) => ActorContext(
        session: session,
        ipAddress: ClientContext.instance.ipAddress,
        userAgent: ClientContext.userAgent,
      );

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}
