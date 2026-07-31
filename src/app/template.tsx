"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { fadeIn, pageTransition } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={prefersReducedMotion ? fadeIn : pageTransition}
        initial={prefersReducedMotion ? { opacity: 0 } : "hidden"}
        animate="show"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
