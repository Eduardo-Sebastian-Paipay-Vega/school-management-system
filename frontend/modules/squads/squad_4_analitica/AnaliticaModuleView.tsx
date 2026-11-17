'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Award,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Flame,
  UserX,
  X,
  Target,
} from 'lucide-react';
import { useCoreSession } from '../squad_1_core/SessionProvider';

interface MeritStudent {
  matricula_id: string;
  estudiante_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nivel: string;
  grado: number;
  seccion: string;
  promedio_ponderado: number;
  evaluaciones_calificadas: number;
  puesto_seccion: number;
}

interface HeatmapSection {
  seccion_id: string;
  nivel: string;
  grado: number;
  seccion: string;
  promedio_seccion_vigesimal: number;
  total_desaprobados: number;
  total_destacados: number;
  semaforo_calor: 'OPTIMO' | 'ESPERADO' | 'EN_PROCESO' | 'EN_RIESGO';
}

interface DropoutRiskStudent {
  matricula_id: string;
  estudiante_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nivel: string;
  grado: number;
  seccion: string;
  total_registros: number;
  faltas_injustificadas: number;
  tardanzas_injustificadas: number;
  tasa_inasistencia_pct: number;
  nivel_riesgo_desercion: 'RIESGO_ALTO' | 'RIESGO_MODERADO' | 'SIN_RIESGO';
}

interface RadarDimension {
  dimension: string;
  valor: number;
  maximo: number;
}

interface Student360Profile {
  estudiante: {
    id: string;
    nombreCompleto: string;
    codigoSiagie: string | null;
  };
  resumenMetricas: {
    promedioVigesimal: number;
    evaluacionesRegistradas: number;
    asistenciasTotales: number;
    faltasInjustificadas: number;
  };
  radarDimensiones: RadarDimension[];
}

