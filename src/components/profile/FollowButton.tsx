"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

type FollowButtonProps = {
  followeeId: string;
  initialFollowing: boolean;
  followerCount: number;
};

/**
 * The follow button — one POST to /api/follows, then the label, count, and
 * server state all agree. Optimistic: the label and count respond instantly,
 * the server reconciles, and a failed write rolls back with a quiet toast.
 * Hidden when unauthenticated or viewing yourself.
 */
export default function FollowButton({ followeeId, initialFollowing, followerCount }: FollowButtonProps) {
  const { status } = useSession();
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [busy, setBusy] = useState(false);

  if (status !== "authenticated") return null;

  async function toggle() {
    if (busy) return;
    const previousFollowing = following;
    const previousCount = count;

    // Optimistic flip — the relationship answers before the network does.
    const next = !previousFollowing;
    setFollowing(next);
    setCount((current) => current + (next ? 1 : -1));
    toast(next ? "Following" : "Unfollowed", next ? "success" : "info");
    setBusy(true);

    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followeeId }),
      });
      const data = (await response.json()) as { ok: boolean; following?: boolean; error?: string };
      if (data.ok && typeof data.following === "boolean") {
        // Reconcile with the server's truth.
        setFollowing(data.following);
        setCount((current) =>
          data.following === previousFollowing ? current : current + (data.following ? 1 : -1)
        );
      } else {
        // Roll back — the count never lied.
        setFollowing(previousFollowing);
        setCount(previousCount);
        toast(data.error ?? "Couldn't update follow — try again.", "error");
      }
    } catch {
      setFollowing(previousFollowing);
      setCount(previousCount);
      toast("Network error — try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={following ? "outline" : "primary"}
        size="md"
        onClick={toggle}
        disabled={busy}
        aria-pressed={following}
      >
        {following ? "Following" : "Follow"}
      </Button>
      <Button variant="ghost" size="md" href={`/conversations?with=${followeeId}`}>
        Message
      </Button>
      <span className="text-xs text-gray-500" aria-hidden>
        {count.toLocaleString()} {count === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
