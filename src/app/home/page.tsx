import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import QuickActions from "@/components/sanctuary/QuickActions";
import MoodOrbit from "@/components/sanctuary/MoodOrbit";
import MemoryCards from "@/components/sanctuary/MemoryCards";
import AuriOrb from "@/components/sanctuary/AuriOrb";

// Below-the-fold sections are code-split so the first paint stays lean.
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere: glow → aurora → light rays → particles → stars */}
      <DepthLayers />

      <DashboardNav />

      <main id="main" className="relative z-10">
        <SanctuaryHero />
        <QuickActions />
        <MoodOrbit />
        <MemoryCards />
        <Suspense fallback={null}>
          <OriginalsShowcase />
        </Suspense>
        <Suspense fallback={null}>
          <FinaleCTA />
        </Suspense>
      </main>

      <AuriOrb />
    </div>
  );
}
