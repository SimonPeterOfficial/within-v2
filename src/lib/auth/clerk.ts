"use server";

import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { db, users, profiles, type User, type Profile } from "@/lib/db";

/**
 * Resolves the current Clerk-authenticated identity to a local WITHIN user.
 *
 * Clerk establishes who is authenticated; WITHIN determines what that person
 * may do. This function maps a Clerk userId -> local WITHIN user via the
 * clerkId column, preserving existing internal UUIDs.
 *
 * Returns null when:
 *   - Not authenticated via Clerk
 *   - No local mapping exists (clerkId is null) — account linking required
 *   - The mapped local account is suspended or deleted
 */
export async function resolveClerkUser(): Promise<{
  user: User;
  profile: Profile | null;
} | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  if (existing.length === 0) return null;

  const user = existing[0];
  // A suspended or deleted account must not gain access via Clerk.
  if (user.status !== "active") return null;

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return { user, profile: profile[0] ?? null };
}

/**
 * Finds a local user by email. Used for account-linking conflict detection:
 * when a Clerk user's email matches an existing WITHIN account, we never
 * silently merge — we require explicit verification via the linking flow.
 */
export async function findLocalUserByEmail(email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

/**
 * Links a Clerk identity to an existing local user after verification.
 *
 * Used by the account-linking flow when a Clerk-authenticated user's email
 * matches an existing WITHIN account. The caller must have already verified
 * the user's ownership of the existing account (e.g., by validating the
 * legacy password) before calling this.
 *
 * Fails safely if:
 *   - The Clerk identity is already mapped to a different local account
 *   - The local user doesn't exist
 *   - The local account is suspended or deleted
 */
export async function linkClerkToLocalUser(
  clerkUserId: string,
  localUserId: string,
): Promise<void> {
  // Prevent one Clerk identity from mapping to multiple WITHIN accounts.
  const existingMapping = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  if (existingMapping.length > 0) {
    throw new Error("This Clerk identity is already linked to another account.");
  }

  const userRows = await db.select().from(users).where(eq(users.id, localUserId)).limit(1);
  if (userRows.length === 0) {
    throw new Error("Local user not found.");
  }
  const user = userRows[0];
  if (user.status !== "active") {
    throw new Error("Account is not active.");
  }

  await db.update(users).set({ clerkId: clerkUserId }).where(eq(users.id, localUserId));
}

/**
 * Creates a new local user and profile from a Clerk identity.
 *
 * Used when a Clerk user signs up and no local WITHIN account exists.
 * Fails safely if the email already belongs to another local account —
 * never silently merges.
 */
export async function createLocalUserFromClerk({
  clerkUserId,
  email,
  name,
}: {
  clerkUserId: string;
  email: string;
  name: string;
}): Promise<User> {
  // Detect email conflict — never silently merge accounts.
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error(
      "An account with this email already exists. Please sign in to your existing account and link your Clerk identity instead.",
    );
  }

  const created = await db
    .insert(users)
    .values({
      clerkId: clerkUserId,
      email,
      name,
      passwordHash: null,
      passwordSalt: null,
      role: "user",
      status: "active",
    })
    .returning();

  const user = created[0];
  if (!user) throw new Error("Could not create the account.");

  await db.insert(profiles).values({
    userId: user.id,
    username: email.split("@")[0] ?? "user",
    displayName: name,
  });

  return user;
}

/**
 * Synchronizes a local user record from a Clerk user object (webhook handler).
 *
 * Idempotent — safe to call repeatedly for the same Clerk user (handles
 * duplicate webhook deliveries).
 *
 * Throws on email conflict rather than silently merging.
 */
export async function syncLocalUserFromClerk({
  clerkUserId,
  email,
  firstName,
  lastName,
}: {
  clerkUserId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<{ user: User; created: boolean }> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  if (existing.length > 0) {
    // Idempotent update — refresh fields without changing ownership.
    const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];
    await db
      .update(users)
      .set({ email, name, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkUserId));
    return { user: existing[0], created: false };
  }

  // Check for email conflict before creating — never silently merge.
  const emailConflict = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (emailConflict.length > 0) {
    throw new Error(
      "Email conflict: a local account already exists for this email. Account linking is required.",
    );
  }

  const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];
  const created = await db
    .insert(users)
    .values({
      clerkId: clerkUserId,
      email,
      name,
      passwordHash: null,
      passwordSalt: null,
      role: "user",
      status: "active",
    })
    .returning();

  const user = created[0];
  if (!user) throw new Error("Could not create user.");

  await db.insert(profiles).values({
    userId: user.id,
    username: email.split("@")[0] ?? "user",
    displayName: name,
  });

  return { user, created: true };
}

/**
 * Marks a local user as deleted when their Clerk account is deleted.
 * Preserves data (cascading relationships remain) but revokes access.
 */
export async function deactivateLocalUserByClerkId(clerkUserId: string): Promise<void> {
  await db
    .update(users)
    .set({ status: "deleted", clerkId: null, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkUserId));
}
