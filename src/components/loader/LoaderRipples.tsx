"use client";

import { motion } from "framer-motion";

type LoaderRipplesProps = {
  visible?: boolean;
  dissolving?: boolean;
  reduced?: boolean;
};

/**
 * Concentric water-like rings — light behaving like memory.
 *
 * For reduced motion: static rings that fade in once (no infinite animation).
 */
export default function LoaderRipples({ visible = false, dissolving = false, reduced = false }: LoaderRipplesProps) {
  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            reduced
              ? { scale: 1, opacity: 0.2 - index * 0.05 }
              : dissolving
                ? { scale: 1.8, opacity: 0 }
                : {
                    scale: [0, 1, 1],
                    opacity: [0, 0.4, 0.15],
                  }
          }
          transition={{
            duration: reduced ? 0.5 : dissolving ? 0.8 : 3.5,
            delay: reduced ? index * 0.15 : dissolving ? index * 0.1 : index * 0.6,
            ease: dissolving ? "easeOut" : [0.16, 1, 0.3, 1],
            repeat: reduced ? 0 : dissolving ? 0 : Infinity,
            repeatDelay: 1.2,
          }}
          className="absolute h-24 w-24 rounded-full border border-white/[0.08]"
          style={{
            boxShadow: `0 0 20px rgba(var(--mood-rgb), 0.1)`,
          }}
        />
      ))}
    </div>
  );
}
