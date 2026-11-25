import OverviewDashboard from "@/components/admin/OverviewDashboard";

/**
 * Admin Dashboard — the Command Center.
 *
 * Metrics and activity come from the protected /api/admin/data endpoint,
 * which reads live platform state from the database.
 */
export default function AdminPage() {
  return <OverviewDashboard />;
}
