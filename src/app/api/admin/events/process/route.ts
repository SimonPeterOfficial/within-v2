/**
 * POST /api/admin/events/process
 *
 * Processes pending outbox events by dispatching them to registered
 * handlers. Intended to be invoked on demand (e.g. by a cron job or admin
 * action) to drive the event loop: recorded events are picked up, delivered
 * to their handlers, and marked completed or failed accordingly.
 *
 * Rate limited to prevent abuse. Only an authenticated admin may trigger it.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { processBatch } from "@/lib/events/outbox";
import { requireUser } from "@/lib/auth/server";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 30 process-batch calls per hour per IP
  const clientKey = clientKeyFrom(request);
  const rateResult = await rateLimit(`admin:events:process:${clientKey}`, 30, 60 * 60 * 1000);
  if (!rateResult.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Only admins can trigger event processing.
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  if (!user.role || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  try {
    const result = await processBatch();
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      completed: result.completed,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[EVENTS PROCESS] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "An error occurred while processing events." },
      { status: 500 }
    );
  }
}
