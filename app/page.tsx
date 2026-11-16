import { auth } from "@clerk/nextjs/server";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TechEcosystem } from "@/components/landing/tech-ecosystem";
import { InteractiveSandbox } from "@/components/landing/interactive-sandbox";
import { FeaturesSection } from "@/components/landing/features-section";
import { ArchitectureComparison } from "@/components/landing/architecture-comparison";
import { ArchitectureShowcase } from "@/components/landing/architecture-showcase";
import { FAQSection } from "@/components/landing/faq-section";
import { EnterpriseCTA } from "@/components/landing/enterprise-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata = {
  title: "ghost AI | Real-time Collaborative System Design & Spec Engine",
  description:
    "Design distributed architectures at the speed of thought. Ghost AI maps systems onto a live collaborative canvas and exports production-ready technical specifications.",
};

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-[var(--accent-primary-dim)] selection:text-[var(--accent-primary)]"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Sticky Navigation Header */}
      <LandingNavbar isAuthenticated={isAuthenticated} />

      {/* Main Page Sections */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section with Interactive Canvas Preview */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* Enterprise Cloud & Protocol Ecosystem */}
        <TechEcosystem />

        {/* Live Interactive Architecture Sandbox with Traffic Simulation */}
        <InteractiveSandbox />

        {/* Core Capabilities */}
        <FeaturesSection />

        {/* The Architectural Shift (Before vs After) */}
        <ArchitectureComparison />

        {/* 3-Step Lifecycle & Spec Output Showcase */}
        <ArchitectureShowcase />

        {/* Engineering & Enterprise FAQ */}
        <FAQSection />

        {/* Enterprise Call to Action */}
        <EnterpriseCTA isAuthenticated={isAuthenticated} />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
