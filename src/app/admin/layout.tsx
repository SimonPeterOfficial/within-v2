import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AdminGuard from "@/components/admin/AdminGuard";

/**
 * Admin layout — structurally separate from the public WithIn experience.
 *
 * PROTECTION LAYERS:
 *   1. Middleware (src/middleware.ts) — server-side cookie check for role
 *   2. AdminGuard (this wrapper) — client-side session + role verification
 *   3. AdminShell — the chrome (sidebar + topbar)
 *
 * Unauthorized visitors are redirected to /login before they see any
 * admin content. The middleware catches non-admin requests at the edge;
 * AdminGuard provides a client-side safety net for session expiration
 * and role changes.
 */
export const metadata: Metadata = {
  title: "WithIn — Command Center",
  description: "WithIn administrative dashboard — secure control center for platform management.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06060c] text-white">
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </div>
  );
}
