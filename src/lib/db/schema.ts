/**
 * WithIn core schema — the platform's single source of truth.
 *
 * One schema, one vocabulary. Every table here maps to a concept in the
 * master platform build (users, profiles, content, comments, reactions,
 * follows, library, reports, moderation, notifications, subscriptions,
 * audit log, engagement). Columns are snake_case in Postgres; TS keys are
 * camelCase. All enum-like fields are `text` + a TS union so migrations
 * stay cheap and safe to evolve.
 *
 * ── REAL DATA ONLY ─────────────────────────────────────────────────────
 * This schema is empty until real records are created. Development seeding
 * lives in scripts/seed-dev.ts and is explicitly development-only.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/* ── Shared vocabulary ─────────────────────────────────────────────── */

/** Platform roles — extensible permission model, never hardcoded in UI. */
export type UserRole = "user" | "creator" | "moderator" | "admin" | "super_admin";

/** Account lifecycle states. */
export type UserStatus = "active" | "suspended" | "deleted";

/** Content kinds — not every type uses identical fields, but all share this base. */
export type ContentType = "film" | "video" | "book" | "story" | "post" | "audio" | "image" | "other";

/**
 * Content lifecycle:
 *   draft → submitted → reviewing → approved → published
 *   published → hidden | archived   (moderation / retirement)
 * Creators never bypass review unless an admin-configured rule says so.
 */
export type ContentStatus = "draft" | "submitted" | "reviewing" | "approved" | "published" | "hidden" | "archived";

export type ContentVisibility = "public" | "unlisted" | "private";

/** Report lifecycle. */
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReportSeverity = "low" | "medium" | "high" | "critical";

/** Subscription lifecycle — never claim payment unless the provider confirms. */
export type SubscriptionStatus = "trial" | "active" | "paused" | "cancelled" | "expired";

/** Notification kinds — one vocabulary for the whole notification bus. */
export type NotificationType =
  | "new_follower"
  | "friend_request"
  | "request_accepted"
  | "message"
  | "creator_published"
  | "comment"
  | "reaction"
  | "moderation_result"
  | "subscription"
  | "system";

/** Things an admin action can touch — for the audit log. */
export type AuditTargetType =
  | "user"
  | "profile"
  | "content"
  | "comment"
  | "report"
  | "subscription"
  | "settings";

/* ── Users ─────────────────────────────────────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    /** scrypt hash — never the raw password, never logged. */
    passwordHash: text("password_hash").notNull(),
    /** Per-user random salt for the scrypt hash. */
    passwordSalt: text("password_salt").notNull(),
    name: text("name").notNull(),
    role: text("role").$type<UserRole>().notNull().default("user"),
    status: text("status").$type<UserStatus>().notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/* ── Profiles ──────────────────────────────────────────────────────── */

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Public handle — the /profile/[username] slug. Unique, lowercase. */
    username: text("username").notNull(),
    displayName: text("display_name"),
    bio: text("bio"),
    /** Emoji avatar — matches the existing visual language (no image assets yet). */
    avatar: text("avatar"),
    /** Tailwind gradient stops for the avatar halo. */
    gradient: text("gradient"),
    /** Where this profile sits in the universe — for discovery + badges. */
    category: text("category"),
    /** Privacy — private profiles hide content from non-followers. */
    privacy: text("privacy").$type<"public" | "private">().notNull().default("public"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("profiles_user_id_unique").on(table.userId),
    uniqueIndex("profiles_username_unique").on(table.username),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

/* ── Content ───────────────────────────────────────────────────────── */

export const content = pgTable(
  "content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The creator who owns this piece. */
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<ContentType>().notNull(),
    title: text("title").notNull(),
    description: text("description"),
    /** Display attribution — some catalogs call it artist/author/by. */
    attribution: text("attribution"),
    /** Cover spec — gradient + emoji, the current visual language. */
    coverGradient: text("cover_gradient"),
    coverEmoji: text("cover_emoji"),
    /** Where the actual media lives (video url, audio file, image url, epub…). */
    mediaRef: text("media_ref"),
    /** Human category label, e.g. "Films" / "Music" / "Books". */
    category: text("category"),
    /** Free-form discovery tags. */
    tags: text("tags").array(),
    /** Lifecycle state. */
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    visibility: text("visibility").$type<ContentVisibility>().notNull().default("public"),
    /** Optional scheduling — becomes published when the clock passes. */
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    /* ── Moderation state ── */
    moderationNote: text("moderation_note"),
    moderatedById: uuid("moderated_by_id").references(() => users.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  },
  (table) => [
    index("content_status_idx").on(table.status),
    index("content_creator_idx").on(table.creatorId),
    index("content_type_idx").on(table.type),
    index("content_published_idx").on(table.publishedAt),
  ],
);

export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;

/* ── Comments ──────────────────────────────────────────────────────── */

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Threaded replies — null means a top-level comment. */
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    /** visible | hidden (moderated) | deleted (removed by author/moderator). */
    status: text("status").$type<"visible" | "hidden" | "deleted">().notNull().default("visible"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_content_idx").on(table.contentId),
    index("comments_user_idx").on(table.userId),
  ],
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

/* ── Reactions ─────────────────────────────────────────────────────── */

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Reaction kind — "like", "warm", "inspired"… vocab can grow. */
    type: text("type").notNull().default("like"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reactions_unique").on(table.contentId, table.userId, table.type),
  ],
);

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;

