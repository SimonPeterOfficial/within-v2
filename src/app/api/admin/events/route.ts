/**
 * GET /api/admin/events
 *
 * Operational diagnostics for the event outbox.
 *
 * Protected: requires a valid admin session.
 *
 * Returns bounded summaries — pending, completed, and failed event counts
 * plus the most recent failures — so an administrator can tell whether
 * event processing is healthy, whether failures are accumulating, and
 * whether processing has stalled.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";
import { validateAdminAuthConfig } from "@/lib/admin/auth";
import { db, outboxEvents } from "@/lib/db";
import { count, desc, eq } from "drizzle-orm";
import { runOnce } from "@/lib/events/worker";

async function getRecentFailures(): Promise<Array<{
  id: string;
  eventId: string;
  eventType: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  nextAttemptAt: Date | null;
  createdAt: Date;
}>> {
  const rows = await db
    .select({
      id: outboxEvents.id,
      eventId: outboxEvents.eventId,
      eventType: outboxEvents.eventType,
      attempts: outboxEvents.attempts,
      maxAttempts: outboxEvents.maxAttempts,
      lastError: outboxEvents.lastError,
      nextAttemptAt: outboxEvents.nextAttemptAt,
      createdAt: outboxEvents.createdAt,
    })
    .from(outboxEvents)
    .where(eq(outboxEvents.status, "failed"))
    .orderBy(desc(outboxEvents.createdAt))
    .limit(10);
  return rows;
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
      { status: 503 },
    );
  }

  const stats = await (async () => {
    const [pending, completed, failed] = await Promise.all([
      db.select({ count: count() }).from(outboxEvents).where(eq(outboxEvents.status, "pending")),
      db.select({ count: count() }).from(outboxEvents).where(eq(outboxEvents.status, "completed")),
      db.select({ count: count() }).from(outboxEvents).where(eq(outboxEvents.status, "failed")),
    ]);
    return {
      pending: Number(pending[0]?.count ?? 0),
      completed: Number(completed[0]?.count ?? 0),
      failed: Number(failed[0]?.count ?? 0),
    };
  })();

  const recentFailures = await getRecentFailures();

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    stats,
    recentFailures: recentFailures.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      eventType: r.eventType,
      attempts: r.attempts,
      maxAttempts: r.maxAttempts,
      lastError: r.lastError,
      nextAttemptAt: r.nextAttemptAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/admin/events/process
 *
 * Run one batch of outbox events on demand.
 *
 * Protected: requires a valid admin session.
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!sessionCookie?.value) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }
  const session = await verifyAdminSession(sessionCookie.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }

  try {
    validateAdminAuthConfig();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Admin authentication is not configured." },
      { status: 503 },
    );
  }

  const result = await runOnce();

  return NextResponse.json({
    ok: true,
    processed: result.processed,
    completed: result.completed,
    failed: result.failed,
    errors: result.errors,
  });
}
