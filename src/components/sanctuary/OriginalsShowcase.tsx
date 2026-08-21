"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import TiltCard from "@/components/ui/TiltCard";
import StarField from "@/components/sanctuary/StarField";
import MeshGradient from "@/components/effects/MeshGradient";
import BentoGrid, { BentoCard } from "@/components/ui/BentoGrid";
import { ORIGINALS } from "@/lib/content";
import { staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

const featured = ORIGINALS[0];
const FEATURED_PROGRESS = 0.42;

type OriginalsShowcaseProps = {
  trailerHref?: string;
};

/**
 * Cinematic Originals showcase — the flagship content section.
 *
 * A spotlight feature card dominates the view with cinematic depth,
 * a "Now streaming" editorial card beside it, and an auto-scrolling
 * marquee of all originals below. The featured card should feel like
 * a portal into the film — not a generic card.
 */
export default function OriginalsShowcase({ trailerHref = "#memories" }: OriginalsShowcaseProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <section id="originals" className="relative scroll-mt-24 overflow-hidden py-24 text-white">
      <StarField count={28} seed={11} />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header — editorial, centered */}
        <motion.div
          variants={staggerContainer(0.2, 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/50">
            WithIn Originals
          </p>
          <h2 className="mt-5 font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] md:text-5xl">
            Made to be felt
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400/70 md:text-base">
            Films, series, and books crafted for the way you feel.
          </p>
        </motion.div>

        {/* Bento spotlight — cinematic featured card + editorial sidebar */}
        <BentoGrid className="mt-8">
          <BentoCard size="featured" className="md:col-span-3">
            <TiltCard maxTilt={5} className="group h-full">
              <div
                className={`relative h-full min-h-[22rem] overflow-hidden rounded-2xl bg-linear-to-br ${featured.cover.gradient} p-8`}
              >
                {/* Deep cinematic lighting + slow art zoom */}
                <div
                  className="absolute inset-0 bg-black/25 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.6))` }}
                />
                <MeshGradient preset="originals" />
                <StarField count={22} seed={9} />

                {/* Play — the door into the original */}
                <a
                  href={trailerHref}
                  onClick={(e) => fireRipple(e)}
                  aria-label={`Play ${featured.title}`}
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.span
                    aria-hidden
                    animate={
                      prefersReducedMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.3, 0.08, 0.3] }
                    }
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-5 rounded-full bg-white/15 blur-sm"
                  />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white shadow-orb backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:border-white/30">
                    <Icon name="play" size={22} className="ml-0.5" />
                  </span>
                </a>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="neo-chip rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                      ✦ WithIn Original
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">{featured.title}</h3>
                    <p className="mt-1.5 text-sm text-white/65">
                      {featured.type} · {featured.duration}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      A {featured.type.toLowerCase()} by {featured.creator}
                    </p>
                    {/* Progress */}
                    <div className="mt-5 max-w-xs">
                      <div className="flex items-center justify-between text-[11px] text-white/60">
                        <span className="font-medium text-white/90">
                          {Math.round(FEATURED_PROGRESS * 100)}% watched
                        </span>
                        <span>{featured.duration}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-purple-300 to-emerald-300"
                          style={{ width: `${FEATURED_PROGRESS * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </BentoCard>

          <BentoCard size="tall" className="md:col-span-1">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
                Now streaming
              </p>
              <h4 className="font-display text-lg font-medium leading-snug">A feature-length emotional original</h4>
              <p className="text-sm leading-relaxed text-gray-500">
                Shot entirely within the sanctuary — every frame responds to how you feel right now.
              </p>
              <Button href={trailerHref} variant="primary" size="md" className="mt-auto w-fit">
                Watch the trailer
              </Button>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Auto-scrolling marquee — cinema rail */}
        <div className="group relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent_2%,black_12%,black_88%,transparent_98%)]">
          <div
            className={`flex w-max gap-5 ${
              prefersReducedMotion ? "" : "animate-marquee"
            } group-hover:[animation-play-state:paused]`}
          >
            {[...ORIGINALS, ...ORIGINALS].map((original, index) => (
              <div key={index} className="group w-60 shrink-0">
                <div
                  className={`relative h-32 overflow-hidden rounded-xl bg-linear-to-br ${original.cover.gradient}`}
                >
                  <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
                  <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    {original.type}
                  </span>
                  <span className="absolute bottom-3 left-3 text-2xl" aria-hidden>
                    {original.cover.emoji}
                  </span>
                  <a
                    href={trailerHref}
                    aria-label={`Play ${original.title}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white shadow-orb backdrop-blur-md transition duration-300 group-hover:scale-110">
                      <Icon name="play" size={16} className="ml-0.5" />
                    </span>
                  </a>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-white/90">{original.title}</h4>
                    <p className="truncate text-[11px] text-gray-500">{original.creator}</p>
                  </div>
                  <p className="ml-3 shrink-0 text-[11px] text-gray-500">{original.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
