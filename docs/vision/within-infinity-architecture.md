# WITHIN INFINITY — Architecture Evolution Map

Repository: https://github.com/SimonPeterOfficial/within-v2
Artifact: docs/vision/within-infinity-architecture.md

## 1. Current architecture (verified)

WITHIN is a Next.js 16 (App Router) + React 19 + Tailwind 4 monolith with Drizzle ORM on Neon Postgres.

**Server-only boundary:** `src/lib/db/index.ts` imports `"server-only"`. Every domain service begins with `import "server-only"`. Client code imports types only.

**Request lifecycle:**
```
Browser → layout.tsx (providers/effects) → route → requireUser()/getSessionUser()
  → authorization (src/lib/auth/authorization.ts) → validation (src/lib/auth/validation.ts)
  → service in src/lib/*.ts → Drizzle → Neon Postgres → DTO-safe response
```

**Auth:** scrypt hashing, HMAC-SHA256 signed httpOnly cookie, DB re-verification on every read, suspended-account rejection.

**Authorization:** Centralized role hierarchy + permission map in `src/lib/auth/authorization.ts`.

**Key verified domains and owners** (from AGENTS.md):
- Auth/session: users, src/lib/auth/*
- Profiles: profiles, src/lib/profiles.ts
- Content lifecycle: content, contentViews, content-service.ts
- Interactions/saves: saves, reports, interactions.ts
- Social: follows, friendships, blocks, social.ts
- Conversations: conversations, messages, messaging.ts
- Communities: communities, communityMembers, communities.ts
- Mirror: mirrorEntries, mirror.ts (owner-only, private by construction)
- Worlds: worlds, src/lib/worlds.ts
- Journeys: journeys, journeyItems, src/lib/journeys.ts
- Trace: src/lib/trace.ts (derived, owner-only)
- Notifications: notifications table
- Serendipity: serendipity.ts + route (max 3, real signals)

**Confirmed source-of-truth conflict:**
- `src/lib/library.ts` → browser localStorage (saves/likes/progress)
- `src/lib/interactions.ts` → PostgreSQL (same concepts)
- Duplicate persistence for the same domain; user data diverges by consumer.

**Build status:** Backend type-clean. Build blocked by a pre-existing frontend-agent type error in `src/components/discover/ConstellationView.tsx` (Property 'related' does not exist on ConstellationViewProps). This file is frontend-agent work and was not touched.

---

## 2. Target conceptual architecture

The target is a modular monolith that remains deployable as a single unit but with explicit domain boundaries, durable event records, and composable primitives. No microservices unless a concrete operational need emerges.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client (Next.js App Router)                  │
│  Server Components  │  Client Islands (framer-motion, etc.)    │
└──────────┬──────────┴──────────┬────────────────────────────────┘
           │                     │
           ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API / Server Action Layer                    │
│  requireUser → authorization → validation → service → response  │
└──────────┬──────────┴──────────┬────────────────────────────────┘
           │                     │
    ┌──────┴──────┐      ┌──────┴──────┐
    ▼             ▼      ▼             ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│Auth     │ │Content   │ │Social    │ │Discovery     │
│Service  │ │Service   │ │Service   │ │Service       │
└────┬────┘ └────┬──────┘ └────┬────┘ └──────┬───────┘
     │           │            │              │
     └───────────┴────────────┴─────────────┘
                     │
                     ▼
          ┌────────────────────────┐
          │  Drizzle ORM           │
          │  Neon Postgres         │
          └────────────────────────┘
```

**Domains as modules (each in src/lib/<domain>.ts):**
- auth, profiles, content, content-service, interactions, social, messaging, communities, mirror, worlds, journeys, trace, notifications, moderation, studio, admin, serendipity, recommendations, search, library.

---

## 3. Differences between current and target

| Aspect | Current | Target |
|--------|---------|--------|
| Persistence for saves/likes | Split: localStorage + Postgres | Single source of truth: Postgres (`interactions.ts`) |
| Rate limiting | Per-instance in-memory | Interface + default in-memory; shared-store pluggable |
| Scheduled publishing | Opportunistic (request-triggered) | Dedicated scheduler/cron |
| Testing | None | Automated tests integrated into CI |
| CI | Absent | GitHub Actions (added in this mission) |
| Discovery | Content + static catalog fallback | Content-only; static catalogs deprecated |
| Background jobs | None durable | Durable job records + retry (deferred, infra-dependent) |

---

## 4. Foundational primitives

| Primitive | Represents | Existing? | New tables needed | Privacy |
|-----------|-----------|-----------|-------------------|---------|
| Content | Authored work | Yes | None | PUBLIC/UNLISTED/PRIVATE |
| Save/Like | Kept item | Yes (Postgres + localStorage) | None | OWNER_ONLY |
| Follow/Friendship/Block | Relationship | Yes | None | PRIVATE |
| Conversation/Message | Private message | Yes | None | MEMBERS-ONLY |
| Community | Ownable room | Yes | None | PUBLIC/PRIVATE |
| World | Curated place | Yes | None | PUBLIC/UNLISTED/PRIVATE |
| Journey | Ordered path | Yes | None | PUBLIC/UNLISTED/PRIVATE |
| Mirror entry | Private reflection | Yes | None | OWNER_ONLY |
| Trace | Derived activity view | Yes | None | OWNER_ONLY |
| Content link | Idea relationship | No | content_links | PUBLIC |
| Knowledge map | User knowledge graph | No | knowledge_maps, nodes, edges | SELECTIVE |
| Trust tier | Per-person sharing gate | No | trust_tiers | PRIVATE |
| Context self | Named role self | No | context_selves | PRIVATE |
| Introduction | Consensual connection | No | introductions | SELECTIVE |
| Identity snapshot | Context-specific self record | No | identity_snapshots | OWNER_ONLY |

---

## 5. Module boundaries

Each domain service owns its table(s) and business rules. Cross-domain reads go through the owning service, never direct table access from another domain's route handler. This preserves the single-source-of-truth principle and makes future extraction (if ever needed) straightforward.

---

## 6. Data ownership model

Every row that "belongs" to a person carries `ownerId`/`userId`/`creatorId` and every service filters by it. Ownership is derived from the session, never from a client-supplied `userId`. (Already enforced; documented in AGENTS.md.)

---

## 7. Privacy model

- **Public:** listed and retrievable by anyone.
- **Unlisted:** retrievable by ID/slug, never listed.
- **Private:** owner + moderator only.
- **Mirror/Trace:** owner-only by construction; never leaked via public paths, caches, or previews.
- **Personalization:** never based on inferred emotion; moods are user-chosen only.

---

## 8. Background-processing model

- **Synchronous request work:** mutations that must complete before responding.
- **Best-effort asynchronous:** scheduled publishing (`processDuePublications`, runs on requests) — unreliable; needs a real scheduler.
- **Durable job records:** deferred (requires infra decision: cron/worker/queue).
- **Retryable work:** deferred.

---

## 9. Discovery architecture

- **Source of truth:** `content` table + `listPublishedContent` (status='published' AND visibility='public').
- **Search:** `/api/search` inherits the same filter.
- **Serendipity:** max 2 items, real signals (saved categories, new voices), blocks/own/follows excluded, `whyThis` explanations.
- **Recommendations:** `recommendFor(mood, period)` — deterministic, transparent scoring.
- **Static catalogs** (`content.ts`, `creators.ts`): deprecated in favor of DB-backed content.

---

## 10. Intelligence integration boundaries

- **Lyra** (`src/lib/lyra/*`): capability registry + autonomy policy. No autonomous execution. OBSERVE/SUGGEST/SAFE_AUTOMATIC/USER_APPROVAL/HUMAN_ONLY levels.
- **Auri** (`src/lib/auri.ts`, `components/auri/*`): human-facing presence. Never reads Mirror. Never narrates every action. Never fakes knowledge.
- **No external AI provider** is configured. Any future AI integration must be server-side, opt-in, and never send Mirror entries or private messages externally without explicit user authorization.

---

## 11. Compatibility strategy

- Existing API contracts preserved.
- New tables are additive (no schema breaks).
- Static catalogs deprecated but kept functional until DB-backed replacements exist.
- Frontend contracts not broken without coordination.

---

## 12. Main technical risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Split persistence (library.ts vs interactions.ts) | HIGH | Migrate consumers to Postgres; document migration path |
| Per-instance rate limiting | HIGH | Interface + shared-store pluggable (done in this mission) |
| Opportunistic scheduled publishing | HIGH | Real scheduler/cron for production |
| No CI / no test runner | MEDIUM | GitHub Actions CI added; test runner to be configured |
| Frontend type error blocking build | MEDIUM | Frontend-agent file; document as blocker, do not touch |
| No durable background jobs | MEDIUM | Deferred pending infra decision |

---

## 13. Evolution sequence

1. Fix split persistence (single source of truth for saves/likes).
2. Replace per-instance rate limiting with shared-store interface + production guard.
3. Add durable scheduler for scheduled publishing.
4. Add CI + test runner integration.
5. Add foundational primitives (content_links, knowledge_maps, trust_tiers) one at a time.
6. Build composable discovery on top of primitives.

---

**Existing components vs proposed components:** All tables and services listed as "Existing" are verified in the repository. All "New tables needed" are proposed and not yet implemented.
