import HeroSection from '@/modules/landing/components/HeroSection';
import BentoSection from '@/modules/landing/components/BentoSection';
import AmbitionSection from '@/modules/landing/components/AmbitionSection';
import FocusDriversSection from '@/modules/landing/components/FocusDriversSection';
import GameChangersSection from '@/modules/landing/components/GameChangersSection';
import DeliveryThemesSection from '@/modules/landing/components/DeliveryThemesSection';
import StrengthsStatsSection from '@/modules/landing/components/StrengthsStatsSection';

export default function HomePage() {
  return (
    <div className="bbd-page bg-[#FFFCF8]">
      {/* SECTION 0: FULL-SCREEN HERO SECTION (.section-header) */}
      <HeroSection />

      {/* SECTION 1: REGENERATION BENTO GRID (.section-bento) */}
      <BentoSection />

      {/* SECTION 2 & 3: FRAMEWORKS BANNER + CORE AMBITION GRID + SECONDARY BANNER (.section-grid & .div-block-6) */}
      <AmbitionSection />

      {/* SECTION 4: 4 MAIN DRIVERS HORIZONTAL ACCORDION (.section-focus) */}
      <FocusDriversSection />

      {/* SECTION 5: 7 BIG GAME CHANGERS INTERACTIVE LIST / ACCORDION (.section-peview) */}
      <GameChangersSection />

      {/* SECTION 6: 3 DELIVERY THEMES STICKY CARDS (.section-cards) */}
      <DeliveryThemesSection />

      {/* SECTION 7: PRIORITY SECTORS STATS + VIDEO SHOWCASE (.section-stats) */}
      <StrengthsStatsSection />
    </div>
  );
}
