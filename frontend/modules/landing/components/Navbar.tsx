'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Phone,
  GraduationCap,
  LogIn,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const navItems = [
  { label: 'Inicio', href: '/' },
  { label: '¿Por qué elegirnos?', href: '/por-que-elegirnos' },
  { label: 'Niveles', href: '/niveles' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Testimonios', href: '/testimonios' },
  { label: 'Admisión 2027', href: '/admision' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Contacto', href: '/contacto' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Banner - Institutional Identity */}
      <div className="border-b border-brand-dark bg-brand-dark text-white text-[11px]">
        <div className="content-width flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
          <div className="flex items-center gap-2 font-medium text-accent-cream truncate">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-gold animate-pulse shrink-0" />
            <span className="font-semibold truncate">Universidad Nacional de San Cristóbal de Huamanga (UNSCH)</span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/90 shrink-0">Ayacucho, Perú · Cód. 050101</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80 shrink-0 text-[11px]">
            <a
              href="https://www.unsch.edu.pe/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition hover:text-accent-gold"
            >
              <span>Portal UNSCH</span>
              <ArrowUpRight size={11} />
            </a>
            <Link href="/intranet" className="flex items-center gap-1 transition hover:text-accent-gold font-medium">
              <Lock size={11} className="text-accent-gold" />
              <span>Intranet</span>
            </Link>
            <Link href="/admision" className="transition hover:text-accent-gold font-medium">
              Admisión 2027
            </Link>
            <Link href="/contacto" className="transition hover:text-accent-gold">
              Mesa de Partes
            </Link>
            <span className="hidden lg:inline-flex items-center gap-1 font-mono text-accent-gold">
              <Phone size={11} />
              (066) 312510
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="content-width flex h-[82px] items-center justify-between gap-3">
          {/* Institution Logo & Title */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm group-hover:border-accent-gold transition-colors"
            >
              <img
                src="/emblema-unsch-grabado.png"
                alt="Emblema Heráldico Universitario Grabado - UNSCH"
                width={44}
                height={44}
                className="h-full w-full object-contain filter drop-shadow-sm"
              />
            </motion.div>
            <div className="shrink-0">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-accent-rouge">
                <span className="rounded bg-brand/10 px-1 py-0.2 text-[9px] font-black text-brand">UNSCH</span>
                <span className="text-gray-300">·</span>
                <span className="text-accent-gold">Colegio de Aplicación</span>
              </div>
              <h1 className="text-sm sm:text-base font-black leading-tight tracking-[-0.02em] text-brand">
                Guamán Poma de Ayala
              </h1>
              <p className="hidden md:block text-[9.5px] font-medium text-gray-500">
                Universidad Nacional de San Cristóbal de Huamanga
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-0.5 xl:flex">
            {navItems.map(item => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-lg px-2 py-1.5 text-xs 2xl:px-2.5 2xl:text-[13px] font-bold transition-all duration-150 whitespace-nowrap',
                    active
                      ? 'text-brand font-black'
                      : 'text-gray-700 hover:bg-accent-ivory hover:text-brand'
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-x-1.5 -bottom-1 h-[2px] rounded-full bg-brand"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Intranet / Iniciar Sesión Button */}
            <Link
              href="/intranet"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] whitespace-nowrap shrink-0',
                pathname === '/intranet'
                  ? 'border-brand bg-brand text-white shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand hover:text-brand hover:bg-accent-ivory shadow-sm'
              )}
            >
              <LogIn size={13} className={pathname === '/intranet' ? 'text-white' : 'text-brand'} />
              <span>Intranet</span>
            </Link>

            {/* Admisión 2027 Button */}
            <Link
              href="/admision"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-light hover:shadow-lg active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <GraduationCap size={14} />
              <span>Admisión 2027</span>
              <ArrowRight size={12} className="hidden sm:inline" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-gray-300 p-2 text-brand transition hover:bg-accent-ivory active:scale-95 xl:hidden shrink-0"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-gray-200 bg-white px-6 py-4 shadow-2xl xl:hidden overflow-hidden"
            >
              <div className="grid gap-1">
                {navItems.map(item => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors',
                        active
                          ? 'bg-brand/10 text-brand font-black'
                          : 'text-gray-800 hover:bg-accent-ivory hover:text-brand'
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={15} className={active ? 'text-brand' : 'text-gray-400'} />
                    </Link>
                  );
                })}

                {/* Mobile CTAs: Intranet & Admisión */}
                <div className="mt-3 grid gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href="/intranet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-accent-ivory py-3 text-center text-sm font-bold text-brand shadow-sm hover:bg-white transition-colors"
                  >
                    <LogIn size={16} />
                    <span>Intranet / Iniciar Sesión</span>
                  </Link>

                  <Link
                    href="/admision"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-center text-sm font-bold text-white shadow hover:bg-brand-dark transition-colors"
                  >
                    <GraduationCap size={16} />
                    <span>Proceso de Admisión 2027</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
