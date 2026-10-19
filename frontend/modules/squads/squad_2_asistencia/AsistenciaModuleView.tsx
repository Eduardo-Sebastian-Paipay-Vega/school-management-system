'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, CheckCircle2, Wifi, WifiOff, Clock, UserCheck, ShieldCheck } from 'lucide-react';

export default function AsistenciaModuleView() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [lastScanned, setLastScanned] = useState({
    nombre: 'Huamán Quispe, Bryan Alexander',
    grado: 'Secundaria - 3° "B"',
    hora: '07:48:12 AM',
    estado: 'Puntual',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/intranet"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:text-brand hover:border-brand transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
                Squad 2 · Matrícula y Asistencia
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500 font-mono">RF-15 a RF-35</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Kiosco de Portería y Registro de Asistencia QR
            </h2>
          </div>
        </div>

        {/* Offline / Online toggle for testing */}
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
            offlineMode
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {offlineMode ? <WifiOff size={15} /> : <Wifi size={15} />}
          <span>{offlineMode ? 'Modo Kiosco Offline (IndexedDB)' : 'En Línea (<200ms)'}</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Scanner Simulation */}
        <div className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
              <QrCode size={20} className="text-brand" />
              <span>Lector de Carnés Escolares QR</span>
            </h3>
            <span className="text-xs font-mono bg-accent-ivory px-2.5 py-1 rounded-full text-brand font-bold border border-gray-200">
              Cámara Activa
            </span>
          </div>

          <div className="relative aspect-video rounded-2xl bg-gray-900 flex flex-col items-center justify-center text-white overflow-hidden border-2 border-dashed border-accent-gold/40">
            <div className="w-48 h-48 border-2 border-accent-gold rounded-2xl flex items-center justify-center animate-pulse">
              <QrCode size={80} className="text-accent-gold/70" />
            </div>
            <p className="mt-4 text-xs font-mono text-gray-300">
              Acerque el código QR del carné al visor de la portería
            </p>
          </div>

          <div className="rounded-2xl bg-accent-ivory p-4 border border-accent-cream flex items-center justify-between text-xs">
            <span className="text-gray-600">Velocidad de procesamiento por evento:</span>
            <span className="font-mono font-black text-utility-success">142 ms (&lt; 200 ms SLA)</span>
          </div>
        </div>

        {/* Latest Scan Card */}
        <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent-gold">
              Último Registro Confirmado
            </span>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xl">
                HQ
              </div>
              <div>
                <h4 className="text-base font-black text-brand-dark">{lastScanned.nombre}</h4>
                <p className="text-xs text-gray-500">{lastScanned.grado}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Hora de ingreso:</span>
                <span className="font-mono font-bold text-gray-900">{lastScanned.hora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Condición:</span>
                <span className="font-bold text-utility-success">{lastScanned.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cola local de sincronización:</span>
                <span className="font-mono text-gray-600">0 pendientes</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-utility-success/10 border border-utility-success/20 p-4 text-xs text-utility-success flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Notificación a padres enviada vía WebSocket</span>
          </div>
        </div>
      </div>
    </div>
  );
}
