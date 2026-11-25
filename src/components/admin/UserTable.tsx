"use client";

import { useState } from "react";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActiveAt: string | null;
  contentCount: number;
  followerCount: number;
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10",
  suspended: "text-rose-400 bg-rose-400/10",
  deleted: "text-gray-500 bg-gray-500/10",
};

const ROLE_STYLES: Record<string, string> = {
  user: "text-gray-400",
  creator: "text-emerald-400",
  moderator: "text-amber-400",
  admin: "text-purple-400",
  super_admin: "text-fuchsia-400",
};

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

/** Real user table — fed by getRealUsers(), never a mock array. */
export default function UserTable({ users }: { users: AdminUserRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-white/[0.15] focus:bg-white/[0.05]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 outline-none transition focus:border-white/[0.15]"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="creator">Creators</option>
          <option value="moderator">Moderators</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-8 text-center text-sm text-gray-500">
          No users match this view.
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Last Active</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Content</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Followers</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-[11px] text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium capitalize ${ROLE_STYLES[user.role] ?? "text-gray-400"}`}>{user.role.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[user.status] ?? "text-gray-400 bg-gray-400/10"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{shortDate(user.joinedAt)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{shortDate(user.lastActiveAt)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{user.contentCount}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{user.followerCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filtered.map((user) => (
              <div key={user.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-[11px] text-gray-500">{user.email}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[user.status] ?? "text-gray-400 bg-gray-400/10"}`}>
                    {user.status}
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] text-gray-500">
                  <span className={`capitalize ${ROLE_STYLES[user.role] ?? "text-gray-400"}`}>{user.role.replace("_", " ")}</span>
                  <span>Joined {shortDate(user.joinedAt)}</span>
                  <span>{user.contentCount} content</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
