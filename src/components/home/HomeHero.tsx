"use client";

import { motion } from "framer-motion";
import { CrystalButton } from "@/components/within/crystal/Crystal";
import AuriHeart from "@/components/sanctuary/AuriHeart";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";
import { useSyncExternalStore } from "react";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* Hydration-safe greeting via external store (server = neutral). */
const subscribe = () => () => {};
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Still awake?";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
const getServerGreeting = () => "Good evening";

/* Deterministic window forecast — stable between server and client. */
const WINDOWS = [
  { day: "Today", hi: 25, lo: 24, glyph: "☀️" },
  { day: "Thu", hi: 26, lo: 17, glyph: "⛅" },
  { day: "Fri", hi: 25, lo: 16, glyph: "⛅" },
  { day: "Sat", hi: 27, lo: 18, glyph: "☀️" },
];

/**
 * HomeHero — the illustrated crystal scene.
 *
 * A painted sky (layered CSS gradients: warm sun-glow, floating castle
 * islands with waterfalls falling into a still lake, a light path across
 * the water) with the giant serif wordmark floating in front of it.
 * Winged Auri hovers on the right horizon beside her "Talk to Auri" door.
 * The right rail's weather + mood panels rise along the same horizon.
 */
export default function HomeHero() {
  const prefersReducedMotion = useReducedMotionSafe();
  const greeting = useSyncExternalStore(subscribe, getGreeting, getServerGreeting);
  const { user } = useSession();
  const firstName = user?.name.trim().split(/\s+/)[0];
  const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

  return (
    <section aria-label="Welcome to WithIn" className="relative z-10">
      <div className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[30px]">
        {/* ═══ The painted sky ═══ */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #aeb8e4 0%, #c9c4e8 22%, #ecd9e2 45%, #f6e7d8 62%, #dfe4ef 82%, #cfd6ec 100%)",
          }}
        />
        {/* The sun's bloom behind the central island */}
        <motion.div
          aria-hidden
          className="absolute left-[44%] top-[16%] h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,244,214,0.95) 0%, rgba(255,224,178,0.5) 30%, rgba(255,214,190,0.18) 55%, transparent 72%)",
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Distant violet mountains */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-[46%] h-[30%]"
          style={{
            background:
              "radial-gradient(ellipse 42% 78% at 12% 100%, rgba(142,148,196,0.55), transparent 70%), radial-gradient(ellipse 48% 88% at 88% 100%, rgba(150,146,204,0.5), transparent 72%), radial-gradient(ellipse 40% 66% at 60% 104%, rgba(168,158,214,0.4), transparent 70%)",
          }}
        />

        {/* ═══ The floating islands — one grand castle isle, two small ═══ */}
        {/* Grand isle — castle spires + falls + green */}
        <motion.div
          aria-hidden
          className="absolute left-[38%] top-[8%] hidden md:block"
          animate={prefersReducedMotion ? undefined : { y: [0, -9, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          <IslandScene />
        </motion.div>
        {/* Small left isle */}
        <motion.div
          aria-hidden
          className="absolute left-[12%] top-[30%] hidden lg:block"
          animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
            <path d="M10 34 Q60 22 110 34 Q60 50 10 34 Z" fill="#7d8f77" />
            <path d="M22 40 L34 62 L46 42 Z" fill="#a89ec2" opacity="0.9" />
            <path d="M74 42 L86 64 L98 42 Z" fill="#9d94c0" opacity="0.9" />
            <circle cx="44" cy="30" r="7" fill="#93a888" />
            <circle cx="70" cy="27" r="9" fill="#879a80" />
            <circle cx="90" cy="31" r="6" fill="#93a888" />
          </svg>
        </motion.div>
        {/* Small right isle */}
        <motion.div
          aria-hidden
          className="absolute right-[16%] top-[22%] hidden lg:block"
          animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 12.5, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
        >
          <svg width="104" height="62" viewBox="0 0 104 62" fill="none">
            <path d="M8 30 Q52 20 96 30 Q52 44 8 30 Z" fill="#82967c" />
            <circle cx="34" cy="26" r="8" fill="#8fa884" />
            <circle cx="60" cy="23" r="10" fill="#829878" />
            <circle cx="82" cy="27" r="6" fill="#8fa884" />
            <path d="M48 34 L58 52 L68 36 Z" fill="#a49ac6" opacity="0.9" />
          </svg>
        </motion.div>

        {/* ═══ The lake — still water with the light path ═══ */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(233,222,236,0.0) 0%, rgba(196,196,232,0.75) 30%, rgba(158,166,212,0.9) 100%)",
          }}
        />
        {/* The light path across the water */}
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/2 h-[34%] w-[130px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,240,205,0.5) 45%, rgba(255,246,222,0.85) 100%)",
            filter: "blur(6px)",
          }}
          animate={{ opacity: [0.7, 1, 0.7], scaleX: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Water sparkle ripples */}
        {[18, 36, 62, 80].map((x, i) => (
          <motion.span
            key={x}
            aria-hidden
            className="absolute rounded-full border border-white/50"
            style={{ left: `${x}%`, bottom: `${6 + (i % 2) * 9}%`, width: 54 - i * 8, height: 8 }}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}

        {/* ═══ Foreground florals — the mock's garden frame ═══ */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -left-6 bottom-0 hidden h-40 w-56 lg:block"
          viewBox="0 0 220 160"
          fill="none"
        >
          <path d="M0 160 Q10 96 48 92 Q40 60 74 58 Q108 56 108 96 Q150 84 152 120 Q154 150 120 160 Z" fill="#a9c4a4" opacity="0.9" />
          <circle cx="60" cy="70" r="14" fill="#c8dcc0" />
          <circle cx="112" cy="92" r="10" fill="#bcd6b6" />
          <circle cx="30" cy="120" r="16" fill="#b7d2b0" />
          <circle cx="86" cy="56" r="6" fill="#e8f2e2" />
        </svg>
        <svg
          aria-hidden
          className="pointer-events-none absolute -right-4 bottom-0 hidden h-36 w-52 lg:block"
          viewBox="0 0 200 150"
          fill="none"
        >
          <path d="M200 150 Q190 92 156 88 Q166 58 134 58 Q102 58 104 94 Q66 88 70 122 Q72 148 100 150 Z" fill="#a9c4a4" opacity="0.9" />
          <circle cx="140" cy="74" r="12" fill="#c8dcc0" />
          <circle cx="96" cy="92" r="9" fill="#bcd6b6" />
          <circle cx="168" cy="118" r="14" fill="#b7d2b0" />
        </svg>

        {/* ═══ Content — left editorial block ═══ */}
        <div className="relative flex min-h-[520px] flex-col justify-center px-7 py-12 md:min-h-[560px] md:px-12">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] font-medium tracking-wide text-[#3d3a5e] drop-shadow-[0_1px_6px_rgba(255,255,255,0.6)]"
            >
              {greeting}
              {firstName ? `, ${firstName}.` : "."} A Universe That Feels You.
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-display text-[clamp(64px,9.5vw,124px)] font-medium leading-[0.92] tracking-[-0.02em]"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #ffffff 12%, #dfe4fb 40%, #a3ace4 70%, #6b6fae 96%)",
                  filter: "drop-shadow(0 2px 20px rgba(255,255,255,0.55)) drop-shadow(0 3px 14px rgba(120,120,190,0.35))",
                }}
              >
                WithIn
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 text-[16px] font-medium text-[#44415f]"
            >
              Explore. Create. Connect. Be You.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <CrystalButton
                href="#continue"
                size="lg"
                className="rounded-full px-7"
                style={{
                  background: "linear-gradient(135deg, rgba(149,132,240,0.95), rgba(116,98,224,0.9))",
                  boxShadow:
                    "0 6px 26px rgba(122,104,232,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
                }}
              >
                Continue Exploring
                <span aria-hidden className="ml-1.5">→</span>
              </CrystalButton>
              <button
                type="button"
                onClick={openAuri}
                className="crystal-focus inline-flex items-center gap-2 rounded-full bg-white/55 px-6 py-3 text-[14px] font-semibold text-[#3d3a5e] ring-1 ring-white/80 backdrop-blur-md transition hover:bg-white/80"
              >
                Meet Auri
                <span aria-hidden className="text-[#8b7ce6]">✦</span>
              </button>
            </motion.div>
          </div>

          {/* ═══ Right — Auri at the horizon ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute bottom-8 right-6 hidden flex-col items-center lg:flex xl:right-10"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <AuriHeart size={168} wings showRing />
            </motion.div>
            <p className="mt-1 font-display text-lg font-medium text-[#2c2a48]">Auri</p>
            <p className="max-w-[240px] text-center text-[12.5px] leading-relaxed text-[#44435e]">
              The universe is speaking in your direction.
              <br />
              Are you ready to listen?
            </p>
            <button
              type="button"
              onClick={openAuri}
              className="crystal-focus mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, rgba(149,132,240,0.95), rgba(116,98,224,0.9))",
                boxShadow: "0 5px 22px rgba(122,104,232,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <span aria-hidden>☄</span>
              Talk to Auri
            </button>
          </motion.div>
        </div>

        {/* ═══ The horizon dock — weather + mood windows (lg+) ═══ */}
        <div className="pointer-events-none absolute right-4 top-4 hidden w-[240px] flex-col gap-3 lg:flex">
          <div className="pointer-events-auto">
            <HeroWeatherCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Island scene — the grand castle isle, drawn in SVG ─────────────── */
function IslandScene() {
  return (
    <svg width="300" height="210" viewBox="0 0 300 210" fill="none">
      <defs>
        <linearGradient id="isle-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b3a8cc" />
          <stop offset="1" stopColor="#8d84b8" />
        </linearGradient>
        <linearGradient id="isle-castle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f1fb" />
          <stop offset="1" stopColor="#c8c2e2" />
        </linearGradient>
        <linearGradient id="isle-fall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef4ff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#bcd4f2" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* Island body */}
      <path d="M30 96 Q150 70 270 96 Q150 156 30 96 Z" fill="url(#isle-rock)" />
      <path d="M52 100 L74 138 L96 104 Z" fill="#9d93c4" opacity="0.85" />
      <path d="M204 104 L228 140 L250 102 Z" fill="#9d93c4" opacity="0.85" />
      {/* Waterfalls from the isle's edge */}
      <rect x="104" y="98" width="10" height="72" rx="5" fill="url(#isle-fall)" />
      <rect x="186" y="98" width="10" height="72" rx="5" fill="url(#isle-fall)" />
      {/* Meadow */}
      <path d="M30 96 Q150 70 270 96 Q150 108 30 96 Z" fill="#8fa886" />
      {/* Trees */}
      <circle cx="66" cy="88" r="10" fill="#7d9a74" />
      <circle cx="238" cy="88" r="9" fill="#7d9a74" />
      <circle cx="92" cy="84" r="7" fill="#8aa87f" />
      <circle cx="212" cy="85" r="6" fill="#8aa87f" />
      {/* Castle — white spires catching the sun */}
      <path d="M132 88 L132 44 Q150 30 168 44 L168 88 Z" fill="url(#isle-castle)" />
      <path d="M124 88 L124 58 Q133 52 138 58 L138 88 Z" fill="url(#isle-castle)" opacity="0.95" />
      <path d="M162 88 L162 58 Q167 52 176 58 L176 88 Z" fill="url(#isle-castle)" opacity="0.95" />
      <path d="M132 44 Q150 26 168 44 L168 40 Q150 22 132 40 Z" fill="#a79bd8" />
      <path d="M124 58 Q133 48 138 58 L138 54 Q133 46 124 54 Z" fill="#a79bd8" />
      <path d="M162 58 Q167 48 176 58 L176 54 Q167 46 162 54 Z" fill="#a79bd8" />
      {/* Castle windows */}
      <circle cx="150" cy="60" r="3" fill="#8f86c9" />
      <circle cx="143" cy="74" r="2.5" fill="#8f86c9" />
      <circle cx="157" cy="74" r="2.5" fill="#8f86c9" />
      {/* Tower flag */}
      <path d="M150 22 L150 8" stroke="#6f68a8" strokeWidth="2" strokeLinecap="round" />
      <path d="M150 8 L162 12 L150 16 Z" fill="#d9a4c8" />
    </svg>
  );
}

/* ── Hero weather window — the mock's top-right forecast ═══════════════ */
function HeroWeatherCard() {
  return (
    <div className="crystal-foreground crystal-edge depth-medium rounded-3xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[26px] font-medium leading-none text-[#2c2a48]">23°C</p>
          <p className="mt-1 text-[11px] font-medium text-[#5f5e74]">Partly Cloudy</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#5f5e74]">
            <span aria-hidden>📍</span> Moonlight Bay
          </p>
        </div>
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
          style={{
            background: "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,210,140,0.5))",
            boxShadow: "0 3px 10px rgba(255,220,160,0.4)",
          }}
        >
          ☀️
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-white/60 pt-2.5">
        {WINDOWS.map((day) => (
          <div key={day.day} className="text-center">
            <p className="text-[9.5px] font-semibold text-[#44435e]">{day.day}</p>
            <p aria-hidden className="text-[13px]">{day.glyph}</p>
            <p className="text-[10px] font-semibold tabular-nums text-[#2c2a48]">{day.hi}°</p>
            <p className="text-[9px] tabular-nums text-[#8b8aa0]">{day.lo}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}
