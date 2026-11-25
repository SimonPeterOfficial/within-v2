/**
 * Loader configuration — a single, reversible switch for the cinematic
 * entrance.
 *
 * The cinematic entrance is enabled on the root landing route. It is scoped
 * to `/`; internal routes do not mount this loader. The first visit in a tab
 * gets the full sequence, returning visits get a short reveal, and reduced
 * motion gets a brief fade. Storage failure skips the sequence safely.
 */
export const CINEMATIC_LOADER_ENABLED = true;
