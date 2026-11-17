'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DriverItem {
  id: string;
  title: string;
  description: string;
  pillText: string;
  bg: string;
  titleColor: string;
  bodyColor: string;
  pillBg: string;
  pillColor: string;
  badge: string;
  caption: string;
}

const drivers: DriverItem[] = [
  {
    id: 'culture',
    title: 'CULTURA',
    description:
      'El orgullo de más de 62 años de historia guamampomina vive en cada aula, fortaleciendo la identidad ayacuchana, el arte y los valores de una comunidad educativa abierta al mundo.',
    pillText: 'La cultura es nuestro latido',
    bg: 'bg-[#4F000B]',
    titleColor: 'text-[#F9A7B1]',
    bodyColor: 'text-white',
    pillBg: 'bg-[#7A1E30]',
    pillColor: 'text-[#FCE0E4]',
    badge: '62° Aniversario UNSCH',
    caption: 'Danza, música y patrimonio huamanguino',
  },
  {
    id: 'skills',
    title: 'TALENTO',
    description:
      'Formar a nuestros estudiantes con las competencias científicas, lectoras y digitales del mañana despierta su vocación y les brinda las herramientas para liderar en la universidad.',
    pillText: 'Nuestra fuerza es nuestra gente',
    bg: 'bg-[#9B2226]',
    titleColor: 'text-[#FCE0E4]',
    bodyColor: 'text-[#FCE0E4]',
    pillBg: 'bg-[#4F000B]',
    pillColor: 'text-[#FCE0E4]',
    badge: 'Currículo CNEB + UNSCH',
    caption: 'Pensamiento crítico y aprendizaje activo',
  },
  {
    id: 'transport',
    title: 'CIENCIA',
    description:
      'El acceso directo a los laboratorios de física, química y biología de la UNSCH conecta el aprendizaje escolar con la investigación experimental universitaria desde temprana edad.',
    pillText: 'La ciencia define nuestro futuro',
    bg: 'bg-[#ED7B32]',
    titleColor: 'text-[#54230C]',
    bodyColor: 'text-[#54230C]',
    pillBg: 'bg-[#803711]',
    pillColor: 'text-[#FFF0E5]',
    badge: 'Laboratorios Universitarios',
    caption: 'Experimentación guiada junto a docentes UNSCH',
  },
  {
    id: 'regen',
    title: 'CAMPUS 2026',
    description:
      'Desde las 4 nuevas losas deportivas techadas hasta la modernización de aulas en Inicial, Primaria y Secundaria, transformamos nuestros espacios para el bienestar estudiantil.',
    pillText: 'El plantel se transforma rápido',
    bg: 'bg-[#287548]',
    titleColor: 'text-[#EAF8EE]',
    bodyColor: 'text-[#EAF8EE]',
    pillBg: 'bg-[#1E5938]',
    pillColor: 'text-[#EAF8EE]',
    badge: 'Inversión S/ 2,000,000',
    caption: '4 losas polideportivas techadas entregadas',
  },
];

