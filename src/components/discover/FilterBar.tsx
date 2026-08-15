"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { UNIVERSE_FILTERS, type UniverseFilter } from "@/lib/search";

type FilterBarProps = {
  active: UniverseFilter;
  onChange: (filter: UniverseFilter) => void;
  /** Per-filter counts — shown as quiet hints on desktop */
  counts?: Partial<Record<UniverseFilter, number>>;
  className?: string;
};

/**
 * The discovery segmented control — one row of shelves with an animated
 * active pill. Horizontal scroll on mobile (no wrapping), so long filter
 * lists stay usable on small screens.
 */
export default function FilterBar({ active, onChange, counts, className = "" }: FilterBarProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <div
      role="tablist"
      aria-label="Filter the universe"
      className={clsx(
        "-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {UNIVERSE_FILTERS.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={clsx(
              "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)]",
              isActive ? "text-white" : "text-gray-400 hover:text-white"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
                aria-hidden
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full border border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.16)] shadow-[0_0_16px_rgba(var(--mood-rgb),0.2)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {filter}
              {counts?.[filter] !== undefined && (
                <span className={clsx("text-[10px]", isActive ? "text-white/70" : "text-gray-600")}>
                  {counts[filter]}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
