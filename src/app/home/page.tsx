import type { Metadata } from "next";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import HomeHero from "@/components/home/HomeHero";
import HomeRail from "@/components/home/HomeRail";
import WeatherPanel from "@/components/home/WeatherPanel";
import MoodOrbs from "@/components/home/MoodOrbs";
import UniverseDoors from "@/components/home/UniverseDoors";
import FeedPanel from "@/components/home/FeedPanel";
import MessagesPanel from "@/components/home/MessagesPanel";
import SanctuaryPanel from "@/components/home/SanctuaryPanel";
import ReturningGreeting from "@/components/sanctuary/ReturningGreeting";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import HomeDock from "@/components/home/HomeDock";
import MicroDiscoveries from "@/components/effects/MicroDiscoveries";

export const metadata: Metadata = {
  title: "WithIn — A universe within you",
  description:
    "A cinematic sanctuary where stories, emotions, and people connect.",
};

/**
 * The illustrated home — reference composition, top to bottom:
 *
 *   TopBar        centered search + bell + weather chip + avatar
 *   HomeHero      painted sky, floating isles, lake light, winged Auri
 *   HomeRail      weather window + mood orbs + daily within + discover
 *   Doors         eight painted world tiles (Originals → Discover)
 *   Trio          For-You feed window + Messages window + Sanctuary
 *   HomeDock      ambient line, center dock w/ Auri orb, now-playing
 *
 * The rail hugs the hero like the reference; the trio row follows.
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
      <AppShell items={shellItems}>
        <TopBar />

        {/* ── Hero + right rail — one hug like the reference ─────────── */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-4 xl:px-6 lg:grid-cols-[1fr_300px]">
          <div className="flex min-w-0 flex-col gap-4">
            <HomeHero />
            <UniverseDoors />
          </div>
          <HomeRail />
        </div>

        {/* ── The trio row — feed · messages · sanctuary ─────────────── */}
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
