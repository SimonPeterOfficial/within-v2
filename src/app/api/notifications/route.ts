/**
 * /api/notifications — the caller's notification queue.
 *   GET  — the newest notifications + unread count
 *   POST — mark everything seen
 *
 * Owner-scoped at the query level; there is no cross-user read.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { countUnread, listNotifications, markAllNotificationsSeen } from "@/lib/notifications";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const [entries, unread] = await Promise.all([
    listNotifications(user.id),
    countUnread(user.id),
  ]);

  return NextResponse.json({ ok: true, entries, unread });
}

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  await markAllNotificationsSeen(user.id);
  return NextResponse.json({ ok: true });
}
