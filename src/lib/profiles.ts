/**
 * Profiles — the server-side profile service.
 *
 * Everything a profile page needs: public lookup by username (joined with
 * the user record for role/status, with follow + content counts), and the
 * owner's own-profile update. Private profiles hide content from strangers
 * at the query level, never in the UI.
 */

import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db, content, follows, profiles, users, type Profile } from "@/lib/db";
import { validateBio, validateName } from "@/lib/auth/validation";

export type PublicProfile = {
  /** Internal id — used by follow buttons and content queries, never rendered. */
  userId: string;
  username: string;
  displayName: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  gradient: string | null;
  category: string | null;
  privacy: "public" | "private";
  role: string;
  status: string;
  createdAt: Date;
  followers: number;
  following: number;
  contentCount: number;
};

/** Counts rows in a table matching a predicate — typed per call site. */
async function countWhere(
  table: typeof follows | typeof content,
  where: ReturnType<typeof eq>,
): Promise<number> {
  const rows = await db.select({ n: count() }).from(table).where(where);
  return rows[0]?.n ?? 0;
}

/** Public profile by username, with live follower/following/content counts. */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const rows = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatar: profiles.avatar,
      gradient: profiles.gradient,
      category: profiles.category,
      privacy: profiles.privacy,
      role: users.role,
      status: users.status,
      createdAt: profiles.createdAt,
      userId: profiles.userId,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.username, username))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.status !== "active") return null;

  const [followers, following, contentCount] = await Promise.all([
    countWhere(follows, eq(follows.followeeId, row.userId)),
    countWhere(follows, eq(follows.followerId, row.userId)),
    countWhere(content, eq(content.creatorId, row.userId)),
  ]);

  return {
    userId: row.userId,
    username: row.username,
    displayName: row.displayName ?? row.username,
    name: row.displayName ?? row.username,
    bio: row.bio,
    avatar: row.avatar,
    gradient: row.gradient,
    category: row.category,
    privacy: row.privacy,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
    followers,
    following,
    contentCount,
  };
}

/** The profile row for a user id (null when the user has no profile yet). */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

/** Updates the owner's own profile — only safe, validated fields. */
export async function updateOwnProfile(
  userId: string,
  input: { displayName?: string; bio?: string; avatar?: string; gradient?: string },
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const profile = await getProfileByUserId(userId);
  if (!profile) return { ok: false, error: "Profile not found." };

  const displayName = input.displayName?.trim();
  const bio = input.bio?.trim();

  if (displayName !== undefined) {
    const nameError = validateName(displayName);
    if (nameError) return { ok: false, error: nameError };
  }
  if (bio !== undefined) {
    const bioError = validateBio(bio);
    if (bioError) return { ok: false, error: bioError };
  }

  const updated = await db
    .update(profiles)
    .set({
      ...(displayName !== undefined ? { displayName } : {}),
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(input.avatar !== undefined ? { avatar: input.avatar || null } : {}),
      ...(input.gradient !== undefined ? { gradient: input.gradient || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profile.id))
    .returning();

  return { ok: true, profile: updated[0] };
}