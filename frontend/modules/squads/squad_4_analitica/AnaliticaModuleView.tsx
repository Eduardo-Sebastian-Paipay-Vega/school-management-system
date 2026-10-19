'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, AlertTriangle, Users, Award, ShieldAlert } from 'lucide-react';

export default function AnaliticaModuleView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
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
            <span className="text-xs text-gray-500 font-mono">RF-47 a RF-58</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
            Ficha 360°, Mapas de Calor y Alerta Temprana de Deserción
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
              <TrendingUp size={22} />
            </div>
            <span className="rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
              +4.2% vs 2025
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Rendimiento Académico</h3>
          <p className="mt-1 text-xs text-gray-600">Promedio ponderado global del colegio.</p>
          <div className="mt-4 text-3xl font-black text-brand">15.8 <span className="text-xs font-normal text-gray-400">/ 20</span></div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
              <Users size={22} />
            </div>
            <span className="rounded-full bg-utility-success/15 px-2 py-0.5 text-[10px] font-bold text-utility-success">
              Meta cumplida
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Asistencia Promedio</h3>
          <p className="mt-1 text-xs text-gray-600">Registro mensual de asistencia en aula.</p>
          <div className="mt-4 text-3xl font-black text-brand">94.6%</div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <ShieldAlert size={22} />
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Monitoreo Activo
            </span>
          </div>
          <h3 className="text-base font-black text-brand-dark">Alerta de Deserción</h3>
          <p className="mt-1 text-xs text-gray-600">Estudiantes en riesgo por inasistencias consecutivas.</p>
          <div className="mt-4 text-3xl font-black text-amber-600">3 <span className="text-xs font-normal text-gray-400">casos</span></div>
        </div>
      </div>
    </div>
  );
}
