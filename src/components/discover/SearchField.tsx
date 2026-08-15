"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { memory } from "@/lib/memory";

const RECENT_KEY = "recent-searches";
const MAX_RECENT = 6;

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Where the field should receive focus on mount (hero search) */
  autoFocus?: boolean;
  placeholder?: string;
};

/** Recent searches — remembered locally, cleared by the user, nothing leaves. */
function readRecent(): string[] {
  const raw = memory.get<string[]>("preferences", RECENT_KEY);
  return Array.isArray(raw) ? raw : [];
}

function rememberRecent(query: string) {
  const recent = readRecent().filter((item) => item.toLowerCase() !== query.toLowerCase());
  memory.set("preferences", RECENT_KEY, [query, ...recent].slice(0, MAX_RECENT));
}

function clearRecent() {
  memory.remove("preferences", RECENT_KEY);
}

/**
 * The search field — a rounded glass well with a soft mood glow on focus.
 * Recent searches appear as chips below (tappable), each one remembered
 * locally and clearable. Submission records the query so the next visit
 * greets you with your own history.
 */
export default function SearchField({
  value,
  onChange,
  autoFocus = false,
  placeholder = "Search films, stories, music, people…"
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  // Hydration-safe: recent searches resolve after mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecent(readRecent());
      if (autoFocus) inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    rememberRecent(value.trim());
    setRecent(readRecent());
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} role="search" aria-label="Search WithIn">
        <div
          className={`flex items-center gap-3 rounded-full border bg-white/5 px-5 py-3.5 backdrop-blur transition duration-300 ${
            focused
              ? "border-[rgba(var(--mood-rgb),0.55)] bg-white/[0.08] shadow-[0_0_30px_rgba(var(--mood-rgb),0.15)]"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <Icon name="search" size={18} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Recent searches — the memory of what you came looking for */}
      <AnimatePresence>
        {focused && recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-20 mt-2 rounded-card border border-white/10 bg-black/80 p-3 shadow-soft backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                Recent
              </p>
              <button
                type="button"
                onClick={() => {
                  clearRecent();
                  setRecent([]);
                }}
                className="text-[10px] font-medium text-gray-500 transition hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onChange(term)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:border-[rgba(var(--mood-rgb),0.4)] hover:text-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
