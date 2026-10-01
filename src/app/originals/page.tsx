import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import OriginalsShowcase from "@/components/sanctuary/OriginalsShowcase";
import OriginalsGrid from "@/components/sanctuary/OriginalsGrid";
import OriginalsComingSoon from "@/components/sanctuary/OriginalsComingSoon";
import OriginalsSpotlight from "@/components/sanctuary/OriginalsSpotlight";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "WithIn Originals — WithIn",
  description: "The WithIn Originals catalogue — films, series and books crafted for the way you feel.",
};

export default function OriginalsPage() {
  return (
    <UniverseShell preset="originals" worldClass="world-originals">
      <WorldHero
        eyebrow={copy.originals.eyebrow}
        title={copy.originals.title}
        subtitle={copy.originals.subtitle}
        worldClass="world-originals"
      />
      <OriginalsShowcase trailerHref="/originals/salt-stars" />
      <OriginalsGrid />
      <OriginalsComingSoon />
      <OriginalsSpotlight />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <ContextualRail
          title="Nearby in the universe"
          destinations={[
            { label: "Books", href: "/books", icon: "library", line: "Stories for every mood" },
            { label: "Music", href: "/music", icon: "music", line: "Sounds that move you" },
            { label: "Photography", href: "/photography", icon: "camera", line: "Moments that matter" },
          ]}
        />
      </div>
    </UniverseShell>
  );
}
