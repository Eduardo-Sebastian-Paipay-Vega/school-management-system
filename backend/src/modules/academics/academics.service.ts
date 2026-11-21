import { withTenant } from '../../config/database';
import { documentHash } from '../../core/identity-crypto';
import { AuditService } from '../../services/audit.service';
import { asPgError, DomainError, RequestContext } from '../shared/http';
import * as repo from './academics.repository';
import { Enrollment, EnrollmentInput, GuardianRecord, GuardianRecordInput } from './academics.schemas';

const sectionNotFound = () => new DomainError(404, 'SECTION_NOT_FOUND', 'Sección no encontrada.');
const studentNotFound = () => new DomainError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado.');

/**
 * RF-16: «procesar la matrícula regular y extemporánea de estudiantes, asignándolos a su
 * respectivo grado y sección verificando vacantes disponibles». RN-ACD-03 («una matrícula
 * activa por año escolar») la aplica uq_estudiante_anio; el aforo, trg_matriculas_aforo.
 */
export async function createEnrollment(ctx: RequestContext, input: EnrollmentInput): Promise<Enrollment> {
  let section: repo.SectionRef | null = null;
  try {
    return await withTenant(ctx.tenantId, ctx.userId, async (client) => {
      section = await repo.findSection(client, ctx.tenantId, input.seccionId);
      if (!section) throw sectionNotFound();
      const row = await repo.insertEnrollment(client, ctx.tenantId, section, input);
      await AuditService.record({ tenantId: ctx.tenantId, usuarioId: ctx.userId, modulo: 'academics',
        accion: 'ENROLLMENT_CREATED', entidad: 'matriculas', entidadId: row.id,
        datosNuevos: { estudianteId: row.estudianteId, seccionId: row.seccionId,
          anioLectivoId: row.anioLectivoId, estado: row.estado },
        ipOrigen: ctx.ip ?? undefined, userAgent: ctx.userAgent ?? undefined }, client);
      return { ...row, vacantesDisponibles: await repo.vacancies(client, ctx.tenantId, section.id) };
    });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    const pg = asPgError(error);
    if (pg.code === '23514' && pg.message === 'SECTION_FULL' && section) {
      // RF-16, excepción 3a: «bloquea la asignación y sugiere otras secciones disponibles del mismo grado».
      const full: repo.SectionRef = section;
      const alternativas = await withTenant(ctx.tenantId, ctx.userId, (client) =>
        repo.alternativeSections(client, ctx.tenantId, full));
      throw new DomainError(409, 'SECTION_FULL', 'La sección no tiene vacantes disponibles.', { alternativas });
    }
    if (pg.code === '23505' && pg.constraint === 'uq_estudiante_anio') {
      throw new DomainError(409, 'ENROLLMENT_DUPLICATE', 'El estudiante ya tiene matrícula en este año lectivo.');
    }
    if (pg.code === '23503' && pg.constraint === 'fk_matriculas_estudiante') throw studentNotFound();
    if (pg.code === '23503' && pg.constraint === 'fk_matriculas_seccion') throw sectionNotFound();
    throw error;
  }
}

/**
 * RF-15 -> RF-75 (docs/core/CONTRATO_FICHA_RF15_RF75.md): publica la filiación verificada.
 * El DNI solo se usa aquí para calcular el HMAC de Core; no se guarda ni se devuelve.
 */
export async function publishGuardianRecord(ctx: RequestContext, input: GuardianRecordInput): Promise<GuardianRecord> {
  const documentoHash = documentHash(input.apoderadoDni);
  try {
    return await withTenant(ctx.tenantId, ctx.userId, (client) => repo.publishGuardianRecord(client, {
      fuenteFichaId: input.fuenteFichaId, estudianteId: input.estudianteId, documentoHash,
      parentesco: input.parentesco, ip: ctx.ip, requestId: ctx.requestId }));
  } catch (error) {
    const pg = asPgError(error);
    if (pg.code === '22023' && pg.message === 'GUARDIAN_RECORD_INVALID') {
      throw new DomainError(400, 'VALIDATION_FAILED', 'Parámetros inválidos.');
    }
    if (pg.code === 'P0002' && pg.message === 'GUARDIAN_RECORD_STUDENT_NOT_FOUND') throw studentNotFound();
    if (pg.code === '23505' && pg.constraint === 'uq_ficha_apoderado_activa') {
      throw new DomainError(409, 'GUARDIAN_RECORD_DUPLICATE', 'La filiación ya está publicada y vigente.');
    }
    throw error;
  }
}

/** Corrección de la ficha: marca revocado_en; una filiación nueva se publica aparte. */
export async function revokeGuardianRecord(ctx: RequestContext, id: string, motivo: string): Promise<GuardianRecord> {
  try {
    return await withTenant(ctx.tenantId, ctx.userId, (client) =>
      repo.revokeGuardianRecord(client, id, motivo, ctx.ip, ctx.requestId));
  } catch (error) {
    const pg = asPgError(error);
    if (pg.code === '22023' && pg.message === 'GUARDIAN_RECORD_REASON_REQUIRED') {
      throw new DomainError(400, 'GUARDIAN_RECORD_REASON_REQUIRED', 'El motivo debe tener entre 10 y 500 caracteres.');
    }
    if (pg.code === 'P0002' && pg.message === 'GUARDIAN_RECORD_NOT_FOUND') {
      throw new DomainError(404, 'GUARDIAN_RECORD_NOT_FOUND', 'Filiación no encontrada.');
    }
    if (pg.code === '55000' && pg.message === 'GUARDIAN_RECORD_ALREADY_REVOKED') {
      throw new DomainError(409, 'GUARDIAN_RECORD_ALREADY_REVOKED', 'La filiación ya fue revocada.');
    }
    throw error;
  }
}
