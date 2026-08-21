"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import GlassCard from "@/components/ui/GlassCard";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/** The quiet rooms of the sanctuary — what lives behind the door. */
const ROOMS: { icon: IconName; label: string; line: string }[] = [
  { icon: "book", label: "Journal", line: "Pages for what you can't say out loud" },
  { icon: "moon", label: "Mood", line: "The light tunes itself to how you feel" },
  { icon: "heart", label: "Memories", line: "Small moments, kept warm" },
  { icon: "mic", label: "Voice notes", line: "Speak it, and it stays" },
  { icon: "sparkles", label: "Auri", line: "A quiet presence, always listening" },
  { icon: "play", label: "Continue journey", line: "Unfinished worlds keep your place" },
];

/**
 * The Sanctuary — WithIn's emotional heart.
 *
 * A warm, private room — visually distinct from the public universe.
 * Softer lighting, warmer blacks, intimate glass cards. This section
 * should feel like stepping from a bright gallery into a candlelit room.
 */
export default function SanctuaryMoment() {
  return (
    <section id="sanctuary" className="section-ambient relative scroll-mt-24 overflow-hidden py-32 text-white">
      {/* Warmer, deeper room — the private light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(var(--mood-rgb),0.05),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(139,92,246,0.03),transparent_50%)]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
      />

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.15fr]">
          {/* Editorial statement — warm, inviting */}
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.p variants={blurUp} className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/60">
              The sanctuary
            </motion.p>
            <motion.h2 variants={blurUp} className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] md:text-5xl lg:text-6xl">
              Somewhere to come back to.
            </motion.h2>
            <motion.p variants={blurUp} className="mt-5 max-w-md text-[15px] leading-[1.75] text-gray-400/65 md:text-base">
              Discovery is the front door. The sanctuary is the quiet room inside — journal,
              mood, memories and Auri, all waiting when you need them. No noise. No feed.
              Just the place that knows how you feel.
            </motion.p>
            <motion.div variants={blurUp} className="mt-9 flex flex-wrap gap-4">
              <Button href="/signup" variant="primary" size="lg" onClick={(e) => fireRipple(e)}>
                Step inside
              </Button>
              <Button href="/home" variant="ghost" size="lg">
                Wander the sanctuary
              </Button>
            </motion.div>
          </motion.div>

          {/* The six rooms — warm glass, each with its own purpose */}
          <motion.div
            variants={staggerContainer(0.07, 0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {ROOMS.map((room) => (
              <motion.div key={room.label} variants={blurUp} className="h-full">
                <GlassCard tone="soft" hoverLift sheen className="h-full p-5">
                  {/* Clay-like depth highlight */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-emerald-300/70">
                    <Icon name={room.icon} size={17} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-white">{room.label}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{room.line}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
