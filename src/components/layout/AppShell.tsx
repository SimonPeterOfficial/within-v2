import Sidebar, { type SidebarItem } from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import CommandPalette from "@/components/layout/CommandPalette";
import WorldTransition from "@/components/within/crystal/WorldTransition";
import ThreadObserver from "@/components/universe/ThreadObserver";
import AuriGuide from "@/components/universe/AuriGuide";
import WorldScape from "@/components/effects/WorldScape";
import AmbientLight from "@/components/effects/AmbientLight";
import AuriContextualPresence from "@/components/auri/AuriContextualPresence";

/** Re-exported so shell consumers can type their nav items in one import. */
export type { SidebarItem } from "@/components/layout/Sidebar";

type AppShellProps = {
  items: SidebarItem[];
  children: React.ReactNode;
  /** "calm" quiets the environment (Sanctuary, Mirror, Messages) */
  atmosphere?: "world" | "calm";
};

/**
 * The application shell of the Crystal World.
 *
 * One painted world rendered behind everything — the floating-city
 * environment the interface reveals through liquid glass. Navigation
 * floats inside the atmosphere. `atmosphere="calm"` softens the world
 * for the quiet rooms (Sanctuary, Mirror, Messages).
 *
 * WorldScape is the hand-built SVG scene; AmbientLight adds living
 * luminance. The world is visible immediately — the interface exists
 * INSIDE it, not on top of it.
 */
export default function AppShell({ items, children, atmosphere = "world" }: AppShellProps) {
  const calm = atmosphere === "calm";
  return (
    <div className={`${calm ? "crystal-world-calm" : "crystal-world"} relative min-h-screen`}>
      <WorldScape />
      <EnvironmentFade calm={calm} />
      <AmbientLight />
      <WorldTransition />
      <Sidebar items={items} />
      <BottomNav />
      <CommandPalette />
      <ThreadObserver />
      <AuriGuide />
      <AuriContextualPresence />
      <div className="relative z-10 pb-20 lg:pb-0 lg:pl-[228px]">
        <main id="main">{children}</main>
      </div>
    </div>
  );
}

/**
 * The calm rooms quiet the world — the scene recedes so presence and
 * speech can hold the room. Implemented with a soft white veil rather
 * than unmounting the world, so the atmosphere never disappears.
 */
function EnvironmentFade({ calm }: { calm: boolean }) {
  if (!calm) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] bg-white/40 backdrop-blur-[2px]"
    />
  );
}
