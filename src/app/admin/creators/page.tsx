import { getRealUsers } from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  let creators: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
    contentCount: number;
    followerCount: number;
  }> = [];
  let error: string | null = null;

  try {
    const users = await getRealUsers(200);
    creators = users
      .filter((u) => u.role === "creator" || Number(u.contentCount) > 0)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        joinedAt: u.joinedAt,
        contentCount: Number(u.contentCount),
        followerCount: Number(u.followerCount),
      }))
      .sort((a, b) => b.contentCount - a.contentCount);
  } catch {
    error = "Couldn't load creators. Try again shortly.";
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Creators
      </p>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Creator Management
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        People with creator accounts or at least one content item.
      </p>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : creators.length === 0 ? (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-8 text-center text-sm text-gray-500">
          No creators yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{creator.name}</p>
                  <p className="truncate text-[11px] text-gray-500">{creator.email}</p>
                </div>
                <span className="inline-flex rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium capitalize text-gray-300">
                  {creator.role}
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-[11px] text-gray-500">
                <span>{creator.contentCount} items</span>
                <span>{creator.followerCount} followers</span>
              </div>
              <p className="mt-3 text-[10px] text-gray-600">Joined {creator.joinedAt.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
