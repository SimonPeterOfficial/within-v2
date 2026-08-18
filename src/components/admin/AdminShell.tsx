"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

/**
 * AdminShell — the chrome around every admin page.
 *
 * Desktop: persistent sidebar + content area.
 * Mobile: collapsible sidebar overlay + topbar.
 *
 * DESIGN DIRECTION:
 *   Precise. Calm. Powerful. Structured. Professional.
 *   "WithIn behind the curtain."
 *   Same brand, different posture from the consumer experience.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — persistent on desktop, overlay on mobile */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
