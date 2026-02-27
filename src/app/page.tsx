import { Header } from "@/shared/components/header";
import { Footer } from "@/shared/components/footer";
import { HeroSection } from "@/featured/landing/components/HeroSection";
import { FeaturesSection } from "@/featured/landing/components/FeaturesSection";
import { HowItWorksSection } from "@/featured/landing/components/HowItWorksSection";
import { TestimonialsSection } from "@/featured/landing/components/TestimonialsSection";
import { CtaSection } from "@/featured/landing/components/CtaSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
