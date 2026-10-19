'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  ArrowUpRight,
  Check,
  Send,
  Quote,
  Microscope,
  Trophy,
} from 'lucide-react';

// Navigation Items
const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: '¿Por qué elegirnos?', href: '#nosotros' },
  { label: 'Niveles', href: '#niveles' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Admisión 2027', href: '#admision' },
  { label: 'Noticias', href: '#noticias' },
  { label: 'Contacto', href: '#contacto' },
];

const levels = [
  {
    id: 'inicial',
    title: 'Nivel Inicial',
    badge: '3, 4 y 5 años',
    director: 'Prof. Alberto Alfredo Palomino Rivera',
    description:
      'Estimulación temprana, desarrollo psicomotriz y juego libre estructurado en espacios diseñados exclusivamente para la primera infancia con seguridad y calidez.',
    features: [
      'Aulas pedagógicas implementadas con material didáctico moderno',
      'Desarrollo psicomotriz, sensorial y habilidades socioemocionales',
      'Áreas verdes seguras y módulos de recreación infantil protegidos',
      'Acompañamiento psicopedagógico permanente y escuela de padres',
    ],
    cta: 'Conocer Nivel Inicial',
  },
  {
    id: 'primaria',
    title: 'Nivel Primaria',
    badge: '1° a 6° Grado',
    director: 'Plana Docente Especializada UNSCH',
    description:
      'Formación integral basada en valores éticos, comprensión lectora profunda, pensamiento lógico-matemático y descubrimiento científico continuo.',
    features: [
      'Refuerzo en razonamiento matemático y comprensión lectora',
      'Iniciación a las ciencias y robótica educativa',
      'Talleres artísticos, danzas tradicionales y música andina',
      'Deporte formativo en las 4 nuevas losas techadas',
    ],
    cta: 'Conocer Nivel Primaria',
    featured: true,
  },
  {
    id: 'secundaria',
    title: 'Nivel Secundaria',
    badge: '1° a 5° Año',
    director: 'Mg. Yecid Ramírez Chipana',
    description:
      'Pensamiento crítico, ciencias experimentales en laboratorios de la UNSCH y preparación preuniversitaria rigurosa para el ingreso directo a la educación superior.',
    features: [
      'Círculos de estudio y preparación preuniversitaria intensiva (4° y 5°)',
      'Prácticas científicas en los laboratorios de biología, física y química de la UNSCH',
      'Orientación vocacional continua respaldada por la Facultad de Psicología',
      'Liderazgo estudiantil, debate y competencias académicas nacionales',
    ],
    cta: 'Conocer Nivel Secundaria',
  },
];

const stats = [
  { number: '62+', label: 'Años de Trayectoria', detail: 'Fundado en 1964 en Ayacucho' },
  { number: '800+', label: 'Estudiantes Matriculados', detail: 'Comunidad activa y en crecimiento' },
  { number: '100%', label: 'Respaldo Universitario', detail: 'Vinculación directa con la UNSCH' },
  { number: '4', label: 'Losas Deportivas Techadas', detail: 'Infraestructura 2026 de 2M soles' },
];

const testimonials = [
  {
    quote:
      'Estudiar en el Guamán Poma me dio la disciplina y la base científica para ingresar en primer puesto a la Facultad de Ingeniería de la UNSCH. Los laboratorios y el nivel de los docentes marcan la diferencia.',
    author: 'Ing. Carlos Mendoza Quispe',
    role: 'Exalumno Promoción 2018 · Ingeniero Civil UNSCH',
  },
  {
    quote:
      'Como madre de familia, lo que más valoro es la formación en valores, la exigencia académica y las nuevas losas techadas donde mis hijos practican deporte protegidos del sol y la lluvia.',
    author: 'Sra. Marisol Barrientos',
    role: 'Madre de Familia de Primaria y Secundaria',
  },
  {
    quote:
      'El colegio de aplicación es un verdadero semillero de talentos en Ayacucho. El vínculo con la universidad prepara a los jóvenes no solo para postular, sino para sobresalir en su carrera profesional.',
    author: 'Dra. Elena Vega Prado',
    role: 'Egresada Guamán Poma · Catedrática Universitaria',
  },
];

