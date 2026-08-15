"use client";

import Container from "@/components/ui/Container";
import ContentCard from "@/components/ui/cards/ContentCard";
import { ORIGINALS } from "@/lib/content";

/** Mock "coming soon" — clearly labeled, no real release claims. */
const comingSoon = ORIGINALS.filter((original) => original.status === "coming-soon");

/** The coming-soon shelf — teasers, honestly labeled as mock. */
export default function OriginalsComingSoon() {
  if (comingSoon.length === 0) return null;

  return (
    <section className="scroll-mt-24 pb-24 text-white">
      <Container>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Coming soon
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em]">
              On the horizon
            </h2>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Mock catalogue entries — nothing here is a real production date.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoon.map((original, index) => (
            <ContentCard
              key={original.id}
              title={original.title}
              creator={original.creator}
              description={original.description}
              meta={`${original.type} · ${original.duration}`}
              href={`/originals/${original.id}`}
              tone="cinematic"
              cover={{ gradient: original.cover.gradient, emoji: original.cover.emoji }}
              badges={[{ label: "Coming soon", tone: "warm" as const }]}
              delay={index * 0.08}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
