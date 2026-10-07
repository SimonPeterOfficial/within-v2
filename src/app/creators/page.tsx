import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { CREATORS } from "@/lib/creators";
import CreatorCard from "@/components/ui/cards/CreatorCard";
import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";

export const metadata: Metadata = {
  title: "Creators — WithIn",
  description: "Real people. Real stories. — the WithIn creators.",
};

/**
 * Creators — the people who make WithIn.
 *
 * Shows the real creator catalog from lib/creators with editorial
 * presentation. Each creator is a real entry with name, handle,
 * bio, and avatar.
 */
export default function CreatorsPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-creators">
      <WorldHero
        eyebrow={copy.creators.eyebrow}
        title={copy.creators.title}
        subtitle={copy.creators.subtitle}
        worldClass="world-creators"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Creator catalog — real content from lib/creators */}
        <motion.div
          variants={staggerContainer(0.05, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CREATORS.map((creator, index) => (
            <motion.div key={creator.id} variants={blurUp}>
              <CreatorCard creator={creator} delay={index * 0.06} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6">
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Studio", href: "/studio", icon: "dashboard", line: "Your creative workspace" },
              { label: "Originals", href: "/originals", icon: "originals", line: "Films, series & more" },
              { label: "Communities", href: "/communities", icon: "users", line: "Find your people" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
