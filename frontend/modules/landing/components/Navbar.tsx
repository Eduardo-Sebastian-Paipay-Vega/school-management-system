'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import BbdButton from './BbdButton';
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

const primaryBarLinks = [
  { label: 'Regeneración', href: '/#regen', rotation: '-2deg' },
  { label: 'Ambición', href: '/#ambition', rotation: '1.8deg' },
  { label: 'Ejes', href: '/#focus', rotation: '-1.5deg' },
  { label: 'Niveles', href: '/niveles', rotation: '2deg' },
  { label: 'Intranet', href: '/intranet', rotation: '-1.2deg' },
];

const drawerLinks = [
  { label: 'REGENERACIÓN', href: '/#regen' },
  { label: 'AMBICIÓN', href: '/#ambition' },
  { label: 'EJES FORMATIVOS', href: '/#focus' },
  { label: 'ADMISIÓN 2027', href: '/admision' },
  { label: 'INTRANET ESCOLAR', href: '/intranet' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <nav
      aria-label="Navegación principal"
      data-twostep-nav
      data-nav-status={menuOpen ? 'active' : 'not-active'}
      className="fixed inset-x-0 top-0 z-50 pointer-events-none"
    >
      {/* Backdrop overlay when Two-Step Menu is open */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500',
          menuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        )}
      />

      {/* Floating Two-Step Bar Container */}
      <div className="mx-auto w-full max-w-[1280px] px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="relative pointer-events-auto">
          {/* Guindo Expandable Background (.twostep-nav__back-bg) */}
          <div
            className={cn(
              ' relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.625,0.05,0,1)]',
              menuOpen
                ? 'bg-[color:var(--color-navbar)] rounded-[24px] p-2.5 sm:p-3 shadow-2xl'
                : 'bg-transparent rounded-[12px] p-0'
            )}
          >
            {/* Top Guindo Bar (.twostep-nav__top) */}
            <div className="relative z-10 flex min-h-[72px] sm:min-h-[80px] items-center justify-between gap-4 rounded-[12px] bg-[color:var(--color-navbar)] px-4 py-3 sm:px-6 sm:py-4 text-white shadow-[0_4px_24px_rgba(79,0,11,0.2)]">
              {/* Brand Logo (.twostep-nav__logo) */}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center gap-2.5 text-white focus-visible:outline-2"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 border border-[#E5E7EB]">
                  <Image
                    src="/emblema-unsch-grabado.webp"
                    alt="Emblema Oficial UNSCH"
                    width={28}
                    height={28}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="bbd-font-display text-[20px] sm:text-[23px] leading-none tracking-[-0.02em] text-white">
                  GUAMÁN POMA
                </span>
              </Link>

              {/* Center Navigation Links (.nav-menu-links) */}
              <div className="hidden lg:flex items-center gap-1">
                {primaryBarLinks.map((item) => {
                  const isActive =
                    item.href === pathname ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative inline-flex items-center justify-center px-4 py-2 font-roboto text-[16px] font-medium leading-[24px] text-white"
                    >
                      <span
                        style={{ '--rot': item.rotation } as React.CSSProperties}
                        className={cn(
                          'absolute inset-x-1.5 inset-y-1 rounded-full bg-[#9B2226] transition-transform duration-300 ease-out',
                          isActive
                            ? 'scale-100 rotate-[-1.5deg]'
                            : 'scale-0 group-hover:scale-100 group-hover:rotate-[var(--rot)]'
                        )}
                      />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right CTA & Hamburger Toggle (.nav-btn-wrap) */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:block">
                  <BbdButton
                    label="Admisión 2027"
                    href="/admision"
                    variant="purple"
                  />
                </div>

                {/* Mobile / Tablet Hamburger Toggle (.twostep-nav__toggle) */}
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                  aria-expanded={menuOpen}
                  aria-controls="bbd-twostep-drawer"
                  className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#9B2226] text-white transition-colors hover:bg-[#4F000B] lg:hidden"
                >
                  <div className="relative flex h-5 w-6 flex-col items-center justify-center">
                    <span
                      className={cn(
                        'block h-[2px] w-5 bg-white transition-transform duration-300',
                        menuOpen ? 'translate-y-[1px] rotate-45' : '-translate-y-[4px]'
                      )}
                    />
                    <span
                      className={cn(
                        'block h-[2px] w-5 bg-white transition-transform duration-300',
                        menuOpen ? '-translate-y-[1px] -rotate-45' : 'translate-y-[4px]'
                      )}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Expandable Bottom Drawer (.twostep-nav__bottom) */}
            <div
              id="bbd-twostep-drawer"
              className={cn(
                'grid transition-all duration-500 ease-[cubic-bezier(0.625,0.05,0,1)]',
                menuOpen
                  ? 'grid-rows-[1fr] opacity-100 pt-6 pb-3 px-2 sm:px-4'
                  : 'grid-rows-[0fr] opacity-0 pt-0 pb-0 px-2 pointer-events-none'
              )}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                  {/* Left Column: Big Condensed Links + Quick Portal Routes */}
                  <div className="flex flex-col items-start gap-3 lg:col-span-7">
                    {drawerLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="bbd-font-display text-[34px] sm:text-[42px] leading-[1.02] tracking-[-0.02em] text-white hover:text-[#F9A7B1] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}

                    <div className="mt-2">
                      <BbdButton
                        label="Contáctanos"
                        href="/contacto"
                        variant="purple"
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>

                    {/* Secondary portal links */}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/15 pt-4 text-xs text-white/80">
                      {navItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className="hover:text-[#F9A7B1] transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Featured Pink Card (THE PLAN FOR BRADFORD'S FUTURE adaptation) */}
                  <div className="rounded-[16px] bg-[#F9A7B1] p-6 sm:p-7 text-[#290006] lg:col-span-5">
                    <h2 className="bbd-font-display text-[28px] sm:text-[32px] leading-[1.02] text-[#290006]">
                      EL PLAN EDUCATIVO GUAMÁN POMA 2027
                    </h2>
                    <p className="mt-4 font-roboto text-[16px] font-light leading-[24px] text-[#290006]">
                      Conoce cómo los Planteles de Aplicación de la UNSCH impulsan la excelencia académica, la investigación científica y la formación integral en Ayacucho.
                    </p>
                    <div className="mt-5">
                      <BbdButton
                        label="Ver el plan"
                        href="/por-que-elegirnos"
                        variant="white"
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
