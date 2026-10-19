'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { LoginForm, IntranetHub, UserSession } from '@/modules/intranet';

export default function IntranetPage() {
  const [session, setSession] = useState<UserSession | null>(null);

  return (
    <div className="space-y-6">
      {session ? (
        <IntranetHub session={session} onLogout={() => setSession(null)} />
      ) : (
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Column: Identity & Features */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                  <img
                    src="/emblema-unsch-grabado.png"
                    alt="Escudo UNSCH Grabado"
                    width={44}
                    height={44}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase tracking-wider">
                    Sistema Integrado UNSCH
                  </span>
                  <h2 className="text-xl font-black text-brand-dark">Intranet Guamán Poma</h2>
                  <p className="text-xs text-gray-500">Gestión Académica y Escolar</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Portal institucional unificado para estudiantes, docentes y personal directivo de los Planteles de Aplicación de la Universidad Nacional de San Cristóbal de Huamanga.
              </p>

              <div className="space-y-3 border-t border-gray-100 pt-5 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                  <span>Consulta de boletas bimestrales y asistencia en tiempo real.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                  <span>Planilla de calificaciones Modo Excel (Squad 3) y conclusiones MINEDU.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                  <span>Kiosco portería de marcación QR offline-first (&lt; 200 ms).</span>
                </div>
              </div>

              <div className="rounded-2xl border border-accent-cream bg-accent-ivory/60 p-4 text-xs text-gray-600">
                <p className="font-bold text-brand-dark flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-brand" />
                  <span>¿Primera vez que ingresas?</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Tu usuario es tu número de DNI o código institucional. Para pruebas del piloto, puedes ingresar con cualquier usuario y clave para explorar los módulos.
                </p>
              </div>
            </div>

            {/* Right Column: Modular Login Box */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-elevated"
              >
                <LoginForm onSuccess={newSession => setSession(newSession)} />
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
