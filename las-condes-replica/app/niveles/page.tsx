'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  UserCheck,
  Sparkles,
  Microscope,
  Palette,
  Trophy,
  ArrowRight,
  ChevronRight,
  Compass,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const levelsData = [
  {
    id: 'inicial',
    title: 'Nivel Inicial',
    badge: '3, 4 y 5 años',
    director: 'Prof. Alberto Alfredo Palomino Rivera',
    schedule: '8:00 AM – 1:00 PM',
    description:
      'Espacio diseñado para despertar la curiosidad natural, la autonomía y la creatividad en los primeros años de vida con calidez y máxima seguridad.',
    heroTag: 'Primera Infancia',
    accentColor: 'text-accent-rouge',
    pillBg: 'bg-accent-rouge/10 text-accent-rouge',
    objectives: [
      'Desarrollo psicomotriz integral (motricidad fina y gruesa) en áreas de juego protegidas.',
      'Estimulación sensorial y fomento de las primeras nociones lógico-matemáticas vivenciales.',
      'Acompañamiento socioemocional y fortalecimiento de hábitos de convivencia y autonomía.',
      'Iniciación a la expresión artística, música andina y narración oral de cuentos.',
    ],
    features: [
      'Aulas lúdicas implementadas con material didáctico estructurado de alta calidad.',
      'Patios de juegos infantiles con piso blando amortiguador y techado protector.',
      'Seguimiento psicopedagógico permanente y talleres mensuales para padres de familia.',
      'Atención temprana por docentes con especialización universitaria en Educación Inicial.',
    ],
    curriculum: [
      'Comunicación y Lenguaje Expresivo',
      'Matemática Lúdica y Construcción Numérica',
      'Descubrimiento del Medio Social y Natural',
      'Psicomotricidad y Coordinación Corporal',
      'Arte, Expresión Musical y Plástica',
    ],
    ctaText: 'Postular a Inicial 2027',
  },
  {
    id: 'primaria',
    title: 'Nivel Primaria',
    badge: '1° a 6° Grado',
    director: 'Plana Docente Especializada de la UNSCH',
    schedule: '7:45 AM – 1:30 PM',
    description:
      'Formación integral que afianza el pensamiento crítico, la pasión por la lectura, la resolución de problemas y la identidad cívica y cultural.',
    heroTag: 'Básica Regular',
    accentColor: 'text-brand',
    pillBg: 'bg-brand/10 text-brand',
    featured: true,
    objectives: [
      'Comprensión lectora profunda, redacción creativa y oratoria escolar.',
      'Pensamiento lógico-matemático aplicado a la resolución de problemas cotidianos.',
      'Iniciación al método científico experimental a través de la feria escolar Eureka.',
      'Desarrollo de competencias digitales y robótica educativa elemental.',
    ],
    features: [
      'Práctica deportiva en las 4 nuevas losas techadas (fútbol, vóley, básquet) protegidas del sol.',
      'Talleres formativos de música tradicional ayacuchana y danzas folclóricas.',
      'Programa intensivo de inglés formativo con material interactivo.',
      'Acompañamiento tutorial continuo para el desarrollo de valores y disciplina positiva.',
    ],
    curriculum: [
      'Comunicación Integral y Plan Lector',
      'Matemática y Razonamiento Lógico',
      'Ciencia, Tecnología y Ambiente',
      'Personal Social y Ciudadanía',
      'Educación Artística y Danzas Andinas',
      'Educación Física y Deporte Formativo',
      'Idioma Extranjero: Inglés',
    ],
    ctaText: 'Postular a Primaria 2027',
  },
  {
    id: 'secundaria',
    title: 'Nivel Secundaria',
    badge: '1° a 5° Año',
    director: 'Mg. Yecid Ramírez Chipana',
    schedule: '7:30 AM – 2:15 PM (Talleres hasta 4:30 PM)',
    description:
      'Exigencia preuniversitaria, investigación científica en laboratorios reales de la UNSCH y liderazgo juvenil para el ingreso exitoso a la educación superior.',
    heroTag: 'Preuniversitario & Liderazgo',
    accentColor: 'text-accent-gold',
    pillBg: 'bg-accent-gold/20 text-brand-dark',
    objectives: [
      'Dominio riguroso de ciencias exactas (álgebra, física, química y biología experimental).',
      'Preparación preuniversitaria intensiva con simulacros tipo UNSCH para 4° y 5° de secundaria.',
      'Prácticas científicas vivenciales en los laboratorios centrales de la UNSCH.',
      'Liderazgo juvenil, debate parlamentario escolar y orientación vocacional especializada.',
    ],
    features: [
      'Círculos de estudio de alto rendimiento para el ingreso directo a universidades.',
      'Acceso a convenios con facultades de la UNSCH para prácticas de laboratorio.',
      'Gabinete de orientación vocacional articulado con la Escuela de Psicología UNSCH.',
      'Participación destacada en olimpiadas de matemática, física y ferias científicas nacionales.',
    ],
    curriculum: [
      'Matemática Avanzada: Álgebra, Geometría, Trigonometría',
      'Ciencias Experimentales: Física, Química y Biología',
      'Comunicación, Literatura y Debate',
      'Ciencias Sociales, Economía y Filosofía',
      'Círculo Preuniversitario (4° y 5° año)',
      'Inglés Intermedio y Tecnologías de Información',
      'Tutoría y Proyecto de Vida Profesional',
    ],
    ctaText: 'Postular a Secundaria 2027',
  },
];

