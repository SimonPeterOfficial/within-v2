import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import DiscoverExperience from "@/components/discover/DiscoverExperience";
import { listPublishedContent } from "@/lib/content-service";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Discover — WithIn",
  description: "Search the whole universe: films, stories, music, books, photography, communities and creators.",
};

export const dynamic = "force-dynamic";

/**
 * Discover — now data-driven. The server fetches live published content and
 * hands it to the search experience; when the database is empty the page
 * shows honest empty states instead of fabricated catalogs.
 */
export default async function DiscoverPage() {
  const entries = await listPublishedContent({ limit: 60 });

  return (
    <UniverseShell preset="sanctuary">
      <PageHero eyebrow={copy.discover.eyebrow} title={copy.discover.title} subtitle={copy.discover.subtitle} />
      <div className="pb-28">
        <DiscoverExperience entries={entries} />
      </div>
    </UniverseShell>
  );
}