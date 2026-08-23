/**
 * Scroll Memory — preserves scroll position across navigation.
 *
 * When a user scrolls down an Explore feed, opens content, then presses back,
 * they should return to where they were. This module stores scroll positions
 * keyed by pathname in sessionStorage (per-tab, not per-session).
 *
 * Usage:
 *   On page mount: restoreScroll(pathname)
 *   Before navigation: saveScroll(pathname)
 *
 * This is a lightweight abstraction — no scroll-jacking, no event listeners.
 * Components call save/restore at natural lifecycle points.
 */

const STORAGE_KEY = "within:scroll-memory";

function readStore(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, number>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — scroll position simply resets */
  }
}

/** Save the current scroll position for a given pathname. */
export function saveScroll(pathname: string) {
  const store = readStore();
  store[pathname] = window.scrollY;
  writeStore(store);
}

/** Restore the scroll position for a pathname. Returns true if restored. */
export function restoreScroll(pathname: string): boolean {
  const store = readStore();
  const y = store[pathname];
  if (y === undefined) return false;
  // Defer to next frame so DOM has painted
  requestAnimationFrame(() => {
    window.scrollTo({ top: y, behavior: "instant" });
  });
  return true;
}

/** Clear a specific pathname's scroll memory. */
export function clearScroll(pathname: string) {
  const store = readStore();
  delete store[pathname];
  writeStore(store);
}
