"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MemoryRipple — the signature WithIn interaction.
 *
 * When the user interacts with meaningful content (choosing a mood, saving
 * content, entering Sanctuary, discovering a creator), a very subtle ripple
 * travels through the surrounding interface. It should feel like the
 * environment responded — not like an animation that was triggered.
 *
 * The ripple is a single expanding ring that fades from the interaction
 * point. It's extremely subtle: low opacity, slow expansion, no jarring
 * colors. Pure transform/opacity animation.
 *
 * USAGE:
 *   Dispatch a custom event "within:memory-ripple" with detail { x, y }
 *   from any component that wants to trigger the effect.
 *
 *   window.dispatchEvent(new CustomEvent("within:memory-ripple", {
 *     detail: { x: event.clientX, y: event.clientY }
 *   }));
 */

type Ripple = {
  id: number;
  x: number;
  y: number;
};

const RIPPLE_EVENT = "within:memory-ripple";
const MAX_RIPPLES = 3;
const RIPPLE_DURATION = 2000;

export default function MemoryRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const addRipple = useCallback((x: number, y: number) => {
    const id = nextId.current++;
    setRipples((prev) => {
      const next = [...prev, { id, x, y }];
      // Keep only the most recent ripples
      return next.length > MAX_RIPPLES ? next.slice(-MAX_RIPPLES) : next;
    });

    // Auto-remove after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, RIPPLE_DURATION);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ x: number; y: number }>;
      if (customEvent.detail) {
        addRipple(customEvent.detail.x, customEvent.detail.y);
      }
    };

    window.addEventListener(RIPPLE_EVENT, handler);
    return () => window.removeEventListener(RIPPLE_EVENT, handler);
  }, [addRipple]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[6]">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              border: "1px solid rgba(var(--mood-rgb), 0.15)",
              background: "radial-gradient(circle, rgba(var(--mood-rgb), 0.04) 0%, transparent 70%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
