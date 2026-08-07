import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import Hero from "@/components/home/Hero";
import ContinueJourney from "@/components/sanctuary/ContinueJourney";
import Recommended from "@/components/sanctuary/Recommended";
import Footer from "@/components/layout/Footer";
import AuriOrb from "@/components/sanctuary/AuriOrb";

// The cinematic intro is code-split so the landing page stays lean — it only
// loads (and plays) on a fresh session, once, then dissolves into the hero.
// It is imported through a client "gate" because Next.js 16 only allows
// `ssr: false` inside Client Components (see CinematicLoaderGate).
import CinematicLoaderGate from "@/components/loader/CinematicLoaderGate";

// Below-the-fold sections are code-split so the first paint stays lean.
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const MusicSection = dynamic(() => import("@/components/sanctuary/MusicSection"));
const BooksSection = dynamic(() => import("@/components/sanctuary/BooksSection"));
const PhotographySection = dynamic(() => import("@/components/sanctuary/PhotographySection"));
const CommunitiesSection = dynamic(() => import("@/components/sanctuary/CommunitiesSection"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

export const metadata: Metadata = {
  title: "WithIn — Feel Seen. Feel Heard. Feel WithIn.",
  description:
    "A home for stories, emotions, creators and meaningful connections — a universe built around how you feel right now.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere behind the entire world: glow → fog → aurora →
          light rays → particles → stars, all drifting in slow motion */}
      <DepthLayers />

      <CinematicLoaderGate />

      <main id="main" className="relative">
        <Hero />
        <ContinueJourney storyHref="#continue" actionHref="#originals" />
        <Recommended storyHref="#continue" />

        <Suspense fallback={null}>
          <OriginalsShowcase trailerHref="/signup" />
        </Suspense>
        <Suspense fallback={null}>
          <MusicSection actionHref="#books" />
        </Suspense>
        <Suspense fallback={null}>
          <BooksSection />
        </Suspense>
        <Suspense fallback={null}>
          <PhotographySection />
        </Suspense>
        <Suspense fallback={null}>
          <CommunitiesSection actionHref="#join" />
        </Suspense>

        <Suspense fallback={null}>
          <FinaleCTA primaryHref="/signup" />
        </Suspense>
      </main>

      <Footer />
      <AuriOrb />
    </div>
  );
}
