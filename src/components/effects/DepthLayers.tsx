import GlowBackground from "@/components/effects/GlowBackground";
import AuroraBackground from "@/components/effects/AuroraBackground";
import LightRays from "@/components/effects/LightRays";
import ParticleField from "@/components/effects/ParticleField";
import StarField from "@/components/sanctuary/StarField";
import FogLayer from "@/components/effects/FogLayer";
import MeshGradient, { type MeshPreset } from "@/components/effects/MeshGradient";

type DepthLayersProps = {
  /** Which room's mesh atmosphere this world carries */
  preset?: MeshPreset;
  /** How many drifting particles (lower = quieter) */
  particles?: number;
  /** How many twinkling stars (lower = quieter) */
  stars?: number;
  /** Whether the volumetric light rays should play */
  rays?: boolean;
  /** Fog density 0–1 (a whisper by default) */
  fog?: number;
  className?: string;
};

/**
 * The canonical WithIn atmosphere stack — glow → aurora → light rays →
 * particles → stars, all pointer-events-none and reactive to the live mood.
 * One component replaces hand-rolled layer stacks so depth stays consistent
 * everywhere and never distracts.
 */
export default function DepthLayers({
  preset = "home",
  particles = 12,
  stars = 24,
  rays = true,
  fog = 0.6,
  className = ""
}: DepthLayersProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden contain-strict ${className}`}>
      <GlowBackground variant="ambient" />
      <FogLayer intensity={fog} />
      <MeshGradient preset={preset} />
      <AuroraBackground />
      {rays && <LightRays />}
      <ParticleField count={particles} seed={11} />
      <StarField count={stars} seed={3} />
      {/* Time atmosphere — Auri sets html[data-time] and the hour answers
          with a whisper of light (dawn warmth, deep night) over the whole world */}
      <div aria-hidden className="time-glow" />
    </div>
  );
}
