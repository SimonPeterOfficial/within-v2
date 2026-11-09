"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
// Crystal World: the top bar floats as translucent crystal above the world.
import { COMMAND_PALETTE_EVENT } from "@/components/layout/CommandPalette";
import NotificationsBell from "@/components/layout/NotificationsBell";
import Icon from "@/components/ui/Icon";
import WithinMark from "@/components/ui/WithinMark";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { sunPosition, dayCharacter } from "@/lib/atlas/sky";

/**
 * TopBar — the illustrated chrome row.
 *
 * A wide centered search pill opening the command palette; on the right:
 * the notification bell, the live sky chip (temperature from the honest
 * on-device climate estimate), the session avatar, and the overflow door.
 * The sidebar rail owns navigation, so the bar stays weightless.
 */
export default function TopBar() {
  const router = useRouter();
  const { user } = useSession();
  const now = useAtlasTime();
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? "E";

  const sun = sunPosition(now);
  const clouds = dayCharacter(now);
  const condition =
    sun.phase === "night" ? "Clear night" : clouds > 0.66 ? "Partly Cloudy" : clouds > 0.33 ? "Soft clouds" : "Clear sky";

  return (
    <header
      className="sticky top-0 z-40 mx-auto flex w-full items-center gap-2.5 px-4 pb-1 pt-4 sm:gap-3 sm:px-6"
    >
      {/* Mobile wordmark */}
      <Link href="/home" aria-label="WithIn home" className="shrink-0 lg:hidden">
        <WithinMark variant="diamond" size={24} tone="gold" />
      </Link>

      {/* The wide search capsule — centered, opens the command palette */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT))}
        aria-label="Search Within"
        className="pane edge-glass crystal-focus mx-auto flex h-11 w-11 max-w-[560px] items-center justify-center rounded-full sm:w-auto sm:flex-1 sm:justify-start sm:gap-3 sm:px-5"
      >
        <span aria-hidden className="chip-glass h-7 w-7 sm:h-6 sm:w-6">
          <Icon name="search" size={14} strokeWidth={2} />
        </span>
        <span className="hidden text-[13px] text-[#8b8aa0] sm:inline">
          Search worlds, people, ideas, or anything…
        </span>
        <kbd className="ml-auto hidden shrink-0 rounded-full bg-white/55 px-2.5 py-0.5 text-[10px] font-semibold text-[#7d7697] ring-1 ring-white/70 lg:inline">
          ⌘K
        </kbd>
      </button>

      {/* Utilities — bell · sky · avatar · more */}
      <div className="flex shrink-0 items-center gap-2">
        <NotificationsBell />

        {/* The live sky coin — honest on-device estimate */}
        <button
          type="button"
          onClick={() => router.push("/atlas")}
          aria-label={`${condition} — open Within Time`}
          className="pane chip-glass-hover crystal-focus hidden h-10 w-10 items-center justify-center rounded-full md:flex"
        >
          <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full">
            {sun.phase === "night" ? "🌙" : clouds > 0.66 ? "⛅" : "☀️"}
          </span>
        </button>

        <Link
          href="/profile"
          aria-label="Your profile"
          className="chip-glass chip-glass-hover flex h-10 w-10 items-center justify-center text-[12px] font-bold"
        >
          {initial}
        </Link>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          aria-label="More options"
          className="chip-glass chip-glass-hover hidden h-10 w-10 items-center justify-center sm:flex"
        >
          <Icon name="dots" size={15} />
        </button>
      </div>
    </header>
  );
}
