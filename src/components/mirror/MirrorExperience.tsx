"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useToast } from "@/components/ui/Toast";

type MirrorEntry = {
  id: string;
  body: string;
  prompt: string | null;
  moodId: string | null;
  createdAt: string;
};

type State = "loading" | "ready" | "error";

/** Reflection prompts — gentle openings, never diagnoses. */
const PROMPTS = [
  "What stayed with you today?",
  "What are you carrying right now?",
  "What would you like to remember from this week?",
  "What felt lighter than yesterday?",
  "What are you curious about lately?",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Mirror — a quiet room for the user's own reflections.
 *
 * Everything here is private by default and stays private: entries live only
 * on the owner's account, fetched from an owner-scoped API. Auri does not
 * interpret these entries; the user remains the interpreter. There is no
 * sharing path in this version — deferral made explicit rather than fake.
 */
export default function MirrorExperience() {
  const { status, user } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const { toast } = useToast();

  const [state, setState] = useState<State>("loading");
  const [entries, setEntries] = useState<MirrorEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const authenticated = status === "authenticated";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/mirror");
      const data = (await res.json()) as { ok: boolean; entries?: MirrorEntry[] };
      if (data.ok) {
        setEntries(data.entries ?? []);
        setState("ready");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      // Async fetch — the state changes resolve after the await, not
      // synchronously in the effect body.
      const timer = setTimeout(() => void load(), 0);
      return () => clearTimeout(timer);
    } else {
      // Deferred per the set-state-in-effect rule; outcome is identical.
      const frame = requestAnimationFrame(() => setState("ready"));
      return () => cancelAnimationFrame(frame);
    }
  }, [authenticated, load]);

  // One prompt per visit — quiet, not a slot machine.
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  const save = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft, prompt: prompt ?? undefined }),
      });
      const data = (await res.json()) as { ok: boolean; entry?: MirrorEntry; error?: string };
      if (data.ok && data.entry) {
        setEntries((prev) => [data.entry as MirrorEntry, ...prev]);
        setDraft("");
        toast("Kept in your Mirror.", "success");
      } else {
        toast(data.error ?? "Couldn't save your reflection.", "error");
      }
    } catch {
      toast("Couldn't reach Mirror. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    const previous = entries;
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    try {
      const res = await fetch(`/api/mirror/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setEntries(previous);
        toast(data.error ?? "Couldn't delete that.", "error");
      }
    } catch {
      setEntries(previous);
      toast("Couldn't reach Mirror.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!authenticated) {
    return (
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
        <GlassCard tone="soft" className="p-10 text-center">
          <Icon name="eye" size={28} className="mx-auto text-emerald-300/70" />
          <Text as="h1" variant="sectionTitle" className="mt-4">
            The Mirror
          </Text>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
            A quiet room for your own reflections — thoughts, patterns, small
            observations. Everything you write here is private to your account.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Icon name="lock" size={14} />
            Sign in to reflect
          </a>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
      {/* ── Header ── */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/70">
          Mirror
        </p>
        <Text as="h1" variant="sectionTitle" className="mt-2">
          A room that only you can enter
        </Text>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
          Write what&apos;s on your mind. Entries stay on your account — they
          never appear in Discover, on profiles, or anywhere else. Auri doesn&apos;t
          read them; these are yours to interpret.
        </p>
      </header>

      {/* ── Composer — a reflective crystal page you write on ── */}
      <GlassCard tone="paper" className="crystal-elevated crystal-edge crystal-sheen depth-medium hairline mt-8 p-6 sm:p-8">
        {prompt && (
          <button
            type="button"
            onClick={() => setDraft((current) => current || "")}
            className="text-left text-xs italic text-gray-500 transition hover:text-gray-300"
            title="A gentle opening — write against it, or ignore it"
          >
            {prompt}
          </button>
        )}
        <label htmlFor="mirror-draft" className="sr-only">
          Your reflection
        </label>
        <textarea
          id="mirror-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What stayed with you?"
          rows={4}
          maxLength={5000}
          className="mt-3 w-full resize-none rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm leading-relaxed text-gray-200 placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-gray-600">
            {draft.length > 0 && `${draft.length}/5000`}
          </span>
          <Button onClick={() => void save()} disabled={!draft.trim() || saving} size="sm">
            {saving ? "Keeping…" : "Keep this"}
          </Button>
        </div>
      </GlassCard>

      {/* ── Entries ── */}
      <div className="mt-10 space-y-4">
        {state === "loading" && (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="liquid-shimmer h-24 rounded-3xl bg-white/50" />
            ))}
          </div>
        )}

        {state === "error" && (
          <GlassCard tone="soft" className="p-8 text-center">
            <p className="text-sm text-gray-300">Couldn&apos;t reach your reflections.</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 text-xs text-emerald-400 transition hover:text-emerald-300"
            >
              Try again
            </button>
          </GlassCard>
        )}

        {state === "ready" && entries.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-display text-xl font-medium text-gray-300">
              Your Mirror is empty.
            </p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-gray-500">
              The first reflection is often the smallest one. Write the first
              page above and it will rest here.
            </p>
          </div>
        )}        {state === "ready" &&
          entries.map((entry) => (
            <AnimatePresence key={entry.id} initial={false}>
              <motion.article
                layout={prefersReducedMotion ? false : true}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Each entry is a page of the journal — quiet paper, hairline
                    opening, no card chrome. Reflections are not widgets. */}
                <article className="hairline relative py-6">
                  {entry.prompt && (
                    <p className="text-[11px] italic text-gray-600">— {entry.prompt}</p>
                  )}
                  <p className="mt-2 whitespace-pre-wrap font-display text-[15px] leading-relaxed text-gray-200">
                    {entry.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <time dateTime={entry.createdAt} className="text-[11px] text-gray-600">
                      {formatDate(entry.createdAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => void remove(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label="Delete this reflection"
                      className="text-[11px] text-gray-600 transition hover:text-rose-300 disabled:opacity-50"
                    >
                      {deletingId === entry.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </article>
              </motion.article>
            </AnimatePresence>
          ))}
      </div>

      {/* ── Privacy note ── */}
      <p className="mt-10 text-center text-[11px] leading-relaxed text-gray-700">
        {user?.name ? `${user.name}, ` : ""}only you can read what&apos;s here.
        Mirror doesn&apos;t diagnose, judge, or replace talking to people you trust.
      </p>
    </section>
  );
}
