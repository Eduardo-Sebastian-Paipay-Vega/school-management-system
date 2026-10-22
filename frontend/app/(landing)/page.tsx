import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Trophy,
  Microscope,
  ArrowRight,
  Quote,
  Calendar,
} from 'lucide-react';
import HeroSection from '@/modules/landing/components/HeroSection';
import StatsSection from '@/modules/landing/components/StatsSection';

const stats = [
  { number: '62+', label: 'Años de Trayectoria', detail: 'Fundado en 1964 en Ayacucho' },
  { number: '800+', label: 'Estudiantes Formándose', detail: 'Comunidad activa en los 3 niveles' },
  { number: '100%', label: 'Respaldo Universitario', detail: 'Vinculación directa con la UNSCH' },
  { number: '4', label: 'Losas Deportivas Techadas', detail: 'Infraestructura 2026 de S/ 2M' },
];

const levelsPreview = [
  {
    id: 'inicial',
    title: 'Nivel Inicial',
    badge: '3, 4 y 5 años',
    director: 'Prof. Alberto Alfredo Palomino Rivera',
    description:
      'Estimulación temprana, desarrollo psicomotriz y juego estructurado en espacios diseñados exclusivamente para la primera infancia con seguridad y calidez.',
    href: '/niveles',
  },
  {
    id: 'primaria',
    title: 'Nivel Primaria',
    badge: '1° a 6° Grado',
    director: 'Plana Docente Especializada UNSCH',
    description:
      'Formación integral en valores éticos, comprensión lectora profunda, pensamiento lógico-matemático y descubrimiento científico.',
    featured: true,
    href: '/niveles',
  },
  {
    id: 'secundaria',
    title: 'Nivel Secundaria',
    badge: '1° a 5° Año',
    director: 'Mg. Yecid Ramírez Chipana',
    description:
      'Pensamiento crítico, ciencias en laboratorios de la UNSCH y preparación preuniversitaria rigurosa para el ingreso directo a la educación superior.',
    href: '/niveles',
  },
];

