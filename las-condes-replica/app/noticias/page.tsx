'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Building2,
  Trophy,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Search,
  Tag,
  Share2,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const newsArticles = [
  {
    id: 'losas-2026',
    title: 'Inauguración del moderno complejo de 4 losas deportivas techadas con inversión de 2 millones de soles',
    date: '15 de Septiembre, 2026',
    category: 'Infraestructura',
    badge: 'Obra 2026',
    summary:
      'La comunidad guamampomina celebró la entrega del nuevo complejo deportivo techado que protegerá a más de 800 estudiantes durante sus actividades físicas, cívicas y recreativas con respaldo presupuestal de la UNSCH.',
    fullContent: `Con la presencia del Rector de la Universidad Nacional de San Cristóbal de Huamanga, Dr. Emilio Germán Ramírez Roca, y el Director General del colegio, Mg. Yecid Ramírez Chipana, se inauguró oficialmente la moderna cobertura metálica termoacústica sobre cuatro losas deportivas multifuncionales.

La obra, valorizada en más de 2 millones de soles, resuelve de manera definitiva la exposición prolongada a la radiación ultravioleta que afectaba a niños y jóvenes durante las horas de educación física en Huamanga. Las losas cuentan ahora con demarcación reglamentaria para futsal, básquetbol y vóley, iluminación LED de alta potencia para eventos vespertinos y graderías remodeladas.

"Este proyecto es una muestra tangible del compromiso irrenunciable de nuestra universidad con sus planteles escolares de aplicación", destacó el Rector durante su discurso central.`,
    author: 'Oficina de Imagen y Relaciones Públicas UNSCH',
  },
  {
    id: 'aniversario-62',
    title: 'Planteles de Aplicación conmemoran su 62° Aniversario de vida institucional',
    date: '12 de Octubre, 2026',
    category: 'Institucional',
    badge: 'Efeméride',
    summary:
      'Con una nutrida agenda académica, desfile cívico y sesión solemne en el paraninfo de la UNSCH, directivos, docentes y exalumnos rindieron homenaje a más de seis décadas de liderazgo educativo en Huamanga.',
    fullContent: `Fundado en 1964, el Colegio de Aplicación Guamán Poma de Ayala celebró 62 años al servicio de la niñez y juventud ayacuchana. Las actividades conmemorativas incluyeron concursos de oratoria en quechua y castellano, una feria de ciencias vivencial y el tradicional reencuentro de promociones de exalumnos.

Durante la ceremonia solemne, se entregaron reconocimientos a los docentes con más de 25 años de trayectoria pedagógica ininterrumpida y a los estudiantes que obtuvieron primeros puestos en las olimpiadas de matemática a nivel regional.`,
    author: 'Dirección General de los Planteles',
  },
  {
    id: 'laboratorios-unsch',
    title: 'Estudiantes de 5° de Secundaria inician prácticas científicas en laboratorios de la UNSCH',
    date: '02 de Octubre, 2026',
    category: 'Académico',
    badge: 'Ciencia Viva',
    summary:
      'Alumnos del nivel secundario desarrollaron experimentos guiados en los laboratorios de biología celular y física aplicada junto a docentes investigadores universitarios.',
    fullContent: `En el marco del convenio de articulación temprana entre el colegio y las facultades de la UNSCH, más de 120 alumnos de 4° y 5° de secundaria comenzaron su ciclo de prácticas de laboratorio en la ciudad universitaria.

Guiados por catedráticos de la Facultad de Ciencias Biológicas, los estudiantes realizaron observaciones microscópicas de tejidos vegetales, tinción bacteriana y mediciones físicas experimentales. Esta iniciativa consolida la vocación investigadora de los futuros postulantes a carreras STEM (Ciencia, Tecnología, Ingeniería y Matemáticas).`,
    author: 'Coordinación de Ciencias y Laboratorios',
  },
  {
    id: 'eureka-2026',
    title: 'Delegación del Guamán Poma clasifica a la Etapa Nacional de la Feria Eureka 2026',
    date: '28 de Septiembre, 2026',
    category: 'Académico',
    badge: 'Logro Regional',
    summary:
      'El proyecto de investigación escolar sobre biorremediación de aguas mediante microalgas nativas de Huamanga obtuvo el primer puesto en el certamen regional de CONCYTEC.',
    fullContent: `Las alumnas Nicol Quispe y Ariana Mendoza, de 4to año de secundaria, asesoradas por la profesora de Ciencia y Tecnología, obtuvieron el máximo puntaje en la categoría de Ciencias Ambientales. Su proyecto innovador propone el uso de algas andinas para mitigar la contaminación de afluentes locales, y representará a la región Ayacucho en la final nacional de la Feria Eureka en Lima.`,
    author: 'Departamento de Investigación Escolar',
  },
  {
    id: 'escuela-padres',
    title: 'Escuela de Familias: Taller sobre salud socioemocional y disciplina positiva',
    date: '20 de Septiembre, 2026',
    category: 'Institucional',
    badge: 'Comunidad',
    summary:
      'Más de 300 padres de familia participaron de la jornada formativa organizada junto a especialistas de la Escuela Profesional de Psicología de la UNSCH.',
    fullContent: `La jornada vivencial abordó herramientas prácticas para el acompañamiento emocional en la adolescencia, el manejo de tiempos frente a pantallas digitales y la prevención del estrés académico. Los padres elogiaron el espacio de diálogo horizontal y la orientación individual brindada por los psicólogos asistentes.`,
    author: 'Departamento Psicopedagógico',
  },
  {
    id: 'danza-musica',
    title: 'Banda Sinfónica y Elenco de Danzas brillan en el Encuentro Regional de Identidad',
    date: '05 de Septiembre, 2026',
    category: 'Cultura',
    badge: 'Tradición',
    summary:
      'Los elencos artísticos del colegio ofrecieron una impecable estampa de danza tradicional huamanguina y retablo musical en la Plaza Mayor de Huamanga.',
    fullContent: `Con trajes autóctonos y un repertorio de huaynos y marineras ayacuchanas magistralmente ejecutados por la banda escolar, nuestros estudiantes cautivaron al público en la Semana de la Identidad Cultural. El taller de danzas reafirma el compromiso de la institución con la preservación del patrimonio inmaterial andino.`,
    author: 'Comisión Artística y Cultural',
  },
];

