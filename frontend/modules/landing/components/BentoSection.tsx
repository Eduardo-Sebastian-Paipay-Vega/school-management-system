'use client';

import { useState } from 'react';
import Image from 'next/image';
import BbdButton from './BbdButton';

export default function BentoSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section id="regen" className="relative w-full">
      <div className="bbd-padding-global">
        <div className="mx-auto w-full max-w-[1297px] pt-8 pb-12">
          {/* Bento Grid (.bento-component: 545.475px / 727.325px on 1440px, gap: 24px) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[545fr_727fr]">
            {/* Card 1: Pink Quote Card (.bento-card.is--1) */}
            <div className="flex min-h-[480px] lg:min-h-[545px] flex-col justify-between rounded-[16px] bg-[#F9A7B1] p-6 sm:p-8 text-[#290006]">
              <div className="flex flex-col items-start gap-6">
                <div className="bbd-eyebrow bg-[#FCE0E4] text-[#290006]">
                  <span>Regeneración</span>
                </div>

                {/* Monumental Double Quote Graphic (.quote-icon 233x144) */}
                <svg
                  width="233"
                  height="144"
                  viewBox="0 0 233 144"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-[175px] sm:w-[233px] h-auto select-none"
                >
                  <path
                    d="M52.5 0C23.5 0 0 23.5 0 52.5C0 78.2 18.5 99.6 43 104.1C39.2 117.8 28.4 128.9 14.5 135.2L22.8 144C49.5 132.4 72.5 107.8 81.8 75.5C86.2 60.2 88 45.2 85.2 31.8C80.5 12.8 68.1 0 52.5 0ZM180.5 0C151.5 0 128 23.5 128 52.5C128 78.2 146.5 99.6 171 104.1C167.2 117.8 156.4 128.9 142.5 135.2L150.8 144C177.5 132.4 200.5 107.8 209.8 75.5C214.2 60.2 216 45.2 213.2 31.8C208.5 12.8 196.1 0 180.5 0Z"
                    fill="white"
                    fillOpacity="0.45"
                  />
                </svg>
              </div>

              <div className="mt-6 flex flex-col items-start gap-4">
                <p className="bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-[#290006] max-w-[481px]">
                  Guamán Poma de Ayala se consolida como la institución educativa referente de Ayacucho, impulsada por la innovación pedagógica, la identidad cultural y el respaldo científico. Sobre la base de 62 años de historia con la UNSCH, transformamos la educación escolar hacia el 2035.
                </p>

                <div className="bbd-font-body text-[18px] sm:text-[20px] leading-[24px] font-light text-[#290006]">
                  <span className="font-medium">Mg. Yecid Ramírez Chipana -</span> Director General, Planteles UNSCH
                </div>

                <div className="pt-1">
                  <BbdButton
                    label="Sé parte del cambio"
                    href="/admision"
                    variant="purple"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Blue Plan Card with 3 Angled Booklets (.bento-card.is--2) */}
            <div className="relative flex min-h-[480px] lg:min-h-[545px] flex-col justify-between overflow-hidden rounded-[16px] bg-[#9B2226] p-6 sm:p-8 text-white">
              <div className="relative z-10 flex max-w-[564px] flex-col items-start gap-5">
                <h2 className="bbd-font-display text-[28px] sm:text-[32px] leading-[32px] text-[#FCE0E4]">
                  EL PLAN PARA EL FUTURO DE GUAMÁN POMA
                </h2>

                <p className="bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-white">
                  Consulta nuestro plan institucional para conocer cómo impulsamos la excelencia académica, los laboratorios UNSCH y la infraestructura al 2035.
                </p>

                <BbdButton
                  label="Ver el plan"
                  href="/por-que-elegirnos"
                  variant="white"
                />
              </div>

              {/* 3 Isometric Fanned Brochure Mockups matching reference Card 2 */}
              <div
                aria-hidden="true"
                className="relative z-0 mt-8 flex h-[240px] sm:h-[275px] w-full items-end justify-center sm:justify-end pr-2"
              >
                <div className="relative h-[220px] w-[420px] sm:w-[500px]">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        left: `${idx * 58}px`,
                        bottom: `${idx * 10}px`,
                        transform: 'rotate(-16deg) skewX(12deg)',
                        zIndex: idx + 1,
                      }}
                      className="absolute h-[185px] w-[265px] sm:h-[205px] sm:w-[295px] overflow-hidden rounded-[6px] border border-white/70 bg-white shadow-[0_18px_36px_rgba(16,51,84,0.42)]"
                    >
                      {/* Top White Cover Header */}
                      <div className="bg-white px-4 pt-3 pb-2 text-[#241719]">
                        <div className="bbd-font-display text-[20px] leading-none tracking-tight text-[#291719]">
                          GUAMÁN POMA
                        </div>
                        <div className="font-roboto text-[13px] font-light tracking-tight text-[#64748B]">
                          UNSCH AYACUCHO 2025 - 2035
                        </div>
                        <div className="font-roboto text-[8px] font-medium uppercase tracking-widest text-[#64748B]">
                          PLAN DE DESARROLLO E INFRAESTRUCTURA
                        </div>
                      </div>
                      {/* Colorful Ribbon Artwork */}
                      <div className="relative h-full w-full bg-[#E5E7EB]">
                        <Image
                          src="/hero-pabellon.webp"
                          alt=""
                          fill
                          sizes="300px"
                          className="object-cover opacity-55"
                        />
                        <svg
                          viewBox="0 0 300 130"
                          className="absolute inset-0 h-full w-full"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M-10 25 Q 45 5, 95 30 T 205 25 T 310 30"
                            fill="none"
                            stroke="#9B2226"
                            strokeWidth="8"
                          />
                          <path
                            d="M-10 48 Q 45 28, 95 53 T 205 48 T 310 53"
                            fill="none"
                            stroke="#D49A22"
                            strokeWidth="8"
                          />
                          <path
                            d="M-10 71 Q 45 51, 95 76 T 205 71 T 310 76"
                            fill="none"
                            stroke="#32965C"
                            strokeWidth="8"
                          />
                          <path
                            d="M-10 94 Q 45 74, 95 99 T 205 94 T 310 99"
                            fill="none"
                            stroke="#58B77B"
                            strokeWidth="8"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Full-Width Panoramic Card 3 (.bento-card.is--3, 1297x682) */}
          <div className="relative mt-6 flex min-h-[540px] lg:min-h-[682px] flex-col lg:flex-row items-start lg:items-end justify-between gap-6 overflow-hidden rounded-[16px] p-6 sm:p-8">
            {/* Background Campus Visual (.bento-video_bg) */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/hero-pabellon.webp"
                alt="Infraestructura deportiva y pabellones del Plantel Guamán Poma de Ayala"
                fill
                sizes="100vw"
                className="object-cover object-center scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/45"
              />
            </div>

            {/* Bottom-Left Watch Video Button (.button-group.is-bento) */}
            <div className="relative z-10 order-2 lg:order-1">
              <BbdButton
                label="Ver el video"
                variant="orange"
                onClick={() => setVideoModalOpen(true)}
              />
            </div>

            {/* Right Inner Peach Card (.bento-inner-card 480x618, bg #FFF0E5, color #B34E19) */}
            <div className="relative z-10 order-1 lg:order-2 flex min-h-[420px] lg:min-h-[618px] w-full lg:w-[480px] flex-col justify-between rounded-[12px] bg-[#FFF0E5] p-6 sm:p-8 text-[#B34E19] shadow-xl">
              <div className="flex flex-col items-start gap-6">
                <div className="bbd-eyebrow bg-[#FBC18F] text-[#54230C]">
                  <span>Complejo Deportivo</span>
                </div>

                <h2 className="bbd-font-display text-[28px] sm:text-[32px] leading-[32px] text-[#B34E19]">
                  MODERNIZAR EL CAMPUS
                </h2>

                <p className="bbd-font-body text-[20px] leading-[30px] sm:text-[24px] sm:leading-[36px] font-light text-[#B34E19]">
                  Cuatro modernas losas deportivas techadas con inversión de S/ 2 millones conectan a más de 800 estudiantes con el deporte formativo, la salud y la excelencia...
                </p>
              </div>

              <div className="mt-8 flex flex-col items-start gap-2">
                <div className="bbd-font-body text-[22px] sm:text-[24px] leading-[36px] font-medium text-[#B34E19]">
                  Guamán Poma 2025 - 2035
                </div>
                <div className="bbd-font-body text-[18px] sm:text-[20px] leading-[24px] font-light text-[#B34E19]">
                  Plan de Infraestructura y Crecimiento
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Interactive Video Lightbox Modal (.vimeo-lightbox) */}
      {videoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video Institucional Planteles Guamán Poma de Ayala"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-10 backdrop-blur-sm"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[960px] overflow-hidden rounded-[16px] bg-[#FFFFFF] p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              aria-label="Cerrar video"
              className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFFFFF] text-[#291719] shadow-md hover:bg-[#E5E7EB]"
            >
              ✕
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-[#241719] flex flex-col items-center justify-center text-center p-8 text-white">
              <Image
                src="/hero-pabellon.webp"
                alt="Campus Guamán Poma de Ayala"
                fill
                sizes="960px"
                className="object-cover opacity-35"
              />
              <div className="relative z-10 max-w-xl">
                <span className="bbd-eyebrow bg-[#FBC18F] text-[#54230C] mb-4">
                  Presentación Institucional 2026–2027
                </span>
                <h3 className="bbd-font-display text-[36px] sm:text-[48px] leading-tight text-white mt-3">
                  PLANTELES DE APLICACIÓN GUAMÁN POMA DE AYALA — UNSCH
                </h3>
                <p className="mt-4 font-roboto text-[18px] font-light text-white/90">
                  Recorrido audiovisual por las 4 nuevas losas deportivas techadas, los laboratorios de física, química y biología de la UNSCH, y las aulas de Inicial, Primaria y Secundaria.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <BbdButton
                    label="Ir a Admisión 2027"
                    href="/admision"
                    variant="purple"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
