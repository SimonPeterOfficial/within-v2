"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";

/**
 * Dreamy page transition — each route blurs sharp into focus as it rises.
 * Used by app/template.tsx so every navigation feels like waking into the
 * next scene. Respects Reduced Motion via MotionConfig at the root.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
