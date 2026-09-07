/**
 * The Return Experience — "While you were away" (foundation).
 *
 * WithIn can only honestly say what it actually saw. Today that is: the
 * last time this browser visited, and the local shelves that changed since.
 * This module records the last-visit timestamp through the memory layer
 * (local only, never sent anywhere) and builds a summary from real local
 * data. When a backend arrives, the same interface is served from real
 * account activity — the consumers never change.
 *
 * Principles: no invasive tracking, no cross-site anything, no inferred
 * emotions. Just "here's what changed while you were gone."
 */

import { memory } from "@/lib/memory";
import { getInProgress } from "@/lib/library";

const LAST_VISIT_KEY = "last-visit";
const CURRENT_SESSION_FLAG = "return-session-open";

export type ReturnSummary = {
  /** True when this load is a genuine return (a previous visit exists). */
  isReturn: boolean;
  /** ISO timestamp of the previous visit, when known. */
  lastVisitAt: string | null;
  /** Human-friendly distance, e.g. "3 days". */
  awayFor: string | null;
  /** Things in progress since the last visit (real progress records). */
  thingsInProgress: number;
  /** Lines the UI may whisper — only claims backed by real data. */
  lines: string[];
};

function humanDistance(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return "a few minutes";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour" : `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "a day" : `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "a month" : `${months} months`;
}

/**
 * Called once per page load (early, from the home surface). Marks the
 * session open, reads the previous visit, and writes the current time as
 * the new "last visit" — so the next return measures from now.
 */
export function openReturnSession(): ReturnSummary {
  const previousRaw = memory.get<string>("preferences", LAST_VISIT_KEY);
  const previous = previousRaw ? Number(previousRaw) : null;
  const isReturn = Number.isFinite(previous) && previous != null && previous > 0;

  // Write the current moment as the new last visit (once per session).
  try {
    if (!sessionStorage.getItem(CURRENT_SESSION_FLAG)) {
      memory.set("preferences", LAST_VISIT_KEY, String(Date.now()));
      sessionStorage.setItem(CURRENT_SESSION_FLAG, "1");
    }
  } catch {
    /* storage unavailable — the summary simply degrades to first-visit */
  }

  const summary: ReturnSummary = {
    isReturn,
    lastVisitAt: isReturn && previous ? new Date(previous).toISOString() : null,
    awayFor: isReturn && previous ? humanDistance(Date.now() - previous) : null,
    thingsInProgress: 0,
    lines: [],
  };

  if (!isReturn) return summary;

  // Real, local signals: what the user actually has going on. The progress
  // records carry their own timestamps, so "started since you were away"
  // is a genuine diff — not an invented number.
  const inProgress = getInProgress().filter(
    ({ record }) => previous == null || record.updatedAt > previous
  );
  summary.thingsInProgress = inProgress.length;

  if (summary.awayFor) {
    summary.lines.push(`You were away for ${summary.awayFor}.`);
  }
  if (inProgress.length > 0) {
    summary.lines.push(
      inProgress.length === 1
        ? "One thing you started is still waiting."
        : `${inProgress.length} things you started are still waiting.`
    );
  }
  return summary;
}

/** Whether the current load has already been counted (per tab session). */
export function isReturnSessionOpen(): boolean {
  try {
    return sessionStorage.getItem(CURRENT_SESSION_FLAG) === "1";
  } catch {
    return false;
  }
}
