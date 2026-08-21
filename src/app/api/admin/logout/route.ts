/**
 * POST /api/admin/logout
 *
 * Clears the admin session cookie and redirects to the admin login page.
 */

import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin/auth";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
