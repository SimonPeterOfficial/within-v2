/**
 * Mirror view helpers — pure, client-safe presentation logic.
 *
 * The database service (`src/lib/mirror.ts`) remains the only source of
 * reflection truth. These helpers only sort, group, and label entries that
 * the owner-scoped API has already returned.
 */

export type MirrorEntryView = {
  id: string;
  body: string;
  prompt: string | null;
  moodId: string | null;
  createdAt: string;
  updatedAt?: string;
};

/** Gentle openings, never diagnoses. Stored as metadata only when chosen. */
export const MIRROR_PROMPTS = [
  "What stayed with you today?",
  "What are you carrying right now?",
  "What would you like to remember from this week?",
  "What felt lighter than yesterday?",
  "What are you curious about lately?",
] as const;

/** Pick another opening. `roll` is injectable so this stays testable. */
export function nextPrompt(current: string | null, roll = Math.random()): string {
  const alternatives = MIRROR_PROMPTS.filter((item) => item !== current);
  const pool = alternatives.length > 0 ? alternatives : MIRROR_PROMPTS;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(roll * pool.length)));
  return pool[index];
}

export function sortEntriesNewestFirst(entries: MirrorEntryView[]): MirrorEntryView[] {
  return [...entries].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id)
  );
}

export function formatEntryDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEntryTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function monthKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export type MirrorMonthGroup = {
  key: string;
  label: string;
  entries: MirrorEntryView[];
};

/** Chronological browse: newest month first, newest entry first inside it. */
export function groupEntriesByMonth(entries: MirrorEntryView[]): MirrorMonthGroup[] {
  const groups = new Map<string, MirrorMonthGroup>();

  for (const entry of sortEntriesNewestFirst(entries)) {
    const key = monthKey(entry.createdAt);
    let group = groups.get(key);
    if (!group) {
      group = { key, label: formatMonthLabel(entry.createdAt), entries: [] };
      groups.set(key, group);
    }
    group.entries.push(entry);
  }

  return [...groups.values()];
}

/** Only show an "Edited" mark when the row was actually changed later. */
export function wasEdited(entry: MirrorEntryView): boolean {
  if (!entry.updatedAt) return false;
  return new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 1000;
}
