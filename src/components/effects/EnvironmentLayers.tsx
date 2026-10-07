"use client";

import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * EnvironmentLayers — the living digital world behind the interface.
 *
 * Thirteen conceptual layers composed into a spatial environment:
 *   01 sky → 02 atmosphere → 03 clouds → 04 architecture →
 *   05 islands → 06 towers → 07 waterfalls → 08 landscape →
 *   09 gardens → 10 foreground → 11 water → 12 glass → 13 auri
 *
 * Each layer is pure CSS — no JS animation, no canvas, no WebGL.
 * The world breathes through CSS custom properties and keyframes.
 * Reduced motion preserves the design without movement.
 *
 * The layers create perceived distance through:
 * - scale (distant elements are smaller)
 * - opacity (distant elements are more transparent)
 * - blur (distant elements are softer)
 * - contrast (distant elements have less contrast)
 * - lighting (distant elements are dimmer)
 * - overlap (near elements cover far elements)
 */
export default function EnvironmentLayers() {
  const prefersReducedMotion = useReducedMotionSafe();

  if (prefersReducedMotion) {
    return (
      <div aria-hidden className="spatial-layer z-world">
        <div className="env-sky" />
        <div className="env-atmosphere" />
        <div className="env-landscape" />
        <div className="env-water" />
      </div>
    );
  }

  return (
    <div aria-hidden className="spatial-layer z-world">
      {/* Layer 01 — Distant Sky (farthest, most transparent) */}
      <div className="env-sky" />
      {/* Layer 02 — Atmospheric Gradient */}
      <div className="env-atmosphere" />
      {/* Layer 03 — Distant Clouds (slow-moving) */}
      <div className="env-clouds" />
      {/* Layer 04 — Distant Architecture (far-off structures) */}
      <div className="env-architecture" />
      {/* Layer 05 — Floating Islands (the world's landmasses) */}
      <div className="env-islands">
        <div className="env-isle env-isle-1" />
        <div className="env-isle env-isle-2" />
        <div className="env-isle env-isle-3" />
      </div>
      {/* Layer 06 — Towers & Structures (vertical elements) */}
      <div className="env-towers" />
      {/* Layer 07 — Waterfalls (vertical light streams) */}
      <div className="env-waterfalls">
        <div className="env-waterfall env-waterfall-1" />
        <div className="env-waterfall env-waterfall-2" />
        <div className="env-waterfall env-waterfall-3" />
      </div>
      {/* Layer 08 — Middle-Ground Landscape (the horizon) */}
      <div className="env-landscape" />
      {/* Layer 09 — Gardens & Vegetation (living foreground) */}
      <div className="env-gardens">
        <div className="env-garden env-garden-1" />
        <div className="env-garden env-garden-2" />
        <div className="env-garden env-garden-3" />
      </div>
      {/* Layer 10 — Foreground Surfaces (the immediate environment) */}
      <div className="env-foreground" />
      {/* Layer 11 — Reflective Water (the world's mirror) */}
      <div className="env-water" />
      {/* Layer 12 — Glass UI (the interface material) */}
      <div className="env-glass" />
      {/* Layer 13 — Auri Halo (the intelligence presence) */}
      <div className="env-auri">
        <div className="env-auri-halo" />
      </div>
    </div>
  );
}
