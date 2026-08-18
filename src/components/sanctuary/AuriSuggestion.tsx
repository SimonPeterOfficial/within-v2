"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { recommendFor, recommendationReason } from "@/lib/recommendations";
import { getAuriPreferences } from "@/lib/auri";
import { useEnvironment } from "@/lib/environment";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * "Auri found something you might like" — a discovery moment, honest about
 * what it knows. The pick is ranked deterministically by the live mood +
 * time of day (lib/recommendations.ts); Auri shares the reason the engine
 * actually used. No fabricated intelligence — just the recommender, voiced.
 */
export default function AuriSuggestion() {
  const { period, moodId } = useEnvironment();
  const prefersReducedMotion = useReducedMotionSafe();
  const [enabled, setEnabled] = useState(true);

  // The "Discovery moments" preference (Settings → Auri) governs whether Auri
  // sets anything out at all — resolved after mount, hydration-safe.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEnabled(getAuriPreferences().suggestions);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const pick = useMemo(() => {
    const deck = recommendFor(moodId, period);
    // Skip story picks here — discovery moments feel sharper pointing at a
    // playable/readable shelf (film, album, book, series).
    return deck.find((item) => item.kind !== "story") ?? deck[0];
  }, [moodId, period]);

  // Pick hrefs are home anchors by default — remap to real universe routes so
  // the moment works on standalone pages (discover, originals, profile).
  const href = useMemo(() => {
    const anchorToRoute: Record<string, string> = {
      "#originals": "/originals",
      "#music": "/music",
      "#books": "/books",
      "#memories": "/home#memories"
    };
    if (!pick) return "/discover";
    return anchorToRoute[pick.href] ?? pick.href;
  }, [pick]);

  if (!enabled || !pick) return null;
  const reason = recommendationReason(moodId, period);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard tone="clay" className="relative overflow-hidden p-7">
        {/* Soft mood light behind the moment */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(var(--mood-rgb),0.14)] blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <AuriOwl size={64} particles={false} state="curious" />
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Auri found something
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">{pick.title}</h3>
            <p className="mt-1 text-sm text-gray-400">
              {pick.description} <span className="text-gray-500">· {pick.meta}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Because you&apos;re feeling {reason}.
            </p>
          </div>

          <Button href={href} variant="primary" size="md" className="shrink-0">
            Open it
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
