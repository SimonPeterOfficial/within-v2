"use client";

import { MotionConfig } from "framer-motion";

/**
 * Route template — wraps every page with Reduced Motion configuration.
 *
 * Route transitions are owned exclusively by PortalTransition (in layout.tsx),
 * which animates the aperture mark as a shared threshold between source and
 * destination. PageTransition (blur-up) was removed because it competed with
 * PortalTransition on every navigation; having two independent systems animate
 * the same route change caused races and conflicting exit/entry states.
 *
 * PortalTransition remains the single owner of normal-navigation transitions.
 * The cinematic loader (EntranceProvider + CinematicLoader) owns the initial
 * entrance only on the landing page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