export default function NoticiasPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  const categories = ['Todos', 'Institucional', 'Infraestructura', 'Académico', 'Cultura'];

  const filteredNews = newsArticles.filter(item => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-white">Noticias</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <FileText size={14} />
              <span>Prensa y Actualidad Institucional</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Noticias y{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Comunicados Oficiales
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Mantente al tanto de las actividades académicas, logros estudiantiles, inauguraciones de obras y avisos
              oficiales del Colegio de Aplicación Guamán Poma de Ayala.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search Bar */}
      <section className="border-b border-gray-200 bg-accent-ivory/50 py-6">
        <div className="content-width flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                  selectedCategory === cat
                    ? 'bg-brand text-white shadow-sm font-extrabold'
                    : 'bg-white border border-gray-200 text-gray-700 hover:text-brand hover:border-brand-light'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar noticia o comunicado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-900 outline-none transition focus:border-brand"
            />
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="content-width py-20">
        {filteredNews.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-base font-bold text-gray-500">
              No se encontraron noticias con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-brand hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card hover:border-brand hover:shadow-elevated transition-all"
              >
                {/* Header Graphic / Badge */}
                <div className="card-img relative h-48 overflow-hidden flex items-center justify-center p-6">
                  <div className="absolute inset-0 flex items-center justify-center text-brand-dark/15 transition group-hover:scale-105">
                    <Building2 size={80} />
                  </div>
                  <div className="absolute top-4 left-4 rounded-full border border-accent-cream bg-white/95 px-3 py-1 text-[11px] font-extrabold tracking-wider text-brand shadow">
                    {item.category}
                  </div>
                  <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                    <Calendar size={13} className="text-accent-gold" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-accent-rouge">
                      {item.badge}
                    </span>
                    <h2 className="mt-1 line-clamp-2 text-base sm:text-lg font-black leading-snug text-gray-900 group-hover:text-brand transition">
                      {item.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-gray-600">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setActiveArticle(item)}
                      className="inline-flex w-full items-center justify-between rounded-xl bg-accent-ivory px-4 py-2.5 text-xs font-extrabold text-brand hover:bg-brand hover:text-white transition"
                    >
                      <span>Leer comunicado completo</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Full Article Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-10 shadow-2xl"
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-accent-ivory hover:text-gray-900 transition"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-accent-rouge">
                <span className="rounded-full bg-brand/10 px-3 py-1 font-extrabold text-brand">
                  {activeArticle.category}
                </span>
                <span>·</span>
                <span>{activeArticle.date}</span>
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-black text-brand-dark leading-tight">
                {activeArticle.title}
              </h2>

              <p className="mt-2 text-xs font-semibold text-gray-500">
                Fuente: {activeArticle.author}
              </p>

              <div className="mt-6 border-t border-gray-100 pt-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {activeArticle.fullContent}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  Planteles de Aplicación &ldquo;Guamán Poma de Ayala&rdquo; · UNSCH
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-brand-dark transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
