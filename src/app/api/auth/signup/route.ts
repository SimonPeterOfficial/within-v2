/**
 * POST /api/auth/signup
 *
 * Creates a real user + profile record and starts an httpOnly session.
 * Server-side only: passwords are scrypt-hashed with a per-user salt, and
 * the session cookie is signed — nothing credential-bearing touches the
 * client beyond the cookie itself.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, profiles, users, type User } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createUserSession, touchUserActivity } from "@/lib/auth/server";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";
import {
  deriveUsername,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth/validation";
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
  const limited = rateLimit(`signup:${clientKeyFrom(request)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (nameError || emailError || passwordError) {
    return NextResponse.json(
      { ok: false, error: nameError ?? emailError ?? passwordError },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const { hash, salt } = await hashPassword(password);
  const created = await db
    .insert(users)
    .values({ name: name.trim(), email: normalizedEmail, passwordHash: hash, passwordSalt: salt })
    .returning();

  const user = created[0];
  if (!user) {
    return NextResponse.json({ ok: false, error: "Could not create the account." }, { status: 500 });
  }

  // Derive a unique public username; retry with a numeric suffix on clash.
  let username = deriveUsername(name, normalizedEmail);
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    if (clash.length === 0) break;
    username = `${deriveUsername(name, normalizedEmail).slice(0, 26)}-${Math.floor(Math.random() * 900) + 100}`;
  }

  try {
    await db.insert(profiles).values({
      userId: user.id,
      username,
      displayName: user.name,
    });
  } catch {
    // Profile creation failed — don't leave an orphaned account behind.
    await db.delete(users).where(eq(users.id, user.id)).catch(() => undefined);
    return NextResponse.json({ ok: false, error: "Could not create the profile." }, { status: 500 });
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