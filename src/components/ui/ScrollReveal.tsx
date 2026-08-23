"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { ease, durations } from "@/lib/design";

type ScrollRevealProps = {
  children: React.ReactNode;
  /** Direction of the reveal: up (default), down, left, right, or scale */
  direction?: "up" | "down" | "left" | "right" | "scale";
  /** Delay in seconds before the reveal starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** How far the element travels before settling (px) */
  distance?: number;
  /** Trigger threshold — what % of the element must be visible */
  threshold?: number;
  /** CSS class to add */
  className?: string;
};

const DIRECTION_MAP = {
  up: { x: 0, y: 24, scale: 1 },
  down: { x: 0, y: -24, scale: 1 },
  left: { x: 24, y: 0, scale: 1 },
  right: { x: -24, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.95 },
};

/**
 * ScrollReveal — elements emerge from atmosphere as you scroll.
 *
 * Uses IntersectionObserver for zero-cost scroll detection.
 * Respects prefers-reduced-motion. Pure CSS transform + opacity.
 * No layout thrash, no jank.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = durations.base,
  distance = 24,
  threshold = 0.15,
  className = "",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(() => prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const dir = DIRECTION_MAP[direction];
  const travel = direction === "scale" ? dir : { x: dir.x * (distance / 24), y: dir.y * (distance / 24), scale: dir.scale };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: travel.x, y: travel.y, scale: travel.scale }}
      animate={
        isVisible
          ? { opacity: 1, x: 0, y: 0, scale: 1 }
          : { opacity: 0, x: travel.x, y: travel.y, scale: travel.scale }
      }
      transition={{ duration, delay, ease: ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
