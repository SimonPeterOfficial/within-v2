"use client";

import Image from "next/image";

/**
 * HomeHero — the painted welcome scene.
 *
 * The repository's canonical illustrated arrival: a golden-hour sky palace
 * above the clouds, Auri at the horizon, and six doorway cards for
 * Sanctuary / Mirror / Connections / Studio / Worlds / Within Time.
 * The HTML chrome (nav, rail, panels) lives around this section rather
 * than over it, so the painting is never collaged over by UI.
 */
export default function HomeHero() {
  return (
    <section aria-label="Welcome to WithIn" className="relative z-10">
      <div className="relative overflow-hidden rounded-[30px] ring-1 ring-white/40 shadow-[var(--shadow-soft)]">
        <Image
          src="/within-home.png"
          alt="Welcome to WithIn — a painted sky palace above clouds, with six doorways to Sanctuary, Mirror, Connections, Studio, Worlds, and Within Time"
          width={1610}
          height={997}
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="block h-auto w-full object-cover"
        />
      </div>
    </section>
  );
}
