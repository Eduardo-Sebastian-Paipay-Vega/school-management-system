import { PoolClient } from 'pg';
import { AttendanceRecord, CorrectionInput } from './attendance.schemas';

/**
 * Corrección auditada (docs/core/CONTRATO_RF66_ASISTENCIA.md §3). Forma obligatoria
 * `SELECT * FROM fn(...)`: `(fn(...)).*` ejecutaría la función una vez por columna.
 */
export async function correctAttendance(client: PoolClient, id: string, input: CorrectionInput,
  ip: string | null, requestId: string | null): Promise<AttendanceRecord> {
  const result = await client.query<AttendanceRecord>(
    `SELECT c.id, c.matricula_id AS "matriculaId", to_char(c.fecha, 'YYYY-MM-DD') AS fecha,
            c.estado::text AS estado, c.justificada
     FROM fn_corregir_asistencia($1, $2::estado_asistencia_enum, $3, $4, $5::inet, $6::uuid) AS c`,
    [id, input.estado, input.justificada, input.motivo, ip, requestId]);
  return result.rows[0];
}
