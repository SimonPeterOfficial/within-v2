"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type ParallaxProps = {
  children: ReactNode;
  /** Pixel distance the content drifts as it scrolls through the viewport */
  offset?: number;
  className?: string;
};

/** Wraps children in a subtle scroll-linked parallax transform. */
export default function Parallax({ children, offset = 80, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y: prefersReducedMotion ? 0 : y }} className={className}>
      {children}
    </motion.div>
  );
}
