# WithIn — Testing & Verification

## Mandatory gate (run before any review)

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run smoke
```

All four must pass. Do not bypass a failure:
no eslint-disable for a real problem, no try/catch returning fake data,
no commenting out the broken thing.

## What each command guarantees

- `tsc --noEmit` — type contract between services, APIs, and UI is intact.
- `npm run lint` — no unused imports/variables, no obvious React hazards.
- `npm run build` — the app compiles, all routes resolve, server/client
  boundaries are respected, no prerender-time crashes.
- `npm run smoke` — the running server serves expected markers and every
  referenced static asset, catching stale-chunk and route-drift regressions.

## Domain-level checks to add over time

When a new service or mutation is added, extend smoke coverage or cover it
with a focused test for at least:

- owner enforcement (user A cannot read/edit user B's private entity)
- visibility enforcement (private/unlisted/public semantics)
- lifecycle transitions (only legal state changes succeed)
- idempotency (double publish, double save, double-follow)
- bounded reads (limits applied)
- error contract (400/401/404/422/429 where applicable)

## What "tests passed" means in reports

Only claim a check passed if it actually ran in this environment, and
report the exact output summary. Never present unrun tests as passed.
