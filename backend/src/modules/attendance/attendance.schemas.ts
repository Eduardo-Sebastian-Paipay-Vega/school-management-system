import { z } from 'zod';

/** paths/attendance.yaml · AttendanceCorrectionRequest. */
export const estadoAsistencia = z.enum(['PRESENTE', 'TARDANZA_JUSTIFICADA', 'TARDANZA_INJUSTIFICADA',
  'FALTA_JUSTIFICADA', 'FALTA_INJUSTIFICADA']);

// La longitud del motivo (10 a 500 tras recortar) la valida fn_corregir_asistencia(); aquí
// solo se acota el tamaño del cuerpo para no enviar textos arbitrarios a la base de datos.
export const correctionBody = z.object({
  estado: estadoAsistencia,
  justificada: z.boolean(),
  motivo: z.string().max(2000),
}).strict();

export type CorrectionInput = z.infer<typeof correctionBody>;

/** components/squad2.yaml · AttendanceRecord. */
export interface AttendanceRecord {
  id: string;
  matriculaId: string;
  fecha: string;
  estado: z.infer<typeof estadoAsistencia>;
  justificada: boolean;
}
