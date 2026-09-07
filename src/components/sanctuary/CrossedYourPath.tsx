"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { getAuriPreferences } from "@/lib/auri";

type SerendipityItem = {
  id: string;
  title: string;
  creatorName: string | null;
  username: string;
  category: string | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  whyThis: string;
};

type Payload = { ok: boolean; items?: SerendipityItem[] };

/**
 * CrossedYourPath — "You found something."
 *
 * At most two genuinely relevant discoveries, each with a plain-language
 * reason ("Because you saved stories like this"), served from REAL saved
 * categories and REAL recent publications. Fully dismissible, honest when
 * empty (renders nothing), and controlled by the user's Auri "suggestions"
 * preference — turn suggestions off and these moments stop.
 *
 * This is a moment, not a feed: it never replaces navigation, never
 * autoplays, never pressures.
 */
export default function CrossedYourPath() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [items, setItems] = useState<SerendipityItem[] | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // The user controls optional experiences — respect the preference.
    if (!getAuriPreferences().suggestions) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      void fetch("/api/serendipity", { cache: "no-store" })
        .then((res) => res.json() as Promise<Payload>)
        .then((data) => {
          if (!cancelled && data.ok && data.items) setItems(data.items);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!items) return null;
  const visible = items.filter((item) => !dismissed.includes(item.id));
  if (visible.length === 0) return null;

  return (
    <section aria-label="A small discovery" className="relative z-10 mx-auto max-w-3xl px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
          This crossed your path
        </p>
        {visible.length > 0 && dismissed.length === 0 && (
          <button
            type="button"
            onClick={() => setDismissed(items.map((i) => i.id))}
            className="text-xs text-gray-500 transition hover:text-white"
          >
            Not now
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {visible.map((item) => (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
            >
              <a
                href={`/content/${item.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-white/[0.04]"
              >
                <span
                  aria-hidden
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${
                    item.coverGradient ?? "from-purple-600 via-indigo-600 to-blue-600"
                  } text-2xl`}
                >
                  {item.coverEmoji ?? "✦"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className="block truncate text-xs text-gray-400">
                    {item.creatorName ?? "A WithIn creator"}
                  </span>
                  <span className="mt-1 block text-[11px] italic text-gray-500">{item.whyThis}</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => setDismissed((d) => [...d, item.id])}
                aria-label={`Dismiss ${item.title}`}
                className="absolute right-2 top-2 rounded-full p-1 text-gray-600 opacity-0 transition hover:bg-white/10 hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Icon name="close" size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
