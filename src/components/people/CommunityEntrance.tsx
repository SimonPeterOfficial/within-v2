"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon from "@/components/ui/Icon";
import { focusConstellationNode } from "@/lib/universe/constellation-engine";
import type { CommunityItem } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * CommunityEntrance — Gen 13's entrance experience for a community.
 *
 * An entrance, not a profile card: it answers WHAT THIS ROOM IS, WHO IT'S
 * FOR, WHAT GATHERS AROUND IT (real works from the constellation graph),
 * and offers the honest action set. Privacy kept: no member lists, no
 * private anything — just the room's public face.
 */

export default function CommunityEntrance({ community }: { community: CommunityItem }) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [entered, setEntered] = useState(false);

  // What genuinely gathers around this community — from the real graph.
  const gathered = useMemo(() => {
    const focus = focusConstellationNode(`community:${community.id}`);
    return focus?.relationships.filter((r) => r.other.kind === "work") ?? [];
  }, [community.id]);

  return (
    <motion.article
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <CrystalSurface level="soft" depth="medium" sheen className="overflow-hidden">
        {/* The threshold — the room's own light */}
        <div className="relative h-28 overflow-hidden">
          <div
            aria-hidden
            className={`absolute inset-0 bg-linear-to-br ${community.gradient} opacity-80`}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.75) 100%)",
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-3 left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 text-2xl ring-1 ring-white"
            style={{ boxShadow: "0 4px 14px rgba(35,33,54,0.18)" }}
          >
            {community.avatars[0] ?? "🤝"}
          </span>
        </div>

        <div className="p-6 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            {community.category} · {community.members.toLocaleString()} members
          </p>
          <h3 className="mt-1.5 font-display text-xl font-medium text-[#232136]">
            {community.name}
          </h3>
          <p className="mt-0.5 text-[13px] italic text-[#6f6e88]">{community.tagline}</p>

          {entered ? (
            /* The room opens — what lives here */
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5"
            >
              <p className="text-[13px] leading-relaxed text-[#44435e]">
                {community.description}
              </p>

              {gathered.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8b8aa0]">
                    Gathered around
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {gathered.map(({ other }) => (
                      <li key={other.id}>
                        <Link
                          href={other.href}
                          className="crystal-focus flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-[12px] font-semibold text-[#44435e] ring-1 ring-white/70 transition hover:bg-white/85"
                        >
                          <span aria-hidden>{other.emoji}</span>
                          {other.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href="/communities"
                  className="crystal-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-px"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
                    boxShadow: "0 4px 14px rgba(var(--mood-rgb),0.32)",
                  }}
                >
                  Open this room
                  <Icon name="forward" size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setEntered(false)}
                  className="crystal-focus rounded-full px-3 py-2 text-[12px] font-medium text-[#8b8aa0] transition hover:text-[#44435e]"
                >
                  Step back out
                </button>
              </div>
            </motion.div>
          ) : (
            /* The threshold — who it's for + the door */
            <div className="mt-5">
              <p className="text-[13px] leading-relaxed text-[#44435e]">
                {community.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEntered(true)}
                  aria-expanded={entered}
                  className="crystal-focus inline-flex items-center gap-1.5 rounded-full bg-white/60 px-4 py-2 text-[12.5px] font-semibold text-[#232136] ring-1 ring-white/80 transition hover:bg-white/90"
                >
                  Look inside
                  <Icon name="forward" size={12} />
                </button>
                <Link
                  href="/communities"
                  className="crystal-focus rounded-full px-3 py-2 text-[12px] font-medium text-[#8b8aa0] transition hover:text-[#44435e]"
                >
                  All communities
                </Link>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-[#8b8aa0]">
                <Icon name="users" size={11} />
                Membership is always yours to choose — nothing here joins for you.
              </p>
            </div>
          )}
        </div>
      </CrystalSurface>
    </motion.article>
  );
}
