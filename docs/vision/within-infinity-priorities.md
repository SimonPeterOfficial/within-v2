# WITHIN INFINITY — Priorities

Repository: https://github.com/SimonPeterOfficial/within-v2
Artifact: docs/vision/within-infinity-priorities.md

## Ranking criteria

Each opportunity is ranked by:
- **User impact** — how meaningfully it improves discovery, belonging, creativity, understanding, or agency.
- **Security** — whether it closes a privacy or authorization gap.
- **Reliability** — whether it improves data integrity, error handling, or observability.
- **Implementation risk** — complexity, dependencies, blast radius.
- **Dependencies** — what must exist first.

Rankings are provisional and evidence-based. Nothing here is production-certified.

---

## Phase A — Critical correctness, privacy, security (do first)

| # | Mission | User benefit | Security | Reliability | Risk | Dependencies | Completion criterion |
|---|---------|--------------|----------|-------------|------|--------------|----------------------|
| A-1 | Fix split persistence: migrate all `library.ts` consumers to PostgreSQL `interactions.ts` | Saves/likes survive sessions & devices; single source of truth | OWNER_ONLY data stays consistent | Data integrity no longer diverges | MEDIUM | Product coordination on frontend consumers | All saves/likes reads/writes go through `interactions.ts`; `library.ts` deprecated or removed |
| A-2 | Add CI + test runner integration | Regressions detectable before merge | — | Build + tests gate every change | LOW | Test runner config in package.json | `npm test` runs; CI passes on push/PR |
| A-3 | Replace per-instance rate limiting with shared-store interface + production guard | Abuse resistance across instances | AUTH | Consistent throttling | MEDIUM | Deployment topology decision | `RateLimiter` interface exists; startup warns if no shared store in prod |
| A-4 | Real scheduled publishing scheduler | Scheduled work happens at scheduled time | — | Reliability of delayed actions | MEDIUM | Cron/worker infra in deployment env | `processDuePublications` triggered by scheduler, not requests |
| A-5 | Add authentication/session regression tests | Login/signup/session behavior verified | AUTH | Auth regressions caught | LOW | Test runner from A-2 | Valid/invalid credentials, session expiration tested |

---

## Phase B — Core functionality and reliability

| # | Mission | User benefit | Security | Reliability | Risk | Dependencies | Completion criterion |
|---|---------|--------------|----------|-------------|------|--------------|----------------------|
| B-1 | Add durable job records + retry for background tasks | Background work survives restarts | — | Job reliability | MEDIUM | Scheduler from A-4 | Failed jobs retry with backoff; dead-letter handling |
| B-2 | Add transactions for multi-write operations (conversation creation, content publish + notify) | Related writes succeed/fail together | — | Data integrity | LOW | Existing services | Multi-write ops wrapped in transactions |
| B-3 | Add pagination bounds and cursor pagination on expensive reads | Predictable load | — | Query performance | LOW | Existing API routes | All list endpoints capped; cursor option available |
| B-4 | Add structured logging + request correlation IDs | Debuggability | — | Observability | LOW | — | Logs have request ID; no secrets logged |
| B-5 | Fix `getContentForViewer` moderator role (viewer role, not creator role) — DONE in this mission | Moderators can access others' private/draft content | AUTHZ | Correct authorization | LOW | None | Verified by tests 13–14 |

---

## Phase C — Discovery and personalization

| # | Mission | User benefit | Security | Reliability | Risk | Dependencies | Completion criterion |
|---|---------|--------------|----------|-------------|------|--------------|----------------------|
| C-1 | Deprecate static catalogs (`content.ts`, `creators.ts`); serve discovery from DB | Real, fresh content in discovery | PUBLIC | Consistent data | MEDIUM | Content populated in DB | `/discover`, `/originals`, `/books`, `/music`, `/photography` query `content` table |
| C-2 | Add `content_links` (idea relationships: responds to, inspired by, contradicts) | Users can connect ideas across works | PUBLIC | New domain model | MEDIUM | content table | Links creatable; visible on content pages |
| C-3 | Add "unfamiliar perspective" toggle | Escape filter bubble | PUBLIC | Recommender change | LOW | exists (recommendations.ts) | Toggle returns non-followed, rare-category content |
| C-4 | Add `whyThis` explanations to all discovery (not just serendipity) | Transparent recommendations | PUBLIC | UI + data | LOW | C-1 | Every surfaced item has plain-language reason |
| C-5 | Add temporal discovery (join-era content) | Nostalgic/relevant context | PUBLIC | Query | LOW | users.created_at | Content from user's join period surfaced |

---

## Phase D — Distinctive WITHIn experiences

| # | Mission | User benefit | Security | Reliability | Risk | Dependencies | Completion criterion |
|---|---------|--------------|----------|-------------|------|--------------|----------------------|
| D-1 | Add `knowledge_maps` + nodes + edges | Users build knowledge graphs | SELECTIVE | New domain | HIGH | content table | Maps creatable; nodes link to content |
| D-2 | Add `trust_tiers` per person | Nuanced sharing gates | PRIVATE | New domain | MEDIUM | users, follows | Tiers creatable; gate selective content |
| D-3 | Add `context_selves` (named role selves) | Multiple identities without multiple accounts | PRIVATE | New domain | HIGH | profiles | Selves creatable; switchable per world |
| D-4 | Add `introductions` (consensual connection) | Safe cold connections | SELECTIVE | New domain | MEDIUM | users, messaging | Introductions creatable with consent states |
| D-5 | Add `content_versions` (immutable versioning) | Works evolve without destructive edits | PUBLIC | New domain | HIGH | content table | Versions immutable; current version pointer |

---

## Phase E — Advanced motion, liquid-glass, dynamic world-building

| # | Mission | User benefit | Security | Reliability | Risk | Dependencies | Completion criterion |
|---|---------|--------------|----------|-------------|------|--------------|----------------------|
| E-1 | Auri activation (guided onboarding, serendipity intros, return greetings) | Auri has a concrete optional role | — | UX | MEDIUM | Auri components exist | Auri surfaces non-intrusive, opt-in guidance |
| E-2 | Environment layer performance budget | Fast on low-end devices | — | Performance | MEDIUM | Existing effects | Core Web Vitals measured; reduced-motion fallback |
| E-3 | Accessibility audit (axe/WAVE) + keyboard verification | Inclusive by default | — | A11y | LOW | Runtime server needed | Automated a11y checks pass |
| E-4 | Real-time messaging (SSE/WebSocket) replacing polling | Live conversation feel | MEMBERS-ONLY | Transport | HIGH | Polling transport exists | Messages delivered without refresh |

---

## Phase ordering rationale

- **Phase A first** because correctness, privacy, and data integrity are non-negotiable foundations. Nothing else is safe to build on split persistence and no CI.
- **Phase B** adds reliability (transactions, pagination, observability) so the platform can operate predictably.
- **Phase C** makes discovery real (DB-backed) and transparent, aligning with WITHIN's discovery mission.
- **Phase D** adds the distinctive primitives (knowledge maps, trust tiers, context selves) that make WITHIN a "new kind of place."
- **Phase E** refines the distinctive experience (Auri, motion, a11y, real-time) only after foundations are solid.

**Do not** implement all 500 catalog entries. Implement one at a time, starting with Phase A, each with tests and documentation.
