/**
 * Social — friendships, blocks, and the people graph.
 *
 * Relationship primitives, deliberately small:
 *   follow    (one-way, exists)
 *   friend    (mutual, request → accept)
 *   block     (hard boundary, server-enforced)
 *
 * Blocking has REAL consequences everywhere: the blocked user can't follow,
 * can't request friendship, can't DM, and disappears from discovery. Every
 * mutation checks the block table; no frontend-only hiding.
 */

import "server-only";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { db, blocks, follows, friendships, profiles, users } from "@/lib/db";
import { createNotification } from "@/lib/auth/server";

/** A person as the social UI sees them — public identity only. */
export type PersonCard = {
  userId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  gradient: string | null;
  bio: string | null;
};

type PersonRow = {
  userId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  gradient: string | null;
  bio: string | null;
};

const personColumns = {
  userId: profiles.userId,
  username: profiles.username,
  displayName: profiles.displayName,
  avatar: profiles.avatar,
  gradient: profiles.gradient,
  bio: profiles.bio,
} as const;

/* ── Blocks ─────────────────────────────────────────────────────────── */

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const rows = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)))
    .limit(1);
  return rows.length > 0;
}

/** True when EITHER side has blocked the other — interaction must stop. */
export async function isBlockedEitherWay(a: string, b: string): Promise<boolean> {
  const rows = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)),
        and(eq(blocks.blockerId, b), eq(blocks.blockedId, a)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<{ ok: boolean; error?: string }> {
  if (blockerId === blockedId) return { ok: false, error: "You can't block yourself." };
  const target = await db.select({ id: users.id }).from(users).where(eq(users.id, blockedId)).limit(1);
  if (target.length === 0) return { ok: false, error: "Account not found." };

  // A block severs the relationship in both directions.
  await db.delete(follows).where(
    or(
      and(eq(follows.followerId, blockerId), eq(follows.followeeId, blockedId)),
      and(eq(follows.followerId, blockedId), eq(follows.followeeId, blockerId)),
    ),
  );
  await db
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, blockerId), eq(friendships.addresseeId, blockedId)),
        and(eq(friendships.requesterId, blockedId), eq(friendships.addresseeId, blockerId)),
      ),
    );

  await db.insert(blocks).values({ blockerId, blockedId }).onConflictDoNothing();
  return { ok: true };
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<{ ok: boolean; error?: string }> {
  await db
    .delete(blocks)
    .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)));
  return { ok: true };
}

/** Ids the user has blocked — so the UI can render state honestly. */
export async function listBlockedIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ id: blocks.blockedId })
    .from(blocks)
    .where(eq(blocks.blockerId, userId));
  return rows.map((row) => row.id);
}

/* ── Friendship state ───────────────────────────────────────────────── */

export type RelationshipState =
  | "none"
  | "friends"
  | "request_sent"
  | "request_received"
  | "blocked";

/** The caller's relationship to one person, resolved for the UI. */
export async function getRelationship(viewerId: string, otherId: string): Promise<RelationshipState> {
  if (viewerId === otherId) return "none";

  const blocked = await isBlockedEitherWay(viewerId, otherId);
  if (blocked) return "blocked";

  const rows = await db
    .select({ requesterId: friendships.requesterId, status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, viewerId), eq(friendships.addresseeId, otherId)),
        and(eq(friendships.requesterId, otherId), eq(friendships.addresseeId, viewerId)),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  return row.requesterId === viewerId ? "request_sent" : "request_received";
}

/* ── Friend requests ────────────────────────────────────────────────── */

export type SocialResult = { ok: true } | { ok: false; error: string };

/** Sends a friend request — blocked pairs are refused at the server. */
export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<SocialResult> {
  if (requesterId === addresseeId) return { ok: false, error: "You're already yourself." };

  const target = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, addresseeId)).limit(1);
  if (target.length === 0) return { ok: false, error: "Account not found." };

  if (await isBlockedEitherWay(requesterId, addresseeId)) {
    return { ok: false, error: "You can't connect with this person." };
  }

  const existing = await db
    .select({ id: friendships.id, requesterId: friendships.requesterId, status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
        and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId)),
      ),
    )
    .limit(1);

  if (existing[0]?.status === "accepted") return { ok: false, error: "You're already friends." };
  if (existing[0]) {
    // A reverse request is simply an acceptance waiting to happen.
    if (existing[0].requesterId === addresseeId) {
      return acceptFriendRequest(requesterId, existing[0].id);
    }
    return { ok: false, error: "Your request is already waiting." };
  }

  await db.insert(friendships).values({ requesterId, addresseeId, status: "pending" });

  const requester = await db.select({ name: users.name }).from(users).where(eq(users.id, requesterId)).limit(1);
  await createNotification({
    userId: addresseeId,
    type: "friend_request",
    actorId: requesterId,
    message: `${requester[0]?.name ?? "Someone"} sent you a friend request.`,
  });
  return { ok: true };
}

