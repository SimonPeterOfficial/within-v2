/**
 * POST /api/auth/clerk/link
 *
 * Links a Clerk identity to an existing local WITHIN account after verifying
 * ownership of the existing account via legacy credentials.
 *
 * Security:
 *   - Clerk identity verified server-side via auth() from @clerk/nextjs
 *   - Local account ownership verified via legacy scrypt password check
 *   - Never trusts client-supplied userId or Clerk metadata
 *   - Never silently merges accounts based on email match alone
 *   - Fails safely if the Clerk identity is already mapped elsewhere
 *
 * Request body: { email: string, password: string }
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { linkClerkToLocalUser } from "@/lib/auth/clerk";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // ── 1. Verify Clerk authentication ─────────────────────────────────
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json(
      { ok: false, error: "Clerk authentication required." },
      { status: 401 },
    );
  }

  // ── 2. Rate limit ──────────────────────────────────────────────────
  const limited = await rateLimit(`clerk-link:${clientKeyFrom(request)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  // ── 3. Parse input ─────────────────────────────────────────────────
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  // ── 4. Find local user by email ────────────────────────────────────
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account found with this email address." },
      { status: 404 },
    );
  }

  // ── 5. Verify legacy password ──────────────────────────────────────
  // Clerk users have no legacy passwordHash — they can't use this flow.
  if (!user.passwordHash || !user.passwordSalt) {
    return NextResponse.json(
      { ok: false, error: "This account does not have a legacy password set." },
      { status: 400 },
    );
  }

  const valid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 },
    );
  }

  // ── 6. Ensure account is active ────────────────────────────────────
  if (user.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "This account is not active. Contact support for help." },
      { status: 403 },
    );
  }

  // ── 7. Link Clerk identity to local user ───────────────────────────
  try {
    await linkClerkToLocalUser(clerkUserId, user.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
