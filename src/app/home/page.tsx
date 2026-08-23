import type { Metadata } from "next";
import dynamic from "next/dynamic";
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
import MicroDiscoveries from "@/components/effects/MicroDiscoveries";

// The feed shuffler — determines section order based on universe state
const HomeFeed = dynamic(() => import("@/components/sanctuary/HomeFeed"));

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

const shellItems: SidebarItem[] = [
  /* ── Primary universe navigation ── */
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Explore", href: "/explore", icon: "discover", route: true },
  { label: "Within", href: "/within", icon: "sparkles", route: true },
  { label: "Journey", href: "/journey", icon: "heart", route: true },
  /* ── Sanctuary sections ── */
  { label: "Mood", href: "#mood", icon: "moon" },
  { label: "Continue", href: "#continue", icon: "play" },
  { label: "Recommended", href: "#recommended", icon: "sparkles" },
  /* ── The universe — secondary routes ── */
  { label: "Originals", href: "/originals", icon: "originals", route: true },
  { label: "Music", href: "/music", icon: "music", route: true },
  { label: "Books", href: "/books", icon: "book", route: true },
  { label: "Photography", href: "/photography", icon: "camera", route: true },
  { label: "Communities", href: "/communities", icon: "users", route: true },
  { label: "Creators", href: "/creators", icon: "sparkles", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* One living atmosphere — the sanctuary room */}
      <DepthLayers preset="sanctuary" particles={7} stars={16} fog={0.5} />

      <AppShell items={shellItems}>
        {/* ── Fixed upper: always present regardless of feed mode ── */}
        <SanctuaryHero />
        <QuickActions />

        {/* ── Sanctuary core: mood, continue, because-you-chose, recommended ── */}
        <MoodOrbit />
        <ContinueJourney />
        <BecauseYouChose />

        {/* ── Curated feed: the universe decides what you see next ── */}
        <HomeFeed />

        {/* ── Memory & recommendations (always present) ── */}
        <MemoryCards />
        <Recommended />
      </AppShell>

      <AuriOrb />
      <MicroDiscoveries />
    </div>
  );
}