/** Accepts a pending request addressed to the caller. */
export async function acceptFriendRequest(addresseeId: string, friendshipId: string): Promise<SocialResult> {
  const rows = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, addresseeId)))
    .limit(1);

  const row = rows[0];
  if (!row || row.status !== "pending") return { ok: false, error: "That request isn't waiting anymore." };

  await db
    .update(friendships)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(eq(friendships.id, friendshipId));

  const accepter = await db.select({ name: users.name }).from(users).where(eq(users.id, addresseeId)).limit(1);
  await createNotification({
    userId: row.requesterId,
    type: "request_accepted",
    actorId: addresseeId,
    message: `${accepter[0]?.name ?? "Someone"} accepted your friend request.`,
  });
  return { ok: true };
}

/** Declines a pending request — the row simply goes away. */
export async function declineFriendRequest(addresseeId: string, friendshipId: string): Promise<SocialResult> {
  const deleted = await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.addresseeId, addresseeId),
        eq(friendships.status, "pending"),
      ),
    )
    .returning({ id: friendships.id });
  if (deleted.length === 0) return { ok: false, error: "That request isn't waiting anymore." };
  return { ok: true };
}

/** Removes an existing friendship (either side). */
export async function removeFriend(userId: string, otherId: string): Promise<SocialResult> {
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, otherId)),
          and(eq(friendships.requesterId, otherId), eq(friendships.addresseeId, userId)),
        ),
      ),
    );
  return { ok: true };
}

/* ── People lists ───────────────────────────────────────────────────── */

export type FriendEntry = PersonCard & { friendsSince: Date };
export type RequestEntry = { id: string; person: PersonCard; createdAt: Date };

/**
 * The caller's accepted friends, newest first: the other side of each
 * accepted pair, joined to their public profile. Two queries keep the SQL
 * readable while staying correct.
 */
export async function listFriends(userId: string): Promise<FriendEntry[]> {
  const pairs = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      respondedAt: friendships.respondedAt,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      ),
    )
    .orderBy(desc(friendships.respondedAt))
    .limit(200);

  if (pairs.length === 0) return [];

  const otherIds = pairs.map((pair) => (pair.requesterId === userId ? pair.addresseeId : pair.requesterId));
  const people = await db.select(personColumns).from(profiles).where(inArray(profiles.userId, otherIds));
  const byId = new Map(people.map((person) => [person.userId, person]));

  return pairs
    .map((pair) => {
      const otherId = pair.requesterId === userId ? pair.addresseeId : pair.requesterId;
      const person = byId.get(otherId);
      if (!person) return null;
      return {
        ...person,
        friendsSince: pair.respondedAt ?? pair.createdAt,
      };
    })
    .filter((entry): entry is FriendEntry => entry !== null);
}

/** Pending requests addressed TO the caller. */
export async function listIncomingRequests(userId: string): Promise<RequestEntry[]> {
  const rows = await db
    .select({
      id: friendships.id,
      createdAt: friendships.createdAt,
      ...personColumns,
    })
    .from(friendships)
    .innerJoin(profiles, eq(profiles.userId, friendships.requesterId))
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")))
    .orderBy(desc(friendships.createdAt))
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    person: {
      userId: row.userId,
      username: row.username,
      displayName: row.displayName,
      avatar: row.avatar,
      gradient: row.gradient,
      bio: row.bio,
    },
    createdAt: row.createdAt,
  }));
}

/** Pending requests the caller has SENT — so they can cancel. */
export async function listOutgoingRequests(userId: string): Promise<RequestEntry[]> {
  const rows = await db
    .select({
      id: friendships.id,
      createdAt: friendships.createdAt,
      ...personColumns,
    })
    .from(friendships)
    .innerJoin(profiles, eq(profiles.userId, friendships.addresseeId))
    .where(and(eq(friendships.requesterId, userId), eq(friendships.status, "pending")))
    .orderBy(desc(friendships.createdAt))
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    person: {
      userId: row.userId,
      username: row.username,
      displayName: row.displayName,
      avatar: row.avatar,
      gradient: row.gradient,
      bio: row.bio,
    },
    createdAt: row.createdAt,
  }));
}

/** People the caller follows who follow back — mutual follows as gentle hints. */
export async function listMutualFollows(userId: string): Promise<PersonCard[]> {
  const following = await db
    .select({ id: follows.followeeId })
    .from(follows)
    .where(eq(follows.followerId, userId));
  const followBack = await db
    .select({ id: follows.followerId })
    .from(follows)
    .where(eq(follows.followeeId, userId));

  const followingSet = new Set(following.map((row) => row.id));
  const mutualIds = followBack
    .map((row) => row.id)
    .filter((id) => followingSet.has(id))
    .slice(0, 20);

  if (mutualIds.length === 0) return [];

  const rows = await db
    .select(personColumns)
    .from(profiles)
    .where(inArray(profiles.userId, mutualIds));
  return rows;
}

/** How many pending requests the caller has — for the nav badge. */
export async function countPendingRequests(userId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(friendships)
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")));
  return rows[0]?.n ?? 0;
}
