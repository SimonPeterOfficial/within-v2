"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";
import { PHOTOS } from "@/lib/content";
import { useStoredInterests } from "@/lib/interests";

type PhotographySectionProps = {
  /** Where the header action leads (sanctuary: #communities, page: /creators) */
  actionHref?: string;
};

/** Photography — stillness, captured. One tall frame anchors a balanced wall.
 * When Photography isn't among the listener's interests the shelf stays
 * reachable as a quiet rail — prominence follows preference. */
export default function PhotographySection({ actionHref = "#communities" }: PhotographySectionProps) {
  const interests = useStoredInterests();
  // No interests yet (new/landing) → everything is prominent. Otherwise the
  // wall leads only when the viewer actually chose it.
  const prominent = interests.length === 0 || interests.includes("photography");

  const renderPhoto = (photo: (typeof PHOTOS)[number], index: number) => (
    <ContentCard
      key={photo.id}
      delay={index * 0.08}
      title={photo.title}
      creator={`By ${photo.by}`}
      description={photo.caption}
      meta={photo.place}
      badges={index === 0 ? [{ label: "Featured", tone: "mood" as const }] : undefined}
      cover={{
        gradient: photo.cover.gradient,
        emoji: photo.cover.emoji,
        className: photo.tall ? "h-72 md:h-full md:min-h-[24rem]" : "h-48"
      }}
      tone="cinematic"
      className={photo.tall ? "md:col-span-2 md:row-span-2" : ""}
    />
  );

  return (
    <section id="photography" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Photography"
          title="Stillness, captured"
          subtitle="Frames from people who wait for the light to lean a certain way."
          action={
            <Button href={actionHref} variant="ghost" size="md">
              Meet the photographers
            </Button>
          }
        />

        {prominent ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PHOTOS.map(renderPhoto)}
          </div>
        ) : (
          <div className="mt-12 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PHOTOS.map((photo) => (
              <div key={photo.id} className="w-64 shrink-0">
                <ContentCard
                  title={photo.title}
                  creator={`By ${photo.by}`}
                  meta={photo.place}
                  cover={{ gradient: photo.cover.gradient, emoji: photo.cover.emoji, className: "h-56" }}
                  tone="cinematic"
                />
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-gray-600">
          A new frame every night, hung by the community
        </p>
      </Container>
    </section>
  );
}
