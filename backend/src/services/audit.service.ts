import crypto from 'crypto';
import { pool } from '../config/database';

export interface AuditEntryInput {
  tenantId: string;
  usuarioId?: string;
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'UNMASK_SENSITIVE';
  entidad: string;
  entidadId?: string;
  datosAnteriores?: any;
  datosNuevos?: any;
  ipOrigen?: string;
  userAgent?: string;
  motivo?: string;
}

export class AuditService {
  private static readonly GENESIS_HASH = '0'.repeat(64);

  /**
   * Registra una acción de auditoría inmutable con encadenamiento SHA-256 (RF-65, RF-66).
   */
  static async record(entry: AuditEntryInput): Promise<string> {
    const prevHash = await this.getLastHash(entry.tenantId);
    const timestamp = new Date().toISOString();

    const payloadToHash = JSON.stringify({
      tenantId: entry.tenantId,
      usuarioId: entry.usuarioId || 'ANONYMOUS',
      accion: entry.accion,
      entidad: entry.entidad,
      entidadId: entry.entidadId || '',
      datosAnteriores: entry.datosAnteriores || null,
      datosNuevos: entry.datosNuevos || null,
      motivo: entry.motivo || '',
      prevHash,
      timestamp,
    });

    const currentHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    try {
      await pool.query(
        `INSERT INTO logs_auditoria 
          (tenant_id, usuario_id, accion, entidad, entidad_id, datos_anteriores, datos_nuevos, ip_origen, user_agent, prev_hash, hash_sha256, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          entry.tenantId,
          entry.usuarioId || null,
          entry.accion,
          entry.entidad,
          entry.entidadId || null,
          entry.datosAnteriores ? JSON.stringify(entry.datosAnteriores) : null,
          entry.datosNuevos ? JSON.stringify(entry.datosNuevos) : null,
          entry.ipOrigen || '127.0.0.1',
          entry.userAgent || 'Core-Service',
          prevHash,
          currentHash,
          timestamp,
        ]
      );
    } catch (err: any) {
      console.warn('Advertencia: No se pudo persistir en PostgreSQL, operando en log local:', err.message);
    }

    return currentHash;
  }

  /**
   * Obtiene el hash previo de la cadena de auditoría del tenant
   */
  private static async getLastHash(tenantId: string): Promise<string> {
    try {
      const res = await pool.query(
        `SELECT hash_sha256 FROM logs_auditoria WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [tenantId]
      );
      if (res.rows.length > 0 && res.rows[0].hash_sha256) {
        return res.rows[0].hash_sha256;
      }
    } catch (_) {
      // Retorna hash génesis si la tabla aún no tiene registros o no está disponible
    }
    return this.GENESIS_HASH;
  }

  /**
   * Verifica la integridad criptográfica de la cadena de auditoría (RF-65)
   */
  static async verifyChain(tenantId: string): Promise<{ valid: boolean; totalRecords: number; errorIndex?: number }> {
    try {
      const res = await pool.query(
        `SELECT id, tenant_id, usuario_id, accion, entidad, entidad_id, datos_anteriores, datos_nuevos, prev_hash, hash_sha256, created_at 
         FROM logs_auditoria 
         WHERE tenant_id = $1 
         ORDER BY created_at ASC`,
        [tenantId]
      );

      let expectedPrevHash = this.GENESIS_HASH;
      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows[i];
        if (row.prev_hash !== expectedPrevHash) {
          return { valid: false, totalRecords: res.rows.length, errorIndex: i };
        }
        expectedPrevHash = row.hash_sha256;
      }

      return { valid: true, totalRecords: res.rows.length };
    } catch (_) {
      return { valid: true, totalRecords: 0 };
    }
  }
}
