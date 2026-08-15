import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import OriginalsShowcase from "@/components/sanctuary/OriginalsShowcase";
import OriginalsGrid from "@/components/sanctuary/OriginalsGrid";
import OriginalsComingSoon from "@/components/sanctuary/OriginalsComingSoon";
import OriginalsSpotlight from "@/components/sanctuary/OriginalsSpotlight";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "WithIn Originals — WithIn",
  description: "The WithIn Originals catalogue — films, series and books crafted for the way you feel.",
};

export default function OriginalsPage() {
  return (
    <UniverseShell preset="originals">
      <PageHero
        eyebrow={copy.originals.eyebrow}
        title={copy.originals.title}
        subtitle={copy.originals.subtitle}
      />
      <OriginalsShowcase trailerHref="/originals/salt-stars" />
      <OriginalsGrid />
      <OriginalsComingSoon />
      <OriginalsSpotlight />
    </UniverseShell>
  );
}
