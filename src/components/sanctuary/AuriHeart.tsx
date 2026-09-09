"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";


/**
 * AuriHeart — a faithful winged-owl presence drawn as pure SVG.
 *
 * The reference design holds Auri as a spreading-winged owl inside a
 * luminous ring, nested in purple nebula. This component draws exactly
 * that: a ring of light, wings that open outward, a soft feathered body
 * with dark facial disks and warm golden eyes. She breathes very slowly,
 * and her glow follows the live mood color. Under Reduced Motion she is
 * held still and dimmed glow layers drop away.
 *
 * Props tune the scene: `wings` open the wings fully (the hero moment),
 * `showRing` draws the halo ring around her, and `size` scales everything.
 */
export default function AuriHeart({
  size = 420,
  wings = true,
  showRing = true,
  className = "",
}: {
  size?: number;
  wings?: boolean;
  showRing?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [mounted, setMounted] = useState(false);

  // The wing spread is an entrance — she arrives folded, then opens.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const open = wings && (mounted || prefersReducedMotion);
  const wingSpread = open ? 1 : 0.12;
  const duration = prefersReducedMotion ? 0 : 2.4;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden>
      {/* Deep nebula field — the purple space she lives in */}
      <div
        className="pointer-events-none absolute -inset-[24%] rounded-full opacity-90 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 42% 46%, rgba(124,93,214,0.30) 0%, rgba(88,52,168,0.16) 34%, rgba(40,22,90,0.07) 58%, transparent 76%)",
        }}
      />

      {showRing && (
        <motion.div
          className="pointer-events-none absolute inset-[6%] rounded-full"
          style={{
            background:
              "conic-gradient(from 210deg, rgba(196,167,255,0.5) 0deg, rgba(139,92,246,0.12) 90deg, rgba(196,167,255,0.28) 180deg, rgba(139,92,246,0.08) 270deg, rgba(196,167,255,0.5) 360deg)",
            WebkitMask: "radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)",
            mask: "radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)",
            filter: "drop-shadow(0 0 18px rgba(167,139,250,0.45))",
          }}
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        animate={prefersReducedMotion ? undefined : { y: [0, -8, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          {/* Wing feathering — luminous plum */}
          <linearGradient id="ah-wing-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#cdbdfd" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#3b2a75" />
          </linearGradient>
          <linearGradient id="ah-wing-r" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cdbdfd" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#3b2a75" />
          </linearGradient>
          <linearGradient id="ah-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7e68c4" />
            <stop offset="0.55" stopColor="#4c3a8c" />
            <stop offset="1" stopColor="#2a1f52" />
          </linearGradient>
          <linearGradient id="ah-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8f7ad0" />
            <stop offset="1" stopColor="#55418f" />
          </linearGradient>
          <linearGradient id="ah-disk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241b42" />
            <stop offset="1" stopColor="#171030" />
          </linearGradient>
          <radialGradient id="ah-iris" cx="0.38" cy="0.34" r="0.85">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.5" stopColor="#eec06a" />
            <stop offset="1" stopColor="#c98f3e" />
          </radialGradient>
          <radialGradient id="ah-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.4" stopColor="#d8c8ff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
          <filter id="ah-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Nebula wisps inside the ring field */}
        <g opacity="0.5">
          <ellipse cx="120" cy="120" rx="70" ry="26" fill="#6d4fc4" opacity="0.22" filter="url(#ah-soft)" transform="rotate(-24 120 120)" />
          <ellipse cx="290" cy="140" rx="66" ry="22" fill="#8b5cf6" opacity="0.18" filter="url(#ah-soft)" transform="rotate(18 290 140)" />
          <ellipse cx="210" cy="330" rx="90" ry="30" fill="#4c3a8c" opacity="0.2" filter="url(#ah-soft)" />
        </g>

        {/* ── The spread wings — layered feathers sweeping outward ── */}
        {/* Left wing */}
        <motion.g
          style={{ transformOrigin: "200px 190px" }}
          initial={{ scaleX: 0.14, opacity: 0 }}
          animate={{ scaleX: wingSpread, opacity: 1 }}
          transition={{ duration, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <path d="M172 190 C130 150 74 130 30 148 C58 118 112 112 150 132 C124 104 86 96 58 104 C92 78 142 88 168 116 C160 92 142 78 122 74 C152 62 184 82 192 118 L196 170 Z" fill="url(#ah-wing-l)" opacity="0.92" />
          <path d="M176 196 C140 170 96 162 62 174 C86 152 126 152 152 166 C132 146 104 142 84 146 C110 128 148 136 168 158 Z" fill="#c4b0fa" opacity="0.4" />
        </motion.g>
        {/* Right wing */}
        <motion.g
          style={{ transformOrigin: "200px 190px" }}
          initial={{ scaleX: 0.14, opacity: 0 }}
          animate={{ scaleX: wingSpread, opacity: 1 }}
          transition={{ duration, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <path d="M228 190 C270 150 326 130 370 148 C342 118 288 112 250 132 C276 104 314 96 342 104 C308 78 258 88 232 116 C240 92 258 78 278 74 C248 62 216 82 208 118 L204 170 Z" fill="url(#ah-wing-r)" opacity="0.92" />
          <path d="M224 196 C260 170 304 162 338 174 C314 152 274 152 248 166 C268 146 296 142 316 146 C290 128 252 136 232 158 Z" fill="#c4b0fa" opacity="0.4" />
        </motion.g>

        {/* ── The body — soft plum, breathing ── */}
        <ellipse cx="200" cy="238" rx="62" ry="74" fill="url(#ah-body)" />
        <ellipse cx="200" cy="258" rx="40" ry="46" fill="#6d58ad" opacity="0.5" />
        {/* Belly feather hint */}
        <g opacity="0.35" fill="none" stroke="#c9b8f5" strokeWidth="1.4">
          <path d="M182 244 q9 8 18 0 q9 8 18 0" />
          <path d="M178 262 q11 9 22 0 q11 9 22 0" />
          <path d="M182 280 q9 8 18 0 q9 8 18 0" />
        </g>

        {/* ── The head ── */}
        <ellipse cx="200" cy="170" rx="52" ry="48" fill="url(#ah-head)" />
        {/* Ear tufts */}
        <path d="M162 136 q-14 -26 6 -20 q6 10 4 22 Z" fill="url(#ah-head)" />
        <path d="M238 136 q14 -26 -6 -20 q-6 10 -4 22 Z" fill="url(#ah-head)" />
        {/* Crown rim light */}
        <path d="M172 130 q28 -14 56 0" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Facial disks — the dark heart-shaped mask of a barn owl */}
        <path d="M200 196 C176 196 160 180 160 160 C160 142 174 130 200 130 C226 130 240 142 240 160 C240 180 224 196 200 196 Z" fill="url(#ah-disk)" opacity="0.9" />
        <path d="M170 168 C170 150 182 140 200 140 C218 140 230 150 230 168 C230 184 216 192 200 192 C184 192 170 184 170 168 Z" fill="#120c26" opacity="0.85" />

        {/* Eyes — warm gold in the dark mask */}
        <circle cx="183" cy="163" r="9.5" fill="url(#ah-iris)" />
        <circle cx="217" cy="163" r="9.5" fill="url(#ah-iris)" />
        <circle cx="183" cy="163" r="4" fill="#140e28" />
        <circle cx="217" cy="163" r="4" fill="#140e28" />
        <circle cx="181" cy="160" r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="215" cy="160" r="1.8" fill="#ffffff" opacity="0.9" />

        {/* Beak */}
        <path d="M195 180 L200 192 L205 180 Q200 183 195 180 Z" fill="#d9a44e" />

        {/* The inner light — the reason she glows */}
        <motion.circle
          cx="200"
          cy="300"
          r="26"
          fill="url(#ah-core)"
          animate={prefersReducedMotion ? undefined : { opacity: [0.55, 0.95, 0.55], scale: [1, 1.14, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "200px 300px" }}
        />
      </motion.svg>

      {/* Ambient bloom beneath the figure — light pooling on dark water */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[72%] h-[34%] w-[68%] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(167,139,250,0.24) 0%, rgba(99,80,190,0.1) 45%, transparent 72%)",
        }}
        animate={prefersReducedMotion ? undefined : { opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** The caption pair rendered under Auri in the hero: "Auri is here." + line. */
export function AuriCaption({ compact = false }: { compact?: boolean }) {
  return (
    <div className="text-center">
      <p className={`font-display ${compact ? "text-lg" : "text-xl"} font-medium text-[#b9a5f2]`}>
        Auri is here.
      </p>
      <p className="mt-1 text-[13px] text-gray-400/80">A little light for your journey.</p>
    </div>
  );
}
