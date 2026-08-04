"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees */
  maxTilt?: number;
  /** Makes the card announce itself as clickable (role button, keyboard access) */
  onClick?: () => void;
  ariaLabel?: string;
  /** Optional identifier used to restore focus after a dialog closes */
  dataPortalTrigger?: string;
};

/**
 * Reusable 3D tilt — cards lean toward the cursor on springs.
 * Opt-in keyboard access via `onClick` (Enter/Space triggers it).
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  onClick,
  ariaLabel,
  dataPortalTrigger
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionSafe();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 200,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 200,
    damping: 20
  });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const interactiveProps = onClick
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": ariaLabel,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }
      }
    : {};

  return (
    <motion.div
      ref={ref}
      data-portal-trigger={dataPortalTrigger}
      onMouseMove={prefersReducedMotion ? undefined : handleMove}
      onMouseLeave={prefersReducedMotion ? undefined : reset}
      onClick={onClick}
      style={{
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformPerspective: 1000
      }}
      className={className}
      {...interactiveProps}
    >
      {children}
    </motion.div>
  );
}
