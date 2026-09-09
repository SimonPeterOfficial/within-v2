"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { resumeThread, type ThreadResume } from "@/lib/universe/thread-engine";
import { getAuriPreferences } from "@/lib/auri";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * AuriGuide — Gen 12's Auri as the guide to exploration.
 *
 * Not omniscient, not invasive: she offers ONE small, real, contextual
 * navigation whisper at a time, drawn from the actual thread state:
 *
 *   "You might enjoy following this thread."
 *   "There is another path from here."
 *   "Want to see where this came from?"
 *
 * Rules she keeps:
 *   - the user controls whether she participates (Auri suggestions pref)
 *   - one whisper per session per route, dismissible, never auto-navigating
 *   - she only speaks when she has something true to say — silence otherwise
 *   - she never covers the UI: a small crystal presence, bottom-left on
 *     desktop, above the dock on mobile
 */

type Whisper = {
  line: string;
  destination: string | null;
  cta: string;
};

function buildWhisper(resume: ThreadResume): Whisper | null {
  const { thread, next } = resume;

  // A thread with real forks: invite the next step.
  if (next.length > 0) {
    return {
      line: `There is another path from here — "${next[0].label}".`,
      destination: null,
      cta: "Follow it",
    };
  }

  // A thread that has just begun: invite the origin.
  if (thread.steps.length === 1) {
    return {
      line: `Your thread "${thread.name}" has just begun. Want to see where it came from?`,
      destination: thread.origin.destination,
      cta: "See where it began",
    };
  }

  // A long thread: invite the return.
  if (thread.steps.length >= 4) {
    return {
      line: `You've walked ${thread.steps.length} steps together. The way back is always open.`,
      destination: thread.origin.destination,
      cta: "Return to the start",
    };
  }

  return null;
}

export default function AuriGuide() {
  const prefersReducedMotion = useReducedMotionSafe();
  const pathname = usePathname();
  const [whisper, setWhisper] = useState<Whisper | null>(null);
  const [dismissedForRoute, setDismissedForRoute] = useState<string | null>(null);

  useEffect(() => {
    // The user controls whether Auri participates.
    if (!getAuriPreferences().suggestions) return;
    if (dismissedForRoute === pathname) return;

    // Quiet routes — never whisper on private or focused spaces.
    if (
      pathname.startsWith("/sanctuary") ||
      pathname.startsWith("/mirror") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/conversations") ||
      pathname.startsWith("/studio")
    ) {
      return;
    }

    const resume = resumeThread();
    if (!resume) return;
    // Defer outside the effect body — async read of the external store.
    const frame = requestAnimationFrame(() => {
      setWhisper(buildWhisper(resume));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, dismissedForRoute]);

  const dismiss = () => {
    setWhisper(null);
    setDismissedForRoute(pathname);
  };

  if (!whisper) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="crystal-elevated crystal-edge depth-medium fixed bottom-24 left-4 z-40 flex max-w-[300px] items-start gap-3 rounded-3xl p-4 lg:bottom-6 lg:left-[4.75rem]"
        role="status"
        aria-live="polite"
        aria-label="Auri's guidance"
      >
        <span className="mt-0.5 shrink-0">
          <AuriOwl size={30} state="greeting" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] leading-relaxed text-[#44435e]">{whisper.line}</p>
          <div className="mt-2 flex items-center gap-3">
            {whisper.destination ? (
              <Link
                href={whisper.destination}
                onClick={() => setWhisper(null)}
                className="crystal-focus rounded-full bg-white/60 px-3 py-1.5 text-[11.5px] font-semibold text-[#232136] ring-1 ring-white/80 transition hover:bg-white/85"
              >
                {whisper.cta}
              </Link>
            ) : (
              <Link
                href="/atlas"
                onClick={() => setWhisper(null)}
                className="crystal-focus rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-white transition-transform hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
                  boxShadow: "0 3px 10px rgba(var(--mood-rgb),0.3)",
                }}
              >
                {whisper.cta}
              </Link>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="crystal-focus text-[10.5px] text-[#8b8aa0] transition hover:text-[#44435e]"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
