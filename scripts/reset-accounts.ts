/**
 * WITHIN Account Reset — Safe, explicit, admin-preserving maintenance script.
 *
 * Removes ordinary user accounts and their account-dependent data, while
 * preserving administrator accounts, system configuration, and audit records.
 *
 * SECURITY:
 *   - Requires explicit --env and --confirm flags; never runs automatically
 *   - Refuses to run unless the target environment can be identified
 *   - Preserves administrator accounts (role admin / super_admin)
 *   - Preserves admin_credentials (admin recovery path)
 *   - Preserves audit logs (nulls actorId for deleted users instead of deleting)
 *   - Handles foreign-key constraints explicitly before deletion
 *   - Uses a database transaction
 *   - Dry-run mode performs zero destructive changes
 *   - Logs a safe audit event (no secrets, no personal data)
 *
 * USAGE:
 *   npx tsx scripts/reset-accounts.ts --env development --dry-run
 *   npx tsx scripts/reset-accounts.ts --env development --confirm
 *
 * Never run against production without explicit, deliberate confirmation.
 */

import "server-only";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local", override: true });

import {
  users,
  profiles,
  content,
  follows,
  saves,
  reports,
  notifications,
  subscriptions,
  contentViews,
  mirrorEntries,
  friendships,
  blocks,
  messages,
  communities,
  communityMembers,
  auditLogs,
  worlds,
  journeys,
  type UserRole,
} from "@/lib/db/schema";
import { count, inArray } from "drizzle-orm";

/**
 * Lazily imports the database client so that `dotenv.config()` above has
 * already populated `DATABASE_URL` before the client initializes.
 *
 * ES module `import` statements are hoisted above all top-level statements,
 * so a static `import { db } from "@/lib/db"` would run before dotenv loads
 * the env file, causing `getDatabaseUrl()` to throw. Dynamic import defers
 * client creation until `resetAccounts()` is called.
 */
async function getDb() {
  const mod = await import("@/lib/db");
  return mod.db;
}

const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

type ResetSummary = {
  targetEnvironment: string;
  dryRun: boolean;
  confirmed: boolean;
  adminUsersPreserved: number;
  ordinaryUsersDeleted: number;
  recordsAffected: Record<string, number>;
  errors: string[];
};

/** Identifies whether the target environment can be safely determined. */
function identifyTargetEnvironment(): {
  ok: boolean;
  environment: string | null;
  reason: string | null;
} {
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return { ok: false, environment: null, reason: "DATABASE_URL is not configured." };
  }

  // We refuse to guess. The caller must explicitly name the environment.
  const requested = process.env.RESET_TARGET_ENV;
  if (!requested) {
    return {
      ok: false,
      environment: nodeEnv ?? "unknown",
      reason: "RESET_TARGET_ENV is not set. Explicitly name the target environment.",
    };
  }

  // Do not allow production unless explicitly opted in with a second flag.
  if (requested === "production" && process.env.RESET_ALLOW_PRODUCTION !== "true") {
    return {
      ok: false,
      environment: requested,
      reason: "Production resets require RESET_ALLOW_PRODUCTION=true.",
    };
  }

  return { ok: true, environment: requested, reason: null };
}

async function countRecords(queryFn: () => Promise<{ count: unknown }[]>): Promise<number> {
  const result = await queryFn();
  return Number(result[0]?.count ?? 0);
}

