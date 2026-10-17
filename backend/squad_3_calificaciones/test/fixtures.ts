import type { Actor, Book } from '../src/domain.js';
export const teacher: Actor = { id: '00000000-0000-4000-8000-000000000001', tenantId: 'school-a', role: 'teacher' };
export const practitioner: Actor = { id: '00000000-0000-4000-8000-000000000002', tenantId: 'school-a', role: 'practitioner' };
export const director: Actor = { id: '00000000-0000-4000-8000-000000000003', tenantId: 'school-a', role: 'director' };
export const student: Actor = { id: '00000000-0000-4000-8000-000000000004', tenantId: 'school-a', role: 'student' };
export function fixture(): Book {
  return {
    id: '00000000-0000-4000-8000-000000000010', tenantId: teacher.tenantId,
    courseId: '00000000-0000-4000-8000-000000000011', sectionId: '00000000-0000-4000-8000-000000000012',
    periodId: '00000000-0000-4000-8000-000000000013', expectedPeriods: ['00000000-0000-4000-8000-000000000013'], year: 2026, periodWeight: 1, annualMode: 'weighted',
    teacherId: teacher.id, practitionerIds: [practitioner.id], title: 'Matemática · 3 A', revision: 1, closed: false, deadline: '2099-12-31T23:59:59Z', level: 'secondary', scale: { ad: 17.5, a: 13.5, b: 10.5 },
    competencies: ['Cantidad'], evaluations: [{ id: 'ev1', name: 'Práctica', weight: 1, competency: 'Cantidad', rubric: 'Argumentación' }, { id: 'ev2', name: 'Proyecto', weight: 3, competency: 'Cantidad', rubric: 'Resolución' }],
    students: [{ id: 'mat1', userId: student.id, name: 'Estudiante uno' }, { id: 'mat2', userId: '00000000-0000-4000-8000-000000000005', name: 'Estudiante dos' }],
    grades: {}, conclusions: {}, publishedGrades: {}, publishedConclusions: {}, requests: [], conclusionBank: [],
  };
}
export function completeItems() { return ['mat1', 'mat2'].flatMap(studentId => ['ev1', 'ev2'].map(evaluationId => ({ studentId, evaluationId, input: '18' }))); }
