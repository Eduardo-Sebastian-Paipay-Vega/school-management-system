'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Briefcase,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole, UserSession } from '../types';

interface LoginFormProps {
  onSuccess: (session: UserSession) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [role, setRole] = useState<UserRole>('estudiante');
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !password) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess({
        usuario,
        role,
        nombreCompleto:
          role === 'docente'
            ? 'Docente UNSCH - Mg. Quispe'
            : role === 'administrativo'
            ? 'Administrador del Plantel'
            : 'Estudiante Regular',
        email: `${usuario.toLowerCase()}@guamanpoma-unsch.edu.pe`,
        tenantId: 'unsch-guaman-poma-2026',
      });
    }, 900);
  };

  return (
    <div>
      <div className="border-b border-gray-100 pb-5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent-gold">
          Acceso Institucional
        </span>
        <h3 className="mt-1 text-2xl font-black text-brand-dark">
          Iniciar Sesión en la Intranet
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Selecciona tu rol en los Planteles de Aplicación e ingresa tus credenciales.
        </p>
      </div>

      {/* Selector de Rol */}
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
          <span className="truncate">Estudiante</span>
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

      {/* Formulario */}
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
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <ShieldCheck size={13} className="text-utility-success" />
            <span>SSL 256-bit</span>
          </div>
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
  );
}
