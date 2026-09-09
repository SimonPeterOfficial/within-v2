"use client";

import { useEffect, useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";

/**
 * GravityPool — a small pool of lights that fall toward your cursor.
 * Real physics: velocity, gravity, damping, soft walls. The sky reacts to
 * attention — move through it and the stars lean toward you. Under the
 * hood: one requestAnimationFrame loop while the cursor is inside; the
 * bodies live in state so React renders every frame they move.
 */

type Body = { x: number; y: number; vx: number; vy: number; hue: string; size: number };

const BODY_HUES = ["#c4b5fd", "#67e8f9", "#f0abfc", "#fde68a", "#6ee7b7"];

function makeBodies(): Body[] {
  return Array.from({ length: 14 }, (_, i) => ({
    x: 20 + ((i * 37) % 60),
    y: 15 + ((i * 53) % 70),
    vx: 0,
    vy: 0,
    hue: BODY_HUES[i % BODY_HUES.length],
    size: 2 + (i % 3),
  }));
}

export default function GravityPool() {
  const poolRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [bodies, setBodies] = useState<Body[]>(makeBodies);

  // One rAF loop, started on pointer enter, stopped on leave/unmount.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const pool = poolRef.current;
      if (!pool) return 0;
      const { width, height } = pool.getBoundingClientRect();
      const pointer = pointerRef.current;

      setBodies((current) =>
        current.map((b) => {
          const next = { ...b };
          if (pointer) {
            const dx = pointer.x - next.x;
            const dy = pointer.y - next.y;
            const dist = Math.max(Math.hypot(dx, dy), 8);
            const g = 340 / (dist * dist);
            next.vx += (dx / dist) * g;
            next.vy += (dy / dist) * g;
          }
          // Soft walls — the pool holds its stars.
          if (next.x < 6) next.vx += 0.4;
          if (next.x > 94) next.vx -= 0.4;
          if (next.y < 6) next.vy += 0.4;
          if (next.y > 94) next.vy -= 0.4;
          next.vx *= 0.985;
          next.vy *= 0.985;
          next.x += (next.vx * 100) / Math.max(width, 1);
          next.y += (next.vy * 100) / Math.max(height, 1);
          return next;
        })
      );
      return requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const stop = () => cancelAnimationFrame(frame);
    const move = (event: PointerEvent) => {
      const pool = poolRef.current;
      if (!pool) return;
      const rect = pool.getBoundingClientRect();
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
    };

    const pool = poolRef.current;
    pool?.addEventListener("pointerenter", start);
    pool?.addEventListener("pointerleave", stop);
    pool?.addEventListener("pointermove", move);
    return () => {
      stop();
      pool?.removeEventListener("pointerenter", start);
      pool?.removeEventListener("pointerleave", stop);
      pool?.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="sparkles"
        title="Gravity Pool"
        line="Fourteen small lights, real gravity. Move your cursor through them."
      />

      <div
        ref={poolRef}
        className="relative mt-6 min-h-[190px] flex-1 cursor-crosshair overflow-hidden rounded-2xl border border-white/[0.05] bg-[#04030c]"
      >
        {/* Pool glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 60%, rgba(109,40,217,0.12), transparent 65%)",
          }}
        />
        {bodies.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size * 2,
              height: bodies[i].size * 2,
              background: b.hue,
              boxShadow: `0 0 ${b.size * 4}px ${b.hue}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        <p className="pointer-events-none absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.25em] text-gray-600">
          Attention has mass
        </p>
      </div>
    </GlassCard>
  );
}
