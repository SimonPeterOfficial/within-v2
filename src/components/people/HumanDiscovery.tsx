"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon from "@/components/ui/Icon";
import {
  discoveryCandidates,
  constellationStats,
} from "@/lib/universe/constellation-engine";
import { getUniverseState } from "@/lib/universe/state";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * HumanDiscovery — Gen 13's contextual people discovery.
 *
 * Answers "who is here with me?" honestly: candidates come only from the
 * visitor's own on-device exploration signals matched against public
 * node interests. Every row shows its common ground, every recommendation
 * is explained, and when there are no signals yet the panel says so and
 * points somewhere real instead of pretending.
 */

export default function HumanDiscovery() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [state, setState] = useState<{
    candidates: ReturnType<typeof discoveryCandidates>;
    hasSignals: boolean;
  } | null>(null);

  useEffect(() => {
    // Defer the localStorage read outside the effect body.
    const frame = requestAnimationFrame(() => {
      const universeState = getUniverseState();
      setState({
        candidates: discoveryCandidates(universeState.recentContentTypes, 4),
        hasSignals: universeState.recentContentTypes.length > 0,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const stats = constellationStats();

  if (!state) {
    return (
      <CrystalSurface level="soft" depth="low" className="min-h-[120px] p-6" aria-busy="true">
        <div className="h-3 w-28 animate-pulse rounded-full bg-white/70" />
        <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-white/50" />
      </CrystalSurface>
    );
  }

  const { candidates, hasSignals } = state;

  return (
    <CrystalSurface level="soft" depth="medium" sheen className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            The people here
          </p>
          <p className="mt-1 font-display text-lg font-medium text-[#232136]">
            {candidates.length > 0 ? "Near where you've been" : "Who lives in this sky"}
          </p>
        </div>
        <span className="text-[11px] text-[#8b8aa0]">
          {stats.creators} creators · {stats.communities} rooms
        </span>
      </div>

      {candidates.length === 0 ? (
        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-[#6f6e88]">
            {hasSignals
              ? "Nothing in the sky matches your recent path yet — wander a little further and the constellation will answer."
              : "Explore a film, a book, a song — and this panel will start introducing you to the people and rooms gathered around those things."}
          </p>
          <Link
            href="/explore"
            className="crystal-focus mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-4 py-2 text-[12.5px] font-semibold text-[#232136] ring-1 ring-white/80 transition hover:bg-white/90"
          >
            Start exploring
            <Icon name="forward" size={12} />
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {candidates.map(({ node, reason, commonGround }, index) => (
              <motion.li
                key={node.id}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={node.href}
                  className="group flex items-center gap-3 rounded-2xl bg-white/45 px-3.5 py-3 ring-1 ring-white/60 transition hover:bg-white/70"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-lg ring-1 ring-white">
                    <span aria-hidden>{node.emoji}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-[#232136]">
                      {node.title}
                      <span className="ml-1.5 text-[9.5px] font-medium uppercase tracking-[0.2em] text-[#8b8aa0]">
                        {node.kind}
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-[#6f6e88]">{reason}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#8b8aa0]">
                      Common ground: {commonGround.join(", ")}
                    </span>
                  </span>
                  <Icon
                    name="forward"
                    size={12}
                    className="ml-auto shrink-0 text-[#c0bfd4] transition group-hover:translate-x-0.5 group-hover:text-[#7c6ce0]"
                  />
                </Link>
              </motion.li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] leading-relaxed text-[#8b8aa0]">
            Drawn from what you explored on this device — never inferred, never sent anywhere.
          </p>
        </>
      )}
    </CrystalSurface>
  );
}
