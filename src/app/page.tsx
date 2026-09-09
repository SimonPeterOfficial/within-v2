import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import Hero from "@/components/home/Hero";
import Footer from "@/components/layout/Footer";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import MoodPillBar from "@/components/landing/MoodPillBar";
import UniverseStrip from "@/components/landing/UniverseStrip";
import SanctuaryDuo from "@/components/landing/SanctuaryDuo";

// The cinematic intro is code-split so the landing page stays lean — it only
// loads (and plays) on a fresh session, once, then dissolves into the hero.
// It is imported through a client "gate" because Next.js 16 only allows
// `ssr: false` inside Client Components (see CinematicLoaderGate).
import CinematicLoaderGate from "@/components/loader/CinematicLoaderGate";

// Sections beyond the reference fold are code-split so the first paint stays
// lean — the landing opens with darkness and light, then the universe unfolds.
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const RecentDiscussions = dynamic(() => import("@/components/communities/RecentDiscussions"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

export const metadata: Metadata = {
  title: "WithIn — Feel You.",
  description:
    "A place for stories, emotions, people — and everything that lives within. A universe built around how you feel right now.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      {/* One living atmosphere behind the entire world: glow → fog → mesh →
          aurora → light rays → particles → stars, all drifting in slow motion */}
      <DepthLayers preset="home" />

      <CinematicLoaderGate />

      <main id="main" className="relative">
        {/* 01 — ARRIVAL: The hero opens the universe (reference layout:
            left-aligned wordmark + winged Auri in her ring of light) */}
        <Hero />

        {/* 02 — RECOGNITION: The mood pill bar, floating under the hero */}
        <div className="relative z-20 -mt-10 pb-2">
          <Suspense fallback={null}>
            <MoodPillBar />
          </Suspense>
        </div>

        {/* 03 — EXPLORATION: The eight doors into WithIn */}
        <UniverseStrip />

        {/* 04 — BELONGING: Your Sanctuary + Auri sees you (the closing duo) */}
        <SanctuaryDuo />

        {/* 05 — POSSIBILITY: Originals + Community conversations */}
        <Suspense fallback={null}>
          <OriginalsShowcase trailerHref="/signup" />
        </Suspense>
        <Suspense fallback={null}>
          <RecentDiscussions id="community" />
        </Suspense>

        {/* 06 — INVITATION: The final door */}
        <Suspense fallback={null}>
          <FinaleCTA primaryHref="/signup" />
        </Suspense>
      </main>

      <Footer />
      <AuriOrb />
    </div>
  );
}