/* ── Follows ───────────────────────────────────────────────────────── */

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followeeId: uuid("followee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("follows_unique").on(table.followerId, table.followeeId),
    index("follows_followee_idx").on(table.followeeId),
  ],
);

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;

/* ── Library / saves ───────────────────────────────────────────────── */

/** Shelves a user keeps: saved (bookmark) or liked (affection). */
export type SaveShelf = "saved" | "liked";

export const saves = pgTable(
  "saves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    shelf: text("shelf").$type<SaveShelf>().notNull().default("saved"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("saves_unique").on(table.userId, table.contentId, table.shelf),
  ],
);

export type Save = typeof saves.$inferSelect;
export type NewSave = typeof saves.$inferInsert;

/* ── Reports / moderation ──────────────────────────────────────────── */

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** What kind of thing is being reported. */
    targetType: text("target_type").$type<AuditTargetType>().notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    severity: text("severity").$type<ReportSeverity>().notNull().default("medium"),
    status: text("status").$type<ReportStatus>().notNull().default("open"),
    resolutionNote: text("resolution_note"),
    resolvedById: uuid("resolved_by_id").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reports_status_idx").on(table.status),
    index("reports_target_idx").on(table.targetType, table.targetId),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

/* ── Notifications ─────────────────────────────────────────────────── */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<NotificationType>().notNull(),
    /** Who triggered it (follower, commenter, moderator) — null for system. */
    actorId: uuid("actor_id").references(() => users.id),
    /** What it points at (content, profile, report…). */
    contentId: uuid("content_id").references(() => content.id),
    /** A short, safe, human-readable summary. */
    message: text("message").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId, table.read),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/* ── Subscriptions ─────────────────────────────────────────────────── */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("pro"),
    status: text("status").$type<SubscriptionStatus>().notNull().default("trial"),
    /** Payment provider (stripe/lemon/… ) — kept modular, never raw credentials. */
    provider: text("provider"),
    providerRef: text("provider_ref"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("subscriptions_user_idx").on(table.userId)],
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

/* ── Engagement / views ────────────────────────────────────────────── */

export const contentViews = pgTable(
  "content_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    /** Null = anonymous view (still counted, never personal). */
    userId: uuid("user_id").references(() => users.id),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("views_content_idx").on(table.contentId)],
);

export type ContentView = typeof contentViews.$inferSelect;
export type NewContentView = typeof contentViews.$inferInsert;

