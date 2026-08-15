"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { moodGlow } from "@/lib/design";
import { auriBehaviorFor, type AuriState } from "@/lib/auri";

/**
 * Auri — the living owl at the heart of WithIn.
 *
 * Not a mascot: a quiet presence. She breathes slowly, blinks on her own
 * time, lets her gaze drift — and when you're near, she notices. The whole
 * figure is drawn in soft plum gradients with warm golden eyes; the light
 * behind her follows the live mood. Every motion is small on purpose.
 *
 * A `state` prop (see lib/auri.ts) tunes her presence subtly: thinking
 * slows her breath, curious leans her head a degree or two, sleeping closes
 * her eyes and hushes everything. Nothing is cartoonish.
 *
 * Safety: under Reduced Motion she holds perfectly still — eyes open,
 * pupils forward — and every particle layer is dropped.
 */

type AuriOwlProps = {
  /** Pixel size of the square canvas the owl fills */
  size?: number;
  /** Follow the cursor with the gaze (the presence) — off for decorative owls */
  followCursor?: boolean;
  /** Ambient mood-tinted glow behind the owl */
  glow?: boolean;
  /** Tiny drifting light motes around her */
  particles?: boolean;
  /** Which presence state she is in — tunes blink, gaze, glow, breathing */
  state?: AuriState;
  className?: string;
};

/** Fixed particle offsets (percent of the canvas) so SSR and client agree. */
const MOTES = [
  { left: 8, top: 6, delay: 0.2, size: 3 },
  { left: 86, top: 10, delay: 0.9, size: 2 },
  { left: 68, top: -4, delay: 1.5, size: 2.5 },
  { left: 16, top: 26, delay: 2.1, size: 2 },
  { left: 92, top: 34, delay: 0.6, size: 3 }
];

