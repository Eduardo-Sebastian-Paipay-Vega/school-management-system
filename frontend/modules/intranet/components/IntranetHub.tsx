'use client';

import Link from 'next/link';
import {
  Shield,
  QrCode,
  TableProperties,
  BarChart3,
  FileCheck2,
  LogOut,
  ArrowRight,
  School,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserSession, SquadModuleInfo } from '../types';

interface IntranetHubProps {
  session: UserSession;
  onLogout: () => void;
}

const squadModules: SquadModuleInfo[] = [
  {
    id: 'squad-1',
    squadNumber: 1,
    title: 'Core, Usuarios y Auditoría',
    description: 'Gestión de accesos, roles RBAC, configuración de sedes y trazabilidad inmutable Ley 29733.',
    iconName: 'Shield',
    badge: 'M1-M3 · RF-01 a RF-14',
    route: '/intranet/usuarios',
    allowedRoles: ['administrativo', 'directivo'],
  },
  {
    id: 'squad-2',
    squadNumber: 2,
    title: 'Matrícula y Asistencia Kiosco',
    description: 'Registro de asistencia offline-first por QR (<200ms), carnetización y control de horas SSU.',
    iconName: 'QrCode',
    badge: 'M4-M7 · RF-15 a RF-35',
    route: '/intranet/asistencia',
    allowedRoles: ['administrativo', 'docente', 'directivo'],
  },
  {
    id: 'squad-3',
    squadNumber: 3,
    title: 'Calificaciones y Modo Excel',
    description: 'Planilla ultra-rápida por teclado (60 FPS), debounce 400ms y conclusiones descriptivas MINEDU.',
    iconName: 'TableProperties',
    badge: 'M8 · RF-36 a RF-46',
    route: '/intranet/calificaciones',
    allowedRoles: ['docente', 'administrativo', 'directivo'],
  },
  {
    id: 'squad-4',
    squadNumber: 4,
    title: 'Analítica y Ficha 360°',
    description: 'Mapas de calor interactivos, monitoreo de riesgo de deserción y radar chart integral de estudiantes.',
    iconName: 'BarChart3',
    badge: 'M9-M10 · RF-47 a RF-58',
    route: '/intranet/analitica',
    allowedRoles: ['administrativo', 'directivo', 'docente'],
  },
  {
    id: 'squad-5',
    squadNumber: 5,
    title: 'Secretaría y Verificación QR',
    description: 'Generación de libretas en PDF vectorial oficial y validador público de autenticidad SHA-256.',
    iconName: 'FileCheck2',
    badge: 'M11-M13 · RF-59 a RF-64',
    route: '/intranet/libretas',
    allowedRoles: ['administrativo', 'docente', 'directivo', 'estudiante'],
  },
];

export default function IntranetHub({ session, onLogout }: IntranetHubProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return <Shield className="text-brand h-6 w-6" />;
      case 'QrCode':
        return <QrCode className="text-brand h-6 w-6" />;
      case 'TableProperties':
        return <TableProperties className="text-brand h-6 w-6" />;
      case 'BarChart3':
        return <BarChart3 className="text-brand h-6 w-6" />;
      case 'FileCheck2':
        return <FileCheck2 className="text-brand h-6 w-6" />;
      default:
        return <School className="text-brand h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Session Header Card */}
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-r from-brand-dark via-brand to-brand-dark p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20">
              <img
                src="/emblema-unsch-grabado.png"
                alt="Emblema UNSCH"
                width={42}
                height={42}
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent-gold/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-gold">
                  {session.role.toUpperCase()}
                </span>
                <span className="text-xs text-white/60">·</span>
                <span className="text-xs font-mono text-white/80">{session.tenantId}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{session.nombreCompleto}</h2>
              <p className="text-xs text-white/70">{session.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition active:scale-95 self-start sm:self-auto"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Status indicators */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-accent-gold" />
            <span className="text-white/90">Año Lectivo: <strong>2026-II</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent-gold" />
            <span className="text-white/90">Bimestre: <strong>III Bimestre</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <School size={16} className="text-accent-gold" />
            <span className="text-white/90">Sede: <strong>Guamán Poma</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-gold" />
            <span className="text-white/90">Sistema: <strong>IS-480 SSU</strong></span>
          </div>
        </div>
      </div>

      {/* Modules Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-brand-dark">
              Módulos Especializados del Sistema
            </h3>
            <p className="text-xs text-gray-500">
              Acceso unificado según los 5 Squads Técnicos del Sistema de Gestión Escolar.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {squadModules.map(mod => {
            const hasAccess = mod.allowedRoles.includes(session.role);
            return (
              <div
                key={mod.id}
                className={`flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                  hasAccess
                    ? 'border-gray-200 bg-white hover:border-brand hover:shadow-card group'
                    : 'border-gray-200 bg-gray-50/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 border border-brand/10 group-hover:bg-brand/10 transition-colors">
                      {getIcon(mod.iconName)}
                    </div>
                    <span className="rounded-full bg-accent-ivory px-2.5 py-1 text-[10px] font-extrabold text-brand uppercase border border-gray-200">
                      Squad {mod.squadNumber}
                    </span>
                  </div>

                  <h4 className="mt-4 text-base font-black text-brand-dark group-hover:text-brand transition-colors">
                    {mod.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-gray-400">
                    {mod.badge}
                  </span>

                  {hasAccess ? (
                    <Link
                      href={mod.route}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-brand hover:underline"
                    >
                      <span>Abrir módulo</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400 italic">
                      Sin acceso para tu rol
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
