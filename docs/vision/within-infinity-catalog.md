# WITHIN INFINITY — Capability Catalog

Repository: https://github.com/SimonPeterOfficial/within-v2
Artifact: docs/vision/within-infinity-catalog.md
Minimum discovery target: 500 distinct capabilities

## How to read this catalog

This is an invention catalog for WITHIN — a living digital world, not a conventional social network, dashboard, or AI wrapper.

Each entry is a distinct capability, feature, infrastructure improvement, interaction primitive, or research-backed product opportunity relevant to WITHIN.

## Classification codes

| Code | Meaning |
|------|---------|
| IMPLEMENTED | Verified as working in the current repository |
| EXTEND | Existing capability requiring improvement |
| BUILD | Proposed new capability |
| EXPERIMENT | Needs a prototype or evaluation |
| RESEARCH | Important questions remain unanswered |
| DEFER | Valuable but dependent on future foundations |

## Privacy classifications

| Class | Meaning |
|-------|---------|
| PUBLIC | Visible to anyone in WITHIN |
| LISTED | Shown in public discovery (search/feeds) |
| UNLISTED | Retrievable by ID/slug, never listed |
| PRIVATE | Owner + moderator only |
| OWNER_ONLY | Owner only |
| SELECTIVE | Owner chooses recipients |
| ANONYMOUS | No identity attached |

## Complexity estimates

| Level | Meaning |
|-------|---------|
| LOW | Small change, existing patterns, no new infra |
| MEDIUM | New service/file, moderate scope, tests needed |
| HIGH | New domain model, infra decision, cross-team coordination |

---

## Territory A — Identity Beyond Profiles

A-001. **Chosen display context** — A user selects which name, avatar, and gradient surface in each world/room rather than one global profile. Addresses: identity flattening across contexts. Backend: store context→presentation mappings keyed by user+context. Dependencies: profiles table. Privacy: SELECTIVE. Complexity: MEDIUM. Value: HIGH.

A-002. **Evolving interest decay** — Explicit interests the user picks during onboarding age out unless re-confirmed. Addresses: static profile stale-ness. Backend: interests table with last_confirmed_at; recommenders weight by recency. Dependencies: interests table. Privacy: PRIVATE. Complexity: MEDIUM. Value: MEDIUM.

A-003. **Identity continuity log** — A read-only log of identity changes (name, avatar, pronouns, category) the user chose. Addresses: no history of self-presentation. Backend: identity_changes table append-only. Dependencies: profiles. Privacy: OWNER_ONLY. Complexity: LOW. Value: MEDIUM.

A-004. **Contextual pseudonym per world** — Within a specific world, the user appears under a pseudonym unrelated to their global handle. Addresses: desire to explore without global identity. Backend: world_pseudonyms table keyed by (world_id, user_id). Dependencies: worlds, users. Privacy: SELECTIVE. Complexity: MEDIUM. Value: HIGH.

A-005. **Mood as explicit, never inferred state** — User sets a mood label; the system never guesses emotion from behavior. Addresses: emotional surveillance. Backend: selected_mood in memory; read-only for recommenders. Dependencies: memory layer. Privacy: PRIVATE. Complexity: LOW. Value: HIGH.

A-006. **Quiet mode toggle** — User opts out of discovery, recommendations, and social surfacing entirely while retaining private spaces. Addresses: social pressure to be visible. Backend: quiet_mode flag on profile; all public-read paths respect it. Dependencies: profiles. Privacy: PRIVATE. Complexity: LOW. Value: HIGH.

A-007. **Avatar halo as chosen gradient** — The user selects gradient stops for their presence indicator; no image upload required. Addresses: identity without imagery. Backend: gradient column already exists on profiles. Dependencies: profiles. Privacy: PUBLIC. Complexity: LOW. Value: LOW.

A-008. **Category as chosen placement** — The user picks which "corner of the universe" they belong to; not algorithmically assigned. Addresses: algorithmic categorization. Backend: category column on profiles. Dependencies: profiles. Privacy: PUBLIC. Complexity: LOW. Value: LOW.

