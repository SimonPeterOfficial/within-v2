"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

/* Hydration-safe ambient line — day-stable, whispered quietly. */

type DockItem = {
  label: string;
  href: string;
  icon: IconName;
};

const DOCK: DockItem[] = [
  { label: "Home", href: "/home", icon: "home" },
  { label: "Search", href: "/explore", icon: "search" },
  { label: "Auri", href: "/within", icon: "sparkles" },
  { label: "Messages", href: "/conversations", icon: "message" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

/**
 * HomeDock — the illustrated footer line of the home.
 *
 *  LEFT    the ambient line — a quiet horizon whisper
 *  CENTER  the floating dock — four doors + the Auri orb at heart,
 *          the orb blooming with the live mood light
 *  RIGHT   the now-playing pill — "Golden Hour · Luna Riven"
 *
 * Desktop-only chrome (mobile keeps the standard BottomNav).
 */
export default function HomeDock() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();

  const openAuri = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event(AURI_OPEN_EVENT));
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 hidden justify-center px-6 lg:flex" aria-hidden={false}>
      <div className="pointer-events-auto flex w-full max-w-[1360px] items-end justify-between gap-4">
        {/* ── LEFT — the ambient line ─────────────────────────────────── */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.dispatchEvent(new Event(AURI_OPEN_EVENT))}
          className="crystal-focus crystal-foreground crystal-edge depth-low flex max-w-[300px] items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-left"
          aria-label="Auri's ambient thought — open Auri"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px]"
            style={{
              background: "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,210,140,0.5))",
              boxShadow: "0 2px 8px rgba(255,220,160,0.35)",
            }}
          >
            ☀️
          </span>
          <span className="truncate text-[12px] font-medium text-[#44435e]">
            The horizon looks beautiful today…
          </span>
        </motion.button>

        {/* ── CENTER — the dock ───────────────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Dock navigation"
          className="crystal-foreground crystal-edge depth-high relative flex items-center gap-1 rounded-full p-2"
        >
          {DOCK.map((item) => {
            const isAuri = item.label === "Auri";
            const active = pathname === item.href;

            if (isAuri) {
              return (
                <a
                  key={item.label}
                  href="/within"
                  onClick={openAuri}
                  aria-label="Talk to Auri"
                  className="relative mx-1 flex h-12 w-12 items-center justify-center rounded-full"
                >
                  {/* Her bloom — the mood light she sits in */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(214,190,255,0.9), rgba(150,160,245,0.75))",
                      boxShadow:
                        "0 4px 20px rgba(150,140,245,0.55), inset 0 2px 6px rgba(255,255,255,0.7)",
                    }}
                    animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span aria-hidden className="relative text-lg drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">
                    ✦
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-w-[64px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition ${
                  active ? "text-[#5b4bc4]" : "text-[#8b8aa0] hover:text-[#44435e]"
                }`}
              >
                <Icon name={item.icon} size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[9.5px] font-medium">{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="homedock-active"
                    aria-hidden
                    className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[rgba(var(--mood-rgb),1)]"
                    style={{ boxShadow: "0 0 6px rgba(var(--mood-rgb),0.7)" }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </motion.nav>

        {/* ── RIGHT — now playing ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="crystal-focus crystal-foreground crystal-edge depth-low flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-3"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px]"
            style={{
              background: "linear-gradient(135deg, #c8b4ec, #8f9be0)",
              boxShadow: "inset 0 1px 3px rgba(255,255,255,0.6), 0 2px 8px rgba(120,110,200,0.3)",
            }}
          >
            🎵
          </span>
          <span className="leading-tight">
            <span className="block text-[11.5px] font-semibold text-[#2c2a48]">Golden Hour</span>
            <span className="block text-[9.5px] text-[#8b8aa0]">Luna Riven</span>
          </span>
          <span className="ml-1 flex items-center gap-1 text-[#5f5e74]">
            <button type="button" aria-label="Play or pause" className="crystal-focus rounded-full p-1.5 transition hover:bg-white/60">
              <Icon name="pause" size={13} />
            </button>
            <button type="button" aria-label="Next track" className="crystal-focus rounded-full p-1.5 transition hover:bg-white/60">
              <Icon name="forward" size={13} />
            </button>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
