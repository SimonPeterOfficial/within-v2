import Sidebar, { type SidebarItem } from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import CommandPalette from "@/components/layout/CommandPalette";
import WorldEnvironment from "@/components/within/crystal/WorldEnvironment";
import WorldTransition from "@/components/within/crystal/WorldTransition";
import ThreadObserver from "@/components/universe/ThreadObserver";
import AuriGuide from "@/components/universe/AuriGuide";

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
 * One luminous environment rendered behind everything — the world the
 * interface reveals through transparent crystal layers. Navigation floats
 * inside the atmosphere. `atmosphere="calm"` softens the world for the
 * quiet rooms (Sanctuary, Mirror, Messages).
 */
export default function AppShell({ items, children, atmosphere = "world" }: AppShellProps) {
  const calm = atmosphere === "calm";
  return (
    <div className={`${calm ? "crystal-world-calm" : "crystal-world"} relative min-h-screen`}>
      <WorldEnvironment variant={calm ? "calm" : "world"} />
      <WorldTransition />
      <Sidebar items={items} />
      <BottomNav />
      <CommandPalette />
      <ThreadObserver />
      <AuriGuide />
      <div className="relative z-10 pb-20 lg:pb-0 lg:pl-[216px]">
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
