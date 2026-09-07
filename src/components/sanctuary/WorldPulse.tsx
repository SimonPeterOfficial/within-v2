"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { observeTime } from "@/lib/lyra";

type WorldPulse = {
  weather: string;
  line: string;
  moment: { kind: string; title: string; href: string } | null;
};

type Payload = { ok: boolean; pulse?: WorldPulse };

/**
 * WorldPulse — the world breathing, in one line.
 *
 * A quiet whisper on Home derived from REAL platform activity ("a few new
 * things are waiting", "the world is quiet tonight") — never moods, never
 * fake events. Includes today's one world moment only when one truly
 * exists. Renders nothing while loading or if the world is unreachable:
 * silence is a legitimate state.
 */
export default function WorldPulse() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [pulse, setPulse] = useState<WorldPulse | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Deferred a frame — the world never blocks Home from rendering.
    const frame = requestAnimationFrame(() => {
      void fetch("/api/world", { cache: "no-store" })
        .then((res) => res.json() as Promise<Payload>)
        .then((data) => {
          if (!cancelled && data.ok && data.pulse) setPulse(data.pulse);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!pulse) return null;

  const period = observeTime().period;
  const hourWord =
    period === "night" ? "tonight" : period === "morning" ? "this morning" : period === "evening" ? "this evening" : "today";

  return (
    <AnimatePresence>
      <motion.p
        aria-label="World pulse"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center text-[13px] italic text-gray-500"
      >
        {pulse.line.replace("tonight", hourWord)}
        {pulse.moment && (
          <>
            {" · "}
            <a
              href={pulse.moment.href}
              className="underline-offset-2 transition hover:text-gray-300 hover:underline"
            >
              {pulse.moment.title}
            </a>
          </>
        )}
      </motion.p>
    </AnimatePresence>
  );
}
