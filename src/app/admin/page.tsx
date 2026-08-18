import OverviewDashboard from "@/components/admin/OverviewDashboard";

/**
 * Admin Dashboard — the Command Center.
 *
 * This is currently a UI foundation only.
 * All data is mock/local — clearly structured for future API integration.
 *
 * ARCHITECTURE NOTE:
 *   This page should eventually be server-rendered with data fetched
 *   from a protected API endpoint. The mock data in src/lib/admin/data.ts
 *   mirrors what a real API would return.
 */
export default function AdminPage() {
  return <OverviewDashboard />;
}
