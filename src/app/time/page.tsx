import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import TimeDisplay from "@/components/time/TimeDisplay";
import { MotionContainer, FadeItem } from "@/components/motion/MotionStagger";

export const metadata: Metadata = {
  title: "Time — WithIn",
  description:
    "Your local time, timezone, and temporal context — the present moment, rendered honestly.",
};

/**
 * Time — the temporal heart of WithIn.
 *
 * Displays the user's real local time in their own locale and timezone,
 * plus period and season context. Everything is computed from the real
 * clock through browser-native Intl — no hardcoded offsets, no assumed
 * formats, no fictional in-world calendar.
 */
export default function TimePage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-within-time">
      <WorldHero
        eyebrow={copy.atlas.eyebrow}
        title="Time"
        subtitle="The present moment, in your own light."
        worldClass="world-within-time"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <MotionContainer>
          <FadeItem>
            <TimeDisplay />
          </FadeItem>
        </MotionContainer>

        <div className="mt-10">
          <ContextualRail
            title="Continue exploring"
            destinations={[
              { label: "Atlas", href: "/atlas", icon: "globe", line: "Moments, layered" },
              { label: "Home", href: "/home", icon: "home", line: "Your universe" },
              { label: "Sanctuary", href: "/sanctuary", icon: "heart", line: "A calmer you" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
