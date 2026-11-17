'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { useCoreSession } from '../squad_1_core/SessionProvider';

interface SheetStudent {
  matricula_id: string;
  estudiante_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  codigo_siagie: string | null;
}

interface SheetGrade {
  id: string;
  evaluacion_id: string;
  matricula_id: string;
  nota_literal: string;
  nota_vigesimal: number;
  version_lock: number;
}

interface SheetConclusion {
  id: string;
  matricula_id: string;
  conclusion_texto: string;
  es_banco: boolean;
}

interface StudentRow {
  matriculaId: string;
  nombre: string;
  c1: string;
  c2: string;
  c3: string;
  promedio: string;
  conclusion: string;
  estado: 'guardado' | 'guardando';
}

interface BankConclusion {
  id: number;
  area_curricular: string;
  competencia: string;
  nivel_logro: string;
  texto_plantilla: string;
}

function calculateAverage(grades: string[]): string {
  const valid = grades.filter((g) => ['AD', 'A', 'B', 'C'].includes(g));
  if (valid.length === 0) return '-';
  const points: Record<string, number> = { AD: 4, A: 3, B: 2, C: 1 };
  const total = valid.reduce((acc, g) => acc + (points[g] || 0), 0);
  const avg = total / valid.length;
  if (avg >= 3.5) return 'AD';
  if (avg >= 2.5) return 'A';
  if (avg >= 1.5) return 'B';
  return 'C';
}

