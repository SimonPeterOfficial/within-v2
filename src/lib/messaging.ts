/**
 * Messaging — conversations and messages, membership-checked everywhere.
 *
 * A conversation is a row plus member rows. Every read and every send
 * verifies the caller's membership at the query level; a foreign
 * conversation id is a 404, never a leak. DMs use a stable sorted pair key
 * so two people always share exactly one conversation. Message sending is
 * blocked in either direction when a block exists — enforced here, not in
 * the UI.
 *
 * Real-time: this generation uses short-interval polling as the transport.
 * `listMessagesSince` gives any future transport (SSE, websocket) the exact
 * shape it needs — fetch deltas since a cursor — without a rewrite.
 */

import "server-only";
import { and, asc, desc, eq, gt, inArray, ne, or, sql } from "drizzle-orm";
import { db, conversationMembers, conversations, messages, profiles, users } from "@/lib/db";
import { isBlockedEitherWay } from "@/lib/social";
import { createNotification } from "@/lib/auth/server";

const MAX_MESSAGE_LENGTH = 4000;

/** One conversation as the list UI sees it. */
export type ConversationSummary = {
  id: string;
  partner: {
    userId: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    gradient: string | null;
  };
  lastMessage: { body: string; createdAt: Date; senderId: string } | null;
  unread: number;
  updatedAt: Date;
};

/** One message as the thread UI sees it. */
export type MessageView = {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string | null;
  body: string;
  createdAt: Date;
};

/* ── Reads ──────────────────────────────────────────────────────────── */

/** The caller's conversations, most recently active first. */
export async function listConversations(userId: string, limit = 30): Promise<ConversationSummary[]> {
  const memberships = await db
    .select({ conversationId: conversationMembers.conversationId, lastReadAt: conversationMembers.lastReadAt })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId))
    .limit(100);

  if (memberships.length === 0) return [];

  const ids = memberships.map((m) => m.conversationId);
  const convs = await db
    .select()
    .from(conversations)
    .where(inArray(conversations.id, ids))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);

  if (convs.length === 0) return [];

  // Partners: the other member of each DM.
  const others = await db
    .select({
      conversationId: conversationMembers.conversationId,
      userId: conversationMembers.userId,
      username: profiles.username,
      displayName: profiles.displayName,
      avatar: profiles.avatar,
      gradient: profiles.gradient,
    })
    .from(conversationMembers)
    .innerJoin(profiles, eq(profiles.userId, conversationMembers.userId))
    .where(and(inArray(conversationMembers.conversationId, ids), ne(conversationMembers.userId, userId)));

  const partnerByConversation = new Map(others.map((o) => [o.conversationId, o]));

  // The latest message per conversation, in one query.
  const latest = await db
    .select({
      conversationId: messages.conversationId,
      body: messages.body,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      rank: sql<number>`row_number() OVER (PARTITION BY ${messages.conversationId} ORDER BY ${messages.createdAt} DESC)`.as("rank"),
    })
    .from(messages)
    .where(inArray(messages.conversationId, ids));

  const latestByConversation = new Map(
    latest.filter((row) => Number(row.rank) === 1).map((row) => [row.conversationId, row]),
  );

  // Unread counts per conversation.
  const unreadRows = await db
    .select({
      conversationId: messages.conversationId,
      n: sql<number>`count(*)`.as("n"),
    })
    .from(messages)
    .innerJoin(
      conversationMembers,
      and(
        eq(conversationMembers.conversationId, messages.conversationId),
        eq(conversationMembers.userId, userId),
      ),
    )
    .where(
      and(
        inArray(messages.conversationId, ids),
        ne(messages.senderId, userId),
        or(
          sql`${conversationMembers.lastReadAt} IS NULL`,
          gt(messages.createdAt, sql`COALESCE(${conversationMembers.lastReadAt}, to_timestamp(0))`),
        ),
      ),
    )
    .groupBy(messages.conversationId);

  const unreadByConversation = new Map(unreadRows.map((row) => [row.conversationId, Number(row.n)]));

  return convs
    .map((conv) => {
      const partner = partnerByConversation.get(conv.id);
      const last = latestByConversation.get(conv.id);
      return {
        id: conv.id,
        partner: partner
          ? {
              userId: partner.userId,
              username: partner.username,
              displayName: partner.displayName,
              avatar: partner.avatar,
              gradient: partner.gradient,
            }
          : null,
        lastMessage: last ? { body: last.body, createdAt: last.createdAt, senderId: last.senderId } : null,
        unread: unreadByConversation.get(conv.id) ?? 0,
        updatedAt: conv.updatedAt,
      };
    })
    .filter((conv): conv is ConversationSummary => conv.partner !== null);
}

/** Whether the caller belongs to the conversation — the gate for everything. */
async function isMember(conversationId: string, userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: conversationMembers.id })
    .from(conversationMembers)
    .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

