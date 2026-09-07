/**
 * GET /api/admin/verify
 *
 * Lightweight endpoint to verify the admin session is still valid.
 * Used by AdminGuard as a client-side safety net.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await verifyAdminSession(sessionCookie.value);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
