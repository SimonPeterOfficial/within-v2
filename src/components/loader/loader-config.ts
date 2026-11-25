/**
 * Loader configuration — a single, reversible switch for the cinematic
 * entrance.
 *
 * CURRENT STATE (2026-11-13): Disabled (false).
 *
 * Re-enabling this requires a founder-level architecture decision first:
 *
 *   1. The root landing page (src/app/page.tsx) does not currently use
 *      Hero.tsx or EntranceProvider. The cinematic subsystem
 *      (CinematicLoader + CinematicLoaderGate + Hero) requires
 *      EntranceProvider in the React tree above it.
 *
 *   2. Hero.tsx exists and is complete (src/components/home/Hero.tsx),
 *      but is not mounted on any current route.
 *
 *   3. The decision needed: does the cinematic entrance belong on the
 *      root / route (replacing the current module-grid landing), or
 *      on /home? Either is valid; each requires a different mounting
 *      strategy. See src/components/home/Hero.tsx for details.
 *
 * When the architecture decision is made:
 *   - Add <EntranceProvider immediatelyReady={false}> around the target page
 *   - Mount <CinematicLoaderGate /> and <Hero /> on that page
 *   - Set CINEMATIC_LOADER_ENABLED = true below
 *   - Run: npx tsc --noEmit && npm run build to verify
 *
 * When disabled (false):
 *   - The loader is never mounted (no timers, listeners, or readiness
 *     promises are started).
 *   - The app opens directly into its interface: the Hero renders
 *     immediately (EntranceProvider is marked ready at mount).
 */
export const CINEMATIC_LOADER_ENABLED = false;
