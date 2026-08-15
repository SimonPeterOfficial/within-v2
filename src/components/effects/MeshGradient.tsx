export type MeshPreset =
  | "home"
  | "sanctuary"
  | "music"
  | "books"
  | "communities"
  | "originals";

type MeshGradientProps = {
  /** Which room's atmosphere this layer carries */
  preset?: MeshPreset;
  className?: string;
};

/**
 * MeshGradient — layered, heavily blurred light sources that drift like
 * northern lights seen through deep water. Extremely slow movement, low
 * intensity, pure CSS (no animation loop, no JS). Each environment preset
 * mixes its own lights; opacity is tuned by --atmos-mesh so the hour and
 * future weather can reshape the room. Reduced motion stills the drift.
 */
export default function MeshGradient({ preset = "home", className = "" }: MeshGradientProps) {
  return <div aria-hidden className={`mesh-gradient mesh-${preset} ${className}`} />;
}
