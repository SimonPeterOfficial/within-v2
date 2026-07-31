"use client";

import { useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import TiltCard from "@/components/ui/TiltCard";
import StarField from "@/components/sanctuary/StarField";

const originals = [
  {
    title: "Salt & Stars",
    type: "Film",
    duration: "1h 42m",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    emoji: "🌌"
  },
  {
    title: "The Quiet Tide",
    type: "Series",
    duration: "8 eps",
    gradient: "from-cyan-500 to-blue-700",
    emoji: "🌊"
  },
  {
    title: "Paper Constellations",
    type: "Book",
    duration: "224 pages",
    gradient: "from-emerald-500 to-teal-700",
    emoji: "🪐"
  },
  {
    title: "Midnight Garden",
    type: "Film",
    duration: "58 min",
    gradient: "from-pink-500 to-rose-700",
    emoji: "🌸"
  },
  {
    title: "Echoes of Home",
    type: "Series",
    duration: "6 eps",
    gradient: "from-amber-500 to-orange-700",
    emoji: "🏠"
  },
  {
    title: "The Last Aurora",
    type: "Film",
    duration: "1h 12m",
    gradient: "from-fuchsia-500 to-purple-700",
    emoji: "🌠"
  }
];

const featured = originals[0];

/** Cinematic Originals showcase — a spotlight feature + living film marquee. */
export default function OriginalsShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="originals"
      className="relative scroll-mt-24 overflow-hidden py-24 text-white"
    >
      <StarField count={30} seed={11} />

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="WithIn Originals"
          title="Made to be felt"
          subtitle="Films, series, and books crafted for the way you feel."
        />

        {/* Featured spotlight */}
        <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <TiltCard maxTilt={5} className="group">
            <div
              className={`relative h-72 overflow-hidden rounded-3xl bg-linear-to-br ${featured.gradient} p-8`}
            >
              <div className="absolute inset-0 bg-black/30" />
              <StarField count={24} seed={9} />
              <div className="relative flex h-full flex-col justify-between">
                <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                  Featured original
                </span>
                <div>
                  <h3 className="text-3xl font-black">{featured.title}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {featured.type} · {featured.duration}
                  </p>
                </div>
              </div>
            </div>
          </TiltCard>

          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              Now streaming
            </p>
            <h4 className="text-xl font-bold">A feature-length emotional original</h4>
            <p className="text-sm leading-relaxed text-gray-400">
              Shot entirely within the sanctuary — every frame responds to how you feel right
              now.
            </p>
            <Button
              href="#memories"
              variant="primary"
              size="md"
              className="mt-auto w-fit"
            >
              Watch the trailer
            </Button>
          </div>
        </div>

        {/* Auto-scrolling marquee (pauses on hover) */}
        <div className="group relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div
            className={`flex w-max ${
              prefersReducedMotion ? "" : "animate-marquee"
            } group-hover:[animation-play-state:paused]`}
          >
            {[...originals, ...originals].map((original, index) => (
              <div key={index} className="mr-6 w-64 shrink-0">
                <div
                  className={`relative h-36 overflow-hidden rounded-2xl bg-linear-to-br ${original.gradient}`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    {original.type}
                  </span>
                  <span className="absolute bottom-3 left-3 text-3xl" aria-hidden>
                    {original.emoji}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{original.title}</h4>
                  <p className="text-xs text-gray-500">{original.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