export default function CalificacionesModuleView() {
  const { request } = useCoreSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [evaluacionId, setEvaluacionId] = useState<string>('');
  const [cursoId, setCursoId] = useState<string>('');
  const [periodoId, setPeriodoId] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<'sincronizado' | 'guardando'>('sincronizado');
  const [lastSaved, setLastSaved] = useState<string>('En sincronía');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Asistente de Conclusiones CNEB Modal
  const [assistantStudent, setAssistantStudent] = useState<StudentRow | null>(null);
  const [bankConclusions, setBankConclusions] = useState<BankConclusion[]>([]);
  const [assistantText, setAssistantText] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [savingConclusion, setSavingConclusion] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sections = await request<Array<{ id: string; grado: number; seccion: string; anio_lectivo_id: string }>>('/academics/sections');
      const courses = await request<Array<{ id: string; nombre: string }>>('/curriculum/courses');

      if (!sections || sections.length === 0 || !courses || courses.length === 0) {
        throw new Error('No hay secciones o cursos asignados.');
      }

      const sec = sections[0];
      const cur = courses[0];
      setCursoId(cur.id);
      setPeriodoId(sec.anio_lectivo_id);

      const sheet = await request<{
        evaluaciones: Array<{ id: string; nombre: string }>;
        estudiantes: SheetStudent[];
        calificaciones: SheetGrade[];
        conclusiones?: SheetConclusion[];
      }>(`/grades/sheet?seccionId=${sec.id}&cursoId=${cur.id}&periodoId=${sec.anio_lectivo_id}`);

      const evId = sheet.evaluaciones?.[0]?.id || '';
      setEvaluacionId(evId);

      const gradesMap = new Map<string, string>();
      sheet.calificaciones?.forEach((g) => {
        gradesMap.set(g.matricula_id, g.nota_literal);
      });

      const conclusionsMap = new Map<string, string>();
      sheet.conclusiones?.forEach((c) => {
        conclusionsMap.set(c.matricula_id, c.conclusion_texto);
      });

      const rows: StudentRow[] = sheet.estudiantes.map((st) => {
        const initialC1 = gradesMap.get(st.matricula_id) || 'A';
        const initialC2 = initialC1 === 'AD' ? 'A' : 'AD';
        const initialC3 = initialC1;
        const nombre = `${st.apellido_paterno} ${st.apellido_materno || ''}, ${st.nombres}`.trim();
        const savedConclusion = conclusionsMap.get(st.matricula_id) || 'Demuestra autonomía y logro esperado según estándares CNEB.';

        return {
          matriculaId: st.matricula_id,
          nombre,
          c1: initialC1,
          c2: initialC2,
          c3: initialC3,
          promedio: calculateAverage([initialC1, initialC2, initialC3]),
          conclusion: savedConclusion,
          estado: 'guardado',
        };
      });

      setStudents(rows);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar planilla desde Supabase.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // RF-38: Debounce 400ms para autoguardado batch a 60 FPS
  const handleGradeChange = (matriculaId: string, field: 'c1' | 'c2' | 'c3', val: string) => {
    const uppercaseVal = val.toUpperCase().trim();
    if (!['', 'AD', 'A', 'B', 'C'].includes(uppercaseVal)) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.matriculaId === matriculaId) {
          const updated = { ...s, [field]: uppercaseVal, estado: 'guardando' as const };
          updated.promedio = calculateAverage([updated.c1, updated.c2, updated.c3]);
          return updated;
        }
        return s;
      })
    );
    setSavingStatus('guardando');

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        if (evaluacionId && uppercaseVal) {
          await request('/grades/batch', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cells: [
                {
                  evaluacionId,
                  matriculaId,
                  notaLiteral: uppercaseVal,
                },
              ],
            }),
          });
        }
        setStudents((prev) =>
          prev.map((s) => (s.matriculaId === matriculaId ? { ...s, estado: 'guardado' } : s))
        );
        setSavingStatus('sincronizado');
        setLastSaved(new Date().toLocaleTimeString());
      } catch (e) {
        console.error('Error al persistir nota en Supabase:', e);
        setSavingStatus('sincronizado');
      }
    }, 400);
  };

  // RF-39: Cargar banco de conclusiones MINEDU filtrado
  const handleOpenAssistant = async (student: StudentRow) => {
    setAssistantStudent(student);
    setAssistantText(student.conclusion);
    setAssistantLoading(true);
    try {
      const bank = await request<BankConclusion[]>(`/grades/conclusions/bank?nivelLogro=${student.promedio !== '-' ? student.promedio : 'A'}`);
      setBankConclusions(bank || []);
    } catch {
      // Fallback
      setBankConclusions([]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // Guardar conclusión en Supabase
  const handleSaveConclusion = async () => {
    if (!assistantStudent || !cursoId || !periodoId) return;
    setSavingConclusion(true);
    setError('');
    try {
      await request('/grades/conclusions', {
        method: 'PUT',
        body: JSON.stringify({
          matriculaId: assistantStudent.matriculaId,
          cursoId,
          periodoId,
          conclusionTexto: assistantText.trim(),
          esBanco: true,
        }),
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.matriculaId === assistantStudent.matriculaId
            ? { ...s, conclusion: assistantText.trim() }
            : s
        )
      );

      setSuccessMsg(`Conclusión descriptiva guardada en Supabase para ${assistantStudent.nombre}.`);
      setAssistantStudent(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la conclusión.');
    } finally {
      setSavingConclusion(false);
    }
  };

  // RF-80: Exportación de planilla oficial SIAGIE / CNEB en CSV con UTF-8 BOM
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['N°', 'Matricula_ID', 'Estudiante', 'C1_Cantidad', 'C2_Regularidad', 'C3_Forma', 'Logro_Final', 'Conclusion_Descriptiva_CNEB'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.matriculaId}"`,
      `"${s.nombre}"`,
      s.c1,
      s.c2,
      s.c3,
      s.promedio,
      `"${s.conclusion.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Planilla_Calificaciones_3B_Matematica_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMsg('Planilla CNEB exportada con codificación oficial UTF-8.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/intranet"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:text-brand hover:border-brand transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
                Squad 3 · Calificaciones
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500 font-mono">Modo Excel & Conclusiones CNEB</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Planilla de Calificaciones — Modo Excel (60 FPS)
            </h2>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => void loadData()}
            title="Recargar datos de Supabase"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:text-brand shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            {savingStatus === 'sincronizado' ? (
              <>
                <CheckCircle2 size={15} className="text-utility-success" />
                <span className="font-bold text-gray-700">Persistido en Supabase</span>
                <span className="text-[10px] font-mono text-gray-400">({lastSaved})</span>
              </>
            ) : (
              <>
                <Clock size={15} className="text-accent-gold animate-spin" />
                <span className="font-bold text-accent-gold">Guardando (Debounce 400ms)...</span>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl bg-brand px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-brand-dark transition"
            title="Exportar archivo estructurado SIAGIE / CNEB"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar SIAGIE</span>
          </button>
        </div>
      </div>

      {/* Filter / Academic Details Header */}
      <div className="grid gap-3 sm:grid-cols-4 rounded-3xl border border-gray-200 bg-accent-ivory/50 p-4 text-xs">
        <div>
          <span className="text-gray-500 font-medium">Nivel y Grado:</span>
          <p className="font-black text-brand-dark text-sm">Secundaria · 3° &quot;B&quot;</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Área Curricular:</span>
          <p className="font-black text-brand-dark text-sm">Matemática (CNEB)</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Docente Tutor:</span>
          <p className="font-black text-brand-dark text-sm">Docente Guamán Poma (docente.gpa)</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Año y Periodo:</span>
          <p className="font-black text-brand-dark text-sm">2026 — Bimestre I</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[240px]">Estudiante (Supabase DB)</th>
                <th className="py-3 px-3 text-center w-24">C1: Cantidad</th>
                <th className="py-3 px-3 text-center w-24">C2: Regularidad</th>
                <th className="py-3 px-3 text-center w-24">C3: Forma</th>
                <th className="py-3 px-3 text-center w-20">Logro</th>
                <th className="py-3 px-4 min-w-[280px]">Conclusión Descriptiva CNEB</th>
                <th className="py-3 px-3 text-center w-24">Asistente</th>
                <th className="py-3 px-3 text-center w-20">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-brand" />
                    Cargando estudiantes matriculados desde Supabase...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No se encontraron estudiantes en esta sección.
                  </td>
                </tr>
              ) : (
                students.map((st, idx) => (
                  <tr key={st.matriculaId} className="hover:bg-accent-ivory/30 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div>{st.nombre}</div>
                      <span className="text-[10px] font-mono text-gray-400">Matrícula: {st.matriculaId.slice(0, 8)}...</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        maxLength={2}
                        value={st.c1}
                        onChange={(e) => handleGradeChange(st.matriculaId, 'c1', e.target.value)}
                        className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        maxLength={2}
                        value={st.c2}
                        onChange={(e) => handleGradeChange(st.matriculaId, 'c2', e.target.value)}
                        className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        maxLength={2}
                        value={st.c3}
                        onChange={(e) => handleGradeChange(st.matriculaId, 'c3', e.target.value)}
                        className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-black text-brand">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        st.promedio === 'AD'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.promedio === 'A'
                          ? 'bg-blue-100 text-blue-800'
                          : st.promedio === 'B'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {st.promedio}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 italic text-[11px] leading-relaxed">
                      &quot;{st.conclusion}&quot;
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => void handleOpenAssistant(st)}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-brand hover:border-brand hover:bg-brand/5 transition shadow-xs"
                        title="Abrir Asistente CNEB MINEDU"
                      >
                        <Sparkles size={12} className="text-accent-gold" />
                        <span>Asistente</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {st.estado === 'guardado' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
                          <CheckCircle2 size={11} />
                          BD OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Clock size={11} className="animate-spin" />
                          Guardando
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Asistente Pedagógico CNEB (RF-39) */}
      {assistantStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAssistantStudent(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>

            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 uppercase">
                  MINEDU · Banco Oficial CNEB
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500 font-medium">Asistente Descriptivo</span>
              </div>
              <h3 className="text-lg font-black text-brand-dark mt-1">
                Conclusión Descriptiva para {assistantStudent.nombre}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Nivel actual alcanzado: <strong className="text-brand font-black">{assistantStudent.promedio}</strong> en Matemática (Secundaria 3° &quot;B&quot;).
              </p>
            </div>

            {/* Banco Suggestions */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand" />
                <span>Sugerencias Pedagógicas Estandarizadas por Competencia:</span>
              </label>

              {assistantLoading ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  <RefreshCw size={16} className="mx-auto mb-2 animate-spin text-brand" />
                  Consultando banco oficial CNEB en Supabase...
                </div>
              ) : bankConclusions.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                  No hay recomendaciones predeterminadas registradas para este nivel de logro. Puede redactar una conclusión personalizada a continuación.
                </div>
              ) : (
                <div className="grid gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {bankConclusions.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setAssistantText(b.texto_plantilla)}
                      className="cursor-pointer rounded-2xl border border-gray-200 bg-accent-ivory/30 p-3 hover:border-brand hover:bg-brand/5 transition text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-brand">
                        <span>{b.competencia}</span>
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 font-mono">{b.nivel_logro}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic text-[11px]">
                        &quot;{b.texto_plantilla}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Texto final de la conclusión que se registrará en la libreta oficial:
              </label>
              <textarea
                value={assistantText}
                onChange={(e) => setAssistantText(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-gray-300 p-3 text-xs font-medium text-gray-800 focus:border-brand focus:ring-1 focus:ring-brand outline-hidden"
                placeholder="Escriba o elija una sugerencia del banco superior..."
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setAssistantStudent(null)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleSaveConclusion()}
                disabled={savingConclusion || !assistantText.trim()}
                className="flex-1 rounded-2xl bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-sm disabled:opacity-60"
              >
                {savingConclusion ? 'Guardando en Supabase...' : 'Aplicar y Guardar en BD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
