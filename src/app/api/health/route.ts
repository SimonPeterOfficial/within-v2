/**
 * GET /api/health
 *
 * Readiness probe. Reports liveness plus a real database ping so deployments
 * can distinguish "the app renders" from "the world is connected." No
 * secrets, no internal details — just status.
 */

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export async function GET() {
  let database: "ok" | "unreachable" = "ok";
  try {
    // Lazy import: the db client throws a clear error when DATABASE_URL is
    // missing — that is a "not ready" answer, not a crash.
    const { db } = await import("@/lib/db");
    await db.execute(sql`select 1`);
  } catch {
    database = "unreachable";
  }

  const healthy = database === "ok";
  return NextResponse.json(
    { ok: healthy, database, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