export default function AuriOwl({
  size = 64,
  followCursor = false,
  glow = true,
  particles = true,
  state = "idle",
  className = ""
}: AuriOwlProps) {
  const behavior = auriBehaviorFor(state);
  const [blinkMin, blinkMax] = behavior.blinkRange;
  const prefersReducedMotion = useReducedMotionSafe();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(false);
  // Unique SVG ids per instance — the presence, panel, and entrance can all
  // hold an owl at once without their gradients/eyelid clips colliding.
  // React 19 useId wraps the token in guillemets («r0»); strip to clean ASCII.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  // Gaze — normalized (-1…1) horizontal/vertical, spring-smoothed.
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const sgx = useSpring(gx, { stiffness: 70, damping: 16 });
  const sgy = useSpring(gy, { stiffness: 70, damping: 16 });

  // Blink on her own time — range comes from the current state; sleeping
  // keeps her eyes closed instead of blinking.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (blinkMin === 0 && blinkMax === 0) return;
    let alive = true;
    let timer: number;
    let closeTimer: number;

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        closeTimer = window.setTimeout(() => {
          if (alive) setBlink(false);
        }, 150);
        schedule();
      }, blinkMin + Math.random() * Math.max(1, blinkMax - blinkMin));
    };
    schedule();

    return () => {
      alive = false;
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [prefersReducedMotion, blinkMin, blinkMax]);

  // Greeting — one soft blink on arrival. Deferred so the effect body stays
  // free of synchronous setState.
  useEffect(() => {
    if (prefersReducedMotion || state !== "greeting") return;
    const frame = requestAnimationFrame(() => setBlink(true));
    const timer = window.setTimeout(() => setBlink(false), 260);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [prefersReducedMotion, state]);

  // Gaze posture per state — drift wanders, still holds center, focus lets
  // cursor awareness (below) drive the eyes.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (behavior.gaze === "still") {
      gx.set(0);
      gy.set(0);
      return;
    }
    if (behavior.gaze === "drift") {
      const id = window.setInterval(() => {
        gx.set((Math.random() * 2 - 1) * 0.55);
        gy.set((Math.random() * 2 - 1) * 0.45);
      }, 3400);
      return () => clearInterval(id);
    }
    return undefined;
  }, [prefersReducedMotion, behavior.gaze, gx, gy]);

  // Cursor awareness — when the pointer comes near, she notices it.
  // Still/sleeping presences hold their gaze instead of tracking.
  const gazeLocked = behavior.gaze === "still" || behavior.sleeping;
  useEffect(() => {
    if (prefersReducedMotion || !followCursor || gazeLocked) return;

    const onMove = (event: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      if (Math.hypot(dx, dy) < 340) {
        gx.set(Math.max(-1, Math.min(1, dx / 90)));
        gy.set(Math.max(-1, Math.min(1, dy / 90)));
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion, followCursor, gazeLocked, gx, gy]);

  const pupilX = useSpring(sgx, { stiffness: 140, damping: 20 });
  const pupilY = useSpring(sgy, { stiffness: 140, damping: 20 });
  // Head follows the gaze by a degree or two — never more.
  const headRotate = useSpring(sgx, { stiffness: 40, damping: 16 });

  // Sleeping — eyes closed, light dimmed, motes stilled.
  const eyesClosed = behavior.sleeping || blink;
  const showMotes = particles && !prefersReducedMotion && !behavior.sleeping;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient light pool — the mood answers through Auri, tuned by state */}
      {glow && (
        <div
          className="pointer-events-none absolute -inset-[28%] rounded-full blur-xl transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, ${moodGlow(0.4)} 0%, ${moodGlow(0.12)} 45%, transparent 70%)`,
            opacity: behavior.glow
          }}
        />
      )}

      {/* Light motes — a few, slow, never a swarm; sleeping drops them */}
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
              boxShadow: `0 0 8px ${moodGlow(0.5)}`
            }}
            animate={{ y: [-4, -20], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 3.6,
              delay: mote.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

      {/* The owl — breathing gently, at the state's pace */}
      <motion.div
        className="absolute inset-0"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1 + behavior.breathe.scale, 1], y: [0, -1.5, 0] }
        }
        transition={{
          duration: behavior.breathe.seconds,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%" role="img">
          <defs>
            <linearGradient id={`auri-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#54418a" />
              <stop offset="1" stopColor="#2a1f4d" />
            </linearGradient>
            <linearGradient id={`auri-head-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5d4998" />
              <stop offset="1" stopColor="#32255c" />
            </linearGradient>
            <linearGradient id={`auri-disk-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7c6ab8" />
              <stop offset="1" stopColor="#524184" />
            </linearGradient>
            <linearGradient id={`auri-belly-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2e8d1" />
              <stop offset="1" stopColor="#d2c1a0" />
            </linearGradient>
            <radialGradient id={`auri-iris-${uid}`} cx="0.35" cy="0.35" r="0.9">
              <stop offset="0" stopColor="#ffedb8" />
              <stop offset="0.55" stopColor="#eab25a" />
              <stop offset="1" stopColor="#c98a3c" />
            </radialGradient>
            <clipPath id={`auri-lid-l-${uid}`}>
              <circle cx="62" cy="84" r="15.5" />
            </clipPath>
            <clipPath id={`auri-lid-r-${uid}`}>
              <circle cx="98" cy="84" r="15.5" />
            </clipPath>
          </defs>

          {/* Body */}
          <ellipse cx="80" cy="126" rx="52" ry="46" fill={`url(#auri-body-${uid})`} />
          {/* Side shadows — soft depth where the wings rest */}
          <path d="M36 112 Q28 132 44 152 Q54 140 52 118 Z" fill="rgba(16,9,36,0.35)" />
          <path d="M124 112 Q132 132 116 152 Q106 140 108 118 Z" fill="rgba(16,9,36,0.35)" />
          {/* Belly */}
          <ellipse cx="80" cy="136" rx="30" ry="26" fill={`url(#auri-belly-${uid})`} opacity="0.95" />

          {/* Head — a state-driven tilt (curious lean) plus gaze rotation */}
          <motion.g
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              rotate: behavior.tilt
            }}
          >
            <motion.g
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                rotate: prefersReducedMotion ? 0 : headRotate
              }}
            >
              {/* Ear tufts */}
              <path d="M47 46 Q40 22 60 29 Q55 41 58 49 Z" fill={`url(#auri-head-${uid})`} />
              <path d="M113 46 Q120 22 100 29 Q105 41 102 49 Z" fill={`url(#auri-head-${uid})`} />
              {/* Crown rim light — a whisper of light from above */}
              <path
                d="M62 40 Q80 30 98 40"
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="46" fill={`url(#auri-head-${uid})`} />
              {/* Facial disks */}
              <circle cx="62" cy="86" r="25" fill={`url(#auri-disk-${uid})`} opacity="0.9" />
              <circle cx="98" cy="86" r="25" fill={`url(#auri-disk-${uid})`} opacity="0.9" />

              {/* Eyes */}
              <circle cx="62" cy="84" r="15" fill="#191231" />
              <circle cx="98" cy="84" r="15" fill="#191231" />
              <circle
                cx="62"
                cy="84"
                r="8.5"
                fill={`url(#auri-iris-${uid})`}
                opacity={behavior.sleeping ? 0.7 : 1}
              />
              <circle
                cx="98"
                cy="84"
                r="8.5"
                fill={`url(#auri-iris-${uid})`}
                opacity={behavior.sleeping ? 0.7 : 1}
              />

              {/* Pupils — share one gaze */}
              <motion.g
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  x: pupilX,
                  y: pupilY
                }}
              >
                <circle cx="62" cy="84" r="3.6" fill="#0d0818" />
                <circle cx="98" cy="84" r="3.6" fill="#0d0818" />
                <circle cx="60.2" cy="82.2" r="1.7" fill="#ffffff" opacity="0.9" />
                <circle cx="96.2" cy="82.2" r="1.7" fill="#ffffff" opacity="0.9" />
              </motion.g>

              {/* Eyelids — blink softly, clipped to the eyes; sleeping keeps
                  them closed */}
              <motion.g
                clipPath={`url(#auri-lid-l-${uid})`}
                initial={{ y: -34 }}
                animate={{ y: eyesClosed ? 0 : -34 }}
                transition={{ duration: 0.14, ease: "easeInOut" }}
              >
                <rect x="47" y="68" width="30" height="32" fill="#32255c" />
              </motion.g>
              <motion.g
                clipPath={`url(#auri-lid-r-${uid})`}
                initial={{ y: -34 }}
                animate={{ y: eyesClosed ? 0 : -34 }}
                transition={{ duration: 0.14, ease: "easeInOut" }}
              >
                <rect x="83" y="68" width="30" height="32" fill="#32255c" />
              </motion.g>

              {/* Beak */}
              <path d="M76 95 L80 107 L84 95 Q80 98.5 76 95 Z" fill="#d99a3e" />
            </motion.g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
