import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import DepthLayers from "@/components/effects/DepthLayers";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
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

const shellItems: SidebarItem[] = [
  { label: "Sanctuary", href: "#sanctuary", icon: "home" },
  { label: "Mood", href: "#mood", icon: "discover" },
  { label: "Stories", href: "#memories", icon: "stories" },
  { label: "Originals", href: "#originals", icon: "originals" },
  { label: "Profile", href: "/login", icon: "profile", route: true }
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere: glow → aurora → light rays → particles → stars */}
      <DepthLayers />

      <AppShell items={shellItems}>
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
      </AppShell>

      <AuriOrb />
    </div>
  );
}
