import type { Metadata } from 'next';
import 'primeicons/primeicons.css';
import '@/modules/shared/prime/theme/unsch-lara.css';
import './globals.css';
import { PrimeProvider } from '@/modules/shared/prime';

export const metadata: Metadata = {
  title: 'Planteles de Aplicación "Guamán Poma de Ayala" - UNSCH | Portal Oficial',
  description:
    'Portal oficial de los Planteles de Aplicación "Guamán Poma de Ayala" de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH) en Ayacucho. Más de 62 años formando líderes en Inicial, Primaria y Secundaria.',
  icons: {
    icon: '/emblema-unsch.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased selection:bg-brand selection:text-white">
        <PrimeProvider>{children}</PrimeProvider>
      </body>
    </html>
  );
}
