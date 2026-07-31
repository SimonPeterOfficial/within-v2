"use client";

import { motion, useReducedMotion } from "framer-motion";
import GradientText from "@/components/ui/GradientText";

/** Cinematic loading veil for the sanctuary route. */
export default function Loading() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white">
      <div className="relative h-24 w-24">
        <motion.span
          aria-hidden
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1, 1.35, 1], opacity: [0.45, 0.85, 0.45] }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[rgba(var(--mood-rgb),0.25)] blur-soft"
        />
        <motion.span
          aria-hidden
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-3 flex items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-2xl"
          style={{ boxShadow: "0 0 40px rgba(var(--mood-rgb),0.5)" }}
        >
          ✦
        </motion.span>
      </div>
      <motion.p
        animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400"
      >
        Entering <GradientText>WithIn</GradientText>…
      </motion.p>
    </div>
  );
}
