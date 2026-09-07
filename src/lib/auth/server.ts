/**
 * Server-side sessions — the real authentication boundary.
 *
 * Everything authenticated flows through here:
 *   - `getSessionUser()` reads the httpOnly cookie, verifies the HMAC
 *     signature, then loads the user FRESH from the database (never trusting
 *     the token's role alone), rejecting suspended/deleted accounts.
 *   - API routes call `requireUser()`; server components call
 *     `getSessionUser()`. Both return null when unauthenticated.
 *
 * Security properties:
 *   - httpOnly + secure (production) + SameSite=Lax cookie
 *   - HMAC-SHA256 signed, expiring after 30 days
 *   - Suspended accounts are rejected even with a valid token
 *   - No secrets in client JavaScript
 */

import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, auditLogs, notifications, users, type AuditTargetType, type NewAuditLog, type NewNotification, type User } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  createSessionToken,
  verifySessionToken,
} from "./session-token";

/** Reads the authenticated user from the session cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  const found = user[0];
  if (!found) return null;
  // A suspended or deleted account must not keep using an old session.
  if (found.status !== "active") return null;

  return found;
}

/** For API routes: the authenticated user, or null (caller returns 401). */
export async function requireUser(): Promise<User | null> {
  return getSessionUser();
}

/** Creates the session cookie for a user — called right after sign in/up. */
export async function createUserSession(user: User): Promise<void> {
  const store = await cookies();
  const token = await createSessionToken(user.id, user.role);
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

/** Destroys the session cookie — real logout, not a redirect. */
export async function destroyUserSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Touches last_active_at — cheap, done on authenticated mutations. */
export async function touchUserActivity(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, userId))
    .catch(() => undefined); // activity tracking never blocks the request
}

/* ── Audit log — every privileged action leaves a trace ─────────────── */

export async function writeAuditLog(input: Omit<NewAuditLog, "createdAt">): Promise<void> {
  await db.insert(auditLogs).values(input).catch(() => undefined);
}

export const auditAction = {
  userSuspended: "USER_SUSPENDED",
  userRestored: "USER_RESTORED",
  roleChanged: "ROLE_CHANGED",
  contentApproved: "CONTENT_APPROVED",
  contentRejected: "CONTENT_REJECTED",
  contentHidden: "CONTENT_HIDDEN",
  reportResolved: "REPORT_RESOLVED",
  settingsChanged: "SETTINGS_CHANGED",
} as const;

export type AuditAction = (typeof auditAction)[keyof typeof auditAction];

/** Typed wrapper so callers never pass a malformed action string. */
export async function logAdminAction(input: {
  actorId: string;
  action: AuditAction;
  targetType?: AuditTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  await writeAuditLog({
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    details: input.details ?? {},
  });
}

/* ── Notifications — real rows, fired by real events ────────────────── */

export async function createNotification(input: Omit<NewNotification, "read" | "createdAt">): Promise<void> {
  await db.insert(notifications).values({ ...input, read: false }).catch(() => undefined);
}