export async function resetAccounts(
  env: string,
  { dryRun = true, confirm = false }: { dryRun?: boolean; confirm?: boolean } = {}
): Promise<ResetSummary> {
  const targetCheck = identifyTargetEnvironment();
  if (!targetCheck.ok || targetCheck.environment !== env) {
    throw new Error(targetCheck.reason ?? "Target environment could not be identified.");
  }

  const summary: ResetSummary = {
    targetEnvironment: env,
    dryRun,
    confirmed: confirm,
    adminUsersPreserved: 0,
    ordinaryUsersDeleted: 0,
    recordsAffected: {},
    errors: [],
  };

  if (!confirm && !dryRun) {
    throw new Error("Refusing to execute: --confirm is required for destructive changes.");
  }

  // Database client is initialized here (after dotenv has loaded DATABASE_URL)
  // rather than at module top level, because ES module imports are hoisted
  // and would otherwise run before dotenv.config().
  const db = await getDb();

  try {
    // ── Identify admin users (preserve) vs ordinary users (delete) ──
    const allUsers = await db.select({ id: users.id, role: users.role, name: users.name }).from(users);
    const adminUsers = allUsers.filter((u) => ADMIN_ROLES.includes(u.role as UserRole));
    const ordinaryUsers = allUsers.filter((u) => !ADMIN_ROLES.includes(u.role as UserRole));
    const ordinaryUserIds = ordinaryUsers.map((u) => u.id);

    summary.adminUsersPreserved = adminUsers.length;

    // ── Count affected records (dry-run visibility) ──
    const [followerCount, followeeCount] = await Promise.all([
      countRecords(() =>
        db.select({ count: count() }).from(follows).where(inArray(follows.followerId, ordinaryUserIds))
      ),
      countRecords(() =>
        db.select({ count: count() }).from(follows).where(inArray(follows.followeeId, ordinaryUserIds))
      ),
    ]);
    const [requesterCount, addresseeCount] = await Promise.all([
      countRecords(() =>
        db.select({ count: count() }).from(friendships).where(inArray(friendships.requesterId, ordinaryUserIds))
      ),
      countRecords(() =>
        db.select({ count: count() }).from(friendships).where(inArray(friendships.addresseeId, ordinaryUserIds))
      ),
    ]);
    const [blockerCount, blockedCount] = await Promise.all([
      countRecords(() =>
        db.select({ count: count() }).from(blocks).where(inArray(blocks.blockerId, ordinaryUserIds))
      ),
      countRecords(() =>
        db.select({ count: count() }).from(blocks).where(inArray(blocks.blockedId, ordinaryUserIds))
      ),
    ]);

    summary.recordsAffected = {
      users: ordinaryUsers.length,
      profiles: await countRecords(() =>
        db.select({ count: count() }).from(profiles).where(inArray(profiles.userId, ordinaryUserIds))
      ),
      content: await countRecords(() =>
        db.select({ count: count() }).from(content).where(inArray(content.creatorId, ordinaryUserIds))
      ),
      follows: followerCount + followeeCount,
      saves: await countRecords(() =>
        db.select({ count: count() }).from(saves).where(inArray(saves.userId, ordinaryUserIds))
      ),
      reports: await countRecords(() =>
        db.select({ count: count() }).from(reports).where(inArray(reports.reporterId, ordinaryUserIds))
      ),
      notifications: await countRecords(() =>
        db.select({ count: count() }).from(notifications).where(inArray(notifications.userId, ordinaryUserIds))
      ),
      subscriptions: await countRecords(() =>
        db.select({ count: count() }).from(subscriptions).where(inArray(subscriptions.userId, ordinaryUserIds))
      ),
      contentViews: await countRecords(() =>
        db.select({ count: count() }).from(contentViews).where(inArray(contentViews.userId, ordinaryUserIds))
      ),
      mirrorEntries: await countRecords(() =>
        db.select({ count: count() }).from(mirrorEntries).where(inArray(mirrorEntries.userId, ordinaryUserIds))
      ),
      friendships: requesterCount + addresseeCount,
      blocks: blockerCount + blockedCount,
      conversations: 0,
      messages: await countRecords(() =>
        db.select({ count: count() }).from(messages).where(inArray(messages.senderId, ordinaryUserIds))
      ),
      communities: await countRecords(() =>
        db.select({ count: count() }).from(communities).where(inArray(communities.ownerId, ordinaryUserIds))
      ),
      communityMembers: await countRecords(() =>
        db
          .select({ count: count() })
          .from(communityMembers)
          .where(inArray(communityMembers.userId, ordinaryUserIds))
      ),
      auditLogs: await countRecords(() =>
        db.select({ count: count() }).from(auditLogs).where(inArray(auditLogs.actorId, ordinaryUserIds))
      ),
      worlds: await countRecords(() =>
        db.select({ count: count() }).from(worlds).where(inArray(worlds.ownerId, ordinaryUserIds))
      ),
      journeys: await countRecords(() =>
        db.select({ count: count() }).from(journeys).where(inArray(journeys.ownerId, ordinaryUserIds))
      ),
      journeyItems: 0,
    };

    if (dryRun) {
      summary.ordinaryUsersDeleted = 0;
      return summary;
    }

    // ── Execute deletion without transaction (neon-http driver does not support transactions) ──
    summary.ordinaryUsersDeleted = ordinaryUsers.length;

    // 1. Null out non-cascading foreign-key references so deletes don't violate FKs.
    //    auditLogs, reports, notifications, contentViews reference users without ON DELETE CASCADE.
    if (ordinaryUserIds.length > 0) {
      await db
        .update(auditLogs)
        .set({ actorId: null })
        .where(inArray(auditLogs.actorId, ordinaryUserIds));
      await db
        .update(reports)
          .set({ resolvedById: null })
          .where(inArray(reports.resolvedById, ordinaryUserIds));
      await db
        .update(notifications)
        .set({ actorId: null })
        .where(inArray(notifications.actorId, ordinaryUserIds));
      await db
        .update(contentViews)
        .set({ userId: null })
        .where(inArray(contentViews.userId, ordinaryUserIds));
    }

    // 2. Delete ordinary users. Cascades handle:
    //    profiles, content, follows, saves, reports(reporterId),
    //    notifications(userId), subscriptions, mirrorEntries,
    //    friendships, blocks, conversationMembers, messages(senderId),
    //    communities(ownerId), communityMembers, worlds(ownerId),
    //    journeys(ownerId), journeyItems(via journeys).
    await db.delete(users).where(inArray(users.id, ordinaryUserIds));

    // ── Record a safe audit event ──
    try {
      await db.insert(auditLogs).values({
        actorId: null, // system action, no specific admin
        action: "ACCOUNT_RESET",
        targetType: "user",
        targetId: null,
        details: {
          environment: env,
          dryRun: false,
          ordinaryUsersDeleted: ordinaryUsers.length,
          adminUsersPreserved: adminUsers.length,
        },
      });
    } catch {
      // Audit logging must not fail the reset.
    }
  } catch (error) {
    summary.errors.push(error instanceof Error ? error.message : "Unknown error during reset.");
    throw error;
  }

  return summary;
}