export default function NivelesPage() {
  const [activeTab, setActiveTab] = useState('secundaria');
  const selectedLevel = levelsData.find(l => l.id === activeTab) || levelsData[0];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-dark py-20 text-white hero-one">
        <div className="content-width relative z-10">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-accent-cream/80">
            <Link href="/" className="hover:text-accent-gold transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">Niveles Educativos</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <GraduationCap size={14} />
              <span>Educación Básica Regular Completa</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Niveles Educativos del{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Guamán Poma
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Acompañamos el desarrollo de tu hijo con continuidad formativa desde los 3 años en Inicial,
              pasando por Primaria, hasta el egreso preuniversitario en Secundaria con respaldo de la UNSCH.
            </p>
          </div>
        </div>
      </section>

      {/* Level Selector Tabs */}
      <section className="content-width py-16">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {levelsData.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setActiveTab(lvl.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all shadow-sm',
                activeTab === lvl.id
                  ? 'bg-brand text-white shadow-md scale-105 ring-2 ring-brand/20'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-brand-light hover:bg-accent-ivory'
              )}
            >
              <span>{lvl.title}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  activeTab === lvl.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {lvl.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Level Deep Presentation */}
        <motion.div
          key={selectedLevel.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-accent-ivory/30 to-accent-cream/20 p-8 sm:p-12 shadow-elevated"
        >
          {/* Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200/80 pb-8">
            <div>
              <div className="flex items-center gap-3">
                <span className={cn('rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider', selectedLevel.pillBg)}>
                  {selectedLevel.heroTag}
                </span>
                <span className="text-xs font-bold text-gray-500">Rango: {selectedLevel.badge}</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-brand-dark">
                {selectedLevel.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-accent-rouge">
                Responsable de Nivel: {selectedLevel.director}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm text-xs font-bold text-gray-800">
                <Clock size={16} className="text-brand" />
                <span>Horario: {selectedLevel.schedule}</span>
              </div>
              <Link
                href="/admision"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 transition"
              >
                <span>{selectedLevel.ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <p className="mt-6 text-base text-gray-700 leading-relaxed max-w-4xl">
            {selectedLevel.description}
          </p>

          {/* Grid: Objetivos & Infraestructura */}
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Objetivos Pedagógicos */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-brand font-black text-sm uppercase tracking-wider">
                <BookOpen size={18} />
                <span>Objetivos y Competencias Clave</span>
              </div>
              <ul className="mt-4 grid gap-3">
                {selectedLevel.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Características e Infraestructura */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-accent-rouge font-black text-sm uppercase tracking-wider">
                <Sparkles size={18} />
                <span>Espacios y Recursos Exclusivos</span>
              </div>
              <ul className="mt-4 grid gap-3">
                {selectedLevel.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Malla Curricular Destacada */}
          <div className="mt-8 rounded-2xl border border-accent-cream bg-accent-ivory/60 p-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Malla Curricular y Talleres del {selectedLevel.title}:
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedLevel.curriculum.map(curr => (
                <span
                  key={curr}
                  className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-sm"
                >
                  {curr}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid of All 3 Levels for Comparative Overview */}
      <section className="border-t border-gray-200 bg-accent-ivory/50 py-24">
        <div className="content-width">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
              Visión Integral
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
              Los Tres Niveles en Perspectiva
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Un itinerario pedagógico coherente que garantiza la articulación sin fisuras entre etapas escolares.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {levelsData.map(lvl => (
              <div
                key={lvl.id}
                className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent-ivory border border-accent-cream px-3 py-1 text-xs font-black text-brand">
                      {lvl.badge}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 font-mono">
                      {lvl.schedule}
                    </span>
                  </div>
                  <h4 className="mt-4 text-2xl font-black text-brand-dark">{lvl.title}</h4>
                  <p className="mt-1 text-xs font-semibold text-accent-rouge">
                    {lvl.director}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {lvl.description}
                  </p>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-2">
                      Lo más destacado:
                    </p>
                    <ul className="grid gap-2 text-xs text-gray-600">
                      {lvl.features.slice(0, 3).map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-accent-gold shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      setActiveTab(lvl.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand py-3 text-xs font-bold uppercase tracking-wider text-brand hover:bg-brand hover:text-white transition"
                  >
                    <span>Ver Detalles Completos</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
