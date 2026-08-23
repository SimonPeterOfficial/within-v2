"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Route atmosphere — each destination in WithIn has a different feel.
 * The system sets a data-route attribute on <html> so CSS can respond
 * with subtle atmosphere changes: mesh gradient shifts, aurora intensity,
 * grain levels, and glow colors.
 *
 * This is NOT a visual transition — it is an environmental shift.
 * The page content fades in via the existing PageTransition component.
 */
const ROUTE_ATMOSPHERE: Record<string, { mesh: string; aurora: string; glow: string }> = {
  "/home": { mesh: "home", aurora: "1", glow: "rgba(168,85,247,0.45)" },
  "/explore": { mesh: "sanctuary", aurora: "1.1", glow: "rgba(34,211,238,0.4)" },
  "/within": { mesh: "sanctuary", aurora: "0.8", glow: "rgba(99,102,241,0.5)" },
  "/journey": { mesh: "home", aurora: "0.9", glow: "rgba(139,92,246,0.45)" },
  "/sanctuary": { mesh: "sanctuary", aurora: "0.85", glow: "rgba(120,110,180,0.4)" },
  "/originals": { mesh: "originals", aurora: "1.05", glow: "rgba(109,40,217,0.45)" },
  "/music": { mesh: "music", aurora: "1", glow: "rgba(34,211,238,0.4)" },
  "/books": { mesh: "books", aurora: "0.9", glow: "rgba(217,176,120,0.35)" },
  "/photography": { mesh: "sanctuary", aurora: "1", glow: "rgba(251,146,60,0.35)" },
  "/communities": { mesh: "communities", aurora: "1.05", glow: "rgba(52,211,153,0.4)" },
  "/creators": { mesh: "sanctuary", aurora: "1", glow: "rgba(52,211,153,0.4)" },
  "/between": { mesh: "sanctuary", aurora: "0.6", glow: "rgba(80,80,140,0.35)" },
};

const DEFAULT_ATMOSPHERE = { mesh: "home", aurora: "1", glow: "rgba(168,85,247,0.45)" };

export default function RouteAtmosphere() {
  const pathname = usePathname();
  const prevRoute = useRef(pathname);

  useEffect(() => {
    // Find the matching route (exact match or prefix for dynamic routes)
    const route = Object.keys(ROUTE_ATMOSPHERE).find(
      (r) => pathname === r || (r !== "/" && pathname.startsWith(r))
    );
    const atm = ROUTE_ATMOSPHERE[route ?? ""] ?? DEFAULT_ATMOSPHERE;

    const html = document.documentElement;

    // Set route data for CSS consumption
    html.setAttribute("data-route", atm.mesh);

    // Smooth atmosphere transition — only if route actually changed
    if (prevRoute.current !== pathname) {
      html.style.setProperty("--mood-atmo-scale", "0.98");
      const timer = setTimeout(() => {
        html.style.setProperty("--mood-atmo-scale", "1");
      }, 300);
      prevRoute.current = pathname;
      return () => clearTimeout(timer);
    }

    prevRoute.current = pathname;
  }, [pathname]);

  return null;
}
