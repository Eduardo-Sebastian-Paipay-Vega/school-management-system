'use client';

import { useState } from 'react';
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
  Search,
  Bell,
  Users,
  GraduationCap,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { UserRole, UserSession, SquadModuleInfo } from '../types';

interface IntranetHubProps {
  session?: UserSession;
  onLogout?: () => void;
}

const squadModules: SquadModuleInfo[] = [
  {
    id: 'squad-1',
    squadNumber: 1,
    title: 'Core, Identidad y Auditoría Ley 29733',
    description: 'Gestión de roles RBAC, directiva de privacidad, autenticación segura y cadena de hashes inmutable.',
    iconName: 'Shield',
    badge: 'M1, M2, M3, M12 · RF-01 a RF-14',
    route: '/intranet/usuarios',
    allowedRoles: ['administrativo', 'directivo'],
  },
  {
    id: 'squad-2',
    squadNumber: 2,
    title: 'Matrícula y Asistencia Kiosco Offline',
    description: 'Kiosco de portería (<200ms), carnetización con QR criptográfico, buffer IndexedDB y sincronización masiva.',
    iconName: 'QrCode',
    badge: 'M4, M5, M6, M7 · RF-15 a RF-35',
    route: '/intranet/asistencia',
    allowedRoles: ['administrativo', 'docente', 'directivo'],
  },
  {
    id: 'squad-3',
    squadNumber: 3,
    title: 'Calificaciones y Planilla Modo Excel (60 FPS)',
    description: 'Navegación fluida por teclado, autoguardado con debounce de 400ms, conclusiones descriptivas y motor CNEB.',
    iconName: 'TableProperties',
    badge: 'M8 · RF-36 a RF-46',
    route: '/intranet/calificaciones',
    allowedRoles: ['docente', 'administrativo', 'directivo'],
  },
  {
    id: 'squad-4',
    squadNumber: 4,
    title: 'Analítica, Ficha 360° y Alerta Temprana',
    description: 'Mapas de calor interactivos, modelo de prevención de deserción escolar y radar chart multidimensional.',
    iconName: 'BarChart3',
    badge: 'M9, M10 · RF-47 a RF-58',
    route: '/intranet/analitica',
    allowedRoles: ['administrativo', 'directivo', 'docente'],
  },
  {
    id: 'squad-5',
    squadNumber: 5,
    title: 'Secretaría, Libretas PDF y Verificador QR',
    description: 'Generación vectorial de libretas escolares oficiales UNSCH y verificador público de autenticidad SHA-256.',
    iconName: 'FileCheck2',
    badge: 'M11, M13 · RF-59 a RF-64',
    route: '/intranet/libretas',
    allowedRoles: ['administrativo', 'docente', 'directivo', 'estudiante'],
  },
];

const mockAuditLogs = [
  {
    id: 'LOG-8841',
    hora: '08:42:15',
    usuario: 'Huamán Quispe, Bryan',
    rol: 'Estudiante',
    operacion: 'Marcación de ingreso Kiosco QR (142 ms)',
    squad: 'Squad 2',
    estado: 'Puntual',
    tipo: 'success',
    hash: 'sha256:7f4a...92b1',
  },
  {
    id: 'LOG-8840',
    hora: '08:35:00',
    usuario: 'Mg. Steve Ovalle Luyo',
    rol: 'Docente',
    operacion: 'Autoguardado 400ms Planilla Matemática 4° B',
    squad: 'Squad 3',
    estado: 'Guardado',
    tipo: 'info',
    hash: 'sha256:88a1...441e',
  },
  {
    id: 'LOG-8839',
    hora: '08:21:40',
    usuario: 'Eduardo Paipay Vega',
    rol: 'Administrativo',
    operacion: 'Verificación pública de libreta QR SHA-256',
    squad: 'Squad 5',
    estado: 'Verificado',
    tipo: 'success',
    hash: 'sha256:12c0...f89a',
  },
  {
    id: 'LOG-8838',
    hora: '07:55:10',
    usuario: 'Sistema Core S1',
    rol: 'Auditoría',
    operacion: 'Chequeo de integridad de cadena inmutable Ley 29733',
    squad: 'Squad 1',
    estado: 'Cadena Válida',
    tipo: 'success',
    hash: 'sha256:bb01...55da',
  },
];

