'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
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
    <div className="mx-auto max-w-5xl py-8 sm:py-12">
      <div className="grid gap-10 lg:grid-cols-12 items-center">
        {/* Left Column: Institutional Info (Coordinated Entrance) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={easeOutTransition}
          className="order-2 space-y-6 lg:order-1 lg:col-span-5"
        >
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E8D8D4] bg-white p-2 shadow-md cursor-default"
            >
              <Image
                src="/emblema-unsch-grabado.webp"
                alt="Escudo UNSCH Grabado"
                width={44}
                height={44}
                priority
                className="h-full w-full object-contain"
              />
            </motion.div>
            <div>
              <span className="inline-block rounded-full bg-[#8F1025]/10 px-2.5 py-0.5 text-[10px] font-black text-[#8F1025] uppercase tracking-wider">
                Sistema Integrado UNSCH
              </span>
              <h2 className="bbd-font-display text-2xl text-[#3A0008] tracking-tight leading-none mt-1">
                INTRANET GUAMÁN POMA
              </h2>
              <p className="text-xs text-[#796763] font-medium">Gestión Académica y Escolar</p>
            </div>
          </div>

          <p className="font-roboto text-sm text-[rgba(41,23,25,0.8)] leading-relaxed">
            Portal institucional unificado para estudiantes, docentes y personal directivo de los Planteles de Aplicación de la Universidad Nacional de San Cristóbal de Huamanga.
          </p>

          <div className="space-y-3 border-t border-[#E8D8D4] pt-5 text-xs text-[#291719]">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#8F1025] shrink-0 mt-0.5" />
              <span>Consulta de boletas bimestrales y asistencia en tiempo real.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#8F1025] shrink-0 mt-0.5" />
              <span>Planilla de calificaciones Modo Excel y conclusiones MINEDU.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#8F1025] shrink-0 mt-0.5" />
              <span>Kiosco portería de marcación QR offline-first (&lt; 200 ms).</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8D8D4] bg-[#F5EBE8] p-4 text-xs text-[#291719]">
            <p className="font-bold text-[#4F000B] flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#32965C]" />
              <span className="font-roboto uppercase tracking-wider text-[11px]">Acceso Oficial Seguro</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#796763]">
              La intranet requiere credenciales activas. Su cuenta conserva la misma identidad y permisos institucionales entre años lectivos.
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
            className="rounded-3xl border border-[#E8D8D4] bg-white p-8 sm:p-10 shadow-[0_4px_24px_rgba(79,0,11,0.06)]"
          >
            <LoginForm onSuccess={handleLoginSuccess} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

