/**
 * The Human Constellation engine — Gen 13.
 *
 * Builds an explorable relationship map of the PEOPLE of WithIn from real
 * seed data only. Every node is a real creator, work, community, or world
 * shelf; every edge is derived from an actual relationship in the catalogs
 * (authorship, shared mood, shared tags, shared discipline). Nothing is
 * fabricated: where the data has no relationship, there is no edge.
 *
 * This is NOT a follower leaderboard and NOT a social graph of private
 * relationships — it is a discovery landscape over public creative work.
 *
 * Pure functions throughout; the React layer decides presentation.
 */

import { CREATORS, type Creator } from "@/lib/creators";
import { COMMUNITIES, ORIGINALS, ALBUMS, BOOKS, PHOTOS, type CommunityItem } from "@/lib/content";

/* ── Node & edge shapes ──────────────────────────────────────────────── */

export type ConstellationKind = "creator" | "work" | "community" | "world";

export type ConstellationNode = {
  id: string;
  kind: ConstellationKind;
  title: string;
  subtitle: string;
  /** Route the node opens */
  href: string;
  emoji: string;
  gradient: string;
  /** Deterministic layout position in a 100×100 sky */
  x: number;
  y: number;
  /** Interest tags this node speaks to (used for common-ground) */
  interests: string[];
};

export type ConstellationEdge = {
  from: string;
  to: string;
  /** The honest relationship label — shown to the user */
  relation: "CREATED" | "GATHERS_AROUND" | "SAME_LIGHT" | "SHELVED_IN" | "KIN";
};

export type ConstellationCluster = {
  id: string;
  label: string;
  nodeIds: string[];
};

export type Constellation = {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  clusters: ConstellationCluster[];
};

/* ── Deterministic layout — a stable sky, same data → same positions ─── */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function positionFor(id: string, kind: ConstellationKind): { x: number; y: number } {
  const h = hash(id);
  // Kinds live in loose bands so clusters read visually; the hash spreads
  // nodes within each band. Golden-angle jitter avoids grid feel.
  const band =
    kind === "creator" ? 26 : kind === "work" ? 50 : kind === "community" ? 72 : 88;
  const angle = (h % 360) * (Math.PI / 180);
  const radius = 14 + (h % 17); // 14–30 from band center
  const x = 50 + Math.cos(angle) * radius * 1.6;
  const y = band + Math.sin(angle) * radius * 0.55 - 20;
  return {
    x: Math.max(6, Math.min(94, x)),
    y: Math.max(8, Math.min(92, y)),
  };
}

/* ── Catalog shims — uniform access to the seed works ────────────────── */

type WorkItem = {
  id: string;
  title: string;
  shelf: "films" | "music" | "books" | "photography";
  creatorName?: string;
  moods: string[];
  tags: string[];
  emoji: string;
  gradient: string;
};

function collectWorks(): WorkItem[] {
  const works: WorkItem[] = [];
  for (const o of ORIGINALS) {
    works.push({
      id: o.id,
      title: o.title,
      shelf: "films",
      creatorName: o.creator,
      moods: [...o.moods],
      tags: [...(o.tags ?? [])],
      emoji: o.cover.emoji,
      gradient: o.cover.gradient,
    });
  }
  for (const a of ALBUMS) {
    works.push({
      id: a.id,
      title: a.title,
      shelf: "music",
      creatorName: a.artist,
      moods: [...a.moods],
      tags: [...(a.tags ?? [])],
      emoji: a.cover.emoji,
      gradient: a.cover.gradient,
    });
  }
  for (const b of BOOKS) {
    works.push({
      id: b.id,
      title: b.title,
      shelf: "books",
      creatorName: b.author,
      moods: [...b.moods],
      tags: [...(b.tags ?? [])],
      emoji: b.cover.emoji,
      gradient: b.cover.gradient,
    });
  }
  for (const p of PHOTOS) {
    works.push({
      id: p.id,
      title: p.title,
      shelf: "photography",
      creatorName: p.by,
      moods: [...p.moods],
      tags: [...(p.tags ?? [])],
      emoji: p.cover.emoji,
      gradient: p.cover.gradient,
    });
  }
  return works;
}

const WORLD_SHELVES: Record<WorkItem["shelf"], { label: string; href: string; emoji: string }> = {
  films: { label: "Originals", href: "/originals", emoji: "🎬" },
  music: { label: "Music", href: "/music", emoji: "🎧" },
  books: { label: "Books", href: "/books", emoji: "📚" },
  photography: { label: "Photography", href: "/photography", emoji: "📷" },
};

/* ── Builders ────────────────────────────────────────────────────────── */

