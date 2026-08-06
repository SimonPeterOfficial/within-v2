import Sidebar, { type SidebarItem } from "@/components/layout/Sidebar";

/** Re-exported so shell consumers can type their nav items in one import. */
export type { SidebarItem } from "@/components/layout/Sidebar";

type AppShellProps = {
  items: SidebarItem[];
  children: React.ReactNode;
};

/**
 * The authenticated navigation shell — the responsive sidebar plus a content
 * column that clears the rail on desktop. Pages hand it their nav items and
 * children; the shell owns the frame so every authenticated surface shares
 * the same navigation language.
 */
export default function AppShell({ items, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar items={items} />
      <div className="lg:pl-24">
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
