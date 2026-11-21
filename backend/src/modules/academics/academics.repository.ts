import { PoolClient } from 'pg';
import { Enrollment, EnrollmentInput, GuardianRecord, SectionAlternative } from './academics.schemas';

export interface SectionRef { id: string; anioLectivoId: string; nivel: string; grado: number }

/** RLS y el filtro explícito por tenant ocultan las secciones de otro plantel. */
export async function findSection(client: PoolClient, tenantId: string, id: string): Promise<SectionRef | null> {
  const result = await client.query<SectionRef>(
    `SELECT id, anio_lectivo_id AS "anioLectivoId", nivel, grado
     FROM grados_secciones WHERE tenant_id = $1 AND id = $2`, [tenantId, id]);
  return result.rows[0] ?? null;
}

/**
 * Inserta la matrícula. La base de datos aplica uq_estudiante_anio (una por año),
 * fk_matriculas_estudiante (persona del mismo tenant) y trg_matriculas_aforo (SECTION_FULL).
 */
export async function insertEnrollment(client: PoolClient, tenantId: string, section: SectionRef,
  input: EnrollmentInput): Promise<Omit<Enrollment, 'vacantesDisponibles'>> {
  const result = await client.query<Omit<Enrollment, 'vacantesDisponibles'>>(
    `INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id, estado)
     VALUES ($1, $2, $3, $4, $5::estado_matricula_enum)
     RETURNING id, estudiante_id AS "estudianteId", seccion_id AS "seccionId",
               anio_lectivo_id AS "anioLectivoId", estado::text AS estado,
               to_char(fecha_matricula, 'YYYY-MM-DD') AS "fechaMatricula"`,
    [tenantId, section.anioLectivoId, input.estudianteId, section.id, input.estado]);
  return result.rows[0];
}

const ACTIVAS = `(SELECT count(*) FROM matriculas m WHERE m.tenant_id = s.tenant_id
                  AND m.seccion_id = s.id AND m.estado IN ('REGULAR', 'EXTEMPORANEA'))`;

export async function vacancies(client: PoolClient, tenantId: string, sectionId: string): Promise<number> {
  const result = await client.query<{ vacantes: number }>(
    `SELECT greatest(s.aforo_maximo - ${ACTIVAS}, 0)::int AS vacantes
     FROM grados_secciones s WHERE s.tenant_id = $1 AND s.id = $2`, [tenantId, sectionId]);
  return result.rows[0]?.vacantes ?? 0;
}

/** RF-16, excepción 3a: otras secciones del mismo año, nivel y grado con vacantes. */
export async function alternativeSections(client: PoolClient, tenantId: string,
  section: SectionRef): Promise<SectionAlternative[]> {
  const result = await client.query<SectionAlternative>(
    `SELECT s.id, s.seccion, (s.aforo_maximo - ${ACTIVAS})::int AS "vacantesDisponibles"
     FROM grados_secciones s
     WHERE s.tenant_id = $1 AND s.anio_lectivo_id = $2 AND s.nivel = $3 AND s.grado = $4
       AND s.id <> $5 AND s.aforo_maximo > ${ACTIVAS}
     ORDER BY s.seccion`,
    [tenantId, section.anioLectivoId, section.nivel, section.grado, section.id]);
  return result.rows;
}

const GUARDIAN_RECORD = `f.id, f.fuente_ficha_id AS "fuenteFichaId", f.estudiante_id AS "estudianteId",
  f.parentesco, f.verificado_en AS "verificadoEn", f.revocado_en AS "revocadoEn"`;

/** fn_publicar_ficha_apoderado(): SECURITY DEFINER, comprueba el tenant y audita. */
export async function publishGuardianRecord(client: PoolClient, args: {
  fuenteFichaId: string; estudianteId: string; documentoHash: string; parentesco: string;
  ip: string | null; requestId: string | null;
}): Promise<GuardianRecord> {
  const result = await client.query<GuardianRecord>(
    `SELECT ${GUARDIAN_RECORD}
     FROM fn_publicar_ficha_apoderado($1, $2, $3, $4, $5::inet, $6::uuid) AS f`,
    [args.fuenteFichaId, args.estudianteId, args.documentoHash, args.parentesco, args.ip, args.requestId]);
  return result.rows[0];
}

/** fn_revocar_ficha_apoderado(): marca revocado_en sin reutilizar la fila, y audita. */
export async function revokeGuardianRecord(client: PoolClient, id: string, motivo: string,
  ip: string | null, requestId: string | null): Promise<GuardianRecord> {
  const result = await client.query<GuardianRecord>(
    `SELECT ${GUARDIAN_RECORD} FROM fn_revocar_ficha_apoderado($1, $2, $3::inet, $4::uuid) AS f`,
    [id, motivo, ip, requestId]);
  return result.rows[0];
}
