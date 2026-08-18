import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout — structurally separate from the public WithIn experience.
 *
 * ARCHITECTURE:
 *   Admin UI (this layout)
 *     ↓
 *   Admin Auth (future: middleware + session check)
 *     ↓
 *   Role Check (future: verify admin role)
 *     ↓
 *   Server Action / API
 *     ↓
 *   Database
 *
 * This is currently a UI/architecture foundation.
 * No real authentication or authorization is implemented here.
 */
export const metadata: Metadata = {
  title: "WithIn — Command Center",
  description: "WithIn administrative dashboard — UI foundation for future backend integration.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06060c] text-white">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
