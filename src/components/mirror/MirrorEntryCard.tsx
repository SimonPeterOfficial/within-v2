"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { formatEntryDate, formatEntryTime, wasEdited, type MirrorEntryView } from "@/lib/mirror-view";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const MAX_BODY = 5000;
const MAX_PROMPT = 200;

type MirrorEntryCardProps = {
  entry: MirrorEntryView;
  onUpdate: (id: string, patch: { body: string; prompt: string | null }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

/** One reflection as a page of the journal — editable only by its owner. */
export default function MirrorEntryCard({ entry, onUpdate, onDelete }: MirrorEntryCardProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const startEdit = () => {
    setEditBody(entry.body);
    setEditPrompt(entry.prompt ?? "");
    setConfirmingDelete(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditBody("");
    setEditPrompt("");
    setEditing(false);
  };

  const submitEdit = async () => {
    const body = editBody.trim();
    if (!body || busy) return;

    setBusy(true);
    try {
      const updated = await onUpdate(entry.id, { body, prompt: editPrompt.trim() || null });
      if (updated) {
        setEditing(false);
        setConfirmingDelete(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const removed = await onDelete(entry.id);
      if (!removed) setConfirmingDelete(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hairline relative py-6"
    >
      {editing ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/60">
            Editing this page
          </p>
          <label htmlFor={`mirror-edit-${entry.id}`} className="sr-only">
            Edit your reflection
          </label>
          <textarea
            id={`mirror-edit-${entry.id}`}
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            rows={6}
            maxLength={MAX_BODY}
            className="mt-3 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm leading-relaxed text-gray-200 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor={`mirror-prompt-${entry.id}`} className="sr-only">
              Starting point, optional
            </label>
            <input
              id={`mirror-prompt-${entry.id}`}
              value={editPrompt}
              onChange={(event) => setEditPrompt(event.target.value)}
              maxLength={MAX_PROMPT}
              placeholder="Starting point (optional)"
              className="min-w-0 flex-1 rounded-full border border-white/[0.06] bg-black/30 px-4 py-2 text-xs text-gray-400 placeholder:text-gray-600 outline-none transition focus:border-emerald-400/30 focus:ring-2 focus:ring-emerald-400/10"
            />
            {editPrompt && (
              <button
                type="button"
                onClick={() => setEditPrompt("")}
                className="text-[11px] text-gray-500 transition hover:text-gray-300"
              >
                Clear prompt
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => void submitEdit()}
              disabled={!editBody.trim() || busy}
              loading={busy}
            >
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {entry.prompt && (
            <p className="text-[11px] italic text-gray-600">&mdash; {entry.prompt}</p>
          )}
          <p className="mt-2 whitespace-pre-wrap font-display text-[15px] leading-relaxed text-gray-200">
            {entry.body}
          </p>

          {confirmingDelete ? (
            <div
              role="group"
              aria-label="Confirm removal"
              className="mt-4 flex flex-wrap items-center gap-3"
            >
              <span className="text-xs text-gray-400">Remove this reflection?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
                disabled={busy}
              >
                Keep it
              </Button>
              <button
                type="button"
                onClick={() => void remove()}
                disabled={busy}
                className="text-[11px] font-medium text-rose-300 transition hover:text-rose-200 disabled:opacity-50"
              >
                {busy ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <time dateTime={entry.createdAt} className="text-[11px] text-gray-600">
                  {formatEntryDate(entry.createdAt)} · {formatEntryTime(entry.createdAt)}
                </time>
                {wasEdited(entry) && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-700">
                    Edited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-[11px] font-medium text-gray-500 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                  aria-label="Edit this reflection"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-[11px] font-medium text-gray-600 transition hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
                  aria-label="Remove this reflection"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.article>
  );
}
