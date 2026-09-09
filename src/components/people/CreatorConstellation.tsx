"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon from "@/components/ui/Icon";
import {
  focusConstellationNode,
  discoveryCandidates,
  type ConstellationNode,
} from "@/lib/universe/constellation-engine";
import { getUniverseState } from "@/lib/universe/state";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * CreatorConstellation — the creator as a universe.
 *
 * Appended to the existing creator profile: the neighborhood of this
 * creator from the real constellation graph — their works, the worlds the
 * work lives in, kin who share the discipline, and communities gathered
 * around their work. Below, an honest "near this" discovery row built
 * from the visitor's own on-device exploration signals (never inferred).
 *
 * Reuses the Gen 11 crystal material and Gen 12 thread vocabulary.
 */

/* ── One relationship row — hoisted so it's a stable component ──────── */
function RelationRow({
  label,
  items,
}: {
  label: string;
  items: { relation: string; other: ConstellationNode }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8b8aa0]">{label}</p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {items.map(({ other }) => (
          <li key={other.id}>
            <Link
              href={other.href}
              className="group flex items-center gap-3 rounded-2xl bg-white/45 px-3 py-2.5 ring-1 ring-white/60 transition hover:bg-white/70"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-base ring-1 ring-white">
                <span aria-hidden>{other.emoji}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-semibold text-[#232136]">{other.title}</span>
                <span className="block truncate text-[10.5px] text-[#8b8aa0]">{other.subtitle}</span>
              </span>
              <Icon
                name="forward"
                size={12}
                className="ml-auto shrink-0 text-[#c0bfd4] transition group-hover:translate-x-0.5 group-hover:text-[#7c6ce0]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CreatorConstellation({ creatorId, creatorName }: { creatorId: string; creatorName: string }) {
  const prefersReducedMotion = useReducedMotionSafe();

  const focus = useMemo(() => focusConstellationNode(`creator:${creatorId}`), [creatorId]);
  const nearby = useMemo(() => {
    const state = getUniverseState();
    return discoveryCandidates(state.recentContentTypes, 3);
  }, []);

  if (!focus) return null;

  const works = focus.relationships.filter((r) => r.relation === "CREATED");
  const kin = focus.relationships.filter((r) => r.relation === "KIN");
  const gathered = focus.relationships.filter((r) => r.relation === "GATHERS_AROUND");

  return (
    <motion.section
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`${creatorName}'s constellation`}
      className="mt-14"
    >
      <CrystalSurface level="soft" depth="medium" sheen className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            The constellation around {creatorName.split(" ")[0]}
          </p>
          <Link
            href="/constellation"
            className="crystal-focus text-[11.5px] font-medium text-[#5b4bc4] underline-offset-2 hover:underline"
          >
            See the whole sky
          </Link>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-3">
          <RelationRow label="Their work" items={works} />
          <RelationRow label="Gathered around" items={gathered} />
          <RelationRow label="Shares a discipline with" items={kin} />
        </div>

        {/* Common ground — honest discovery, from the visitor's own signals */}
        {nearby.length > 0 && (
          <div className="mt-6 border-t border-white/60 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8b8aa0]">
              Near where you&apos;ve been exploring
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {nearby.map(({ node, reason }) => (
                <li key={node.id}>
                  <Link
                    href={node.href}
                    title={reason}
                    className="crystal-focus flex items-center gap-2 rounded-full bg-white/50 px-3.5 py-1.5 text-[12px] font-semibold text-[#44435e] ring-1 ring-white/70 transition hover:bg-white/80"
                  >
                    <span aria-hidden>{node.emoji}</span>
                    {node.title}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10.5px] text-[#8b8aa0]">
              Based on what you explored on this device — nothing is sent anywhere.
            </p>
          </div>
        )}
      </CrystalSurface>
    </motion.section>
  );
}
