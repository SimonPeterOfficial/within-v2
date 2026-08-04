"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Strength of the pull (0–1) */
  strength?: number;
};

/**
 * Premium magnetic interaction — wrapped elements gravitate toward the cursor
 * and spring back on leave. Wrap a styled <a> or <button> inside.
 */
export default function Magnetic({
  children,
  className = "",
  strength = 0.3
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionSafe();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: prefersReducedMotion ? 0 : sx, y: prefersReducedMotion ? 0 : sy }}
      onMouseMove={prefersReducedMotion ? undefined : handleMove}
      onMouseLeave={
        prefersReducedMotion
          ? undefined
          : () => {
              x.set(0);
              y.set(0);
            }
      }
    >
      {children}
    </motion.div>
  );
}
