'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { LoginForm } from '@/modules/intranet';

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleLoginSuccess = () => {
    // Redirige directamente al intranet tras iniciar sesión
    router.push('/intranet');
  };

  // Easing ease-out-cubic / quart según especificación Emil Kowalski
  const easeOutTransition = {
    duration: 0.25,
    ease: [0.215, 0.61, 0.355, 1] as const,
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Column: Institutional Info (Coordinated Entrance) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={easeOutTransition}
          className="order-2 space-y-6 lg:order-1 lg:col-span-5"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white p-2 shadow-md cursor-default"
            >
              <img
                src="/emblema-unsch-grabado.png"
                alt="Escudo UNSCH Grabado"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </motion.div>
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
              <span>Acceso protegido</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              La intranet requiere una sesión activa. Su cuenta conserva la misma identidad entre años lectivos.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Modular Login Box */}
        <div className="order-1 lg:order-2 lg:col-span-7">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              ...easeOutTransition,
              delay: shouldReduceMotion ? 0 : 0.05,
            }}
            className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-elevated"
          >
            <LoginForm onSuccess={handleLoginSuccess} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