A-009. **Bio length tiers** — Short whisper (60 chars), standard bio (280), long story (2000); user chooses tier. Addresses: one-size self-description. Backend: bio column; tier metadata. Dependencies: profiles. Privacy: PUBLIC. Complexity: LOW. Value: LOW.

A-010. **Name pronunciation hint** — Optional phonetic spelling the user provides for their name. Addresses: mispronounced names. Backend: pronunciation_hint column. Dependencies: profiles. Privacy: PUBLIC. Complexity: LOW. Value: LOW.

A-011. **Presence rhythm preference** — User states how often they wish to be surfaced (rarely, sometimes, often). Addresses: unwanted surfacing frequency. Backend: presence_rhythm column. Dependencies: profiles. Privacy: PRIVATE. Complexity: LOW. Value: MEDIUM.

A-012. **Identity snapshot on world entry** — When entering a world, the system captures which identity the user presented there. Addresses: no record of context-specific self. Backend: identity_snapshots table. Dependencies: worlds, users. Privacy: OWNER_ONLY. Complexity: MEDIUM. Value: MEDIUM.

A-013. **Graceful identity retirement** — User can retire a handle without deleting content; content attribution shifts to "a former resident." Addresses: handle regret without content loss. Backend: retired_handles table; content attribution rewrite. Dependencies: users, content. Privacy: PRIVATE. Complexity: HIGH. Value: HIGH.

A-014. **Multiple context selves** — User maintains named "selves" (e.g., "writer self", "reader self") each with own preferences. Addresses: one profile cannot hold multiple roles. Backend: context_selves table; default_self on profile. Dependencies: profiles. Privacy: PRIVATE. Complexity: HIGH. Value: HIGH.

A-015. **Self-switch audit** — Each context-self switch is logged with timestamp and world. Addresses: no visibility into self-switching. Backend: self_switch_log table. Dependencies: context_selves. Privacy: OWNER_ONLY. Complexity: MEDIUM. Value: MEDIUM.

## Territory B — Relationships Beyond Followers

B-001. **Mutual-interest highlight** — Two people who saved the same category are gently surfaced to each other as "same taste" without following. Addresses: discovery limited to follows. Backend: recompute from saves; category overlap. Dependencies: saves, content. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

B-002. **Shared history depth** — A relationship summary showing what two people have co-attended, co-saved, or co-referenced. Addresses: follows are binary; history is richer. Backend: shared_activity derived from saves/views/conversations. Dependencies: saves, content_views, conversations. Privacy: SELECTIVE. Complexity: MEDIUM. Value: HIGH.

B-003. **Trust tier per person** — User assigns a person to a trust tier (acquaintance, confidant, inner circle) that gates selective sharing. Addresses: binary follow/block is insufficient. Backend: trust_tiers table keyed by (user, other). Dependencies: users. Privacy: PRIVATE. Complexity: MEDIUM. Value: HIGH.

B-004. **Relationship decay without interaction** — Dormant relationships quietly recede from discovery unless renewed. Addresses: static follower graphs. Backend: last_interaction_at on relationships; decay function. Dependencies: follows, friendships. Privacy: PRIVATE. Complexity: MEDIUM. Value: MEDIUM.

B-005. **Collaborative collection** — Two or more people jointly curate a collection of content; each can add/remove. Addresses: collections are solo. Backend: collaborative_collections table + members. Dependencies: saves. Privacy: SELECTIVE. Complexity: HIGH. Value: HIGH.

B-006. **Relationship origin story** — User records how they met/connected with another person (optional free text). Addresses: relationships lack provenance. Backend: relationship_origin table. Dependencies: follows, friendships. Privacy: SELECTIVE. Complexity: LOW. Value: MEDIUM.

B-007. **Connection context note** — When following, the user adds a private note why (visible only to them). Addresses: forgotten reasons for following. Backend: follow_notes table. Dependencies: follows. Privacy: PRIVATE. Complexity: LOW. Value: MEDIUM.

B-008. **Soft unfollow (mute without unfollow)** — Person stays followed but their content is deprioritized; no notification to them. Addresses: follow/unfollow is too blunt. Backend: mute_flags on follows. Dependencies: follows. Privacy: PRIVATE. Complexity: LOW. Value: HIGH.

