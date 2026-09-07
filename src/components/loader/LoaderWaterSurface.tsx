"use client";

import { motion } from "framer-motion";

type LoaderWaterSurfaceProps = {
  visible?: boolean;
  dissolving?: boolean;
  reduced?: boolean;
};

/**
 * The dark water surface — concentric rings expand across an invisible surface
 * below the core light.
 *
 * For reduced motion: static ellipses that fade in once.
 */
export default function LoaderWaterSurface({ visible = false, dissolving = false, reduced = false }: LoaderWaterSurfaceProps) {
  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            reduced
              ? { scale: 1, opacity: 0.15 - index * 0.03 }
              : dissolving
                ? { scale: 2, opacity: 0 }
                : {
                    scale: [0, 0.8 + index * 0.15, 1 + index * 0.1],
                    opacity: [0, 0.25 - index * 0.04, 0.12 - index * 0.02],
                  }
          }
          transition={{
            duration: reduced ? 0.4 : dissolving ? 0.8 : 2.4,
            delay: reduced ? index * 0.08 : dissolving ? index * 0.06 : index * 0.42,
            ease: dissolving ? "easeOut" : [0.16, 1, 0.3, 1],
            repeat: reduced ? 0 : dissolving ? 0 : Infinity,
            repeatDelay: 1.2,
          }}
          className="absolute rounded-full border border-white/[0.06]"
          style={{
            width: 120 + index * 60,
            height: 40 + index * 15,
            transform: `translateY(${20 + index * 8}px)`,
            boxShadow: index === 0 ? "0 0 30px rgba(var(--mood-rgb), 0.08)" : "none",
          }}
        />
      ))}
    </div>
  );
}
