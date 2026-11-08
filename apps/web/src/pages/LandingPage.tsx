import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { SocialProof } from '../components/landing/SocialProof';
import { ComparisonMatrix } from '../components/landing/ComparisonMatrix';
import { NumberedShowcase } from '../components/landing/NumberedShowcase';
import { RhythmShiftManifesto } from '../components/landing/RhythmShiftManifesto';
import { RoiCalculator } from '../components/landing/RoiCalculator';
import { TelemetryTicker } from '../components/landing/TelemetryTicker';
import { InteractiveCodeStudio } from '../components/landing/InteractiveCodeStudio';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <div id="comparison">
          <ComparisonMatrix />
        </div>
        <NumberedShowcase />
        <RhythmShiftManifesto />
        <RoiCalculator />
        <TelemetryTicker />
        <InteractiveCodeStudio />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
