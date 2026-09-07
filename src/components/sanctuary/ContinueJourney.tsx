"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import { getInProgress } from "@/lib/library";
import { UNIVERSE } from "@/lib/search";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Resolves stored item ids back to universe entries for display. */
function resolveEntries(ids: string[]) {
  return ids
    .map((itemId) => UNIVERSE.find((entry) => entry.id === itemId))
    .filter((entry): entry is (typeof UNIVERSE)[number] => Boolean(entry));
}

/**
 * Continue where you left off — the quiet doorway back into unfinished
 * worlds. Reads real progress records from the local library (pieces the
 * user actually started). When nothing is in progress, the section steps
 * aside entirely rather than inventing a journey.
 */
export default function ContinueJourney() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [inProgress, setInProgress] = useState<
    { itemId: string; label?: string; progress: number }[]
  >([]);

  // Hydration-safe: progress resolves after mount (it lives in this browser).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setInProgress(
        getInProgress().map(({ itemId, record }) => ({
          itemId,
          label: record.label,
          progress: record.progress,
        }))
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const entries = useMemo(
    () => resolveEntries(inProgress.map((item) => item.itemId)),
    [inProgress]
  );

  // Nothing started yet — the section stays quiet, the home reads as calm.
  if (entries.length === 0) return null;

  return (
    <section id="continue" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Continue your journey"
          title="Pick up where you left off"
          subtitle="The story didn't stop when you did — it kept your place warm."
          action={
            <Button href="/profile" variant="ghost" size="md">
              See everything
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {entries.map((entry, index) => {
            const record = inProgress[index];
            return (
              <ContentCard
                key={entry.id}
                delay={prefersReducedMotion ? 0 : index * 0.1}
                title={entry.title}
                creator={entry.by}
                progress={record?.progress ?? 0}
                progressLabel={`Progress for ${entry.title}`}
                meta={record?.label ?? entry.meta}
                href={entry.href}
                badges={[{ label: "Resume", tone: "mood" as const }]}
                cover={{ gradient: entry.gradient, emoji: entry.emoji }}
              />
            );
          })}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-gray-600">
          <Icon name="clock" size={12} />
          Progress is kept in this browser — it travels with your account when sync arrives.
        </p>
      </Container>
    </section>
  );
}
