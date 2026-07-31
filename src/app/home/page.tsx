import type { Metadata } from "next";
import GlowBackground from "@/components/effects/GlowBackground";
import AuroraBackground from "@/components/effects/AuroraBackground";
import ParticleField from "@/components/effects/ParticleField";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import MoodOrbit from "@/components/sanctuary/MoodOrbit";
import MemoryCards from "@/components/sanctuary/MemoryCards";
import OriginalsShowcase from "@/components/sanctuary/OriginalsShowcase";
import FinaleCTA from "@/components/sanctuary/FinaleCTA";
import AuriOrb from "@/components/sanctuary/AuriOrb";

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Ambient world: glow + aurora + particles */}
      <GlowBackground variant="ambient" />
      <AuroraBackground />
      <ParticleField count={22} seed={11} />

      <DashboardNav />

      <main className="relative z-10">
        <SanctuaryHero />
        <MoodOrbit />
        <MemoryCards />
        <OriginalsShowcase />
        <FinaleCTA />
      </main>

      <AuriOrb />
    </div>
  );
}
