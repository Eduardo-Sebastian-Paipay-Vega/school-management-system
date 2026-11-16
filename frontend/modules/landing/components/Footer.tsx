import Link from 'next/link';
import Image from 'next/image';
import BbdButton from './BbdButton';

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#3A0008] overflow-hidden">
      {/* Top Rounded Lip from Video/Stats Section (.section-video radius 0 0 64px 64px) */}
      <div
        aria-hidden="true"
        className="h-8 sm:h-12 w-full rounded-b-[32px] sm:rounded-b-[64px] bg-[#EAF8EE]"
      />

      {/* PART 1: Monumental Deep Burgundy CTA Section (.section-cta, height ~686px) */}
      <section className="relative w-full overflow-hidden py-20 lg:py-[128px]">
        {/* Left Decorative Diagonal Ribbon SVG (.footer-svg-draw-wrap) */}
        <svg
          viewBox="0 0 600 680"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-0 h-full w-[420px] sm:w-[580px] text-[#4F000B] opacity-90"
        >
          <path
            d="M-60 220 L180 -30 M260 -40 L60 410 C40 450 90 470 130 430 L520 -20"
            stroke="currentColor"
            strokeWidth="68"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Right Decorative Diagonal Ribbon SVG (.footer-svg-draw-wrap.right) */}
        <svg
          viewBox="0 0 600 680"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-full w-[420px] sm:w-[580px] text-[#4F000B] opacity-90"
        >
          <path
            d="M80 700 L480 300 C520 260 560 290 540 340 L390 710 M490 710 L640 430"
            stroke="currentColor"
            strokeWidth="68"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Centered CTA Foreground Content (.cta-component-main) */}
        <div className="bbd-padding-global relative z-10">
          <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center gap-8">
            <div className="bbd-eyebrow bg-[#8F1025] text-[#FCE0E4]">
              <span>Cómo participar</span>
            </div>

            <h2 className="bbd-h1 text-[#F9A7B1]">
              <span className="text-[#E64B63]">EL CRECIMIENTO</span> NO OCURRE
              <br />
              EN AISLAMIENTO.
            </h2>

            <p className="bbd-font-body text-[20px] leading-[30px] sm:text-[24px] sm:leading-[36px] font-light text-[#F9A7B1]">
              ¿Quieres formar parte del proceso de Admisión 2027 en el Guamán Poma de Ayala?
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <BbdButton
                label="Ver el plan"
                href="/por-que-elegirnos"
                variant="purple"
              />
              <BbdButton
                label="Admisión 2027"
                href="/admision"
                variant="white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PART 2: Pastel Burgundy Resource & Contact Card (.section-resource, bg #F9A7B1, radius 64px 64px 0 0) */}
      <div className="relative z-10 flex flex-col justify-between gap-16 lg:gap-24 rounded-t-[40px] sm:rounded-t-[64px] bg-[#F9A7B1] pt-16 sm:pt-24 lg:pt-[128px] text-[#290006]">
        {/* Top 3-Column Grid (.footer-top-wrap.container-large) */}
        <div className="mx-auto grid w-full max-w-[1380px] grid-cols-1 items-start gap-10 px-6 sm:px-10 md:grid-cols-3">
          {/* Col 1: Contact Us (.footer-contact-info) */}
          <div className="flex flex-col items-start gap-6">
            <div className="font-condensed font-black text-[20px] leading-[28px] text-[#290006]">
              Contáctanos
            </div>

            <div className="flex flex-col items-start gap-2 bbd-font-body text-[18px] sm:text-[20px] leading-[30px] text-[#290006]">
              <a
                href="mailto:admision@guamanpoma-unsch.edu.pe"
                className="bbd-underline-link font-medium text-[#290006]"
              >
                admision@guamanpoma-unsch.edu.pe
              </a>
              <a
                href="tel:+5166312510"
                className="bbd-underline-link font-bold text-[#290006]"
              >
                (066) 312510
              </a>
              <div className="font-light text-[#290006]">
                Pasaje San Joaquín 101 ·{' '}
                <Link href="/contacto" className="bbd-underline-link">
                  Ayacucho, Perú
                </Link>
              </div>
              <div className="font-light text-[#290006]">
                Planteles de Aplicación de la UNSCH (Cód. 050101)
              </div>
            </div>

            {/* Quick Institutional Navigation Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 text-xs font-medium text-[#290006]/80">
              <Link href="/por-que-elegirnos" className="hover:underline">
                ¿Por qué elegirnos?
              </Link>
              <Link href="/niveles" className="hover:underline">
                Niveles
              </Link>
              <Link href="/servicios" className="hover:underline">
                Servicios
              </Link>
              <Link href="/testimonios" className="hover:underline">
                Testimonios
              </Link>
              <Link href="/noticias" className="hover:underline">
                Noticias
              </Link>
              <Link href="/intranet" className="hover:underline font-bold">
                Intranet
              </Link>
            </div>
          </div>

          {/* Col 2: Circular Social Links (.footer-social-icons 64x64, bg #F47788) */}
          <div className="flex items-center md:justify-center gap-3.5">
            <a
              href="https://www.unsch.edu.pe/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn / Portal Institucional UNSCH"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F47788] text-[#290006] transition-transform duration-200 hover:scale-105"
            >
              <span className="font-roboto text-[26px] font-bold leading-none">
                in
              </span>
            </a>

            <a
              href="https://www.unsch.edu.pe/"
              target="_blank"
              rel="noreferrer"
              aria-label="X / Canal Oficial UNSCH"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F47788] text-[#290006] transition-transform duration-200 hover:scale-105"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Col 3: Right Vertical Action Buttons (.button-group.is--vertical) */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <BbdButton
              label="Ver el plan"
              href="/por-que-elegirnos"
              variant="purple"
            />
            <BbdButton
              label="Habla con nuestro equipo"
              href="/contacto"
              variant="white"
            />
          </div>
        </div>

        {/* Partner / Institutional Logos Row (.div-block-3) */}
        <div className="mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-12 px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/85 p-1">
              <Image
                src="/emblema-unsch-grabado.webp"
                alt="Escudo Oficial de la UNSCH"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-left text-[#241719]">
              <div className="text-[11px] font-medium uppercase tracking-wider">
                Universidad Nacional de
              </div>
              <div className="font-serif text-[22px] font-bold leading-none tracking-tight">
                SAN CRISTÓBAL
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest">
                DE HUAMANGA · 1677
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F000B] text-white font-condensed text-2xl font-black">
              GP
            </div>
            <span className="font-roboto text-[28px] font-bold tracking-tight text-[#290006]">
              Guamán Poma
            </span>
          </div>
        </div>

        {/* Bottom Monumental Bleed Wordmark SVG (1425x398 in #F47788) */}
        <div
          aria-hidden="true"
          className="w-full overflow-hidden leading-none select-none pointer-events-none -mb-3"
        >
          <svg
            viewBox="0 0 1440 370"
            className="block w-full h-auto text-[#F47788]"
            preserveAspectRatio="xMidYMax meet"
          >
            <text
              x="50%"
              y="182"
              textAnchor="middle"
              fill="currentColor"
              fontFamily="var(--font-roboto-condensed), Impact, sans-serif"
              fontWeight="900"
              fontSize="178"
              letterSpacing="-5"
            >
              FORJANDO NUESTRO
            </text>
            <text
              x="50%"
              y="362"
              textAnchor="middle"
              fill="currentColor"
              fontFamily="var(--font-roboto-condensed), Impact, sans-serif"
              fontWeight="900"
              fontSize="196"
              letterSpacing="-5"
            >
              PROPIO FUTURO
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
