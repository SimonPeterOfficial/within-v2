"use client";

import { useState } from "react";
import { MOCK_USERS } from "@/lib/admin/data";

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10",
  inactive: "text-gray-400 bg-gray-400/10",
  suspended: "text-rose-400 bg-rose-400/10",
};

const ROLE_STYLES: Record<string, string> = {
  user: "text-gray-400",
  creator: "text-emerald-400",
  admin: "text-purple-400",
};

export default function UserTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Search + filters */}
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
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Joined</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Last Active</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Moods</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{user.avatar}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 text-sm font-medium capitalize ${ROLE_STYLES[user.role]}`}>{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px] text-gray-400">{user.joinedAt}</td>
                <td className="px-4 py-3 text-[13px] text-gray-400">{user.lastActiveAt}</td>
                <td className="px-4 py-3 text-[13px] text-gray-400">{user.moodCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {filtered.map((user) => (
          <div key={user.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{user.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-[11px] text-gray-500">{user.email}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[user.status]}`}>
                {user.status}
              </span>
            </div>
            <div className="flex gap-4 text-[11px] text-gray-500">
              <span className={`capitalize ${ROLE_STYLES[user.role]}`}>{user.role}</span>
              <span>Joined {user.joinedAt}</span>
              <span>{user.moodCount} moods</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
