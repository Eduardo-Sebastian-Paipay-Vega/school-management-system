import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
      <body className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-brand selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
