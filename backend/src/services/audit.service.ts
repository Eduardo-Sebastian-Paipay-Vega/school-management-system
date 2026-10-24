import { PoolClient } from 'pg';
import { withTenant } from '../config/database';

export interface AuditEntryInput {
  tenantId: string;
  usuarioId?: string;
  accion: string;
  modulo?: string;
  entidad?: string;
  entidadId?: string;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  ipOrigen?: string;
  userAgent?: string;
  motivo?: string;
}

function safeIp(value?: string): string {
  const candidate = value?.split(',')[0].trim();
  return candidate && /^[0-9a-fA-F:.]+$/.test(candidate) ? candidate : '127.0.0.1';
}

export class AuditService {
  static async record(entry: AuditEntryInput, client?: PoolClient): Promise<string> {
    const write = async (db: PoolClient) => {
      const result = await db.query<{ id: string }>(
        `SELECT fn_registrar_auditoria($1,$2,$3::inet,$4,$5,$6::jsonb,$7::jsonb,$8) AS id`,
        [entry.modulo ?? 'core', entry.accion, safeIp(entry.ipOrigen), entry.entidad ?? null,
          entry.entidadId ?? null,
          entry.datosAnteriores == null ? null : JSON.stringify(entry.datosAnteriores),
          entry.datosNuevos == null ? null : JSON.stringify(entry.datosNuevos),
          entry.userAgent ?? null]
      );
      return result.rows[0].id;
    };
    return client ? write(client) : withTenant(entry.tenantId, entry.usuarioId ?? '', write);
  }

  static async verifyChain(tenantId: string, usuarioId: string) {
    return withTenant(tenantId, usuarioId, async (client) => {
      const result = await client.query<{
        total_registros: string; cadena_integra: boolean; primer_id_invalido: string | null
      }>('SELECT * FROM fn_verificar_cadena_auditoria()');
      const row = result.rows[0];
      return {
        valid: row.cadena_integra,
        totalRecords: Number(row.total_registros),
        errorIndex: row.primer_id_invalido ? Number(row.primer_id_invalido) : undefined,
      };
    });
  }
}
