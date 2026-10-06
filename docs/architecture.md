# WithIn — Architecture Map

## Why this file exists

Engineering questions get answerable in seconds: what owns this, who can
mutate it, what happens if it disappears. High-signal map; follow links to
`src/lib/*` services for truth.

## Request lifecycle

```text
Browser
  ↓
src/app/layout.tsx (Theme/Environment/Auth/Toast providers, effects)
  ↓
route (server component or dynamic ƒ route)
  ↓
src/app/api/* route handler (for mutations/queries)
  ↓
requireUser()            ← authentication (session HMAC cookie)
  ↓
authorization / ownership check (role, ownerId, visibility)
  ↓
validation (input shape, ids, limits, enumerations)
  ↓
service in src/lib/*.ts
  ↓
Drizzle → Neon Postgres
  ↓
DTO-safe response        ← only what the client needs
```

Real deviations: `/api/health`, `/api/search`, and list endpoints are
read-only and session-optional; anything private must reject before content.

## Server-only boundary

`src/lib/db/index.ts` imports `"server-only"`. Any client import of a DB
module is a build error. Service files (`worlds.ts`, `journeys.ts`,
`trace.ts`, `content-service.ts`, `mirror.ts`, `social.ts`,
`messaging.ts`, `communities.ts`) all begin with `import "server-only"`.
Client code may only import explicit types.

## Auth model

- Credential signup/signin via scrypt OWASP params + `timingSafeEqual`.
- Session = httpOnly, HMAC-signed cookie in `src/lib/auth/session-token.ts`.
- `requireUser()` in `src/lib/auth/server.ts` is the gate for every
  protected route. Never re-read the session cookie manually in a route.
- Admin login is env-gated with `ADMIN_PASSWORD` and timing-safe comparison.

## Entity ownership (critical decisions)

- **users / profiles** own identity. Every other row that "belongs" to a
  person carries `ownerId`/`userId`/`creatorId` and every service filters
  by it. Never accept an owner id from the request body.
- **content** owns authored works. **Worlds, Journeys, Mirror entries,
  saves, messages** reference those entities — they never duplicate a
  world/creator object. One source of truth per concept.
- **Trace** is derived per-request from content/worlds/saves/conversations/
  reflections. It is not a separate event store — and must stay that way
  unless a real fanout requirement appears.
- **Serendipity** is derived, not stored. It can only surface what
  saves/follows/blocks already make true.

## State machines

- content: `draft → submitted → reviewing → approved → published` (→ hidden/archived)
- worlds:  `draft → published → archived → deleted`
- journeys:`draft → published → archived → deleted`, items ordered by position
- mirror:  entry lifecycle = create/update/delete, private only
- friendships: `pending → accepted`; block is absolute and one-directional

Illegal transitions are rejected by the service (e.g., publishing content
that was never approved, editing another owner's draft).

## Destination map

Public: `/` (landing + cinematic intro), `/login`, `/signup`,
`/forgot-password`, `/onboarding`, `/discover`, `/explore`, `/originals`,
`/books`, `/music`, `/photography`, `/creators`, `/communities`,
`/contact/[slug]`, `/content/[id]`, `/profile/[username]`, `/404`.

Protected: `/home`, `/sanctuary`, `/mirror`, `/connections`,
`/conversations`, `/studio`, `/journey`, `/atlas`, `/within`, `/settings`.

Admin: `/admin/*` gated by `/api/admin/login` session.

API surface: see table in AGENTS.md plus `/api/admin/*`, `/api/away`,
`/api/moderation/*`, `/api/reports`, `/api/follows`, `/api/library`,
`/api/mirror*`, `/api/studio*`, `/api/world` (pulse), `/api/worlds*`,
`/api/journeys*`, `/api/serendipity`, `/api/social`, `/api/notifications`,
`/api/profile`, `/api/content/*`, `/api/communities/*`, `/api/conversations/*`.

## Real vs. blocked surfaces (honest)

- REAL: auth, content lifecycle, social graph, communities, conversations,
  mirror, library/saves, notifications, reports/moderation, journeys
  backend, worlds backend, trace, search, health, serendipity.
- PARTIAL / mock-flagged: `lib/content.ts` and `lib/creators.ts` catalogs
  (used by several static pages), admin analytics pages, `MOCK_JOURNEY`.
- MISSING / not yet real: live AI provider for Lyra, payment ledger,
  realtime transport (polling by design), distributed rate limiter.
