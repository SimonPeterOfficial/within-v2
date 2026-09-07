"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type AwaySummary = {
  hasSummary: boolean;
  unreadNotifications: number;
  draftsWaiting: { id: string; title: string }[];
  newFromFollowing: { id: string; title: string; creatorName: string | null }[];
  moderationUpdates: { id: string; title: string; status: string }[];
  newViews: number;
  lines: string[];
};

type Payload = { ok: boolean; summary?: AwaySummary };

/**
 * WhileYouWereAway — the continuity moment on Home.
 *
 * Appears only when something real happened since the user's last
 * activity: drafts waiting, review outcomes, new work from followed
 * creators, real views. Everything links somewhere true — no dead ends,
 * no invented events. Renders nothing otherwise.
 */
export default function WhileYouWereAway() {
  const { status } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const [summary, setSummary] = useState<AwaySummary | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    // Deferred so the world renders first — intelligence never blocks Home.
    const frame = requestAnimationFrame(() => {
      void fetch("/api/away", { cache: "no-store" })
        .then((res) => res.json() as Promise<Payload>)
        .then((data) => {
          if (!cancelled && data.ok && data.summary?.hasSummary) setSummary(data.summary);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [status]);

  if (!summary || dismissed) return null;

  const draftCount = summary.draftsWaiting.length;
  const draftLine =
    draftCount === 1
      ? summary.draftsWaiting[0].title || "Your draft"
      : `${draftCount} drafts`;

  return (
    <AnimatePresence>
      <motion.section
        aria-label="While you were away"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-6 py-4"
      >
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
              While you were away
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="text-gray-500 transition hover:text-white"
            >
              <Icon name="close" size={14} />
            </button>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            {summary.lines.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-emerald-300">·</span>
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {draftCount > 0 && (
              <Button href="/studio" variant="outline" size="sm">
                Continue {draftLine}
              </Button>
            )}
            {summary.newFromFollowing.length > 0 && (
              <Button href={`/content/${summary.newFromFollowing[0].id}`} variant="ghost" size="sm">
                See what&apos;s new
              </Button>
            )}
            {summary.unreadNotifications > 0 && (
              <Button href="/home" variant="ghost" size="sm">
                Notifications
              </Button>
            )}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
