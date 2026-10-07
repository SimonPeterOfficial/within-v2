/**
 * POST /api/admin/change-password
 *
 * Authenticated admins can rotate the admin password. Verifies the current
 * password (DB override or env fallback), then writes a fresh scrypt hash
 * to the credentials table. Rate limited.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE, verifyAdminCredentials } from "@/lib/admin/auth";
import { setDbAdminPassword } from "@/lib/admin/credentials";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const clientKey = clientKeyFrom(request);
  const limited = rateLimit(`admin-change-password:${clientKey}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Too many attempts." }, { status: 429 });
  }

  const store = await cookies();
  const session = await verifyAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value ?? "");
  if (!session?.authenticated) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.currentPassword || typeof body.newPassword !== "string" || body.newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Current password and a new password (8+ characters) are required." },
      { status: 400 }
    );
  }

  if (!(await verifyAdminCredentials(body.currentPassword))) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 401 });
  }

  await setDbAdminPassword(body.newPassword);
  return NextResponse.json({ ok: true });
}
