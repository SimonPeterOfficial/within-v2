"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

type ShareButtonProps = {
  /** The path to share, e.g. /content/abc123 */
  path: string;
  /** The piece's title, used in the fallback prompt */
  title: string;
};

/**
 * The share action — copies a clean link to the clipboard and confirms with
 * a quiet toast. When the Clipboard API is unavailable (older browsers,
 * insecure contexts), it falls back to the trusty select-and-copy prompt
 * rather than failing silently.
 */
export default function ShareButton({ path, title }: ShareButtonProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function share() {
    if (busy) return;
    setBusy(true);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied", "success");
    } catch {
      // Clipboard blocked — offer the manual path instead of failing quietly.
      window.prompt("Copy this link:", url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="md" onClick={share} disabled={busy} aria-label={`Share ${title}`}>
      <Icon name="forward" size={15} className="mr-1.5" />
      Share
    </Button>
  );
}
