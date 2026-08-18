"use client";

import { usePathname } from "next/navigation";

type AdminTopbarProps = {
  onMenuToggle: () => void;
};

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Command Center",
  "/admin/users": "Users",
  "/admin/creators": "Creators",
  "/admin/content": "Content",
  "/admin/communities": "Communities",
  "/admin/moderation": "Moderation",
  "/admin/analytics": "Analytics",
  "/admin/auri": "Auri Control",
  "/admin/settings": "Settings",
  "/admin/features": "Feature Flags",
  "/admin/audit": "Audit Log",
};

/**
 * AdminTopbar — minimal, precise, informative.
 * Shows current page, admin identity, and mobile menu toggle.
 */
export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  // Get time-based greeting
  const hour = typeof window !== "undefined" ? new Date().getHours() : 18;
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.04] bg-[#06060c]/80 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <span className="block h-4 w-4" aria-hidden>
            <span className="mb-1 block h-0.5 w-4 rounded-full bg-current" />
            <span className="mb-1 block h-0.5 w-3 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </span>
        </button>

        <div>
          <h1 className="text-sm font-semibold text-white">{title}</h1>
          <p className="text-[11px] text-gray-500">{greeting}, Admin</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          WithIn is alive
        </div>

        {/* Admin avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-xs font-semibold text-gray-300">
          SL
        </div>
      </div>
    </header>
  );
}
