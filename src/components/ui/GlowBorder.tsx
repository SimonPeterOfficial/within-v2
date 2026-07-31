"use client";

import { motion, useReducedMotion } from "framer-motion";

type GlowBorderProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Animated conic-gradient glow border. The gradient ring stays hidden by default
 * and awakens when the wrapped content is hovered, creating a premium portal edge.
 */
export default function GlowBorder({ children, className = "" }: GlowBorderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`group/glow relative overflow-hidden rounded-card p-px ${className}`}>
      <motion.div
        aria-hidden
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-[150%] opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168, 85, 247, 0.75), rgba(52, 211, 153, 0.75), rgba(168, 85, 247, 0.1), rgba(52, 211, 153, 0.75), rgba(168, 85, 247, 0.75))"
        }}
      />
      <div className="relative rounded-[calc(1.5rem-1px)] bg-[#050505]/90">{children}</div>
    </div>
  );
}
