"use client";

import { motion } from "framer-motion";

type LoaderWaterSurfaceProps = {
  visible?: boolean;
  dissolving?: boolean;
};

/**
 * The dark water surface — concentric rings expand across an invisible surface
 * below the core light. The surface should feel like dark water reflecting
 * cosmic light. Pure CSS border animations, no expensive filters.
 */
export default function LoaderWaterSurface({ visible = false, dissolving = false }: LoaderWaterSurfaceProps) {
  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Water surface — multiple concentric ellipses, perspective-shifted */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            dissolving
              ? { scale: 2, opacity: 0 }
              : {
                  scale: [0, 0.8 + index * 0.15, 1 + index * 0.1],
                  opacity: [0, 0.25 - index * 0.04, 0.12 - index * 0.02],
                }
          }
          transition={{
            duration: dissolving ? 1 : 4,
            delay: dissolving ? index * 0.08 : index * 0.8,
            ease: dissolving ? "easeOut" : [0.16, 1, 0.3, 1],
            repeat: dissolving ? 0 : Infinity,
            repeatDelay: 2,
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