B-009. **Relationship sunset** — After N months of no interaction, the relationship is archived (not deleted); can be restored. Addresses: zombie relationships. Backend: relationship_archived_at. Dependencies: follows, friendships. Privacy: PRIVATE. Complexity: MEDIUM. Value: MEDIUM.

B-010. **Introductions** — User A introduces user B to user C with a private message; B and C consent before connection. Addresses: cold connections. Backend: introductions table with consent states. Dependencies: users, messaging. Privacy: SELECTIVE. Complexity: MEDIUM. Value: HIGH.

B-011. **Shared journey participation** — Two people opt into walking the same Journey together; progress is shared. Addresses: Journeys are solo. Backend: journey_participants table. Dependencies: journeys. Privacy: SELECTIVE. Complexity: HIGH. Value: HIGH.

B-012. **Co-ownership of a world** — A world can have multiple owners with defined roles. Addresses: worlds are single-owner. Backend: world_owners table. Dependencies: worlds. Privacy: SELECTIVE. Complexity: MEDIUM. Value: HIGH.

B-013. **Relationship note visibility tiers** — A note on a relationship can be private, shared with the other person, or shared with both plus a world. Addresses: notes are all-or-nothing. Backend: relationship_notes with visibility enum. Dependencies: follows, friendships. Privacy: SELECTIVE. Complexity: MEDIUM. Value: MEDIUM.

B-014. **Connection anniversary** — System quietly notes (never announces) the date two people connected. Addresses: no relationship memory. Backend: derived from follows/friendships created_at. Dependencies: follows, friendships. Privacy: PRIVATE. Complexity: LOW. Value: LOW.

B-015. **Relationship health reflection** — Optional periodic prompt asking the user how a relationship feels; stored privately. Addresses: no relationship reflection. Backend: relationship_reflections table. Dependencies: follows, friendships. Privacy: PRIVATE. Complexity: MEDIUM. Value: MEDIUM.

## Territory C — Discovery Beyond Feeds

C-001. **Serendipity door** — Already exists: max 2 items with `whyThis` explanations; block/own/follow excluded. Status: IMPLEMENTED. Value: HIGH.

C-002. **Temporal discovery** — Surface content published around the same time the user first joined WITHIN. Addresses: discovery ignores join-era context. Backend: content published_at compared to user created_at. Dependencies: content, users. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

C-003. **Unfamiliar perspective mode** — Toggle to surface content from creators the user does not follow and categories they rarely save. Addresses: filter bubble. Backend: recommender excludes followed/saved categories. Dependencies: follows, saves, content. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

C-004. **Discovery without a query** — A "wander" button that surfaces one unexplored corner with no search input. Addresses: discovery requires knowing what to seek. Backend: random qualified sample from published public content. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: HIGH.

C-005. **Context-aware exploration** — Recommendations shift by time of day and user-selected mood. Addresses: static recommendations. Backend: recommend_for(mood, period) already exists in lib/recommendations.ts. Dependencies: content, memory. Privacy: PRIVATE. Complexity: LOW. Value: MEDIUM.

C-006. **Idea connection surfacing** — Two pieces of content sharing tags or category are linked as "related ideas" on each other's pages. Addresses: content is isolated. Backend: content_tag_overlap derived view. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

C-007. **Returning visitor re-surface** — When a user returns, show what changed since their last visit (return.ts already exists). Status: IMPLEMENTED (local only). Value: HIGH.

C-008. **Creator-first discovery** — Browse by creator rather than by content type. Addresses: discovery is content-first. Backend: listPublishedByCreator grouped by creator. Dependencies: content, profiles. Privacy: PUBLIC. Complexity: LOW. Value: MEDIUM.

C-009. **Category depth exploration** — Drill into a category to see sub-groups by tag co-occurrence. Addresses: flat categories. Backend: tag_cooccurrence derived from content.tags. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

C-010. **Freshness-only listing** — A view of only content published in the last 7 days. Addresses: stale discovery. Backend: publishedAt filter. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: MEDIUM.

