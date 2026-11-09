# WITHIN — SANCTUARY
## Mission 01: Decision Lock & Implementation Blueprint

**Mission type:** Product architecture and implementation preparation
**Status:** Planning only — no application code, schema, or dependency touched.
**Date:** 2026-11-09
**Founder directive:** Reconcile `docs/vision/sanctuary-spec.md` with the actual
repository. Defaults for D-1…D-6 were provided and are locked for planning (§1).
Open items that were *not* specified are left unresolved (§6) — none were
silently decided.

Strict rules honored: no source edits, no schema changes, no renames/deletions,
no installs, no deploy. Verification commands (`npx tsc --noEmit`, `npm run
lint`, `npm run build`) are read-only and are logged in §8.

---

## 0. EVIDENCE POLICY

Every load-bearing claim below was re-verified by direct file reads on
2026-11-09, not inherited from prior reports. Where the standing audit
(`docs/audit-2026-10-27.md`) disagrees with today's tree, today's tree wins and
the correction is recorded in §8. All paths are repository-relative.

---

## 1. DECISION LOCK

The founder's defaults, locked for planning. Each lock has engineering
consequences and a residual open question.

| # | Decision | Locked direction | Engineering consequence | Open remainder |
|---|---|---|---|---|
| D-1 | Reflection · Journal · Mirror | One writing system (`mirrorEntries`), two postures: Reflection = prompt-led writing, Journal = dated browse/collections. Mirror stays a top-level destination. | No second table/API. Journal posture = new *rendering* over existing rows. | O-4: tags/collections/search data model (§6) |
| D-2 | Emotional Space · Daily Check-in | One check-in engine; Daily Check-in is the gentle optional invitation, Emotional Space the fuller room. No guilt, no compulsion. | First server-persisted mood rows (`mood_checkins`) + one API. `/mirror#mood` dead anchor resolved by real mounting. | O-3: where history lives (§6) |
| D-3 | Memories | User-authored memories with optional references to existing content. No auto-capture; edit/delete/export controls. | New owner-owned `memories` table with `sourceType/sourceId` references (the `journeyItems` pattern), plus honest reference resolution. | O-2: reference vocabulary; O-7: split shelf truth (§6) |
| D-4 | Navigation | `UNIVERSE_NAV` remains the single source of truth; Sanctuary pages render from it with Sanctuary active + warm illumination. No dead links; no Worlds item until a real route exists. | No nav fork. World personality class `world-sanctuary` already exists for atmosphere. | O-5: global nav restructure (spec §3.A lists 8 items incl. Worlds) is a separate product decision |
| D-5 | Visual reference | The approved concept must become a repository reference asset before any visual sign-off. | Placeholder until then: `docs/assets/sanctuary/` (or `docs/vision/assets/`) proposed location; nothing can "pass" §9 of the spec without it. | Asset has not arrived (confirmed absent from repo) |
| D-6 | Meditation | Stateless first: breathing guidance, ambient where permitted, optional timer, global sound-off always wins, no session history. | No table; builds on `src/lib/within-sound.ts` (opt-in, master-off) + content audio. | O-6: ambient sourcing — synthesized only, or recorded assets via the prepared `SOUND_ASSET_PATHS` swap-point |

---

## 2. VERIFIED FUNCTIONALITY INVENTORY

### 2.1 Writing system (Reflection + Journal) — EXISTS, wired backend, unmounted UI

| Evidence | Fact |
|---|---|
| `src/lib/db/schema.ts` L~450 | `mirror_entries`: `userId`, `body`, `prompt` (≤200), optional `moodId` ("user-chosen, not inferred"), timestamps |
| `src/lib/mirror.ts` | Owner-scoped at the query level (`WHERE userId = caller`); create/get/update/delete; body ≤5000 |
| `src/app/api/mirror/route.ts` | GET (own, newest-first, limit 50) / POST; `requireUser`, rate-limit 30/min, input validation |
| `src/app/api/mirror/[id]/route.ts` | PATCH (body/moodId) / DELETE; foreign id → 404 "never a leak" |
| `src/components/mirror/MirrorExperience.tsx` (326 lines) | Full client experience: session gate with honest sign-in card, prompt-led composer (5 prompts, "one prompt per visit — not a slot machine"), char counter, optimistic delete **with rollback**, `"Looking back"` first/newest juxtaposition ("Mirror doesn't draw the conclusion; you do"), privacy note |

