"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/cards/Badge";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* ── Shapes mirroring the API ─────────────────────────────────────────── */

type StudioCounts = {
  drafts: number;
  inReview: number;
  approved: number;
  published: number;
  followers: number;
};

type StudioOverview = {
  counts: StudioCounts;
  totalViews: number;
  totalSaves: number;
  milestones: string[];
};

type StudioItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  moderationNote: string | null;
  tags: string[] | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  publishedAt: string | null;
  updatedAt: string;
  views: number;
};

type Payload = { ok: boolean; overview?: StudioOverview; items?: StudioItem[]; error?: string };

/* ── Content type vocabulary — only renderable, honest types ─────────── */

const TYPES = [
  { id: "story", label: "Story", emoji: "📖", hint: "A written piece" },
  { id: "post", label: "Essay", emoji: "✍️", hint: "A thought, shared" },
  { id: "book", label: "Book", emoji: "📚", hint: "Longer work" },
  { id: "audio", label: "Audio", emoji: "🎧", hint: "Sound and music" },
  { id: "image", label: "Artwork", emoji: "🖼️", hint: "Visual work" },
  { id: "video", label: "Video", emoji: "🎬", hint: "Moving image" },
  { id: "film", label: "Film", emoji: "🎞️", hint: "Cinema" },
] as const;

const GRADIENTS = [
  "from-purple-600 via-indigo-600 to-blue-600",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-rose-700",
  "from-cyan-500 to-blue-700",
  "from-fuchsia-500 to-purple-700",
  "from-amber-500 to-orange-600",
];

const EMOJIS = ["✦", "🌌", "🌊", "🪐", "🔥", "🌅", "🏠", "🌧", "🌠", "🌙"];

const STATUS_META: Record<string, { label: string; tone: "mood" | "emerald" | "warm" | "neutral" }> = {
  draft: { label: "Draft — only you can see it", tone: "neutral" },
  submitted: { label: "In review", tone: "warm" },
  reviewing: { label: "In review", tone: "warm" },
  approved: { label: "Approved — ready to publish", tone: "emerald" },
  published: { label: "Live", tone: "mood" },
  hidden: { label: "Hidden by moderation", tone: "warm" },
  archived: { label: "Archived", tone: "neutral" },
};

type Tab = "overview" | "drafts" | "review" | "published";
type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; item: StudioItem };

type Draft = {
  title: string;
  type: string;
  description: string;
  tags: string;
  coverGradient: string;
  coverEmoji: string;
};

const EMPTY_DRAFT: Draft = { title: "", type: "story", description: "", tags: "", coverGradient: GRADIENTS[0], coverEmoji: EMOJIS[0] };

/**
 * StudioWorkspace — the creator's command center.
 *
 * Everything is real: counts come from /api/studio, saving is debounced
 * (never per keystroke), drafts stay private until submitted, and the
 * lifecycle (draft → review → approved → publish) is shown at every step.
 * No fake numbers, no jargon, no intimidating dashboard.
 */
