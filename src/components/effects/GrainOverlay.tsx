/**
 * GrainOverlay — the film over the dream.
 *
 * One feather-light SVG noise layer blended soft-light across the whole
 * viewport. It adds material (the way celluloid has a texture) without ever
 * reading as static. Purely decorative: pointer-events-none, aria-hidden,
 * sits above backgrounds and below chrome (nav and cursor outrank it).
 *
 * The texture is an inline data-URI — no image dependency. Intensity is
 * governed by --within-grain-opacity and --atmos-grain (time of day quiets
 * it at night, the light theme dims it).
 */
export default function GrainOverlay() {
  return <div aria-hidden className="grain-overlay" />;
}
