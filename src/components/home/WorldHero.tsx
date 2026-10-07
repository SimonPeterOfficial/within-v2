"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WorldHero — the cinematic page hero for secondary worlds.
 *
 * A spatial composition that introduces each world with editorial
 * typography, environmental integration, and a sense of entering
 * a new place. The hero is not a card — it's a window into the world.
 *
 * Composition:
 *   - Full-bleed environmental scene (world-specific gradients)
 *   - Editorial eyebrow + title + subtitle
 *   - The world's personality class shifts the atmosphere
 *   - Optional action buttons
 *   - The world extends beyond the viewport
 */
export default function WorldHero({
  eyebrow,
  title,
  subtitle,
  worldClass = "",
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  worldClass?: string;
  children?: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <section aria-label={title} className={`relative z-10 ${worldClass}`}>
      <div className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[28px]">
        {/* The world's atmospheric scene */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, var(--world-primary, rgba(168, 150, 250, 0.12)) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, var(--world-secondary, rgba(100, 180, 220, 0.08)) 0%, transparent 60%)",
          }}
        />

        {/* Content — editorial greeting */}
        <div className="relative flex min-h-[280px] flex-col justify-center px-7 py-10 md:min-h-[320px] md:px-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(var(--mood-rgb),0.75)]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-world-title mt-2"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-world-subtitle mt-2 max-w-lg text-[#44415f]"
          >
            {subtitle}
          </motion.p>

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
