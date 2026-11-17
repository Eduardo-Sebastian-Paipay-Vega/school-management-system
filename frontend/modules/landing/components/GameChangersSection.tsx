'use client';

import { useState } from 'react';
import Image from 'next/image';
import BbdButton from './BbdButton';
import { cn } from '@/lib/utils';

interface GameChangerItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  accentBg: string;
}

const gameChangers: GameChangerItem[] = [
  {
    id: 'southern-gateway',
    title: 'COMPLEJO DE 4 LOSAS TECHADAS',
    description:
      'La obra de infraestructura deportiva más grande de los Planteles de Aplicación. Con una inversión de S/ 2 millones entregada en 2026, cuatro losas polideportivas techadas protegen de la radiación solar a más de 800 estudiantes.',
    badge: 'Infraestructura S/ 2M',
    accentBg: 'from-[#ED7B32]/80 to-[#54230C]/90',
  },
  {
    id: 'rail-programme',
    title: 'LABORATORIOS CIENTÍFICOS UNSCH',
    description:
      'El vínculo académico directo con la Universidad Nacional de San Cristóbal de Huamanga permite que nuestros estudiantes realicen prácticas experimentales en laboratorios de física, química y biología molecular.',
    badge: 'Rigor Científico',
    accentBg: 'from-[#5099D5]/80 to-[#142557]/90',
  },
  {
    id: 'mass-transit',
    title: 'NIVEL INICIAL: PRIMERA INFANCIA',
    description:
      'Un entorno pedagógico seguro, cálido y estimulante para niños de 3, 4 y 5 años. Desarrollamos la psicomotricidad, el lenguaje, la curiosidad y las habilidades socioemocionales mediante el juego estructurado.',
    badge: '3, 4 y 5 Años',
    accentBg: 'from-[#C32942]/80 to-[#3A0008]/90',
  },
  {
    id: 'city-village',
    title: 'NIVEL PRIMARIA: FORMACIÓN INTEGRAL',
    description:
      'De 1° a 6° grado consolidamos la comprensión lectora crítica, el razonamiento lógico-matemático, la indagación científica y los valores ciudadanos en estrecha coordinación con especialistas de la Facultad de Educación.',
    badge: '1° a 6° Grado',
    accentBg: 'from-[#32965C]/80 to-[#1E5938]/90',
  },
  {
    id: 'towns-transformation',
    title: 'SECUNDARIA Y CÍRCULOS PRE-UNSCH',
    description:
      'En los cinco años de secundaria potenciamos el pensamiento analítico, el debate académico y la preparación preuniversitaria intensiva, logrando altos índices de ingreso directo a las carreras de la UNSCH.',
    badge: '1° a 5° Secundaria',
    accentBg: 'from-[#7A1E30]/80 to-[#290006]/90',
  },
  {
    id: 'hospital-rebuild',
    title: 'PLATAFORMA DIGITAL E INTRANET 2026',
    description:
      'Transformación digital integral con control de asistencia mediante código QR en tiempo real, planilla docente ágil alineada al CNEB, analítica académica 360° y emisión de libretas electrónicas verificables.',
    badge: 'Innovación Tecnológica',
    accentBg: 'from-[#315BB5]/80 to-[#142557]/90',
  },
  {
    id: 'hydrogen-programme',
    title: 'IDENTIDAD CULTURAL Y SOSTENIBILIDAD',
    description:
      'Revaloramos el legado histórico de Felipe Guamán Poma de Ayala y la riqueza cultural de Huamanga mediante talleres de arte, música andina, biohuertos escolares y proyectos de conciencia ambiental.',
    badge: 'Patrimonio Ayacuchano',
    accentBg: 'from-[#287548]/80 to-[#16432B]/90',
  },
];

export default function GameChangersSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);

  return (
    <div className="w-full">
      <div className="bbd-padding-global">
        <div className="mx-auto w-full max-w-[1297px] py-16 lg:py-[96px]">
          <div className="flex flex-col gap-12 lg:gap-[96px]">
            {/* Section Heading (.section-heading-wrap) */}
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div className="flex max-w-[1129px] flex-col items-start gap-6">
                <div className="bbd-eyebrow bg-[#FFF5DC] text-[#4A3008]">
                  <span>Grandes proyectos</span>
                </div>
                <h2 className="bbd-h2 text-[color:var(--color-heading)]">
                  LOS 7 GRANDES
                  <br />
                  CAMBIOS CLAVE
                </h2>
              </div>

              <div className="shrink-0">
                <BbdButton
                  label="Ver el plan"
                  href="/servicios"
                  variant="purple"
                />
              </div>
            </div>

            {/* DESKTOP Interactive List with Preview Follower (.preview-collection) */}
            <div
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative hidden lg:block w-full"
            >
              <div className="flex flex-col">
                {gameChangers.map((item, idx) => {
                  const isDimmed = hoveredIdx !== null && hoveredIdx !== idx;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      className={cn(
                        'relative border-t border-[rgba(79,0,11,0.25)] last:border-b py-10 transition-opacity duration-300 cursor-pointer',
                        isDimmed ? 'opacity-45' : 'opacity-100'
                      )}
                    >
                      <div className="grid grid-cols-2 items-start gap-8">
                        <h3 className="bbd-font-display text-[32px] leading-[32px] text-[#241719] pr-8">
                          {item.title}
                        </h3>
                        <p className="bbd-font-body text-[16px] leading-[24px] font-light text-[rgba(41,23,25,0.8)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Visual Preview Card (.preview-follower) */}
              {hoveredIdx !== null && (
                <div
                  aria-hidden="true"
                  style={{
                    top: `${Math.min(Math.max(hoveredIdx * 175 + 20, 10), 960)}px`,
                  }}
                  className="pointer-events-none absolute left-[34%] z-20 h-[310px] w-[250px] -translate-x-1/2 overflow-hidden rounded-[12px] border border-white/40 bg-[#241719] shadow-2xl transition-all duration-300 ease-out"
                >
                  <Image
                    src="/hero-pabellon.webp"
                    alt=""
                    fill
                    sizes="250px"
                    className="object-cover"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t opacity-80',
                      gameChangers[hoveredIdx].accentBg
                    )}
                  />
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                      {gameChangers[hoveredIdx].badge}
                    </span>
                    <p className="mt-2 bbd-font-display text-[20px] leading-tight text-white">
                      {gameChangers[hoveredIdx].title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE / TABLET Accordion List (.accordion-css__list) */}
            <ul className="flex flex-col gap-2 lg:hidden">
              {gameChangers.map((item, idx) => {
                const isOpen = openAccordionIdx === idx;
                return (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-[8px] bg-[#F1ECEA] text-[rgba(41,23,25,0.8)]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccordionIdx(isOpen ? null : idx)
                      }
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-4 pl-6 pr-4 text-left"
                    >
                      <h3 className="bbd-font-display text-[24px] sm:text-[28px] leading-[1.25] text-[#241719]">
                        {item.title}
                      </h3>
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCE0E4] text-[#290006] transition-transform duration-300',
                          isOpen ? 'rotate-45' : 'rotate-0'
                        )}
                      >
                        +
                      </span>
                    </button>

                    <div
                      className={cn(
                        'grid transition-all duration-500 ease-[cubic-bezier(0.625,0.05,0,1)]',
                        isOpen
                          ? 'grid-rows-[1fr] opacity-100 pb-5 px-6'
                          : 'grid-rows-[0fr] opacity-0 pb-0 px-6'
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="bbd-font-body text-[15px] leading-[23px] font-light text-[rgba(41,23,25,0.8)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
