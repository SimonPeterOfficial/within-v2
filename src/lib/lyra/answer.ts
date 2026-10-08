/**
 * Lyra — the factual answer layer.
 *
 * Deliberately small and deterministic. It answers the questions a user
 * might ask about their own WithIn state, using only the same real services
 * the UI would use, then stops. No hallucinated memory, no psychological
 * reading, no engagement optimization: either the answer comes straight
 * from stored truth or the answer is an honest "I don't know that."
 */

import { and, count, eq } from "drizzle-orm";
import { db, content } from "@/lib/db";
import { listSaves } from "@/lib/interactions";
import { listOwnerWorlds } from "@/lib/worlds";
import { listMirrorEntries } from "@/lib/mirror";
import { formatWithinTime } from "@/lib/within-time";

export type LyraAnswer = {
  reply: string;
  /** The factual basis used — kept for transparency and testing. */
  basis: string;
};

function normalize(q: string): string {
  return q.toLowerCase().replace(/[^\w\s]/g, "");
}

/**
 * Answers a small, explicit set of factual questions about the caller's own
 * world. No other questions are answered. When nothing matches, it says so.
 */
export async function answerLyraQuestion(question: string, userId: string): Promise<LyraAnswer> {
  const q = normalize(question);

  if (/(what time|current time|the time)/.test(q)) {
    return {
      reply: `It's ${formatWithinTime(new Date(), { style: "short" })} where you are.`,
      basis: "real local time via within-time",
    };
  }

  if (/(save|saved|kept)/.test(q)) {
    const saves = await listSaves(userId, "saved");
    const latest = saves.slice(0, 3).map((s) => s.title).filter(Boolean);
    return {
      reply: saves.length === 0
        ? "You haven't kept anything yet — your Library is empty."
        : `You have kept ${saves.length} item${saves.length === 1 ? "" : "s"}.${latest.length ? ` Most recently: ${latest.join(", ")}.` : ""}`,
      basis: "saves shelf",
    };
  }

  if (/(draft|unfinished|working on)/.test(q)) {
    const rows = await db
      .select({ n: count() })
      .from(content)
      .where(and(eq(content.creatorId, userId), eq(content.status, "draft")));
    const n = Number(rows[0]?.n ?? 0);
    return {
      reply: n === 0
        ? "You have no open drafts right now."
        : `You have ${n} draft${n === 1 ? "" : "s"} in progress.`,
      basis: "content.status = draft",
    };
  }

  if (/(world|worlds)/.test(q) && /(my|made|built|created|have)/.test(q)) {
    const worlds = await listOwnerWorlds(userId, 5);
    if (worlds.length === 0) {
      return { reply: "You haven't built any Worlds yet.", basis: "worlds.ownerId" };
    }
    return {
      reply: `You have ${worlds.length} world${worlds.length === 1 ? "" : "s"}: ${worlds.map((w) => w.title).join(", ")}.`,
      basis: "worlds.ownerId",
    };
  }

  if (/(reflect|mirror|reflection)/.test(q)) {
    const entries = await listMirrorEntries(userId, 10);
    return {
      reply: entries.length === 0
        ? "No reflections recorded yet — your Mirror is quiet."
        : `You have ${entries.length} private reflection${entries.length === 1 ? "" : "s"} in your Mirror.`,
      basis: "mirror_entries",
    };
  }

  // Default: honest refusal to fabricate.
  return {
    reply: "I can tell you factual things about your own WithIn — your saves, drafts, worlds, reflections, or the current time. Ask me one of those.",
    basis: "capability boundary",
  };
}
