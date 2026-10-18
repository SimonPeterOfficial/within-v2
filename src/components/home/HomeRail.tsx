"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { dreamSeed } from "@/lib/atlas/oracle";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";
import WeatherPanel from "@/components/home/WeatherPanel";
import MoodOrbs from "@/components/home/MoodOrbs";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * HomeRail — the reference's right rail on /home, top to bottom:
 *
 *  ┌ Daily Within ──────────┐  the day-stable reflection
 *  │ Not all who wander...  │
 *  ├ Quick Actions ─────────┤  Create / Upload / Start a conversation /
 *  │ › Create            ›  │  Explore worlds — each a real door
 *  ├ Recent ────────────────┤
 *  │ › Messages    (3 new)  │
 *  │ › Communities (2 new)  │
 *  │ › Notifications (5 new)│
 *  │ › Wallet        (Open) │
 *  ├ Something unexpected...┤
 *  │ [ Discover → ]         │
 *  └────────────────────────┘
 */

type RecentRow = {
  icon: IconName;
  label: string;
  sub: string;
  href: string;
};

const RECENT: RecentRow[] = [
  { icon: "message", label: "Messages", sub: "Your conversations", href: "/conversations" },
  { icon: "users", label: "Communities", sub: "Quiet rooms, kindred souls", href: "/communities" },
  { icon: "bell", label: "Notifications", sub: "Activity feed", href: "/home#notifications" },
  { icon: "sparkles", label: "Within", sub: "The heart of WithIn", href: "/within" },
];

const QUICK: { icon: IconName; label: string; href: string }[] = [
  { icon: "plus", label: "Create", href: "/studio" },
  { icon: "upload", label: "Upload", href: "/studio" },
  { icon: "message", label: "Start a conversation", href: "/conversations" },
  { icon: "globe", label: "Explore worlds", href: "/explore" },
];

export default function HomeRail() {
  const now = useAtlasTime();
  const seed = dreamSeed(now);
  const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

  return (
    <motion.aside
      variants={staggerContainer(0.09, 0.05)}
      initial="hidden"
      animate="show"
      className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]"
      aria-label="Daily rail"
    >
      {/* ── Weather window — the sky the room sits under ────────────── */}
      <motion.div variants={blurUp}>
        <WeatherPanel />
      </motion.div>

      {/* ── Your Mood Today — the mood field ────────────────────────── */}
      <motion.div variants={blurUp}>
        <MoodOrbs />
      </motion.div>

      {/* ── Daily Within ───────────────────────────────────────────── */}
      <motion.section
        variants={blurUp}
        aria-label="Daily Within"
        className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ui-surface text-[#7c6ce0] ring-1 ring-ui-line">
            <Icon name="sparkles" size={14} />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ui-ink">Daily Within</p>
            <p className="text-[10.5px] text-ui-faint">
              {now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <p className="mt-4 font-display text-[15px] leading-relaxed text-ui-ink-soft">
          {seed.image[0].toUpperCase() + seed.image.slice(1)} —{" "}
          <span className="text-ui-faint">{seed.feeling}</span>.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ui-faint">
          Not all who wander are lost. Some are just finding what matters.
        </p>
      </motion.section>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <motion.section
        variants={blurUp}
        aria-label="Quick actions"
        className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
      >
        <p className="text-[13px] font-semibold text-ui-ink">Quick Actions</p>
        <ul className="mt-3 flex flex-col">
          {QUICK.map((action) => (
            <li key={action.label}>
              <Link
                href={action.href}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ui-surface"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-surface text-ui-ink-soft ring-1 ring-ui-line transition-colors group-hover:text-ui-ink">
                  <Icon name={action.icon} size={14} strokeWidth={1.8} />
                </span>
                <span className="flex-1 text-[13px] font-medium text-ui-ink-soft group-hover:text-ui-ink">
                  {action.label}
                </span>
                <Icon
                  name="chevronRight"
                  size={13}
                  className="text-ui-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ui-ink-soft"
                />
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={openAuri}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-ui-surface"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))", boxShadow: "0 3px 10px rgba(var(--mood-rgb),0.3)" }}>
                <Icon name="sparkles" size={14} strokeWidth={1.8} />
              </span>
              <span className="flex-1 text-[13px] font-medium text-ui-ink-soft group-hover:text-ui-ink">
                Talk to Auri
              </span>
              <Icon
                name="chevronRight"
                size={13}
                className="text-ui-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ui-ink-soft"
              />
            </button>
          </li>
        </ul>
      </motion.section>

      {/* ── Recent ───────────────────────────────────────────────────── */}
      <motion.section
        variants={blurUp}
        aria-label="Recent activity"
        className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
      >
        <p className="text-[13px] font-semibold text-ui-ink">Recent</p>
        <ul className="mt-3 flex flex-col">
          {RECENT.map((row) => (
            <li key={row.label}>
              <Link
                href={row.href}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ui-surface"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-surface text-ui-ink-soft ring-1 ring-ui-line transition-colors group-hover:text-ui-ink">
                  <Icon name={row.icon} size={14} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ui-ink-soft group-hover:text-ui-ink">
                    {row.label}
                  </span>
                  <span className="block truncate text-[10.5px] text-ui-faint">{row.sub}</span>
                </span>
                <Icon
                  name="chevronRight"
                  size={13}
                  className="text-ui-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ui-ink-soft"
                />
              </Link>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* ── Discover card ────────────────────────────────────────────── */}
      <motion.section
        variants={blurUp}
        aria-label="Something unexpected"
        className="relative overflow-hidden rounded-3xl border border-white/60 p-5"
      >
        {/* The golden-hour cover — a warm horizon through morning glass */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 80%, rgba(251,190,120,0.5) 0%, rgba(250,215,170,0.25) 36%, transparent 62%), radial-gradient(circle at 50% 90%, rgba(200,170,240,0.3), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(250,235,245,0.55) 100%)",
          }}
        />
        <div className="relative">
          <p className="font-display text-[15px] font-medium leading-snug text-ui-ink">
            Something unexpected awaits you…
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ui-raised px-5 py-2.5 text-[13px] font-semibold text-ui-ink ring-1 ring-ui-line backdrop-blur transition hover:bg-white/85"
          >
            Discover
            <Icon name="forward" size={13} />
          </Link>
        </div>
      </motion.section>
    </motion.aside>
  );
}
