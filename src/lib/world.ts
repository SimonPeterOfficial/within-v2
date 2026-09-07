/**
 * The World Layer — WITHIN's heartbeat (server-side).
 *
 * An invisible coordinator: it reads legitimate platform activity (real
 * rows only) and turns it into a small, honest picture of the world. It
 * never touches private user data and never infers emotional states —
 * "the Studio is busy tonight" is a count of real publications, not a
 * mood reading.
 *
 * Consumers: /api/world (Home whisper, Auri context), Lyra world-state.
 * Deliberately cheap: a handful of aggregate counts, cacheable, no
 * per-render computation, no user-specific data.
 */

import "server-only";
import { and, count, desc, eq, gt } from "drizzle-orm";
import { db, content, communityMembers, users } from "@/lib/db";
import { observeTime } from "@/lib/lyra";

/** The metaphorical weather of the platform — derived from real activity. */
export type WithinWeather = "quiet" | "calm" | "creative" | "busy" | "celebrating";

/** One honest moment for "Today in WithIn" — only when something is real. */
export type WorldMoment = {
  kind: "new_work" | "new_creators" | "gathering";
  title: string;
  /** Where the moment leads (a real route). */
  href: string;
};

export type WorldPulse = {
  /** Metaphorical weather — from legitimate platform activity only. */
  weather: WithinWeather;
  /** Real counts backing the weather (for debugging + honesty). */
  activity: {
    publishedLast7Days: number;
    newCreatorsLast7Days: number;
    gatheringMembers: number;
  };
  /** Today's one meaningful world moment, when one exists. */
  moment: WorldMoment | null;
  /** A single human line — every claim backed by `activity`. */
  line: string;
};

/** Aggregate world snapshot — deliberately small and cheap. */
export async function getWorldPulse(): Promise<WorldPulse> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [publishedRows, creatorRows, memberRows, newestWork] = await Promise.all([
    db
      .select({ n: count() })
      .from(content)
      .where(and(eq(content.status, "published"), gt(content.publishedAt, weekAgo))),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.status, "active"), gt(users.createdAt, weekAgo))),
    db.select({ n: count() }).from(communityMembers),
    db
      .select({ id: content.id, title: content.title })
      .from(content)
      .where(eq(content.status, "published"))
      .orderBy(desc(content.publishedAt))
      .limit(1),
  ]);

  const activity = {
    publishedLast7Days: publishedRows[0]?.n ?? 0,
    newCreatorsLast7Days: creatorRows[0]?.n ?? 0,
    gatheringMembers: memberRows[0]?.n ?? 0,
  };

  // Weather from real thresholds — deterministic, debuggable, honest.
  let weather: WithinWeather = "quiet";
  if (activity.publishedLast7Days >= 10) weather = "busy";
  else if (activity.publishedLast7Days >= 3) weather = "creative";
  else if (activity.newCreatorsLast7Days >= 3) weather = "celebrating";
  else if (activity.publishedLast7Days + activity.newCreatorsLast7Days >= 1) weather = "calm";

  // Today in WithIn — the single most real moment, or none at all.
  let moment: WorldMoment | null = null;
  if (newestWork[0]) {
    moment = { kind: "new_work", title: newestWork[0].title, href: `/content/${newestWork[0].id}` };
  } else if (activity.newCreatorsLast7Days > 0) {
    moment = { kind: "new_creators", title: `${activity.newCreatorsLast7Days} new ${activity.newCreatorsLast7Days === 1 ? "voice" : "voices"}`, href: "/creators" };
  } else if (activity.gatheringMembers > 0) {
    moment = { kind: "gathering", title: "The rooms are open", href: "/communities" };
  }

  return {
    weather,
    activity,
    moment,
    line: weatherLine(weather),
  };
}

/** One grounded line. Never implies anyone's feelings — only real activity. */
function weatherLine(weather: WithinWeather): string {
  switch (weather) {
    case "busy":
      return "The world is busy tonight — new work is arriving.";
    case "creative":
      return "A creative wind is moving through the world.";
    case "celebrating":
      return "New voices have arrived this week.";
    case "calm":
      return "The world is calm — a few new things are waiting to be found.";
    case "quiet":
      return "The world is quiet tonight. It will still be here.";
  }
}

/**
 * Snapshot for Lyra's world context — the shape the intelligence layer
 * reads. Contains only public platform aggregates.
 */
export async function getWorldSnapshot() {
  const pulse = await getWorldPulse();
  return {
    time: observeTime(),
    weather: pulse.weather,
    activity: pulse.activity,
  };
}

