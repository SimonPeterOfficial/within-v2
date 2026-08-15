import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import DiscoverExperience from "@/components/discover/DiscoverExperience";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Discover — WithIn",
  description: "Search the whole universe: films, stories, music, books, photography, communities and creators.",
};

export default function DiscoverPage() {
  return (
    <UniverseShell preset="sanctuary">
      <PageHero eyebrow={copy.discover.eyebrow} title={copy.discover.title} subtitle={copy.discover.subtitle} />
      <div className="pb-28">
        <DiscoverExperience />
      </div>
    </UniverseShell>
  );
}
