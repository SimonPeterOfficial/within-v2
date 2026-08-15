"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";
import MeshGradient from "@/components/effects/MeshGradient";
import { BOOKS } from "@/lib/content";

type BooksSectionProps = {
  /** Where the header action leads (sanctuary: #originals, books page: /originals) */
  actionHref?: string;
  /** Where each book card leads (sanctuary: #originals, books page: /originals) */
  cardHref?: string;
};

/** Books — stories that sit with you for days, page by page. */
export default function BooksSection({ actionHref = "#originals", cardHref = "#originals" }: BooksSectionProps) {
  return (
    <section id="books" className="relative scroll-mt-24 py-24 text-white">
      {/* Warm reading room — violet light with candle-warm neutral */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <MeshGradient preset="books" />
      </div>
      <Container className="relative">
        <SectionHeader
          align="left"
          eyebrow="Books"
          title="Stories that sit with you for days"
          subtitle="Every bookmark is a promise kept. Pick up where your pages remember you."
          action={
            <Button href={actionHref} variant="ghost" size="md">
              Visit the library
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKS.map((book, index) => (
            <ContentCard
              key={book.id}
              delay={index * 0.08}
              title={book.title}
              creator={book.author}
              progress={book.progress}
              progressLabel={`Reading progress for ${book.title}`}
              meta={`${book.chapter} · ${book.meta}`}
              href={cardHref}
              badges={[{ label: "Reading", tone: "emerald" as const }]}
              tone="paper"
              cover={{ gradient: book.cover.gradient, emoji: book.cover.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
