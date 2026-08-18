import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import Hero from "@/components/home/Hero";
import Footer from "@/components/layout/Footer";
import AuriOrb from "@/components/sanctuary/AuriOrb";

// The cinematic intro is code-split so the landing page stays lean — it only
// loads (and plays) on a fresh session, once, then dissolves into the hero.
// It is imported through a client "gate" because Next.js 16 only allows
// `ssr: false` inside Client Components (see CinematicLoaderGate).
import CinematicLoaderGate from "@/components/loader/CinematicLoaderGate";

// Every section below the hero is code-split so the first paint stays lean —
// the landing opens with darkness and light, then the universe unfolds.
const EmotionalDiscovery = dynamic(() => import("@/components/landing/EmotionalDiscovery"));
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const SanctuaryMoment = dynamic(() => import("@/components/landing/SanctuaryMoment"));
const AuriMoment = dynamic(() => import("@/components/landing/AuriMoment"));
const ContentUniverse = dynamic(() => import("@/components/landing/ContentUniverse"));
const CreatorUniverse = dynamic(() => import("@/components/landing/CreatorUniverse"));
const RecentDiscussions = dynamic(() => import("@/components/communities/RecentDiscussions"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

export const metadata: Metadata = {
  title: "WithIn — Feel You.",
  description:
    "A place for stories, emotions, people — and everything that lives within. A universe built around how you feel right now.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04050a] text-white">
      {/* One living atmosphere behind the entire world: glow → fog → mesh →
          aurora → light rays → particles → stars, all drifting in slow motion */}
      <DepthLayers preset="home" />

      <CinematicLoaderGate />

      <main id="main" className="relative">
        <Hero />

        {/* Emotional discovery — the world answers how you feel */}
        <Suspense fallback={null}>
          <EmotionalDiscovery />
        </Suspense>

        {/* WithIn Originals — the studio shelf */}
        <Suspense fallback={null}>
          <OriginalsShowcase trailerHref="/signup" />
        </Suspense>

        {/* The sanctuary — the quiet room inside */}
        <Suspense fallback={null}>
          <SanctuaryMoment />
        </Suspense>

        {/* Auri — the presence that listens */}
        <Suspense fallback={null}>
          <AuriMoment />
        </Suspense>

        {/* The content universe — six worlds, one light */}
        <Suspense fallback={null}>
          <ContentUniverse />
        </Suspense>

        {/* The creator universe — the people who make it */}
        <Suspense fallback={null}>
          <CreatorUniverse />
        </Suspense>

        {/* Community — quiet rooms, kindred souls */}
        <Suspense fallback={null}>
          <RecentDiscussions id="community" />
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
