"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";

const journey = [
  {
    id: "lighthouse",
    title: "The Lighthouse Keeper",
    kind: "Story · Chapter 4",
    progress: 0.62,
    meta: "12 min left",
    gradient: "from-purple-600 to-indigo-600",
    emoji: "🌊",
    badge: { label: "Resume", tone: "mood" as const },
    href: "#memories"
  },
  {
    id: "horizon",
    title: "Horizon",
    kind: "Original film · 1h 42m",
    progress: 0.4,
    meta: "1h 02m left",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🌅",
    badge: { label: "Watching", tone: "warm" as const },
    href: "#originals"
  },
  {
    id: "rainfall",
    title: "Rainfall Studies",
    kind: "Album · Track 6 of 14",
    progress: 0.46,
    meta: "8 tracks left",
    gradient: "from-cyan-600 to-blue-700",
    emoji: "🌧",
    badge: { label: "Listening", tone: "emerald" as const },
    href: "#music"
  }
];

type ContinueJourneyProps = {
  /** Where story cards lead (sanctuary: #memories, landing: #continue) */
  storyHref?: string;
  /** Where the header action leads (sanctuary: #discover, landing: #originals) */
  actionHref?: string;
};

/** Continue your journey — the quietest doorway back into unfinished worlds. */
export default function ContinueJourney({
  storyHref = "#memories",
  actionHref = "#discover"
}: ContinueJourneyProps) {
  // Story cards point at #memories by default — remap on surfaces without one.
  const resolveHref = (href: string) => (href === "#memories" ? storyHref : href);

  return (
    <section id="continue" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Continue your journey"
          title="Pick up where you left off"
          subtitle="The story didn't stop when you did — it kept your place warm."
          action={
            <Button href={actionHref} variant="ghost" size="md">
              See everything
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {journey.map((item, index) => (
            <ContentCard
              key={item.id}
              delay={index * 0.1}
              title={item.title}
              creator={item.kind}
              progress={item.progress}
              progressLabel={`Progress for ${item.title}`}
              meta={item.meta}
              href={resolveHref(item.href)}
              badges={[item.badge]}
              cover={{ gradient: item.gradient, emoji: item.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
