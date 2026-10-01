import type { Metadata } from "next";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import HomeHeroV2 from "@/components/home/HomeHeroV2";
import HomeRail from "@/components/home/HomeRail";
import WorldPortals from "@/components/home/WorldPortals";
import FeedPanel from "@/components/home/FeedPanel";
import MessagesPanel from "@/components/home/MessagesPanel";
import SanctuaryPanel from "@/components/home/SanctuaryPanel";
import ReturningGreeting from "@/components/sanctuary/ReturningGreeting";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import HomeDock from "@/components/home/HomeDock";
import MicroDiscoveries from "@/components/effects/MicroDiscoveries";
import EnvironmentLayers from "@/components/effects/EnvironmentLayers";
import AmbientLight from "@/components/effects/AmbientLight";
import ContextualRail from "@/components/home/ContextualRail";

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

/**
 * The transformed home — a spatial composition, not a card grid.
 *
 *   Environment    the living world behind everything (13 layers)
 *   AmbientLight   the world's illumination (3 light sources)
 *   TopBar         compact glass header
 *   HomeHeroV2     cinematic editorial greeting with Auri integrated
 *   WorldPortals   crystal windows into destinations
 *   HomeRail       weather + mood + daily within + discover
 *   ContextualRail related destinations (the WITHIN THREAD)
 *   Trio           feed · messages · sanctuary
 *   HomeDock       ambient line + center dock with Auri orb
 *
 * The environment is visible immediately. The interface exists INSIDE
 * the world, not on top of it. Negative space lets the world breathe.
 */
const shellItems: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Explore", href: "/explore", icon: "discover", route: true },
  { label: "Originals", href: "/originals", icon: "originals", route: true },
  { label: "Books", href: "/books", icon: "library", route: true },
  { label: "Music", href: "/music", icon: "music", route: true },
  { label: "Photography", href: "/photography", icon: "camera", route: true },
  { label: "Communities", href: "/communities", icon: "users", route: true },
  { label: "Creators", href: "/creators", icon: "star", route: true },
  { label: "Sanctuary", href: "/sanctuary", icon: "heart", route: true },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true },
  { label: "Within Time", href: "/atlas", icon: "clock", route: true },
  { label: "Messages", href: "/conversations", icon: "message", route: true, badge: 3 },
  { label: "Wallet", href: "/settings", icon: "wallet", route: true },
];

export default function HomePage() {
  return (
    <div className="crystal-world relative min-h-screen overflow-hidden text-[#232136]">
      {/* ═══ The living environment ═══ */}
      <EnvironmentLayers />
      <AmbientLight />

      <AppShell items={shellItems}>
        <TopBar />

        {/* ═══ Hero + right rail — spatial composition ═══ */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-4 xl:px-6 lg:grid-cols-[1fr_300px]">
          <div className="flex min-w-0 flex-col gap-4">
            <HomeHeroV2 />
            <WorldPortals />
          </div>
          <div className="flex flex-col gap-4">
            <HomeRail />
            <ContextualRail
              title="Continue exploring"
              destinations={[
                { label: "Explore", href: "/explore", icon: "discover", line: "The endless universe" },
                { label: "Within", href: "/within", icon: "sparkles", line: "The heart of WithIn" },
                { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
              ]}
            />
          </div>
        </div>

        {/* ═══ The trio row — feed · messages · sanctuary ═══ */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-4 px-4 pb-6 xl:px-6 lg:grid-cols-[1.6fr_0.85fr_0.75fr] lg:pb-28">
          <FeedPanel />
          <MessagesPanel />
          <SanctuaryPanel />
        </div>
      </AppShell>

      <HomeDock />
      <ReturningGreeting />
      <AuriOrb />
      <MicroDiscoveries />
    </div>
  );
}
