"use client";

import { motion } from "framer-motion";
import React from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * ConnectionLine — a visual path between two related nodes.
 *
 * Drawn as a thin, glowing stroke between two points in the constellation.
 * When both endpoints are "active" (on the user's path), the line brightens.
 * Reduced motion keeps it still.
 */
type ConnectionLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
};

export default function ConnectionLine({ x1, y1, x2, y2, active }: ConnectionLineProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <motion.div
      style={{
        left: `${midX}%`,
        top: `${midY}%`,
        transform: `rotate(${angle}deg) translate(-50%, -50%)`,
      }}
      whileHover={{
        scaleY: 1.15,
        transition: { type: "spring", stiffness: 300, damping: 24 },
      }}
      className={`
        absolute w-[${length}px] h-[1px]
        ${active
          ? "bg-[linear-gradient(90deg,rgba(var(--mood-rgb),0.6)_0%,rgba(var(--mood-rgb),0.2)_100%)] shadow-[0_0_12px_rgba(var(--mood-rgb),0.4)]"
          : "bg-white/[0.12]"}
        pointer-events-none
        transition-all duration-500
        ${prefersReducedMotion ? "opacity-40" : "opacity-0 group-hover:opacity-100"}
      `}
    />
  );
}
