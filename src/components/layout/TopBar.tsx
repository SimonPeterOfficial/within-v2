"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
// Crystal World: the top bar floats as translucent crystal above the world.
import { COMMAND_PALETTE_EVENT } from "@/components/layout/CommandPalette";
import NotificationsBell from "@/components/layout/NotificationsBell";
import Icon from "@/components/ui/Icon";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { sunPosition, climateEstimate, dayCharacter } from "@/lib/atlas/sky";

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
  const climate = climateEstimate(now);
  const clouds = dayCharacter(now);
  const currentC = Math.round(climate.lowC + (climate.highC - climate.lowC) * climate.daytime01);
  const condition =
    sun.phase === "night" ? "Clear night" : clouds > 0.66 ? "Partly Cloudy" : clouds > 0.33 ? "Soft clouds" : "Clear sky";

  return (
    <header className="crystal-elevated depth-low sticky top-0 z-40 border-b border-white/40 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-5">
        {/* Mobile wordmark */}
        <Link href="/home" aria-label="WithIn home" className="shrink-0 lg:hidden">
          <span className="font-display text-lg font-semibold text-[#232136]">
            With<span className="text-[#7c6ce0]">In</span>
          </span>
        </Link>

        {/* The wide search pill — centered, opens the command palette */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT))}
          aria-label="Search Within"
          className="crystal-focus mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/45 text-[#6f6e88] ring-1 ring-white/70 transition hover:bg-white/65 hover:text-[#232136] sm:w-72 md:w-96 lg:w-[440px] lg:justify-start lg:gap-2.5 lg:px-5"
        >
          <Icon name="search" size={16} />
          <span className="hidden text-[13px] text-[#8b8aa0] lg:inline">Search Within…</span>
          <kbd className="ml-auto hidden rounded bg-white/60 px-1.5 text-[10px] text-[#8b8aa0] ring-1 ring-white/70 lg:inline">
            ⌘K
          </kbd>
        </button>

        {/* Utilities — bell · sky chip · avatar · dots */}
        <div className="flex shrink-0 items-center gap-2">
          <NotificationsBell />

          {/* The live sky chip — honest on-device estimate */}
          <button
            type="button"
            onClick={() => router.push("/atlas")}
            aria-label={`${condition}, about ${currentC} degrees — open Within Time`}
            className="crystal-focus hidden h-10 items-center gap-2 rounded-full bg-white/45 pl-1.5 pr-4 ring-1 ring-white/70 transition hover:bg-white/65 md:flex"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full text-[13px]"
              style={{
                background:
                  sun.phase === "night"
                    ? "radial-gradient(circle, rgba(220,225,255,0.9), rgba(150,160,220,0.4))"
                    : "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,210,140,0.5))",
                boxShadow: "0 2px 8px rgba(255,220,160,0.35)",
              }}
            >
              {sun.phase === "night" ? "🌙" : clouds > 0.66 ? "⛅" : "☀️"}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[12.5px] font-semibold text-[#2c2a48]">{currentC}°C</span>
              <span className="block text-[9.5px] text-[#8b8aa0]">{condition}</span>
            </span>
          </button>

          <Link
            href="/profile"
            aria-label="Your profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-rose-400 text-[12px] font-bold text-[#232136] ring-2 ring-white/60 transition hover:ring-[rgba(var(--mood-rgb),0.5)]"
          >
            {initial}
          </Link>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            aria-label="More options"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#8b8aa0] transition hover:bg-white/50 hover:text-[#232136] sm:flex"
          >
            <Icon name="dots" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