const homeNews = [
  {
    title: 'Inauguración del moderno techado de 4 losas deportivas con inversión de 2 millones de soles',
    date: 'Septiembre 2026',
    category: 'Infraestructura',
    desc: 'La comunidad guamampomina celebró la entrega del nuevo complejo deportivo techado que protegerá a más de 800 estudiantes.',
  },
  {
    title: 'Planteles de Aplicación conmemoran su 62° Aniversario de vida institucional',
    date: 'Octubre 2026',
    category: 'Institucional',
    desc: 'Con una nutrida agenda académica, deportiva y cultural, autoridades de la UNSCH y directivos rindieron homenaje a más de seis décadas de liderazgo.',
  },
  {
    title: 'Estudiantes de 5° de Secundaria inician prácticas científicas en laboratorios de la UNSCH',
    date: 'Octubre 2026',
    category: 'Académico',
    desc: 'Alumnos del nivel secundario desarrollaron experimentos guiados en los laboratorios de biología y física junto a docentes universitarios.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* SECTION 1: HERO SECTION (Optimized Client Leaf Component) */}
      <HeroSection />

      {/* QUICK STATS BAR (Optimized Client Leaf Component) */}
      <StatsSection stats={stats} />

      {/* SECTION 2: BENTO GRID ¿POR QUÉ ELEGIRNOS? PREVIEW (Server-Rendered + content-visibility) */}
      <section className="content-width py-28 content-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
              Propuesta de Valor Institucional
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl md:text-5xl">
              ¿Por qué elegir el Colegio Guamán Poma?
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Combinamos la disciplina escolar con el rigor científico, metodologías docentes y la
              infraestructura de la universidad más prestigiosa de Ayacucho.
            </p>
          </div>
          <Link
            href="/por-que-elegirnos"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-brand bg-white px-6 py-3.5 text-xs font-black uppercase tracking-wider text-brand hover:bg-brand hover:text-white transition-colors duration-150 shadow-sm active:scale-[0.98]"
          >
            <span>Ver propuesta completa</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Asymmetrical Bento Box */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Card 1: 7 Cols */}
          <div className="card-hover-lift md:col-span-7 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-gradient-to-br from-white via-accent-ivory/40 to-accent-cream/20 p-8 shadow-card hover:border-brand hover:shadow-elevated">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-2xl bg-brand/10 p-4 text-brand">
                  <Building2 size={32} strokeWidth={1.8} />
                </div>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand shadow-sm">
                  Acreditación UNSCH
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-black tracking-tight text-brand-dark">
                Respaldo Académico Universitario
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Plana docente de primer nivel con permanente actualización pedagógica y metodologías de
                investigación científica avaladas directamente por las facultades de la Universidad Nacional
                de San Cristóbal de Huamanga.
              </p>
            </div>
            <div className="mt-8 border-t border-gray-200/70 pt-4 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent-rouge">
                Supervisión y rigor universitario
              </span>
              <ArrowRight size={16} className="text-brand" />
            </div>
          </div>

          {/* Card 2: 5 Cols */}
          <div className="card-hover-lift md:col-span-5 flex flex-col justify-between rounded-3xl border border-accent-gold/40 bg-accent-ivory/70 p-8 shadow-card hover:border-accent-gold hover:shadow-elevated">
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
                alumnos para fútbol, vóley y básquet.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm border border-accent-cream">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Inversión entregada:</span>
                <span className="font-extrabold text-accent-gold">S/ 2,000,000</span>
              </div>
            </div>
          </div>

          {/* Card 3: 6 Cols */}
          <div className="card-hover-lift md:col-span-6 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated">
            <div>
              <div className="inline-flex rounded-2xl bg-brand/10 p-4 text-brand">
                <GraduationCap size={32} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-black tracking-tight text-brand-dark">
                Preparación Pre-Universitaria Intensiva
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Círculos de estudio especializados para 4to y 5to de secundaria con simulacros periódicos tipo
                UNSCH, asegurando altos índices de ingreso a carreras universitarias.
              </p>
            </div>
            <Link
              href="/por-que-elegirnos"
              className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-brand hover:underline"
            >
              <span>Conoce el plan preuniversitario</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: 6 Cols */}
          <div className="card-hover-lift md:col-span-6 flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated">
            <div>
              <div className="inline-flex rounded-2xl bg-accent-ivory p-4 text-brand">
                <Microscope size={32} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-black tracking-tight text-brand-dark">
                Acceso a Laboratorios Universitarios
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Prácticas guiadas en laboratorios reales de química, física y biología molecular de la UNSCH,
                fomentando vocaciones científicas desde el colegio.
              </p>
            </div>
            <Link
              href="/servicios"
              className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-accent-gold hover:underline"
            >
              <span>Ver laboratorios e infraestructura</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: NIVELES EDUCATIVOS PREVIEW (Server-Rendered + content-visibility) */}
      <section className="border-y border-gray-200 bg-accent-ivory/50 py-28 content-auto">
        <div className="content-width">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
                Educación Básica Regular
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
                Nuestros Tres Niveles Formativos
              </h2>
              <p className="mt-2 text-sm text-gray-600 md:text-base">
                Acompañamos el crecimiento de tu hijo desde los 3 años hasta su egreso preuniversitario.
              </p>
            </div>
            <Link
              href="/niveles"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-[0.98] transition-colors duration-150"
            >
              <span>Explorar los 3 niveles</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {levelsPreview.map(lvl => (
              <div
                key={lvl.id}
                className="card-hover-lift flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent-ivory border border-accent-cream px-3 py-1 text-xs font-black text-brand">
                      {lvl.badge}
                    </span>
                    {lvl.featured && (
                      <span className="rounded-full bg-accent-gold/20 px-3 py-1 text-[11px] font-extrabold text-brand-dark">
                        Nivel Troncal
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-brand-dark">{lvl.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-accent-rouge">{lvl.director}</p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{lvl.description}</p>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-5">
                  <Link
                    href="/niveles"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-ivory py-3.5 text-xs font-extrabold uppercase tracking-wider text-brand hover:bg-brand hover:text-white transition-colors duration-150 active:scale-[0.98]"
                  >
                    <span>Ver Currículo y Detalles</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIAL PREVIEW (Server-Rendered + content-visibility) */}
      <section className="content-width py-28 content-auto">
        <div className="rounded-3xl border border-accent-cream bg-gradient-to-br from-white via-accent-ivory to-white p-8 sm:p-12 shadow-card">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-accent-gold font-bold text-xs uppercase tracking-widest">
              <Quote size={20} />
              <span>Orgullo Guamampomino</span>
            </div>
            <blockquote className="mt-4 text-xl sm:text-2xl font-black text-brand-dark leading-snug">
              &ldquo;Estudiar en el Guamán Poma me dio la disciplina y la base científica para ingresar en primer
              puesto a la Facultad de Ingeniería de la UNSCH. Los laboratorios y el rigor de los docentes marcan la diferencia.&rdquo;
            </blockquote>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200/80 pt-4">
              <div>
                <div className="font-extrabold text-brand-dark text-base">Ing. Carlos Mendoza Quispe</div>
                <div className="text-xs text-gray-500">Exalumno Promoción 2018 · Ingeniero Civil UNSCH</div>
              </div>
              <Link
                href="/testimonios"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-brand hover:underline"
              >
                <span>Leer más testimonios</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ADMISION BANNER (Server-Rendered + content-visibility) */}
      <section className="border-t border-gray-200 bg-brand-dark py-20 text-white hero-two content-auto">
        <div className="content-width flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="rounded-full bg-accent-gold/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-accent-gold">
              Convocatoria Oficial
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              Admisión y Matrícula 2027
            </h2>
            <p className="mt-3 text-sm sm:text-base text-accent-cream/90 leading-relaxed">
              Consulta el cuadro de vacantes, cronograma de entrevistas y formaliza la inscripción de tu hijo en
              la institución de mayor renombre académico de Huamanga.
            </p>
          </div>
          <Link
            href="/admision"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-wider text-brand shadow-2xl hover:bg-accent-cream active:scale-[0.98] transition-colors duration-150"
          >
            <span>Ir a Admisión 2027</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* SECTION 6: NOTICIAS PREVIEW (Server-Rendered + content-visibility) */}
      <section className="content-width py-28 content-auto">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
              Actualidad y Vida Escolar
            </p>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
              Últimas Noticias del Colegio
            </h2>
          </div>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-brand hover:underline"
          >
            <span>Ver todas las noticias</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {homeNews.map(item => (
            <article
              key={item.title}
              className="card-hover-lift flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card hover:border-brand hover:shadow-elevated"
            >
              <div className="card-img relative h-48 flex items-center justify-center p-6">
                <Building2 size={72} className="text-brand-dark/20" />
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
                  <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <Link
                    href="/noticias"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand hover:underline"
                  >
                    <span>Leer comunicado completo</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
