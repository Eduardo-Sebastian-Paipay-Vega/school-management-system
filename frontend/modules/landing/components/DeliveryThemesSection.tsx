import BbdButton from './BbdButton';

export default function DeliveryThemesSection() {
  return (
    <section id="growth" className="w-full">
      <div className="bbd-padding-global">
        <div className="mx-auto w-full max-w-[1297px] py-16 lg:py-[128px]">
          {/* 2-Column Sticky Cards Layout (.cards-layout-component: 640.4px / 640.4px, gap 16px) */}
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-4">
            {/* Left Sticky Column (.cards-layout-left) */}
            <div className="flex flex-col items-start gap-8 lg:sticky lg:top-28">
              <div className="bbd-eyebrow bg-[#EAF8EE] text-[#16432B]">
                <span>Crecimiento</span>
              </div>

              <h2 className="bbd-h2 text-[#3A0008]">
                NUESTROS 3
                <br />
                EJES DE
                <br />
                EJECUCIÓN
              </h2>

              <p className="bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-[rgba(41,23,25,0.8)] max-w-[612px]">
                <span className="font-medium">
                  Nuestro plan está deliberadamente enfocado: cuatro Impulsores Principales, materializados en siete Grandes Cambios Clave y guiados por tres Ejes de Ejecución.
                </span>
                <br />
                <br />
                La visión es clara: elevar el estándar educativo público. Se trata de formar la comunidad más preparada, creativa y conectada con la universidad.
              </p>

              <BbdButton
                label="Ver el plan"
                href="/niveles"
                variant="purple"
              />
            </div>

            {/* Right Stacked Cards Column (.cards-layout-right) */}
            <div className="flex flex-col items-center gap-10 lg:px-16">
              {/* Card 1: PEOPLE / PERSONAS (.layout-card.card--1, bg #C32942, color #FCE0E4) */}
              <div className="flex min-h-[299px] w-full max-w-[448px] flex-col justify-between rounded-[24px] bg-[#C32942] p-8 sm:p-12 text-[#FCE0E4] shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="bbd-font-display text-[32px] leading-[32px] text-[#FCE0E4]">
                    PERSONAS
                  </h3>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#FCE0E4] text-[#4F000B]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
                      <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" />
                    </svg>
                  </div>
                </div>

                <p className="mt-10 bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-white">
                  Dotando a nuestros estudiantes y familias de las competencias científicas, éticas y socioemocionales para carreras de alto valor y vidas plenas.
                </p>
              </div>

              {/* Card 2: PRODUCTIVITY / RENDIMIENTO (.layout-card.card--2, bg #ED7B32, color #FFF0E5, tilted) */}
              <div className="flex min-h-[320px] w-full max-w-[448px] -rotate-2 lg:-rotate-[4deg] flex-col justify-between rounded-[24px] bg-[#ED7B32] p-8 sm:p-12 text-[#FFF0E5] shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="bbd-font-display text-[32px] leading-[32px] text-[#FFF0E5]">
                    EXCELENCIA
                  </h3>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#FFF0E5] text-[#B34E19]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17L17 7M17 7H8M17 7V16" />
                    </svg>
                  </div>
                </div>

                <p className="mt-10 bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-white">
                  Acelerando el logro académico en áreas clave como ciencias experimentales, razonamiento matemático, comprensión lectora y tecnologías digitales.
                </p>
              </div>

              {/* Card 3: PLACE / ENTORNO (.layout-card.card--3, bg #32965C, color #EAF8EE, tilted) */}
              <div className="flex min-h-[314px] w-full max-w-[448px] rotate-1 lg:rotate-[2deg] flex-col justify-between rounded-[24px] bg-[#32965C] p-8 sm:p-12 text-[#EAF8EE] shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="bbd-font-display text-[32px] leading-[32px] text-[#EAF8EE]">
                    ENTORNO
                  </h3>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#EAF8EE] text-[#287548]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
                    </svg>
                  </div>
                </div>

                <p className="mt-10 bbd-font-body text-[18px] leading-[27px] sm:text-[20px] sm:leading-[30px] font-light text-white">
                  Reimaginando nuestro campus escolar mediante espacios deportivos techados, laboratorios conectados, seguridad en portería y áreas verdes sostenibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
