'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Quote,
  Star,
  GraduationCap,
  Users,
  Award,
  ChevronRight,
  ArrowRight,
  Heart,
  Building2,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const testimonialsList = [
  {
    id: 1,
    category: 'exalumnos',
    author: 'Ing. Carlos Mendoza Quispe',
    role: 'Exalumno Promoción 2018 · Ingeniero Civil UNSCH',
    badge: '1er Puesto Ingreso UNSCH',
    quote:
      'Estudiar en el Guamán Poma me dio la disciplina y la base científica para ingresar en primer puesto a la Facultad de Ingeniería de Minas y luego trasladarme a Ingeniería Civil en la UNSCH. Los laboratorios y el rigor de los docentes marcan una diferencia abismal frente a otros colegios.',
    year: 'Promoción 2018',
    achievement: 'Especialista en Infraestructura Hidráulica en Ayacucho',
  },
  {
    id: 2,
    category: 'padres',
    author: 'Sra. Marisol Barrientos Morales',
    role: 'Madre de Familia de 4° de Primaria y 3° de Secundaria',
    badge: 'Comité de Familia',
    quote:
      'Como madre de familia, lo que más valoro es la formación en valores, la exigencia académica y las nuevas losas techadas donde mis hijos practican deporte protegidos del sol y la lluvia. Saber que están respaldados por la universidad me da una tranquilidad inmensa.',
    year: 'Familia Guamampomina 8 años',
    achievement: 'Participante activa en Escuela para Padres',
  },
  {
    id: 3,
    category: 'catedraticos',
    author: 'Dra. Elena Vega Prado',
    role: 'Egresada Guamán Poma · Catedrática Universitaria UNSCH',
    badge: 'Doctora en Ciencias Biológicas',
    quote:
      'El colegio de aplicación es un verdadero semillero de talentos científicos en Ayacucho. El vínculo temprano con la universidad despierta en los jóvenes la vocación investigadora. En las aulas universitarias se reconoce de inmediato a los egresados guamampominos por su autonomía.',
    year: 'Promoción 2004',
    achievement: 'Investigadora Renacyt y docente titular UNSCH',
  },
  {
    id: 4,
    category: 'exalumnos',
    author: 'Lic. Fernando Bautista Sulca',
    role: 'Exalumno Promoción 2015 · Economista',
    badge: 'Consultor de Proyectos de Desarrollo',
    quote:
      'Los círculos de estudio en secundaria y los simulacros nos prepararon no solo para rendir un examen de admisión, sino para tolerar la alta demanda de la vida universitaria y laboral. La identidad andina y el respeto a Huamanga se inculcan en cada ceremonia.',
    year: 'Promoción 2015',
    achievement: 'Consultor económico para proyectos de inversión regional',
  },
  {
    id: 5,
    category: 'catedraticos',
    author: 'Prof. Carmen Rosa Palomino',
    role: 'Docente de Comunicación y Literatura · 22 años de docencia',
    badge: 'Maestría en Gestión Educativa',
    quote:
      'Enseñar en los Planteles de Aplicación es un compromiso con la excelencia. Aquí no improvisamos: aplicamos investigaciones pedagógicas de la Facultad de Educación de la UNSCH y formamos estudiantes con pensamiento crítico, capaces de debatir con solvencia y sensibilidad.',
    year: 'Docente Titular',
    achievement: 'Asesora de ganadores regionales en los Juegos Florales',
  },
  {
    id: 6,
    category: 'padres',
    author: 'Ing. Jorge Ludeña Huamán',
    role: 'Padre de Familia de Nivel Inicial (5 años)',
    badge: 'Exalumno y Padre',
    quote:
      'Yo estudié aquí toda mi secundaria y ahora matriculo a mi pequeña en Inicial. Ver la calidez de las profesoras, los juegos seguros y la estimulación que le brindan me confirma que fue la mejor decisión para sus primeros años.',
    year: 'Familia Guamampomina 2026',
    achievement: 'Promotor del proyecto de reciclaje escolar',
  },
];

const metrics = [
  { value: '85%+', label: 'Ingresantes a la Universidad', detail: 'En primera postulación a la UNSCH y del país' },
  { value: '62+', label: 'Años Formando Líderes', detail: 'Tradición y prestigio en Huamanga desde 1964' },
  { value: '100%', label: 'Respaldo Institucional UNSCH', detail: 'Articulación con facultades universitarias' },
  { value: '25+', label: 'Premios Regionales Eureka', detail: 'Excelencia en ciencias y proyectos escolares' },
];

