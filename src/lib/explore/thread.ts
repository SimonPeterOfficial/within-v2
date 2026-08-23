/**
 * Thread — the connective tissue of WithIn's unending universe.
 *
 * Every piece of content can lead somewhere else. The thread system
 * creates meaningful next-door connections between:
 *   - content → creator → story → music → photo → community
 *   - mood → content → reflection → discovery
 *   - creator → work → related creator → community
 *
 * Architecture:
 *   getThread(item) → ThreadConnection[]
 *   Each connection has: label, destination, reason, type
 *
 * When a real CMS exists, this becomes a graph query.
 * For now, deterministic relationships from the seed data.
 */

import type { DiscoveryType } from "./types";
import { ORIGINALS, STORIES, ALBUMS, BOOKS, PHOTOS, COMMUNITIES } from "@/lib/content";
import { CREATORS } from "@/lib/creators";

/* ── Thread connection ───────────────────────────────────────────────── */

export type ThreadConnection = {
  id: string;
  label: string;
  destination: string;
  reason: string;
  type: DiscoveryType;
  cover?: { gradient: string; emoji: string };
};

/* ── Thread labels (varied, never repetitive) ────────────────────────── */

const THREAD_LABELS: Record<string, string[]> = {
  original: ["Continue this feeling", "Another door", "There's more here", "Follow the thread"],
  music: ["For the same mood", "The sound continues", "Something nearby", "Listen to this"],
  creator: ["From this creator", "Meet the artist", "Their other work", "Connected world"],
  book: ["A quiet page", "Something to sit with", "Open this", "Read this next"],
  photo: ["Another frame", "The same light", "Somewhere similar", "Look here"],
  community: ["A room nearby", "People who feel this", "Join them", "Same frequency"],
  reflection: ["A thought", "Pause here", "Consider this", "A question"],
  "auri-moment": ["Auri suggests", "From the guardian", "She noticed this", "A quiet path"],
};

function pickLabel(type: DiscoveryType, index: number): string {
  const labels = THREAD_LABELS[type] ?? THREAD_LABELS.original;
  return labels[index % labels.length];
}

/* ── Content relationships (deterministic from seed data) ─────────────── */

/**
 * Given an item type and id, return related content as ThreadConnections.
 * In a real implementation, this is a graph traversal query.
 */
export function getThread(
  itemType: DiscoveryType,
  itemId: string
): ThreadConnection[] {
  const connections: ThreadConnection[] = [];
  const seen = new Set<string>();

  // Find the source item across all catalogs
  const source = findSourceItem(itemType, itemId);
  if (!source) return generateGenericThread(connections, seen);

  // 1. Creator connection — if the item has a creator
  if (source.creator) {
    const creator = CREATORS.find(
      (c) => c.name === source.creator || c.id === source.creator
    );
    if (creator && !seen.has(creator.id)) {
      seen.add(creator.id);
      connections.push({
        id: `thread-creator-${creator.id}`,
        label: pickLabel("creator", connections.length),
        destination: `/creators/${creator.id}`,
        reason: `From ${creator.name}`,
        type: "creator",
        cover: { gradient: creator.gradient, emoji: creator.avatar },
      });
    }
  }

  // 2. Same-mood content — other pieces sharing the same mood
  if (source.mood) {
    const sameMood = findRelatedByMood(source.mood, source.id);
    for (const item of sameMood.slice(0, 2)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        connections.push({
          id: `thread-mood-${item.id}`,
          label: pickLabel(item.type, connections.length),
          destination: item.destination,
          reason: "Same feeling",
          type: item.type,
          cover: item.cover,
        });
      }
    }
  }

  // 3. Tag-based connections — shared tags
  if (source.tags && source.tags.length > 0) {
    const tagged = findRelatedByTags(source.tags, source.id);
    for (const item of tagged.slice(0, 1)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        connections.push({
          id: `thread-tag-${item.id}`,
          label: pickLabel(item.type, connections.length),
          destination: item.destination,
          reason: "Something similar",
          type: item.type,
          cover: item.cover,
        });
      }
    }
  }

  // 4. Community connection — if a related community exists
  const community = findRelatedCommunity(source);
  if (community && !seen.has(community.id)) {
    seen.add(community.id);
    connections.push({
      id: `thread-community-${community.id}`,
      label: pickLabel("community", connections.length),
      destination: "/communities",
      reason: "A room where this lives",
      type: "community",
      cover: { gradient: community.gradient, emoji: community.avatars[0] ?? "🤝" },
    });
  }

  // 5. Reflection — always add a contemplative thread
  if (connections.length < 3) {
    connections.push({
      id: `thread-reflect-${itemId}`,
      label: pickLabel("reflection", connections.length),
      destination: "/within",
      reason: "A thought to sit with",
      type: "reflection",
      cover: { gradient: "from-indigo-600 to-purple-800", emoji: "🪞" },
    });
  }

  return connections;
}

