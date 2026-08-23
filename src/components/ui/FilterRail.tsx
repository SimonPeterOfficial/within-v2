"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

export type FilterOption = {
  id: string;
  label: string;
  icon?: string;
};

type FilterRailProps = {
  options: FilterOption[];
  active: string[];
  onChange: (active: string[]) => void;
  className?: string;
};

/**
 * FilterRail — the WithIn filter language.
 *
 * Light, fast, obvious, reversible. Chips use the glass system with subtle
 * mood illumination when active. Horizontally scrollable on mobile with
 * edge fading. "Clear all" appears when multiple filters are active.
 */
export default function FilterRail({ options, active, onChange, className = "" }: FilterRailProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  const toggle = (id: string) => {
    if (id === "all") {
      onChange([]);
      return;
    }
    if (active.includes(id)) {
      onChange(active.filter((f) => f !== id));
    } else {
      onChange([...active, id]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className={`relative ${className}`}>
      {/* Scrollable chip rail */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* All chip */}
        <FilterChip
          label="All"
          active={active.length === 0}
          onClick={() => toggle("all")}
          prefersReducedMotion={prefersReducedMotion}
        />

        {options.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            icon={option.icon}
            active={active.includes(option.id)}
            onClick={() => toggle(option.id)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}

        {/* Clear all — appears when filters are active */}
        {active.length > 0 && (
          <motion.button
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            type="button"
            onClick={clearAll}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium text-rose-400/70 transition-colors hover:text-rose-300"
          >
            <span aria-hidden>×</span>
            Clear
          </motion.button>
        )}
      </div>

      {/* Edge fade — signals more content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#02030a] to-transparent lg:hidden"
      />
    </div>
  );
}

/* ── Individual chip ────────────────────────────────────────────────── */

function FilterChip({
  label,
  icon,
  active,
  onClick,
  prefersReducedMotion,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      className={`group relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-medium transition-all duration-300 ${
        active
          ? "border-[rgba(var(--mood-rgb),0.2)] bg-[rgba(var(--mood-rgb),0.08)] text-white/90 shadow-[0_0_16px_rgba(var(--mood-rgb),0.12)]"
          : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-gray-300"
      }`}
      aria-pressed={active}
    >
      {/* Active illumination dot */}
      {active && (
        <motion.span
          layoutId={prefersReducedMotion ? undefined : "filter-indicator"}
          className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mood-rgb),0.8)]"
          style={{ boxShadow: "0 0 6px rgba(var(--mood-rgb), 0.5)" }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
        />
      )}
      {icon && <span className="text-[11px]">{icon}</span>}
      {label}
    </motion.button>
  );
}
