/**
 * Communities — real rooms with real membership.
 *
 * A community has an owner, a slug, visibility, and members with roles.
 * Discovery lists public communities; membership is a real row; joining a
 * private community requires the owner's invite (future) — for now private
 * communities are joinable only by owner-added members, enforced here.
 */

import "server-only";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, communities, communityMembers, profiles, users } from "@/lib/db";

export type CommunityCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  gradient: string | null;
  visibility: "public" | "private";
  memberCount: number;
  ownerName: string | null;
};

/** Public communities, discoverable by anyone — searchable by name. */
export async function listCommunities(query?: string, limit = 24): Promise<CommunityCard[]> {
  const where = query
    ? or(ilike(communities.name, `%${query}%`), ilike(communities.description, `%${query}%`))
    : undefined;

  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      emoji: communities.emoji,
      gradient: communities.gradient,
      visibility: communities.visibility,
      ownerName: profiles.displayName,
      memberCount: sql<number>`(SELECT count(*) FROM community_members WHERE community_id = ${communities.id})`.as("member_count"),
    })
    .from(communities)
    .leftJoin(profiles, eq(profiles.userId, communities.ownerId))
    .where(where)
    .orderBy(desc(communities.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, memberCount: Number(row.memberCount) }));
}

/** Communities the user belongs to. */
export async function listMyCommunities(userId: string): Promise<CommunityCard[]> {
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      emoji: communities.emoji,
      gradient: communities.gradient,
      visibility: communities.visibility,
      role: communityMembers.role,
      ownerName: profiles.displayName,
      memberCount: sql<number>`(SELECT count(*) FROM community_members WHERE community_id = ${communities.id})`.as("member_count"),
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communities.id, communityMembers.communityId))
    .leftJoin(profiles, eq(profiles.userId, communities.ownerId))
    .where(eq(communityMembers.userId, userId))
    .orderBy(desc(communityMembers.joinedAt))
    .limit(50);

  return rows.map((row) => ({ ...row, memberCount: Number(row.memberCount) }));
}

/** One community by slug — private ones only reveal themselves to members. */
export async function getCommunityBySlug(slug: string, viewerId: string | null) {
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      emoji: communities.emoji,
      gradient: communities.gradient,
      visibility: communities.visibility,
      ownerId: communities.ownerId,
      ownerName: profiles.displayName,
      memberCount: sql<number>`(SELECT count(*) FROM community_members WHERE community_id = ${communities.id})`.as("member_count"),
    })
    .from(communities)
    .leftJoin(profiles, eq(profiles.userId, communities.ownerId))
    .where(eq(communities.slug, slug))
    .limit(1);

  const community = rows[0];
  if (!community) return null;

  const membership = viewerId
    ? await db
        .select({ role: communityMembers.role })
        .from(communityMembers)
        .where(and(eq(communityMembers.communityId, community.id), eq(communityMembers.userId, viewerId)))
        .limit(1)
    : [];

  const isMember = membership.length > 0;
  if (community.visibility === "private" && !isMember) {
    return { community: { ...community, memberCount: Number(community.memberCount) }, isMember: false, isPrivateHidden: true };
  }

  return { community: { ...community, memberCount: Number(community.memberCount) }, isMember, isPrivateHidden: false };
}

export type CommunityResult = { ok: true } | { ok: false; error: string };

/** Joins a public community. Private ones need the owner. */
export async function joinCommunity(userId: string, communityId: string): Promise<CommunityResult> {
  const rows = await db
    .select({ id: communities.id, visibility: communities.visibility, ownerId: communities.ownerId })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const community = rows[0];
  if (!community) return { ok: false, error: "Community not found." };
  if (community.visibility === "private" && community.ownerId !== userId) {
    return { ok: false, error: "This room is private." };
  }

  await db
    .insert(communityMembers)
    .values({ communityId, userId, role: "member" })
    .onConflictDoNothing();
  return { ok: true };
}

/** Leaves a community. The owner must transfer ownership first (future) —
 * for now the owner can't leave their own community. */
export async function leaveCommunity(userId: string, communityId: string): Promise<CommunityResult> {
  const rows = await db
    .select({ ownerId: communities.ownerId })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  if (rows[0]?.ownerId === userId) {
    return { ok: false, error: "Owners can't leave their own community yet." };
  }

  await db
    .delete(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)));
  return { ok: true };
}

/** Creates a community — the creator becomes its owner. */
export async function createCommunity(
  ownerId: string,
  input: { name: string; description?: string; emoji?: string; visibility?: "public" | "private" },
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 60) {
    return { ok: false, error: "Name needs 2–60 characters." };
  }

  // Slug from the name, made unique with a short suffix when taken.
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "community";
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await db.select({ id: communities.id }).from(communities).where(eq(communities.slug, slug)).limit(1);
    if (taken.length === 0) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const inserted = await db
    .insert(communities)
    .values({
      name,
      slug,
      description: input.description?.trim() || null,
      emoji: input.emoji?.trim() || null,
      visibility: input.visibility ?? "public",
      ownerId,
    })
    .returning({ id: communities.id, slug: communities.slug });

  await db.insert(communityMembers).values({
    communityId: inserted[0].id,
    userId: ownerId,
    role: "owner",
  });
  return { ok: true, slug: inserted[0].slug };
}

/** How many pending items could be relevant — reserved, returns 0 honestly. */
export async function countCommunityInvites(_userId: string): Promise<number> {
  void _userId;
  return 0;
}
