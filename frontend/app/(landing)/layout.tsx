import Navbar from '@/modules/landing/components/Navbar';
import Footer from '@/modules/landing/components/Footer';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bbd-page min-h-screen flex flex-col bg-[#FFFFFF] text-[rgba(41,23,25,0.8)] selection:bg-[#7A1E30] selection:text-white">
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
