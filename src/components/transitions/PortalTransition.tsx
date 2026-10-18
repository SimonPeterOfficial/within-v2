"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import WithinMark from "@/components/ui/WithinMark";
import { durations, ease } from "@/lib/design";

/**
 * PortalTransition — the WithIn signature experience.
 *
 * Instead of pages swapping instantly (isolated screens), navigating between
 * destinations feels like crossing a threshold. When a user clicks a nav
 * item, the aperture mark scales up to become a portal frame that frames
 * the entering destination, then dissolves — creating spatial continuity,
 * not mechanical page replacement.
 *
 * The overlay is keyed by pathname so each route change re-triggers the
 * entrance. Reduced motion is respected: the portal collapses to a simple
 * cross-fade when the user prefers less motion.
 */
export default function PortalTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">(
    "closed"
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    // Defer the initial state change so it is not set synchronously within
    // the effect body (avoids cascading renders flagged by set-state-in-effect).
    const openTimer = setTimeout(() => setPhase("opening"), 0);
    const t1 = setTimeout(() => setPhase("open"), durations.fast);
    const t2 = setTimeout(() => setPhase("closing"), durations.base);
    const t3 = setTimeout(() => setPhase("closed"), durations.base + durations.fast);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, prefersReducedMotion]);

  const scale = phase === "open" ? 1 : phase === "opening" ? 0.55 : 0.35;
  const opacity = phase === "closed" ? 0 : phase === "opening" ? 0.6 : 0.85;

  return (
    <AnimatePresence>
      {phase !== "closed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durations.fast, ease: ease.standard }}
          className="fixed inset-0 z-[99] bg-[#040407] flex items-center justify-center"
        >
          {/* The portal frame — aperture mark scaling from nav size to full-screen threshold */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale,
              opacity,
              filter: phase === "open" ? "blur(0px)" : "blur(12px)",
            }}
            exit={{ scale: 1.15, opacity: 0, filter: "blur(24px)" }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
            }}
            className="relative"
          >
            <WithinMark
              variant="mark"
              size={Math.round(phase === "open" ? 260 : 96)}
              className="drop-shadow-[0_0_56px_rgba(var(--mood-rgb),0.45)]"
            />
          </motion.div>
        </motion.div>
      )}
      {children}
    </AnimatePresence>
  );
}
