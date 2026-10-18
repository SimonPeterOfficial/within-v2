"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { blurUp } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * Belonging — the fourth stage of the landing journey.
 *
 * A single, spacious composition instead of two competing cards.
 * Auri is intentionally absent here (BRAND.md: she must not always be
 * visible); she lives in the corner orb instead. This section speaks to
 * welcome and sanctuary without fabricating community statistics or
 * testimonials.
 */
const SANCTUARY_ACTIONS: { icon: IconName; label: string; href: string }[] = [
  { icon: "book", label: "Journal", href: "/mirror" },
  { icon: "camera", label: "Memories", href: "/photography" },
  { icon: "sparkles", label: "Mood Tracker", href: "/home#mood" },
  { icon: "mic", label: "Voice Notes", href: "/sanctuary" },
  { icon: "star", label: "Private AI", href: "/within" },
];

export default function SanctuaryDuo() {
  return (
    <section id="sanctuary" className="relative z-10 scroll-mt-28 pb-24 pt-20 text-white">
      {/* Soft atmospheric glow behind the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--mood-rgb),0.04),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-6 px-6 lg:grid-cols-2 lg:gap-8">
        {/* ── Left — the sanctuary promise ── */}
        <motion.div variants={blurUp} className="flex flex-col justify-center">
          <motion.p
            variants={blurUp}
            className="text-[11px] font-semibold tracking-[0.4em] uppercase text-[rgba(var(--mood-rgb),0.75)]"
            style={{ animationDelay: "0.1s" }}
          >
            Your private room.
          </motion.p>
          <motion.h3
            variants={blurUp}
            className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-[var(--elysian-ink)] md:text-4xl"
            style={{ animationDelay: "0.2s" }}
          >
            A space only you can enter.
          </motion.h3>
          <motion.p
            variants={blurUp}
            className="mt-5 max-w-lg text-[14px] leading-relaxed text-[var(--elysian-ink-soft)] md:text-lg"
            style={{ animationDelay: "0.3s" }}
          >
            Journal your thoughts, keep your memories, tune your mood, and
            speak with Auri. Nothing is performed here — it is kept.
          </motion.p>

          <div className="mt-10 flex flex-wrap gap-3">
            {SANCTUARY_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                onClick={(e) => fireRipple(e)}
                className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-[12px] font-medium text-[var(--elysian-ink-soft)] backdrop-blur transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(var(--mood-rgb),0.35)] hover:text-[var(--elysian-ink)]"
              >
                <Icon name={action.icon} size={14} className="text-[var(--elysian-ink-faint)] strokeWidth={1.7}" />
                {action.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Right — atmospheric illustration, no character ── */}
        <motion.div variants={blurUp} className="relative hidden lg:flex items-center justify-center">
          <div className="relative h-[420px] w-full max-w-[420px]">
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl bg-[rgba(var(--mood-rgb),0.10)] blur-[120px]"
              style={{ background: "radial-gradient(circle at 40% 40%, rgba(168,85,247,0.15), transparent 60%)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md"
            />
            <div
              aria-hidden
              className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#7c6ce0] to-[#a78bfa] -z-1 blur-[40px] opacity-40"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={blurUp}
        className="mt-20 flex items-center justify-center gap-4 text-[var(--elysian-ink-faint)] text-sm"
        style={{ animationDelay: "0.4s" }}
      >
        <span className="h-px w-8 bg-[rgba(255,255,255,0.20)]" />
        <p>WithIn keeps what matters to you.</p>
        <span className="h-px w-8 bg-[rgba(255,255,255,0.20)]" />
      </motion.div>
    </section>
  );
}
