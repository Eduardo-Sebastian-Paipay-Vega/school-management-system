'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole, UserSession } from '../types';

interface LoginFormProps {
  onSuccess: (session: UserSession) => void;
}

const roleOptions = [
  { id: 'estudiante' as const, label: 'Estudiante', icon: GraduationCap },
  { id: 'docente' as const, label: 'Docente', icon: Users },
  { id: 'administrativo' as const, label: 'Administrativo', icon: Briefcase },
];

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [role, setRole] = useState<UserRole>('estudiante');
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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

      {/* Selector de Rol con pastilla deslizante (layoutId spring physics) */}
      <div
        role="tablist"
        aria-label="Seleccionar rol de usuario"
        className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-accent-ivory/80 p-1.5 border border-gray-200 relative"
      >
        {roleOptions.map(({ id, label, icon: Icon }) => {
          const isActive = role === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setRole(id)}
              className={cn(
                'relative flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-colors duration-150 z-10 select-none outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                isActive ? 'text-brand font-black' : 'text-gray-600 hover:text-brand'
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRoleIndicator"
                  className="absolute inset-0 rounded-xl bg-white shadow-xs border border-gray-200/70 -z-10"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 450, damping: 35 }
                  }
                />
              )}
              <Icon
                size={15}
                className={cn(
                  'shrink-0 transition-transform duration-150',
                  isActive ? 'scale-105 text-brand' : 'text-gray-500'
                )}
              />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulario */}
      <form onSubmit={handleLogin} className="mt-6 grid gap-4">
        <div>
          <div className="h-4 overflow-hidden">
            <motion.label
              key={role}
              initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
              className="block text-xs font-extrabold uppercase tracking-wider text-gray-700"
            >
              {role === 'estudiante'
                ? 'DNI o Código de Estudiante *'
                : role === 'docente'
                ? 'DNI o Código de Docente UNSCH *'
                : 'Usuario Administrativo / DNI *'}
            </motion.label>
          </div>
          <div className="relative mt-1.5">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-150" />
            <input
              required
              type="text"
              placeholder={role === 'estudiante' ? 'Ej. 74892134' : 'Ej. D-45920'}
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-accent-ivory/40 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-150 ease-out focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
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
              className="text-[11px] font-bold text-brand hover:underline transition-colors duration-150"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-150" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-accent-ivory/40 py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-150 ease-out focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
            />
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-150 p-1 rounded-lg"
              aria-label="Ver u ocultar contraseña"
            >
              <AnimatePresence mode="wait" initial={false}>
                {showPassword ? (
                  <motion.span
                    key="eyeOff"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.12 }}
                    className="block"
                  >
                    <EyeOff size={17} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="eyeOn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.12 }}
                    className="block"
                  >
                    <Eye size={17} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-brand focus:ring-brand h-4 w-4 transition-colors duration-150"
            />
            <span>Mantener sesión iniciada</span>
          </label>
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <ShieldCheck size={13} className="text-utility-success" />
            <span>SSL 256-bit</span>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={shouldReduceMotion || isLoading ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-2 relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-[0.98] disabled:opacity-75 transition-colors duration-150"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.span
                key="loading"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="flex items-center gap-2"
              >
                <Loader2 size={16} className="animate-spin will-change-transform" />
                <span>Validando credenciales...</span>
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="flex items-center gap-2"
              >
                <LogIn size={15} />
                <span>Ingresar a la Intranet</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <p className="text-center text-[11px] text-gray-400">
          Acceso regulado según la Ley N° 29733 de Protección de Datos Personales.
        </p>
      </form>
    </div>
  );
}

