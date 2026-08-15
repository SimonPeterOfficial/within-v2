import DepthLayers from "@/components/effects/DepthLayers";
import AppShell from "@/components/layout/AppShell";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import { UNIVERSE_NAV } from "@/lib/navigation";
import type { MeshPreset } from "@/components/effects/MeshGradient";

type UniverseShellProps = {
  children: React.ReactNode;
  /** Room atmosphere — defaults to the quiet sanctuary light */
  preset?: MeshPreset;
  /** Override nav items (rarely needed — pages usually ride the universe nav) */
  nav?: typeof UNIVERSE_NAV;
};

/**
 * The universe shell — the frame every corner of WithIn shares.
 *
 * One living atmosphere behind the page, the responsive sidebar navigation,
 * Auri resting in the corner, and the content. New pages (discover,
 * originals, books, music, photography, communities, creators, profile,
 * settings) render inside this shell so the whole universe feels like one
 * continuous place.
 */
export default function UniverseShell({ children, preset = "sanctuary", nav = UNIVERSE_NAV }: UniverseShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <DepthLayers preset={preset} particles={7} stars={16} fog={0.5} />
      <AppShell items={nav}>{children}</AppShell>
      <AuriOrb />
    </div>
  );
}
