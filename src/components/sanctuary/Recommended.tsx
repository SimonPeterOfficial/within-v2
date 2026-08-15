"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import { recommendFor, recommendationReason, timeHeadline } from "@/lib/recommendations";
import { useEnvironment } from "@/lib/environment";
import { getMood } from "@/lib/mood";

/** Rotates the deck by `shift` so "Refresh picks" genuinely reshuffles. */
function rotate<T>(items: T[], shift: number): T[] {
  if (items.length === 0) return items;
  const offset = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

type RecommendedProps = {
  /** Where story picks lead (sanctuary: #memories, landing: #continue) */
  storyHref?: string;
};

/**
 * Recommended for you — the deck responds to the moment.
 * The recommendation engine (lib/recommendations.ts) ranks the catalog by
 * the live mood and time of day; refresh rotates the stable result.
 */
export default function Recommended({ storyHref = "#memories" }: RecommendedProps) {
  const { period, moodId } = useEnvironment();
  const [shift, setShift] = useState(0);
  const deck = useMemo(
    () => rotate(recommendFor(moodId, period), shift),
    [moodId, period, shift]
  );
  const resolveHref = (href: string) => (href === "#memories" ? storyHref : href);
  const selectedMood = getMood(moodId);

  return (
    <section id="recommended" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow={timeHeadline(period)}
          title="Chosen for the way you feel"
          subtitle={
            selectedMood
              ? `Auri set these out for your ${selectedMood.label.toLowerCase()} mood — the light already knows.`
              : `Auri set these out for ${recommendationReason(null, period)} — a few quiet corners.`
          }
          action={
            <Button variant="ghost" size="md" onClick={() => setShift((current) => current + 1)}>
              <motion.span
                key={shift}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2"
              >
                <Icon name="refresh" size={15} />
                Refresh picks
              </motion.span>
            </Button>
          }
        />

        <div key={shift} className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deck.map((pick, index) => (
            <ContentCard
              key={pick.id}
              delay={index * 0.07}
              title={pick.title}
              creator={pick.creator}
              description={pick.description}
              badges={pick.badges}
              meta={pick.meta}
              href={resolveHref(pick.href)}
              cover={{ gradient: pick.cover.gradient, emoji: pick.cover.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