/* ── Mirror — private reflections ────────────────────────────────────
 * The user's reflective environment. PRIVATE BY DEFAULT: entries are
 * readable only by their owner, at the query level. There is no public
 * sharing column on purpose — sharing, if it ever exists, must be a
 * separate, explicit action with its own model. The user is always the
 * interpreter of their own reflections; nothing here diagnoses. */

export const mirrorEntries = pgTable(
  "mirror_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The reflection body — plain text, the user's own words. */
    body: text("body").notNull(),
    /** Optional prompt that invited the entry (never a diagnosis). */
    prompt: text("prompt"),
    /** Optional mood the user chose to attach — user-chosen, not inferred. */
    moodId: text("mood_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("mirror_user_idx").on(table.userId, table.createdAt)],
);

export type MirrorEntry = typeof mirrorEntries.$inferSelect;
export type NewMirrorEntry = typeof mirrorEntries.$inferInsert;

/* ── Friendships — explicit, mutual connection ────────────────────────
 * A friend request creates one row with status "pending". Accept flips
 * both sides to "accepted" via the requester pair; decline deletes.
 * Blocking a user removes any friendship rows in the same transaction. */

export type FriendshipStatus = "pending" | "accepted";

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The user who sent the request. */
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The user who receives it. */
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<FriendshipStatus>().notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("friendships_unique").on(table.requesterId, table.addresseeId),
    index("friendships_addressee_idx").on(table.addresseeId, table.status),
  ],
);

export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;

/* ── Blocks — hard, server-enforced social boundaries ─────────────────
 * A block is one-directional and absolute: the blocker never sees the
 * blocked user's content, can't be followed by them, can't receive their
 * messages, and can't be discovered to them. Enforced in services. */

export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The user who blocked. */
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The user who was blocked. */
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blocks_unique").on(table.blockerId, table.blockedId)],
);

export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;

/* ── Conversations — messaging foundation ─────────────────────────────
 * Minimal and future-safe: a conversation row plus membership rows. DMs
 * today; groups later by adding members, no migration of semantics. */

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** For DMs: a stable sorted pair key "a|b" — makes duplicate DMs impossible. */
  dmKey: text("dm_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("conversations_dm_key_unique").on(table.dmKey)]);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("conversation_members_unique").on(table.conversationId, table.userId),
    index("conversation_members_user_idx").on(table.userId),
  ],
);

export type ConversationMember = typeof conversationMembers.$inferSelect;
export type NewConversationMember = typeof conversationMembers.$inferInsert;

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId, table.createdAt)],
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

/* ── Communities — real, ownable rooms ────────────────────────────────
 * A community has an owner, a visibility, and members with roles.
 * Discussions reuse the existing comment/report/moderation systems. */

export type CommunityVisibility = "public" | "private";
export type CommunityRole = "owner" | "moderator" | "member";

export const communities = pgTable(
  "communities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** URL slug — unique. */
    slug: text("slug").notNull(),
    description: text("description"),
    /** Emoji sigil — matches the coverEmoji visual language. */
    emoji: text("emoji"),
    /** Tailwind gradient stops for the community halo. */
    gradient: text("gradient"),
    visibility: text("visibility").$type<CommunityVisibility>().notNull().default("public"),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("communities_slug_unique").on(table.slug),
    index("communities_owner_idx").on(table.ownerId),
  ],
);

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

export const communityMembers = pgTable(
  "community_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<CommunityRole>().notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("community_members_unique").on(table.communityId, table.userId),
    index("community_members_user_idx").on(table.userId),
  ],
);

export type CommunityMember = typeof communityMembers.$inferSelect;
export type NewCommunityMember = typeof communityMembers.$inferInsert;

/* ── Audit log — admin actions, never passwords, never secrets ─────── */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Who acted — a user id (admin/moderator), or null for system actions. */
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    targetType: text("target_type").$type<AuditTargetType>(),
    targetId: uuid("target_id"),
    /** Free-form safe details (ids, labels) — never credentials. */
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_actor_idx").on(table.actorId),
    index("audit_created_idx").on(table.createdAt),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;