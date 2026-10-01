"use client";

/**
 * AmbientLight — the world's illumination.
 *
 * Three soft light sources that compose into the environmental lighting.
 * They are pure CSS — blurred radial gradients that create the sense of
 * light coming from different directions. No JS, no canvas.
 */
export default function AmbientLight() {
  return (
    <div aria-hidden className="spatial-layer">
      <div className="ambient-light ambient-light-1" />
      <div className="ambient-light ambient-light-2" />
      <div className="ambient-light ambient-light-3" />
    </div>
  );
}
