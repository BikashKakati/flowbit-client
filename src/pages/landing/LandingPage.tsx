import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { CTASection } from "./components/CTASection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { SocialProofSection } from "./components/SocialProofSection";

export default function LandingPage() {
    return (
        <div
            className="min-h-screen text-white overflow-hidden selection:bg-indigo-500/30"
            style={{ background: "#070B14" }}
        >
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <SocialProofSection />
            <CTASection />
        </div>
    );
}