const newsList = [
  {
    title: 'Inauguración del moderno techado de 4 losas deportivas con inversión de 2 millones de soles',
    date: 'Septiembre 2026',
    category: 'Infraestructura',
    desc: 'La comunidad guamanpomina celebró la entrega del nuevo complejo deportivo techado que protegerá a más de 800 estudiantes durante sus actividades físicas y cívicas.',
  },
  {
    title: 'Planteles de Aplicación conmemoran su 62° Aniversario de vida institucional',
    date: 'Octubre 2026',
    category: 'Institucional',
    desc: 'Con una nutrida agenda académica, deportiva y cultural, autoridades de la UNSCH y directivos rindieron homenaje a más de seis décadas de liderazgo educativo en Huamanga.',
  },
  {
    title: 'Estudiantes de 5° de Secundaria inician prácticas científicas en laboratorios de la UNSCH',
    date: 'Octubre 2026',
    category: 'Académico',
    desc: 'Alumnos del nivel secundario desarrollaron experimentos guiados en los laboratorios de microbiología y física aplicada junto a docentes universitarios.',
  },
];

const admissionSteps = [
  {
    step: '01',
    title: 'Solicitud e Inscripción Virtual',
    desc: 'Completa el formulario en línea con los datos del apoderado y el estudiante para reservar la postulación.',
  },
  {
    step: '02',
    title: 'Evaluación y Entrevista Familiar',
    desc: 'Participa en la entrevista psicopedagógica orientativa y evaluación diagnóstica de competencias según el nivel.',
  },
  {
    step: '03',
    title: 'Publicación de Resultados',
    desc: 'Recepción de la carta de vacante y cronograma oficial de matrícula del periodo lectivo.',
  },
  {
    step: '04',
    title: 'Entrega de Expediente y Matrícula',
    desc: 'Presentación de certificados de estudios, ficha SIAGIE y confirmación formal de matrícula en Secretaría.',
  },
];

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('secundaria');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombreApoderado: '',
    telefono: '',
    email: '',
    nivel: 'Secundaria',
    grado: '',
    mensaje: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreApoderado || !formData.telefono) return;
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-brand selection:text-white">
      {/* Top Banner - Institutional Identity */}
      <div className="border-b border-brand-dark bg-brand-dark text-white text-[11px] sm:text-xs">
        <div className="content-width flex min-h-10 flex-wrap items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-2 font-medium text-accent-cream">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-gold" />
            <span>Universidad Nacional de San Cristóbal de Huamanga (UNSCH)</span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/90">Ayacucho, Perú · Cód. MINEDU: 050101</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/80">
            <a
              href="https://www.unsch.edu.pe/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition hover:text-accent-gold"
            >
              <span>Portal UNSCH</span>
              <ArrowUpRight size={12} />
            </a>
            <a href="#admision" className="transition hover:text-accent-gold">
              Admisión 2027
            </a>
            <a href="#contacto" className="transition hover:text-accent-gold">
              Mesa de Partes
            </a>
            <span className="hidden lg:inline font-mono text-[11px] text-accent-gold">
              Telf: (066) 312510
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="content-width flex h-[88px] items-center justify-between gap-4">
          {/* Institution Logo: Engraved Black Version for Stark Contrast on White */}
          <a href="#inicio" className="group flex items-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-md group-hover:border-accent-gold group-hover:shadow-lg transition-colors"
            >
              <img
                src="/emblema-unsch-grabado.png"
                alt="Emblema Heráldico Universitario Grabado - UNSCH"
                width={52}
                height={52}
                className="h-full w-full object-contain filter drop-shadow-sm"
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-rouge">
                <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-extrabold text-brand">UNSCH</span>
                <span className="text-gray-300">·</span>
                <span className="text-accent-gold">Colegio de Aplicación</span>
              </div>
              <h1 className="text-lg font-black leading-tight tracking-[-0.02em] text-brand md:text-xl">
                Guamán Poma de Ayala
              </h1>
              <p className="text-[10.5px] font-medium text-gray-500 line-clamp-1">
                Planteles de Aplicación · Universidad Nacional de San Cristóbal de Huamanga
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[13px] font-bold text-gray-800 transition hover:bg-accent-ivory hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <motion.a
              href="#admision"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-brand-light hover:shadow-lg transition-colors"
            >
              <span>Matrícula 2027</span>
              <ArrowRight size={14} />
            </motion.a>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg border border-gray-300 p-2.5 text-brand transition hover:bg-accent-ivory xl:hidden"
              aria-label="Abrir menú"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenu && (
          <div className="border-t border-gray-200 bg-white px-6 py-4 shadow-xl xl:hidden animate-in fade-in slide-in-from-top-2">
            <div className="grid gap-2">
              {navItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center justify-between rounded-lg py-2.5 text-sm font-bold text-gray-800 hover:text-brand"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </a>
              ))}
              <div className="mt-3 border-t border-gray-100 pt-3">
                <a
                  href="#admision"
                  onClick={() => setMobileMenu(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-center text-sm font-bold text-white shadow"
                >
                  <span>Proceso de Admisión 2027</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* SECTION 1: HERO SECTION */}
      <section
        id="inicio"
        className="relative flex min-h-[580px] items-center overflow-hidden text-white hero-one md:min-h-[660px]"
      >
        <div className="content-width relative z-10 w-full py-20 fade-in">
          <div className="max-w-[740px]">
            {/* Institution Badge with Engraved Logo for Sharp Contrast */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-accent-gold/60 bg-black/55 py-2 pl-2.5 pr-5 backdrop-blur-md shadow-xl"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md">
                <img
                  src="/emblema-unsch-grabado.png"
                  alt="Escudo Oficial UNSCH Grabado"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-[.22em] text-accent-cream">
                62 Años de Excelencia Académica · UNSCH Ayacucho
              </span>
            </motion.div>

            {/* H1 Main Title with Negative Tracking */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-accent-cream/95 md:text-lg"
            >
              Más de 62 años formando líderes e investigadores desde Inicial hasta Secundaria en los{' '}
              <strong className="text-white">Planteles de Aplicación Guamán Poma de Ayala</strong>, 
              adscritos a la histórica{' '}
              <strong className="text-accent-gold">
                Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
              </strong>.
            </motion.p>

            {/* CTAs with Framer Motion spring physics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
            >
              <motion.a
                href="#admision"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-brand shadow-2xl transition hover:bg-accent-cream hover:text-brand-dark"
              >
                <span>Proceso de Admisión 2027</span>
                <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href="#niveles"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-black/35 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 hover:border-white"
              >
                <span>Nuestra Oferta Educativa</span>
                <ChevronDown size={18} />
              </motion.a>
            </motion.div>

            {/* Highlights pill tags */}
            <div className="mt-10 flex flex-wrap items-center gap-4 text-xs font-semibold text-accent-cream/90">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-gold" />
                <span>Ingreso directo y preuniversitaria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-gold" />
                <span>4 Losas deportivas techadas 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-gold" />
                <span>Laboratorios científicos UNSCH</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS BAR */}
      <section className="relative z-20 -mt-10 content-width">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-3 rounded-3xl border border-accent-cream bg-white p-6 shadow-xl md:grid-cols-4 md:p-8"
        >
          {stats.map((item, idx) => (
            <div
              key={item.label}
              className={`p-3 text-center ${
                idx !== stats.length - 1 ? 'md:border-r md:border-gray-200' : ''
              }`}
            >
              <div className="text-3xl font-black tracking-tight text-brand md:text-4xl">{item.number}</div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-wider text-gray-800">
                {item.label}
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">{item.detail}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 2: BENTO GRID ¿POR QUÉ ELEGIRNOS? (ASIMÉTRICO Y EDITORIAL) */}
      <section id="nosotros" className="content-width py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
            Propuesta de Valor Institucional
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl md:text-5xl">
            ¿Por qué elegir el Colegio Guamán Poma de Ayala?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
            Combinamos la disciplina y calidez escolar con el rigor científico, metodologías docentes y la
            infraestructura de la universidad más prestigiosa de Ayacucho.
          </p>
        </div>

        {/* Asymmetrical Bento Box Layout */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Bento Card 1: Dominant Card (7 Cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-gradient-to-br from-white via-accent-ivory/40 to-accent-cream/20 p-8 shadow-card hover:border-brand hover:shadow-elevated transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-2xl bg-brand/10 p-4 text-brand">
                  <Building2 size={32} strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
                    <img
                      src="/emblema-unsch-grabado.png"
                      alt="Sello UNSCH"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand">
                    Acreditación UNSCH
                  </span>
                </div>
              </div>
              <h3 className="mt-6 text-2xl font-black tracking-tight text-brand-dark">
                Respaldo Académico Universitario
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Plana docente de primer nivel con permanente actualización pedagógica y metodologías de
                investigación científica avaladas directamente por las facultades de la Universidad Nacional
                de San Cristóbal de Huamanga. Los estudiantes acceden a tutorías y proyectos de iniciación científica.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-gray-200/70 pt-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent-rouge">
                Supervisión y rigor universitario
              </span>
              <ArrowRight size={16} className="text-brand" />
            </div>
          </motion.div>

          {/* Bento Card 2: Feature Card (5 Cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-accent-gold/40 bg-accent-ivory/70 p-8 shadow-card hover:border-accent-gold hover:shadow-elevated transition-colors"
          >
            <div>
              <div className="inline-flex rounded-2xl bg-accent-gold/20 p-4 text-brand-dark">
                <Trophy size={32} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-2xl font-black tracking-tight text-brand-dark">
                4 Losas Techadas 2026
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Modernización integral de 4 losas polideportivas techadas con un presupuesto de{' '}
                <strong className="text-brand">2 millones de soles</strong>, protegiendo a los más de 800
                alumnos para fútbol, vóley, básquet y eventos cívicos.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm border border-accent-cream">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Inversión institucional:</span>
                <span className="font-extrabold text-accent-gold">S/ 2,000,000</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3: Pre-University Excellence (6 Cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated transition-colors"
          >
            <div>
              <div className="inline-flex rounded-2xl bg-brand/10 p-4 text-brand">
                <GraduationCap size={32} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-black tracking-tight text-brand-dark">
                Preparación Pre-Universitaria Intensiva
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Círculos de estudio especializados para 4to y 5to de secundaria con simulacros periódicos tipo
                UNSCH, asegurando altos índices de ingreso directo a la educación superior.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-brand">
              <span>Camino directo a la vida universitaria</span>
              <ArrowRight size={14} />
            </div>
          </motion.div>

          {/* Bento Card 4: Laboratorios Científicos (6 Cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated transition-colors"
          >
            <div>
              <div className="inline-flex rounded-2xl bg-accent-ivory p-4 text-brand">
                <Microscope size={32} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-black tracking-tight text-brand-dark">
                Acceso a Laboratorios Universitarios
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Prácticas guiadas en laboratorios reales de química, física y biología molecular de la UNSCH,
                fomentando vocaciones científicas tempranas en los alumnos.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-accent-gold">
              <span>Ciencia y experimentación de vanguardia</span>
              <ArrowRight size={14} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: NUESTRA OFERTA EDUCATIVA (NIVELES Y SERVICIOS) */}
      <section id="niveles" className="border-y border-gray-200 bg-accent-ivory/50 py-28">
        <div className="content-width">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
                Niveles de Educación Básica Regular
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
                Nuestra Oferta Educativa Integral
              </h2>
              <p className="mt-2 text-sm text-gray-600 md:text-base">
                Acompañamos el crecimiento de tu hijo en cada etapa formativa, desde los 3 años hasta su egreso escolar.
              </p>
            </div>

            {/* Level selection tabs */}
            <div className="flex rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
              {levels.map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    selectedLevel === lvl.id
                      ? 'bg-brand text-white shadow-md'
                      : 'text-gray-700 hover:text-brand'
                  )}
                >
                  {lvl.title.replace('Nivel ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Cards for Levels */}
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {levels.map(level => {
              const isActive = selectedLevel === level.id;
              return (
                <motion.div
                  key={level.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'flex flex-col justify-between rounded-3xl border bg-white p-8 transition-all',
                    isActive
                      ? 'border-brand ring-2 ring-brand/10 shadow-elevated scale-[1.01]'
                      : 'border-gray-200 shadow-card hover:border-brand-light'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-accent-ivory border border-accent-cream px-3 py-1 text-xs font-black text-brand">
                        {level.badge}
                      </span>
                      {level.featured && (
                        <span className="rounded-full bg-accent-gold/20 px-3 py-1 text-[11px] font-extrabold text-brand-dark">
                          Nivel Troncal
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-brand-dark">{level.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-accent-rouge">
                      Responsable: {level.director}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">{level.description}</p>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-gray-800">
                        Puntos clave del currículo:
                      </p>
                      <ul className="grid gap-2.5">
                        {level.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent-gold" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <motion.a
                      href="#admision"
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-dark shadow-sm"
                    >
                      <span>{level.cta}</span>
                      <ArrowRight size={15} />
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Complementary Services Section */}
          <div id="servicios" className="mt-28">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
                Servicios Universitarios Complementarios
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-brand-dark sm:text-3xl">
                Beneficios y Servicios de Valor Añadido
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Todo el ecosistema de la Universidad Nacional de San Cristóbal de Huamanga al servicio del
                desarrollo intelectual, físico y emocional de los alumnos.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Laboratorios Universitarios',
                  category: 'Académico',
                  icon: Microscope,
                  desc: 'Acceso directo a laboratorios científicos de química, física y biología, así como a centros de cómputo de la UNSCH.',
                },
                {
                  title: '4 Nuevas Losas Techadas',
                  category: 'Infraestructura',
                  icon: Trophy,
                  desc: 'Complejo deportivo modernizado y techado en 2026 con una inversión de 2 millones de soles para fútbol, vóley y básquet.',
                },
                {
                  title: 'Preparación Pre-Universitaria',
                  category: 'Excelencia',
                  icon: GraduationCap,
                  desc: 'Círculos de estudio dirigidos para 4to y 5to de secundaria con simulacros tipo UNSCH y alto índice de ingreso directo.',
                },
                {
                  title: 'Psicología y Tutoría Integral',
                  category: 'Bienestar',
                  icon: HeartHandshake,
                  desc: 'Atención personalizada y orientación vocacional con el respaldo especializado de la Facultad de Psicología de la UNSCH.',
                },
                {
                  title: 'Arte e Identidad Andina',
                  category: 'Cultura',
                  icon: Sparkles,
                  desc: 'Talleres de danzas folclóricas ayacuchanas, teatro, música tradicional y preservación del patrimonio histórico de Huamanga.',
                },
                {
                  title: 'Tópico de Salud y Odontología',
                  category: 'Salud',
                  icon: Stethoscope,
                  desc: 'Evaluaciones preventivas de salud y atención primaria en articulación con las facultades de Ciencias de la Salud de la UNSCH.',
                },
              ].map(svc => {
                const IconComponent = svc.icon;
                return (
                  <motion.div
                    key={svc.title}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="group rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm hover:border-accent-gold hover:shadow-card transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-accent-ivory p-3.5 text-brand transition group-hover:bg-brand group-hover:text-white">
                        <IconComponent size={24} />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent-rouge">
                        {svc.category}
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold text-gray-900 group-hover:text-brand">
                      {svc.title}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">{svc.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIOS Y CASOS DE ÉXITO */}
      <section id="testimonios" className="content-width py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
            Comunidad Guamampomina
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
            Testimonios y Casos de Éxito
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
            Historias reales de exalumnos y familias que eligieron la formación integral y exigencia de los
            Planteles de Aplicación de la UNSCH.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map(item => (
            <motion.div
              key={item.author}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-card hover:border-brand-light transition-colors"
            >
              <div>
                <Quote size={32} className="text-accent-gold opacity-60" />
                <p className="mt-4 text-sm font-medium leading-relaxed italic text-gray-700">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
              <div className="mt-8 border-t border-gray-100 pt-4">
                <div className="font-extrabold text-brand-dark">{item.author}</div>
                <div className="text-xs text-gray-500">{item.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5: PROCESO DE ADMISIÓN / MATRÍCULA Y FORMULARIO */}
      <section id="admision" className="border-t border-gray-200 bg-accent-ivory py-28">
        <div className="content-width">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left Column: Steps */}
            <div className="lg:col-span-5">
              <span className="rounded-full bg-accent-gold/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand-dark">
                Admisión y Matrícula 2027
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
                ¿Cómo postular al Colegio Guamán Poma?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Sigue estos cuatro sencillos pasos para asegurar una vacante en Inicial, Primaria o
                Secundaria. Nuestro equipo de admisión te guiará durante todo el proceso.
              </p>

              <div className="mt-8 grid gap-6">
                {admissionSteps.map(st => (
                  <div key={st.step} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-sm font-black text-white shadow-sm">
                      {st.step}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{st.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sello Oficial con Versión Grabada del Emblema */}
              <div className="mt-8 flex items-center gap-4 rounded-3xl border border-accent-cream bg-white p-5 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-accent-ivory/50 p-1.5">
                  <img
                    src="/emblema-unsch-grabado.png"
                    alt="Sello Institucional Grabado"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-accent-rouge">
                    Garantía Institucional
                  </p>
                  <p className="text-sm font-black text-brand-dark">
                    Vacantes Oficiales 2027 · R.R. N° 050101
                  </p>
                  <p className="text-xs text-gray-500">Consultas: (066) 312510</p>
                </div>
              </div>
            </div>

            {/* Right Column: Lead Gen Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-accent-cream bg-white p-8 shadow-elevated md:p-10">
                <div className="border-b border-gray-100 pb-5">
                  <h3 className="text-2xl font-black tracking-tight text-brand-dark">
                    Solicita Información de Matrícula
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Regístrate para recibir el prospecto de admisión, cronograma y vacantes disponibles.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="py-12 text-center fade-in">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-utility-success/15 text-utility-success">
                      <Check size={36} />
                    </div>
                    <h4 className="mt-4 text-xl font-black text-brand-dark">
                      ¡Solicitud Registrada con Éxito!
                    </h4>
                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                      Muchas gracias, <strong>{formData.nombreApoderado}</strong>. Nos pondremos en
                      contacto al número <strong>{formData.telefono}</strong> con los detalles del proceso de
                      admisión para <strong>Nivel {formData.nivel}</strong>.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Nombre Completo del Apoderado *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Juan Pérez Huamán"
                        value={formData.nombreApoderado}
                        onChange={e => setFormData({ ...formData, nombreApoderado: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          required
                          type="tel"
                          placeholder="Ej. 966 123 456"
                          value={formData.telefono}
                          onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          placeholder="apoderado@correo.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Nivel Educativo de Interés *
                        </label>
                        <select
                          value={formData.nivel}
                          onChange={e => setFormData({ ...formData, nivel: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        >
                          <option value="Inicial">Nivel Inicial (3, 4 y 5 años)</option>
                          <option value="Primaria">Nivel Primaria (1° a 6° grado)</option>
                          <option value="Secundaria">Nivel Secundaria (1° a 5° año)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Grado o Edad del Postulante
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 1er Grado / 4 años"
                          value={formData.grado}
                          onChange={e => setFormData({ ...formData, grado: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Mensaje o Consulta Adicional
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Escribe aquí si tienes consultas sobre vacantes, traslados o requisitos especiales..."
                        value={formData.mensaje}
                        onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-brand-dark hover:shadow-lg transition-colors"
                    >
                      <Send size={16} />
                      <span>Enviar Datos y Solicitar Información</span>
                    </motion.button>
                    <p className="text-center text-[11px] text-gray-400">
                      Tus datos son tratados con estricta confidencialidad para fines informativos escolares.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: NOTICIAS / ACTUALIDAD */}
      <section id="noticias" className="content-width py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
              Actualidad y Vida Escolar
            </p>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
              Noticias del Guamán Poma
            </h2>
          </div>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-brand hover:text-brand-light transition"
          >
            <span>Ver comunicados oficiales</span>
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {newsList.map(item => (
            <motion.article
              key={item.title}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card hover:border-brand hover:shadow-elevated transition-colors"
            >
              <div className="card-img relative h-52 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-brand-dark/20 transition group-hover:scale-105">
                  <Building2 size={88} />
                </div>
                <div className="absolute top-4 left-4 rounded-full border border-accent-cream bg-white/95 px-3 py-1 text-[11px] font-extrabold tracking-wider text-brand shadow">
                  {item.category}
                </div>
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  <Calendar size={13} className="text-accent-gold" />
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-gray-900 group-hover:text-brand transition">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-brand">
                  <span>Leer comunicado</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* SECTION 7: FOOTER & CONTACT (UBICACIÓN, MAPA, AUTORIDADES) */}
      <footer id="contacto" className="border-t-4 border-brand bg-brand-dark text-white">
        <div className="content-width grid gap-12 py-20 lg:grid-cols-12">
          {/* Col 1: Identity & Authorities with Engraved Logo on White Emblem Container */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-accent-gold/40 bg-white p-2 shadow-lg">
                <img
                  src="/emblema-unsch-grabado.png"
                  alt="Emblema Heráldico Grabado de la UNSCH"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">
                  UNSCH · Fundada en 1677 · Ayacucho
                </span>
                <h3 className="text-xl font-black text-white">Guamán Poma de Ayala</h3>
                <p className="text-xs text-accent-cream/80">Planteles de Aplicación de la UNSCH</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-gray-300">
              Institución educativa pública de gestión directa adscrita a la Universidad Nacional de San
              Cristóbal de Huamanga. Formación integral para los líderes y profesionales del mañana.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
              <p className="font-extrabold text-accent-gold">Autoridades Institucionales:</p>
              <p className="mt-1 text-gray-200">
                <strong>Director General:</strong> Mg. Yecid Ramírez Chipana
              </p>
              <p className="mt-0.5 text-gray-200">
                <strong>Rector de la UNSCH:</strong> Dr. Emilio Germán Ramírez Roca
              </p>
              <div className="mt-2 flex gap-4 text-[11px] text-accent-cream/70 font-mono">
                <span>Cód. Geográfico: 050101</span>
                <span>Cód. Local: 073968</span>
              </div>
            </div>
          </div>

          {/* Col 2: Direct Contact & Location */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-accent-gold">
              Sede y Canales Oficiales
            </h4>
            <div className="mt-4 grid gap-3.5 text-xs text-gray-200">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent-gold" />
                <div>
                  <strong className="text-white">Dirección Oficial:</strong>
                  <p>Pasaje San Joaquín 101, Ayacucho, Perú.</p>
                  <p className="text-[11px] text-gray-400">Ref: Av. Universitaria / Pasaje Huamán Poma S/N</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-accent-gold" />
                <div>
                  <strong className="text-white">Teléfono de Sede:</strong>
                  <p>(066) 312510 / Central UNSCH: (066) 322510</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-accent-gold" />
                <div>
                  <strong className="text-white">Correo Institucional:</strong>
                  <p>admision@guamanpoma-unsch.edu.pe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-accent-gold" />
                <div>
                  <strong className="text-white">Horario de Atención:</strong>
                  <p>Lunes a Viernes: 8:00 AM - 1:00 PM / 2:30 PM - 5:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Col 3: Map & Legal */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-accent-gold">
              Ubicación en el Mapa
            </h4>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <iframe
                title="Ubicación Colegio Guamán Poma UNSCH"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.22858178822!2d-74.22591!3d-13.15041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91127df9c8b7db2d%3A0x7d6a5c2d3ef0824!2sUniversidad%20Nacional%20de%20San%20Crist%C3%B3bal%20de%20Huamanga!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
                className="h-36 w-full border-0 opacity-80 transition hover:opacity-100"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs text-accent-cream/80">
              <a
                href="https://goo.gl/maps/ayacucho"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white"
              >
                <span>Abrir en Google Maps</span>
                <ArrowUpRight size={13} className="text-accent-gold" />
              </a>
              <a href="#inicio" className="hover:text-white">
                Libro de Reclamaciones (Normativa MINEDU)
              </a>
              <a href="#inicio" className="hover:text-white">
                Términos y Políticas de Privacidad
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 py-5">
          <div className="content-width flex flex-col items-center justify-between gap-2 text-center text-xs text-accent-cream/60 sm:flex-row sm:text-left">
            <p>
              © 2026 Planteles de Aplicación &ldquo;Guamán Poma de Ayala&rdquo; · Universidad Nacional de San
              Cristóbal de Huamanga. Todos los derechos reservados.
            </p>
            <p className="font-mono text-[11px] text-accent-gold">
              Huamanga, Ayacucho · Perú
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
