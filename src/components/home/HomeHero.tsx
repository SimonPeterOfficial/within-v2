"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CoverArt from "@/components/ui/cards/CoverArt";
import Badge from "@/components/ui/cards/Badge";
import type { UniverseEntry } from "@/lib/search";
import { useEnvironment } from "@/lib/environment";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";

/**
 * HomeHero — a calm, application-ready welcome panel.
 *
 * Replaces the large decorative image with a restrained, dark surface that
 * keeps the hero useful: a time-aware welcome band and an optional featured
 * cover art overlay when published content exists.
 */

type HomeHeroProps = {
  featured?: UniverseEntry | null;
};

export default function HomeHero({ featured }: HomeHeroProps) {
  const { greeting } = useEnvironment();
  const now = useAtlasTime();
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section aria-label="Welcome to WithIn" className="relative z-10">
      {/* Welcome band — time-aware greeting and real date */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#8b8aa0] tracking-wider uppercase">
          {greeting}
        </span>
        <span className="w-px h-3 bg-white/20" />
        <span className="text-[12px] text-[#8b8aa0]">{today}</span>
      </div>

      {/* A restrained, dark surface replaces the large background painting. */}
      <div className="relative overflow-hidden rounded-[30px] ring-1 ring-white/40 shadow-[var(--shadow-soft)] mt-2 bg-gradient-to-b from-[#06060a] to-[#07060b]">
        <div className="block w-full min-h-[56vh] max-h-[82vh]" />
      </div>

      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 relative z-10"
        >
          <CoverArt
            src={featured.src}
            alt={featured.title}
            gradient={featured.gradient}
            emoji={featured.emoji}
            tag={featured.category}
            className="h-64 md:h-[320px] w-full rounded-2xl overflow-hidden shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end h-full">
            {featured.category && <Badge tone="mood">{featured.category}</Badge>}
            <Link href={featured.href} className="block mb-4">
              <h2 className="font-display text-[28px] font-medium leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                {featured.title}
              </h2>
            </Link>
            <p className="mt-1 text-sm text-white/90 max-w-md">{featured.description}</p>
          </div>
        </motion.div>
      )}
    </section>
  );
}
