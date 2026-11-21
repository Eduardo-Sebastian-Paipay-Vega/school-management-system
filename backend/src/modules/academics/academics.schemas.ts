import { z } from 'zod';

/** paths/enrollments.yaml · EnrollmentCreateRequest (RF-16). */
export const enrollmentBody = z.object({
  estudianteId: z.string().uuid(),
  seccionId: z.string().uuid(),
  estado: z.enum(['REGULAR', 'EXTEMPORANEA']).default('REGULAR'),
}).strict();
export type EnrollmentInput = z.infer<typeof enrollmentBody>;

/** components/squad2.yaml · Enrollment. */
export interface Enrollment {
  id: string;
  estudianteId: string;
  seccionId: string;
  anioLectivoId: string;
  estado: 'REGULAR' | 'EXTEMPORANEA';
  fechaMatricula: string;
  vacantesDisponibles: number;
}

/** components/squad2.yaml · SectionAlternative. */
export interface SectionAlternative { id: string; seccion: string; vacantesDisponibles: number }

const parentesco = z.enum(['PADRE', 'MADRE', 'TUTOR_LEGAL']);

/** GuardianRecordPublishRequest (RF-15 -> RF-75). El DNI solo se usa para calcular el HMAC. */
export const guardianRecordBody = z.object({
  fuenteFichaId: z.string().uuid(),
  estudianteId: z.string().uuid(),
  apoderadoDni: z.string().regex(/^\d{8}$/),
  parentesco,
}).strict();
export type GuardianRecordInput = z.infer<typeof guardianRecordBody>;

// La longitud del motivo (10 a 500 tras recortar) la valida fn_revocar_ficha_apoderado().
export const revokeBody = z.object({ motivo: z.string().max(2000) }).strict();

/** components/squad2.yaml · GuardianRecord. Nunca incluye el DNI ni su hash. */
export interface GuardianRecord {
  id: string;
  fuenteFichaId: string;
  estudianteId: string;
  parentesco: z.infer<typeof parentesco>;
  verificadoEn: Date;
  revocadoEn: Date | null;
}
