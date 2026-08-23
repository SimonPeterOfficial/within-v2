"use client";

import { useEffect, useRef } from "react";

/**
 * BREATH — the ambient pulse of WithIn.
 *
 * A subtle environmental system that makes the universe feel alive:
 *
 * 1. MOUSE PRESENCE: The mesh gradient shifts toward the cursor position,
 *    creating the feeling that light is following the visitor.
 *
 * 2. SCROLL DEPTH: As the user scrolls deeper, the atmosphere subtly
 *    deepens — aurora intensifies, grain adjusts, and stars shift.
 *
 * 3. IDLE BREATHING: When the user stops interacting, the environment
 *    begins a slow, organic breathing cycle — atmospheric layers gently
 *    pulse like a sleeping organism.
 *
 * 4. INTERACTION WAKE: When the user moves again after idle, the
 *    atmosphere "wakes" — a brief brightening that settles back.
 *
 * All driven by CSS custom properties — GPU-friendly, no layout thrash.
 * Respects prefers-reduced-motion via the PresenceField system.
 */
export default function Breath() {
  const breathRef = useRef(0);
  const idleRef = useRef(true);
  const lastInteractionRef = useRef(0);
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const html = document.documentElement;

    // ── Scroll depth tracking ──
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const depth = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      html.style.setProperty("--scroll-depth", String(depth));
    };

    // ── Mouse presence — mesh shift toward cursor ──
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      html.style.setProperty("--px", String(x));
      html.style.setProperty("--py", String(y));

      // Wake from idle
      if (idleRef.current) {
        idleRef.current = false;
        html.setAttribute("data-breath", "awake");
        // Settle back after a moment
        clearTimeout(breathRef.current);
        breathRef.current = window.setTimeout(() => {
          html.setAttribute("data-breath", "idle");
          idleRef.current = true;
        }, 5000);
      }

      lastInteractionRef.current = Date.now();
    };

    // ── Idle breathing — organic atmospheric pulse ──
    let breathPhase = 0;
    const breathe = () => {
      if (!idleRef.current) return;
      breathPhase += 0.02;
      const intensity = 0.5 + Math.sin(breathPhase) * 0.15;
      html.style.setProperty("--breath-intensity", String(intensity));
    };

    // Initialize timestamp inside effect (pure)
    lastInteractionRef.current = Date.now();

    // Start breathing interval when idle
    const checkIdle = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;
      if (elapsed > 8000 && !idleRef.current) {
        idleRef.current = true;
        html.setAttribute("data-breath", "idle");
      }
    }, 2000);

    breathTimerRef.current = setInterval(breathe, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll(); // Initial value

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(checkIdle);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      clearTimeout(breathRef.current);
    };
  }, []);

  return null;
}
