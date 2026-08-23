"use client";

import { useCallback, useRef, type MouseEvent } from "react";

/**
 * GlowTrail — a hook that makes any element respond to cursor position
 * with a soft luminous gradient that follows the pointer.
 *
 * Usage:
 *   const glowProps = useGlowTrail();
 *   <div {...glowProps} className="relative overflow-hidden rounded-card ...">
 *     ...content...
 *   </div>
 *
 * The effect is CSS-only (CSS custom properties) — no re-renders, no layout
 * thrash. Works on both desktop and tablet. Disabled on touch devices via
 * the existing pointer-light system.
 *
 * This is the signature WithIn interaction: every card feels like it
 * contains a small light that responds to your presence.
 */
export function useGlowTrail() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glow-x", `${x}%`);
    el.style.setProperty("--glow-y", `${y}%`);
    el.style.setProperty("--glow-opacity", "1");
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: {
      "--glow-x": "50%",
      "--glow-y": "50%",
      "--glow-opacity": "0",
    } as React.CSSProperties,
  };
}

/**
 * GlowTrailCard — a pre-built card wrapper with the glow trail effect.
 * Drop-in replacement for any card that should feel alive.
 */
export function GlowTrailCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, onMouseMove, onMouseLeave, style } = useGlowTrail();

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`glow-trail-card ${className}`}
      style={style}
    >
      {/* The glow — a radial gradient that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle 200px at var(--glow-x) var(--glow-y), rgba(var(--mood-rgb), 0.08), transparent 70%)",
          opacity: "var(--glow-opacity, 0)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
