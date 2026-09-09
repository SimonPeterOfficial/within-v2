import AppShell from "@/components/layout/AppShell";
import AuriOrb from "@/components/sanctuary/AuriOrb";
import { UNIVERSE_NAV } from "@/lib/navigation";
import type { MeshPreset } from "@/components/effects/MeshGradient";

type UniverseShellProps = {
  children: React.ReactNode;
  /** Preset kept for API compatibility — maps to the calm/cosmos atmosphere */
  preset?: MeshPreset;
  /** Override nav items (rarely needed — pages usually ride the universe nav) */
  nav?: typeof UNIVERSE_NAV;
};

/**
 * The universe shell — the frame every corner of WithIn shares.
 *
 * ULTRA GEN 10: the old stacked DepthLayers are replaced by the single
 * WithinEnvironment — one coherent atmospheric world that every page
 * floats inside. The `preset` prop is preserved so existing pages keep
 * compiling; sanctuary/photography presets calm the room.
 */
export default function UniverseShell({ children, preset = "sanctuary", nav = UNIVERSE_NAV }: UniverseShellProps) {
  const calm = preset === "sanctuary" || preset === "books";
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <AppShell items={nav} atmosphere={calm ? "calm" : "world"}>
        {children}
      </AppShell>
      <AuriOrb />
    </div>
  );
}