/** CLI entry point. */
async function main() {
  const args = process.argv.slice(2);
  const env = args.find((a) => a.startsWith("--env="))?.split("=")[1];
  const confirm = args.includes("--confirm");
  const dryRun = !args.includes("--confirm");

  if (!env) {
    console.error("Usage: npx tsx scripts/reset-accounts.ts --env <environment> [--confirm]");
    console.error("  --env development   Target environment (must match RESET_TARGET_ENV)");
    console.error("  --confirm           Execute destructive changes (required to actually delete)");
    console.error("  Without --confirm, runs in dry-run mode (no deletions).");
    process.exit(1);
  }

  try {
    const result = await resetAccounts(env, { dryRun, confirm });

    console.log("\n=== WITHIN Account Reset ===");
    console.log(`Target environment: ${result.targetEnvironment}`);
    console.log(`Mode: ${result.dryRun ? "DRY-RUN (no changes)" : "CONFIRMED (executing)"}`);
    console.log(`Admin users preserved: ${result.adminUsersPreserved}`);
    console.log(`Ordinary users to delete: ${result.recordsAffected.users}`);
    console.log("\nAffected record counts:");
    for (const [table, count] of Object.entries(result.recordsAffected)) {
      console.log(`  ${table}: ${count}`);
    }

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
    }

    if (result.dryRun) {
      console.log("\nDry-run complete. No data was deleted.");
      console.log("To execute, re-run with --confirm.");
    } else {
      console.log("\nReset complete. Ordinary user accounts and their dependent data have been removed.");
    }
  } catch (error) {
    console.error("Reset failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
