import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { PHOTOS } from "@/lib/content";
import ContentCard from "@/components/ui/cards/ContentCard";
import { MotionContainer, FadeItem } from "@/components/motion/MotionStagger";

export const metadata: Metadata = {
  title: "Photography — WithIn",
  description: "Moments that matter — the WithIn photography galleries.",
};

/**
 * Photography — the galleries of WithIn.
 *
 * Shows the real photography catalog from lib/content with editorial
 * presentation. Each photo is a real entry with title, photographer,
 * description, and cover art.
 */
export default function PhotographyPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-photography">
      <WorldHero
        eyebrow={copy.photography.eyebrow}
        title={copy.photography.title}
        subtitle={copy.photography.subtitle}
        worldClass="world-photography"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Photography catalog — real content from lib/content */}
        <MotionContainer
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PHOTOS.map((photo, index) => (
            <FadeItem key={photo.id}>
              <ContentCard
                title={photo.title}
                creator={photo.creator}
                description={photo.description}
                meta={photo.meta}
                href={`/content/${photo.id}`}
                cover={{ gradient: photo.cover.gradient, emoji: photo.cover.emoji }}
                badges={photo.status ? [{ label: photo.status, tone: "mood" as const }] : undefined}
                delay={index * 0.06}
              />
            </FadeItem>
          ))}
        </MotionContainer>

        <div className="mt-6">
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Originals", href: "/originals", icon: "originals", line: "Films, series & more" },
              { label: "Books", href: "/books", icon: "library", line: "Stories for every mood" },
              { label: "Music", href: "/music", icon: "music", line: "Sounds that move you" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
