import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import BooksSection from "@/components/sanctuary/BooksSection";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Books — WithIn",
  description: "Stories that sit with you for days — the WithIn library.",
};

export default function BooksPage() {
  return (
    <UniverseShell preset="books">
      <PageHero
        eyebrow={copy.books.eyebrow}
        title={copy.books.title}
        subtitle={copy.books.subtitle}
      />
      <div className="pb-10">
        <BooksSection actionHref="/originals" cardHref="/originals" />
      </div>
    </UniverseShell>
  );
}
