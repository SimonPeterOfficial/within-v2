import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import SanctuaryHero from "@/components/sanctuary/SanctuaryHero";
import SanctuaryDestinations from "@/components/sanctuary/SanctuaryDestinations";
import SanctuaryPanel from "@/components/sanctuary/SanctuaryQuietPanel";
import { UNIVERSE_NAV } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Sanctuary — WithIn",
  description:
    "The quieter room within WithIn — a place to slow down and return to yourself.",
};

/**
 * The Sanctuary — /sanctuary
 *
 * Full-viewport immersive room: the world scene fills the entire screen, the
 * hero floats centrally over it, and the seven destination cards are pinned
 * as a horizontal row at the bottom edge — matching the approved visual
 * reference (docs/vision/sanctuary-implementation-plan.md D-5).
 *
 * Layout intentionally breaks from the scrolling-sections pattern used by
 * most other routes. This is correct: the room is a place, not a page.
 *
 * DailyReflection is accessible via the Daily Check-in card which navigates
 * to /sanctuary#reflection (a secondary scroll surface mounted at that anchor).
 * The orbit route for Emotional Space is similarly deferred to Phase B3.
 *
 * Shell: shared UNIVERSE_NAV, TopBar, WorldScape, CommandPalette, AuriOrb.
 * `data-scene="sanctuary"` and `.sanctuary-dusk` retint the world.
 */
export default function SanctuaryPage() {
  return (
    <div data-scene="sanctuary" className="sanctuary-dusk">
      <AppShell items={UNIVERSE_NAV} atmosphere="calm">
        {/* Top bar floats at the natural z-40 layer */}
        <TopBar />

        {/* "Your sanctuary. Your peace. Your space." — floating panel, top-right */}
        <SanctuaryPanel />

        {/* Hero: centered over the scene, with space at the bottom for the cards */}
        <div className="flex min-h-[100dvh] flex-col items-center justify-center pb-[300px] pt-20 sm:pb-[280px] lg:pb-[260px]">
          <SanctuaryHero />
        </div>
      </AppShell>

      {/* Room cards: pinned horizontal row at the bottom, above BottomNav */}
      <SanctuaryDestinations />

      {/* Auri: her presence in the corner */}
      <AuriOrb />
    </div>
  );
}
