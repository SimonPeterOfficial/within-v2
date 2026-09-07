/**
 * The database client — the one door to Postgres.
 *
 * Server-only by construction: `import "server-only"` makes Next fail the
 * build if anything client-side ever tries to import this module, so
 * credentials and queries can never leak into the browser bundle.
 *
 * ── ENVIRONMENT ──────────────────────────────────────────────────────
 * Requires DATABASE_URL (Neon pooled connection string for serverless).
 * In production, a missing DATABASE_URL is a hard error — never a silent
 * fallback that pretends persistence exists.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export * from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production.");
    }
    // Development without a database: every query fails loudly with a clear
    // message instead of silently pretending the platform persists.
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local " +
        "(see https://neon.tech/docs/connect/connect-from-any-app).",
    );
  }
  return url;
}

/** The single Drizzle instance — shared by every server module. */
export const db = drizzle(neon(getDatabaseUrl()), { schema });

export type { User, NewUser, UserRole, UserStatus } from "./schema";
export type {
  Content,
  NewContent,
  ContentType,
  ContentStatus,
  ContentVisibility,
} from "./schema";
export type { Profile, NewProfile } from "./schema";
export type { Save, NewSave, SaveShelf } from "./schema";
export type { Follow, NewFollow } from "./schema";
export type { Report, NewReport, ReportStatus, ReportSeverity } from "./schema";
export type { Notification, NewNotification, NotificationType } from "./schema";
export type { Subscription, NewSubscription, SubscriptionStatus } from "./schema";
export type { Friendship, NewFriendship, FriendshipStatus } from "./schema";
export type { Block, NewBlock } from "./schema";
export type { Conversation, NewConversation } from "./schema";
export type { ConversationMember, NewConversationMember } from "./schema";
export type { Message, NewMessage } from "./schema";
export type { Community, NewCommunity, CommunityVisibility, CommunityRole } from "./schema";
export type { CommunityMember, NewCommunityMember } from "./schema";
export type { AuditLog, NewAuditLog, AuditTargetType } from "./schema";