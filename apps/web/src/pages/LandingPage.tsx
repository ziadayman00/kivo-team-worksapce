import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { SocialProof } from '../components/landing/SocialProof';
import { BentoGrid } from '../components/landing/BentoGrid';
import { InteractivePlayground } from '../components/landing/InteractivePlayground';
import { ArchitectureSection } from '../components/landing/ArchitectureSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <BentoGrid />
        <InteractivePlayground />
        <ArchitectureSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
