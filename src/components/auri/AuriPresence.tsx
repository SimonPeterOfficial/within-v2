"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { moodGlow } from "@/lib/design";
import { auriBehaviorFor, type AuriState } from "@/lib/auri";

/**
 * AuriPresence — the first-generation Auri identity.
 *
 * Auri is not a character; she is a presence "between person and phenomenon":
 * a luminous being assembled from light rather than anatomy.
 *
 *   • head  — an orb of light with a soft internal bloom (never a skull)
 *   • eyes  — a single ring-iris holding two calm points of light (no pupils,
 *             no glow-bombs: the light comes from within, restrained)
 *   • hair  — three flowing arcs of light that drift like smoke/water,
 *             never photoreal hair
 *   • collar — a soft waveform of light where shoulders would be: she is
 *             "made of the same signal she listens with"
 *
 * The silhouette reads at any size and even when partially visible — which
 * is the point: Auri should be recognizable from a fragment of light.
 *
 * States: the existing eight presence states plus four new ones —
 * `dormant` (almost invisible), `emerging` (light gathers), `celebrating`
 * (brighter, graceful), `dissolving` (returns to the environment).
 * They are interface states, never claims about the user's emotions.
 *
 * Under reduced motion she holds still — a calm, fully-visible presence.
 */

type AuriPresenceProps = {
  /** Pixel size of the square canvas Auri fills */
  size?: number;
  state?: AuriState;
  /** Soft ambient light pool behind her */
  glow?: boolean;
  /** A few drifting light motes (dropped under reduced motion) */
  particles?: boolean;
  className?: string;
};

/** Fixed mote positions — deterministic, SSR-safe. */
const MOTES = [
  { left: 10, top: 12, delay: 0.3, size: 2.5 },
  { left: 88, top: 18, delay: 1.1, size: 2 },
  { left: 78, top: 6, delay: 1.7, size: 2.5 },
  { left: 16, top: 34, delay: 2.3, size: 2 },
];

