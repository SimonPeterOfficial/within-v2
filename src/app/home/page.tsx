import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import QuickActions from "@/components/sanctuary/QuickActions";
import ContinueJourney from "@/components/sanctuary/ContinueJourney";
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
  { label: "Continue", href: "#continue", icon: "play" },
  { label: "Recommended", href: "#recommended", icon: "sparkles" },
  { label: "Mood", href: "#mood", icon: "moon" },
  { label: "Stories", href: "#memories", icon: "stories" },
  { label: "Originals", href: "#originals", icon: "originals" },
  { label: "Music", href: "#music", icon: "music" },
  { label: "Books", href: "#books", icon: "book" },
  { label: "Photography", href: "#photography", icon: "camera" },
  { label: "Communities", href: "#communities", icon: "users" },
  { label: "Reflection", href: "#reflection", icon: "heart" },
  { label: "Discover", href: "#discover", icon: "discover" },
  { label: "Profile", href: "/login", icon: "profile", route: true }
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere: glow → fog → aurora → light rays → particles → stars */}
      <DepthLayers />

      <AppShell items={shellItems}>
        <SanctuaryHero />
        <QuickActions />
        <ContinueJourney />
        <Recommended />
        <MoodOrbit />
        <MemoryCards />
        <Suspense fallback={null}>
          <OriginalsShowcase />
        </Suspense>
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
