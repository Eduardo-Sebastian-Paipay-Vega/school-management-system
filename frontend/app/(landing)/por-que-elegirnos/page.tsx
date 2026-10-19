'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Trophy,
  GraduationCap,
  Microscope,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Compass,
  Award,
  ChevronRight,
  School,
  Clock,
} from 'lucide-react';

const reasons = [
  {
    icon: Building2,
    tag: 'Acreditación Universitaria',
    title: 'Respaldo Académico UNSCH',
    description:
      'Somos la institución educativa oficial de la Universidad Nacional de San Cristóbal de Huamanga. Nuestra plana docente se capacita con las facultades de Ciencias de la Educación, garantizando metodologías de vanguardia y rigor formativo.',
    highlights: ['Docentes con posgrados y certificación', 'Articulación directa con planes universitarios', 'Supervisión constante de calidad pedagógica'],
    cols: 'md:col-span-7',
    gradient: 'from-white via-accent-ivory/40 to-accent-cream/20',
  },
  {
    icon: Trophy,
    tag: 'Infraestructura 2026',
    title: '4 Nuevas Losas Techadas',
    description:
      'Inversión histórica de más de 2 millones de soles entregada en 2026. Espacios protegidos con cobertura metálica contra la radiación solar y lluvias torrenciales para más de 800 escolares.',
    highlights: ['Canchas para fútbol, vóley y básquet', 'Espacio para ceremonias cívicas y danzas', 'Inversión oficial de S/ 2,000,000'],
    cols: 'md:col-span-5',
    gradient: 'from-accent-ivory/70 via-white to-accent-cream/30',
  },
  {
    icon: Microscope,
    tag: 'Ciencia Experimental',
    title: 'Acceso a Laboratorios Universitarios',
    description:
      'Nuestros alumnos de secundaria no aprenden ciencia en fotocopias: realizan prácticas de laboratorio guiadas en los pabellones de química, física y biología de la ciudad universitaria de la UNSCH.',
    highlights: ['Microscopía y biología celular', 'Experimentos prácticos de química inorgánica', 'Iniciación temprana en el método científico'],
    cols: 'md:col-span-6',
    gradient: 'from-white to-accent-ivory/40',
  },
  {
    icon: GraduationCap,
    tag: 'Ingreso Superior',
    title: 'Preparación Preuniversitaria Intensiva',
    description:
      'Para los estudiantes de 4to y 5to de secundaria, ofrecemos círculos de estudio de alto rendimiento con simulacros periódicos tipo UNSCH. Máximo índice de ingresantes en carreras de Ciencias, Ingeniería y Humanidades.',
    highlights: ['Simulacros periódicos tipo examen UNSCH', 'Círculos de estudio en horarios complementarios', 'Alta tasa de ingreso en primera postulación'],
    cols: 'md:col-span-6',
    gradient: 'from-white to-accent-cream/20',
  },
  {
    icon: Users,
    tag: 'Acompañamiento Integral',
    title: 'Tutoría y Soporte Psicopedagógico',
    description:
      'Cada estudiante recibe orientación vocacional y seguimiento socioemocional individualizado, en articulación con la Escuela Profesional de Psicología de la UNSCH.',
    highlights: ['Evaluaciones psicopedagógicas periódicas', 'Orientación vocacional para 3°, 4° y 5° de secundaria', 'Escuela activa para padres de familia'],
    cols: 'md:col-span-6',
    gradient: 'from-white to-accent-ivory/40',
  },
  {
    icon: Sparkles,
    tag: 'Identidad y Valores',
    title: 'Cultura, Deporte y Formación Ética',
    description:
      'Honramos la memoria del cronista Felipe Guamán Poma de Ayala. Fomentamos el civismo, el respeto ambiental, la oratoria en quechua y castellano, y las expresiones artísticas ayacuchanas.',
    highlights: ['Talleres de danzas tradicionales y música', 'Torneos deportivos intercolegiales', 'Liderazgo escolar y oratoria'],
    cols: 'md:col-span-6',
    gradient: 'from-accent-ivory/60 via-white to-white',
  },
];

const timeline = [
  {
    year: '1964',
    title: 'Fundación Institucional',
    desc: 'Nace como centro de aplicación experimental pedagógica bajo el patrocinio de la UNSCH en el corazón de Huamanga.',
  },
  {
    year: '1985',
    title: 'Expansión de Niveles',
    desc: 'Se consolida la oferta formativa continua que abarca los tres niveles: Inicial, Primaria y Secundaria de Menores.',
  },
  {
    year: '2012',
    title: 'Integración en Laboratorios',
    desc: 'Se firma el convenio para que estudiantes de secundaria realicen prácticas científicas en los laboratorios centrales de la UNSCH.',
  },
  {
    year: '2026',
    title: 'Modernización Histórica',
    desc: 'Inauguración del moderno complejo deportivo con 4 losas techadas de S/ 2M y digitalización de aulas multimedia.',
  },
];

