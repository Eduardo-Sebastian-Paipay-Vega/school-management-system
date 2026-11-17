import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SessionGate, SessionProvider } from '@/modules/squads/squad_1_core/SessionProvider';

export default function IntranetLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[#FFFCF8] text-[#291719] selection:bg-[#8F1025] selection:text-white">
        {/* Top Banner */}
        <header className="border-b border-[#E8D8D4] bg-[#FFFCF8] sticky top-0 z-40 shadow-[0_2px_12px_rgba(79,0,11,0.04)]">
          <div className="content-width flex min-h-16 items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl border border-[#E8D8D4] bg-[#F5EBE8] px-3 py-1.5 text-xs font-bold text-[#4F000B] hover:bg-[#8F1025] hover:text-white active:scale-[0.98] transition-all duration-150 ease"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Portal Web</span>
              </Link>

              <div className="h-6 w-px bg-[#E8D8D4] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl border border-[#E8D8D4] bg-white p-1 shadow-xs">
                  <Image
                    src="/emblema-unsch-grabado.webp"
                    alt="Emblema UNSCH"
                    width={32}
                    height={32}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="bbd-font-display text-[18px] text-[#4F000B] leading-none tracking-tight">
                    INTRANET GUAMÁN POMA
                  </h1>
                  <p className="hidden text-[10px] text-[#796763] font-medium sm:block">
                    Universidad Nacional de San Cristóbal de Huamanga
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 text-[#4F000B] font-mono text-[11px] bg-[#F5EBE8] px-3 py-1.5 rounded-full border border-[#E8D8D4] sm:flex">
              <ShieldCheck size={14} className="text-[#32965C]" />
              <span className="hidden sm:inline">Servidor Seguro</span>
              <span>SSL 256-bit</span>
            </div>
          </div>
        </header>

        {/* Main Intranet Content */}
        <main className="flex-1 content-width py-8">
          <SessionGate>{children}</SessionGate>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E8D8D4] bg-[#FFFCF8] py-4 text-center text-xs text-[#796763]">
          <div className="content-width flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Sistema de Gestión Escolar — Servicio Social Universitario IS-480 (2026-II)</span>
            <span>Planteles de Aplicación &quot;Guamán Poma de Ayala&quot; · UNSCH</span>
          </div>
        </footer>
      </div>
    </SessionProvider>
  );
}
