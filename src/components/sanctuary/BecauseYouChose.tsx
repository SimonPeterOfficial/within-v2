"use client";

import { useMemo } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";
import { useStoredInterests, getInterest, interestSummary, type InterestId } from "@/lib/interests";
import { UNIVERSE } from "@/lib/search";

/** Varied narratives — the home feed feels different at different hours. */
const NARRATIVES = [
  { title: "Because you chose…", subtitle: "You picked", fallback: "A few corners set out to match the way you feel." },
  { title: "Curated for the way you feel", subtitle: "Your choices led to", fallback: "Corners shaped by the way you feel right now." },
  { title: "Because you stayed a while", subtitle: "You explored", fallback: "The universe noticed what you lingered near." },
  { title: "A quiet corner, just for you", subtitle: "You were drawn to", fallback: "Spaces that match the light you carry." },
  { title: "Because something belongs here", subtitle: "You chose", fallback: "A few paths set out for where you're headed." },
];

/** Picks up to `count` entries per chosen shelf, in catalog order. */
function picksForInterests(ids: InterestId[], count = 2) {
  const picks: typeof UNIVERSE = [];
  for (const id of ids) {
    const interest = getInterest(id);
    if (!interest) continue;
    const shelf = UNIVERSE.filter((entry) => entry.category === interest.category);
    for (const entry of shelf.slice(0, count)) {
      if (!picks.some((pick) => pick.id === entry.id)) picks.push(entry);
    }
  }
  return picks.slice(0, 6);
}

/**
 * "Because you chose…" — the honest, deterministic personalization shelf.
 * Reads the interests chosen during onboarding (local, never AI claims) and
 * surfaces one or two pieces from each chosen shelf. If nothing was chosen,
 * the section stays quiet and the home reads as the default universe.
 */
export default function BecauseYouChose() {
  const interests = useStoredInterests();
  const picks = useMemo(() => picksForInterests(interests), [interests]);

  if (picks.length === 0) return null;
  const summary = interestSummary(interests);

  // Varied narratives — rotate based on the hour so the same page feels different
  const hour = new Date().getHours();
  const narrativeIndex = hour % NARRATIVES.length;
  const narrative = NARRATIVES[narrativeIndex];

  return (
    <section id="because-you-chose" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="For you"
          title={narrative.title}
          subtitle={
            summary
              ? `${narrative.subtitle} ${summary.toLowerCase()} — here are a few corners set out to match.`
              : narrative.fallback
          }
          action={
            <Button href="/discover" variant="ghost" size="md">
              See everything
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((entry, index) => (
            <ContentCard
              key={entry.id}
              delay={index * 0.08}
              title={entry.title}
              creator={entry.by}
              description={entry.description}
              meta={entry.meta}
              href={entry.href}
              cover={{ gradient: entry.gradient, emoji: entry.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
