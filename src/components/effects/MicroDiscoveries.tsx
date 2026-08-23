"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";

/**
 * MicroDiscoveries — extremely subtle environmental interactions.
 *
 * These are NOT buttons. They are not UI elements.
 * They are tiny moments of life in the background:
 *   - A constellation star that moves when hovered
 *   - A background star that responds to pointer proximity
 *   - A quiet region that reveals a tiny glyph
 *   - A word that becomes a doorway
 *
 * These should be:
 *   - rare (only 1-2 per page)
 *   - optional (non-blocking, no interaction required)
 *   - accessible (keyboard alternatives exist)
 *   - beautiful (they reward curiosity)
 *
 * Do NOT turn the UI into an escape room.
 * The user should discover them naturally.
 */

const GLYPHS = ["·", "✦", "◎", "⟡", "⬡", "✧"];

type MicroDiscovery = {
  id: string;
  x: number;
  y: number;
  glyph: string;
  destination?: string;
  message?: string;
};

function generateDiscoveries(count: number): MicroDiscovery[] {
  // Deterministic positions based on current hour
  const hour = new Date().getHours();
  const discoveries: MicroDiscovery[] = [];
  
  for (let i = 0; i < count; i++) {
    const seed = (hour * 7 + i * 13) % 100;
    discoveries.push({
      id: `micro-${i}`,
      x: 10 + (seed * 7) % 80,
      y: 15 + (seed * 11) % 70,
      glyph: GLYPHS[i % GLYPHS.length],
      destination: i === 0 ? "/between" : undefined,
      message: i === 0 ? "You found something." : undefined,
    });
  }
  
  return discoveries;
}

function StarParticle({
  discovery,
  prefersReducedMotion,
}: {
  discovery: MicroDiscovery;
  prefersReducedMotion: boolean;
}) {
  const [nearby, setNearby] = useState(false);
  const [activated, setActivated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      setNearby(dist < 120);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: nearby ? 0.5 : 0.1 }}
      transition={{ duration: 1 }}
      className="pointer-events-auto absolute"
      style={{ left: `${discovery.x}%`, top: `${discovery.y}%` }}
    >
      {discovery.destination ? (
        <a
          href={discovery.destination}
          onClick={() => {
            fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
            setActivated(true);
          }}
          className="block rounded-full p-1 transition-transform duration-300 hover:scale-150"
          aria-label={discovery.message ?? "Hidden discovery"}
        >
          <span className="text-[8px] text-white/40">{discovery.glyph}</span>
        </a>
      ) : (
        <span className="text-[8px] text-white/20">{discovery.glyph}</span>
      )}

      {/* Message on activation */}
      <AnimatePresence>
        {activated && discovery.message && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] italic text-white/25"
          >
            {discovery.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MicroDiscoveries() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [discoveries] = useState(() => generateDiscoveries(2));

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {discoveries.map((d) => (
        <div key={d.id} className="pointer-events-auto">
          <StarParticle discovery={d} prefersReducedMotion={prefersReducedMotion} />
        </div>
      ))}
    </div>
  );
}