const comparison = [
  {
    feature: 'Respaldo universitario directo',
    guaman: '100% articulado con la UNSCH',
    others: 'Sin vínculo con educación superior',
  },
  {
    feature: 'Prácticas científicas en laboratorios',
    guaman: 'Laboratorios universitarios reales',
    others: 'Kits básicos o solo teoría',
  },
  {
    feature: 'Complejo deportivo techado 2026',
    guaman: '4 Losas techadas de 2 millones de soles',
    others: 'Patios expuestos a radiación o 1 losa',
  },
  {
    feature: 'Preparación para el ingreso a la UNSCH',
    guaman: 'Círculos intensivos y simulacros oficiales',
    others: 'Requiere academia externa',
  },
  {
    feature: 'Acompañamiento psicopedagógico',
    guaman: 'Permanente con apoyo de Psicología UNSCH',
    others: 'Esporádico o limitado',
  },
];

export default function PorQueElegirnosPage() {
  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-brand-dark py-20 text-white hero-two">
        <div className="content-width relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-accent-cream/80">
            <Link href="/" className="hover:text-accent-gold transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">¿Por qué elegirnos?</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <School size={14} />
              <span>Propuesta de Valor Oficial · UNSCH</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              ¿Por qué elegir el Colegio{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Guamán Poma de Ayala?
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Combinamos más de 62 años de tradición educativa con el rigor científico, metodologías activas y la
              infraestructura de la universidad más emblemática de Ayacucho.
            </p>
          </div>
        </div>
      </section>

      {/* Main Asymmetrical Bento Grid */}
      <section className="content-width py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
            Pilares de Excelencia
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
            Nuestros 6 Pilares Institucionales
          </h2>
          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            Cada aspecto formativo ha sido concebido para brindar a nuestros alumnos ventajas académicas y personales reales.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className={`${r.cols} flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-gradient-to-br ${r.gradient} p-8 shadow-card hover:border-brand hover:shadow-elevated transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-brand/10 p-3.5 text-brand">
                      <Icon size={28} />
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-accent-rouge shadow-sm">
                      {r.tag}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl sm:text-2xl font-black tracking-tight text-brand-dark">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {r.description}
                  </p>
                </div>

                <div className="mt-8 border-t border-gray-200/60 pt-4">
                  <ul className="grid gap-2">
                    {r.highlights.map(h => (
                      <li key={h} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <CheckCircle2 size={14} className="shrink-0 text-accent-gold" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Timeline Section: 62 Years of History */}
      <section className="border-y border-gray-200 bg-accent-ivory/60 py-24">
        <div className="content-width">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
              Legado y Trayectoria
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
              62 Años Marcando el Rumbro Educativo
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Desde 1964, los Planteles de Aplicación han sido cuna de ilustres profesionales, docentes e investigadores ayacuchanos.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, idx) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-brand-light transition"
              >
                <div className="font-mono text-3xl font-black text-brand">{item.year}</div>
                <h4 className="mt-2 text-base font-extrabold text-gray-900">{item.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Guamán Poma vs Otros */}
      <section className="content-width py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
            Diferenciador Claro
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
            ¿Qué nos hace únicos frente a otros colegios?
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Una comparativa objetiva de lo que significa contar con el respaldo de la UNSCH.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand text-white">
                <tr>
                  <th className="py-4 px-6 font-extrabold uppercase tracking-wider text-xs">Criterio Formativo</th>
                  <th className="py-4 px-6 font-extrabold uppercase tracking-wider text-xs bg-brand-dark text-accent-gold">
                    Planteles Guamán Poma (UNSCH)
                  </th>
                  <th className="py-4 px-6 font-extrabold uppercase tracking-wider text-xs">
                    Colegios Convencionales
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-white' : 'bg-accent-ivory/30'}>
                    <td className="py-4 px-6 font-bold text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 font-extrabold text-brand bg-accent-gold/5 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-accent-gold shrink-0" />
                      <span>{row.guaman}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-brand-dark via-brand to-brand-light p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="rounded-full bg-accent-gold/20 px-3 py-1 text-xs font-bold text-accent-gold uppercase tracking-wider">
              Convocatoria Oficial
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black">
              ¿Listo para dar a tu hijo una formación universitaria?
            </h3>
            <p className="mt-1 text-sm text-accent-cream/90 max-w-xl">
              Conoce las vacantes oficiales para Inicial, Primaria y Secundaria en el proceso de Admisión 2027.
            </p>
          </div>
          <Link
            href="/admision"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-wider text-brand shadow-lg hover:bg-accent-cream active:scale-95 transition"
          >
            <span>Ver Admisión 2027</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