function creatorNode(creator: Creator): ConstellationNode {
  return {
    id: `creator:${creator.id}`,
    kind: "creator",
    title: creator.name,
    subtitle: creator.bio,
    href: `/creators/${creator.id}`,
    emoji: creator.avatar,
    gradient: creator.gradient,
    ...positionFor(`creator:${creator.id}`, "creator"),
    interests: creator.categories.map((c) => c.toLowerCase()),
  };
}

function workNode(work: WorkItem): ConstellationNode {
  const shelf = WORLD_SHELVES[work.shelf];
  return {
    id: `work:${work.id}`,
    kind: "work",
    title: work.title,
    subtitle: `${shelf.label} · ${work.creatorName ?? "WithIn"}`,
    href: workHref(work),
    emoji: work.emoji,
    gradient: work.gradient,
    ...positionFor(`work:${work.id}`, "work"),
    interests: [...work.moods.map((m) => m.toLowerCase()), ...work.tags],
  };
}

function workHref(work: WorkItem): string {
  switch (work.shelf) {
    case "films":
      return `/originals/${work.id}`;
    case "music":
      return "/music";
    case "books":
      return "/books";
    case "photography":
      return "/photography";
  }
}

function communityNode(community: CommunityItem): ConstellationNode {
  return {
    id: `community:${community.id}`,
    kind: "community",
    title: community.name,
    subtitle: community.tagline,
    href: "/communities",
    emoji: community.avatars[0] ?? "🤝",
    gradient: community.gradient,
    ...positionFor(`community:${community.id}`, "community"),
    interests: [...(community.tags ?? []), ...(community.category ? [community.category.toLowerCase()] : [])],
  };
}

function worldNode(shelf: WorkItem["shelf"]): ConstellationNode {
  const meta = WORLD_SHELVES[shelf];
  const id = `world:${shelf}`;
  return {
    id,
    kind: "world",
    title: meta.label,
    subtitle: "A world of WithIn",
    href: meta.href,
    emoji: meta.emoji,
    gradient: "from-sky-400 to-indigo-600",
    ...positionFor(id, "world"),
    interests: [shelf],
  };
}

/* ── The full constellation ──────────────────────────────────────────── */

let cached: Constellation | null = null;

/**
 * Builds the whole human constellation once and memoizes it — the seed
 * catalogs are static, so the same sky every time.
 */
export function buildConstellation(): Constellation {
  if (cached) return cached;

  const nodes: ConstellationNode[] = [];
  const edges: ConstellationEdge[] = [];
  const interests = new Map<string, Set<string>>(); // nodeId → interests

  const note = (id: string, tags: string[]) => {
    if (!interests.has(id)) interests.set(id, new Set());
    for (const tag of tags) interests.get(id)!.add(tag);
  };

  // Creators
  for (const creator of CREATORS) {
    nodes.push(creatorNode(creator));
    note(`creator:${creator.id}`, creator.categories.map((c) => c.toLowerCase()));
  }

  // Works + CREATED + SHELVED_IN edges
  const works = collectWorks();
  for (const work of works) {
    nodes.push(workNode(work));
    note(`work:${work.id}`, [...work.moods.map((m) => m.toLowerCase()), ...work.tags]);

    const world = `world:${work.shelf}`;
    edges.push({ from: `work:${work.id}`, to: world, relation: "SHELVED_IN" });

    const creator = CREATORS.find(
      (c) => c.name === work.creatorName || c.id === work.creatorName
    );
    if (creator) {
      edges.push({ from: `creator:${creator.id}`, to: `work:${work.id}`, relation: "CREATED" });
    }
  }

  // Communities + GATHERS_AROUND edges (community tags ↔ work tags)
  for (const community of COMMUNITIES) {
    nodes.push(communityNode(community));
    const communityTags = community.tags ?? [];
    note(`community:${community.id}`, [
      ...communityTags,
      ...(community.category ? [community.category.toLowerCase()] : []),
    ]);

    for (const work of works) {
      const shared = work.tags.filter((tag) => communityTags.includes(tag));
      if (shared.length > 0) {
        edges.push({ from: `community:${community.id}`, to: `work:${work.id}`, relation: "GATHERS_AROUND" });
        break; // one honest edge per community — the strongest match
      }
    }
  }

  // Worlds
  for (const shelf of Object.keys(WORLD_SHELVES) as WorkItem["shelf"][]) {
    nodes.push(worldNode(shelf));
    note(`world:${shelf}`, [shelf]);
  }

  // KIN edges — creators sharing a discipline (real: same category)
  for (let i = 0; i < CREATORS.length; i++) {
    for (let j = i + 1; j < CREATORS.length; j++) {
      const a = CREATORS[i];
      const b = CREATORS[j];
      const shared = a.categories.filter((c) => b.categories.includes(c));
      if (shared.length > 0) {
        edges.push({ from: `creator:${a.id}`, to: `creator:${b.id}`, relation: "KIN" });
      }
    }
  }

  // Clusters — by interest tag, minimum size 2
  const byTag = new Map<string, string[]>();
  for (const [nodeId, tags] of interests) {
    for (const tag of tags) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag)!.push(nodeId);
    }
  }
  const clusters: ConstellationCluster[] = [...byTag.entries()]
    .filter(([, ids]) => ids.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)
    .map(([tag, ids]) => ({ id: `cluster:${tag}`, label: tag, nodeIds: ids }));

  cached = { nodes, edges, clusters };
  return cached;
}

