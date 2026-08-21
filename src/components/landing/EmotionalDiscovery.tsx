"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useEnvironment } from "@/lib/environment";
import { applyMood, moods } from "@/lib/mood";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { staggerContainer, slideUp } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * Mood → atmosphere mapping. When a mood is selected, the CSS variables
 * shift to change the room's lighting.
 */
const MOOD_ATMOSPHERE: Record<string, { scale: number; meshBright: number; auroraBright: number }> = {
  inspired: { scale: 1.04, meshBright: 1.12, auroraBright: 1.15 },
  reflective: { scale: 0.98, meshBright: 0.88, auroraBright: 0.9 },
  peaceful: { scale: 1.02, meshBright: 0.82, auroraBright: 0.85 },
  lost: { scale: 0.96, meshBright: 0.78, auroraBright: 0.8 },
  hopeful: { scale: 1.03, meshBright: 1.05, auroraBright: 1.1 },
  curious: { scale: 1.01, meshBright: 1.0, auroraBright: 1.05 },
  motivated: { scale: 1.02, meshBright: 1.08, auroraBright: 1.12 },
  calm: { scale: 1.0, meshBright: 0.85, auroraBright: 0.88 },
  nostalgic: { scale: 0.99, meshBright: 0.92, auroraBright: 0.95 },
  overwhelmed: { scale: 0.97, meshBright: 0.9, auroraBright: 0.92 },
};

/**
 * Emotional discovery — "Meet yourself somewhere here."
 *
 * One of WithIn's most important concepts. The mood chips should feel
 * like physical objects — clay-like depth, inner light, atmospheric
 * response. When selected, the entire room's lighting shifts.
 */
export default function EmotionalDiscovery() {
  const { moodId } = useEnvironment();
  const prefersReducedMotion = useReducedMotionSafe();

  const toggleMood = (id: string) => applyMood(moodId === id ? null : id);
  const selected = moods.find((mood) => mood.id === moodId);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const root = document.documentElement;

    if (!moodId) {
      root.style.setProperty("--atmos-mesh", "1");
      root.style.setProperty("--atmos-aurora", "1");
      root.classList.remove("mood-active");
      return;
    }

    const atmo = MOOD_ATMOSPHERE[moodId];
    if (!atmo) return;

    root.style.setProperty("--mood-atmo-scale", `${atmo.scale}`);
    root.style.setProperty("--atmos-mesh", `${atmo.meshBright}`);
    root.style.setProperty("--atmos-aurora", `${atmo.auroraBright}`);
    root.classList.add("mood-active");

    return () => {
      root.style.setProperty("--atmos-mesh", "1");
      root.style.setProperty("--atmos-aurora", "1");
      root.classList.remove("mood-active");
    };
  }, [moodId, prefersReducedMotion]);

  return (
    <section id="feel" className="section-ambient relative scroll-mt-24 py-28 text-white">
      {/* Ambient glow — responds to mood */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(var(--mood-rgb),0.02),transparent_52%)] transition-all duration-[1200ms]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <Container className="relative z-10">
        {/* Header — editorial, centered */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/45">
            Meet yourself somewhere here
          </p>
          <h2 className="mt-5 font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] md:text-5xl">
            How are you feeling Within?
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-gray-400/65 md:text-base">
            Touch a mood — the whole world answers. Light, atmosphere
            and suggestions all tune to how you feel right now.
          </p>
        </div>

        {/* Mood chips — tactile, physical-feeling surfaces */}
        <motion.div
          variants={staggerContainer(0.04, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {moods.map((mood) => {
            const active = moodId === mood.id;
            return (
              <motion.button
                key={mood.id}
                type="button"
                variants={slideUp}
                onClick={(e) => { toggleMood(mood.id); fireRipple(e); }}
                aria-pressed={active}
                aria-label={`Set mood to ${mood.label}`}
                className={`group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl border px-4 py-6 text-center transition-all duration-500 active:scale-[0.95] ${
                  active
                    ? "border-[rgba(var(--mood-rgb),0.35)] bg-[rgba(var(--mood-rgb),0.07)] shadow-[0_0_30px_rgba(var(--mood-rgb),0.12),inset_0_1px_0_rgba(255,255,255,0.07)]"
                    : "border-white/[0.04] bg-white/[0.012] hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.03] hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                }`}
              >
                {/* Inner light — the mood's own bloom */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle, rgba(var(--mood-rgb),0.22), transparent 70%)`,
                    opacity: active ? 0.65 : 0.12
                  }}
                />
                {/* Clay-like depth highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                />
                <motion.span
                  aria-hidden
                  animate={
                    active && !prefersReducedMotion
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 3, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                  className="relative text-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                >
                  {mood.emoji}
                </motion.span>
                <span
                  className={`relative text-[13px] font-medium transition-colors duration-300 ${
                    active ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                  }`}
                >
                  {mood.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Confirmation — the room answers */}
        <div aria-live="polite" className="mt-10 min-h-[3rem] text-center">
          {selected ? (
            <motion.p
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-md text-sm text-gray-300/75"
            >
              The room is tuned to <span className="font-semibold text-white">{selected.label.toLowerCase()}</span>{" "}
              {selected.emoji} — <span className="text-gray-500/70">{selected.line}</span>
            </motion.p>
          ) : (
            <p className="text-sm text-gray-500/50">
              Your mood shapes the light everywhere in WithIn.
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button href="/discover" variant="ghost" size="md">
            See what matches this feeling
          </Button>
        </div>
      </Container>
    </section>
  );
}
