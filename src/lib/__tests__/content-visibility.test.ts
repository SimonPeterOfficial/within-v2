/**
 * Content discovery & access visibility tests.
 *
 * Verifies that public discovery never exposes drafts, archived,
 * moderation-pending, or non-public content, and that access to a single
 * content item respects status + visibility + ownership/moderation.
 *
 * Runs against the real configured database (DATABASE_URL). Every test is
 * self-contained: it creates its own fixture rows, asserts, and deletes
 * them, so nothing is left behind and no test depends on shared state.
 *
 * NOTE: node:test runs `describe` subtests after the describe body
 * completes, so shared setup + a shared `finally { cleanup() }` would wipe
 * fixtures before the subtests execute. Hence each test cleans up itself.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import assert from "node:assert";
import { eq, like } from "drizzle-orm";
import { describe, test } from "node:test";
import {
  createContentLink,
  deleteContentLink,
  getContentLinksForContent,
} from "@/lib/content-links";

type ContentVisibility = "public" | "unlisted" | "private";
type ContentStatus =
  | "draft"
  | "submitted"
  | "reviewing"
  | "approved"
  | "published"
  | "hidden"
  | "archived";

const TEST_PREFIX = "test-visibility-";

async function bootstrap() {
  const { db, users, profiles, content: contentTable, contentLinks } = await import("@/lib/db");
  const { hashPassword } = await import("@/lib/auth/password");
  const {
    listPublishedContent,
    countPublishedContent,
    getContentForViewer,
    listPublishedByCreator,
  } = await import("@/lib/content-service");
  const { findSerendipity } = await import("@/lib/serendipity");
  return { db, users, profiles, content: contentTable, contentLinks, hashPassword,
    listPublishedContent, countPublishedContent, getContentForViewer,
    listPublishedByCreator, findSerendipity };
}

describe("Content discovery visibility", async () => {
  const {
    db,
    users,
    profiles,
    content: contentTable,
    contentLinks,
    hashPassword,
    listPublishedContent,
    countPublishedContent,
    getContentForViewer,
    listPublishedByCreator,
    findSerendipity,
  } = await bootstrap();

  // Idempotency: remove any fixture data left behind by an interrupted prior run.
  await db.delete(contentTable).where(like(contentTable.title, `${TEST_PREFIX}%`));
  await db.delete(profiles).where(like(profiles.username, `${TEST_PREFIX}%`));
  await db.delete(users).where(like(users.email, `${TEST_PREFIX}%@example.invalid`));

  async function createUserWithProfile(name: string, role: "user" | "creator" | "moderator" | "admin" | "super_admin" = "user") {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { hash, salt } = await hashPassword("test-password");
    const [user] = await db
      .insert(users)
      .values({
        email: `${TEST_PREFIX}${name}-${unique}@example.invalid`,
        passwordHash: hash,
        passwordSalt: salt,
        name: `${TEST_PREFIX}${name}`,
        role,
      })
      .returning();
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: user.id,
        username: `${TEST_PREFIX}${name}-${unique}`,
        displayName: `${TEST_PREFIX}${name}-${unique}`,
      })
      .returning();
    return { user, profile };
  }

  async function createContent(
    creatorId: string,
    overrides: Partial<{ status: ContentStatus; visibility: ContentVisibility; title: string }>,
  ) {
    const [row] = await db
      .insert(contentTable)
      .values({
        creatorId,
        type: "story",
        title: overrides.title ?? `${TEST_PREFIX}story`,
        status: overrides.status ?? "published",
        visibility: overrides.visibility ?? "public",
      })
      .returning();
    return row;
  }

  async function fullCleanup(ids: { users: string[]; profiles: string[]; contents: string[] }) {
    for (const id of ids.contents) {
      await db.delete(contentTable).where(eq(contentTable.id, id));
    }
    for (const id of ids.profiles) {
      await db.delete(profiles).where(eq(profiles.id, id));
    }
    for (const id of ids.users) {
      await db.delete(users).where(eq(users.id, id));
    }
  }

  await test("1. public, published content appears in public discovery", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const pub = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}public-published` });
    try {
      const entries = await listPublishedContent({ limit: 50 });
      assert.ok(entries.some((e) => e.id === pub.id), "expected public published content to appear in discovery");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [pub.id] });
    }
  });

  await test("2. unlisted content does not appear in public discovery", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const unlisted = await createContent(user.id, { status: "published", visibility: "unlisted", title: `${TEST_PREFIX}unlisted-published` });
    try {
      const entries = await listPublishedContent({ limit: 50 });
      assert.ok(!entries.some((e) => e.id === unlisted.id), "expected unlisted content to NOT appear in discovery");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [unlisted.id] });
    }
  });

  await test("3. draft content does not appear in public discovery", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const draft = await createContent(user.id, { status: "draft", visibility: "public" });
    try {
      const entries = await listPublishedContent({ limit: 50 });
      assert.ok(!entries.some((e) => e.id === draft.id), "expected draft content to NOT appear in discovery");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [draft.id] });
    }
  });

  await test("4. archived content does not appear in public discovery", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const archived = await createContent(user.id, { status: "archived", visibility: "public" });
    try {
      const entries = await listPublishedContent({ limit: 50 });
      assert.ok(!entries.some((e) => e.id === archived.id), "expected archived content to NOT appear in discovery");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [archived.id] });
    }
  });

  await test("5. content awaiting moderation (submitted) does not appear in public discovery", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const submitted = await createContent(user.id, { status: "submitted", visibility: "public" });
    try {
      const entries = await listPublishedContent({ limit: 50 });
      assert.ok(!entries.some((e) => e.id === submitted.id), "expected submitted content to NOT appear in discovery");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [submitted.id] });
    }
  });

  await test("6. countPublishedContent only counts public published content", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const pub = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}count-pub` });
    try {
      const count = await countPublishedContent();
      const { and } = await import("drizzle-orm");
      const rows = await db
        .select({ id: contentTable.id })
        .from(contentTable)
        .where(and(eq(contentTable.status, "published"), eq(contentTable.visibility, "public")));
      assert.strictEqual(count, rows.length);
      assert.ok(count >= 1, "expected at least the public fixture to be counted");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [pub.id] });
    }
  });

  await test("7. owner can access their own private content via the authorized path", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const priv = await createContent(user.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}private-published` });
    try {
      const item = await getContentForViewer(priv.id, user.id);
      assert.ok(item, "expected owner to access their own private content");
      assert.strictEqual(item.row.id, priv.id);
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [priv.id] });
    }
  });

  await test("8. unauthorized user cannot access another's private content by id", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: bob, profile: bobProfile } = await createUserWithProfile("bob-stranger");
    const priv = await createContent(alice.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}stranger-private` });
    try {
      const item = await getContentForViewer(priv.id, bob.id);
      assert.strictEqual(item, null, "expected non-owner to NOT access private content");
    } finally {
      await fullCleanup({ users: [alice.id, bob.id], profiles: [aliceProfile.id, bobProfile.id], contents: [priv.id] });
    }
  });

  await test("9. unlisted content remains retrievable by id (by design, never listed)", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: bob, profile: bobProfile } = await createUserWithProfile("bob-stranger");
    const unlisted = await createContent(alice.id, { status: "published", visibility: "unlisted", title: `${TEST_PREFIX}unlisted-retrievable` });
    try {
      const listed = await listPublishedContent({ limit: 50 });
      assert.ok(!listed.some((e) => e.id === unlisted.id), "expected unlisted content to NOT be listed");
      const byId = await getContentForViewer(unlisted.id, bob.id);
      assert.ok(byId, "expected unlisted content to be retrievable by id for any caller");
    } finally {
      await fullCleanup({ users: [alice.id, bob.id], profiles: [aliceProfile.id, bobProfile.id], contents: [unlisted.id] });
    }
  });

  await test("10. search path (listPublishedContent with query) respects visibility", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const pub = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}searchable-public` });
    const priv = await createContent(user.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}searchable-private` });
    const draft = await createContent(user.id, { status: "draft", visibility: "public", title: `${TEST_PREFIX}searchable-draft` });
    try {
      const results = await listPublishedContent({ query: "searchable-public", limit: 50 });
      assert.ok(results.some((e) => e.id === pub.id), "expected search to return public published fixture");
      assert.ok(!results.some((e) => e.id === priv.id), "expected search to NOT return private fixture");
      assert.ok(!results.some((e) => e.id === draft.id), "expected search to NOT return draft fixture");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [pub.id, priv.id, draft.id] });
    }
  });

  await test("11. serendipity discovery respects visibility (no non-public content)", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: bob, profile: bobProfile } = await createUserWithProfile("bob-stranger");
    const unlisted = await createContent(alice.id, { status: "published", visibility: "unlisted", title: `${TEST_PREFIX}serendipity-unlisted` });
    const priv = await createContent(alice.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}serendipity-private` });
    const draft = await createContent(alice.id, { status: "draft", visibility: "public", title: `${TEST_PREFIX}serendipity-draft` });
    try {
      const items = await findSerendipity(bob.id);
      const ids = new Set(items.map((i) => i.id));
      assert.ok(!ids.has(unlisted.id), "expected serendipity to NOT surface unlisted content");
      assert.ok(!ids.has(priv.id), "expected serendipity to NOT surface private content");
      assert.ok(!ids.has(draft.id), "expected serendipity to NOT surface draft content");
    } finally {
      await fullCleanup({ users: [alice.id, bob.id], profiles: [aliceProfile.id, bobProfile.id], contents: [unlisted.id, priv.id, draft.id] });
    }
  });

  await test("12. listPublishedByCreator only returns public published content", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const pub = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}creator-public` });
    const unlisted = await createContent(user.id, { status: "published", visibility: "unlisted", title: `${TEST_PREFIX}creator-unlisted` });
    const priv = await createContent(user.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}creator-private` });
    const draft = await createContent(user.id, { status: "draft", visibility: "public", title: `${TEST_PREFIX}creator-draft` });
    try {
      const rows = await listPublishedByCreator(user.id);
      const ids = new Set(rows.map((r) => r.id));
      assert.ok(ids.has(pub.id), "expected creator's public published content");
      assert.ok(!ids.has(unlisted.id), "expected public profile to NOT expose unlisted content");
      assert.ok(!ids.has(priv.id), "expected public profile to NOT expose private content");
      assert.ok(!ids.has(draft.id), "expected public profile to NOT expose draft content");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [pub.id, unlisted.id, priv.id, draft.id] });
    }
  });

  await test("13. moderator can access another user's private content via the authorized path", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: mod, profile: modProfile } = await createUserWithProfile("mod-user", "moderator");
    const priv = await createContent(alice.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}mod-private` });
    try {
      const item = await getContentForViewer(priv.id, mod.id);
      assert.ok(item, "expected moderator to access another user's private content");
      assert.strictEqual(item.row.id, priv.id);
    } finally {
      await fullCleanup({ users: [alice.id, mod.id], profiles: [aliceProfile.id, modProfile.id], contents: [priv.id] });
    }
  });

  await test("14. moderator can access another user's draft content via the authorized path", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: mod, profile: modProfile } = await createUserWithProfile("mod-user", "moderator");
    const draft = await createContent(alice.id, { status: "draft", visibility: "public", title: `${TEST_PREFIX}mod-draft` });
    try {
      const item = await getContentForViewer(draft.id, mod.id);
      assert.ok(item, "expected moderator to access another user's draft content");
      assert.strictEqual(item.row.id, draft.id);
    } finally {
      await fullCleanup({ users: [alice.id, mod.id], profiles: [aliceProfile.id, modProfile.id], contents: [draft.id] });
    }
  });

  await test("15. caller can create a link between two viewable public content items", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const a = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-a` });
    const b = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-b` });
    try {
      const result = await createContentLink(user.id, {
        sourceContentId: a.id,
        targetContentId: b.id,
        linkType: "inspired-by",
        context: "This inspired that.",
      });
      assert.ok(result.ok, "expected link creation to succeed");
      assert.strictEqual(result.link.sourceContentId, a.id);
      assert.strictEqual(result.link.targetContentId, b.id);
      assert.strictEqual(result.link.linkType, "inspired-by");
      assert.strictEqual(result.link.context, "This inspired that.");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [a.id, b.id] });
    }
  });

  await test("16. links between content items are retrievable for the content", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const a = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-retrieve-a` });
    const b = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-retrieve-b` });
    await createContentLink(user.id, { sourceContentId: a.id, targetContentId: b.id, linkType: "responds-to" });
    try {
      const links = await getContentLinksForContent(a.id, user.id);
      assert.ok(links.some((l) => l.targetContentId === b.id), "expected link to be retrievable for source content");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [a.id, b.id] });
    }
  });

  await test("17. caller cannot link to content they cannot view", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: bob, profile: bobProfile } = await createUserWithProfile("bob-stranger");
    const priv = await createContent(alice.id, { status: "published", visibility: "private", title: `${TEST_PREFIX}link-private` });
    const pub = await createContent(alice.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-pub` });
    try {
      const result = await createContentLink(bob.id, {
        sourceContentId: pub.id,
        targetContentId: priv.id,
        linkType: "references",
      });
      if (result.ok) {
        assert.fail("expected link to private content to be rejected for non-viewer");
      } else {
        assert.strictEqual(result.error, "Target content not found or not viewable.");
      }
    } finally {
      await fullCleanup({ users: [alice.id, bob.id], profiles: [aliceProfile.id, bobProfile.id], contents: [priv.id, pub.id] });
    }
  });

  await test("18. caller cannot link a content item to itself", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const a = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-self` });
    try {
      const result = await createContentLink(user.id, {
        sourceContentId: a.id,
        targetContentId: a.id,
        linkType: "responds-to",
      });
      assert.strictEqual(result.ok, false, "expected self-link to be rejected");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [a.id] });
    }
  });

  await test("19. only the link creator can delete a link", async () => {
    const { user: alice, profile: aliceProfile } = await createUserWithProfile("alice-owner");
    const { user: bob, profile: bobProfile } = await createUserWithProfile("bob-stranger");
    const a = await createContent(alice.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-delete-a` });
    const b = await createContent(alice.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-delete-b` });
    const result = await createContentLink(alice.id, {
      sourceContentId: a.id,
      targetContentId: b.id,
      linkType: "contradicts",
    });
    assert.ok(result.ok);
    try {
      const deleted = await deleteContentLink(bob.id, result.link.id);
      assert.strictEqual(deleted.ok, false, "expected non-creator deletion to be rejected");
    } finally {
      // Clean up the link regardless of delete result
      await db.delete(contentLinks).where(eq(contentLinks.id, result.link.id));
      await fullCleanup({ users: [alice.id, bob.id], profiles: [aliceProfile.id, bobProfile.id], contents: [a.id, b.id] });
    }
  });

  await test("20. link creator can delete their own link", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    const a = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-owner-delete-a` });
    const b = await createContent(user.id, { status: "published", visibility: "public", title: `${TEST_PREFIX}link-owner-delete-b` });
    const result = await createContentLink(user.id, {
      sourceContentId: a.id,
      targetContentId: b.id,
      linkType: "responds-to",
    });
    assert.ok(result.ok);
    try {
      const deleted = await deleteContentLink(user.id, result.link.id);
      assert.strictEqual(deleted.ok, true, "expected creator deletion to succeed");
    } finally {
      await fullCleanup({ users: [user.id], profiles: [profile.id], contents: [a.id, b.id] });
    }
  });
});
