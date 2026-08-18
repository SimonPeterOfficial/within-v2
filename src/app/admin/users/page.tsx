import UserTable from "@/components/admin/UserTable";

export default function UsersPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Users
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        User Management
      </h2>
      <UserTable />
    </div>
  );
}
