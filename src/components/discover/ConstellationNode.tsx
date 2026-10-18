"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon from "@/components/ui/Icon";

/**
 * ConstellationNode — a single discoverable item in the Constellation view.
 *
 * Not a card in a grid. A node in a connected composition: it sits at a
 * deliberate position, glows when it's the current focus, and reveals its
 * connections when opened. The whole node is a link to the content itself;
 * an inner "reveal" button opens the connection layer instead.
 *
 * States: resting → hovered → opened → active (current path).
 * Motion: scale + glow + subtle float, all reduced-motion safe.
 */
type ConstellationNodeProps = {
  entry: {
    id: string;
    title: string;
    category: string;
    by: string;
    description: string;
    gradient: string;
    emoji: string;
    href: string;
    tags: string[];
    moods: string[];
  };
  /** Position within the constellation (deterministic, not random) */
  x: number;
  y: number;
  /** Size tier — "hero" nodes are larger and more luminous */
  tier: "hero" | "standard" | "quiet";
  /** Whether this node is on the user's current path */
  onPath: boolean;
  /** Whether this node's connections are revealed */
  opened: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onSelect: (href: string) => void;
};

const TIER_SIZE: Record<ConstellationNodeProps["tier"], { w: number; h: number; glow: string }> = {
  hero: { w: 220, h: 260, glow: "0 0 40px rgba(var(--mood-rgb), 0.35)" },
  standard: { w: 160, h: 190, glow: "0 0 24px rgba(var(--mood-rgb), 0.2)" },
  quiet: { w: 120, h: 140, glow: "0 0 12px rgba(var(--mood-rgb), 0.12)" },
};

export default function ConstellationNode({
  entry,
  x,
  y,
  tier,
  onPath,
  opened,
  onOpen,
  onClose,
  onSelect,
}: ConstellationNodeProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const size = TIER_SIZE[tier];

  return (
    <motion.div
      // Deterministic position — no Math.random, no layout shift.
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ y: prefersReducedMotion ? 0 : [0, -3, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{
        y: prefersReducedMotion ? 0 : -6,
        boxShadow: onPath ? "0 0 48px rgba(var(--mood-rgb), 0.5)" : undefined,
        transition: { type: "spring", stiffness: 300, damping: 24 },
      }}
      whileTap={{ scale: 0.97 }}
      className={`
        absolute group
        w-${Math.round(size.w / 4)} h-${Math.round(size.h / 4)}
        rounded-[1.5rem]
        overflow-hidden
        ${onPath ? "ring-2 ring-[rgba(var(--mood-rgb),0.6)]" : "border border-white/[0.08]"}
        transition-all duration-300
        ${opened ? "z-20 ring-1 ring-[rgba(var(--mood-rgb),0.5)] bg-white/[0.06]" : ""}
      `}
    >
      {/* The connection glow — soft light behind the node */}
      <motion.div
        aria-hidden
        className="absolute -inset-1 rounded-[2rem] blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: `radial-gradient(circle, rgba(var(--mood-rgb), 0.25), transparent 70%)`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />

      {/* The cover — gradient or image */}
      <div className="relative h-[55%] overflow-hidden">
        <div
          className="absolute inset-0 bg-linear-to-br"
          style={{ background: entry.gradient }}
        />
        <span
          aria-hidden
          className="absolute right-4 bottom-4 text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
        >
          {entry.emoji}
        </span>
      </div>

      {/* The content — revealed on the lower half */}
      <div className="h-[45%] p-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(var(--mood-rgb),0.7)] mb-1">
            {entry.category}
          </p>
          <h3
            className={[
              "font-display font-medium tracking-[-0.01em] leading-tight text-white",
              tier === "hero" ? "text-lg md:text-xl" : "text-sm md:text-base",
              "drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
            ].join(" ")}
            title={entry.title}
          >
            {entry.title}
          </h3>
          <p className="mt-1 text-[10px] text-[rgba(var(--mood-rgb),0.5)] truncate">
            {entry.by}
          </p>
        </div>

        {/* Interaction — open content OR reveal connections */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <Link
            href={entry.href}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(entry.href);
            }}
            aria-label={`Open ${entry.title}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.15] border border-white/[0.25] text-[10px] text-white ring-1 ring-white/[0.3] backdrop-blur transition hover:bg-white/[0.25] hover:ring-white/[0.5] focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)]"
          >
            <Icon name="forward" size={11} className="text-white" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (opened) {
                onClose();
              } else {
                onOpen(entry.id);
              }
            }}
            aria-label={opened ? "Close connections" : "Show connections"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.1] border border-white/[0.15] text-[10px] text-white/70 transition hover:bg-white/[0.2] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)]"
          >
            {opened ? (
              <Icon name="close" size={10} className="text-white" />
            ) : (
              <Icon name="plus" size={10} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