/* ── Helper: find source item across all catalogs ─────────────────────── */

interface SourceItem {
  id: string;
  type: DiscoveryType;
  creator?: string;
  mood?: string;
  tags?: string[];
  cover?: { gradient: string; emoji: string };
}

function findSourceItem(type: DiscoveryType, id: string): SourceItem | null {
  // Try Originals
  const original = ORIGINALS.find((o) => o.id === id);
  if (original) {
    return {
      id: original.id,
      type: "original",
      creator: original.creator,
      mood: original.moods[0],
      tags: original.tags,
      cover: original.cover,
    };
  }

  // Try Stories
  const story = STORIES.find((s) => s.id === id);
  if (story) {
    return {
      id: story.id,
      type: "original",
      creator: story.by,
      mood: story.moods[0],
      tags: story.tags,
      cover: story.cover,
    };
  }

  // Try Albums
  const album = ALBUMS.find((a) => a.id === id);
  if (album) {
    return {
      id: album.id,
      type: "music",
      creator: album.artist,
      mood: album.moods[0],
      tags: album.tags,
      cover: album.cover,
    };
  }

  // Try Books
  const book = BOOKS.find((b) => b.id === id);
  if (book) {
    return {
      id: book.id,
      type: "book",
      creator: book.author,
      mood: book.moods[0],
      tags: book.tags,
      cover: book.cover,
    };
  }

  // Try Photos
  const photo = PHOTOS.find((p) => p.id === id);
  if (photo) {
    return {
      id: photo.id,
      type: "photo",
      creator: photo.by,
      mood: photo.moods[0],
      tags: photo.tags,
      cover: photo.cover,
    };
  }

  return null;
}

/* ── Helper: find related by mood ─────────────────────────────────────── */

interface RelatedItem {
  id: string;
  type: DiscoveryType;
  destination: string;
  cover?: { gradient: string; emoji: string };
}

function findRelatedByMood(mood: string, excludeId: string): RelatedItem[] {
  const items: RelatedItem[] = [];

  for (const o of ORIGINALS) {
    if (o.id !== excludeId && o.moods.includes(mood as never)) {
      items.push({ id: o.id, type: "original", destination: `/originals/${o.id}`, cover: o.cover });
    }
  }
  for (const s of STORIES) {
    if (s.id !== excludeId && s.moods.includes(mood as never)) {
      items.push({ id: s.id, type: "original", destination: `/originals/${s.id}`, cover: s.cover });
    }
  }
  for (const a of ALBUMS) {
    if (a.id !== excludeId && a.moods.includes(mood as never)) {
      items.push({ id: a.id, type: "music", destination: "/music", cover: a.cover });
    }
  }
  for (const b of BOOKS) {
    if (b.id !== excludeId && b.moods.includes(mood as never)) {
      items.push({ id: b.id, type: "book", destination: "/books", cover: b.cover });
    }
  }
  for (const p of PHOTOS) {
    if (p.id !== excludeId && p.moods.includes(mood as never)) {
      items.push({ id: p.id, type: "photo", destination: "/photography", cover: p.cover });
    }
  }

  return items;
}

