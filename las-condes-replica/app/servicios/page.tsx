'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Microscope,
  Trophy,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Stethoscope,
  Laptop,
  BookMarked,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Building,
  Calendar,
} from 'lucide-react';

const services = [
  {
    icon: Microscope,
    title: 'Laboratorios Científicos Universitarios',
    category: 'Ciencia & Investigación',
    badge: 'Convenio UNSCH',
    description:
      'Nuestros estudiantes de secundaria acceden a los laboratorios especializados de Biología, Química y Física de la ciudad universitaria de la UNSCH. Aprenden mediante experimentación directa, microscopía y rigor metodológico.',
    features: [
      'Microscopios de alta resolución y reactivos controlados',
      'Prácticas guiadas con docentes e investigadores universitarios',
      'Desarrollo de proyectos para la Feria Escolar Nacional Eureka',
      'Protocolos estrictos de bioseguridad y protección personal',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: Trophy,
    title: '4 Nuevas Losas Deportivas Techadas',
    category: 'Infraestructura 2026',
    badge: 'Inversión S/ 2,000,000',
    description:
      'Complejo polideportivo entregado en 2026 con una inversión de 2 millones de soles por parte de la UNSCH. Cobertura metálica termoacústica curva que protege a más de 800 escolares de la radiación UV y precipitaciones pluviales.',
    features: [
      'Canchas demarcadas para fútbol sala, vóley y básquetbol',
      'Iluminación LED para actividades y talleres extracurriculares',
      'Espacio cívico para desfiles, asambleas y presentaciones culturales',
      'Tribunas seguras y módulos de vestuarios y servicios higiénicos',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: GraduationCap,
    title: 'Círculos Preuniversitarios de Rendimiento',
    category: 'Excelencia Académica',
    badge: '4° y 5° Secundaria',
    description:
      'Programa extracurricular especializado enfocado en el dominio de las materias requeridas para el ingreso directo a las facultades más exigentes de la UNSCH y universidades del país.',
    features: [
      'Simulacros periódicos con estructura y calificación tipo UNSCH',
      'Profundización en Matemática, Física, Química, Razonamiento y Letras',
      'Docentes especialistas en preparación preuniversitaria',
      'Banco de preguntas y balotarios oficiales actualizados',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: HeartHandshake,
    title: 'Departamento Psicopedagógico y Escuela de Familias',
    category: 'Bienestar y Salud Emocional',
    badge: 'Soporte Continuo',
    description:
      'Acompañamiento socioemocional permanente con profesionales en psicología educativa y practicantes preprofesionales de la Facultad de Psicología de la UNSCH, promoviendo un clima escolar armonioso.',
    features: [
      'Evaluaciones de estilo de aprendizaje y despistaje vocacional',
      'Atención personalizada ante dificultades académicas o de conducta',
      'Talleres mensuales de Escuela para Padres de Familia',
      'Prevención activa del acoso escolar y fomento de valores cívicos',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: Laptop,
    title: 'Centro de Cómputo y Robótica Educativa',
    category: 'Tecnología e Innovación',
    badge: 'Aulas Multimedia',
    description:
      'Ambientes equipados con computadoras de última generación, conectividad por fibra óptica y software educativo interactivo para desarrollar el pensamiento computacional desde Primaria.',
    features: [
      'Estaciones de trabajo individuales con acceso filtrado y seguro',
      'Iniciación en kits de robótica educativa y programación básica',
      'Uso de herramientas ofimáticas y plataformas digitales de aprendizaje',
      'Pizarras interactivas en aulas temáticas multimedia',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: Sparkles,
    title: 'Talleres de Arte, Identidad Andina y Música',
    category: 'Cultura y Expresión',
    badge: 'Tradición Ayacuchana',
    description:
      'Fomentamos el orgullo por nuestra herencia ayacuchana mediante talleres de música instrumental, banda escolar sinfónica y elencos de danzas tradicionales que representan al colegio en certámenes regionales.',
    features: [
      'Banda de música oficial de los Planteles de Aplicación',
      'Elenco de danzas folclóricas autóctonas de la región Ayacucho',
      'Talleres de teatro, artes plásticas y retablo ayacuchano',
      'Participación destacada en desfiles y festivales culturales',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: Stethoscope,
    title: 'Tópico de Salud y Odontología Preventiva',
    category: 'Salud y Primeros Auxilios',
    badge: 'Articulación Médica',
    description:
      'Módulo de salud escolar para triaje y primeros auxilios inmediatos ante eventualidades. Convenio con facultades de Ciencias de la Salud de la UNSCH para jornadas periódicas de salud preventiva.',
    features: [
      'Personal de enfermería para atención rápida durante la jornada escolar',
      'Campañas de despistaje odontológico y fluorización semestral',
      'Control de peso, talla y evaluación nutricional de los estudiantes',
      'Botiquín completo y protocolos de evacuación médica coordinados',
    ],
    cols: 'lg:col-span-6',
  },
  {
    icon: BookMarked,
    title: 'Biblioteca Escolar y Repositorio UNSCH',
    category: 'Lectura y Consulta',
    badge: 'Acceso Bibliográfico',
    description:
      'Sala de lectura acogedora con miles de títulos de literatura infantil, juvenil, textos escolares actualizados del MINEDU y acceso al repositorio digital de investigaciones de la universidad.',
    features: [
      'Módulos de estudio silencioso y mesas para trabajos en equipo',
      'Catálogo físico y préstamo supervisado de libros a domicilio',
      'Fomento del Plan Lector institucional en todos los grados',
      'Articulación con los recursos bibliográficos centrales de la UNSCH',
    ],
    cols: 'lg:col-span-6',
  },
];

export default function ServiciosPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-dark py-20 text-white hero-three">
        <div className="content-width relative z-10">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-accent-cream/80">
            <Link href="/" className="hover:text-accent-gold transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">Servicios</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <Building size={14} />
              <span>Infraestructura y Ecosistema Universitario</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Servicios e Infraestructura de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Vanguardia
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Descubre los espacios, laboratorios y programas complementarios que hacen de los Planteles de Aplicación
              Guamán Poma de Ayala un entorno educativo integral de primer nivel en Ayacucho.
            </p>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="content-width py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-gold">
            Ecosistema de Formación
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
            Nuestros 8 Servicios Institucionales
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Diseñados para complementar la formación académica con salud, deporte, ciencia y cultura.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className={`${svc.cols} flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-card hover:border-brand hover:shadow-elevated transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-brand/10 p-4 text-brand">
                      <Icon size={30} />
                    </div>
                    <span className="rounded-full bg-accent-gold/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-dark">
                      {svc.badge}
                    </span>
                  </div>

                  <span className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-accent-rouge">
                    {svc.category}
                  </span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-brand-dark">
                    {svc.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {svc.description}
                  </p>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-2.5">
                      Equipamiento y Beneficios:
                    </p>
                    <ul className="grid gap-2 text-xs text-gray-700">
                      {svc.features.map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-accent-gold shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Acceso incluido para matriculados</span>
                  <ShieldCheck size={18} className="text-brand" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Safety & Protocol Banner */}
      <section className="border-t border-gray-200 bg-accent-ivory/60 py-20">
        <div className="content-width">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="font-extrabold text-brand text-lg">Seguridad y Resguardo</div>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Control de acceso en portería oficial, registro de ingreso y retiro de estudiantes de Inicial y Primaria con fotocheck oficial.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="font-extrabold text-brand text-lg">Protección Solar y UV</div>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Nuevas losas techadas con cobertura que filtra el 100% de la radiación solar directa durante las clases de educación física y recreos.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="font-extrabold text-brand text-lg">Acompañamiento Médico</div>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Tópico activo durante todo el horario escolar para atención de urgencias y canalización con centros de salud de Huamanga.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/admision"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 transition"
            >
              <span>Solicitar Vacante para 2027</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
