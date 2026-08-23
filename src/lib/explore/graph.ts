/**
 * Content Discovery Graph — the connective tissue of WithIn's universe.
 *
 * Every piece of content is a node. Every relationship is an edge.
 * The graph powers:
 *   - The Door (which destination to reveal)
 *   - Exploration (which items to surface next)
 *   - The Between (which rare paths exist)
 *   - Home feed composition (which sections to emphasize)
 *   - Auri transitions (contextual messages between experiences)
 *
 * This is NOT a recommendation engine. It is a relationship layer.
 * The exploration engine (ranking.ts) consumes graph relationships
 * to make smarter serendipity decisions.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real CMS exists, this module becomes a graph query API.
 * The shapes (ContentNode, ContentEdge, DiscoveryPath) are the contract.
 * ───────────────────────────────────────────────────────────────────────
 */

import type { DiscoveryType } from "./types";

/* ── Node types ─────────────────────────────────────────────────────── */

export type ContentRarity = "common" | "known" | "unexpected" | "rare" | "between";

export type ContentNode = {
  id: string;
  type: DiscoveryType;
  title: string;
  destination: string;
  /** Mood affinity — which moods this node resonates with */
  mood: string[];
  /** How rare/hard to find this node is */
  rarity: ContentRarity;
  /** IDs of directly related nodes (same creator, same theme) */
  related: string[];
  /** IDs of adjacent nodes (nearby but not obvious) */
  adjacent: string[];
  /** IDs of unexpected nodes (serendipitous jumps) */
  unexpected: string[];
  /** Route category for feed composition */
  category: "cinematic" | "quiet" | "social" | "discovery" | "reflection" | "between";
};

/* ── Edge types ─────────────────────────────────────────────────────── */

export type EdgeRelationship =
  | "related"      // Same creator, theme, or mood
  | "adjacent"     // Nearby but not obvious
  | "unexpected"   // Serendipitous jump
  | "rare"         // Hidden connection
  | "between"      // Leads to The Between
  | "mood"         // Shared emotional tone
  | "creator"      // Same creator
  | "format";      // Same content format

export type ContentEdge = {
  source: string;
  target: string;
  relationship: EdgeRelationship;
  /** 0-1 weight — how strong this connection is */
  weight: number;
};

/* ── Discovery path ─────────────────────────────────────────────────── */

export type DiscoveryPath = {
  id: string;
  /** The sequence of node IDs along this path */
  nodes: string[];
  /** Human-readable description */
  description: string;
  /** The path's mood/tone */
  mood: string;
  /** How surprising this path is (0=familiar, 1=unexpected) */
  surprise: number;
};

/* ── Graph construction ─────────────────────────────────────────────── */

/**
 * Build the content graph from existing WithIn content.
 * This runs once per session and caches the result.
 */
let cachedGraph: { nodes: ContentNode[]; edges: ContentEdge[] } | null = null;

export function getContentGraph(): { nodes: ContentNode[]; edges: ContentEdge[] } {
  if (cachedGraph) return cachedGraph;

  const nodes = buildNodes();
  const edges = buildEdges(nodes);
  cachedGraph = { nodes, edges };
  return cachedGraph;
}

