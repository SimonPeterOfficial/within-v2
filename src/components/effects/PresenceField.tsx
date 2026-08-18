"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Non-interactive elements that should never trigger a ripple.
 * Everything else in atmospheric space can receive the water drop.
 */
const INTERACTIVE =
  "a, button, input, textarea, select, summary, [role='button'], [tabindex]:not([tabindex='-1']), nav, header, footer";

/**
 * PresenceField — the invisible field that makes the environment breathe
 * around the visitor.
 *
 * Responsibilities:
 * 1. Track pointer → set `--px` / `--py` CSS vars (0–1 range) on :root
 * 2. Track scroll → set `--scroll-depth` CSS var (0–1 range) on :root
 * 3. Click non-interactive space → create organic water ripple
 * 4. Hover primary CTA → add entrance glow class
 *
 * Zero React state churn. All driven by direct DOM manipulation + CSS vars.
 * Off on touch devices and under Reduced Motion.
 */
export default function PresenceField() {
  const prefersReducedMotion = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === "undefined") return;

    // Only on fine pointers (not touch)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    enabledRef.current = true;

    const root = document.documentElement;
    let frame = 0;

    // ── Pointer tracking ──
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--px", `${event.clientX / window.innerWidth}`);
        root.style.setProperty("--py", `${event.clientY / window.innerHeight}`);
      });
    };

    // ── Scroll depth tracking ──
    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      root.style.setProperty("--scroll-depth", `${Math.min(1, Math.max(0, depth))}`);
    };

    // ── Ripple on atmospheric click ──
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      // Never ripple over interactive elements
      if (target.closest(INTERACTIVE)) return;

      // Create the ripple container (reuses existing DOM element if present)
      const container = rootRef.current;
      if (!container) return;

      // Create ripple element
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;

      // Create second wave for organic feel
      const ripple2 = document.createElement("div");
      ripple2.className = "ripple animate-2";
      ripple2.style.left = `${event.clientX}px`;
      ripple2.style.top = `${event.clientY}px`;

      container.appendChild(ripple);
      container.appendChild(ripple2);

      // Trigger animation
      requestAnimationFrame(() => {
        ripple.classList.add("animate");
      });

      // Clean up after animation
      setTimeout(() => {
        ripple.remove();
        ripple2.remove();
      }, 1400);
    };

    // ── CTA entrance glow ──
    const CTA_SELECTOR = '[data-cta-entrance]';
    let ctaGlowActive = false;

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const cta = target?.closest?.(CTA_SELECTOR);
      if (cta && !ctaGlowActive) {
        ctaGlowActive = true;
        // Find the nearest section and dim the atmosphere slightly
        const section = cta.closest("section");
        if (section) {
          section.style.setProperty("--cta-glow", "1");
        }
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      const relatedTarget = event.relatedTarget as Element | null;
      if (!relatedTarget?.closest?.(CTA_SELECTOR) && ctaGlowActive) {
        ctaGlowActive = false;
        const sections = document.querySelectorAll("section");
        sections.forEach((s) => s.style.removeProperty("--cta-glow"));
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    // Initialize scroll depth
    onScroll();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [prefersReducedMotion]);

  // Render a hidden container for ripple elements + presence memory stars
  return <div ref={rootRef} aria-hidden className="pointer-events-none fixed inset-0 z-[4]" />;
}
