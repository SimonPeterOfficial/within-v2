"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import CoverArt, { type CoverArtProps } from "@/components/ui/cards/CoverArt";

/**
 * FeaturedEditorialCard — the large, distinctive featured content card.
 *
 * Unlike the standard card, this is an editorial composition:
 *   - A large expressive cover (image or gradient fallback)
 *   * A strong typographic headline (Fraunces display face)
 *   * Supporting description + metadata
 *   * Optional category label
 *   * Content overlay on the lower portion for immersion
 *   * Deliberate focal point — not just "a bigger card"
 *
 * States: default, hover (cover lifts slightly, overlay brightens),
 * focus-visible (premium ring), pressed (subtle scale).
 */
type FeaturedEditorialCardProps = {
  title: string;
  description?: string;
  category?: string;
  creator?: string;
  cover: CoverArtProps;
  href: string;
  /** Stagger delay for the reveal */
  delay?: number;
  className?: string;
};

export default function FeaturedEditorialCard({
  title,
  description,
  category,
  creator,
  cover,
  href,
  delay = 0,
  className = "",
}: FeaturedEditorialCardProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-[2rem] outline-none focus-visible:ring-3 focus-visible:ring-[rgba(var(--mood-rgb),0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-300"
        aria-label={title}
      >
        {/* Cover — full height on mobile, two-thirds on desktop */}
        <div className="relative h-64 md:h-[420px] lg:h-[480px]">
          <CoverArt
            src={cover.src}
            alt={cover.alt}
            gradient={cover.gradient}
            emoji={cover.emoji}
            tag={category}
            glow={cover.glow}
            className="h-full w-full object-cover"
          />
          {/* Content overlay — pinned to the bottom, glass surface */}
          <div
            className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[var(--background)] via-[var(--background)/80] to-transparent"
          />
        </div>

        {/* Editorial content */}
        <div className="p-6 md:p-8">
          {category && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(var(--mood-rgb),0.75)] mb-2">
              {category}
            </p>
          )}
          <h2
            className={[
              "font-display font-medium tracking-[-0.02em] text-white",
              "text-2xl md:text-3xl leading-[1.1]",
            ].join(" ")}
          >
            {title}
          </h2>
          {creator && (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-[rgba(var(--mood-rgb),0.6)]">
              {creator}
            </p>
          )}
          {description && (
            <p className={[
              "mt-3 leading-relaxed text-gray-300/90",
              "text-sm md:text-base line-clamp-3",
            ].join(" ")}>
              {description}
            </p>
          )}

          {/* Enter indicator */}
          <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-emerald-400 opacity-70 transition group-hover:opacity-100 group-hover:text-emerald-300">
            Enter
            <motion.span
              aria-hidden
              animate={
                prefersReducedMotion
                  ? undefined
                  : { x: [0, 6, 0], opacity: [0.6, 1, 0.6] }
              }
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
