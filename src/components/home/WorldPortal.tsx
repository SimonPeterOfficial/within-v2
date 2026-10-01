"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { fireRipple } from "@/lib/ripple";
import { blurUp } from "@/lib/animations";

export type WorldPortalData = {
  name: string;
  icon: IconName;
  line: string;
  action: string;
  href: string;
  /** The scene — layered CSS gradients, one per world */
  scene: string;
  /** Scene glyph, drawn where an image would sit */
  glyph: string;
  /** World personality class */
  worldClass: string;
  /** Accent color for the portal's light */
  accent: string;
};

/**
 * WorldPortal — a crystal window into another place.
 *
 * Not a card. Not a button. A portal that communicates identity,
 * purpose, environment, emotion, and depth. The scene sits behind
 * glass; the light path reads as depth. Hover reveals more of the
 * world inside. The portal breathes with a slow glint of light.
 *
 * States: RESTING → HOVER → FOCUS → TOUCH → ACTIVE → ENTERING → DISABLED
 * Material: glass-crystal (Level 2 — moderate translucency)
 */
export default function WorldPortal({ portal, index }: { portal: WorldPortalData; index: number }) {
  return (
    <motion.div
      variants={blurUp}
      custom={index}
      className="group relative"
    >
      <Link
        href={portal.href}
        onClick={(e) => fireRipple(e)}
        className={`
          crystal-portal world-entrance relative flex h-[190px] flex-col overflow-hidden rounded-[24px]
          transition-all duration-500
          portal-resting portal-hover portal-touch
          hover:-translate-y-1.5 hover:depth-high
          focus-ring
          ${portal.worldClass}
        `}
        aria-label={`${portal.name} — ${portal.line}`}
      >
        {/* The world scene — layered gradients */}
        <div
          aria-hidden
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.08]"
          style={{ background: portal.scene }}
        />

        {/* Painterly star dust — luminous air */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 22% 28%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 68% 18%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 46% 48%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 82% 52%, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* The world's subject — drawn glyph */}
        <span
          aria-hidden
          className="absolute right-3 top-3 text-3xl opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
          style={{ filter: "drop-shadow(0 2px 6px rgba(40,40,80,0.3))" }}
        >
          {portal.glyph}
        </span>

        {/* The glass fade — legibility into the light */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.85) 78%)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* The portal's light — a soft glow from within */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 60%, ${portal.accent} 0%, transparent 70%)`,
          }}
        />

        {/* Content — the world's identity */}
        <div className="relative mt-auto p-4">
          <div className="flex items-center gap-1.5">
            <Icon name={portal.icon} size={14} className="text-[#5b5f9e]" strokeWidth={1.9} />
            <span className="text-[13px] font-semibold text-[#2c2a48]">{portal.name}</span>
          </div>
          <p className="mt-0.5 text-[10.5px] leading-snug text-[#5f5e74]">{portal.line}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#5b4bc4]">
            {portal.action}
            <Icon
              name="forward"
              size={10}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
