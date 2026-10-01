import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import AtlasExperience from "@/components/atlas/AtlasExperience";
import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";

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
        <motion.div
          variants={staggerContainer(0.05, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={blurUp}>
            <AtlasExperience />
          </motion.div>
        </motion.div>

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
