/**
 * GET /api/admin/health
 *
 * System health summary for the admin command centre.
 *
 * Protected: requires a valid admin session.
 * Reports database connectivity and configuration readiness without
 * exposing secrets, connection strings, or internal credentials.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";
import { validateAdminAuthConfig } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count } from "drizzle-orm";

async function checkDatabaseHealth(): Promise<{
  reachable: boolean;
  userCount: number | null;
  error: string | null;
}> {
  try {
    const result = await db.select({ count: count() }).from(users);
    return { reachable: true, userCount: Number(result[0]?.count ?? 0), error: null };
  } catch (err) {
    return {
      reachable: false,
      userCount: null,
      error: err instanceof Error ? err.message : "Unknown database error.",
    };
  }
}

export async function GET() {
  // Admin authorization — server-side session check.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!sessionCookie?.value) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }
  const session = await verifyAdminSession(sessionCookie.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }

  // Fail closed if admin auth is not configured.
  try {
    validateAdminAuthConfig();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Admin authentication is not configured." },
      { status: 503 }
    );
  }

  const dbHealth = await checkDatabaseHealth();

  const healthy = dbHealth.reachable;

  return NextResponse.json({
    ok: true,
    status: healthy ? "healthy" : "degraded",
    checkedAt: new Date().toISOString(),
    checks: {
      database: {
        status: dbHealth.reachable ? "healthy" : "critical",
        reachable: dbHealth.reachable,
        userCount: dbHealth.userCount,
        error: dbHealth.error,
      },
      configuration: {
        status: "healthy",
        adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
        sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
      },
    },
  });
}
