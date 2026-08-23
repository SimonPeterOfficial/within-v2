"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * PULSE — the exploration trail.
 *
 * As the user moves through WithIn, tiny luminous dots appear at their
 * cursor position and slowly fade. Over time, this creates a personal
 * constellation of where they've wandered — a visual memory of their
 * journey through the universe.
 *
 * The dots are ephemeral — they live for 3 seconds then dissolve.
 * They use the mood color so they feel part of the atmosphere.
 * They never interfere with interaction (pointer-events: none).
 * They respect reduced motion.
 *
 * This is the signature WithIn interaction: the user's presence
 * leaves a beautiful trace that fades like breath on glass.
 */
export default function PulseTrail() {
  const prefersReducedMotion = useReducedMotionSafe();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number; birth: number; alpha: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI canvas
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Get mood color from CSS custom property
    const getMoodColor = () => {
      const style = getComputedStyle(document.documentElement);
      const rgb = style.getPropertyValue("--mood-rgb").trim() || "168, 85, 247";
      return rgb;
    };

    let lastX = 0;
    let lastY = 0;
    let lastSpawn = 0;

    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);

      // Only spawn a dot if the cursor moved enough and enough time passed
      if (dist > 15 && now - lastSpawn > 60) {
        pointsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          birth: now,
          alpha: 1,
        });
        lastX = e.clientX;
        lastY = e.clientY;
        lastSpawn = now;

        // Keep the trail short — max 30 points
        if (pointsRef.current.length > 30) {
          pointsRef.current.shift();
        }
      }
    };

    const draw = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const moodRgb = getMoodColor();

      pointsRef.current = pointsRef.current.filter((p) => {
        const age = now - p.birth;
        const lifespan = 3000; // 3 seconds
        if (age > lifespan) return false;

        // Fade in for first 200ms, then fade out
        const fadeIn = Math.min(age / 200, 1);
        const fadeOut = 1 - (age / lifespan);
        p.alpha = fadeIn * fadeOut * 0.6;

        if (p.alpha <= 0) return false;

        const radius = 2 + (1 - age / lifespan) * 2;

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${moodRgb}, ${p.alpha * 0.1})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[3]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
