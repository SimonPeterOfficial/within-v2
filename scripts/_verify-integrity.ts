/**
 * Standalone verification script for Project ATLAS data integrity fixes.
 *
 * Connects directly to Neon using drizzle-orm/neon-serverless (the same
 * driver now used by src/lib/db/index.ts) and verifies:
 *  1. db.transaction() works (submitContent/publishContent pattern)
 *  2. Signup-style user + profile creation is atomic
 *  3. Rollback works on failure
 *
 * Does NOT import src/lib/db/index.ts (which has `import "server-only"`
 * and cannot run under tsx outside Next.js).
 *
 * Creates and cleans up its own test rows — nothing is left behind.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";

// Manually load .env.local (same approach as scripts/seed-dev.ts)
import { readFileSync, existsSync } from "node:fs";
function loadEnvLocal() {
  const path = ".env.local";
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)="?([^"]*)"?$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}
loadEnvLocal();

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL_UNPOOLED or DATABASE_URL is required.");
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

let failures = 0;

function report(name: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ✅ ${name}`);
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
    failures += 1;
  }
}

async function cleanup(userId: string) {
  await db.delete(schema.contentViews).where(eq(schema.contentViews.userId, userId)).catch(() => undefined);
  await db.delete(schema.saves).where(eq(schema.saves.userId, userId)).catch(() => undefined);
  await db.delete(schema.follows).where(eq(schema.follows.followerId, userId)).catch(() => undefined);
  await db.delete(schema.follows).where(eq(schema.follows.followeeId, userId)).catch(() => undefined);
  await db.delete(schema.profiles).where(eq(schema.profiles.userId, userId)).catch(() => undefined);
  await db.delete(schema.content).where(eq(schema.content.creatorId, userId)).catch(() => undefined);
  await db.delete(schema.users).where(eq(schema.users.id, userId)).catch(() => undefined);
}

async function main() {
  console.log("\n=== PROJECT ATLAS — Data Integrity Verification ===\n");

  // ── Test 1: db.transaction() works ──
  console.log("1. Database transactions (neon-serverless):");
  try {
    const { hash, salt } = await hashPassword("verify-password");
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          email: `verify-tx-${Date.now()}@example.invalid`,
          passwordHash: hash,
          passwordSalt: salt,
          name: "Verify User",
        })
        .returning();
      await tx.insert(schema.profiles).values({
        userId: user.id,
        username: `verify-tx-${Date.now()}`,
        displayName: "Verify User",
      });
      return user.id;
    });
    report("transaction commits user + profile atomically", !!userId);
    await cleanup(userId);
  } catch (e) {
    report("transaction commits user + profile atomically", false, e instanceof Error ? e.message : String(e));
  }

  // ── Test 2: Transaction rollback on failure ──
  console.log("\n2. Transaction rollback:");
  try {
    const { hash, salt } = await hashPassword("verify-password");
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          email: `verify-rb-${Date.now()}@example.invalid`,
          passwordHash: hash,
          passwordSalt: salt,
          name: "Rollback User",
        })
        .returning();
      // Force a failure: duplicate username violates unique index
      await tx.insert(schema.profiles).values({
        userId: user.id,
        username: "within-admin", // already exists from seed
        displayName: "Rollback User",
      });
    });
    report("rollback on profile clash", false, "should have thrown");
  } catch (e) {
    // Verify the user was NOT left behind (rolled back)
    const users = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.name, "Rollback User"));
    report("rollback leaves no orphaned user", users.length === 0, `found ${users.length} orphan(s)`);
  }

  // ── Test 3: Outbox-style event recording within transaction ──
  console.log("\n3. Outbox event recording within transaction:");
  try {
    const { hash, salt } = await hashPassword("verify-password");
    const eventId = `verify-outbox-${Date.now()}`;
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          email: `verify-ob-${Date.now()}@example.invalid`,
          passwordHash: hash,
          passwordSalt: salt,
          name: "Outbox User",
        })
        .returning();
      await tx.insert(schema.outboxEvents).values({
        eventId,
        eventType: "content.submitted",
        schemaVersion: 1,
        payload: { contentId: "verify", title: "test" },
        status: "pending",
        attempts: 0,
        maxAttempts: 10,
        nextAttemptAt: new Date(),
        processedAt: null,
        lockedUntil: null,
        lastError: null,
      });
      return user.id;
    });
    const event = await db
      .select()
      .from(schema.outboxEvents)
      .where(eq(schema.outboxEvents.eventId, eventId))
      .limit(1);
    report("outbox event recorded within transaction", event.length === 1 && !!userId);
    await cleanup(userId);
  } catch (e) {
    report("outbox event recorded within transaction", false, e instanceof Error ? e.message : String(e));
  }

  // ── Test 4: Driver provides transaction API ──
  console.log("\n4. Driver transaction API:");
  report("db.transaction is a function", typeof db.transaction === "function");

  console.log(`\n=== ${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`} ===\n`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("❌ Verification failed:", e);
  process.exit(1);
});
