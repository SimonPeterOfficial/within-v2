"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

type ModerationActionsProps = {
  contentId: string;
  status: string;
};

/**
 * Inline moderation controls — shown only to moderators/admins (the server
 * decides; this component never gates anything itself). Approve, reject
 * (with an optional note), or hide. Every action is audited server-side.
 */
export default function ModerationActions({ contentId, status }: ModerationActionsProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function act(action: "approve" | "reject" | "hide") {
    if (busy) return;
    const note =
      action === "reject" ? window.prompt("Reason for rejection (shown to the creator):") ?? undefined : undefined;
    setBusy(action);
    setFeedback(null);
    try {
      const response = await fetch(`/api/moderation/content/${contentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setFeedback(`Done — content ${action === "approve" ? "approved (creator can publish)" : action + "d"}.`);
      } else {
        setFeedback(data.error ?? "Action failed.");
      }
    } catch {
      setFeedback("Network error — try again.");
    } finally {
      setBusy(null);
    }
  }

  if (status === "published" || status === "hidden" || status === "archived") return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">Moderation</span>
      <Button variant="primary" size="sm" onClick={() => act("approve")} disabled={busy !== null}>
        <Icon name="check" size={14} className="mr-1" />
        Approve
      </Button>
      <Button variant="outline" size="sm" onClick={() => act("reject")} disabled={busy !== null}>
        Reject
      </Button>
      <Button variant="outline" size="sm" onClick={() => act("hide")} disabled={busy !== null}>
        Hide
      </Button>
      {feedback && <span className="text-xs text-emerald-300">{feedback}</span>}
    </div>
  );
}