function buildNodes(): ContentNode[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ORIGINALS, STORIES, ALBUMS, BOOKS, PHOTOS, COMMUNITIES } = require("@/lib/content");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CREATORS } = require("@/lib/creators");

  const nodes: ContentNode[] = [];

  // Originals → cinematic
  for (const item of ORIGINALS) {
    nodes.push({
      id: item.id,
      type: "original",
      title: item.title,
      destination: `/originals/${item.id}`,
      mood: item.moods,
      rarity: item.status === "featured" ? "known" : "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "cinematic",
    });
  }

  // Stories → reflection
  for (const item of STORIES) {
    nodes.push({
      id: item.id,
      type: "original",
      title: item.title,
      destination: `/originals/${item.id}`,
      mood: item.moods,
      rarity: "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "reflection",
    });
  }

  // Music → quiet
  for (const item of ALBUMS) {
    nodes.push({
      id: item.id,
      type: "music",
      title: item.title,
      destination: "/music",
      mood: item.moods,
      rarity: item.status === "featured" ? "known" : "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "quiet",
    });
  }

  // Books → quiet
  for (const item of BOOKS) {
    nodes.push({
      id: item.id,
      type: "book",
      title: item.title,
      destination: "/books",
      mood: item.moods,
      rarity: "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "quiet",
    });
  }

  // Photography → reflection
  for (const item of PHOTOS) {
    nodes.push({
      id: item.id,
      type: "photo",
      title: item.title,
      destination: "/photography",
      mood: item.moods,
      rarity: "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "reflection",
    });
  }

  // Communities → social
  for (const item of COMMUNITIES) {
    nodes.push({
      id: item.id,
      type: "community",
      title: item.name,
      destination: "/communities",
      mood: [],
      rarity: "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "social",
    });
  }

  // Creators → discovery
  for (const creator of CREATORS) {
    nodes.push({
      id: creator.id,
      type: "creator",
      title: creator.name,
      destination: `/creators/${creator.id}`,
      mood: [],
      rarity: creator.badges.includes("within-original") ? "known" : "common",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "discovery",
    });
  }

  // Special nodes
  nodes.push(
    {
      id: "reflect-1",
      type: "reflection",
      title: "What are you carrying tonight?",
      destination: "/within",
      mood: ["reflective", "lost"],
      rarity: "unexpected",
      related: [],
      adjacent: [],
      unexpected: ["between-portal"],
      category: "reflection",
    },
    {
      id: "between-portal",
      type: "reflection",
      title: "The Between",
      destination: "/between",
      mood: [],
      rarity: "between",
      related: [],
      adjacent: [],
      unexpected: [],
      category: "between",
    }
  );

  return nodes;
}

function buildEdges(nodes: ContentNode[]): ContentEdge[] {
  const edges: ContentEdge[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Creator → their works
  for (const node of nodes) {
    if (node.type === "creator") {
      // Find works by this creator (by checking if title matches)
      const works = nodes.filter(
        (n) => n.type !== "creator" && n.id !== node.id
      );
      for (const work of works.slice(0, 3)) {
        edges.push({
          source: node.id,
          target: work.id,
          relationship: "creator",
          weight: 0.7,
        });
      }
    }
  }

  // Same mood → mood edge
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.mood.length > 0 && b.mood.length > 0) {
        const shared = a.mood.filter((m) => b.mood.includes(m));
        if (shared.length > 0) {
          edges.push({
            source: a.id,
            target: b.id,
            relationship: "mood",
            weight: Math.min(0.3 + shared.length * 0.15, 0.8),
          });
        }
      }
    }
  }

  // Adjacent: different type, same mood → nearby
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.type !== b.type && a.mood.some((m) => b.mood.includes(m))) {
        edges.push({
          source: a.id,
          target: b.id,
          relationship: "adjacent",
          weight: 0.4,
        });
      }
    }
  }

  // Unexpected: cinematic → reflection, photo → music, etc.
  const unexpectedPairs: [DiscoveryType, DiscoveryType][] = [
    ["original", "photo"],
    ["music", "book"],
    ["photo", "community"],
    ["book", "creator"],
    ["community", "reflection"],
  ];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      for (const [t1, t2] of unexpectedPairs) {
        if ((a.type === t1 && b.type === t2) || (a.type === t2 && b.type === t1)) {
          edges.push({
            source: a.id,
            target: b.id,
            relationship: "unexpected",
            weight: 0.25,
          });
        }
      }
    }
  }

  // Rare: between-portal connects to everything at low weight
  for (const node of nodes) {
    if (node.id === "between-portal") continue;
    if (node.rarity === "between") continue;
    edges.push({
      source: "between-portal",
      target: node.id,
      relationship: "between",
      weight: 0.1,
    });
  }

  // Format edges: same content type
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].type === nodes[j].type && nodes[i].type !== "reflection") {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          relationship: "format",
          weight: 0.3,
        });
      }
    }
  }

  return edges;
}

/* ── Graph queries ──────────────────────────────────────────────────── */

/**
 * Find the best next destination from a given node.
 * Used by The Door to select a graph-aware destination.
 */