export default function IntranetHub({ session, onLogout }: IntranetHubProps) {
  // Manejo de rol activo simulado para pruebas de permisos en PrimeNG
  const [activeRole, setActiveRole] = useState<UserRole>(session?.role || 'docente');
  const [activeTab, setActiveTab] = useState<'todos' | 'academico' | 'gestion' | 'analitica'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const currentSession: UserSession = session || {
    usuario: 'sebas',
    role: activeRole,
    nombreCompleto:
      activeRole === 'docente'
        ? 'Mg. Steve Ovalle Luyo (Sub Líder - Squad 3)'
        : activeRole === 'administrativo'
        ? 'Eduardo Sebastian Paipay Vega (Líder General)'
        : activeRole === 'directivo'
        ? 'Dirección General de Planteles UNSCH'
        : 'Estudiante Regular — Secundaria 4° A',
    email: `${activeRole}@guamanpoma-unsch.edu.pe`,
    tenantId: 'unsch-guaman-poma-2026',
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return <Shield className="text-brand h-5 w-5" />;
      case 'QrCode':
        return <QrCode className="text-brand h-5 w-5" />;
      case 'TableProperties':
        return <TableProperties className="text-brand h-5 w-5" />;
      case 'BarChart3':
        return <BarChart3 className="text-brand h-5 w-5" />;
      case 'FileCheck2':
        return <FileCheck2 className="text-brand h-5 w-5" />;
      default:
        return <School className="text-brand h-5 w-5" />;
    }
  };

  const filteredModules = squadModules.filter(m => {
    if (activeTab === 'academico') return m.squadNumber === 3 || m.squadNumber === 5;
    if (activeTab === 'gestion') return m.squadNumber === 1 || m.squadNumber === 2;
    if (activeTab === 'analitica') return m.squadNumber === 4;
    return true;
  }).filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. PrimeNG Toolbar (p-toolbar) Pattern                     */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: PrimeNG Breadcrumbs + Context */}
        <div className="flex items-center gap-2 text-xs">
          <Link href="/" className="flex items-center gap-1 font-bold text-gray-500 hover:text-brand transition">
            <School size={14} className="text-brand" />
            <span>UNSCH</span>
          </Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="font-extrabold text-brand-dark">Intranet</span>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="rounded bg-brand/10 px-2 py-0.5 font-black text-brand text-[11px] uppercase tracking-wider">
            Año 2026-II · III Bimestre
          </span>
        </div>

        {/* Right: PrimeNG SelectButton (Role Switcher) + Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Input with Icon */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar squad o función..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-8.5 rounded-xl border border-gray-200 bg-slate-50 pl-8.5 pr-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 transition"
            />
          </div>

          {/* Role Switcher - PrimeNG SelectButton */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-gray-200 text-xs">
            <button
              onClick={() => setActiveRole('docente')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition-all ${
                activeRole === 'docente' ? 'bg-white text-brand shadow-xs font-black' : 'text-gray-600 hover:text-brand'
              }`}
            >
              <Users size={12} />
              <span>Docente</span>
            </button>
            <button
              onClick={() => setActiveRole('administrativo')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition-all ${
                activeRole === 'administrativo' ? 'bg-white text-brand shadow-xs font-black' : 'text-gray-600 hover:text-brand'
              }`}
            >
              <Briefcase size={12} />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setActiveRole('estudiante')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition-all ${
                activeRole === 'estudiante' ? 'bg-white text-brand shadow-xs font-black' : 'text-gray-600 hover:text-brand'
              }`}
            >
              <GraduationCap size={12} />
              <span>Estudiante</span>
            </button>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PrimeNG Card Header / Institutional Banner              */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-dark via-brand to-brand-dark p-6 sm:p-7 text-white shadow-elevated">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-inner">
              <img
                src="/emblema-unsch-grabado.png"
                alt="Emblema UNSCH"
                width={40}
                height={40}
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-dark">
                  Perfil Activo: {activeRole.toUpperCase()}
                </span>
                <span className="text-xs text-white/50">|</span>
                <span className="font-mono text-xs text-accent-cream">Sede Central Guamán Poma</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">{currentSession.nombreCompleto}</h2>
              <p className="text-xs text-white/70 font-mono">{currentSession.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <div className="rounded-2xl bg-white/10 px-4 py-2 border border-white/15 backdrop-blur-md text-xs">
              <span className="text-white/60 block text-[10px] uppercase font-bold">Estado del Sistema</span>
              <span className="text-emerald-300 font-black flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Operativo 100% · IS-480
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="pointer-events-none absolute -right-6 -bottom-10 opacity-10">
          <School size={200} />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PrimeNG KPI Stat Cards (p-card)                         */}
      {/* ========================================================= */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs hover:border-brand/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Matrícula 2026</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
              100% Cobertura
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-dark">842</span>
            <span className="text-[11px] font-medium text-gray-500">3 Niveles Activos</span>
          </div>
          <div className="mt-2 text-[10.5px] text-gray-500 flex items-center gap-1 border-t border-gray-100 pt-2">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Inicial (120), Prim (340), Sec (382)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs hover:border-brand/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Asistencia Hoy (Kiosco)</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
              &lt; 180 ms
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-dark">96.4%</span>
            <span className="text-[11px] font-medium text-gray-500">784 Marcaciones</span>
          </div>
          <div className="mt-2 text-[10.5px] text-gray-500 flex items-center gap-1 border-t border-gray-100 pt-2">
            <QrCode size={12} className="text-blue-600" />
            <span>Buffer Offline en IndexedDB OK</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs hover:border-brand/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Planillas Modo Excel</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
              Debounce 400ms
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-dark">24 / 26</span>
            <span className="text-[11px] font-medium text-gray-500">92% Cerradas</span>
          </div>
          <div className="mt-2 text-[10.5px] text-gray-500 flex items-center gap-1 border-t border-gray-100 pt-2">
            <TableProperties size={12} className="text-amber-600" />
            <span>Motor CNEB: AD, A, B, C</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs hover:border-brand/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Alerta de Deserción</span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
              Ficha 360°
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-dark">3 Casos</span>
            <span className="text-[11px] font-medium text-gray-500">Prioridad Alta</span>
          </div>
          <div className="mt-2 text-[10.5px] text-gray-500 flex items-center gap-1 border-t border-gray-100 pt-2">
            <AlertTriangle size={12} className="text-rose-600" />
            <span>Monitoreo tutoría activo</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. PrimeNG TabView Navigation Pattern                      */}
      {/* ========================================================= */}
      <div className="border-b border-gray-200 flex items-center gap-2 overflow-x-auto text-xs font-bold text-gray-500">
        <button
          onClick={() => setActiveTab('todos')}
          className={`pb-3 px-3 transition-colors relative whitespace-nowrap ${
            activeTab === 'todos' ? 'text-brand font-black' : 'hover:text-gray-900'
          }`}
        >
          <span>Todos los Squads (5)</span>
          {activeTab === 'todos' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-brand rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('academico')}
          className={`pb-3 px-3 transition-colors relative whitespace-nowrap ${
            activeTab === 'academico' ? 'text-brand font-black' : 'hover:text-gray-900'
          }`}
        >
          <span>Académico & Notas (Squad 3 y 5)</span>
          {activeTab === 'academico' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-brand rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('gestion')}
          className={`pb-3 px-3 transition-colors relative whitespace-nowrap ${
            activeTab === 'gestion' ? 'text-brand font-black' : 'hover:text-gray-900'
          }`}
        >
          <span>Gestión & Asistencia (Squad 1 y 2)</span>
          {activeTab === 'gestion' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-brand rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analitica')}
          className={`pb-3 px-3 transition-colors relative whitespace-nowrap ${
            activeTab === 'analitica' ? 'text-brand font-black' : 'hover:text-gray-900'
          }`}
        >
          <span>Analítica & Métricas (Squad 4)</span>
          {activeTab === 'analitica' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. PrimeNG Squad Modules Grid (p-card)                     */}
      {/* ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map(mod => {
          const hasAccess = mod.allowedRoles.includes(activeRole);
          return (
            <div
              key={mod.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all bg-white ${
                hasAccess
                  ? 'border-gray-200 hover:border-brand hover:shadow-card group'
                  : 'border-gray-200/60 bg-gray-50/50 opacity-60'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/5 border border-brand/10 text-brand group-hover:bg-brand/10 transition-colors">
                    {getIcon(mod.iconName)}
                  </div>
                  <span className="rounded-full bg-accent-ivory px-2.5 py-1 text-[10px] font-black text-brand uppercase border border-gray-200">
                    Squad {mod.squadNumber}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-black text-brand-dark group-hover:text-brand transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-3.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400 font-medium">
                  {mod.badge}
                </span>

                {hasAccess ? (
                  <Link
                    href={mod.route}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-white px-3 py-1.5 text-xs font-black text-brand hover:bg-brand hover:text-white transition shadow-2xs"
                  >
                    <span>Ingresar</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400 italic">
                    Restringido
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 6. PrimeNG DataTable Pattern (p-datatable)                 */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* DataTable Header Toolbar */}
        <div className="border-b border-gray-200 bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-brand-dark flex items-center gap-2">
              <Sparkles size={16} className="text-accent-gold" />
              <span>Actividad y Trazabilidad en Tiempo Real (Ley N° 29733)</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Registros criptográficos inmutables reportados por los 5 squads técnicos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
              En línea: WebSocket Activo
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-100/60 text-gray-600 font-extrabold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Operación / Evento</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Hash Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {mockAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-accent-ivory/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500 font-bold">{log.hora}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <div>{log.usuario}</div>
                    <span className="text-[10px] text-gray-400 font-normal">{log.rol}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{log.operacion}</td>
                  <td className="py-3 px-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {log.squad}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                      log.tipo === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      <CheckCircle2 size={11} />
                      {log.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                    {log.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginator / Table Footer */}
        <div className="border-t border-gray-100 bg-slate-50/50 px-6 py-3 flex items-center justify-between text-[11px] text-gray-500">
          <span>Mostrando 4 registros recientes auditados</span>
          <span className="font-mono text-[10.5px]">SLA &lt; 200ms · PostgreSQL 16 + Redis 7</span>
        </div>
      </div>
    </div>
  );
}
