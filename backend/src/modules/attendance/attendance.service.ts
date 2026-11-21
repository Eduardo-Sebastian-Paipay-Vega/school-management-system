import { withTenant } from '../../config/database';
import { asPgError, DomainError, RequestContext } from '../shared/http';
import { correctAttendance } from './attendance.repository';
import { AttendanceRecord, CorrectionInput } from './attendance.schemas';

// Tabla de errores de CONTRATO_RF66_ASISTENCIA.md §3. ATTENDANCE_CONTEXT_REQUIRED y
// ATTENDANCE_IP_REQUIRED son errores de integración: no se mapean y terminan en 500.
const CORRECTION_ERRORS: Record<string, { sqlstate: string; status: number; message: string }> = {
  ATTENDANCE_VALUE_REQUIRED: { sqlstate: '22004', status: 400, message: 'Indique el estado y la justificación.' },
  ATTENDANCE_REASON_REQUIRED: { sqlstate: '22023', status: 400,
    message: 'El motivo debe tener entre 10 y 500 caracteres.' },
  ATTENDANCE_NOT_FOUND: { sqlstate: 'P0002', status: 404, message: 'Asistencia no encontrada.' },
  ATTENDANCE_NO_CHANGE: { sqlstate: '22023', status: 409,
    message: 'La asistencia ya tiene el estado y la justificación indicados.' },
};

/** RF-22 sobre RF-66: corrección o justificación con motivo, auditada en la misma transacción. */
export async function correct(ctx: RequestContext, id: string, input: CorrectionInput): Promise<AttendanceRecord> {
  try {
    return await withTenant(ctx.tenantId, ctx.userId, (client) =>
      correctAttendance(client, id, input, ctx.ip, ctx.requestId));
  } catch (error) {
    const pg = asPgError(error);
    const known = pg.message ? CORRECTION_ERRORS[pg.message] : undefined;
    if (known && known.sqlstate === pg.code) throw new DomainError(known.status, pg.message!, known.message);
    throw error;
  }
}
