"use client";

import Link from "next/link";
import { useEnvironment } from "@/lib/environment";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { useSession } from "@/lib/auth/session";

const PATHS: { label: string; href: string }[] = [
  { label: "Communities", href: "/communities" },
  { label: "Creators", href: "/creators" },
  { label: "Books", href: "/books" },
  { label: "Music", href: "/music" },
  { label: "Photography", href: "/photography" },
  { label: "Originals", href: "/originals" },
];

/**
 * HomeGreeting — the serif welcome band.
 *
 * "Good Morning, Explorer." led by the honest shared clock (the same
 * greeting every visitor sees — no fabricated personalization), the
 * explorer's own name when they are signed in, and the day's phrasing:
 * "Whatever you feel, you belong here."
 */
export default function HomeGreeting() {
  const { greeting } = useEnvironment();
  const now = useAtlasTime();
  const { user } = useSession();
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section aria-label="Welcome" className="relative z-10 pb-1">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[34px] font-medium leading-[1.08] tracking-[-0.02em] ink-title sm:text-[40px]">
            {greeting},{" "}
            <span className="italic text-[#8a7bd6]">
              {user?.name?.trim().split(" ")[0] || "Explorer"}
            </span>
            .
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed ink-body">
            Whatever you feel, you belong here — {today.toLowerCase()}.
          </p>
        </div>
        <p aria-hidden className="tagline-caps hidden pb-2 text-[9px] sm:block">
          A universe that feels you
        </p>
      </div>

      {/* Where would you like to go today */}
      <nav aria-label="Rooms for today" className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href="#feed"
          className="pill-lit px-4 py-2 text-[12.5px] font-semibold"
          aria-current="page"
        >
          For You
        </Link>
        {PATHS.map((path) => (
          <Link
            key={path.label}
            href={path.href}
            className="pill-glass px-4 py-2 text-[12.5px] font-medium"
          >
            {path.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
