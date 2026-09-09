"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import GlassCard from "@/components/ui/GlassCard";
import ContentCard from "@/components/ui/cards/ContentCard";
import AuriEmptyState from "@/components/ui/states/AuriEmptyState";
import { useSession } from "@/lib/auth/session";
import { getShelf, getInProgress, shelfCount } from "@/lib/library";
import { UNIVERSE } from "@/lib/search";
import { copy } from "@/lib/navigation";

const SHELF_META: Record<string, string> = {
  Films: "Film",
  Stories: "Story",
  Books: "Book",
  Music: "Album",
  Photography: "Photo",
  Communities: "Community",
  Creators: "Creator"
};

/** Resolve saved ids back to universe entries for display. */
function resolveEntries(ids: string[]): typeof UNIVERSE {
  return ids
    .map((id) => UNIVERSE.find((entry) => entry.id === id || entry.title.toLowerCase() === id))
    .filter((entry): entry is (typeof UNIVERSE)[number] => Boolean(entry));
}

/**
 * Profile — "my corner of WithIn." Session identity, saved content, likes,
 * and the journey in progress. Everything is local and honest about it.
 */
export default function ProfileView() {
  const { user } = useSession();
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [inProgress, setInProgress] = useState<{ itemId: string; label?: string; progress: number }[]>([]);

  // Hydration-safe: shelves resolve after mount (they live in this browser).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSaved(getShelf("saved"));
      setRecent(getShelf("recently-viewed"));
      setInProgress(
        getInProgress().map(({ itemId, record }) => ({
          itemId,
          label: record.label,
          progress: record.progress
        }))
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const savedEntries = useMemo(() => resolveEntries(saved), [saved]);
  const recentEntries = useMemo(() => resolveEntries(recent), [recent]);
  const progressEntries = useMemo(
    () => resolveEntries(inProgress.map((item) => item.itemId)),
    [inProgress]
  );
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? "G";

  return (
    <>
      <PageHero
        eyebrow={copy.profile.eyebrow}
        title={`Welcome, ${user?.name.split(" ")[0] ?? "soul"}.`}
        subtitle={copy.profile.subtitle}
      />

      <Container className="pb-28">
        {/* Identity — a crystal surface with light-born edges */}
        <GlassCard tone="strong" className="crystal-elevated crystal-edge depth-medium p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-2xl font-bold text-black shadow-orb">
                {initial}
              </span>
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">{user?.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                <p className="mt-2 text-xs text-gray-600">
                  {shelfCount("saved")} saved · {shelfCount("liked")} liked · {recent.length} recently viewed
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button href="/settings" variant="outline" size="md">
                <Icon name="settings" size={15} className="mr-1.5" />
                Preferences
              </Button>
              <Button href="/discover" variant="primary" size="md">
                Find something new
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Continue shelf — the journey so far */}
        <div className="mt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            In progress
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
            Pick up where you left off
          </h2>
          {inProgress.length === 0 ? (
            <AuriEmptyState
              className="mt-8"
              message="Nothing in progress yet — and that's fine. The universe keeps your place whenever you're ready."
              detail="Stories, albums and books you start will gather here."
              action={
                <Button href="/discover" variant="outline" size="md">
                  <span className="mr-1.5" aria-hidden>✦</span>
                  Find something
                </Button>
              }
            />
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {progressEntries.map((entry, index) => {
                const record = inProgress[index];
                return (
                  <ContentCard
                    key={entry.id}
                    title={entry.title}
                    creator={entry.by}
                    progress={record?.progress ?? 0}
                    progressLabel={`Progress for ${entry.title}`}
                    meta={entry.meta}
                    href={entry.href}
                    cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                    delay={index * 0.08}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Saved shelf */}
        <div className="mt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Saved
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
            Kept for later
          </h2>
          {savedEntries.length === 0 ? (
            <AuriEmptyState
              className="mt-8"
              message="Nothing saved yet — the quiet keepsake shelf."
              detail="Save films, stories, music and books and they'll wait here for you."
              action={
                <Button href="/discover" variant="outline" size="md">
                  <Icon name="bookmark" size={14} className="mr-1.5" />
                  Save something
                </Button>
              }
            />
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedEntries.map((entry, index) => (
                <ContentCard
                  key={entry.id}
                  title={entry.title}
                  creator={entry.by}
                  description={entry.description}
                  meta={entry.meta}
                  href={entry.href}
                  cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                  badges={[{ label: SHELF_META[entry.category] ?? entry.category, tone: "mood" as const }]}
                  delay={index * 0.08}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recently viewed */}
        {recentEntries.length > 0 && (
          <div className="mt-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Recently viewed
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
              You were just here
            </h2>
            <motion.div className="mt-8 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="w-56 shrink-0">
                  <ContentCard
                    title={entry.title}
                    creator={entry.by}
                    meta={entry.meta}
                    href={entry.href}
                    variant="compact"
                    cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        )}

        <p className="mt-16 text-center text-xs text-gray-600">
          Everything here lives in this browser for now — nothing leaves your device. When the
          account system arrives, this corner syncs with it.
        </p>
      </Container>
    </>
  );
}
