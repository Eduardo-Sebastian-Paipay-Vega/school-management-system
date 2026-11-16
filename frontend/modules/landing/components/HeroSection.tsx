'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 992) {
        setScrollProgress(0);
        return;
      }
      const maxScroll = 600;
      const current = Math.min(Math.max(window.scrollY, 0), maxScroll);
      setScrollProgress(current / maxScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scale = 1 - scrollProgress * 0.085;
  const radius = Math.round(scrollProgress * 28);

  return (
    <header className="relative w-full bg-[#FFFCF8] overflow-hidden">
      <div
        style={{
          transform: scrollProgress > 0 ? `scale(${scale.toFixed(4)})` : undefined,
          borderBottomLeftRadius: scrollProgress > 0 ? `${radius}px` : undefined,
          borderBottomRightRadius: scrollProgress > 0 ? `${radius}px` : undefined,
        }}
        className="relative flex min-h-[640px] sm:min-h-[700px] lg:min-h-[732px] w-full flex-col justify-end overflow-hidden transition-[border-radius] duration-150 will-change-transform"
      >
        {/* Background Visual Layer (.header-bg-wrap) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-pabellon.webp"
            alt="Campus de los Planteles de Aplicación Guamán Poma de Ayala - UNSCH"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle atmospheric gradient matching reference video contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#290006]/20 via-[#290006]/30 to-[#290006]/75"
          />
        </div>

        {/* Hero Foreground Content (.padding-global.is-hero -> .container-large.is--hero -> .header-content) */}
        <div className="bbd-padding-global relative z-10 w-full">
          <div className="mx-auto w-full max-w-[1297px] pt-32 pb-12 sm:pb-16 lg:px-8 lg:pt-16 lg:pb-24">
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.38fr_1fr] lg:gap-8">
              {/* Left Column: Monumental Condensed H1 (.header-inner-top-left, 2 lines at 1440px) */}
              <div className="flex flex-col items-start justify-end">
                <h1 className="bbd-h1 xl:text-[82px] xl:leading-[84px] text-white drop-shadow-[0_2px_18px_rgba(41,0,6,0.45)]">
                  <span className="lg:whitespace-nowrap">FORJANDO NUESTRO</span>
                  <br />
                  <span className="lg:whitespace-nowrap">PROPIO FUTURO</span>
                </h1>
              </div>

              {/* Right Column: Dual Burgundy Eyebrow Pills + Subtitle (.header-inner-bottom-left) */}
              <div className="flex flex-col items-start justify-start gap-6 lg:gap-8 lg:max-w-[505px]">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="bbd-eyebrow bg-[#C32942] text-white">
                    <span>UNSCH 1964–2026</span>
                  </div>
                  <div className="bbd-eyebrow bg-[#FFF5DC] text-[#4A3008]">
                    <span>Excelencia &amp; Plan 2027</span>
                  </div>
                </div>

                <p className="bbd-font-body text-[16px] leading-[24px] sm:text-[18px] sm:leading-[27px] font-light text-white drop-shadow-[0_1px_8px_rgba(41,0,6,0.45)]">
                  Con una de las comunidades estudiantiles más talentosas y diversas de Ayacucho, los Planteles de Aplicación Guamán Poma de Ayala ofrecen formación integral con respaldo directo de la UNSCH.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
