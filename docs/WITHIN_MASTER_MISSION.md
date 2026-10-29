# WITHIN MASTER MISSION — Recovery Baseline

## Baseline notes

- Repository: `SimonPeterOfficial/within-v2`
- Default branch: `master`
- Current working branch used for recovery: `fix-weather-link`
- Latest verified repository commit used as the baseline: `54be383a77fa89c78074314a7390ce93b7dac921`
- The repository is public and the production preview URL is configured at `https://github.com/SimonPeterOfficial/within-v2/deployments/Preview`

## Mission status summary

The repository has substantial work already completed in recent commits, including:

- cinematic loader and entry-state fixes
- a newer landing page that uses a minimal app-entry experience
- module shelf integration for the Home surface
- portal, atmosphere, and navigation refinements
- a real route map centered on the App Router structure

The deliverable here is a controlled recovery pass that protects the existing work and fixes route integrity issues that were still wrong in the current branch.

## Confirmed findings from repository inspection

### 1) Broken Weather route on the landing page

Evidence:

- `src/app/page.tsx` included a `Weather` card with `href: "/weather"`.
- `src/app/` does not contain any `weather` route.
- `src/lib/navigation.ts` also does not include `"/weather"` as a valid route.
- This creates a dead link and an invalid navigation destination.

Resolution applied:

- Removed the dead Weather card from the landing page so the app no longer advertises a route that does not exist.

### 2) Route inventory mismatch

The repo’s actual routes are built from a real set of directories under `src/app`, including home, atlas, time, profile, settings, sanctuary, etc. The `Weather` route is not among them. That is a functional issue because the page and navigation claimed a route that was never created.

### 3) Wallet is not implemented in the current repo

No wallet route, component, or nav entry was found during repository inspection. This is a product/route gap, but it is not a broken link unless the product intends to expose wallet in navigation. In the current codebase there is no evidence that Wallet is a real implemented feature.

## Recovery conclusion

This repository is closer to a coherent App Router product than a generic starter app. The current branch still had a small but real route integrity problem in the landing-page module list, and that issue has been corrected.

The most important remaining boundary is this: the environment available here does not include a local shell or build runner, so production build and runtime verification cannot be claimed as complete. The repository can be inspected and corrected, but the live app still needs a real automated verification step in an environment with Node tooling available.

## Remaining actions for a full production pass

1. Run `npm install` / restore dependencies if needed.
2. Execute: `npx tsc --noEmit`
3. Execute: `npm run lint`
4. Execute: `npm run build`
5. Smoke-test major routes: `/`, `/home`, `/atlas`, `/time`, `/profile`, `/settings`, `/sanctuary`, `/within`
6. Verify auth flows with actual Clerk environment variables if available.
7. Confirm whether a real `Weather` feature is intended before reintroducing it.
8. Confirm whether `Wallet` should be implemented or intentionally omitted.