/** The other DM partner, when the caller is a member. */
export async function getConversationPartner(conversationId: string, userId: string) {
  if (!(await isMember(conversationId, userId))) return null;

  const rows = await db
    .select({
      userId: profiles.userId,
      username: profiles.username,
      displayName: profiles.displayName,
      avatar: profiles.avatar,
      gradient: profiles.gradient,
    })
    .from(conversationMembers)
    .innerJoin(profiles, eq(profiles.userId, conversationMembers.userId))
    .where(and(eq(conversationMembers.conversationId, conversationId), ne(conversationMembers.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Messages of a conversation the caller belongs to, oldest → newest. */
export async function listMessages(
  conversationId: string,
  userId: string,
  limit = 100,
): Promise<MessageView[] | null> {
  if (!(await isMember(conversationId, userId))) return null;

  const rows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      senderName: users.name,
      senderUsername: profiles.username,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .leftJoin(profiles, eq(profiles.userId, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(limit);

  return rows;
}

/** Messages after a cursor — the future real-time transport's delta fetch. */
export async function listMessagesSince(
  conversationId: string,
  userId: string,
  since: Date,
): Promise<MessageView[] | null> {
  if (!(await isMember(conversationId, userId))) return null;

  const rows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      senderName: users.name,
      senderUsername: profiles.username,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .leftJoin(profiles, eq(profiles.userId, messages.senderId))
    .where(and(eq(messages.conversationId, conversationId), gt(messages.createdAt, since)))
    .orderBy(asc(messages.createdAt))
    .limit(50);
  return rows;
}

/* ── Writes ─────────────────────────────────────────────────────────── */

export type MessageResult = { ok: true } | { ok: false; error: string };

/**
 * Opens (or finds) the DM between two users. Blocks refuse; friends and
 * follows are allowed. The dm_key unique index makes races harmless.
 */
export async function openConversationWith(userId: string, otherId: string): Promise<
  { ok: true; conversationId: string } | { ok: false; error: string }
> {
  if (userId === otherId) return { ok: false, error: "You can't message yourself." };
  if (await isBlockedEitherWay(userId, otherId)) {
    return { ok: false, error: "You can't message this person." };
  }

  const other = await db.select({ id: users.id }).from(users).where(eq(users.id, otherId)).limit(1);
  if (other.length === 0) return { ok: false, error: "Account not found." };

  const key = [userId, otherId].sort().join("|");
  const existing = await db.select().from(conversations).where(eq(conversations.dmKey, key)).limit(1);
  if (existing[0]) return { ok: true, conversationId: existing[0].id };

  const inserted = await db.insert(conversations).values({ dmKey: key }).returning();
  const conversation = inserted[0];
  await db.insert(conversationMembers).values([
    { conversationId: conversation.id, userId },
    { conversationId: conversation.id, userId: otherId },
  ]);
  return { ok: true, conversationId: conversation.id };
}

/** Sends a message into a conversation the caller belongs to. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<MessageResult> {
  const trimmed = body.trim();
  if (trimmed.length === 0) return { ok: false, error: "Write something first." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Messages hold up to ${MAX_MESSAGE_LENGTH} characters.` };
  }

  if (!(await isMember(conversationId, senderId))) return { ok: false, error: "Conversation not found." };

  // Block enforcement: a blocked pair can't exchange messages, ever.
  const others = await db
    .select({ userId: conversationMembers.userId })
    .from(conversationMembers)
    .where(and(eq(conversationMembers.conversationId, conversationId), ne(conversationMembers.userId, senderId)));

  for (const other of others) {
    if (await isBlockedEitherWay(senderId, other.userId)) {
      return { ok: false, error: "You can't message this person." };
    }
  }

  await db.insert(messages).values({ conversationId, senderId, body: trimmed });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));

  // Notify recipients — real rows for real messages.
  for (const other of others) {
    const sender = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId)).limit(1);
    await createNotification({
      userId: other.userId,
      type: "message",
      actorId: senderId,
      message: `${sender[0]?.name ?? "Someone"} sent you a message.`,
    });
  }
  return { ok: true };
}

/** Marks a conversation read up to now — unread dots obey the reader. */
export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  if (!(await isMember(conversationId, userId))) return;
  await db
    .update(conversationMembers)
    .set({ lastReadAt: new Date() })
    .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)));
}

/** Total unread across all conversations — for the nav badge. */
export async function countUnreadMessages(userId: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)`.as("n") })
    .from(messages)
    .innerJoin(
      conversationMembers,
      and(
        eq(conversationMembers.conversationId, messages.conversationId),
        eq(conversationMembers.userId, userId),
      ),
    )
    .where(and(ne(messages.senderId, userId), or(
      sql`${conversationMembers.lastReadAt} IS NULL`,
      gt(messages.createdAt, sql`COALESCE(${conversationMembers.lastReadAt}, to_timestamp(0))`),
    )));
  return Number(rows[0]?.n ?? 0);
}