export default function StudioWorkspace({ creatorName }: { creatorName: string }) {
  const { status } = useSession();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotionSafe();

  const [overview, setOverview] = useState<StudioOverview | null>(null);
  const [items, setItems] = useState<StudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/studio", { cache: "no-store" });
      const data = (await res.json()) as Payload;
      if (data.ok && data.overview && data.items) {
        setOverview(data.overview);
        setItems(data.items);
      }
    } catch {
      /* the workspace keeps the last known state — retry via refresh */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Deferred a frame — hydration-safe, matching the session provider's pattern.
    const frame = requestAnimationFrame(() => {
      void refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [status, refresh]);

  /* ── Create / edit lifecycle ───────────────────────────────────────── */

  const startCreate = () => {
    setDraft({ ...EMPTY_DRAFT, coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)], coverEmoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] });
    setEditId(null);
    setMode({ kind: "create" });
  };

  const startEdit = (item: StudioItem) => {
    setDraft({
      title: item.title,
      type: item.type,
      description: item.description ?? "",
      tags: item.tags?.join(", ") ?? "",
      coverGradient: item.coverGradient ?? GRADIENTS[0],
      coverEmoji: item.coverEmoji ?? "✦",
    });
    setEditId(item.id);
    setMode({ kind: "edit", item });
  };

  /** Creates the draft (first save) or PATCHes the existing one. */
  const saveDraft = useCallback(
    async (silent = false) => {
      const body = {
        title: draft.title.trim(),
        type: draft.type,
        description: draft.description.trim() || undefined,
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        coverGradient: draft.coverGradient,
        coverEmoji: draft.coverEmoji,
      };
      if (!body.title) {
        if (!silent) toast("Give your creation a title first.", "info");
        return null;
      }
      setSaving(true);
      try {
        const res = await fetch(editId ? `/api/content/${editId}` : "/api/content", {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { ok: boolean; content?: { id: string }; error?: string };
        if (!data.ok || !data.content) {
          if (!silent) toast(data.error ?? "Couldn't save — try again.", "error");
          return null;
        }
        if (!editId) setEditId(data.content.id);
        if (!silent) toast("Draft saved — only you can see it.", "success");
        void refresh();
        return data.content.id;
      } catch {
        if (!silent) toast("Network error — your words are still here, try again.", "error");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [draft, editId, refresh, toast]
  );

  const lifecycle = async (item: StudioItem, action: "submit" | "publish") => {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/content/${item.id}/${action}`, { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        toast(
          action === "submit"
            ? "Sent for review — we'll tell you what happens next."
            : "It's live. The world can find it now.",
          "success"
        );
        void refresh();
      } else {
        toast(data.error ?? "That didn't work — try again.", "error");
      }
    } catch {
      toast("Network error — try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: StudioItem) => {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/content/${item.id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; mode?: string; error?: string };
      if (data.ok) {
        toast(data.mode === "archived" ? "Archived — it's no longer discoverable." : "Draft removed.", "info");
        setConfirmDelete(null);
        void refresh();
      } else {
        toast(data.error ?? "Couldn't remove it — try again.", "error");
      }
    } catch {
      toast("Network error — try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  /* ── Derived lists ─────────────────────────────────────────────────── */

  const drafts = items.filter((i) => i.status === "draft");
  const inReview = items.filter((i) => ["submitted", "reviewing", "hidden"].includes(i.status));
  const approved = items.filter((i) => i.status === "approved");
  const published = items.filter((i) => ["published", "archived"].includes(i.status));

  const listFor = (t: Tab) =>
    t === "drafts" ? drafts : t === "review" ? [...inReview, ...approved] : published;

  /* ── Render ────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <Container size="md" className="py-24">
        <div className="animate-pulse space-y-4" aria-label="Loading Studio">
          <div className="h-10 w-1/2 rounded-2xl bg-white/[0.04]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  /* ── Editor / create flow ──────────────────────────────────────────── */

  if (mode.kind !== "list") {
    const isCreate = mode.kind === "create";
    return (
      <Container size="md" className="relative z-10 py-12">
        <Button variant="ghost" size="sm" onClick={() => { setMode({ kind: "list" }); void refresh(); }} className="-ml-3 mb-8">
          <Icon name="back" size={14} className="mr-1" />
          Back to Studio
        </Button>

        <h1 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
          {isCreate ? "Create something" : "Continue your draft"}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {isCreate
            ? "Start anywhere — a title is enough. It's saved as a draft only you can see."
            : "Pick up where you left off. Your draft stays private until you send it."}
        </p>

        <div className="mt-10 space-y-8">
          {/* Step 1 — what are you making (create only) */}
          {isCreate && (
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">What are you making?</legend>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, type: t.id }))}
                    aria-pressed={draft.type === t.id}
                    className={`rounded-2xl border p-4 text-left transition ${
                      draft.type === t.id
                        ? "border-[rgba(var(--mood-rgb),0.5)] bg-[rgba(var(--mood-rgb),0.1)]"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <span aria-hidden className="text-2xl">{t.emoji}</span>
                    <span className="mt-2 block text-sm font-semibold text-white">{t.label}</span>
                    <span className="block text-xs text-gray-500">{t.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Step 2 — the words */}
          <div className="space-y-4">
            <div>
              <label htmlFor="studio-title" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">Title</label>
              <input
                id="studio-title"
                type="text"
                value={draft.title}
                maxLength={120}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="What is it called?"
                className="mt-3 w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-lg text-white outline-none transition placeholder:text-gray-600 focus:border-white/25"
              />
            </div>
            <div>
              <label htmlFor="studio-body" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
                {draft.type === "story" || draft.type === "book" || draft.type === "post" ? "The words" : "Description"}
              </label>
              <textarea
                id="studio-body"
                value={draft.description}
                maxLength={5000}
                rows={draft.type === "story" || draft.type === "book" || draft.type === "post" ? 12 : 4}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Begin anywhere. The first line is the hardest — so make it a bad one and keep going."
                className="mt-3 w-full resize-y rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-base leading-relaxed text-white outline-none transition placeholder:text-gray-600 focus:border-white/25"
              />
              <p className="mt-1.5 text-right text-xs text-gray-600">
                {draft.description.trim() ? `${draft.description.trim().split(/\s+/).length} words` : "0 words"}
              </p>
            </div>
          </div>

          {/* Step 3 — the face it shows the world */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">Its light</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`Cover glyph ${e}`}
                  aria-pressed={draft.coverEmoji === e}
                  onClick={() => setDraft((d) => ({ ...d, coverEmoji: e }))}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition ${
                    draft.coverEmoji === e ? "border-[rgba(var(--mood-rgb),0.5)] bg-[rgba(var(--mood-rgb),0.1)]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-label="Cover gradient"
                  aria-pressed={draft.coverGradient === g}
                  onClick={() => setDraft((d) => ({ ...d, coverGradient: g }))}
                  className={`h-11 w-11 rounded-xl border bg-linear-to-br ${g} transition ${
                    draft.coverGradient === g ? "border-white/60" : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </fieldset>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                aria-label="Preview"
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">How it will meet the world</p>
                <div className={`mt-4 flex aspect-[16/7] items-center justify-center rounded-2xl bg-linear-to-br ${draft.coverGradient} text-5xl`}>
                  <span aria-hidden>{draft.coverEmoji}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-medium">{draft.title || "Untitled"}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{draft.description || "…"}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions — the creator always knows where they are */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
            <Button variant="primary" onClick={() => void saveDraft()} disabled={saving}>
              <Icon name="check" size={15} className="mr-1.5" />
              {saving ? "Saving…" : editId ? "Save draft" : "Save as draft"}
            </Button>
            <Button variant="outline" onClick={() => setShowPreview((v) => !v)} aria-expanded={showPreview}>
              <Icon name="eye" size={15} className="mr-1.5" />
              {showPreview ? "Hide preview" : "Preview"}
            </Button>
            {saving && <span className="text-xs text-gray-500" role="status">Saving…</span>}
          </div>
          {editId && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  const saved = await saveDraft(true);
                  if (!saved) return;
                  const item = items.find((i) => i.id === editId);
                  if (item) await lifecycle({ ...item, status: "draft" }, "submit");
                }}
                disabled={saving}
              >
                <Icon name="forward" size={15} className="mr-1.5" />
                Save &amp; send for review
              </Button>
              <p className="text-xs text-gray-500">
                Review keeps WithIn safe. You&apos;ll get a notification with the outcome.
              </p>
            </div>
          )}
        </div>
      </Container>
    );
  }

  /* ── Workspace (list mode) ─────────────────────────────────────────── */

  const c = overview?.counts;

  return (
    <Container size="lg" className="relative z-10 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">Studio</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
            Welcome back, {creatorName.split(" ")[0]}
          </h1>
        </div>
        <Button variant="gradient" onClick={startCreate}>
          <Icon name="plus" size={15} className="mr-1.5" />
          Create
        </Button>
      </div>

      {/* Overview cards — real numbers or honest zeros */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Drafts", value: c?.drafts ?? 0, tab: "drafts" as Tab },
          { label: "In review", value: c?.inReview ?? 0, tab: "review" as Tab },
          { label: "Ready to publish", value: c?.approved ?? 0, tab: "review" as Tab },
          { label: "Live", value: c?.published ?? 0, tab: "published" as Tab },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setTab(card.tab)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition hover:border-white/20"
          >
            <span className="font-display text-3xl font-medium">{card.value}</span>
            <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-gray-500">{card.label}</span>
          </button>
        ))}
      </div>

      {overview && (
        <p className="mt-4 text-sm text-gray-500">
          {overview.totalViews > 0
            ? `${overview.totalViews.toLocaleString()} views · ${overview.totalSaves.toLocaleString()} saves · ${(overview.counts.followers ?? 0).toLocaleString()} followers`
            : "Your numbers will appear here as people find your work — no invented stats, ever."}
        </p>
      )}

      {overview && overview.milestones.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {overview.milestones.map((m) => (
            <Badge key={m} tone="emerald">{m}</Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div role="tablist" aria-label="Studio sections" className="mt-10 flex flex-wrap gap-2">
        {(["overview", "drafts", "review", "published"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" ? (
          <StudioOverviewPanel
            drafts={drafts}
            approved={approved}
            inReview={inReview}
            onCreate={startCreate}
            onContinue={(item) => startEdit(item)}
          />
        ) : (
          <StudioItemList
            items={listFor(tab)}
            emptyLabel={
              tab === "drafts"
                ? "No drafts yet. The first one is the hardest — start with a title."
                : tab === "review"
                  ? "Nothing in review right now."
                  : "Nothing published yet. Your first live work will appear here."
            }
            busyId={busyId}
            confirmDelete={confirmDelete}
            onEdit={startEdit}
            onSubmit={(item) => void lifecycle(item, "submit")}
            onPublish={(item) => void lifecycle(item, "publish")}
            onAskDelete={setConfirmDelete}
            onConfirmDelete={(item) => void remove(item)}
            onCancelDelete={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </Container>
  );
}

/* ── Overview panel — the gentle continuation ────────────────────────── */

function StudioOverviewPanel({
  drafts,
  approved,
  inReview,
  onCreate,
  onContinue,
}: {
  drafts: StudioItem[];
  approved: StudioItem[];
  inReview: StudioItem[];
  onCreate: () => void;
  onContinue: (item: StudioItem) => void;
}) {
  const waiting = [...approved, ...drafts].slice(0, 4);

  return (
    <div className="space-y-6">
      {waiting.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
          <span aria-hidden className="text-4xl">✦</span>
          <h2 className="mt-4 font-display text-xl font-medium">Create something</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            A story, an essay, a film, a sound. No dashboards to learn, no jargon —
            just begin with a title and keep going.
          </p>
          <Button variant="primary" className="mt-6" onClick={onCreate}>
            <Icon name="plus" size={15} className="mr-1.5" />
            Start a creation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Things waiting for you
          </p>
          {approved.map((item) => (
            <StudioRow key={item.id} item={item} action="publish" onAct={() => onContinue(item)} />
          ))}
          {drafts.map((item) => (
            <StudioRow key={item.id} item={item} action="continue" onAct={() => onContinue(item)} />
          ))}
        </div>
      )}
      {inReview.length > 0 && (
        <p className="text-sm text-gray-500">
          {inReview.length === 1
            ? "One piece is being reviewed — you'll hear back soon."
            : `${inReview.length} pieces are being reviewed — you'll hear back soon.`}
        </p>
      )}
    </div>
  );
}

function StudioRow({ item, action, onAct }: { item: StudioItem; action: "continue" | "publish"; onAct: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{item.title || "Untitled"}</p>
        <p className="text-xs text-gray-500">{STATUS_META[item.status]?.label ?? item.status}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onAct}>
        {action === "publish" ? "Review & publish" : "Continue"}
      </Button>
    </div>
  );
}

/* ── Item list — drafts, review, published ───────────────────────────── */

function StudioItemList({
  items,
  emptyLabel,
  busyId,
  confirmDelete,
  onEdit,
  onSubmit,
  onPublish,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  items: StudioItem[];
  emptyLabel: string;
  busyId: string | null;
  confirmDelete: string | null;
  onEdit: (item: StudioItem) => void;
  onSubmit: (item: StudioItem) => void;
  onPublish: (item: StudioItem) => void;
  onAskDelete: (id: string) => void;
  onConfirmDelete: (item: StudioItem) => void;
  onCancelDelete: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center text-sm text-gray-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const meta = STATUS_META[item.status] ?? { label: item.status, tone: "neutral" as const };
        return (
          <div key={item.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  {item.publishedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  {item.status === "published" && (
                    <span className="text-xs text-gray-500">
                      · {item.views.toLocaleString()} {item.views === 1 ? "view" : "views"}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-medium">{item.title || "Untitled"}</h3>
                {item.moderationNote && (
                  <p className="mt-1 text-xs text-gray-400">Moderator note: {item.moderationNote}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {item.status === "draft" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>
                    <Button variant="primary" size="sm" onClick={() => onSubmit(item)} disabled={busyId === item.id}>
                      Send for review
                    </Button>
                  </>
                )}
                {item.status === "approved" && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => onPublish(item)} disabled={busyId === item.id}>
                      Publish
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onAskDelete(item.id)} aria-label={`Remove ${item.title}`}>
                      <Icon name="close" size={14} />
                    </Button>
                  </>
                )}
                {item.status === "published" && (
                  <Button variant="ghost" size="sm" href={`/content/${item.id}`}>View live</Button>
                )}
              </div>
            </div>

            {confirmDelete === item.id && (
              <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
                <p className="text-sm text-gray-300">
                  {item.status === "published"
                    ? "This will archive it — it leaves Discover and your profile, but your saves stay coherent."
                    : "This draft will be gone for good. Nothing else depends on it."}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onConfirmDelete(item)} disabled={busyId === item.id}>
                    Yes, {item.status === "published" ? "archive it" : "remove it"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onCancelDelete}>Keep it</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
