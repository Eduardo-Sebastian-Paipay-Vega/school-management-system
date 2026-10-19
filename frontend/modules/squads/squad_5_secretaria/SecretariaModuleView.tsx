'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, QrCode, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SecretariaModuleView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
        <Link
          href="/intranet"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:text-brand hover:border-brand transition shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
              Squad 5 · Secretaría y Portal
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500 font-mono">RF-59 a RF-64</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
            Emisión de Boletas Oficiales y Verificador QR SHA-256
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
            <FileText size={22} />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Generador Masivo de Libretas Escolares</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Exportación vectorial en PDF con membrete institucional de la UNSCH, firma digital y sello oficial para los tres niveles (Inicial, Primaria, Secundaria).
          </p>
          <button
            onClick={() => alert('Generando boletas oficiales en formato PDF vectorial...')}
            className="flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-brand-dark transition"
          >
            <Download size={14} />
            <span>Generar Lote del Bimestre</span>
          </button>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
            <QrCode size={22} />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Verificación Pública de Autenticidad</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Permite a apoderados y universidades verificar la validez de un certificado o libreta mediante escaneo de su código QR único con firma criptográfica SHA-256.
          </p>
          <div className="rounded-2xl bg-accent-ivory p-4 border border-accent-cream text-xs flex items-center gap-3">
            <ShieldCheck size={20} className="text-utility-success shrink-0" />
            <span className="text-gray-700">Endpoint público activo: <code>/api/v1/public/verify/:token</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
