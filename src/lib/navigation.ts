import type { SidebarItem } from "@/components/layout/Sidebar";

/**
 * The universe navigation — the single source of truth for every WithIn
 * destination. Every shell (sidebar, bottom nav, command palette) derives
 * from this list so labels, hrefs, icons, and groups can never drift apart.
 *
 * Only routes that actually exist are included. Destinations referenced in
 * the product map but without a route (Library, Worlds, Serendipity, Trace)
 * are intentionally absent — linking to nothing is worse than omitting.
 *
 * Groups:
 *   Core     — arrival and orientation (Home, Sanctuary)
 *   Discover — exploration and media (Discover, Originals, Books, Music, Photography, Explore)
 *   You      — personal identity and reflection (Profile, Mirror, Connections)
 *   Create   — creative spaces (Studio, Journey)
 *   Systems  — account and platform (Messages, Within, Atlas, Constellation, Settings)
 */
export const UNIVERSE_NAV: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true, group: "Core" },
  { label: "Sanctuary", href: "/sanctuary", icon: "heart", route: true, group: "Core" },

  { label: "Discover", href: "/discover", icon: "discover", route: true, group: "Discover" },
  { label: "Originals", href: "/originals", icon: "originals", route: true, group: "Discover" },
  { label: "Books", href: "/books", icon: "book", route: true, group: "Discover" },
  { label: "Music", href: "/music", icon: "music", route: true, group: "Discover" },
  { label: "Photography", href: "/photography", icon: "camera", route: true, group: "Discover" },
  { label: "Explore", href: "/explore", icon: "stories", route: true, group: "Discover" },

  { label: "Profile", href: "/profile", icon: "profile", route: true, group: "You" },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true, group: "You" },
  { label: "Connections", href: "/connections", icon: "users", route: true, group: "You" },

  { label: "Studio", href: "/studio", icon: "dashboard", route: true, group: "Create" },
  { label: "Journey", href: "/journey", icon: "star", route: true, group: "Create" },

  { label: "Messages", href: "/conversations", icon: "message", route: true, group: "Systems" },
  { label: "Within", href: "/within", icon: "sparkles", route: true, group: "Systems" },
  { label: "Atlas", href: "/atlas", icon: "globe", route: true, group: "Systems" },
  { label: "Time", href: "/time", icon: "clock", route: true, group: "Systems" },
  { label: "Constellation", href: "/constellation", icon: "users", route: true, group: "Systems" },
  { label: "Settings", href: "/settings", icon: "settings", route: true, group: "Systems" },
];

/**
 * User-facing copy, centralized where practical — the first step toward
 * internationalization. New surfaces should read from here instead of
 * hard-coding strings, so a translation layer can replace this module
 * without touching components.
 */
export const copy = {
  nav: {
    sanctuary: "Sanctuary",
    discover: "Discover",
    originals: "Originals",
    books: "Books",
    music: "Music",
    photography: "Photography",
    communities: "Communities",
    mirror: "Mirror",
    creators: "Creators",
    profile: "Profile",
    settings: "Settings"
  },
  discover: {
    eyebrow: "Discover",
    title: "A universe, waiting",
    subtitle:
      "Films, stories, music, books, photography, communities and the people who make them — search the whole world, or wander a shelf."
  },
  originals: {
    eyebrow: "WithIn Originals",
    title: "Made to be felt",
    subtitle:
      "A premium studio catalogue — films, series and books crafted for the way you feel."
  },
  books: {
    eyebrow: "Books",
    title: "The library",
    subtitle:
      "Stories that sit with you for days. Every bookmark is a promise kept."
  },
  music: {
    eyebrow: "Music",
    title: "The music room",
    subtitle:
      "Soundscapes for the way you feel — slow tides, warm embers, night rain."
  },
  photography: {
    eyebrow: "Photography",
    title: "Stillness, captured",
    subtitle:
      "Frames from people who wait for the light to lean a certain way."
  },
  communities: {
    eyebrow: "Communities",
    title: "Quiet rooms, kindred souls",
    subtitle:
      "No feeds, no noise — just people who feel in the same language."
  },
  creators: {
    eyebrow: "Creators",
    title: "The people who make it",
    subtitle:
      "Filmmakers, writers, musicians and photographers building the universe — with room to grow into something more."
  },
  profile: {
    eyebrow: "Your profile",
    title: "My corner of WithIn",
    subtitle: "What you've saved, loved and kept with you."
  },
  settings: {
    eyebrow: "Settings",
    title: "Make it yours",
    subtitle: "The world answers how you feel — tune the details here."
  },
  mirror: {
    eyebrow: "Mirror",
    title: "Quiet reflection",
    subtitle: "A clear, spacious place to see yourself — no noise, no judgment."
  },
  atlas: {
    eyebrow: "Within Time",
    title: "Moments, layered",
    subtitle: "Time made spatial — past, present, and the journey between."
  },
  connections: {
    eyebrow: "Connections",
    title: "Your people",
    subtitle: "The ones who feel in the same language — find them here."
  },
  messages: {
    eyebrow: "Messages",
    title: "Conversations",
    subtitle: "Communication inside the WithIn world — human, warm, alive."
  },
  within: {
    eyebrow: "Within",
    title: "The heart of WithIn",
    subtitle: "Where the world comes alive — Auri, Lyra, and the universe within you."
  }
} as const;
