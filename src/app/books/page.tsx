import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { BOOKS } from "@/lib/content";
import ContentCard from "@/components/ui/cards/ContentCard";
import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";

export const metadata: Metadata = {
  title: "Books — WithIn",
  description: "Stories for every mood — the WithIn library.",
};

/**
 * Books — the library of WithIn.
 *
 * Shows the real book catalog from lib/content with editorial
 * presentation. Each book is a real entry with title, author,
 * description, and cover art.
 */
export default function BooksPage() {
  return (
    <UniverseShell preset="books" worldClass="world-books">
      <WorldHero
        eyebrow={copy.books.eyebrow}
        title={copy.books.title}
        subtitle={copy.books.subtitle}
        worldClass="world-books"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Book catalog — real content from lib/content */}
        <motion.div
          variants={staggerContainer(0.05, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BOOKS.map((book, index) => (
            <motion.div key={book.id} variants={blurUp}>
              <ContentCard
                title={book.title}
                creator={book.creator}
                description={book.description}
                meta={book.meta}
                href={`/content/${book.id}`}
                cover={{ gradient: book.cover.gradient, emoji: book.cover.emoji }}
                badges={book.status ? [{ label: book.status, tone: "mood" as const }] : undefined}
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
              { label: "Music", href: "/music", icon: "music", line: "Sounds that move you" },
              { label: "Photography", href: "/photography", icon: "camera", line: "Moments that matter" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
