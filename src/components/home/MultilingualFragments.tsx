"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * MultilingualFragments — fragments of humanity existing inside WithIn.
 *
 * Short phrases in ~16 languages drift subtly through the hero atmosphere.
 * They appear faintly, some near the edges, some briefly visible. They feel
 * like whispers of belonging scattered across the universe — not a language
 * interface, but evidence that people from everywhere are already here.
 *
 * Each fragment has a fixed position (deterministic) and a gentle drift
 * animation. Reduced Motion shows them static.
 */

type Fragment = {
  text: string;
  lang: string;
  /** Position as percentage of viewport */
  x: number;
  y: number;
  /** Animation delay in seconds */
  delay: number;
  /** Drift distance in pixels */
  drift: number;
  /** Duration in seconds */
  duration: number;
  /** Opacity target */
  opacity: number;
};

const FRAGMENTS: Fragment[] = [
  { text: "Tu appartiens ici", lang: "fr", x: 8, y: 18, delay: 0.5, drift: 12, duration: 18, opacity: 0.12 },
  { text: "Hay más dentro", lang: "es", x: 82, y: 22, delay: 1.2, drift: -10, duration: 20, opacity: 0.1 },
  { text: "Descubra-se", lang: "pt", x: 12, y: 72, delay: 2.0, drift: 8, duration: 22, opacity: 0.09 },
  { text: "Sii te stesso", lang: "it", x: 78, y: 68, delay: 0.8, drift: -14, duration: 19, opacity: 0.11 },
  { text: "Sei nicht allein", lang: "de", x: 5, y: 45, delay: 1.8, drift: 6, duration: 21, opacity: 0.08 },
  { text: "ここにいる", lang: "ja", x: 88, y: 42, delay: 0.3, drift: -8, duration: 17, opacity: 0.13 },
  { text: "당신은 혼자가 아니에요", lang: "ko", x: 15, y: 85, delay: 2.5, drift: 10, duration: 23, opacity: 0.08 },
  { text: "你在这里", lang: "zh", x: 75, y: 82, delay: 1.5, drift: -6, duration: 20, opacity: 0.1 },
  { text: "أنت هنا", lang: "ar", x: 90, y: 15, delay: 0.7, drift: -12, duration: 18, opacity: 0.11 },
  { text: "Uko hapa", lang: "sw", x: 8, y: 55, delay: 2.2, drift: 8, duration: 24, opacity: 0.07 },
  { text: "आप यहाँ हैं", lang: "hi", x: 85, y: 55, delay: 1.0, drift: -10, duration: 19, opacity: 0.09 },
  { text: "Είσαι εδώ", lang: "el", x: 20, y: 30, delay: 1.7, drift: 6, duration: 21, opacity: 0.08 },
  { text: "Buradasın", lang: "tr", x: 72, y: 35, delay: 0.4, drift: -8, duration: 20, opacity: 0.1 },
  { text: "Je bent hier", lang: "nl", x: 25, y: 88, delay: 2.8, drift: 12, duration: 22, opacity: 0.07 },
  { text: "Hic sunt", lang: "la", x: 65, y: 12, delay: 1.3, drift: -6, duration: 18, opacity: 0.12 },
  { text: "There is more within", lang: "en", x: 50, y: 90, delay: 3.0, drift: 4, duration: 25, opacity: 0.06 },
];

export default function MultilingualFragments() {
  const prefersReducedMotion = useReducedMotionSafe();

  const fragments = useMemo(() => FRAGMENTS, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {fragments.map((fragment, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : fragment.drift * 0.3 }}
          animate={
            prefersReducedMotion
              ? { opacity: fragment.opacity * 0.6 }
              : {
                  opacity: [0, fragment.opacity, fragment.opacity * 0.7, fragment.opacity],
                  y: [fragment.drift * 0.3, 0, -fragment.drift * 0.3, fragment.drift * 0.3],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 2, delay: fragment.delay }
              : {
                  duration: fragment.duration,
                  delay: fragment.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="absolute whitespace-nowrap font-display text-[11px] font-medium tracking-[0.15em] italic"
          style={{
            left: `${fragment.x}%`,
            top: `${fragment.y}%`,
            opacity: fragment.opacity,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {fragment.text}
        </motion.span>
      ))}
    </div>
  );
}
