/**
 * Loader configuration — a single, reversible switch for the cinematic
 * entrance.
 *
 * TEMPORARY DISABLE (stability mission): set to `false` while the entry
 * experience is being stabilized. The full CinematicLoader implementation
 * is untouched — flipping this back to `true` restores the cinematic
 * entrance exactly as before.
 *
 * When disabled:
 *   - The loader is never mounted (no timers, listeners, or readiness
 *     promises are started).
 *   - The app opens directly into its interface: the Hero renders
 *     immediately (EntranceProvider is marked ready at mount).
 */
export const CINEMATIC_LOADER_ENABLED = false;
