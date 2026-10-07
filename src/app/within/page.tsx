import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import AuriPanel from "@/components/sanctuary/AuriPanel";
import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";
import { useSession } from "@/lib/auth/session";
import { useEnvironment } from "@/lib/environment";
import { applyMood } from "@/lib/mood";
import { getTimePeriod, type AuriContext } from "@/lib/auri";

export const metadata: Metadata = {
  title: "Within — WithIn",
  description: "The heart of WithIn — where the world comes alive.",
};

/**
 * Within — the heart of WithIn.
 *
 * This is where Auri lives. The page opens with Auri's presence
 * and provides a direct connection to her. The environment is
 * calm and focused — this is a space for reflection and connection.
 */
export default function WithinPage() {
  const { user } = useSession();
  const { moodId } = useEnvironment();

  const context: AuriContext = {
    period: getTimePeriod(),
    pathname: "/within",
    moodId,
    isAuthenticated: !!user,
    firstName: user?.name.trim().split(/\s+/)[0],
    firstOpen: false,
    openCount: 1,
  };

  return (
    <UniverseShell preset="sanctuary" worldClass="world-worlds">
      <WorldHero
        eyebrow={copy.within.eyebrow}
        title={copy.within.title}
        subtitle={copy.within.subtitle}
        worldClass="world-worlds"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Auri's chamber — the heart of WithIn */}
        <motion.div
          variants={staggerContainer(0.05, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={blurUp}>
            <AuriPanel
              context={context}
              moodId={moodId}
              onMoodSelect={(id) => applyMood(id)}
              onClose={() => {}}
              onPresenceChange={() => {}}
            />
          </motion.div>
        </motion.div>

        <div className="mt-6">
          <ContextualRail
            title="The universe within"
            destinations={[
              { label: "Explore", href: "/explore", icon: "discover", line: "The endless universe" },
              { label: "Discover", href: "/discover", icon: "sparkles", line: "What's new for you" },
              { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
