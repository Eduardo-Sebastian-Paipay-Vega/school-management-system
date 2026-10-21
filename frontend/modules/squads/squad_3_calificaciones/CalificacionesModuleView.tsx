'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TableProperties,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentGrade {
  id: string;
  matriculaId: string;
  nombre: string;
  dni: string;
  c1: string; // Competencia 1
  c2: string; // Competencia 2
  c3: string; // Competencia 3
  promedio: string;
  conclusion: string;
  estado: 'guardado' | 'pendiente' | 'guardando';
}

const mockStudents: StudentGrade[] = [
  { id: '1', matriculaId: 'MAT-2026-001', nombre: 'Alarcón Mendoza, Luciana Sofía', dni: '74125896', c1: 'AD', c2: 'A', c3: 'AD', promedio: 'AD', conclusion: 'Demuestra dominio sobresaliente en resolución de problemas.', estado: 'guardado' },
  { id: '2', matriculaId: 'MAT-2026-002', nombre: 'Barrientos Quispe, Rodrigo Alonso', dni: '75236984', c1: 'A', c2: 'A', c3: 'B', promedio: 'A', conclusion: 'Alcanzó el nivel esperado. Requiere afianzar formulación matemática.', estado: 'guardado' },
  { id: '3', matriculaId: 'MAT-2026-003', nombre: 'Cárdenas Huamán, Valeria Nicole', dni: '76347012', c1: 'AD', c2: 'AD', c3: 'A', promedio: 'AD', conclusion: 'Excelente autonomía y capacidad de análisis crítico.', estado: 'guardado' },
  { id: '4', matriculaId: 'MAT-2026-004', nombre: 'Gómez Palomino, Mateo Sebastián', dni: '77458123', c1: 'B', c2: 'B', c3: 'A', promedio: 'B', conclusion: 'En proceso de consolidar la argumentación científica.', estado: 'guardado' },
  { id: '5', matriculaId: 'MAT-2026-005', nombre: 'López Huaccachi, Camila Fernanda', dni: '78569234', c1: 'A', c2: 'AD', c3: 'A', promedio: 'A', conclusion: 'Participación proactiva y cumplimiento riguroso de evidencias.', estado: 'guardado' },
];

export default function CalificacionesModuleView() {
  const [students, setStudents] = useState<StudentGrade[]>(mockStudents);
  const [savingStatus, setSavingStatus] = useState<'sincronizado' | 'guardando'>('sincronizado');
  const [lastSaved, setLastSaved] = useState<string>('Hace unos momentos');

  const handleGradeChange = (id: string, field: 'c1' | 'c2' | 'c3', val: string) => {
    const uppercaseVal = val.toUpperCase();
    if (!['', 'AD', 'A', 'B', 'C'].includes(uppercaseVal)) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === id) {
          return { ...s, [field]: uppercaseVal, estado: 'guardando' };
        }
        return s;
      })
    );
    setSavingStatus('guardando');

    // Simulación del Debounce canónico de 400ms (RF-38)
    setTimeout(() => {
      setStudents(prev =>
        prev.map(s => (s.id === id ? { ...s, estado: 'guardado' } : s))
      );
      setSavingStatus('sincronizado');
      setLastSaved(new Date().toLocaleTimeString());
    }, 400);
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
              <span className="text-xs text-gray-500 font-mono">RF-36 a RF-46</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Planilla de Calificaciones — Modo Excel
            </h2>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            {savingStatus === 'sincronizado' ? (
              <>
                <CheckCircle2 size={15} className="text-utility-success" />
                <span className="font-bold text-gray-700">Autoguardado 400ms OK</span>
                <span className="text-[10px] font-mono text-gray-400">({lastSaved})</span>
              </>
            ) : (
              <>
                <Clock size={15} className="text-accent-gold animate-spin" />
                <span className="font-bold text-accent-gold">Guardando en lote...</span>
              </>
            )}
          </div>

          <button
            onClick={() => alert('Exportando planilla CNEB oficial en formato XLSX...')}
            className="flex items-center gap-1.5 rounded-2xl bg-brand px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-brand-dark transition"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filter / Academic Details Header */}
      <div className="grid gap-3 sm:grid-cols-4 rounded-3xl border border-gray-200 bg-accent-ivory/50 p-4 text-xs">
        <div>
          <span className="text-gray-500 font-medium">Nivel y Grado:</span>
          <p className="font-black text-brand-dark text-sm">Secundaria · 4to Año &quot;A&quot;</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Área Curricular:</span>
          <p className="font-black text-brand-dark text-sm">Matemática (CNEB)</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Docente Responsable:</span>
          <p className="font-black text-brand-dark text-sm">Mg. Steve Ovalle Luyo</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium">Periodo Lectivo:</span>
          <p className="font-black text-brand-dark text-sm">2026 — III Bimestre</p>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[240px]">Estudiante (Apellidos y Nombres)</th>
                <th className="py-3 px-3 text-center w-24">C1: Resuelve Cantidad</th>
                <th className="py-3 px-3 text-center w-24">C2: Regularidad</th>
                <th className="py-3 px-3 text-center w-24">C3: Forma y Espacio</th>
                <th className="py-3 px-3 text-center w-20">Logro</th>
                <th className="py-3 px-4 min-w-[280px]">Conclusión Descriptiva MINEDU</th>
                <th className="py-3 px-3 text-center w-20">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((st, idx) => (
                <tr key={st.id} className="hover:bg-accent-ivory/30 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-gray-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <div>{st.nombre}</div>
                    <span className="text-[10px] font-mono text-gray-400">DNI: {st.dni}</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="text"
                      maxLength={2}
                      value={st.c1}
                      onChange={e => handleGradeChange(st.id, 'c1', e.target.value)}
                      className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="text"
                      maxLength={2}
                      value={st.c2}
                      onChange={e => handleGradeChange(st.id, 'c2', e.target.value)}
                      className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="text"
                      maxLength={2}
                      value={st.c3}
                      onChange={e => handleGradeChange(st.id, 'c3', e.target.value)}
                      className="w-14 text-center font-black rounded-lg border border-gray-300 py-1.5 uppercase outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-black text-brand">
                    <span className="rounded-md bg-brand/10 px-2 py-0.5">{st.promedio}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 italic text-[11px] leading-relaxed">
                    &quot;{st.conclusion}&quot;
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
                      <CheckCircle2 size={11} />
                      OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
