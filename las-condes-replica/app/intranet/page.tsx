'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Building2,
  LogIn,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function IntranetPage() {
  const [role, setRole] = useState<'estudiante' | 'docente' | 'administrativo'>('estudiante');
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
    }, 1200);
  };

  return (
    <div className="bg-white min-h-[calc(100vh-86px)] flex flex-col justify-between">
      {/* Top Breadcrumb banner */}
      <div className="border-b border-gray-200 bg-accent-ivory/50 py-3.5">
        <div className="content-width flex items-center justify-between text-xs">
          <nav className="flex items-center gap-2 font-semibold text-gray-500">
            <Link href="/" className="hover:text-brand transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-brand font-black">Portal Intranet</span>
          </nav>
          <div className="flex items-center gap-2 text-gray-600 font-mono text-[11px]">
            <ShieldCheck size={14} className="text-utility-success" />
            <span>Servidor Seguro SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="content-width py-14 flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-12 items-center">
          {/* Left Column: Identity & Features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                <img
                  src="/emblema-unsch-grabado.png"
                  alt="Escudo UNSCH Grabado"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase tracking-wider">
                  Sistema Integrado UNSCH
                </span>
                <h2 className="text-xl font-black text-brand-dark">Intranet Guamán Poma</h2>
                <p className="text-xs text-gray-500">Gestión Académica y Escolar</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Bienvenido al portal institucional de acceso para estudiantes, familias, docentes y personal
              administrativo de los Planteles de Aplicación de la UNSCH.
            </p>

            <div className="space-y-3 border-t border-gray-100 pt-5 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <span>Consulta de boletas de notas bimestrales y asistencia en tiempo real.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <span>Comunicados oficiales de aula, tareas y cronograma de exámenes.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <span>Planificación curricular y registro de competencias docentes.</span>
              </div>
            </div>

            <div className="rounded-2xl border border-accent-cream bg-accent-ivory/60 p-4 text-xs text-gray-600">
              <p className="font-bold text-brand-dark flex items-center gap-1.5">
                <HelpCircle size={15} className="text-brand" />
                <span>¿Primera vez que ingresas?</span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Tu usuario es tu número de DNI o código de estudiante otorgado en la ficha de matrícula. La clave
                inicial fue remitida a tu correo registrado.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-elevated"
            >
              {loginSuccess ? (
                <div className="py-10 text-center fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-utility-success/15 text-utility-success">
                    <CheckCircle2 size={38} />
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-brand-dark">
                    ¡Sesión Iniciada con Éxito!
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                    Bienvenido al sistema como <strong>{role.toUpperCase()}</strong> ({usuario}).
                  </p>

                  <div className="mt-6 rounded-2xl bg-accent-ivory p-4 border border-accent-cream text-xs text-left space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Estado de Matrícula 2026:</span>
                      <span className="font-extrabold text-utility-success">Activo / Regular</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Último acceso registrado:</span>
                      <span className="font-mono text-gray-500">Hoy, {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Módulo activo:</span>
                      <span className="font-bold text-brand">Portal de Notas y Asistencia</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setLoginSuccess(false)}
                      className="flex-1 rounded-full border border-gray-300 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cerrar Sesión
                    </button>
                    <Link
                      href="/"
                      className="flex-1 rounded-full bg-brand py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-dark transition text-center"
                    >
                      Volver al Inicio
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-b border-gray-100 pb-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent-gold">
                      Acceso Seguro
                    </span>
                    <h3 className="mt-1 text-2xl font-black text-brand-dark">
                      Iniciar Sesión en la Intranet
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Selecciona tu perfil institucional e ingresa tus credenciales.
                    </p>
                  </div>

                  {/* Profile Role Selector */}
                  <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-accent-ivory p-1.5 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setRole('estudiante')}
                      className={cn(
                        'flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all',
                        role === 'estudiante'
                          ? 'bg-white text-brand shadow-sm font-black'
                          : 'text-gray-600 hover:text-brand'
                      )}
                    >
                      <GraduationCap size={15} />
                      <span className="truncate">Estudiante / Familia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('docente')}
                      className={cn(
                        'flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all',
                        role === 'docente'
                          ? 'bg-white text-brand shadow-sm font-black'
                          : 'text-gray-600 hover:text-brand'
                      )}
                    >
                      <Users size={15} />
                      <span>Docente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('administrativo')}
                      className={cn(
                        'flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all',
                        role === 'administrativo'
                          ? 'bg-white text-brand shadow-sm font-black'
                          : 'text-gray-600 hover:text-brand'
                      )}
                    >
                      <Briefcase size={15} />
                      <span>Administrativo</span>
                    </button>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="mt-6 grid gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        {role === 'estudiante'
                          ? 'DNI o Código de Estudiante *'
                          : role === 'docente'
                          ? 'DNI o Código de Docente UNSCH *'
                          : 'Usuario Administrativo / DNI *'}
                      </label>
                      <div className="relative mt-1.5">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type="text"
                          placeholder={role === 'estudiante' ? 'Ej. 74892134' : 'Ej. D-45920'}
                          value={usuario}
                          onChange={e => setUsuario(e.target.value)}
                          className="w-full rounded-2xl border border-gray-300 bg-accent-ivory/40 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Contraseña *
                        </label>
                        <Link
                          href="/contacto"
                          className="text-[11px] font-bold text-brand hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <div className="relative mt-1.5">
                        <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full rounded-2xl border border-gray-300 bg-accent-ivory/40 py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                          aria-label="Ver u ocultar contraseña"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="rounded border-gray-300 text-brand focus:ring-brand h-4 w-4"
                        />
                        <span>Mantener sesión iniciada</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 disabled:opacity-70 transition"
                    >
                      {isLoading ? (
                        <span>Validando credenciales...</span>
                      ) : (
                        <>
                          <LogIn size={15} />
                          <span>Ingresar a la Intranet</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-gray-400">
                      Acceso regulado según la Ley N° 29733 de Protección de Datos Personales.
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Security Footer notice */}
      <div className="border-t border-gray-100 bg-accent-ivory/40 py-4 text-center text-[11px] text-gray-500">
        <div className="content-width flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Centro de Tecnologías de la Información · UNSCH</span>
          <span>Mesa de Ayuda Informática: soporte@guamanpoma-unsch.edu.pe</span>
        </div>
      </div>
    </div>
  );
}