**Works:** create, list, delete (optimistic + rollback), prompts stored as
metadata, private by construction.
**Incomplete:** the UI never calls the existing PATCH (entries can't be edited
in the interface); no tags, no collections, no entry search, no date browse, no
export; list is a hard newest-50.
**Unmounted:** `MirrorExperience` is imported nowhere — `src/app/mirror/page.tsx`
renders `UniverseShell` + `WorldHero` + `ContextualRail` only (verified).
**Reuse:** everything. Journal posture (D-1) needs UI work only.

### 2.2 Mood / check-in (Emotional Space + Daily Check-in) — CLIENT-ONLY ENGINE, orphans available

| Evidence | Fact |
|---|---|
| `src/lib/mood.ts` | 10 named moods (Inspired, Reflective, Peaceful, Lost, Motivated, Hopeful, Calm, Curious, Nostalgic, Overwhelmed), each with rgb triple + reply line; `applyMood` rewrites `--mood-rgb`; persistence via `src/lib/memory.ts` AuriMemory (`selected-mood`); localStorage only |
| `src/app/globals.css` L79–80 | `--mood-rgb` default brand purple; consumed by ~20 rules |
| `src/components/sanctuary/MoodOrbit.tsx` | Orbit selector wired to `applyMood`/`onMoodChange` (syncs with Auri chips); `id="mood"` anchor. **Orphaned** — and the living `/mirror#mood` SanctuaryPanel link presupposes this mount |
| `src/components/home/SanctuaryPanel.tsx` L27–33 | Rooms: Journal→`/mirror`, Memories→`/photography`, Mood→`/mirror#mood` (dead anchor today), Voice Notes→`/sanctuary` (self-redirect), Private Auri→orb |
| `src/components/sanctuary/DailyReflection.tsx` | 12 prompts (verified), day-indexed, hydration-safe; stores **one single slot** `{date, text}` in `within:reflection`. **Orphaned** (imported only by the also-orphaned `HomeFeedShuffler`) |
| `src/lib/memory.ts` L10–14 | Documented `INTEGRATION POINT`: a server backend can implement the same `AuriMemory` interface; consumers never touch localStorage directly |
| `src/app/api/mood/**` | **Does not exist** (verified against full API inventory) |

**Genuinely new:** a server-persisted check-in (table + owner-scoped API) —
the app's first truth for mood history. The two spec rooms (03, 07) must share
it (D-2). The AuriMemory contract is the blessed seam; the table stores only
what the user explicitly checked in.

### 2.3 Personal Growth — SERVER API LIVE, UI UNMOUNTED; on-device sibling exists

| Evidence | Fact |
|---|---|
| `src/lib/db/schema.ts` L704–762 | `journeys` (owner, slug unique, status draft/published/archived, visibility default private) + `journeyItems` (gap-free position, `sourceType` ∈ content/world/mirror/creation/other, note) |
| `src/lib/journeys.ts` | Authoring service; drafts private by default; publishing explicit |
| `src/app/api/journeys/*` | 4 route files: base CRUD, `[slug]`, `[slug]/items`, `[slug]/publish` — live APIs |
| `src/app/journey/page.tsx` | Personal Exploration Atlas — on-device, private, **not** the server journeys; and the only major room that does **not** ride `UniverseShell` (own crystal container) |

**Gaps:** no UI for authored journeys; no goals table (deferred per D-6-adjacent
sequencing rule: journeys first). Growth history (spec 4.5) can render from
journeys + mirror links before any new truth exists.

### 2.4 Memories — TWO coexisting keep-systems (audit A-1 unfinished)

| Evidence | Fact |
|---|---|
| `src/app/api/library/route.ts` | POST toggle / GET list via `src/lib/interactions.ts` (`listSaves`, `toggleSave`) — **Postgres, cross-device** |
| `src/lib/library.ts` + 5 consumers | `getShelf`/`getInProgress`/`addToShelf`/… over **localStorage** (`AuriMemory favorite-content`): consumed by `return.ts`, `MemoryCards.tsx`, `profile/ProfileView.tsx`, `ContinueJourney.tsx`, `ContentDetail.tsx` |
| `src/components/sanctuary/MemoryCards.tsx` | Renders the **local** shelf as memory cards — orphaned |

