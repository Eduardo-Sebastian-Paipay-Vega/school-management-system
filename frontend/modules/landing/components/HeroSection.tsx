'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Easing ease-out-cubic según especificación Emil Kowalski
  const easeOut = [0.215, 0.61, 0.355, 1] as const;

  return (
    <section className="relative flex min-h-[580px] items-center overflow-hidden text-white hero-one md:min-h-[660px]">
      <div className="content-width relative z-10 w-full py-20 fade-in">
        <div className="max-w-[760px]">
          {/* Institution Badge with Engraved Logo */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.24, ease: easeOut }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-accent-gold/60 bg-black/55 py-2 pl-2.5 pr-5 backdrop-blur-md shadow-xl select-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md">
              <Image
                src="/emblema-unsch-grabado.png"
                alt="Escudo Oficial UNSCH Grabado"
                width={28}
                height={28}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-accent-cream">
              62 Años de Excelencia Académica · UNSCH Ayacucho
            </span>
          </motion.div>

          {/* H1 Main Title with Negative Tracking */}
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: shouldReduceMotion ? 0 : 0.05, ease: easeOut }}
            className="hero-text-shadow text-4xl font-black leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl"
          >
            Educación de Excelencia con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
              Respaldo Universitario
            </span>{' '}
            en Ayacucho.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: shouldReduceMotion ? 0 : 0.10, ease: easeOut }}
            className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-accent-cream/95 md:text-lg"
          >
            Más de 62 años formando líderes e investigadores desde Inicial hasta Secundaria en los{' '}
            <strong className="text-white">Planteles de Aplicación Guamán Poma de Ayala</strong>,
            adscritos a la histórica{' '}
            <strong className="text-accent-gold">
              Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
            </strong>.
          </motion.p>

          {/* CTAs with Framer Motion spring physics & tactile tap */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: shouldReduceMotion ? 0 : 0.15, ease: easeOut }}
            className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            >
              <Link
                href="/admision"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-brand shadow-2xl transition-colors duration-150 hover:bg-accent-cream hover:text-brand-dark"
              >
                <span>Proceso de Admisión 2027</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            >
              <Link
                href="/por-que-elegirnos"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/60 bg-black/35 px-7 py-4 text-sm font-bold text-white backdrop-blur transition-colors duration-150 hover:bg-white/20 hover:border-white"
              >
                <span>¿Por qué elegirnos?</span>
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Highlights pill tags (Staggered subtle entrance) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : 0.20, ease: easeOut }}
            className="mt-10 flex flex-wrap items-center gap-4 text-xs font-semibold text-accent-cream/90"
          >
            <div className="flex items-center gap-1.5 transition-transform duration-150 hover:translate-x-0.5">
              <CheckCircle2 size={16} className="text-accent-gold shrink-0" />
              <span>Ingreso preferencial a la UNSCH</span>
            </div>
            <div className="flex items-center gap-1.5 transition-transform duration-150 hover:translate-x-0.5">
              <CheckCircle2 size={16} className="text-accent-gold shrink-0" />
              <span>4 Losas deportivas techadas 2026</span>
            </div>
            <div className="flex items-center gap-1.5 transition-transform duration-150 hover:translate-x-0.5">
              <CheckCircle2 size={16} className="text-accent-gold shrink-0" />
              <span>Prácticas en laboratorios científicos</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
