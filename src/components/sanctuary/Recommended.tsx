"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";

const picks = [
  {
    id: "letters",
    title: "Letters to the Moon",
    creator: "Auri's pick for you",
    description: "Every night a girl writes to the moon — tonight, the moon writes back.",
    gradient: "from-pink-600 to-rose-500",
    emoji: "💌",
    badges: [{ label: "For you", tone: "mood" as const }],
    meta: "6 min read",
    href: "#memories"
  },
  {
    id: "constellations",
    title: "Paper Constellations",
    creator: "WithIn Originals",
    description: "A book of folded maps for people who got lost on purpose.",
    gradient: "from-emerald-500 to-teal-700",
    emoji: "🪐",
    badges: [{ label: "New", tone: "emerald" as const }],
    meta: "Book · 224 pages",
    href: "#originals"
  },
  {
    id: "night-garden",
    title: "Night Garden",
    creator: "Mira",
    description: "Ambient blooms for late hours — soft synths, slower breathing.",
    gradient: "from-emerald-500 to-teal-700",
    emoji: "🌱",
    badges: [{ label: "Calm", tone: "emerald" as const }],
    meta: "Album · 10 tracks",
    href: "#music"
  },
  {
    id: "quiet-tide",
    title: "The Quiet Tide",
    creator: "WithIn Originals",
    description: "Eight episodes of a small town learning to listen to the sea.",
    gradient: "from-cyan-500 to-blue-700",
    emoji: "🌊",
    badges: [{ label: "Trending", tone: "warm" as const }],
    meta: "Series · 8 eps",
    href: "#originals"
  },
  {
    id: "embers",
    title: "Embers",
    creator: "Nocturne",
    description: "Slow-burn soundscapes for the inspired hour after midnight.",
    gradient: "from-orange-500 to-rose-700",
    emoji: "🔥",
    badges: [{ label: "Trending", tone: "warm" as const }],
    meta: "Album · 9 tracks",
    href: "#music"
  },
  {
    id: "salt-stars",
    title: "Salt & Stars",
    creator: "WithIn Originals",
    description: "Two strangers, one desert, a horizon that refuses to stay still.",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    emoji: "🌌",
    badges: [{ label: "Featured", tone: "mood" as const }],
    meta: "Film · 1h 42m",
    href: "#originals"
  }
];

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

/** Recommended for you — Auri curates a fresh deck; refresh reshuffles it. */
export default function Recommended({ storyHref = "#memories" }: RecommendedProps) {
  const [shift, setShift] = useState(0);
  const deck = useMemo(() => rotate(picks, shift), [shift]);
  const resolveHref = (href: string) => (href === "#memories" ? storyHref : href);

  return (
    <section id="recommended" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Recommended for you"
          title="Chosen for the way you feel"
          subtitle="Auri reads the room — your room — and sets out a few quiet corners."
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
              cover={{ gradient: pick.gradient, emoji: pick.emoji }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
