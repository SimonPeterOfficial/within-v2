import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import AtlasExperience from "@/components/atlas/AtlasExperience";
import { MotionContainer, FadeItem } from "@/components/motion/MotionStagger";

export const metadata: Metadata = {
  title: "Within Time — WithIn",
  description: "The WithIn timeline — moments, journeys, and memories.",
};

/**
 * Atlas — the observatory of WithIn.
 *
 * A temporal layer showing the user's journey through time.
 * Uses the AtlasExperience component which provides a rich,
 * interactive timeline of the user's exploration.
 */
export default function AtlasPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-within-time">
      <WorldHero
        eyebrow={copy.atlas.eyebrow}
        title={copy.atlas.title}
        subtitle={copy.atlas.subtitle}
        worldClass="world-within-time"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Atlas experience — the temporal layer */}
        <MotionContainer>
          <FadeItem>
            <AtlasExperience />
          </FadeItem>
        </MotionContainer>

        <div className="mt-6">
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
              { label: "Mirror", href: "/mirror", icon: "eye", line: "Quiet reflection" },
              { label: "Sanctuary", href: "/sanctuary", icon: "heart", line: "A calmer you" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
