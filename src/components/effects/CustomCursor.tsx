"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, label, select, textarea, [data-cursor]";

/**
 * The animated cursor — a mood-tinted core dot with a trailing ring that
 * expands over interactive elements.
 *
 * Safety rails: only mounts on fine pointers (never touch screens), never
 * plays under Reduced Motion, and the native cursor is deliberately left
 * visible so navigation always works even if the effect fails. Purely
 * decorative — `aria-hidden` and `pointer-events-none`.
 */
export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Core dot tracks the pointer exactly; the ring trails on a soft spring.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 140, damping: 16, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 140, damping: 16, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // Deferred (async) so the set-state-in-effect rule stays satisfied while
    // keeping SSR HTML identical to the first client pass.
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE_SELECTOR)));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
      {/* Soft glow halo — a pool of mood light that trails the ring */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <motion.div
          animate={{ scale: hovering ? 1.5 : 1, opacity: visible ? 0.22 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="-ml-10 -mt-10 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.5),transparent_65%)] blur-sm"
        />
      </motion.div>

      {/* Trailing ring */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <motion.div
          animate={{ scale: hovering ? 1.8 : 1, opacity: visible ? 0.45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-[rgba(var(--mood-rgb),0.55)]"
        />
      </motion.div>

      {/* Core dot */}
      <motion.div style={{ x, y }} className="absolute left-0 top-0">
        <motion.div
          animate={{ scale: hovering ? 0.5 : 1, opacity: visible ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-[rgba(var(--mood-rgb),0.9)] shadow-[0_0_12px_rgba(var(--mood-rgb),0.8)]"
        />
      </motion.div>
    </div>
  );
}
