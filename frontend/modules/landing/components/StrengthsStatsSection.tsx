'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import BbdButton from './BbdButton';

interface SectorStat {
  title: string;
  tags: string[];
  metric1Label: string;
  metric1Value: string;
  metric1Width: string;
  metric2Label: string;
  metric2Value: string;
  metric2Width: string;
  bigNumber: string;
  bigLabel: string;
}

const orangeSectors: SectorStat[] = [
  {
    title: 'CIENCIAS EXPERIMENTALES Y LABORATORIOS',
    tags: [
      'Biología',
      'Química',
      'Física',
      'Microscopía',
      'Método Científico',
      'UNSCH',
    ],
    metric1Label: 'Estudiantes',
    metric1Value: '820',
    metric1Width: '54%',
    metric2Label: 'Prácticas Anuales',
    metric2Value: '140',
    metric2Width: '18%',
    bigNumber: '62',
    bigLabel: 'Años de trayectoria académica',
  },
  {
    title: 'RAZONAMIENTO MATEMÁTICO Y LÓGICA',
    tags: [
      'Álgebra',
      'Geometría',
      'Estadística',
      'Olimpiadas',
      'Círculos de Estudio',
      'Pre-UNSCH',
      'Resolución',
    ],
    metric1Label: 'Estudiantes',
    metric1Value: '850',
    metric1Width: '82%',
    metric2Label: 'Sesiones Refuerzo',
    metric2Value: '320',
    metric2Width: '28%',
    bigNumber: '100%',
    bigLabel: 'Respaldo universitario UNSCH',
  },
  {
    title: 'COMUNICACIÓN, LECTURA Y HUMANIDADES',
    tags: ['Plan Lector', 'Oratoria y Debate', 'Historia del Perú'],
    metric1Label: 'Estudiantes',
    metric1Value: '840',
    metric1Width: '75%',
    metric2Label: 'Obras Leídas',
    metric2Value: '480',
    metric2Width: '54%',
    bigNumber: '3',
    bigLabel: 'Niveles educativos integrados',
  },
];

const pinkSectors: SectorStat[] = [
  {
    title: 'TECNOLOGÍA DIGITAL E INTRANET',
    tags: [
      'Carné QR',
      'Modo Excel CNEB',
      'Analítica 360°',
      'Libreta PDF SHA-256',
      'Robótica',
    ],
    metric1Label: 'Usuarios Activos',
    metric1Value: '1,250',
    metric1Width: '45%',
    metric2Label: 'Aulas Conectadas',
    metric2Value: '28',
    metric2Width: '16%',
    bigNumber: '89',
    bigLabel: 'Requisitos funcionales SSU',
  },
  {
    title: 'CULTURA, ARTE E IDENTIDAD ANDINA',
    tags: [
      'Danzas Tradicionales',
      'Música Ayacuchana',
      'Artes Plásticas',
      'Teatro Escolar',
    ],
    metric1Label: 'Participantes',
    metric1Value: '640',
    metric1Width: '48%',
    metric2Label: 'Elencos y Talleres',
    metric2Value: '18',
    metric2Width: '24%',
    bigNumber: '24',
    bigLabel: 'Eventos culturales al año',
  },
];

const greenSectors: SectorStat[] = [
  {
    title: 'COMPLEJO POLIDEPORTIVO TECHADO',
    tags: ['Fútbol', 'Vóley', 'Básquet', 'Atletismo Escolar'],
    metric1Label: 'Deportistas',
    metric1Value: '800+',
    metric1Width: '78%',
    metric2Label: 'Torneos Internos',
    metric2Value: '16',
    metric2Width: '14%',
    bigNumber: '4',
    bigLabel: 'Losas deportivas techadas 2026',
  },
  {
    title: 'BIENESTAR Y PSICOPEDAGOGÍA',
    tags: ['Tutoría Permanente & Escuela de Padres'],
    metric1Label: 'Atenciones',
    metric1Value: '450',
    metric1Width: '22%',
    metric2Label: 'Talleres Familiares',
    metric2Value: '36',
    metric2Width: '10%',
    bigNumber: '12',
    bigLabel: 'Programas de acompañamiento',
  },
  {
    title: 'PROYECCIÓN E INGRESO UNIVERSITARIO',
    tags: [
      'Simulacros Tipo UNSCH',
      'Orientación Vocacional',
      'Semilleros',
      'Liderazgo',
    ],
    metric1Label: 'Egresados Destacados',
    metric1Value: '1,500+',
    metric1Width: '84%',
    metric2Label: 'Facultades Vinculadas',
    metric2Value: '9',
    metric2Width: '18%',
    bigNumber: '95%',
    bigLabel: 'Vocación de educación superior',
  },
];

