"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, label, select, textarea, [data-cursor]";

/** Primary CTAs get the special "entering WithIn" luminous state */
const CTA_SELECTOR = "[data-cta-entrance], .cta-entrance-glow";

/**
 * The animated cursor — a mood-tinted core dot with a trailing ring that
 * expands over interactive elements. Primary CTAs receive a luminous state
 * that feels like the environment acknowledging the visitor is about to enter.
 *
 * Safety rails: only mounts on fine pointers (never touch screens), never
 * plays under Reduced Motion, and the native cursor is deliberately left
 * visible so navigation always works even if the effect fails.
 */
export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isCTA, setIsCTA] = useState(false);

  // Core dot tracks the pointer exactly; the ring trails on a soft spring.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 140, damping: 16, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 140, damping: 16, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
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
      const isInteractive = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));
      const isCtaTarget = Boolean(target?.closest?.(CTA_SELECTOR));
      setHovering(isInteractive);
      setIsCTA(isCtaTarget);
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

  // Ring size scales based on context
  const ringSize = isCTA ? 56 : hovering ? 32 : 32;
  const ringScale = isCTA ? 1.6 : hovering ? 1.8 : 1;
  const coreScale = hovering ? 0.5 : 1;
  const glowOpacity = isCTA ? 0.4 : visible ? 0.22 : 0;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
      {/* Soft glow halo — CTA state is brighter and larger */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <motion.div
          animate={{
            scale: isCTA ? 2.2 : hovering ? 1.5 : 1,
            opacity: glowOpacity
          }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="rounded-full blur-sm"
          style={{
            width: isCTA ? 80 : 80,
            height: isCTA ? 80 : 80,
            marginLeft: isCTA ? -40 : -40,
            marginTop: isCTA ? -40 : -40,
            background: isCTA
              ? `radial-gradient(circle, rgba(var(--mood-rgb),0.6), rgba(var(--mood-rgb),0.15) 50%, transparent 70%)`
              : `radial-gradient(circle, rgba(var(--mood-rgb),0.5), transparent 65%)`
          }}
        />
      </motion.div>

      {/* Trailing ring — scales up on CTA for the "entering" moment */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <motion.div
          animate={{
            scale: ringScale,
            opacity: visible ? (isCTA ? 0.7 : 0.45) : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-full border"
          style={{
            width: ringSize,
            height: ringSize,
            marginLeft: -ringSize / 2,
            marginTop: -ringSize / 2,
            borderColor: isCTA
              ? `rgba(var(--mood-rgb),0.8)`
              : `rgba(var(--mood-rgb),0.55)`,
            boxShadow: isCTA
              ? `0 0 16px rgba(var(--mood-rgb),0.3)`
              : "none"
          }}
        />
      </motion.div>

      {/* Core dot */}
      <motion.div style={{ x, y }} className="absolute left-0 top-0">
        <motion.div
          animate={{ scale: coreScale, opacity: visible ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className="h-2 w-2 -ml-1 -mt-1 rounded-full bg-[rgba(var(--mood-rgb),0.9)] shadow-[0_0_12px_rgba(var(--mood-rgb),0.8)]"
        />
      </motion.div>
    </div>
  );
}
