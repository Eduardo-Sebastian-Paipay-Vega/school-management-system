import Image from 'next/image';
import BbdButton from './BbdButton';

const frameworkButtons = [
  { label: 'Nivel Inicial', href: '/niveles' },
  { label: 'Nivel Primaria', href: '/niveles' },
  { label: 'Nivel Secundaria', href: '/niveles' },
  { label: 'Laboratorios', href: '/servicios' },
];

const leftColumnCards = [
  {
    title: 'Patrimonio y Campus UNSCH',
    subtitle: 'Pasaje San Joaquín 101 · Huamanga',
    badge: 'Tradición 1964',
    accent: 'from-[#290006]/80 via-black/20 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-left',
  },
  {
    title: 'Identidad Cultural Viva',
    subtitle: 'Arte, música y danzas de Ayacucho',
    badge: 'Cultura e Identidad',
    accent: 'from-[#803711]/80 via-black/20 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-center',
  },
  {
    title: 'Comunidad Estudiantil',
    subtitle: 'Más de 800 estudiantes en 3 niveles',
    badge: 'Formación Integral',
    accent: 'from-[#1E5938]/80 via-black/20 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-right',
  },
];

const rightColumnCards = [
  {
    title: 'Innovación y Laboratorios',
    subtitle: 'Prácticas en facultades de la UNSCH',
    badge: 'Ciencia Experimental',
    accent: 'from-[#103354]/85 via-black/25 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-right',
  },
  {
    title: 'Complejo Polideportivo 2026',
    subtitle: '4 losas techadas de S/ 2 millones',
    badge: 'Infraestructura',
    accent: 'from-[#3A0008]/85 via-black/20 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-center',
  },
  {
    title: 'Liderazgo Preuniversitario',
    subtitle: 'Ingreso destacado a la UNSCH',
    badge: 'Alto Rendimiento',
    accent: 'from-[#4A3008]/85 via-black/20 to-transparent',
    img: '/hero-pabellon.webp',
    pos: 'object-left',
  },
];

export default function AmbitionSection() {
  return (
    <>
      {/* SECTION 2: Frameworks Banner + 2-Column Core Ambition (.section-grid) */}
      <section id="ambition" className="relative w-full pt-4">
        {/* Top Institutional Burgundy Banner (.div-block-6: 1325x185, bg #4F000B, radius 16px) */}
        <div className="bbd-padding-global">
          <div className="mx-auto w-full max-w-[1325px] rounded-[16px] bg-[#4F000B] px-5 py-5 sm:px-10">
            <h2 className="bbd-banner-h1 pt-1 text-center text-white/90">
              CONOCE NUESTROS MARCOS FORMATIVOS
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 py-3 sm:gap-8 lg:gap-[68px]">
              {frameworkButtons.map((btn) => (
                <BbdButton
                  key={btn.label}
                  label={btn.label}
                  href={btn.href}
                  variant="white"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Ambition Layout (.header-component: 600.4px / 600.4px, gap 96px) */}
        <div className="bbd-padding-global">
          <div className="mx-auto w-full max-w-[1297px] py-12 lg:py-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-[96px]">
              {/* Left Column (.header-left) */}
              <div className="flex flex-col items-start gap-6">
                <div className="bbd-eyebrow bg-[#FCE0E4] text-[#290006]">
                  <span>Nuestra ambición</span>
                </div>

                <h2 className="bbd-h1 text-[#3A0008]">
                  AVANZANDO
                  <br />
                  COMO COLEGIO
                  <br />
                  DE APLICACIÓN
                </h2>

                <div className="space-y-5 bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-[rgba(41,23,25,0.8)]">
                  <p>
                    Los Colegios de Aplicación son el corazón pedagógico de las grandes universidades: espacios que impulsan la innovación educativa, forman el pensamiento científico y articulan la escuela con la investigación superior.
                  </p>
                  <p>
                    Adscritos a la Facultad de Ciencias de la Educación de la UNSCH, combinamos 62 años de tradición huamanguina con infraestructura renovada, laboratorios universitarios y preparación integral en Inicial, Primaria y Secundaria.
                  </p>
                </div>

                <div className="pt-2">
                  <BbdButton
                    label="Ver el plan"
                    href="/por-que-elegirnos"
                    variant="green"
                  />
                </div>
              </div>

              {/* Right Column: Dual Staggered Image Columns (.header-right 600x732) */}
              <div className="relative flex h-[520px] sm:h-[640px] lg:h-[732px] w-full flex-row gap-4 sm:gap-6 overflow-hidden">
                {/* Left Vertical Image Column (.header-img-list-left) */}
                <div className="flex w-1/2 flex-col gap-6 -mt-8">
                  {leftColumnCards.map((card) => (
                    <div
                      key={card.title}
                      className="relative h-[280px] sm:h-[340px] lg:h-[375px] w-full shrink-0 overflow-hidden rounded-[16px] bg-[#241719]"
                    >
                      <Image
                        src={card.img}
                        alt={card.title}
                        fill
                        sizes="(max-width: 1024px) 45vw, 288px"
                        className={`object-cover ${card.pos}`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${card.accent}`}
                      />
                      <div className="absolute inset-x-4 bottom-4 text-white">
                        <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                          {card.badge}
                        </span>
                        <p className="mt-1.5 bbd-font-display text-[20px] leading-tight">
                          {card.title}
                        </p>
                        <p className="text-xs text-white/80">{card.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Vertical Image Column (.header-img-list-right, offset upward) */}
                <div className="flex w-1/2 flex-col gap-6 -mt-28">
                  {rightColumnCards.map((card) => (
                    <div
                      key={card.title}
                      className="relative h-[280px] sm:h-[340px] lg:h-[375px] w-full shrink-0 overflow-hidden rounded-[16px] bg-[#241719]"
                    >
                      <Image
                        src={card.img}
                        alt={card.title}
                        fill
                        sizes="(max-width: 1024px) 45vw, 288px"
                        className={`object-cover ${card.pos}`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${card.accent}`}
                      />
                      <div className="absolute inset-x-4 bottom-4 text-white">
                        <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                          {card.badge}
                        </span>
                        <p className="mt-1.5 bbd-font-display text-[20px] leading-tight">
                          {card.title}
                        </p>
                        <p className="text-xs text-white/80">{card.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top & Bottom Fade Overlay (.header-gradient-overlay) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFFCF8] via-transparent to-[#FFFCF8]"
                  style={{
                    backgroundImage:
                      'linear-gradient(180deg, #FFFCF8 0%, rgba(255,252,248,0) 16%, rgba(255,252,248,0) 84%, #FFFCF8 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Secondary Institutional Burgundy Banner (.div-block-6 at top 3294px, 185px height) */}
      <div className="bbd-padding-global">
        <div className="mx-auto w-full max-w-[1325px] rounded-[16px] bg-[#4F000B] px-5 py-3 sm:px-10">
          <h2 className="bbd-banner-h1 xl:text-[58px] pt-2 text-center text-white/90">
            DESCUBRE QUÉ IMPULSA NUESTRA AMBICIÓN...
          </h2>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-4 py-4 sm:gap-10 lg:gap-[68px]">
            <BbdButton
              label="Descargar el Análisis Institucional"
              href="/por-que-elegirnos"
              variant="white"
            />
            <BbdButton
              label="Consultar el Plan de Estudios"
              href="/niveles"
              variant="white"
            />
          </div>
        </div>
      </div>
    </>
  );
}
