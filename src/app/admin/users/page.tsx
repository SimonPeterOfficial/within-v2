import UserTable from "@/components/admin/UserTable";
import { getRealUsers } from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users: Awaited<ReturnType<typeof getRealUsers>> = [];
  let error: string | null = null;

  try {
    users = await getRealUsers(100);
  } catch {
    error = "Unable to load users right now.";
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Users
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        User Management
      </h2>
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <UserTable
          users={users.map((user) => ({
            ...user,
            contentCount: Number(user.contentCount),
            followerCount: Number(user.followerCount),
          }))}
        />
      )}
    </div>
  );
}
