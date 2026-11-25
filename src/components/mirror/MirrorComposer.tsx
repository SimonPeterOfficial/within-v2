"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { nextPrompt } from "@/lib/mirror-view";

const MAX_BODY = 5000;

type MirrorComposerProps = {
  /** Returns true only when the entry was really persisted. */
  onSave: (body: string, prompt: string | null) => Promise<boolean>;
  busy?: boolean;
};

/**
 * The writing surface of Mirror. A prompt is an optional opening, never a
 * gate: it can be replaced, dismissed, and the entry can still be saved with
 * no prompt at all.
 */
export default function MirrorComposer({ onSave, busy = false }: MirrorComposerProps) {
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [writingFreely, setWritingFreely] = useState(false);

  // One opening per visit — deferred so server and first client render match.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPrompt(nextPrompt(null)));
    return () => cancelAnimationFrame(frame);
  }, []);

  const save = useCallback(async () => {
    const body = draft.trim();
    if (!body || busy) return;

    const saved = await onSave(body, prompt);
    if (!saved) return;

    setDraft("");
    // Respect someone who chose to write without a question.
    setPrompt(writingFreely ? null : nextPrompt(prompt));
  }, [draft, busy, prompt, writingFreely, onSave]);

  const choosePrompt = () => {
    setPrompt(nextPrompt(prompt));
    setWritingFreely(false);
  };

  const writeFreely = () => {
    setPrompt(null);
    setWritingFreely(true);
  };

  return (
    <GlassCard
      tone="paper"
      className="crystal-elevated crystal-edge crystal-sheen depth-medium hairline mt-8 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/60">
            A starting point · optional
          </p>
          {prompt ? (
            <p className="mt-2 max-w-lg font-display text-base italic leading-relaxed text-gray-300">
              &ldquo;{prompt}&rdquo;
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Write freely — no question required.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          {prompt ? (
            <>
              <button
                type="button"
                onClick={choosePrompt}
                className="text-[11px] font-medium text-gray-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              >
                Another
              </button>
              <button
                type="button"
                onClick={writeFreely}
                className="text-[11px] font-medium text-gray-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              >
                Write freely
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={choosePrompt}
              className="text-[11px] font-medium text-emerald-300/80 transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
            >
              Use a prompt
            </button>
          )}
        </div>
      </div>

      <label htmlFor="mirror-draft" className="sr-only">
        Your reflection
      </label>
      <textarea
        id="mirror-draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
        placeholder="Write from wherever you are…"
        rows={5}
        maxLength={MAX_BODY}
        className="mt-4 w-full resize-none rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm leading-relaxed text-gray-200 placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-gray-600">
          {draft.length > 0
            ? `${draft.length}/${MAX_BODY} · ⌘/Ctrl + Enter to keep`
            : "Nothing written here leaves your account."}
        </span>
        <Button
          onClick={() => void save()}
          disabled={!draft.trim() || busy}
          loading={busy}
          size="sm"
        >
          {busy ? "Keeping…" : "Keep this reflection"}
        </Button>
      </div>
    </GlassCard>
  );
}
