/**
 * WithIn — DEVELOPMENT-ONLY seed.
 *
 * Loads the existing static catalogs (content.ts / creators.ts) into the
 * database as clearly-marked development data so the real platform can be
 * exercised end-to-end (profiles, discovery, content lifecycle).
 *
 * ── HARD GUARD ────────────────────────────────────────────────────────
 * This script REFUSES to run when NODE_ENV=production. It is never wired
 * into any production path; production starts empty and fills with real
 * user-created data.
 *
 * Dev credentials created here (password: "within-dev-password") exist
 * only for local development and are documented as such.
 *
 * Usage:  npm run seed:dev
 */

import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// Load .env.local without a dependency (dotenv is a transitive dep of Next —
// never rely on that outside the Next runtime). Only sets vars not already set.
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
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { ORIGINALS, STORIES, ALBUMS, BOOKS, PHOTOS } from "../src/lib/content";
import { CREATORS } from "../src/lib/creators";

if (process.env.NODE_ENV === "production") {
  console.error("❌ Refusing to seed in production. This script is DEVELOPMENT-ONLY.");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL is required. Add your Neon connection string to .env.local");
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

const DEV_PASSWORD = "within-dev-password";
const DEV_EMAIL_SUFFIX = "@within.dev";

async function main() {
  const passwordHash = await hashPassword(DEV_PASSWORD);
  const passwordSalt = passwordHash.salt;
  const hash = passwordHash.hash;

  // ── Users: one per creator + a dev admin + a plain member ──────────
  let createdUsers = 0;
  const creatorUsers: Record<string, string> = {}; // creator catalog id → user id

  for (const creator of CREATORS) {
    const email = `dev-${creator.id}${DEV_EMAIL_SUFFIX}`;
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (existing.length > 0) {
      creatorUsers[creator.id] = existing[0].id;
      continue;
    }
    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash: hash,
        passwordSalt: passwordSalt,
        name: creator.name,
        role: "creator",
      })
      .returning({ id: schema.users.id });
    await db.insert(schema.profiles).values({
      userId: user.id,
      username: creator.id,
      displayName: creator.name,
      bio: creator.bio,
      avatar: creator.avatar,
      gradient: creator.gradient,
      category: creator.categories[0],
    });
    creatorUsers[creator.id] = user.id;
    createdUsers += 1;
  }

  const adminEmail = `dev-admin${DEV_EMAIL_SUFFIX}`;
  const existingAdmin = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, adminEmail)).limit(1);
  if (existingAdmin.length === 0) {
    const [admin] = await db
      .insert(schema.users)
      .values({ email: adminEmail, passwordHash: hash, passwordSalt: passwordSalt, name: "WithIn Admin", role: "super_admin" })
      .returning({ id: schema.users.id });
    await db.insert(schema.profiles).values({
      userId: admin.id,
      username: "within-admin",
      displayName: "WithIn Admin",
      bio: "The dev administrator account.",
      avatar: "🛡️",
      gradient: "from-emerald-500 to-teal-700",
    });
    createdUsers += 1;
  }

  // ── Content: the existing catalogs, published, owned by their creators ──
  let createdContent = 0;
  const publishOffsetDays = (index: number) => new Date(Date.now() - index * 24 * 60 * 60 * 1000);

  const contentRows: (typeof schema.content.$inferInsert)[] = [];

  const resolveCreator = (attribution?: string): string | null => {
    if (!attribution) return null;
    const match = CREATORS.find(
      (c) => c.name === attribution || c.name.toLowerCase() === attribution.toLowerCase(),
    );
    return match ? creatorUsers[match.id] ?? null : null;
  };

  const fallbackCreator = CREATORS[0] ? (creatorUsers[CREATORS[0].id] ?? null) : null;
  if (!fallbackCreator) {
    console.error("❌ Could not resolve a fallback creator — did user seeding fail?");
    process.exit(1);
  }

  for (const [index, item] of ORIGINALS.entries()) {
    const type = item.kind === "book" ? "book" : item.kind === "series" ? "video" : "film";
    contentRows.push({
      creatorId: resolveCreator(item.creator) ?? fallbackCreator,
      type,
      title: item.title,
      description: item.description,
      attribution: item.creator,
      category: item.category,
      tags: item.tags,
      coverGradient: item.cover.gradient,
      coverEmoji: item.cover.emoji,
      status: "published",
      publishedAt: publishOffsetDays(index),
    });
  }
  for (const [index, item] of STORIES.entries()) {
    contentRows.push({
      creatorId: resolveCreator(item.by) ?? fallbackCreator,
      type: "story",
      title: item.title,
      description: item.description,
      attribution: item.by,
      category: item.category,
      tags: item.tags,
      coverGradient: item.cover.gradient,
      coverEmoji: item.cover.emoji,
      status: "published",
      publishedAt: publishOffsetDays(index),
    });
  }
  for (const [index, item] of ALBUMS.entries()) {
    contentRows.push({
      creatorId: resolveCreator(item.artist) ?? fallbackCreator,
      type: "audio",
      title: item.title,
      description: item.description,
      attribution: item.artist,
      category: item.category,
      tags: item.tags,
      coverGradient: item.cover.gradient,
      coverEmoji: item.cover.emoji,
      status: "published",
      publishedAt: publishOffsetDays(index),
    });
  }
  for (const [index, item] of BOOKS.entries()) {
    contentRows.push({
      creatorId: resolveCreator(item.author) ?? fallbackCreator,
      type: "book",
      title: item.title,
      description: item.description,
      attribution: item.author,
      category: item.category,
      tags: item.tags,
      coverGradient: item.cover.gradient,
      coverEmoji: item.cover.emoji,
      status: "published",
      publishedAt: publishOffsetDays(index),
    });
  }
  for (const [index, item] of PHOTOS.entries()) {
    contentRows.push({
      creatorId: resolveCreator(item.by) ?? fallbackCreator,
      type: "image",
      title: item.title,
      description: item.description,
      attribution: item.by,
      category: item.category,
      tags: item.tags,
      coverGradient: item.cover.gradient,
      coverEmoji: item.cover.emoji,
      status: "published",
      publishedAt: publishOffsetDays(index),
    });
  }

  for (const row of contentRows) {
    const existing = await db
      .select({ id: schema.content.id })
      .from(schema.content)
      .where(eq(schema.content.title, row.title))
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(schema.content).values(row);
    createdContent += 1;
  }

  console.log(`\n✅ DEV SEED COMPLETE`);
  console.log(`   users created:   ${createdUsers}`);
  console.log(`   content created: ${createdContent}`);
  console.log(`\n   Dev sign-in (development only):`);
  console.log(`   admin:   dev-admin@within.dev  / ${DEV_PASSWORD}`);
  console.log(`   creator: dev-mira-okoye@within.dev / ${DEV_PASSWORD}`);
  console.log(`\n   ⚠️  NEVER run this against production.`);
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});