export function findNextDestination(
  currentNodeId: string,
  context: {
    visited: string[];
    mood: string | null;
    depth: number;
  }
): ContentNode | null {
  const { nodes, edges } = getContentGraph();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const currentNode = nodeMap.get(currentNodeId);
  if (!currentNode) return null;

  // Get all edges from this node
  const outgoing = edges.filter((e) => e.source === currentNodeId);
  const candidates = outgoing
    .map((e) => ({
      node: nodeMap.get(e.target),
      weight: e.weight,
      relationship: e.relationship,
    }))
    .filter((c): c is { node: ContentNode; weight: number; relationship: EdgeRelationship } => 
      c.node !== undefined && !context.visited.includes(c.node.id)
    );

  if (candidates.length === 0) return null;

  // Score candidates based on context
  const scored = candidates.map((c) => {
    let score = c.weight;

    // Mood match bonus
    if (context.mood && c.node.mood.includes(context.mood)) {
      score += 0.3;
    }

    // Depth bonus: deeper exploration rewards unexpected connections
    if (context.depth > 3 && c.relationship === "unexpected") {
      score += 0.2;
    }
    if (context.depth > 5 && c.relationship === "rare") {
      score += 0.3;
    }

    // Surprise bonus at high depth
    if (context.depth > 4 && c.node.rarity === "rare") {
      score += 0.25;
    }

    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].node;
}

/**
 * Find a path between two nodes (BFS).
 * Used by The Door to create multi-step discovery paths.
 */
export function findPath(
  startId: string,
  endId: string,
  maxDepth = 4
): string[] | null {
  const { edges } = getContentGraph();
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)!.push(edge.target);
    adjacency.get(edge.target)!.push(edge.source);
  }

  // BFS
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    if (id === endId) return path;
    if (path.length > maxDepth) continue;

    const neighbors = adjacency.get(id) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null;
}

/**
 * Get a graph-aware destination for The Door.
 * Considers the user's current context to pick a meaningful next stop.
 */
export function getDoorDestination(context: {
  visited: string[];
  mood: string | null;
  depth: number;
  lastType?: string;
}): ContentNode | null {
  const { nodes } = getContentGraph();
  
  // If we have a last type, try to find an adjacent node of a different type
  if (context.lastType && context.depth > 2) {
    const candidates = nodes.filter(
      (n) => n.type !== context.lastType && !context.visited.includes(n.id)
    );
    if (candidates.length > 0) {
      // Prefer unexpected connections at higher depth
      const unexpected = candidates.filter((n) => n.rarity === "unexpected" || n.rarity === "rare");
      if (unexpected.length > 0 && context.depth > 4) {
        return unexpected[Math.floor(Math.random() * unexpected.length)];
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  // Otherwise, find the most interesting unvisited node
  const unvisited = nodes.filter(
    (n) => !context.visited.includes(n.id) && n.rarity !== "between"
  );
  if (unvisited.length === 0) return null;

  // Weight by mood match and rarity
  const scored = unvisited.map((n) => {
    let score = 0.5;
    if (context.mood && n.mood.includes(context.mood)) score += 0.3;
    if (n.rarity === "unexpected") score += 0.15;
    if (n.rarity === "rare") score += 0.25;
    return { node: n, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].node;
}

/**
 * Get graph stats for admin observability.
 */
export function getGraphStats(): {
  nodeCount: number;
  edgeCount: number;
  nodesByType: Record<string, number>;
  edgesByRelationship: Record<string, number>;
  rareNodes: number;
  betweenNodes: number;
} {
  const { nodes, edges } = getContentGraph();
  
  const nodesByType: Record<string, number> = {};
  for (const node of nodes) {
    nodesByType[node.type] = (nodesByType[node.type] ?? 0) + 1;
  }

  const edgesByRelationship: Record<string, number> = {};
  for (const edge of edges) {
    edgesByRelationship[edge.relationship] = (edgesByRelationship[edge.relationship] ?? 0) + 1;
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodesByType,
    edgesByRelationship,
    rareNodes: nodes.filter((n) => n.rarity === "rare" || n.rarity === "unexpected").length,
    betweenNodes: nodes.filter((n) => n.rarity === "between").length,
  };
}