export default function StrengthsStatsSection() {
  const [bgColor, setBgColor] = useState('#FFF0E5');
  const [videoPlaying, setVideoPlaying] = useState(false);

  const orangeRef = useRef<HTMLElement | null>(null);
  const pinkRef = useRef<HTMLElement | null>(null);
  const greenRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sections = [
      { el: orangeRef.current, color: '#FFF0E5' },
      { el: pinkRef.current, color: '#FFF0F2' },
      { el: greenRef.current, color: '#EAF8EE' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.el === entry.target);
            if (match) {
              setBgColor(match.color);
            }
          }
        });
      },
      { root: null, threshold: 0.35 }
    );

    sections.forEach((s) => {
      if (s.el) observer.observe(s.el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="relative w-full transition-colors duration-700 ease-out"
    >
      {/* Top Soft Gradient Transition from Paper (#FFFCF8) */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-24 w-full bg-gradient-to-b from-[#FFFCF8] to-transparent"
      />

      {/* SUBSECTION 1: ORANGE STATS (.stats-orange) */}
      <section ref={orangeRef} className="w-full">
        <div className="bbd-padding-global">
          <div className="mx-auto w-full max-w-[1297px] py-12">
            {/* Equal 2-Column Section Heading (.section-heading-wrap.is--equal) */}
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-[128px]">
              <div className="flex flex-col items-start gap-6">
                <div className="bbd-eyebrow bg-[#FFF0E5] border border-[#FBC18F] text-[#54230C]">
                  <span>Áreas prioritarias</span>
                </div>
                <h2 className="bbd-h2 text-[#3A0008]">
                  NUESTRAS
                  <br />
                  FORTALEZAS
                </h2>
              </div>

              <p className="bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-[rgba(41,23,25,0.8)]">
                Nuestra institución cuenta con fortalezas académicas consolidadas, áreas científicas con potencial inmediato y programas formativos que benefician a cientos de familias en Ayacucho. El objetivo es transformar este potencial en liderazgo educativo de largo plazo.
              </p>
            </div>

            {/* Orange Group (.stats-inner-wrap.text-color-orange) */}
            <div className="mt-16 lg:mt-24 flex flex-col gap-12 text-[#803711]">
              <h3 className="bbd-font-display text-[28px] sm:text-[32px] leading-[32px] text-[#803711]">
                IMPULSANDO LA BASE ACADÉMICA Y CIENTÍFICA
              </h3>

              {orangeSectors.map((sector) => (
                <div key={sector.title} className="flex flex-col gap-12">
                  <div className="h-[1px] w-full bg-[#803711]/35" />
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr_234px] lg:gap-16">
                    {/* Left: Title + Eyebrow Pills */}
                    <div className="flex h-full flex-col justify-between gap-8 lg:gap-14">
                      <h4 className="bbd-font-display text-[26px] sm:text-[32px] leading-[1.35] text-[#803711]">
                        {sector.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {sector.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bbd-eyebrow bg-[#ED7B32] text-[#FFF0E5]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Middle: Horizontal Pill Bars */}
                    <div className="flex flex-col justify-between gap-8">
                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#803711]">
                          {sector.metric1Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric1Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#FBC18F] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#803711]">
                            {sector.metric1Value}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#803711]">
                          {sector.metric2Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric2Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#FBC18F] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#803711]">
                            {sector.metric2Value}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Big Number */}
                    <div className="flex flex-col items-start lg:items-center justify-center gap-4 lg:text-center">
                      <div className="bbd-font-display text-[84px] sm:text-[104px] leading-none text-[#D96522]">
                        {sector.bigNumber}
                      </div>
                      <div className="bbd-font-body text-[20px] sm:text-[24px] leading-[32px] font-medium text-[#803711] max-w-[180px]">
                        {sector.bigLabel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUBSECTION 2: PINK STATS (.stats-pink) */}
      <section ref={pinkRef} className="w-full">
        <div className="bbd-padding-global">
          <div className="mx-auto w-full max-w-[1297px] py-12">
            <div className="flex flex-col gap-12 text-[#3A0008]">
              <h3 className="bbd-font-display text-[28px] sm:text-[32px] leading-[32px] text-[#3A0008]">
                POTENCIANDO NUESTROS SECTORES DE INNOVACIÓN Y CULTURA
              </h3>

              {pinkSectors.map((sector) => (
                <div key={sector.title} className="flex flex-col gap-12">
                  <div className="h-[1px] w-full bg-[#3A0008]/35" />
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr_234px] lg:gap-16">
                    <div className="flex h-full flex-col justify-between gap-8 lg:gap-14">
                      <h4 className="bbd-font-display text-[26px] sm:text-[32px] leading-[1.35] text-[#3A0008]">
                        {sector.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {sector.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bbd-eyebrow bg-[#8F1025] text-[#FCE0E4]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8">
                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#3A0008]">
                          {sector.metric1Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric1Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#F9A7B1] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#3A0008]">
                            {sector.metric1Value}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#3A0008]">
                          {sector.metric2Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric2Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#F9A7B1] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#3A0008]">
                            {sector.metric2Value}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-center justify-center gap-4 lg:text-center">
                      <div className="bbd-font-display text-[84px] sm:text-[104px] leading-none text-[#8F1025]">
                        {sector.bigNumber}
                      </div>
                      <div className="bbd-font-body text-[20px] sm:text-[24px] leading-[32px] font-medium text-[#3A0008] max-w-[180px]">
                        {sector.bigLabel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUBSECTION 3: GREEN STATS + VIDEO SHOWCASE (.stats-green) */}
      <section ref={greenRef} className="w-full">
        <div className="bbd-padding-global">
          <div className="mx-auto w-full max-w-[1297px] pt-12 pb-20 lg:pb-24">
            <div className="flex flex-col gap-12 text-[#1E5938]">
              <h3 className="bbd-font-display text-[28px] sm:text-[32px] leading-[32px] text-[#1E5938]">
                SECTORES DE OPORTUNIDAD Y PROYECCIÓN
              </h3>

              {greenSectors.map((sector) => (
                <div key={sector.title} className="flex flex-col gap-12">
                  <div className="h-[1px] w-full bg-[#1E5938]/35" />
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr_234px] lg:gap-16">
                    <div className="flex h-full flex-col justify-between gap-8 lg:gap-14">
                      <h4 className="bbd-font-display text-[26px] sm:text-[32px] leading-[1.35] text-[#1E5938]">
                        {sector.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {sector.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bbd-eyebrow bg-[#32965C] text-[#EAF8EE]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8">
                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#1E5938]">
                          {sector.metric1Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric1Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#B7EBC4] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#1E5938]">
                            {sector.metric1Value}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h5 className="font-condensed font-black text-[20px] leading-[28px] text-[#1E5938]">
                          {sector.metric2Label}
                        </h5>
                        <div className="flex items-end gap-4">
                          <div
                            style={{ width: sector.metric2Width }}
                            className="h-[72px] rounded-r-[16px] bg-[#B7EBC4] transition-all duration-700"
                          />
                          <span className="bbd-font-body text-[24px] leading-[36px] font-light text-[#1E5938]">
                            {sector.metric2Value}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-center justify-center gap-4 lg:text-center">
                      <div className="bbd-font-display text-[84px] sm:text-[104px] leading-none text-[#287548]">
                        {sector.bigNumber}
                      </div>
                      <div className="bbd-font-body text-[20px] sm:text-[24px] leading-[32px] font-medium text-[#1E5938] max-w-[180px]">
                        {sector.bigLabel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VIDEO SHOWCASE COMPONENT (.padding-section-medium.is--vimeo -> .video-component) */}
            <div className="mt-24 lg:mt-[128px] flex flex-col gap-12 lg:gap-16">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
                <h2 className="bbd-h2 text-[#3A0008] max-w-[1100px]">
                  CONSTRUYENDO LO QUE
                  <br />
                  EL FUTURO NECESITA
                </h2>

                <div className="shrink-0">
                  <BbdButton
                    label="Ver el plan"
                    href="/admision"
                    variant="purple"
                  />
                </div>
              </div>

              {/* Video Player Box (.vimeo-player 1297x729, radius 16px) */}
              <div
                onClick={() => setVideoPlaying((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setVideoPlaying((prev) => !prev);
                  }
                }}
                aria-label="Reproducir presentación institucional del campus"
                className="group relative aspect-video w-full overflow-hidden rounded-[16px] bg-[#241719] cursor-pointer shadow-xl"
              >
                <Image
                  src="/hero-pabellon.webp"
                  alt="Vista aérea y pabellones de los Planteles de Aplicación Guamán Poma de Ayala"
                  fill
                  sizes="(max-width: 1440px) 100vw, 1297px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[#241719]/35 transition-opacity group-hover:bg-[#241719]/45" />

                {!videoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-[#F9A7B1] text-[#4F000B] shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      <svg
                        width="42"
                        height="48"
                        viewBox="0 0 45 51"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-1.5"
                      >
                        <path d="M43.5 22.9019C45.5 24.0566 45.5 26.9434 43.5 28.0981L4.5 50.6147C2.5 51.7694 0 50.326 0 48.0167L0 2.98334C0 0.673941 2.5 -0.769434 4.5 0.385266L43.5 22.9019Z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center text-white backdrop-blur-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F9A7B1] text-[#4F000B] mb-4">
                      ❚❚
                    </div>
                    <p className="bbd-font-display text-[28px] sm:text-[40px] text-[#F9A7B1]">
                      CAMPUS GUAMÁN POMA DE AYALA · UNSCH 2026–2035
                    </p>
                    <p className="mt-2 max-w-xl font-roboto text-base sm:text-lg font-light text-white/90">
                      4 Losas Polideportivas Techadas · Laboratorios Universitarios UNSCH · Niveles Inicial, Primaria y Secundaria en Huamanga, Ayacucho.
                    </p>
                    <span className="mt-4 text-xs uppercase tracking-widest text-[#F47788]">
                      Haz clic para pausar la vista previa
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
