import type { Metadata } from "next";
import GlowBackground from "@/components/effects/GlowBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import MoodOrbit from "@/components/sanctuary/MoodOrbit";
import MemoryCards from "@/components/sanctuary/MemoryCards";
import AuriOrb from "@/components/sanctuary/AuriOrb";

export const metadata: Metadata = {
  title: "Your Sanctuary — WithIn",
  description: "A universe built from your feelings.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <GlowBackground variant="ambient" />
      <DashboardNav />

      <main className="relative z-10">
        <SanctuaryHero />
        <MoodOrbit />
        <MemoryCards />
      </main>

      <AuriOrb />
    </div>
  );
}
