/**
 * Mirror view helpers — pure tests, no database required.
 *
 * Verifies that the chronology and prompt behavior the UI promises are real:
 * newest-first ordering, month grouping, and prompts that never become a
 * mandatory gate.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  groupEntriesByMonth,
  MIRROR_PROMPTS,
  nextPrompt,
  sortEntriesNewestFirst,
  wasEdited,
  type MirrorEntryView,
} from "../mirror-view";

function entry(id: string, createdAt: string, overrides: Partial<MirrorEntryView> = {}): MirrorEntryView {
  return {
    id,
    body: `Reflection ${id}`,
    prompt: null,
    moodId: null,
    createdAt,
    ...overrides,
  };
}

describe("Mirror view helpers", () => {
  test("nextPrompt offers another opening and stays inside the catalog", () => {
    const current = MIRROR_PROMPTS[0];
    for (const roll of [0, 0.25, 0.5, 0.99]) {
      const next = nextPrompt(current, roll);
      assert.ok(MIRROR_PROMPTS.includes(next as (typeof MIRROR_PROMPTS)[number]));
      assert.notEqual(next, current);
    }
    assert.ok(MIRROR_PROMPTS.includes(nextPrompt(null, 0)));
  });

  test("sortEntriesNewestFirst orders by creation time without mutating input", () => {
    const input = [
      entry("old", "2026-01-05T12:00:00.000Z"),
      entry("new", "2026-03-02T12:00:00.000Z"),
      entry("mid", "2026-02-11T12:00:00.000Z"),
    ];
    const sorted = sortEntriesNewestFirst(input);
    assert.deepEqual(sorted.map((item) => item.id), ["new", "mid", "old"]);
    assert.deepEqual(input.map((item) => item.id), ["old", "new", "mid"]);
  });

  test("groupEntriesByMonth keeps months and entries newest first", () => {
    const groups = groupEntriesByMonth([
      entry("jan", "2026-01-05T12:00:00.000Z"),
      entry("mar-new", "2026-03-20T12:00:00.000Z"),
      entry("feb", "2026-02-11T12:00:00.000Z"),
      entry("mar-old", "2026-03-02T12:00:00.000Z"),
    ]);

    assert.deepEqual(groups.map((group) => group.entries.map((item) => item.id)), [
      ["mar-new", "mar-old"],
      ["feb"],
      ["jan"],
    ]);
    assert.match(groups[0].label, /2026/);
  });

  test("wasEdited only marks a genuinely later update", () => {
    const createdAt = "2026-03-02T12:00:00.000Z";
    assert.equal(wasEdited(entry("a", createdAt)), false);
    assert.equal(wasEdited(entry("b", createdAt, { updatedAt: createdAt })), false);
    assert.equal(wasEdited(entry("c", createdAt, { updatedAt: "2026-03-02T12:00:00.500Z" })), false);
    assert.equal(wasEdited(entry("d", createdAt, { updatedAt: "2026-03-03T09:00:00.000Z" })), true);
  });
});