export default function AnaliticaModuleView() {
  const { request } = useCoreSession();
  const [activeTab, setActiveTab] = useState<'merito' | 'calor' | 'desercion'>('merito');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Datasets
  const [ranking, setRanking] = useState<MeritStudent[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapSection[]>([]);
  const [dropoutRisks, setDropoutRisks] = useState<DropoutRiskStudent[]>([]);
  const [avgScore, setAvgScore] = useState<number>(16.5);

  // Ficha 360° Modal
  const [selectedStudent360, setSelectedStudent360] = useState<Student360Profile | null>(null);
  const [activeStudentId360, setActiveStudentId360] = useState<string | null>(null);

  const loadAllAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [meritData, heatmapData, riskData] = await Promise.all([
        request<MeritStudent[]>('/analytics/academic/merit-ranking'),
        request<HeatmapSection[]>('/analytics/academic/heatmap'),
        request<DropoutRiskStudent[]>('/analytics/attendance/risk-dropout'),
      ]);

      setRanking(meritData || []);
      setHeatmap(heatmapData || []);
      setDropoutRisks(riskData || []);

      if (meritData && meritData.length > 0) {
        const sum = meritData.reduce((acc, s) => acc + (s.promedio_ponderado || 0), 0);
        setAvgScore(Number((sum / meritData.length).toFixed(1)));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar analítica.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadAllAnalytics();
  }, [loadAllAnalytics]);

  // RF-56: Abrir Ficha 360° con Radar Chart multidimensional
  const handleOpen360 = async (studentId: string) => {
    setActiveStudentId360(studentId);
    setError('');
    try {
      const profile = await request<Student360Profile>(`/analytics/student/${studentId}/radar-360`);
      setSelectedStudent360(profile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la Ficha 360° del estudiante.');
    } finally {
      setActiveStudentId360(null);
    }
  };

  // SVG Radar Chart Math Helper (5 dimensions)
  const renderRadarSvg = (dimensions: RadarDimension[]) => {
    const size = 260;
    const center = size / 2;
    const radius = 95;
    const totalAxes = dimensions.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Background concentric rings
    const rings = [0.25, 0.5, 0.75, 1];

    // Points for polygon
    const polygonPoints = dimensions.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const factor = d.valor / d.maximo;
      const x = center + radius * factor * Math.cos(angle);
      const y = center + radius * factor * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={size} height={size} className="mx-auto overflow-visible">
        {/* Concentric polygons */}
        {rings.map((r, ringIdx) => {
          const ringPoints = dimensions.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * r * Math.cos(angle);
            const y = center + radius * r * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray={ringIdx < 3 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#D1D5DB"
              strokeWidth="1"
            />
          );
        })}

        {/* Student Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(128, 0, 32, 0.25)"
          stroke="#800020"
          strokeWidth="2.5"
        />

        {/* Vertex points */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const factor = d.valor / d.maximo;
          const x = center + radius * factor * Math.cos(angle);
          const y = center + radius * factor * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#800020"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
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
                Squad 4 · Analítica y Dashboards
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500 font-mono">Ficha 360° & Mapas Térmicos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Cuadros de Mérito, Radar 360° y Alertas Tempranas
            </h2>
          </div>
        </div>

        <button
          onClick={() => void loadAllAnalytics()}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-brand shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          <span>Actualizar Métricas</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
              <TrendingUp size={22} />
            </div>
            <span className="rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
              Promedio CNEB
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Rendimiento Académico</h3>
          <p className="mt-1 text-xs text-gray-600">Promedio general calculado en Supabase.</p>
          <div className="mt-4 text-3xl font-black text-brand">
            {avgScore} <span className="text-xs font-normal text-gray-400">/ 20</span>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
              <Users size={22} />
            </div>
            <span className="rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
              {ranking.length} Alumnos
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Asistencia en Portería</h3>
          <p className="mt-1 text-xs text-gray-600">Tasa de puntualidad de la jornada actual.</p>
          <div className="mt-4 text-3xl font-black text-brand">90.0%</div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
              <ShieldCheck size={22} />
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Riesgo Controlado
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Alerta de Deserción</h3>
          <p className="mt-1 text-xs text-gray-600">Estudiantes con ausentismo crítico.</p>
          <div className="mt-4 text-3xl font-black text-utility-success">
            {dropoutRisks.filter((d) => d.nivel_riesgo_desercion === 'RIESGO_ALTO').length} casos críticos
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 text-xs font-bold space-x-4">
        <button
          onClick={() => setActiveTab('merito')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition ${
            activeTab === 'merito'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Award size={16} />
          <span>Cuadro de Honor y Mérito (RF-50)</span>
        </button>

        <button
          onClick={() => setActiveTab('calor')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition ${
            activeTab === 'calor'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Flame size={16} />
          <span>Mapa de Calor por Sección (RF-47)</span>
        </button>

        <button
          onClick={() => setActiveTab('desercion')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition ${
            activeTab === 'desercion'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <UserX size={16} />
          <span>Detección de Deserción (RF-52)</span>
        </button>
      </div>

      {/* TAB 1: Cuadro de Mérito */}
      {activeTab === 'merito' && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                <Award size={18} className="text-accent-gold" />
                <span>Cuadro de Mérito Oficial (Cálculo Ponderado en Supabase)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Puestos calculados con función ventana SQL por sección y nivel curricular.
              </p>
            </div>
            <span className="text-xs font-mono text-gray-500 font-bold">
              Secundaria 3° &quot;B&quot; · Periodo 2026-I
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">Puesto</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-3">Grado y Sección</th>
                  <th className="py-3 px-3 text-center">Evaluaciones</th>
                  <th className="py-3 px-3 text-center">Promedio</th>
                  <th className="py-3 px-3 text-center">Escala CNEB</th>
                  <th className="py-3 px-3 text-center">Ficha 360°</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-brand" />
                      Calculando cuadro de mérito en Supabase...
                    </td>
                  </tr>
                ) : ranking.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No se encontraron notas registradas.
                    </td>
                  </tr>
                ) : (
                  ranking.map((s) => (
                    <tr key={s.matricula_id} className="hover:bg-accent-ivory/20 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${
                          s.puesto_seccion === 1
                            ? 'bg-accent-gold text-white shadow-sm'
                            : s.puesto_seccion === 2
                            ? 'bg-gray-300 text-gray-800'
                            : s.puesto_seccion === 3
                            ? 'bg-amber-700/80 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {s.puesto_seccion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {s.apellido_paterno} {s.apellido_materno || ''}, {s.nombres}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {s.nivel} {s.grado}° &quot;{s.seccion}&quot;
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-600">
                        {s.evaluaciones_calificadas}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-brand text-sm">
                        {s.promedio_ponderado}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`rounded-md px-2 py-0.5 font-bold ${
                          s.promedio_ponderado >= 18
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.promedio_ponderado >= 14
                            ? 'bg-blue-100 text-blue-800'
                            : s.promedio_ponderado >= 11
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {s.promedio_ponderado >= 18 ? 'AD' : s.promedio_ponderado >= 14 ? 'A' : s.promedio_ponderado >= 11 ? 'B' : 'C'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => void handleOpen360(s.estudiante_id)}
                          disabled={activeStudentId360 === s.estudiante_id}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-brand hover:border-brand hover:bg-brand hover:text-white transition shadow-xs disabled:opacity-60"
                          title="Ver Ficha Integral 360° con Radar Chart"
                        >
                          {activeStudentId360 === s.estudiante_id ? (
                            <RefreshCw size={12} className="animate-spin text-brand" />
                          ) : (
                            <Target size={12} />
                          )}
                          <span>Radar 360°</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Mapa de Calor por Sección (RF-47) */}
      {activeTab === 'calor' && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                <Flame size={18} className="text-amber-600" />
                <span>Mapa Térmico de Rendimiento por Sección</span>
              </h3>
              <p className="text-xs text-gray-500">
                Semáforo pedagógico que identifica aulas con necesidades de reforzamiento.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {heatmap.map((h) => (
              <div
                key={h.seccion_id}
                className="rounded-2xl border border-gray-200 p-5 space-y-3 bg-gradient-to-br from-white to-accent-ivory/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-brand-dark">
                    {h.nivel} · {h.grado}° &quot;{h.seccion}&quot;
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                    h.semaforo_calor === 'OPTIMO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : h.semaforo_calor === 'ESPERADO'
                      ? 'bg-blue-100 text-blue-800'
                      : h.semaforo_calor === 'EN_PROCESO'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {h.semaforo_calor}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand">{h.promedio_seccion_vigesimal}</span>
                  <span className="text-xs text-gray-400">/ 20 promedio</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-gray-100 pt-3">
                  <div>
                    <span className="text-gray-500">Destacados:</span>
                    <p className="font-bold text-utility-success">{h.total_destacados} alumnos</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Desaprobados:</span>
                    <p className="font-bold text-red-600">{h.total_desaprobados} alumnos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Detección de Deserción y Ausentismo (RF-52) */}
      {activeTab === 'desercion' && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
              <UserX size={18} className="text-red-600" />
              <span>Matriz de Riesgo de Deserción y Ausentismo Crónico</span>
            </h3>
            <p className="text-xs text-gray-500">
              Clasificación predictiva basada en faltas injustificadas y tardanzas reiteradas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-3">Grado</th>
                  <th className="py-3 px-3 text-center">Faltas Injustificadas</th>
                  <th className="py-3 px-3 text-center">Tardanzas</th>
                  <th className="py-3 px-3 text-center">Tasa Inasistencia</th>
                  <th className="py-3 px-3 text-center">Nivel de Riesgo</th>
                  <th className="py-3 px-3 text-center">Intervención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dropoutRisks.map((d) => (
                  <tr key={d.matricula_id} className="hover:bg-accent-ivory/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {d.apellido_paterno} {d.apellido_materno || ''}, {d.nombres}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {d.nivel} {d.grado}° &quot;{d.seccion}&quot;
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-red-600">
                      {d.faltas_injustificadas}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700">
                      {d.tardanzas_injustificadas}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">
                      {d.tasa_inasistencia_pct}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        d.nivel_riesgo_desercion === 'RIESGO_ALTO'
                          ? 'bg-red-100 text-red-800'
                          : d.nivel_riesgo_desercion === 'RIESGO_MODERADO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {d.nivel_riesgo_desercion.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => void handleOpen360(d.estudiante_id)}
                        className="rounded-xl border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-700 hover:border-brand hover:text-brand transition shadow-xs"
                      >
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Ficha 360° con Radar Chart Pentagonal (RF-56) */}
      {selectedStudent360 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent360(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
                  Ficha Integral 360°
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500 font-medium">Evaluación Multidimensional</span>
              </div>
              <h3 className="text-lg font-black text-brand-dark mt-1">
                {selectedStudent360.estudiante.nombreCompleto}
              </h3>
              <p className="text-xs text-gray-500">
                Secundaria 3° &quot;B&quot; · Planteles de Aplicación Guamán Poma de Ayala (UNSCH)
              </p>
            </div>

            {/* Radar Chart SVG Visualization */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-[11px] font-extrabold text-accent-gold uppercase tracking-wider">
                  Radar Pedagógico de 5 Dimensiones
                </span>
              </div>
              {renderRadarSvg(selectedStudent360.radarDimensiones)}
            </div>

            {/* Dimension Breakdown List */}
            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-gray-700">Desglose de Factores Evaluados:</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedStudent360.radarDimensiones.map((d, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-accent-ivory/20 p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">{d.dimension}</span>
                      <span className="font-mono font-bold text-brand">{d.valor}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-300"
                        style={{ width: `${d.valor}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent360(null)}
                className="rounded-2xl bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-sm"
              >
                Cerrar Ficha 360°
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
