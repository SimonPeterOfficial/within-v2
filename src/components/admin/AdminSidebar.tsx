"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "Users", href: "/admin/users", icon: "users" },
      { label: "Creators", href: "/admin/creators", icon: "sparkles" },
      { label: "Content", href: "/admin/content", icon: "book" },
      { label: "Communities", href: "/admin/communities", icon: "heart" },
      { label: "Moderation", href: "/admin/moderation", icon: "shield" },
      { label: "Reports", href: "/admin/moderation", icon: "alert" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
      { label: "Engagement", href: "/admin/analytics", icon: "heart" },
      { label: "Growth", href: "/admin/analytics", icon: "star" },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Subscriptions", href: "/admin", icon: "refresh" },
      { label: "Creator Earnings", href: "/admin/creators", icon: "play" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Auri", href: "/admin/auri", icon: "sparkles" },
      { label: "Settings", href: "/admin/settings", icon: "settings" },
      { label: "Feature Flags", href: "/admin/features", icon: "flag" },
      { label: "Audit Log", href: "/admin/audit", icon: "search" },
    ],
  },
];

export default function AdminSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.04]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-emerald-500 text-xs font-bold text-white">
            W
          </div>
          <div>
            <span className="text-sm font-semibold text-white">WithIn</span>
            <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.label + item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-white/[0.07] text-white border border-white/[0.06]"
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
                        }`}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          className={isActive ? "text-emerald-400" : "text-gray-500"}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            <span>←</span>
            Back to WithIn
          </Link>
        </div>
      </aside>
    </>
  );
}
