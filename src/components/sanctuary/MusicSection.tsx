"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const albums = [
  {
    id: "tide",
    title: "Tide & Silence",
    artist: "Lumen",
    tracks: 12,
    gradient: "from-cyan-500 to-blue-700",
    emoji: "🌊"
  },
  {
    id: "embers",
    title: "Embers",
    artist: "Nocturne",
    tracks: 9,
    gradient: "from-orange-500 to-rose-700",
    emoji: "🔥"
  },
  {
    id: "rainfall",
    title: "Rainfall Studies",
    artist: "Aster",
    tracks: 14,
    gradient: "from-indigo-500 to-slate-700",
    emoji: "🌧"
  },
  {
    id: "garden",
    title: "Night Garden",
    artist: "Mira",
    tracks: 10,
    gradient: "from-emerald-500 to-teal-700",
    emoji: "🌱"
  }
];

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

/** Music — soundscapes for the way you feel. One track breathes at a time. */
export default function MusicSection({ actionHref = "#discover" }: MusicSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotionSafe();
  const nowPlaying = albums.find((album) => album.id === playingId) ?? null;

  const toggle = (id: string) => setPlayingId((current) => (current === id ? null : id));

  return (
    <section id="music" className="scroll-mt-24 py-24 text-white">
      <Container>
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((album, index) => {
            const playing = playingId === album.id;
            return (
              <ContentCard
                key={album.id}
                delay={index * 0.08}
                title={album.title}
                creator={album.artist}
                meta={`Album · ${album.tracks} tracks`}
                cover={{
                  gradient: album.gradient,
                  emoji: album.emoji,
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
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
          {prefersReducedMotion
            ? "Reduced motion is on — the equalizer rests."
            : "Demo playback — the sanctuary hums along quietly."}
        </p>
      </Container>
    </section>
  );
}