**Consequence for Memories (D-3):** before authoring memory entries, the split
truth must be resolved — profile shelves still read localStorage while
`/api/library` persists Postgres. Authoring memory entries that *reference*
(`sourceType/sourceId`) and own text is new truth; it must reference durable
systems, not the local shelf. Migration of the 5 consumers is a Phase B/C
dependency, not a Sanctuary invention.

### 2.5 Continuity — finished, truthful, unwired

`WhileYouWereAway.tsx` + `src/lib/away.ts` + `/api/away`: built strictly from
real rows (unread notifications count, drafts waiting, moderation updates, new
work from follows, own views); "when nothing happened, the summary is empty and
the UI simply doesn't appear"; "no inferred emotional states." Correct home:
the Sanctuary/welcome layer (or `/home` per audit order).

### 2.6 Navigation & shell — single source verified

| Evidence | Fact |
|---|---|
| `src/lib/navigation.ts` L19–45 | `UNIVERSE_NAV` — 17 items, 5 groups, only real routes; comment: "Only routes that actually exist are included… linking to nothing is worse than omitting." Sidebar, BottomNav, CommandPalette derive from it |
| `src/components/layout/UniverseShell.tsx` | AppShell + `AuriOrb`; `preset="sanctuary"` (default) → `atmosphere="calm"`; `worldClass` passthrough. Comment names sanctuary among the calm presets |
| `src/components/layout/AppShell.tsx`, `TopBar.tsx`, `BottomNav.tsx`, `Sidebar.tsx` | Shared rails; TopBar = search pill (⌘K palette), notifications bell, sky chip → `/atlas`, avatar → `/profile` — matches spec §3.B minus the "profile dropdown" |
| `src/components/auri/AuriContextualPresence.tsx` | Already maps `/sanctuary → sleeping` |
| `src/app/worlds/` + `src/app/worlds/[slug]` pages | **Do not exist** (verified against full page inventory). `api/worlds/*` (CRUD + publish) and `.world-worlds` CSS tokens exist — backend-first, page-less. Spec §3.A "Worlds" must not appear in nav until a real route (D-4) |

### 2.7 Design system — Sanctuary atmosphere partially tokenized

| Evidence | Fact |
|---|---|
| `src/app/globals.css` L1838–1878 | World personalities: `.world-sanctuary` (violet-blue-silver), `.world-mirror`, `.world-within-time`, `.world-worlds` exist |
| `src/app/globals.css` L1880+ | Editorial typography utilities — `--font-fraunces` display voice; interfaces ride Geist (AGENTS design language). Spec §2 typography resolves to this established pair |
| `src/components/ui/` (27 files) | Button (with `loading`), Text, Icon, **GlassCard** (active everywhere), **GlassPanel** (exists but audit §L lists it as dead-wood candidate), Container, SectionHeader, PageHero, MobileSheet, skeletons, etc. Spec §8's `ui/GlassPanel.tsx` already exists; `CelestialButton`/`DestinationIcon` do not — platforms for those are `Button` variants and `ui/Icon` names, not new components |
| `src/components/transitions/PortalTransition.tsx` + `src/lib/light-memory.ts` + `NavGlow.tsx` | Route-level portal transition + session visit glow (courtesy, zero data leaves client) |
| `src/lib/within-sound.ts` | Opt-in Web Audio synthesis; master-off always wins; recorded-asset swap point `SOUND_ASSET_PATHS` prepared. No recorded ambient assets exist yet |

### 2.8 The Sanctuary route — the founding fact

