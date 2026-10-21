import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function IntranetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
      {/* Top Banner */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="content-width flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-accent-ivory/60 px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-brand hover:border-brand transition"
            >
              <ArrowLeft size={14} />
              <span>Portal Web</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl border border-gray-200 bg-white p-1 shadow-xs">
                <img
                  src="/emblema-unsch-grabado.png"
                  alt="UNSCH"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-black text-brand-dark leading-tight">
                  Intranet Guamán Poma
                </h1>
                <p className="text-[10px] text-gray-500 font-medium">
                  Universidad Nacional de San Cristóbal de Huamanga
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 font-mono text-[11px] bg-accent-ivory px-3 py-1.5 rounded-full border border-gray-200">
            <ShieldCheck size={14} className="text-utility-success" />
            <span className="hidden sm:inline">Servidor Seguro</span>
            <span>SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Main Intranet Content */}
      <main className="flex-1 content-width py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <div className="content-width flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistema de Gestión Escolar — Servicio Social Universitario IS-480 (2026-II)</span>
          <span>Planteles de Aplicación &quot;Guamán Poma de Ayala&quot; · UNSCH</span>
        </div>
      </footer>
    </div>
  );
}
