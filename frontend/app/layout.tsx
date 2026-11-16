import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import 'primeicons/primeicons.css';
import '@/modules/shared/prime/theme/unsch-lara.css';
import './globals.css';
import { PrimeProvider } from '@/modules/shared/prime';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Planteles de Aplicación "Guamán Poma de Ayala" - UNSCH | Forjando Nuestro Propio Futuro',
  description:
    'Portal oficial de los Planteles de Aplicación "Guamán Poma de Ayala" de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH) en Ayacucho. Más de 62 años formando líderes en Inicial, Primaria y Secundaria.',
  icons: {
    icon: '/emblema-unsch.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;700;900&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen bg-[#FFFCF8] text-gray-900 antialiased selection:bg-[#8F1025] selection:text-white">
        <PrimeProvider>{children}</PrimeProvider>
      </body>
    </html>
  );
}