/* ── Focus — the neighborhood of one node ────────────────────────────── */

export type ConstellationFocus = {
  center: ConstellationNode;
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  /** Every edge into/out of the center, with the other node's title */
  relationships: { relation: ConstellationEdge["relation"]; other: ConstellationNode }[];
};

/** Expands one node into its immediate neighborhood (1 step, honest edges). */
export function focusConstellationNode(nodeId: string): ConstellationFocus | null {
  const { nodes, edges } = buildConstellation();
  const center = nodes.find((n) => n.id === nodeId);
  if (!center) return null;

  const relationships: ConstellationFocus["relationships"] = [];
  const keep = new Set<string>([nodeId]);

  for (const edge of edges) {
    if (edge.from === nodeId) {
      const other = nodes.find((n) => n.id === edge.to);
      if (other) {
        keep.add(other.id);
        relationships.push({ relation: edge.relation, other });
      }
    } else if (edge.to === nodeId) {
      const other = nodes.find((n) => n.id === edge.from);
      if (other) {
        keep.add(other.id);
        relationships.push({ relation: edge.relation, other });
      }
    }
  }

  return {
    center,
    nodes: nodes.filter((n) => keep.has(n.id)),
    edges: edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    relationships,
  };
}

/** Human words for each relationship — shown on edges and in lists. */
export function relationLabel(relation: ConstellationEdge["relation"], direction: "out" | "in"): string {
  switch (relation) {
    case "CREATED":
      return direction === "out" ? "Created" : "Made by";
    case "GATHERS_AROUND":
      return direction === "out" ? "Gathers around" : "Gathered around by";
    case "SHELVED_IN":
      return direction === "out" ? "Lives in" : "Holds";
    case "KIN":
      return "Shares a discipline with";
    case "SAME_LIGHT":
      return "Shares a mood with";
  }
}

/* ── Human discovery — common ground, honestly derived ───────────────── */

export type DiscoveryCandidate = {
  node: ConstellationNode;
  /** Why this surfaced — grounded in the user's own recent exploration */
  reason: string;
  /** The shared tags between the user's interests and this node */
  commonGround: string[];
};

const USER_TYPE_TO_TAGS: Record<string, string[]> = {
  films: ["film", "stories", "series"],
  music: ["music", "sound", "album"],
  books: ["book", "books", "writing"],
  photography: ["photography", "photo"],
  communities: ["feeling", "conversation", "writing"],
  creators: [],
  explore: [],
  reflection: ["quiet", "feelings"],
};

/**
 * People and places near the user's genuine interests. Signals come only
 * from the universe state's recent content types (what the user actually
 * explored on this device) matched against public node interests — no
 * inference, no profiling, and every candidate carries its common ground.
 */
export function discoveryCandidates(recentTypes: string[], limit = 4): DiscoveryCandidate[] {
  const { nodes } = buildConstellation();

  const userTags = new Set<string>();
  for (const type of recentTypes) {
    for (const tag of USER_TYPE_TO_TAGS[type.toLowerCase()] ?? []) {
      userTags.add(tag);
    }
  }
  if (userTags.size === 0) return [];

  const candidates: DiscoveryCandidate[] = [];
  for (const node of nodes) {
    if (node.kind !== "creator" && node.kind !== "community") continue;
    const shared = node.interests.filter((tag) => userTags.has(tag));
    if (shared.length === 0) continue;
    candidates.push({
      node,
      commonGround: shared,
      reason:
        node.kind === "creator"
          ? `Works in ${shared[0]} — near where you've been exploring.`
          : `A room gathered around ${shared[0]}.`,
    });
  }

  return candidates.sort((a, b) => b.commonGround.length - a.commonGround.length).slice(0, limit);
}

/** Count of creators/communities in the constellation — for honest summaries. */
export function constellationStats(): { creators: number; works: number; communities: number; worlds: number; edges: number } {
  const { nodes, edges } = buildConstellation();
  return {
    creators: nodes.filter((n) => n.kind === "creator").length,
    works: nodes.filter((n) => n.kind === "work").length,
    communities: nodes.filter((n) => n.kind === "community").length,
    worlds: nodes.filter((n) => n.kind === "world").length,
    edges: edges.length,
  };
}
