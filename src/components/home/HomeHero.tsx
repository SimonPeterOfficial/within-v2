"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import CoverArt from "@/components/ui/cards/CoverArt";
import Badge from "@/components/ui/cards/Badge";
import type { UniverseEntry } from "@/lib/search";
import { useEnvironment } from "@/lib/environment";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";

/**
 * HomeHero — the painted welcome scene.
 *
 * The repository's canonical illustrated arrival: a golden-hour sky palace
 * above the clouds. When real published content exists, a featured editorial
 * moment overlays the hero with the first genuine piece; otherwise the
 * painting stands alone as an honest empty state.
 *
 * A time-aware welcome band sits above the scene — greeting and date come
 * from the shared environment clock, so every visitor sees the same honest
 * moment rather than fabricated personalization.
 *
 * The HTML chrome (nav, rail, panels) lives around this section rather
 * than over it, so the painting is never collaged over by UI.
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

      <div className="relative overflow-hidden rounded-[30px] ring-1 ring-white/40 shadow-[var(--shadow-soft)] mt-2">
        <Image
          src="/within-home.png"
          alt="Welcome to WithIn — a painted sky palace above clouds"
          width={1610}
          height={997}
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="block w-full object-cover min-h-[56vh] max-h-[82vh]"
        />
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
            {featured.category && (
              <Badge tone="mood">{featured.category}</Badge>
            )}
            <Link
              href={featured.href}
              className="block mb-4"
            >
              <h2 className="font-display text-[28px] font-medium leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                {featured.title}
              </h2>
            </Link>
            <p className="mt-1 text-sm text-white/90 max-w-md">
              {featured.description}
            </p>
          </div>
        </motion.div>
      )}
    </section>
  );
}
