import type { SidebarItem } from "@/components/layout/Sidebar";

/**
 * The universe navigation — one list of routes shared by every corner of
 * WithIn (sanctuary shell, discover, originals, profile…). Adding a corner
 * here makes it reachable everywhere with a single entry.
 */
export const UNIVERSE_NAV: SidebarItem[] = [
  { label: "Sanctuary", href: "/home", icon: "home", route: true },
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Originals", href: "/originals", icon: "originals", route: true },
  { label: "Books", href: "/books", icon: "book", route: true },
  { label: "Music", href: "/music", icon: "music", route: true },
  { label: "Photography", href: "/photography", icon: "camera", route: true },
  { label: "Communities", href: "/communities", icon: "users", route: true },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true },
  { label: "Creators", href: "/creators", icon: "sparkles", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true }
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
  }
} as const;
