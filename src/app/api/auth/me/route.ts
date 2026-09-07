/**
 * GET /api/auth/me
 *
 * Resolves the current session to a user — called on every client mount so
 * the UI restores real identity (not localStorage) after a refresh.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/server";
import type { AuthSession } from "@/lib/auth/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date(user.createdAt).getTime(),
    },
    token: "session",
    createdAt: Date.now(),
  };
  return NextResponse.json({ ok: true, session });
}