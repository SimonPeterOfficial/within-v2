import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { ALBUMS } from "@/lib/content";
import ContentCard from "@/components/ui/cards/ContentCard";
import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";

export const metadata: Metadata = {
  title: "Music — WithIn",
  description: "Sounds that move you — the WithIn soundscapes.",
};

/**
 * Music — the soundscapes of WithIn.
 *
 * Shows the real music catalog from lib/content with editorial
 * presentation. Each album is a real entry with title, artist,
 * description, and cover art.
 */
export default function MusicPage() {
  return (
    <UniverseShell preset="music" worldClass="world-music">
      <WorldHero
        eyebrow={copy.music.eyebrow}
        title={copy.music.title}
        subtitle={copy.music.subtitle}
        worldClass="world-music"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Music catalog — real content from lib/content */}
        <motion.div
          variants={staggerContainer(0.05, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ALBUMS.map((album, index) => (
            <motion.div key={album.id} variants={blurUp}>
              <ContentCard
                title={album.title}
                creator={album.creator}
                description={album.description}
                meta={album.meta}
                href={`/content/${album.id}`}
                cover={{ gradient: album.cover.gradient, emoji: album.cover.emoji }}
                badges={album.status ? [{ label: album.status, tone: "mood" as const }] : undefined}
                delay={index * 0.06}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6">
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Originals", href: "/originals", icon: "originals", line: "Films, series & more" },
              { label: "Books", href: "/books", icon: "library", line: "Stories for every mood" },
              { label: "Photography", href: "/photography", icon: "camera", line: "Moments that matter" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
