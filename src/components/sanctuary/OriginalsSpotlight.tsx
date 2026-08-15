"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import CreatorBadge from "@/components/ui/cards/CreatorBadge";
import { CREATORS } from "@/lib/creators";
import { formatFollowers } from "@/lib/format";

/** Spotlight — one featured creator of the Originals studio, rotated per visit. */
function pickSpotlight(): typeof CREATORS[number] {
  const studioCreators = CREATORS.filter((creator) =>
    creator.badges.includes("within-original")
  );
  // Deterministic per browser-day rotation: stable within a day, fresh tomorrow.
  const day = Math.floor(Date.now() / 86_400_000);
  const pool = studioCreators.length > 0 ? studioCreators : CREATORS;
  return pool[day % pool.length];
}

/** Creator spotlight — the face behind the studio, honest mock. */
export default function OriginalsSpotlight() {
  const spotlight = pickSpotlight();

  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Creator spotlight
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em]">
            Who&apos;s behind the studio
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          <GlassCard tone="strong" className="p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <span
                aria-hidden
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${spotlight.gradient} text-3xl shadow-orb`}
              >
                {spotlight.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-xl font-medium tracking-[-0.02em]">
                    {spotlight.name}
                  </h3>
                  {spotlight.badges.slice(0, 2).map((badge) => (
                    <CreatorBadge key={badge} badge={badge} />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{spotlight.bio}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {spotlight.handle} · {formatFollowers(spotlight.followers)} followers
                </p>
              </div>
              <div className="shrink-0">
                <Button href={`/creators/${spotlight.id}`} variant="outline" size="md">
                  View profile
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
}