export default function FocusDriversSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="focus" className="w-full">
      <div className="bbd-padding-global">
        <div className="mx-auto w-full max-w-[1297px] py-16 lg:py-[128px]">
          <div className="flex flex-col gap-12 lg:gap-16">
            {/* Section Heading (.section-heading-wrap) */}
            <div className="flex flex-col items-start gap-6">
              <div className="bbd-eyebrow bg-[#FCE0E4] text-[#4F000B]">
                <span>Enfoque central</span>
              </div>
              <h2 className="bbd-h2 text-[color:var(--color-heading)]">
                NUESTROS 4 IMPULSORES
              </h2>
            </div>

            {/* DESKTOP Horizontal Expanding Cards (.focus_wrap -> .focus_layout) */}
            <div className="hidden lg:flex h-[544px] w-full flex-row gap-6">
              {drivers.map((item, idx) => {
                const isExpanded = activeIndex === idx;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    className={cn(
                      'relative h-full overflow-hidden rounded-[16px] p-6 text-left transition-[flex] duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] cursor-pointer',
                      item.bg,
                      isExpanded ? 'flex-[2.62]' : 'flex-1'
                    )}
                  >
                    <div className="flex h-full w-full flex-row items-stretch justify-between gap-4">
                      {/* Left Content (.focus_card_content_left) */}
                      <div
                        className={cn(
                          'flex flex-col justify-between transition-all duration-500',
                          isExpanded ? 'w-[52%] pr-3' : 'w-full pr-0'
                        )}
                      >
                        <div className="flex flex-col items-start gap-4">
                          <h3
                            className={cn(
                              'bbd-font-display text-[32px] leading-[40px]',
                              item.titleColor
                            )}
                          >
                            {item.title}
                          </h3>

                          <p
                            className={cn(
                              'bbd-font-body text-[16px] leading-[24px] font-light transition-opacity duration-300',
                              item.bodyColor,
                              isExpanded
                                ? 'opacity-100 delay-100'
                                : 'opacity-0 pointer-events-none h-0 overflow-hidden'
                            )}
                          >
                            {item.description}
                          </p>
                        </div>

                        <div
                          className={cn(
                            'transition-opacity duration-300',
                            isExpanded
                              ? 'opacity-100 delay-100'
                              : 'opacity-0 pointer-events-none'
                          )}
                        >
                          <span
                            className={cn(
                              'bbd-eyebrow',
                              item.pillBg,
                              item.pillColor
                            )}
                          >
                            {item.pillText}
                          </span>
                        </div>
                      </div>

                      {/* Right Visual Image (.focus_card_content_right 244x366) */}
                      <div
                        className={cn(
                          'relative h-[366px] overflow-hidden rounded-[8px] transition-all duration-500',
                          isExpanded ? 'w-[244px] opacity-100 shrink-0' : 'w-0 opacity-0'
                        )}
                      >
                        <Image
                          src="/hero-pabellon.webp"
                          alt={item.title}
                          fill
                          sizes="244px"
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                        <div className="absolute inset-x-3 bottom-3 text-white">
                          <span className="inline-block rounded bg-white/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                            {item.badge}
                          </span>
                          <p className="mt-1 text-xs font-light text-white/90">
                            {item.caption}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MOBILE / TABLET Slider View (.focus-mobile) */}
            <div className="flex flex-col gap-6 lg:hidden">
              <div
                className={cn(
                  'overflow-hidden rounded-[24px] p-6 sm:p-8 transition-colors duration-300',
                  drivers[activeIndex].bg
                )}
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 items-center">
                  <div className="flex flex-col justify-between gap-6">
                    <div>
                      <h3
                        className={cn(
                          'bbd-font-display text-[32px] leading-[40px]',
                          drivers[activeIndex].titleColor
                        )}
                      >
                        {drivers[activeIndex].title}
                      </h3>
                      <p
                        className={cn(
                          'mt-4 bbd-font-body text-[16px] leading-[24px] font-light',
                          drivers[activeIndex].bodyColor
                        )}
                      >
                        {drivers[activeIndex].description}
                      </p>
                    </div>
                    <div>
                      <span
                        className={cn(
                          'bbd-eyebrow',
                          drivers[activeIndex].pillBg,
                          drivers[activeIndex].pillColor
                        )}
                      >
                        {drivers[activeIndex].pillText}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-[260px] sm:h-[320px] w-full overflow-hidden rounded-[12px]">
                    <Image
                      src="/hero-pabellon.webp"
                      alt={drivers[activeIndex].title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 text-white">
                      <span className="inline-block rounded bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                        {drivers[activeIndex].badge}
                      </span>
                      <p className="mt-1 text-xs text-white/90">
                        {drivers[activeIndex].caption}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Navigation Dots & Arrows (.slider-nav) */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  {drivers.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Ver impulsor ${item.title}`}
                      className={cn(
                        'h-3.5 w-3.5 rounded-full transition-all',
                        activeIndex === idx
                          ? 'bg-[#291719] scale-110'
                          : 'bg-[#291719]/35 hover:bg-[#291719]/60'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) =>
                        prev === 0 ? drivers.length - 1 : prev - 1
                      )
                    }
                    aria-label="Anterior impulsor"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(79,0,11,0.25)] bg-white text-[#291719] hover:bg-[#E5E7EB]"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) => (prev + 1) % drivers.length)
                    }
                    aria-label="Siguiente impulsor"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(79,0,11,0.25)] bg-white text-[#291719] hover:bg-[#E5E7EB]"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
