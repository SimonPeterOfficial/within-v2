"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { UNIVERSE } from "@/lib/search";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Fired by the sidebar to open the palette from anywhere. */
export const COMMAND_PALETTE_EVENT = "within:command-palette:open";

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  href: string;
  group: "Places" | "Shelves" | "Search";
};

const PLACES: Command[] = [
  { id: "nav-home", label: "Home", hint: "Your sanctuary", icon: "home", href: "/home", group: "Places" },
  { id: "nav-studio", label: "Studio", hint: "Create, draft, publish", icon: "dashboard", href: "/studio", group: "Places" },
  { id: "nav-discover", label: "Discover", hint: "Search the universe", icon: "discover", href: "/discover", group: "Places" },
  { id: "nav-journey", label: "Journey", hint: "Your constellation", icon: "heart", href: "/journey", group: "Places" },
  { id: "nav-within", label: "Within", hint: "Talk to Auri", icon: "sparkles", href: "/within", group: "Places" },
  { id: "nav-profile", label: "Profile", hint: "Your corner", icon: "profile", href: "/profile", group: "Places" },
  { id: "nav-mirror", label: "Mirror", hint: "Your reflections, private by default", icon: "eye", href: "/mirror", group: "Places" },
  { id: "nav-connections", label: "Connections", hint: "Your people", icon: "users", href: "/connections", group: "Places" },
  { id: "nav-conversations", label: "Conversations", hint: "Quiet, direct messages", icon: "send", href: "/conversations", group: "Places" },
  { id: "nav-settings", label: "Settings", hint: "Tune the world", icon: "settings", href: "/settings", group: "Places" },
];

const SHELVES: Command[] = [
  { id: "nav-originals", label: "Originals", hint: "Films & series", icon: "originals", href: "/originals", group: "Shelves" },
  { id: "nav-music", label: "Music", hint: "Soundscapes", icon: "music", href: "/music", group: "Shelves" },
  { id: "nav-books", label: "Books", hint: "The library", icon: "book", href: "/books", group: "Shelves" },
  { id: "nav-photography", label: "Photography", hint: "Stillness, captured", icon: "camera", href: "/photography", group: "Shelves" },
  { id: "nav-communities", label: "Communities", hint: "Quiet rooms", icon: "users", href: "/communities", group: "Shelves" },
  { id: "nav-creators", label: "Creators", hint: "The people who make it", icon: "star", href: "/creators", group: "Shelves" },
];

/** Universe entries become searchable commands — one index, no duplication. */
function searchCommands(query: string): Command[] {
  const needle = query.toLowerCase().trim();
  if (!needle) return [];
  return UNIVERSE.filter((entry) =>
    `${entry.title} ${entry.by} ${entry.category}`.toLowerCase().includes(needle)
  )
    .slice(0, 6)
    .map((entry) => ({
      id: `search-${entry.id}`,
      label: entry.title,
      hint: `${entry.category} · ${entry.by}`,
      icon: "search" as IconName,
      href: entry.href,
      group: "Search" as const,
    }));
}

/** Lightweight subsequence match — "hs" matches "Home / sanctuary". */
function matches(label: string, query: string): boolean {
  const lower = label.toLowerCase();
  let index = 0;
  for (const char of query.toLowerCase()) {
    index = lower.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}

/**
 * The command palette — fast navigation for people who know where they're
 * going. ⌘K / Ctrl+K opens it from anywhere; type to filter places, shelves,
 * and the whole universe index; arrow keys move, Enter goes. Escape closes.
 * Reduced motion swaps slides for instant fades.
 */
export default function CommandPalette() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Command[]>(() => {
    const needle = query.trim();
    if (!needle) return [...PLACES, ...SHELVES];
    const search = searchCommands(needle);
    const places = [...PLACES, ...SHELVES].filter((command) =>
      matches(command.label, needle)
    );
    return [...places, ...search];
  }, [query]);

  // Flatten groups for keyboard indexing.
  const flat = useMemo(() => results, [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const go = useCallback(
    (command: Command) => {
      close();
      router.push(command.href);
    },
    [close, router]
  );

  // Global shortcut + open event from the sidebar trigger.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen);
    };
  }, []);

  // Focus the input on open; trap Tab; Escape closes; body scroll locks.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  // Keep the active row in view while arrowing.
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDownList = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = flat[activeIndex];
      if (command) go(command);
    }
  };

  // Group headers in render order.
  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="command-palette"
          className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-modal border border-white/10 bg-[#0b0912]/95 shadow-soft backdrop-blur-2xl"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <Icon name="search" size={16} className="shrink-0 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDownList}
                placeholder="Where to? Try “music”, “auri”, a title…"
                aria-label="Search commands and the universe"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />
              <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:block">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} role="listbox" aria-label="Results" className="max-h-[46vh] overflow-y-auto p-2">
              {flat.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-400">Nothing answers to that.</p>
                  <p className="mt-1.5 text-xs text-gray-600">
                    Try a mood, a place, or a fragment of a title.
                  </p>
                </div>
              ) : (
                flat.map((command, index) => {
                  const showGroup = command.group !== lastGroup;
                  lastGroup = command.group;
                  const isActive = index === activeIndex;
                  return (
                    <div key={command.id}>
                      {showGroup && (
                        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
                          {command.group}
                        </p>
                      )}
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-index={index}
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => go(command)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive ? "bg-white/[0.07] text-white" : "text-gray-300"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isActive
                              ? "border-[rgba(var(--mood-rgb),0.4)] bg-[rgba(var(--mood-rgb),0.12)]"
                              : "border-white/[0.08] bg-white/[0.04]"
                          }`}
                        >
                          <Icon name={command.icon} size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{command.label}</span>
                          <span className="block truncate text-[11px] text-gray-500">{command.hint}</span>
                        </span>
                        {isActive && <Icon name="forward" size={12} className="shrink-0 text-gray-500" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 border-t border-white/[0.06] px-5 py-2.5 text-[10px] text-gray-600">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">↵</kbd>
                open
              </span>
              <span className="ml-auto hidden sm:block">WithIn, one keystroke away</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