export default function TestimoniosPage() {
  const [filter, setFilter] = useState<'todos' | 'exalumnos' | 'padres' | 'catedraticos'>('todos');
  const [submitted, setSubmitted] = useState(false);
  const [testimonialData, setTestimonialData] = useState({
    nombre: '',
    relacion: 'Exalumno',
    promocion: '',
    mensaje: '',
  });

  const filteredList =
    filter === 'todos'
      ? testimonialsList
      : testimonialsList.filter(t => t.category === filter);

  const handleSubmitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialData.nombre || !testimonialData.mensaje) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-dark py-20 text-white hero-two">
        <div className="content-width relative z-10">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-accent-cream/80">
            <Link href="/" className="hover:text-accent-gold transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">Testimonios</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <Users size={14} />
              <span>Voz de la Comunidad Guamampomina</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Testimonios y{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Casos de Éxito
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Descubre las vivencias de generaciones de estudiantes, padres de familia y catedráticos que han
              hecho de los Planteles de Aplicación el colegio referente de Ayacucho.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="relative z-20 -mt-8 content-width">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-accent-cream bg-white p-6 shadow-xl md:grid-cols-4 md:p-8">
          {metrics.map((m, idx) => (
            <div
              key={m.label}
              className={`p-2 text-center ${
                idx !== metrics.length - 1 ? 'md:border-r md:border-gray-200' : ''
              }`}
            >
              <div className="text-3xl font-black text-brand md:text-4xl">{m.value}</div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-wider text-gray-800">
                {m.label}
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">{m.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Tabs & Testimonials Grid */}
      <section className="content-width py-24">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'todos', label: 'Todos los Testimonios' },
            { id: 'exalumnos', label: 'Egresados y Exalumnos' },
            { id: 'padres', label: 'Padres de Familia' },
            { id: 'catedraticos', label: 'Docentes y Catedráticos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                'rounded-2xl px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all',
                filter === f.id
                  ? 'bg-brand text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-accent-ivory hover:text-brand'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid of Testimonials */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-card hover:border-brand-light transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Quote size={28} className="text-accent-gold opacity-70" />
                  <span className="rounded-full bg-accent-ivory border border-accent-cream px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium leading-relaxed italic text-gray-700">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="font-black text-brand-dark text-base">{item.author}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{item.role}</div>
                <div className="mt-2 text-[11px] font-semibold text-accent-rouge">
                  {item.achievement}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Alumnus Spotlight */}
      <section className="border-y border-gray-200 bg-accent-ivory/50 py-24">
        <div className="content-width">
          <div className="rounded-3xl border border-accent-gold/40 bg-gradient-to-br from-white via-accent-ivory to-white p-8 sm:p-12 shadow-elevated">
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-accent-gold/30 bg-white p-4 shadow-lg">
                  <img
                    src="/emblema-unsch-grabado.png"
                    alt="Emblema UNSCH"
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h3 className="mt-4 text-xl font-black text-brand-dark">Ing. Carlos Mendoza</h3>
                <p className="text-xs font-bold text-accent-rouge">Promoción 2018 · Ingeniero Civil</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-extrabold text-brand">
                  <Award size={13} />
                  <span>1er Puesto Concurso Regional</span>
                </div>
              </div>

              <div className="lg:col-span-8">
                <span className="text-xs font-black uppercase tracking-wider text-accent-gold">
                  Historia Destacada
                </span>
                <h4 className="mt-1 text-2xl sm:text-3xl font-black text-brand-dark">
                  &ldquo;De las aulas del Guamán Poma a liderar grandes obras de ingeniería en Ayacucho&rdquo;
                </h4>
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  Carlos recuerda con nitidez sus primeras prácticas de física experimental en los laboratorios de la
                  UNSCH durante 4° y 5° de secundaria. &ldquo;Esa vivencia me quitó el miedo a la matemática y me enseñó
                  que la ciencia se construye con rigor y perseverancia. Cuando ingresé a la universidad, ya conocía el
                  método de estudio y el ritmo de exigencia académica.&rdquo;
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-gray-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-accent-gold" />
                    <span>Egresado de Secundaria en 2018</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-accent-gold" />
                    <span>Titulado con Honores en la UNSCH</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-accent-gold" />
                    <span>Colegiado CIP Ayacucho</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Testimonial Form Section */}
      <section className="content-width py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-card">
          <div className="text-center">
            <span className="rounded-full bg-accent-gold/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand-dark">
              Tu Historia Cuenta
            </span>
            <h3 className="mt-3 text-2xl font-black text-brand-dark sm:text-3xl">
              ¿Eres parte de nuestra comunidad?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Comparte tu testimonio como egresado, padre de familia o docente para inspirar a las nuevas generaciones.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-2xl bg-utility-success/10 p-8 text-center text-utility-success">
              <CheckCircle2 size={40} className="mx-auto" />
              <h4 className="mt-3 text-lg font-black text-brand-dark">¡Muchas gracias por tu testimonio!</h4>
              <p className="mt-1 text-xs text-gray-600">
                Tu historia será revisada por el equipo de comunicaciones institucionales para su publicación oficial.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 rounded-full bg-brand px-5 py-2 text-xs font-bold text-white uppercase tracking-wider"
              >
                Enviar otro testimonio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTestimonial} className="mt-8 grid gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Ing. Lucía Flores Ramos"
                  value={testimonialData.nombre}
                  onChange={e => setTestimonialData({ ...testimonialData, nombre: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Relación con el Colegio *
                  </label>
                  <select
                    value={testimonialData.relacion}
                    onChange={e => setTestimonialData({ ...testimonialData, relacion: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                  >
                    <option value="Exalumno">Exalumno / Egresado</option>
                    <option value="Padre de Familia">Padre de Familia</option>
                    <option value="Docente">Docente / Catedrático</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Año de Promoción o Grado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Promoción 2016 / 3° Primaria"
                    value={testimonialData.promocion}
                    onChange={e => setTestimonialData({ ...testimonialData, promocion: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Tu Testimonio o Mensaje *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Cuéntanos tu experiencia en los Planteles de Aplicación, qué recuerdas y cómo influyó en tu vida..."
                  value={testimonialData.mensaje}
                  onChange={e => setTestimonialData({ ...testimonialData, mensaje: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 transition"
              >
                <Send size={15} />
                <span>Enviar Testimonio</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