`src/app/sanctuary/page.tsx` (5 lines): `redirect("/home")` — "one route, one
name." `/home` (`src/app/home/page.tsx`, verified in full) is the de-facto
sanctuary: light `crystal-world`, `EnvironmentLayers` + `AmbientLight`, AppShell
nav, TopBar, HomeHero, WorldPortals, HomeRail + ContextualRail, trio
FeedPanel/MessagesPanel/**SanctuaryPanel**, HomeDock, `ReturningGreeting`,
`AuriOrb`, `MicroDiscoveries`; real server feed with honest error state.

The spec's two-room intent (§3: "Home is expansive; Sanctuary is intimate")
requires `/sanctuary` to become a real room — the redirect dies in Phase A.
`/home` keeps its identity; Sanctuary is the dark, intimate counterpart
(`UniverseShell preset="sanctuary"` + `worldClass="world-sanctuary"` vs.
`/home`'s light crystal).

### 2.9 Does not exist at all

- Meditation experience (breathing/ambient/timer) — no component, no route.
- Mood persistence (any table/API).
- Authored memory entries (table/API).
- Support-resources curated set (spec §4.3).
- Artwork/environmental art assets for the approved concept (D-5).
- Roman "Voice Notes": no feature anywhere; `within-sound.ts` explicitly
  documents `auriVoice: false // no voice exists yet; the switch is honest`.

---

## 3. DEPENDENCY MAP (critical path)

Ordered — earlier items gate later ones:

1. **DB migration drift (P0, pre-existing).** Audit K-4: deployed DB is 7/9 on
   migrations (`users.clerk_id` absent, password columns NOT NULL). Any Phase C
   migration chains on top. Human-owned remediation today: review pending SQL →
   `npm run db:migrate` → re-run probes. **Never `db:push`** (AGENTS).
2. **Mood check-in truth (D-2) → Emotional Space + Daily Check-in.** New table
   (`mood_checkins`) + one owner-scoped API (`/api/mood`), `db:generate` → review
   → `db:migrate`. Ambience (`--mood-rgb`) stays as-is client-side.
3. **Memory-entry truth (D-3) → Memories room.** Depends on split-shelf
   resolution (2.4) and the reference-vocabulary decision (O-2). Follows the
   `journeyItems` `sourceType/sourceId` ownership pattern.
4. **Mirror UI completion (D-1) → Reflection + Journal postures.** Mount
   `MirrorExperience` (audit N-4). Edit-control gap (PATCH exists, UI doesn't
   use it) closes in the same motion.
5. **Hydration discipline (audit K-1/K-2) → any Sanctuary hero/time text.** Use
   the established `useMountedSafe`/`useSyncExternalStore` pattern
   (`SanctuaryHero.tsx` already sets the exemplar; `ReturningGreeting.tsx` L72
   is the known offender — fix on mount, not by abandonment).
6. **Shell/nav (D-4) → all seven destination cards.** Every card href must
   resolve to a real route on ship-day; Sanctuary panels reuse rails, no fork.
7. **Auri consolidation (O-1) → presence in Sanctuary.** `AuriOwl`/`AuriOrb` are
   canonical; two orphaned duplicates (`within/auri/AuriPresence.tsx`,
   `auri/AuriPresenceV2*`) must be resolved by founder decision before any
   third Auri surface is touched.
8. **Visual reference asset (D-5) → Phase D sign-off.** Nothing visual can be
   declared approved without it; repo contains no concept artwork today.
9. **Environment/perf coupling → every subpage.** Large artwork per spec §2
   must remain recognizable across crops (§2 of spec) — resolution + format +
   loading strategy is a performance-law constraint, not a polish item.

---

## 4. IMPLEMENTATION SEQUENCE (Phases A–D)

No phase starts without founder sign-off of this document. Each phase ends with
`npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run smoke` — and a
manual visual pass (no headless browser exists in this environment; §8).

### PHASE A — Sanctuary Foundation

Objective: `/sanctuary` becomes a real, intimate, dark room inside the shared
universe — different in feel from `/home` on the first visit.

| # | Task | Where | Notes/guards |
|---|---|---|---|
| A1 | Replace the redirect with a room page | `src/app/sanctuary/page.tsx` | `UniverseShell preset="sanctuary"` + `worldClass="world-sanctuary"`. Keep the "one route, one name" comment updated; Voice Notes entry later stops self-redirecting |
| A2 | Hero — "You can slow down here." + "Take a breath. / This space is yours." | evolve `src/components/sanctuary/SanctuaryHero.tsx` in place (do not supersede) | Founder copy wins over the component's current "WithIn" display headline; keep its hydration-safe time greeting store + reduced-motion parallax guards. Founder copy vs component copy is a design reconcile, recorded in the PR description |
| A3 | Seven-destination grid | e.g. `src/components/sanctuary/SanctuaryDestinations.tsx` + card component | Cards link only to real destinations (D-4). Ship-state mapping: 01/02→Mirror postures (`/mirror`), 03→in-room mood section, 04→in-room meditation section, 05→`/journey`, 06→`/profile` shelves until D-3 room exists, 07→in-room check-in. Exact sequence retained per spec §3.E |
| A4 | Welcome note panel ("Your sanctuary. Your peace. Your space.") | skip/defer mounting until Auri decision O-1 — the spec itself marks the character "pending a decision" | Do not mount a duplicate presence component |
| A5 | Floating panels (reminder audio, journey indicator) | defer to Phase B; the journey panel must never become a streak/progress tracker (spec §3.G) | — |
| A6 | `/home` disjoint adoption | after A1–A3 ship: update `SanctuaryPanel.ROOMS` so Mood/Memories links stop dying (`/sanctuary` becomes real; Voice Notes decision O-6) | — |

**Phase A acceptance:** `/sanctuary` renders with the shared rails, Sanctuary
nav-active, hero copy correct, seven real destinations, dark twilight
atmosphere, reduced-motion clean, mobile dock + tablet layout honest to spec
§6. No new tables. No fabricated anything on cards.

### PHASE B — Existing experiences, wired (audit N-4 discipline: wire, then remove parallels)

| # | Task | Evidence basis |
|---|---|---|
| B1 | Mount `MirrorExperience` on `/mirror` (it must not be a hero-only room); keep UniverseShell frame | 2.1 — audit L-1.1 |
| B2 | Reflection vs Journal postures on Mirror (prompt-led composer + dated browse view) — one engine | D-1; PATCH-existing/UI-missing gap closes here; tags/collections only as O-4 allows |
| B3 | Mount `MoodOrbit` (or its evolute) in the Sanctuary mood section; retire the `/mirror#mood` dead anchor | 2.2; brand §5 fix: the orbit's habitual pulse loop needs reduced-motion-safe treatment like the rest |
| B4 | Mount `DailyReflection` as the Daily Check-in surface (local-slot behavior until Phase C persistence exists — never fake persistence) | 2.2 |
| B5 | Mount `WhileYouWereAway` in the Sanctuary welcome layer (auditable truth lines only) | 2.5; if `/home` gets it per audit order, Sanctuary reuses, never duplicates |
| B6 | Mind the split shelf: migrate the five localStorage-library consumers toward `interactions.ts` (audit A-1) *before* Memories room work | 2.4 |
| B7 | Wire journeys UI (Personal Growth card → authored-journey surface later; Atlas stays the private on-device layer) | 2.3 |

### PHASE C — Missing truth, once each

| # | Truth | Table/API | Privacy spine |
|---|---|---|---|
| C1 | Mood check-in | `mood_checkins` (owner-scoped, chosen mood id, optional note, created day) + `/api/mood` GET/POST | Stores *only* explicit check-ins; no inference; never categorized; deletion + export in Scope (spec §7) |
| C2 | Memory entries | `memories` (owner, text, date, optional source refs by `sourceType/sourceId`) + `/api/memories` | Keeping is a choice (Law 15); export/delete first-class |
| C3 | Mirror completeness | only if O-4 locks it: tags/collections as additive columns, entry search server-side (bounded, owner-scoped) | — |
| C4 | Support resources | static curated content (no user query analysis) surfaced from Emotional Space | Invitation, never triggered-inference (Law 17) |
| C5 | Meditation | none (stateless per D-6) | Session prefs ride device-level sound settings |

Each C-item: `npm run db:generate` → review SQL → `npm run db:migrate`; never
push; never destructive.

### PHASE D — Visual excellence

- Land the approved concept under `docs/assets/sanctuary/` (D-5) and reconcile
  tokens: spec's twilight violet/celestial gold joins the existing
  `.world-sanctuary` family as `--within-*` additions — no hardcoded literals.
- Card artwork crops per spec §2: same artistic identity, recognizable room.
- Desktop/tablet/mobile per spec §6; mobile = intentional composition, no
  compressed sidebar (BottomNav + Sanctuary-correct dock decision O-8).
- Reduced-motion sweep (audit O-list item) — decorative `repeat: Infinity`
  loops guarded or removed (MoodOrbit pulse is first in line).
- Per-subpage visual review against the reference; "a successful build does
  not equal visual approval" (spec §9).

---

## 5. RISK ASSESSMENT

**Privacy (product-critical).**
- Mood history is kept-acts, not telemetry: store only explicit check-ins; show
  only the person's own; never infer; never notify on them. Notification copy
  must never reveal private reflection content (spec §7).
- No public exposure path for any Sanctuary table in Phase C (mirror precedent:
  owner-scoped WHERE clauses).
- Export/deletion exists for neither mirror nor mood today — spec §7 demands
  it; scope it into C1/C2 acceptance, or record it as deferred with the founder.
- Auri never reads Mirror or mood tables (AGENTS AURI contract).

**Architecture.**
- Seven-orphan wiring (2.1–2.5) creates drift risk *in reverse*: two mounted
  variants of the same surface. Rule: one mount per component; delete parallels
  only with founder-approved change (Mission rules bar deletion now).
- `UNIVERSE_NAV` is the single nav truth — Sanctuary pages must not special-case
  the rail (D-4). `.world-sanctuary` class changes atmosphere, not nav.
- DB migrations are additive and sequenced; K-4 drift (deployed ≠ code) must go
  before C-phase migrations land, or the drift compounds.
- Two Auri presence duplicates still exist; touching a third would triple them.

**Visual fidelity.**
- No concept asset in repo (D-5) — every visual judgment today is provisional.
- No headless browser in this environment — visual verification is manual
  screens at 360/390/768/1280/1440 per FRONTEND_NEXT_CHAPTER guidance.
- Performance law: the hero artwork is the page — dimensions, format (AVIF/WebP
  candidates), and crop strategy decide whether the room is beautiful or slow.

**Reliability.**
- Next is `16.5.0-canary.17` (audit M-6 recommends stable pin before release —
  pre-existing; flagged here because Sanctuary rides route composition).
- Per-instance rate limiting is documented-honest for single-instance deploys;
  mood/memories endpoints inherit it.

---

## 6. UNRESOLVED FOUNDER DECISIONS

None of these are silently resolved. D-1…D-6 defaults were provided and are
locked for planning (§1). These remain open:

| # | Decision | Recommendation (non-binding) | What's blocked |
|---|---|---|---|
| O-1 | Auri in Sanctuary — which identity faces the room; and how the two orphaned AuriPresence duplicates are resolved | Evolve `AuriOwl` in place (BRAND.md Gen 02); `AuriPresence` states only for emergence moments; the two duplicates die or merge by explicit founder approval after Phase B | A4 welcome-note mount; any new presence surface |
| O-2 | Memory reference vocabulary (`sourceType` values: save? mirror? creation? world?) | Adopt `journeyItems`' five-value prefix and extend with `"memory"` only if unchecked evidence demands | C2 schema |
| O-3 | Where mood history lives — Sanctuary (Emotional Space) vs Atlas instruments (`MoodWeather`, `MoodLab` read from the same truth) | History surfaces in Sanctuary; Atlas instruments consume the same rows, no second writer | C1 UI |
| O-4 | Journal tags/collections/search data model | Client-side filter first; additive columns only when collections are genuinely wanted | B2 scope, C3 |
| O-5 | Global nav restructure (spec §3.A's 8-item list vs UNIVERSE_NAV's 17 real-route items) | Keep 17; revisit as its own map/mission — Worlds needs a real route first | Nothing inside Sanctuary |
| O-6 | Voice Notes — build a real voice-capture feature or remove the SanctuaryPanel entry | Remove the dead entry first; a voice feature is its own mission ( microphone permissions, storage, delete) — not a Sanctuary subtask | A6 |
| O-7 | Split-shelf writedown: localStorage `library.ts` vs Postgres `saves`/`/api/library` — which is truth for profile shelves during Phase B | Postgres is truth; migrate the five consumers; `library.ts` retires by provenance (audit A-1) | B6, C2 resolution |
| O-8 | Mobile treatment of Sanctuary (BottomNav items vs dedicated dock) | Keep the shared dock; consider a fourth-position Sanctuary swap only if the whole dock composition changes | Phase D mobile review |

---

## 7. MISSION 02 — FIRST IMPLEMENTATION MISSION (proposed scope)

Exactly Phase A, nothing more:

1. `/sanctuary` real page (A1) — redirect dies; founder intent (spec §3) ships.
2. Hero reconcile (A2) — one component evolved in place, founder copy honored.
3. Destination grid (A3) — seven cards, real hrefs only, exact spec order.
4. `/home` SanctuaryPanel link repair (A6-partial) — only the two dead links
   that Phase A fixes for free (`/sanctuary` becomes real); everything else
   stays for later phases.
5. Full verification quartet + manual visual pass + written PR description
   recording each spec-vs-reality reconcile made.

Explicitly out: no tables, no Auri changes (O-1 open), no nav edits beyond
Sanctuary's own page, no panel mounts beyond the hero/grid (O-1-gated), no
MoodOrbit/DailyReflection wiring (Phase B), no image assets invented (D-5 open).

---

## 8. VERIFICATION LOG (2026-11-09)

Read-only commands run for this plan; results from a clean working state:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **Pass, zero output** — the `content-service.ts:232` PgTransaction blocker recorded in `docs/FRONTEND_NEXT_CHAPTER.md` is *not reproducible today* (fixed or stale; either way the current tree typechecks) |
| `npm run lint` | 0 errors, 5 warnings (all unused-variables: `NavGlow.tsx:18`, `lib/__tests__/event-lifecycle.test.ts:29`, `auth/session.tsx:70`, `events/outbox.ts:16`, `light-memory.ts:29`) — none touched by Phase A |
| `npm run build` | **Pass** — compiled 17.1s (Turbopack), TypeScript clean in-build (14.6s), 86 static pages prerendered. Warnings: `middleware` convention deprecated (audit M-6 codemod available) — pre-existing. Route manifest confirms `/sanctuary` is a statically prerendered redirect page today |
| `npm run smoke` | **Pass** — 20 routes + all referenced assets, run against a local production server (`next start`, then stopped; no deploy). First attempt without a server failed on all fetches — smoke requires `next start` serving the built `.next` |

**Build-manifest facts used by the plan:** `/journey`, `/between`, `/constellation`,
`/connections` are static — future journeys UI mounting will convert routes to
dynamic deliberately; `/qa` is still static-reachable (audit M-7, pre-existing
release-discipline item, not Sanctuary's to fix on code-mission time).

**Stale-report corrections established by direct reads today:**
1. Frontend-chapter "verified build blocker" not reproducible (above).
2. Spec §8's `ui/GlassPanel.tsx` already exists and is a *dead-wood candidate*
   per audit §L — do not build it and do not reuse it for Sanctuary; **GlassCard**
   is the live primitive every exemplar component uses.
3. The livewire dead-ends in `SanctuaryPanel` (`/mirror#mood`, Voice Notes)
   confirmed in source; they are design debt the spec should eliminate, not
   features to route around.
4. `DailyReflection` keeps exactly **one** local slot (`{date, text}`) — server
   persistence is genuinely new truth under D-2; don't over-claim what exists.

**Files directly inspected this mission** (selection):
`src/app/sanctuary/page.tsx`, `src/app/home/page.tsx`, `src/app/mirror/page.tsx`,
`src/app/journey/page.tsx`, `src/app/atlas/page.tsx`,
`src/components/mirror/MirrorExperience.tsx`, `src/components/sanctuary/{MoodOrbit,DailyReflection,SanctuaryHero,WhileYouWereAway,MemoryCards,HomeFeed(Shuffler),WorldPulse}.tsx`,
`src/components/home/SanctuaryPanel.tsx`, `src/components/layout/UniverseShell.tsx`,
`src/lib/{mirror,journeys,mood,memory,away,world}.ts`, `src/lib/library.ts`,
`src/app/api/{mirror(route+[id]),journal?—n/a,library,away}.ts` (correct paths:
`api/mirror/route.ts`, `api/mirror/[id]/route.ts`, `api/library/route.ts`),
`src/lib/db/schema.ts` (regions L44x–L46x, L700–789), `src/app/globals.css`
(L79–80, L1830–1900), `src/lib/navigation.ts`, `package.json`,
`docs/audit-2026-10-27.md` (§A–§O), plus full page and API route inventories
via glob.
