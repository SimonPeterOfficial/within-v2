# WITHIN — AGENTS.md

Engineering source of truth for OpenCode and future contributors.
High signal only. Details live in `docs/`.

## WITHIN PURPOSE

WithIn helps people feel like they belong. It is a digital world, not a
social network, dashboard, or AI wrapper. Build like you are adding a room
to a world — not a card to a page.

## PRODUCT LAWS (engineering weight)

1. Truth over magic — never fabricate data, AI output, personalization, or state.
2. Privacy over personalization — collect less; private by default.
3. Meaning over metrics — no engagement scores on human experiences.
4. Presence over engagement — no streaks, guilt, or attention traps.
5. Invitation over pressure — users are never manipulated.
6. Human authorship over AI replacement — Lyra assists; the human authors.
7. Place over page — routes are rooms in one universe.
8. Continuity over repetition — remember real state; don't repeat onboarding.
9. Silence is a feature — no forced motion, toasts, or AI commentary.
10. Reversibility — actions are undoable where reasonably possible.
11. Accessibility is part of the world — it is built in, not patched on.
12. Performance is part of design — a slow world is not beautiful.
13. Identity belongs to the person — never label or diagnose users.
14. Serendipity is a gift, not a trap — optional, explainable, escapable.
15. Keeping is a choice — Library/Memory only hold what the user chose.
16. Trust is earned by the system — no dark patterns, no fake success.
17. Safety without surveillance — moderation/blocks are real; behavior tracking is not.

## ARCHITECTURE

Next.js 16 (App Router) + React 19 + Tailwind 4 + Drizzle (Neon Postgres).
Monolith. No microservices. Server components by default; client islands
for interaction.

Current real domains and owners:

| Domain | Source of truth | Notes |
|---|---|---|
| Auth/session | `users`, `src/lib/auth/*` | scrypt, HMAC cookie, in-memory rate limit (per-instance) |
| Profiles | `profiles`, `src/lib/profiles.ts` | privacy enforced at query level |
| Content lifecycle | `content`, `contentViews`, `content-service.ts` | draft→…→published; owner+moderator only |
| Interactions/saves | `saves`, `reports`, `interactions.ts` | shelves saved/liked |
| Social | `follows`, `friendships`, `blocks`, `social.ts` | blocks are absolute, server-enforced |
| Conversations | `conversations`, `messages`, `messaging.ts` | DM via sorted dmKey, membership-gated |
| Communities | `communities`, `communityMembers`, `communities.ts` | owner/slug/roles |
| Mirror | `mirrorEntries`, `mirror.ts` | owner-only, private by construction |
| Worlds | `worlds`, `src/lib/worlds.ts` | status/draft/published, private→public |
| Journeys | `journeys`, `journeyItems`, `src/lib/journeys.ts` | ordered items, gap-free positions |
| Trace | derived from existing truth | `src/lib/trace.ts` aggregates, owner-only |
| Notifications | `notifications` | real event sources only |
| Serendipity | `serendipity.ts` + route | real extends saves/follows/blocks, max 3 |

## API CONVENTIONS

- Route handlers under `src/app/api/**`.
- Every mutation: `requireUser` → authorization/ownership → validate input → DB → truthful response.
- Errors: 400/401/403/404/422/429; no stack traces, no fake success.
- Ownership is derived from the session, never from a client-supplied `userId`.
- Bounded lists only (default small limits, hard caps).

## DATABASE RULES

- NEVER `drizzle-kit push`. Always `npm run db:generate` (review SQL) then `npm run db:migrate`.
- NEVER drop/truncate/destructively alter production data.
- New queries get indexes only when justified by the access pattern.
- Enum-like fields: text + TS union (keeps migrations cheap).

## AURI

A presence inside the world, not a chatbot widget. Generally quiet. Context
contract: source → purpose → scope → permission → lifetime → sensitivity.
Never reads Mirror, never narrates every action, never fakes knowledge.

## LYRA

Deeper intelligence, optional and explicit. Receives only
authorized, minimal, purpose-bound context — never a database dump.
A capability contract (`src/lib/lyra/*`) governs what she may do.
She never diagnoses, never claims memory she doesn't have, never publishes
on a user's behalf.

## COMPONENT RULES

Every meaningful component must handle: data contract, loading, empty, error,
success, disabled, responsive, keyboard/touch, reduced motion. Reuse
`src/components/ui/` primitives. No giant god components, no fake buttons,
no decorative dead UI.

## DESIGN LANGUAGE

Imperial fantasy × crystal/liquid glass × cinematic editorial × human warmth.
Tokens live in `src/app/globals.css` (`--within-*`, skin `--liquid-*` levels,
`--mood-rgb`). Fraunces for display, Geist for interface. The UI lives
*inside* the environment; the environment is the canvas.

## TESTING

Mandatory before review: `npx tsc --noEmit`, `npm run lint`, `npm run build`,
`npm run smoke`. Fix failures properly — no disabling rules, no commenting
out broken paths, no try/catch-returning-fake-data.

## DO NOT

- Fabricate users, content, AI output, metrics, or personalization.
- Expose secrets, `DATABASE_URL`, tokens, or stack traces to clients.
- Commit `.env*` files or log credentials.
- Create parallel implementations of an existing system (check this file first).
- Add a second source of truth for the same entity.
- Optimize for engagement/retention over meaning.
- Auto-commit or auto-push. The human manages Git.
