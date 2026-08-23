"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * ScrollProgress — a tiny luminous line at the top of the viewport.
 *
 * Not a generic progress bar. A whisper of light that shows how far
 * through the current page the user has traveled. Uses the mood color
 * so it feels part of the atmosphere, not a utility.
 *
 * Invisible at 0% and 100%. Appears briefly during scroll.
 */
export default function ScrollProgress() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [progress, setProgress] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      setProgress(p);
      setScrolling(true);

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setScrolling(false), 1500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  if (prefersReducedMotion) return null;

  // Hide at start and end
  if (progress < 0.01 || progress > 0.99) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: scrolling ? 1 : 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        background: `linear-gradient(90deg, rgba(var(--mood-rgb), 0.6) 0%, rgba(var(--mood-rgb), 0.9) ${progress * 100}%, transparent ${progress * 100}%)`,
        boxShadow: scrolling ? "0 0 8px rgba(var(--mood-rgb), 0.3)" : "none",
      }}
      aria-hidden
    />
  );
}
