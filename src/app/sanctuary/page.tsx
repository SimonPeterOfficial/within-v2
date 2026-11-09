import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import SanctuaryDestinations from "@/components/sanctuary/SanctuaryDestinations";
import { UNIVERSE_NAV } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Sanctuary — WithIn",
  description:
    "The quieter room within WithIn — a place to slow down and return to yourself.",
};

/**
 * The Sanctuary — /sanctuary is a real room (Phase A foundation;
 * docs/vision/sanctuary-implementation-plan.md §4).
 *
 * One shared universe shell — UNIVERSE_NAV, TopBar, WorldScape, the
 * Command Palette, Auri's contextual presence — nothing forked. The room's
 * intimacy comes from scoping, not components:
 *
 *   .sanctuary-dusk  flips the ink scope to warm ivory and washes the
 *                    crystal world into deep twilight violet
 *   data-scene       retints the hand-built world toward evening (globals.css)
 *
 * The experience is intentionally sparse: a hero that breathes, and seven
 * doors. Rooms still being written (Mood, Meditation, Memories, Daily
 * Check-in) are named, not faked — their identities wait honestly
 * (docs/vision/sanctuary-spec.md §3.E).
 */
export default function SanctuaryPage() {
  return (
    <div data-scene="sanctuary" className="sanctuary-dusk relative min-h-screen">
      <AppShell items={UNIVERSE_NAV}>
        <TopBar />
        <div className="relative z-10 pb-24">
          <SanctuaryHero />
          <SanctuaryDestinations />
        </div>
      </AppShell>
      <AuriOrb />
    </div>
  );
}
