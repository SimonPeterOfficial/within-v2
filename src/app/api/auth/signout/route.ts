/**
 * POST /api/auth/signout
 *
 * Destroys the server-side session cookie — a real logout, not a redirect.
 */

import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/auth/server";

export async function POST() {
  await destroyUserSession();
  return NextResponse.json({ ok: true });
}