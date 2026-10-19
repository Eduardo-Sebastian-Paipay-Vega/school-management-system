'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Users, KeyRound, FileCheck2, UserCheck, Lock } from 'lucide-react';

export default function CoreModuleView() {
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
              Squad 1 · Core y Seguridad
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500 font-mono">RF-01 a RF-14, RF-65 a RF-68</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
            Gestión de Identidad, RBAC y Auditoría Ley 29733
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand mb-4">
            <Users size={22} />
          </div>
          <h3 className="text-base font-black text-brand-dark">Directorio de Usuarios</h3>
          <p className="mt-1 text-xs text-gray-600">
            Administración de docentes, estudiantes y personal con asignación de perfiles RBAC.
          </p>
          <div className="mt-4 rounded-xl bg-accent-ivory p-3 text-xs font-mono text-gray-700">
            Total activos: <strong>842 usuarios</strong>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand mb-4">
            <Shield size={22} />
          </div>
          <h3 className="text-base font-black text-brand-dark">Auditoría Criptográfica</h3>
          <p className="mt-1 text-xs text-gray-600">
            Cadena inmutable de hashes SHA-256 para cada mutación de datos según la Ley N° 29733.
          </p>
          <div className="mt-4 rounded-xl bg-accent-ivory p-3 text-xs font-mono text-utility-success font-bold">
            Cadena íntegra: Sin anomalías
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand mb-4">
            <Lock size={22} />
          </div>
          <h3 className="text-base font-black text-brand-dark">Control de Privacidad</h3>
          <p className="mt-1 text-xs text-gray-600">
            Mecanismo de desenmascaramiento regulado con motivo de auditoría y cifrado AES-256.
          </p>
          <div className="mt-4 rounded-xl bg-accent-ivory p-3 text-xs font-mono text-gray-700">
            Nivel de protección: Alto
          </div>
        </div>
      </div>
    </div>
  );
}
