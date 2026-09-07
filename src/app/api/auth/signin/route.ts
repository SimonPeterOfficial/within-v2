/**
 * POST /api/auth/signin
 *
 * Verifies credentials server-side (scrypt, timing-safe), rejects
 * suspended/deleted accounts, and starts an httpOnly session.
 * The same error is returned for unknown email and wrong password — the
 * endpoint never reveals which accounts exist.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users, type User } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createUserSession, touchUserActivity } from "@/lib/auth/server";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";
import type { AuthSession } from "@/lib/auth/types";

function toAuthUser(user: User): AuthSession["user"] {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: new Date(user.createdAt).getTime(),
  };
}

export async function POST(request: Request) {
  const limited = rateLimit(`signin:${clientKeyFrom(request)}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  const valid = user ? await verifyPassword(password, user.passwordSalt, user.passwordHash) : false;
  if (!user || !valid) {
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }

  if (user.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "This account is not active. Contact support for help." },
      { status: 403 },
    );
  }

  await createUserSession(user);
  await touchUserActivity(user.id);

  return NextResponse.json({
    ok: true,
    session: {
      user: toAuthUser(user),
      token: "session",
      createdAt: Date.now(),
    } satisfies AuthSession,
  });
}