C-011. **Quiet discovery** — Surface content with no engagement (zero saves/likes) to give it a first audience. Addresses: popularity bias. Backend: left join saves; count = 0 filter. Dependencies: saves, content. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

C-012. **Long-form discovery** — Surface content by reading time buckets (under 5 min, 5–15, over 15). Addresses: no time-aware browsing. Backend: content mediaRef/description parsed or explicit reading_time. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

C-013. **Discovery by place** — Content tagged with a place is browsable by place. Addresses: no geographic/contextual browsing. Backend: place tag on content. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

C-014. **Discovery by language** — Filter content by detected or declared language. Addresses: language-blind discovery. Backend: language column on content. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: MEDIUM.

C-015. **Discovery explanation** — Every surfaced item carries a plain-language `whyThis` (already exists for serendipity; extend to all discovery). Addresses: opaque recommendations. Backend: whyThis string stored per recommendation event. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: HIGH.

## Territory D — Knowledge as a Living Structure

D-001. **Content provenance** — Every piece carries source, author, and original publication date. Addresses: unattributed content. Backend: attribution, mediaRef, publishedAt already exist on content. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: HIGH.

D-002. **Idea links between works** — A user can link one content item to another as "responds to", "inspired by", "contradicts". Addresses: isolated works. Backend: content_links table with relationship type. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: HIGH.

D-003. **Knowledge map** — A user-created graph of content items and the links between them. Addresses: no knowledge structure. Backend: knowledge_maps + knowledge_map_nodes + knowledge_map_edges. Dependencies: content. Privacy: SELECTIVE. Complexity: HIGH. Value: HIGH.

D-004. **Versioned knowledge** — A content item can have versions; each version is immutable. Addresses: content is mutable/destructive. Backend: content_versions table. Dependencies: content. Privacy: PUBLIC. Complexity: HIGH. Value: HIGH.

D-005. **Disagreement markers** — A content item can be marked as "disputed" with a link to a counter-piece. Addresses: no room for disagreement. Backend: content_disputes table. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

D-006. **Source attribution for external content** — Ingested external content keeps original URL and source name. Addresses: plagiarism risk. Backend: source_url, source_name on content. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: HIGH.

D-007. **Intellectual journey** — A user-created path through content items with notes at each step (Journeys already exist). Status: IMPLEMENTED. Value: HIGH.

D-008. **Collaborative understanding** — Multiple users can annotate a knowledge map with comments. Addresses: knowledge maps are solo. Backend: knowledge_map_annotations. Dependencies: knowledge_maps. Privacy: SELECTIVE. Complexity: HIGH. Value: HIGH.

D-009. **Context preservation** — When linking content, the user saves the surrounding context (why they linked it). Addresses: links lose meaning. Backend: link_context text on content_links. Dependencies: content_links. Privacy: PUBLIC. Complexity: LOW. Value: MEDIUM.

D-010. **Knowledge map privacy** — Maps can be private, shared with specific people, or public. Addresses: no privacy on knowledge structures. Backend: visibility column on knowledge_maps. Dependencies: knowledge_maps. Privacy: SELECTIVE. Complexity: MEDIUM. Value: MEDIUM.

D-011. **Map fork** — A user can fork another's public knowledge map into their own. Addresses: no building on others' knowledge. Backend: forked_from on knowledge_maps. Dependencies: knowledge_maps. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

D-012. **Ideatrace** — A read-only trace of a user's idea interactions (saved, linked, annotated). Addresses: no idea history. Backend: derived from saves, content_links, annotations. Dependencies: saves, content_links. Privacy: OWNER_ONLY. Complexity: MEDIUM. Value: MEDIUM.

D-013. **Source quality flag** — User- or moderator-applied quality signal on external sources. Addresses: no source quality. Backend: source_quality on content. Dependencies: content. Privacy: PUBLIC. Complexity: MEDIUM. Value: MEDIUM.

D-014. **Citation export** — Export a content item's provenance as a citation. Addresses: no attribution export. Backend: read-only derivation. Dependencies: content. Privacy: PUBLIC. Complexity: LOW. Value: MEDIUM.
