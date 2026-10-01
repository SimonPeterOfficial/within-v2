import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Mirror — WithIn",
  description: "Quiet reflection — the WithIn mirror.",
};

export default function MirrorPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-mirror">
      <WorldHero
        eyebrow={copy.mirror.eyebrow}
        title={copy.mirror.title}
        subtitle={copy.mirror.subtitle}
        worldClass="world-mirror"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <ContextualRail
          title="Nearby in the universe"
          destinations={[
            { label: "Sanctuary", href: "/sanctuary", icon: "heart", line: "A calmer you" },
            { label: "Within Time", href: "/atlas", icon: "clock", line: "Moments, layered" },
            { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
          ]}
        />
      </div>
    </UniverseShell>
  );
}