/* ── Helper: find related by tags ─────────────────────────────────────── */

function findRelatedByTags(tags: string[], excludeId: string): RelatedItem[] {
  const items: RelatedItem[] = [];

  for (const o of ORIGINALS) {
    if (o.id !== excludeId && o.tags?.some((t) => tags.includes(t))) {
      items.push({ id: o.id, type: "original", destination: `/originals/${o.id}`, cover: o.cover });
    }
  }
  for (const s of STORIES) {
    if (s.id !== excludeId && s.tags?.some((t) => tags.includes(t))) {
      items.push({ id: s.id, type: "original", destination: `/originals/${s.id}`, cover: s.cover });
    }
  }
  for (const a of ALBUMS) {
    if (a.id !== excludeId && a.tags?.some((t) => tags.includes(t))) {
      items.push({ id: a.id, type: "music", destination: "/music", cover: a.cover });
    }
  }

  return items;
}

/* ── Helper: find related community ───────────────────────────────────── */

function findRelatedCommunity(source: SourceItem): (typeof COMMUNITIES)[number] | null {
  if (!source.tags) return null;

  for (const community of COMMUNITIES) {
    if (community.tags?.some((t) => source.tags!.includes(t))) {
      return community;
    }
  }
  return null;
}

/* ── Generic thread (when source item not found) ──────────────────────── */

function generateGenericThread(
  connections: ThreadConnection[],
  seen: Set<string>
): ThreadConnection[] {
  // Add a few random connections from each catalog
  const pools = [
    ...ORIGINALS.slice(0, 2).map((o) => ({
      id: o.id, type: "original" as DiscoveryType, destination: `/originals/${o.id}`, cover: o.cover,
    })),
    ...ALBUMS.slice(0, 1).map((a) => ({
      id: a.id, type: "music" as DiscoveryType, destination: "/music", cover: a.cover,
    })),
    ...BOOKS.slice(0, 1).map((b) => ({
      id: b.id, type: "book" as DiscoveryType, destination: "/books", cover: b.cover,
    })),
  ];

  for (const item of pools) {
    if (!seen.has(item.id) && connections.length < 3) {
      seen.add(item.id);
      connections.push({
        id: `thread-generic-${item.id}`,
        label: pickLabel(item.type, connections.length),
        destination: item.destination,
        reason: "Something you might enjoy",
        type: item.type,
        cover: item.cover,
      });
    }
  }

  return connections;
}

/* ── "Another Door" — the signature WithIn interaction ────────────────── */

/**
 * Returns a random discovery for the "Another Door" interaction.
 * The discovery should feel unexpected but meaningful.
 */
export function getAnotherDoor(): ThreadConnection {
  const pools = [
    { type: "original" as DiscoveryType, items: ORIGINALS.map((o) => ({
      id: o.id, destination: `/originals/${o.id}`, cover: o.cover, label: o.title,
    }))},
    { type: "music" as DiscoveryType, items: ALBUMS.map((a) => ({
      id: a.id, destination: "/music", cover: a.cover, label: a.title,
    }))},
    { type: "book" as DiscoveryType, items: BOOKS.map((b) => ({
      id: b.id, destination: "/books", cover: b.cover, label: b.title,
    }))},
    { type: "photo" as DiscoveryType, items: PHOTOS.map((p) => ({
      id: p.id, destination: "/photography", cover: p.cover, label: p.title,
    }))},
    { type: "creator" as DiscoveryType, items: CREATORS.map((c) => ({
      id: c.id, destination: `/creators/${c.id}`, cover: { gradient: c.gradient, emoji: c.avatar }, label: c.name,
    }))},
  ];

  // Pick a random pool, then a random item
  const pool = pools[Math.floor(Math.random() * pools.length)];
  const item = pool.items[Math.floor(Math.random() * pool.items.length)];

  return {
    id: `door-${item.id}-${Date.now()}`,
    label: "Another door",
    destination: item.destination,
    reason: "Something unexpected",
    type: pool.type,
    cover: item.cover,
  };
}
