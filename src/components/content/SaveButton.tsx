"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

type SaveButtonProps = {
  contentId: string;
  initialSaved: boolean;
};

/**
 * The save button — toggles the item on the persistent "saved" shelf via
 * /api/library. Optimistic: the state flips the instant you tap and the
 * toast confirms immediately; the server response then reconciles the real
 * state, rolling back quietly if the write failed. A double-click can't
 * create duplicate rows (the database enforces it).
 */
export default function SaveButton({ contentId, initialSaved }: SaveButtonProps) {
  const { status } = useSession();
  const { toast } = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  if (status !== "authenticated") return null;

  async function toggle() {
    if (busy) return;
    const previous = saved;

    // Optimistic flip — the interface answers before the network does.
    const next = !previous;
    setSaved(next);
    toast(next ? "Saved to your library" : "Removed from your library", next ? "success" : "info");
    setBusy(true);

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, shelf: "saved" }),
      });
      const data = (await response.json()) as { ok: boolean; saved?: boolean; error?: string };
      if (data.ok && typeof data.saved === "boolean") {
        // Reconcile with the server's truth — usually identical to the guess.
        setSaved(data.saved);
      } else {
        // Roll back — the shelf never lied.
        setSaved(previous);
        toast(data.error ?? "Couldn't update your library — try again.", "error");
      }
    } catch {
      setSaved(previous);
      toast("Network error — try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={saved ? "outline" : "primary"}
      size="md"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
    >
      <Icon name="bookmark" size={15} className="mr-1.5" />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
