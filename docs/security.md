# WithIn — Security Posture

## Secrets

- Never print `DATABASE_URL`, `ADMIN_PASSWORD`, OAuth client secrets, or
  provider keys. They live in `.env.local` / Vercel env — never in source,
  React components, committed config, Git history, or `NEXT_PUBLIC_*`.
- AI provider credentials are development-agent credentials (OpenCode) and
  must never become WithIn production credentials. WithIn's future AI
  must be a separate server-side boundary.

## Authn/Authz

- Sessions: scrypt-hashed passwords, per-user salts, httpOnly HMAC cookie.
- Every protected mutation: authenticated session → server-side ownership →
  role/permission check (`src/lib/auth/authorization.ts`) → input
  validation → operation → truthful response.
- Client UI state is presentation, not authorization. A disabled button is
  not a permission check.
- Admin actions require the admin session cookie and are audited.

## Privacy boundaries verified by design

- Mirror entries: owner-scoped at query level; never leaked via public
  paths, caches, or previews.
- Trace: `/api/trace` returns 401 to anonymous callers and shapes labels
  (no reflection bodies, no message content).
- Worlds/Journeys: private rows are filtered at the query level; unlisted
  rows are retrievable by slug only and never listed; published+public is
  the only listed surface.
- Discovery: `listPublishedContent` only returns `status='published'` and
  `visibility='public'`; `/api/search` inherits that filter.
- Connections/events: blocked users cannot follow, message, DM, or appear
  in discovery; unblocking restores only what the model says.

## Input validation

- Every JSON body parse is guarded (invalid JSON → 400).
- Every mutation validates shape, length caps, enumerations, and ids.
- Ownership never derives from client-supplied ids.

## Data integrity

- Unique constraints on identity-critical pairs (follows, saves,
  friendships, conversations, journey_items positions, etc.).
- Cascading deletes on content/profile owners; published snapshots are not
  destructively rewritten by unrelated deletes.
- Migrations are forward-only and generated with `drizzle-kit generate`;
  never `drizzle-kit push`, never hand-edited to hide destructive intent.

## API error hygiene

Errors return shape `{ ok: false, error: "human message" }` with the right
status code. Internal exceptions are caught at the route boundary and
reported as generic failure — never as stack traces, SQL errors, or paths.

## Cache & CDN

Personalized reads (`/api/profile`, `/api/trace`, `/api/mirror`, etc.) must
never be served from a public cache. Default Next handlers are `ƒ
(dynamic)` — verify before adding `cache` options.
