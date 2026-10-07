"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon from "@/components/ui/Icon";

/**
 * WithInStates — loading, empty, and error states that belong to the world.
 *
 * These states are not generic framework defaults. They are part of the
 * WithIn visual language — quiet, environmental, honest.
 *
 * Loading: quiet skeletons with soft shimmer
 * Empty: what this place is, why it's empty, what the user can do
 * Error: something went wrong, what they can do, whether retry is possible
 */

// ── Loading State ────────────────────────────────────────────────────

export function WithInLoading({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <div className={`crystal-elevated crystal-edge depth-low rounded-3xl p-6 ${className}`} role="status" aria-label={label}>
      <div className="flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-full bg-white/50 ${prefersReducedMotion ? "" : "animate-pulse"}`}
          style={{
            background: "linear-gradient(135deg, rgba(139,122,236,0.15), rgba(91,75,196,0.1))",
          }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded-full bg-white/40" />
          <div className="h-2.5 w-1/2 rounded-full bg-white/30" />
        </div>
      </div>
      <p className="mt-4 text-[12px] text-[#8b8aa0]">{label}…</p>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────

export function WithInEmpty({
  icon = "sparkles",
  title,
  description,
  action,
  className = "",
}: {
  icon?: "sparkles" | "book" | "music" | "camera" | "users" | "heart" | "eye" | "clock" | "star" | "globe";
  title: string;
  description: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`crystal-elevated crystal-edge depth-low rounded-3xl p-8 text-center ${className}`}
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(139,122,236,0.12), rgba(91,75,196,0.08))",
        }}
      >
        <Icon name={icon} size={22} className="text-[#8b7ce6]" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-display text-[18px] font-medium text-[#2c2a48]">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#8b8aa0]">{description}</p>
      {action && (
        <a
          href={action.href}
          className="crystal-focus mt-5 inline-flex items-center gap-2 rounded-full bg-white/55 px-5 py-2.5 text-[13px] font-semibold text-[#232136] ring-1 ring-white/70 transition hover:bg-white/80"
        >
          {action.label}
          <Icon name="forward" size={12} />
        </a>
      )}
    </motion.div>
  );
}

// ── Error State ─────────────────────────────────────────────────────

export function WithInError({
  title = "Something went wrong",
  description = "The world is having a quiet moment. Please try again.",
  onRetry,
  className = "",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`crystal-elevated crystal-edge depth-low rounded-3xl p-8 text-center ${className}`}
      role="alert"
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(244,63,94,0.1), rgba(225,29,72,0.06))",
        }}
      >
        <Icon name="close" size={22} className="text-rose-400" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-display text-[18px] font-medium text-[#2c2a48]">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#8b8aa0]">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="crystal-focus mt-5 inline-flex items-center gap-2 rounded-full bg-white/55 px-5 py-2.5 text-[13px] font-semibold text-[#232136] ring-1 ring-white/70 transition hover:bg-white/80"
        >
          Try again
          <Icon name="forward" size={12} />
        </button>
      )}
    </motion.div>
  );
}
