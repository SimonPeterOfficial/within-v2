"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { getThread, type ThreadConnection } from "@/lib/explore/thread";
import { addToJourney, type DiscoveryType } from "@/lib/explore";
import { fireRipple } from "@/lib/ripple";
import Icon from "@/components/ui/Icon";
import GlassCard from "@/components/ui/GlassCard";
import { blurUp, staggerContainer } from "@/lib/animations";

type ThreadLinksProps = {
  /** The content type to find threads for */
  itemType: DiscoveryType;
  /** The content ID to find threads for */
  itemId: string;
  /** Optional title override */
  title?: string;
  /** Max connections to show */
  maxItems?: number;
  className?: string;
};

/**
 * ThreadLinks — the connective tissue of WithIn.
 *
 * Shows related content connections for any item. Appears at the bottom
 * of content pages, inside discovery cards, and as "Another Door" prompts.
 *
 * Each link fires a MemoryRipple and adds to the journey.
 */
export default function ThreadLinks({
  itemType,
  itemId,
  title = "Follow the thread",
  maxItems = 4,
  className = "",
}: ThreadLinksProps) {
  const connections = getThread(itemType, itemId).slice(0, maxItems);

  if (connections.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer(0.06, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {/* Header */}
      <motion.div variants={blurUp} className="mb-4 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/45">
          {title}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/10 to-transparent" />
      </motion.div>

      {/* Connections */}
      <div className="space-y-2">
        {connections.map((conn) => (
          <ThreadLink key={conn.id} connection={conn} />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Single thread link ───────────────────────────────────────────────── */

function ThreadLink({ connection }: { connection: ThreadConnection }) {
  const handleClick = (e: React.MouseEvent) => {
    fireRipple(e);
    addToJourney({
      id: connection.id,
      title: connection.label,
      type: connection.type,
      destination: connection.destination,
      reason: connection.reason,
      parentId: null,
      cover: connection.cover,
    });
  };

  return (
    <motion.a
      variants={blurUp}
      href={connection.destination}
      onClick={handleClick}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      {/* Cover */}
      {connection.cover && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${connection.cover.gradient} text-lg`}
        >
          {connection.cover.emoji}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white/85 group-hover:text-white truncate">
          {connection.label}
        </p>
        <p className="text-[11px] text-gray-500/50 truncate">
          {connection.reason}
        </p>
      </div>

      {/* Arrow */}
      <Icon
        name="forward"
        size={12}
        className="shrink-0 text-gray-600 group-hover:text-emerald-400/60 transition-colors"
      />
    </motion.a>
  );
}

/* ── Inline thread prompt (for "Another Door" moments) ────────────────── */

type AnotherDoorProps = {
  connection: ThreadConnection;
  onAccept: () => void;
  className?: string;
};

/**
 * AnotherDoor — the subtle "there's more" interaction.
 * Appears after exploration, offers a single unexpected connection.
 */
export function AnotherDoor({ connection, onAccept, className = "" }: AnotherDoorProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <GlassCard tone="soft" className="p-4">
        <div className="flex items-center gap-3">
          {/* Subtle glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[rgba(var(--mood-rgb),0.15)] blur-xl" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
              <span className="text-lg">🚪</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/70">Another door</p>
            <p className="text-[11px] text-gray-500/50 truncate">
              {connection.reason}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              fireRipple(e);
              onAccept();
            }}
            className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-gray-400 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
          >
            Go →
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
