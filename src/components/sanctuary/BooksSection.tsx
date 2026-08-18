"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";
import MeshGradient from "@/components/effects/MeshGradient";
import { BOOKS } from "@/lib/content";
import { useStoredInterests } from "@/lib/interests";

type BooksSectionProps = {
  /** Where the header action leads (sanctuary: #originals, books page: /originals) */
  actionHref?: string;
  /** Where each book card leads (sanctuary: #originals, books page: /originals) */
  cardHref?: string;
};

/** Books — stories that sit with you for days, page by page.
 * When Books aren't among the listener's interests the shelf stays reachable
 * as a quiet rail — prominence follows preference. */
export default function BooksSection({ actionHref = "#originals", cardHref = "#originals" }: BooksSectionProps) {
  const interests = useStoredInterests();
  // No interests yet (new/landing) → everything is prominent. Otherwise the
  // shelf leads only when the reader actually chose it.
  const prominent = interests.length === 0 || interests.includes("books");

  const renderBook = (book: (typeof BOOKS)[number], index: number) => (
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
  );

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

        {prominent ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BOOKS.map(renderBook)}
          </div>
        ) : (
          <div className="mt-12 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BOOKS.map((book, index) => (
              <div key={book.id} className="w-56 shrink-0">
                {renderBook(book, index)}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
