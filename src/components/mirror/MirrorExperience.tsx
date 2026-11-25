"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import EmptyState from "@/components/ui/states/EmptyState";
import ErrorState from "@/components/ui/states/ErrorState";
import LoadingState from "@/components/ui/states/LoadingState";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import Text from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import MirrorComposer from "@/components/mirror/MirrorComposer";
import MirrorEntryCard from "@/components/mirror/MirrorEntryCard";
import { useSession } from "@/lib/auth/session";
import {
  formatEntryDate,
  groupEntriesByMonth,
  sortEntriesNewestFirst,
  type MirrorEntryView,
} from "@/lib/mirror-view";

type State = "loading" | "ready" | "error";

type ListResponse = {
  ok: boolean;
  entries?: MirrorEntryView[];
  error?: string;
};

type WriteResponse = {
  ok: boolean;
  entry?: MirrorEntryView;
  error?: string;
};

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Mirror — a quiet room for the user's own reflections.
 *
 * Entries live only on the owner's account and are fetched from an
 * owner-scoped API. Auri never interprets them; the user remains the
 * interpreter. There is no sharing path in this version — the absence is
 * explicit rather than disguised as a disabled button.
 */
export default function MirrorExperience() {
  const { status, user } = useSession();
  const { toast } = useToast();

  const [state, setState] = useState<State>("loading");
  const [entries, setEntries] = useState<MirrorEntryView[]>([]);
  const [saving, setSaving] = useState(false);

  const authenticated = status === "authenticated";

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/mirror", { cache: "no-store" });
      const data = await readJson<ListResponse>(response);
      if (response.ok && data?.ok && Array.isArray(data.entries)) {
        setEntries(data.entries);
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
      // Deferred so the state update resolves after the effect body.
      const timer = setTimeout(() => void load(), 0);
      return () => clearTimeout(timer);
    }

    if (status === "unauthenticated") {
      // A sign-out (here or in another tab) must not leave private text on screen.
      const frame = requestAnimationFrame(() => {
        setEntries([]);
        setState("ready");
      });
      return () => cancelAnimationFrame(frame);
    }

    return undefined;
  }, [authenticated, status, load]);

  const saveEntry = useCallback(
    async (body: string, prompt: string | null): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await fetch("/api/mirror", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body, prompt }),
        });
        const data = await readJson<WriteResponse>(response);
        if (response.ok && data?.ok && data.entry) {
          setEntries((previous) => [data.entry as MirrorEntryView, ...previous]);
          toast("Kept in your Mirror.", "success");
          return true;
        }
        toast(data?.error ?? "Couldn't save your reflection.", "error");
        return false;
      } catch {
        toast("Couldn't reach Mirror. Try again.", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [toast]
  );

  const updateEntry = useCallback(
    async (id: string, patch: { body: string; prompt: string | null }): Promise<boolean> => {
      try {
        const response = await fetch(`/api/mirror/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = await readJson<WriteResponse>(response);
        if (response.ok && data?.ok && data.entry) {
          setEntries((previous) =>
            previous.map((entry) => (entry.id === id ? (data.entry as MirrorEntryView) : entry))
          );
          toast("Your reflection was updated.", "success");
          return true;
        }
        toast(data?.error ?? "Couldn't update that reflection.", "error");
        return false;
      } catch {
        toast("Couldn't reach Mirror.", "error");
        return false;
      }
    },
    [toast]
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/mirror/${id}`, { method: "DELETE" });
        const data = await readJson<{ ok: boolean; error?: string }>(response);
        if (response.ok && data?.ok) {
          setEntries((previous) => previous.filter((entry) => entry.id !== id));
          toast("Removed from your Mirror.", "success");
          return true;
        }
        toast(data?.error ?? "Couldn't delete that.", "error");
        return false;
      } catch {
        toast("Couldn't reach Mirror.", "error");
        return false;
      }
    },
    [toast]
  );

  // Session resolution is async. Don't flash a sign-in gate at someone who is
  // already signed in — hold the room quiet until their identity is known.
  if (status === "loading" || status === "linking_required") {
    return (
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
        <LoadingState label="Opening your Mirror…" />
      </section>
    );
  }

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

  const orderedEntries = sortEntriesNewestFirst(entries);
  const months = groupEntriesByMonth(orderedEntries);

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

      <MirrorComposer onSave={saveEntry} busy={saving} />

      {/* ── Looking back — the Mirror's quiet juxtaposition ──
          The oldest and newest entries, side by side. No analysis, no
          conclusion — the user is the interpreter. */}
      {state === "ready" && orderedEntries.length >= 2 && (
        <section aria-label="Looking back" className="mt-12 border-t border-white/[0.06] pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/60">
            Looking back
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {[orderedEntries[orderedEntries.length - 1], orderedEntries[0]].map((entry, index) => (
              <figure key={entry.id} className="hairline rounded-2xl bg-white/[0.02] p-5">
                <figcaption className="text-[10px] uppercase tracking-[0.25em] text-gray-600">
                  {index === 0 ? "Your first page" : "Your most recent page"}
                </figcaption>
                <blockquote className="mt-3 font-display text-sm leading-relaxed text-gray-300">
                  {entry.body.length > 140 ? `${entry.body.slice(0, 140)}…` : entry.body}
                </blockquote>
                <time dateTime={entry.createdAt} className="mt-3 block text-[11px] text-gray-600">
                  {formatEntryDate(entry.createdAt)}
                </time>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-gray-600">
            Two entries, one thread — what has changed, and what has stayed.
            Mirror doesn&apos;t draw the conclusion; you do.
          </p>
        </section>
      )}

      {/* ── Your pages, ordered newest month first ── */}
      {state === "loading" && (
        <LoadingState label="Opening your Mirror…" className="mt-12" />
      )}

      {state === "error" && (
        <ErrorState
          className="mt-12"
          title="Your reflections didn't load"
          description="Nothing was changed. Try opening this room again."
          onRetry={() => void load()}
        />
      )}

      {state === "ready" && entries.length === 0 && (
        <EmptyState
          className="mt-12"
          icon="eye"
          title="Your Mirror is empty."
          description="The first reflection is often the smallest one. Write the first page above and it will rest here."
        />
      )}

      {state === "ready" &&
        months.map((month) => (
          <section key={month.key} aria-labelledby={`mirror-month-${month.key}`} className="mt-10">
            <h2
              id={`mirror-month-${month.key}`}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500"
            >
              {month.label}
            </h2>
            <div className="mt-1 space-y-1">
              <AnimatePresence initial={false}>
                {month.entries.map((entry) => (
                  <MirrorEntryCard
                    key={entry.id}
                    entry={entry}
                    onUpdate={updateEntry}
                    onDelete={deleteEntry}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}

      {/* ── Privacy note ── */}
      <p className="mt-10 text-center text-[11px] leading-relaxed text-gray-700">
        {user?.name ? `${user.name}, ` : ""}only you can read what&apos;s here.
        Mirror doesn&apos;t diagnose, judge, or replace talking to people you trust.
      </p>
    </section>
  );
}
