"use client";

import { motion } from "framer-motion";

type LoaderRipplesProps = {
  /** When true the ripples appear, expanding outward from the core */
  visible?: boolean;
  /** When true the ripples scatter and fade during the dissolve */
  dissolving?: boolean;
};

/**
 * Concentric water-like rings — light behaving like memory.
 *
 * Three thin, luminous rings expand outward from the center, each slightly
 * delayed, creating an organic ripple effect. The rings are pure CSS border
 * animations — no JavaScript loops, no expensive filters.
 */
export default function LoaderRipples({ visible = false, dissolving = false }: LoaderRipplesProps) {
  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            dissolving
              ? { scale: 1.8, opacity: 0 }
              : {
                  scale: [0, 1, 1],
                  opacity: [0, 0.4, 0.15],
                }
          }
          transition={{
            duration: dissolving ? 0.8 : 3.5,
            delay: dissolving ? index * 0.1 : index * 0.6,
            ease: dissolving ? "easeOut" : [0.16, 1, 0.3, 1],
            repeat: dissolving ? 0 : Infinity,
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
