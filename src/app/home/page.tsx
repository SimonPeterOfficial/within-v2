import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import QuickActions from "@/components/sanctuary/QuickActions";
import ContinueJourney from "@/components/sanctuary/ContinueJourney";
import BecauseYouChose from "@/components/sanctuary/BecauseYouChose";
import Recommended from "@/components/sanctuary/Recommended";
import MoodOrbit from "@/components/sanctuary/MoodOrbit";
import MemoryCards from "@/components/sanctuary/MemoryCards";
import AuriOrb from "@/components/sanctuary/AuriOrb";

// Below-the-fold sections are code-split so the first paint stays lean.
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const MusicSection = dynamic(() => import("@/components/sanctuary/MusicSection"));
const BooksSection = dynamic(() => import("@/components/sanctuary/BooksSection"));
const PhotographySection = dynamic(() => import("@/components/sanctuary/PhotographySection"));
const CommunitiesSection = dynamic(() => import("@/components/sanctuary/CommunitiesSection"));
const DailyReflection = dynamic(() => import("@/components/sanctuary/DailyReflection"));
const DiscoverSection = dynamic(() => import("@/components/sanctuary/DiscoverSection"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

const shellItems: SidebarItem[] = [
  { label: "Sanctuary", href: "#sanctuary", icon: "home" },
  { label: "Mood", href: "#mood", icon: "moon" },
  { label: "Continue", href: "#continue", icon: "play" },
  { label: "Recommended", href: "#recommended", icon: "sparkles" },
  { label: "Stories", href: "#memories", icon: "stories" },
  { label: "Reflection", href: "#reflection", icon: "heart" },
  /* ── The universe — real routes, every corner reachable from here ── */
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Originals", href: "/originals", icon: "originals", route: true },
  { label: "Music", href: "/music", icon: "music", route: true },
  { label: "Books", href: "/books", icon: "book", route: true },
  { label: "Photography", href: "/photography", icon: "camera", route: true },
  { label: "Communities", href: "/communities", icon: "users", route: true },
  { label: "Creators", href: "/creators", icon: "sparkles", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true }
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere: glow → fog → mesh → aurora → light rays →
          particles → stars — the sanctuary room, calm and silver-violet.
          Quieter than the landing by design: fewer motes, softer fog. */}
      <DepthLayers preset="sanctuary" particles={7} stars={16} fog={0.5} />

      <AppShell items={shellItems}>
        <SanctuaryHero />
        <QuickActions />

        {/* Dreamscape hierarchy — the universe, in order: mood → continue →
            featured original → recommended → memories → the arts → reflection
            → the Auri moment → the door home */}
        <MoodOrbit />
        <ContinueJourney />
        {/* Personalized first — chosen interests surface right after the journey */}
        <BecauseYouChose />
        <Suspense fallback={null}>
          <OriginalsShowcase />
        </Suspense>
        <Recommended />
        <MemoryCards />
        <Suspense fallback={null}>
          <MusicSection />
        </Suspense>
        <Suspense fallback={null}>
          <BooksSection />
        </Suspense>
        <Suspense fallback={null}>
          <PhotographySection />
        </Suspense>
        <Suspense fallback={null}>
          <CommunitiesSection />
        </Suspense>
        <Suspense fallback={null}>
          <DailyReflection />
        </Suspense>
        <Suspense fallback={null}>
          <DiscoverSection />
        </Suspense>
        <Suspense fallback={null}>
          <FinaleCTA />
        </Suspense>
      </AppShell>

      <AuriOrb />
    </div>
  );
}
