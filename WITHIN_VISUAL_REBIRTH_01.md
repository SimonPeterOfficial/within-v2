# WithIn Visual Rebirth 01 — Crystal Experience

## Scope

This stage refines the root landing and its entrance. It keeps the existing Next.js App Router, `AppShell`, `EntranceProvider`, `CinematicLoaderGate`, `WithinMark`, and `GlassCard` systems. The landing still links to the same six routes. No backend or authentication behavior was changed, and no package was installed.

## Problems found

- The root page used a flat near-black background while `AppShell` added its light painted WorldScape and ambient light behind it. The mismatch was visible around the desktop rail and caused excess horizontal page width on mobile.
- The shell rail and mobile dock were designed for the light Crystal World. Their pale active state and dark ink conflicted with a dark ivory landing.
- The existing loader was disabled and its old short timeline did not meet the requested entrance. Dynamically importing it delayed the start beyond the intended five-second sequence.
- The shared `WithinMark` used fixed SVG gradient IDs, so the landing mark and loader mark could reference the same IDs when mounted together.
- The mobile landing’s single-column route cards sat behind the fixed navigation and menu control.

## Changes

- `src/app/page.tsx` — rebuilt the root composition around the existing copy and routes, added the atmospheric background, shared deep-glass card and route doors. The mobile route cards use two columns and tighter spacing so the available spaces remain visible above the dock.
- `src/components/effects/CrystalAtmosphere.tsx` — added a lightweight CSS-only horizon and facet layer for the landing.
- `src/app/globals.css` — added scoped ELYSIAN background, atmosphere and glass-material styles. The root route suppresses only the shared shell’s light WorldScape and AmbientLight, and gives its desktop rail, mobile dock and active states dark glass treatments. Other destinations keep their current environment. The small-screen menu control is moved to the upper corner so it does not cover a route tile.
- `src/components/loader/CinematicLoader.tsx`, `CinematicLoaderGate.tsx`, `loader-config.ts`, and `src/lib/useCinematicIntro.ts` — enabled the root entrance, consolidated the entrance decision in the gate, removed the lazy chunk delay, stabilized the session callback, and added a first-visit sequence of about five seconds. Returning visits use a shorter reveal; reduced-motion users get a brief fade. Skip click and Escape both work. The loader restores scroll and focus when it exits.
- `src/components/ui/GlassCard.tsx` — extended the existing primitive with clear, deep, iridescent, soft and focus crystal materials; this does not replace its existing tones.
- `src/components/ui/WithinMark.tsx` — gives each SVG mark unique gradient IDs to avoid collisions between simultaneous marks.

## Visual and interaction result

The landing now uses an obsidian base, restrained violet and ivory illumination, the existing Fraunces/Geist type setup, layered deep glass, and a restrained CSS facet/horizon effect. The hero and route grid use the same surface language as the loader. The shell navigation is visually adapted only within the landing scope, preserving the shared navigation and routes.

The entrance uses no new image assets, canvas or animation dependency. It uses CSS and existing Framer Motion. The loader is a labeled modal dialog, focuses its Skip control, traps Tab on that action, exits with Escape, and restores the prior focus. Reduced motion shortens the sequence and removes the light sweep.

## Browser verification

Rendered checks used installed Microsoft Edge through Playwright at 1440×960 and 390×844. The fresh desktop entrance showed “A moment to arrive.” and “Welcome Within.”, then dismissed; the skip action dismissed it; the reduced-motion mobile entrance dismissed without waiting for the full sequence. The final mobile check found six route doors, 390px document width at a 390px viewport, no browser page errors, and the bottom of the last tile above the fixed dock. The final mobile screenshot is at `.next/elysian-final-mobile.png`. Screenshot files under `.next/` are build output, not committed artifacts.

## Validation

- `npx tsc --noEmit` — passed.
- `npm run build` — passed on the final implementation. Next emitted its existing middleware-to-proxy deprecation notice.
- `npm run lint` — passed with zero errors and five pre-existing unused-variable warnings in `NavGlow.tsx`, `event-lifecycle.test.ts`, `auth/session.tsx`, `events/outbox.ts`, and `light-memory.ts`.
- `npm run smoke` — one failure remains: `/discover` did not contain the expected marker “A universe, waiting”. While the smoke run requested that route, the server also logged a failed published-content database query. This route and data integration were not changed in this visual pass.
- Browser checks — desktop entrance, skip action, reduced-motion entrance, responsive width, navigation tiles, and browser page errors checked as described above.

## Remaining work

- This stage deliberately scopes the visual system to the root landing. Sanctuary, Atlas, Home, Weather and other destinations still use their own existing environment and have not been visually unified or individually reviewed here.
- The fixed mobile dock remains an overlay by design; longer pages still need their own scroll padding and overlap review.
- The production browser run logged a database query failure while loading Discover. The smoke marker failure and query availability should be addressed in the Discover/data workflow, without fabricating fallback content.
- The landing uses the established WithIn mark. A bespoke crystal emblem would require a separate brand decision and is not introduced here.

## Existing work preserved

The pre-existing working-tree edits in `src/app/api/auth/signin/route.ts`, `src/components/auth/LoginForm.tsx`, `src/components/auth/SignupForm.tsx`, and `src/lib/auth/service.ts` were left untouched and are not included in this report’s implementation scope.
