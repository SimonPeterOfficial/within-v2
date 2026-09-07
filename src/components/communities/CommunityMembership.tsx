"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type CommunityMembershipProps = {
  slug: string;
  initialIsMember: boolean;
  isOwner: boolean;
};

/**
 * The join/leave control for a community — optimistic with rollback, and
 * the owner sees their role stated plainly instead of a leave button that
 * would fail.
 */
export default function CommunityMembership({ slug, initialIsMember, isOwner }: CommunityMembershipProps) {
  const { toast } = useToast();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    const previous = isMember;
    setIsMember(!previous);
    setBusy(true);
    try {
      const res = await fetch(`/api/communities/${slug}/membership`, {
        method: previous ? "DELETE" : "POST",
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        toast(previous ? "You left the room." : "Welcome in.", "success");
      } else {
        setIsMember(previous);
        toast(data.error ?? "That didn't work.", "error");
      }
    } catch {
      setIsMember(previous);
      toast("Couldn't reach WithIn.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (isOwner) {
    return (
      <p className="text-xs text-gray-500">
        You keep this room. <span className="text-gray-600">Ownership transfer arrives with community roles.</span>
      </p>
    );
  }

  return (
    <Button
      size="sm"
      variant={isMember ? "outline" : "primary"}
      onClick={() => void toggle()}
      disabled={busy}
    >
      {isMember ? "Member ✓" : "Join this room"}
    </Button>
  );
}