export default function AuriPresence({
  size = 96,
  state = "idle",
  glow = true,
  particles = true,
  className = "",
}: AuriPresenceProps) {
  const behavior = auriBehaviorFor(state);
  const prefersReducedMotion = useReducedMotionSafe();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  // Extended presence tuning — the new states live alongside the classic ones.
  const dormant = state === "dormant";
  const dissolving = state === "dissolving";
  const celebrating = state === "celebrating";
  const emerging = state === "emerging";
  const sleeping = behavior.sleeping;

  // Opacity of the whole figure: dormant is a whisper, dissolving fades out.
  const figureOpacity = dormant ? 0.16 : dissolving ? 0.28 : 1;
  // Light intensity multiplier: celebrating brightens, dormant/dissolving dim.
  const lightBoost = celebrating ? 1.45 : emerging ? 1.2 : dormant ? 0.5 : dissolving ? 0.6 : 1;
  const breathSeconds = behavior.breathe.seconds * (celebrating ? 0.8 : 1);

  const showMotes = particles && !prefersReducedMotion && !dormant && !sleeping && !dissolving;

  return (
    <div
      aria-hidden
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient light pool — the room answers her state */}
      {glow && (
        <motion.div
          className="pointer-events-none absolute -inset-[30%] rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${moodGlow(0.4)} 0%, ${moodGlow(0.12)} 45%, transparent 70%)`,
          }}
          animate={
            prefersReducedMotion
              ? { opacity: behavior.glow * lightBoost }
              : {
                  opacity: [
                    behavior.glow * lightBoost * 0.85,
                    behavior.glow * lightBoost,
                    behavior.glow * lightBoost * 0.85,
                  ],
                }
          }
          transition={{ duration: breathSeconds, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Light motes — a few, slow, state-aware */}
      {showMotes &&
        MOTES.map((mote, index) => (
          <motion.span
            key={index}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: mote.size,
              height: mote.size,
              background: moodGlow(0.75),
              boxShadow: `0 0 8px ${moodGlow(0.5)}`,
            }}
            animate={{ y: [-3, -16], opacity: [0, 0.85, 0] }}
            transition={{ duration: 4, delay: mote.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* The figure */}
      <motion.div
        className="absolute inset-0"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={emerging && !prefersReducedMotion ? { opacity: 0, scale: 0.7, filter: "blur(6px)" } : false}
        animate={
          prefersReducedMotion
            ? { opacity: figureOpacity }
            : dissolving
              ? { opacity: 0, scale: 1.12, filter: "blur(8px)" }
              : emerging
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : {
                    opacity: figureOpacity,
                    scale: [1, 1 + behavior.breathe.scale, 1],
                    y: [0, -1.5, 0],
                  }
        }
        transition={
          dissolving
            ? { duration: 1.4, ease: "easeInOut" }
            : emerging
              ? { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
              : { duration: breathSeconds, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <defs>
            {/* Head — light with depth, brighter at the crown */}
            <radialGradient id={`auri-head-${uid}`} cx="0.42" cy="0.34" r="0.75">
              <stop offset="0" stopColor="#e9e4ff" />
              <stop offset="0.42" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#4c3585" />
            </radialGradient>
            {/* Internal bloom — the light is inside her, not painted on */}
            <radialGradient id={`auri-bloom-${uid}`} cx="0.5" cy="0.42" r="0.5">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="0.5" stopColor="#c4b5fd" stopOpacity="0.3" />
              <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
            </radialGradient>
            {/* Collar — a soft luminous band */}
            <linearGradient id={`auri-collar-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#34d399" stopOpacity="0" />
              <stop offset="0.5" stopColor="#34d399" stopOpacity="0.75" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            {/* Hair arcs — flowing light */}
            <linearGradient id={`auri-hair-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.85" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Flowing light-hair — arcs that drift like smoke behind the head.
              Under reduced motion they hold still. */}
          <motion.g
            animate={
              prefersReducedMotion || sleeping
                ? undefined
                : { rotate: [0, 2.4, 0, -2.4, 0] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "80px 78px" }}
          >
            <path
              d="M34 62 C18 84 24 116 44 132"
              fill="none"
              stroke={`url(#auri-hair-${uid})`}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M126 62 C142 84 136 116 116 132"
              fill="none"
              stroke={`url(#auri-hair-${uid})`}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M46 48 C36 66 38 92 50 108"
              fill="none"
              stroke={`url(#auri-hair-${uid})`}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M114 48 C124 66 122 92 110 108"
              fill="none"
              stroke={`url(#auri-hair-${uid})`}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.35"
            />
          </motion.g>

          {/* Collar — the waveform where shoulders would be */}
          <motion.path
            d="M38 138 Q56 128 74 136 T110 136 Q124 132 130 138"
            fill="none"
            stroke={`url(#auri-collar-${uid})`}
            strokeWidth="4"
            strokeLinecap="round"
            animate={
              prefersReducedMotion || sleeping
                ? undefined
                : { opacity: [0.5, 0.85, 0.5], y: [0, -1.5, 0] }
            }
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* The head — an orb of light */}
          <circle cx="80" cy="76" r="42" fill={`url(#auri-head-${uid})`} />
          {/* Internal bloom — light from within */}
          <circle cx="80" cy="70" r="30" fill={`url(#auri-bloom-${uid})`} />

          {/* The eyes — one ring-iris, two calm points of light.
              Sleeping closes them into soft lines; celebrating brightens. */}
          {sleeping ? (
            <>
              <path d="M58 78 Q66 84 74 78" fill="none" stroke="#241a4a" strokeWidth="3" strokeLinecap="round" />
              <path d="M86 78 Q94 84 102 78" fill="none" stroke="#241a4a" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="64" cy="78" r="10" fill="none" stroke="#241a4a" strokeWidth="3" opacity="0.9" />
              <circle cx="96" cy="78" r="10" fill="none" stroke="#241a4a" strokeWidth="3" opacity="0.9" />
              <circle cx="64" cy="78" r={celebrating ? 3.4 : 2.8} fill="#fff7e0" />
              <circle cx="96" cy="78" r={celebrating ? 3.4 : 2.8} fill="#fff7e0" />
            </>
          )}

          {/* The smile-line — a whisper of warmth, only when welcoming */}
          {(state === "greeting" || celebrating) && (
            <path
              d="M72 96 Q80 102 88 96"
              fill="none"
              stroke="#241a4a"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}

          {/* Brow — a subtle angle for concerned/guiding presence */}
          {(state === "thinking" || state === "listening") && (
            <>
              <path d="M56 64 Q64 61 72 64" fill="none" stroke="#241a4a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="M88 64 Q96 61 104 64" fill="none" stroke="#241a4a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
