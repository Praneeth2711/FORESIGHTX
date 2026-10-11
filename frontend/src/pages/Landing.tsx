import { DecisionSculpture } from '../components/landing/DecisionSculpture';
import { HeroSection } from '../components/landing/HeroSection';
import { Storytelling } from '../components/landing/Storytelling';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { IndustrySection } from '../components/landing/IndustrySection';
import { ScenarioPreview } from '../components/landing/scenario/ScenarioPreview';

export const Landing = () => {
  return (
    <main className="flex flex-col w-full bg-[#EAE3D8] text-[#241F1B] font-sans selection:bg-[#F06445]/20 relative">
      <DecisionSculpture />
      <HeroSection />
      <Storytelling />
      <HowItWorksSection />
      <FeaturesSection />
      <IndustrySection />
      <ScenarioPreview />
    </main>
  );
};
