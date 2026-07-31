"use client";

import { motion, useReducedMotion } from "framer-motion";
import { hoverGlow, hoverLift } from "@/lib/animations";

type HoverableProps = {
  children: React.ReactNode;
  className?: string;
  /** Lift distance in pixels */
  lift?: number;
  /** Whether a mood-tinted glow should wake beneath the content */
  glow?: boolean;
};

/**
 * Reusable hover micro-interaction — children lift toward the cursor while a
 * mood-tinted bloom wakes beneath them. Uses explicit animation targets so it
 * composes safely inside stagger containers and variant trees.
 */
export default function Hoverable({
  children,
  className = "",
  lift = 5,
  glow = true
}: HoverableProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={hoverLift(lift)}
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      whileHover="show"
      className={`relative ${className}`}
    >
      {glow && (
        <motion.span
          aria-hidden
          variants={hoverGlow()}
          initial={{ boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
          animate={{ boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
          whileHover="show"
          className="pointer-events-none absolute inset-0 rounded-full"
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
