"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import MeshGradient from "@/components/effects/MeshGradient";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { ALBUMS } from "@/lib/content";
import { useStoredInterests } from "@/lib/interests";

/** Equalizer bars — three hairs that dance while a track "plays". */
function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="w-[3px] origin-bottom rounded-full bg-emerald-300"
          style={{ height: 12 }}
          animate={playing ? { scaleY: [0.3, 1, 0.55, 0.9, 0.3] } : { scaleY: 1 }}
          transition={
            playing
              ? { duration: 1.1, repeat: Infinity, delay: index * 0.16, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

type MusicSectionProps = {
  /** Where the header action leads (sanctuary: #discover, landing: #books) */
  actionHref?: string;
};

/** Music — soundscapes for the way you feel. One track breathes at a time.
 * When Music isn't among the listener's chosen interests the shelf stays
 * reachable but reads as a quiet rail — prominence follows preference. */
export default function MusicSection({ actionHref = "#discover" }: MusicSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotionSafe();
  const interests = useStoredInterests();
  // No interests yet (new/landing) → everything is prominent. Otherwise the
  // shelf leads only when the listener actually chose it.
  const prominent = interests.length === 0 || interests.includes("music");
  const nowPlaying = ALBUMS.find((album) => album.id === playingId) ?? null;

  const toggle = (id: string) => setPlayingId((current) => (current === id ? null : id));

  const renderAlbum = (album: (typeof ALBUMS)[number], index: number) => {
    const playing = playingId === album.id;
    return (
      <ContentCard
        key={album.id}
        delay={index * 0.08}
        title={album.title}
        creator={album.artist}
        meta={`Album · ${album.tracks} tracks`}
        tone={playing ? "clay" : "tactile"}
        cover={{
          gradient: album.cover.gradient,
          emoji: album.cover.emoji,
          className: "aspect-square h-auto"
        }}
        action={
          <button
            type="button"
            onClick={() => toggle(album.id)}
            aria-pressed={playing}
            aria-label={playing ? `Pause ${album.title}` : `Play ${album.title}`}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition duration-300 ${
              playing
                ? "bg-emerald-400 text-black shadow-emerald"
                : "bg-white/10 text-white backdrop-blur sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[rgba(var(--mood-rgb),1)] hover:text-black"
            }`}
          >
            {playing ? (
              <Icon name="pause" size={16} />
            ) : (
              <Icon name="play" size={16} className="ml-0.5" />
            )}
          </button>
        }
      />
    );
  };

  return (
    <section id="music" className="relative scroll-mt-24 py-24 text-white">
      {/* Rhythmic room — violet + cyan light, low and slow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <MeshGradient preset="music" />
      </div>
      <Container className="relative">
        <SectionHeader
          align="left"
          eyebrow="Music"
          title="Soundscapes for the way you feel"
          subtitle="Slow tides, warm embers, night rain — pick a room and stay a while."
          action={
            <Button href={actionHref} variant="ghost" size="md">
              Browse all
            </Button>
          }
        />

        {/* Now playing — appears when a track is breathing */}
        <div aria-live="polite">
          <AnimatePresence>
            {nowPlaying && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-10 flex w-fit items-center gap-3 rounded-full border border-emerald-400/25 bg-emerald-400/10 py-2 pl-4 pr-5 backdrop-blur">
                  <Equalizer playing />
                  <p className="text-sm text-emerald-100">
                    Now playing — <span className="font-semibold">{nowPlaying.title}</span>
                    <span className="text-emerald-300/70"> · {nowPlaying.artist}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {prominent ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ALBUMS.map(renderAlbum)}
          </div>
        ) : (
          <div className="mt-12 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ALBUMS.map((album, index) => (
              <div key={album.id} className="w-56 shrink-0">
                {renderAlbum(album, index)}
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-600">
          {prefersReducedMotion
            ? "Reduced motion is on — the equalizer rests."
            : "Demo playback — the sanctuary hums along quietly."}
        </p>
      </Container>
    </section>
  );
}
