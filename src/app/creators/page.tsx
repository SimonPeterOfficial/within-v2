import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import CreatorsGrid from "@/components/creators/CreatorsGrid";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Creators — WithIn",
  description: "The people who make the WithIn universe — filmmakers, writers, musicians and photographers.",
};

export default function CreatorsPage() {
  return (
    <UniverseShell preset="communities">
      <PageHero
        eyebrow={copy.creators.eyebrow}
        title={copy.creators.title}
        subtitle={copy.creators.subtitle}
      />
      <CreatorsGrid />
    </UniverseShell>
  );
}
