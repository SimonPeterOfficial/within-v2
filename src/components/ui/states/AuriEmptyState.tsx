"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type AuriEmptyStateProps = {
  /** Auri's short line — keep it warm, never clinical */
  message: string;
  /** Small supporting line */
  detail?: string;
  /** The CTA (e.g. a "Find something" button) */
  action?: React.ReactNode;
  className?: string;
};

/**
 * The Auri moment for empty spaces — a small owl, one warm line, and a way
 * forward. Used where a blank list would otherwise feel like a dead end
 * (search with no results, an empty library shelf). Auri appears here
 * because emptiness is exactly when a presence matters — never everywhere.
 */
export default function AuriEmptyState({ message, detail, action, className = "" }: AuriEmptyStateProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <GlassCard tone="clay" className={`mx-auto w-full max-w-md px-8 py-12 text-center ${className}`}>
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto w-fit"
      >
        <AuriOwl size={72} particles={false} state="observing" />
      </motion.div>
      <p className="mt-5 text-sm leading-relaxed text-gray-200">{message}</p>
      {detail && <p className="mt-2 text-xs leading-relaxed text-gray-500">{detail}</p>}
      {action && <div className="mt-6">{action}</div>}
    </GlassCard>
  );
}
