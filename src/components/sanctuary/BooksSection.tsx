"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";

const books = [
  {
    id: "paper-constellations",
    title: "Paper Constellations",
    author: "Elena Marek",
    progress: 0.44,
    chapter: "Chapter 4 of 9",
    meta: "84 pages left",
    gradient: "from-emerald-500 to-teal-700",
    emoji: "🪐"
  },
  {
    id: "tide-returns",
    title: "The Tide Returns",
    author: "Jonas Wu",
    progress: 0.71,
    chapter: "Chapter 7 of 10",
    meta: "38 pages left",
    gradient: "from-sky-500 to-indigo-700",
    emoji: "🌊"
  },
  {
    id: "garden-whispers",
    title: "Garden Whispers",
    author: "Priya Nair",
    progress: 0.18,
    chapter: "Chapter 1 of 8",
    meta: "212 pages left",
    gradient: "from-rose-500 to-pink-700",
    emoji: "🌸"
  },
  {
    id: "light-keepers",
    title: "Light Keepers",
    author: "Omar Hale",
    progress: 0.92,
    chapter: "Epilogue",
    meta: "6 pages left",
    gradient: "from-amber-500 to-orange-700",
    emoji: "🏮"
  }
];

/** Books — stories that sit with you for days, page by page. */
export default function BooksSection() {
  return (
    <section id="books" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Books"
          title="Stories that sit with you for days"
          subtitle="Every bookmark is a promise kept. Pick up where your pages remember you."
          action={
            <Button href="#originals" variant="ghost" size="md">
              Visit the library
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book, index) => (
            <ContentCard
              key={book.id}
              delay={index * 0.08}
              title={book.title}
              creator={book.author}
              progress={book.progress}
              progressLabel={`Reading progress for ${book.title}`}
              meta={`${book.chapter} · ${book.meta}`}
              href="#originals"
              badges={[{ label: "Reading", tone: "emerald" as const }]}
              cover={{ gradient: book.gradient, emoji: book.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
