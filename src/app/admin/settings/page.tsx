import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Check = { label: string; value: string; ok: boolean | null };

async function databaseStatus(): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export default async function SettingsPage() {
  const dbOk = await databaseStatus();

  const checks: Check[] = [
    { label: "Environment", value: process.env.NODE_ENV ?? "unknown", ok: null },
    { label: "Database", value: dbOk ? "connected" : "unreachable", ok: dbOk },
    {
      label: "Clerk",
      value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "configured" : "not configured",
      ok: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    },
    {
      label: "Clerk webhook secret",
      value: process.env.CLERK_WEBHOOK_SECRET ? "configured" : "not configured",
      ok: Boolean(process.env.CLERK_WEBHOOK_SECRET),
    },
    {
      label: "Admin password",
      value: process.env.ADMIN_PASSWORD ? "configured" : "using development fallback",
      ok: Boolean(process.env.ADMIN_PASSWORD),
    },
  ];

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Settings
      </p>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Platform Settings
      </h2>
      <p className="mb-8 text-sm text-gray-500">
        Read-only operational state. Settings that need persistence live in the
        database and are changed through their own flows — not from here. No
        secrets are shown.
      </p>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="space-y-4">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-300">{check.label}</span>
              <span
                className={`inline-flex items-center gap-2 text-[12px] font-medium ${
                  check.ok === null
                    ? "text-gray-400"
                    : check.ok
                      ? "text-emerald-400"
                      : "text-amber-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    check.ok === null
                      ? "bg-gray-500"
                      : check.ok
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                  }`}
                />
                {check.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
