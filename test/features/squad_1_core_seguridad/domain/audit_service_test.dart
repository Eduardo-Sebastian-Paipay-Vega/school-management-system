import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/datasources/in_memory_store.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/data/repositories/audit_repository_impl.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/models/audit_log_entry.dart';
import 'package:flutter_application_1/features/squad_1_core_seguridad/domain/services/audit_service.dart';

void main() {
  group('AuditService (RF-65) — cadena de hashes inmutable', () {
    test('la primera entrada encadena desde el hash génesis', () async {
      final store = InMemoryStore();
      final service = AuditService(repository: AuditRepositoryImpl(store));

      final entry = await service.record(
        tenantId: 't1',
        accion: AuditActions.loginSuccess,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );

      expect(entry.previousHash, AuditService.genesisHash);
      expect(entry.hash, isNotEmpty);
      expect(service.verifyChain('t1'), isTrue);
    });

    test('cada entrada siguiente referencia el hash de la anterior', () async {
      final store = InMemoryStore();
      final service = AuditService(repository: AuditRepositoryImpl(store));

      final first = await service.record(
        tenantId: 't1',
        accion: AuditActions.loginSuccess,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );
      final second = await service.record(
        tenantId: 't1',
        accion: AuditActions.logout,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );

      expect(second.previousHash, first.hash);
      expect(service.verifyChain('t1'), isTrue);
    });

    test('detecta manipulación directa de un registro en la cadena', () async {
      final store = InMemoryStore();
      final service = AuditService(repository: AuditRepositoryImpl(store));

      await service.record(
        tenantId: 't1',
        accion: AuditActions.loginSuccess,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );
      await service.record(
        tenantId: 't1',
        accion: AuditActions.logout,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );

      expect(service.verifyChain('t1'), isTrue);

      // Simula un ataque que reemplaza directamente un registro en el
      // almacén, sorteando la API de auditoría (que no expone update/delete).
      final tampered = store.auditLogs[0];
      store.auditLogs[0] = AuditLogEntry(
        id: tampered.id,
        tenantId: tampered.tenantId,
        userId: tampered.userId,
        usuarioDisplay: tampered.usuarioDisplay,
        accion: 'AUTH_LOGIN_SUCCESS_FALSIFICADO',
        entidad: tampered.entidad,
        ipAddress: tampered.ipAddress,
        userAgent: tampered.userAgent,
        createdAt: tampered.createdAt,
        previousHash: tampered.previousHash,
        hash: tampered.hash,
      );

      expect(service.verifyChain('t1'), isFalse);
    });

    test('tenants distintos mantienen cadenas independientes', () async {
      final store = InMemoryStore();
      final service = AuditService(repository: AuditRepositoryImpl(store));

      final t1Entry = await service.record(
        tenantId: 't1',
        accion: AuditActions.loginSuccess,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );
      final t2Entry = await service.record(
        tenantId: 't2',
        accion: AuditActions.loginSuccess,
        entidad: 'usuarios',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      );

      expect(t1Entry.previousHash, AuditService.genesisHash);
      expect(t2Entry.previousHash, AuditService.genesisHash);
      expect(service.verifyChain('t1'), isTrue);
      expect(service.verifyChain('t2'), isTrue);
    });
  });
}
