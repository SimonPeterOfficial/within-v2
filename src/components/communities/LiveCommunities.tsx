"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import EmptyState from "@/components/ui/states/EmptyState";
import { Skeleton } from "@/components/ui/skeletons";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

type CommunityCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  gradient: string | null;
  visibility: "public" | "private";
  memberCount: number;
};

type State = "loading" | "ready" | "error";

/**
 * LiveCommunities — real rooms, real membership.
 *
 * Replaces the static/mock community cards with the live API: search,
 * join/leave with optimistic state, and a quiet create form. Member counts
 * come from the database; when there are no communities yet, the empty
 * state says so honestly and offers creation.
 */
export default function LiveCommunities() {
  const { status } = useSession();
  const { toast } = useToast();

  const [state, setState] = useState<State>("loading");
  const [communities, setCommunities] = useState<CommunityCard[]>([]);
  const [mineIds, setMineIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const authenticated = status === "authenticated";

  const load = useCallback(async (search?: string) => {
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/communities${params}`);
      const data = (await res.json()) as { ok: boolean; communities?: CommunityCard[]; mine?: CommunityCard[] };
      if (data.ok) {
        setCommunities(data.communities ?? []);
        setMineIds(new Set((data.mine ?? []).map((c) => c.id)));
        setState("ready");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Debounced search.
  useEffect(() => {
    const handle = setTimeout(() => void load(query || undefined), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleMembership = async (community: CommunityCard) => {
    const isMember = mineIds.has(community.id);
    setBusyId(community.id);
    // Optimistic flip.
    setMineIds((prev) => {
      const next = new Set(prev);
      if (isMember) next.delete(community.id);
      else next.add(community.id);
      return next;
    });
    try {
      const res = await fetch(`/api/communities/${community.slug}/membership`, {
        method: isMember ? "DELETE" : "POST",
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === community.id
              ? { ...c, memberCount: c.memberCount + (isMember ? -1 : 1) }
              : c,
          ),
        );
        toast(isMember ? "You left the room." : `Welcome to ${community.name}.`, "success");
      } else {
        // Roll back.
        setMineIds((prev) => {
          const next = new Set(prev);
          if (isMember) next.add(community.id);
          else next.delete(community.id);
          return next;
        });
        toast(data.error ?? "That didn't work.", "error");
      }
    } catch {
      setMineIds((prev) => {
        const next = new Set(prev);
        if (isMember) next.add(community.id);
        else next.delete(community.id);
        return next;
      });
      toast("Couldn't reach WithIn.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const create = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
      const data = (await res.json()) as { ok: boolean; slug?: string; error?: string };
      if (data.ok && data.slug) {
        toast("Your room is open.", "success");
        setNewName("");
        setNewDescription("");
        setShowCreate(false);
        await load(query || undefined);
      } else {
        toast(data.error ?? "Couldn't create the community.", "error");
      }
    } catch {
      toast("Couldn't reach WithIn.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="community-search" className="sr-only">
          Search communities
        </label>
        <div className="relative flex-1 min-w-56">
          <Icon
            name="search"
            size={14}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
          />
          <input
            id="community-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms…"
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
          />
        </div>
        {authenticated && (
          <Button variant="outline" size="sm" onClick={() => setShowCreate((v) => !v)}>
            <Icon name="plus" size={14} />
            {showCreate ? "Close" : "Start a room"}
          </Button>
        )}
      </div>

      {showCreate && authenticated && (
        <GlassCard tone="soft" className="mt-4 p-5">
          <label htmlFor="community-name" className="text-xs font-semibold text-gray-300">
            Name your room
          </label>
          <input
            id="community-name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={60}
            placeholder="e.g. Night Swimmers"
            className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40"
          />
          <label htmlFor="community-description" className="mt-4 block text-xs font-semibold text-gray-300">
            What happens here?
          </label>
          <textarea
            id="community-description"
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            rows={2}
            maxLength={300}
            placeholder="A quiet description — what the room is for."
            className="mt-2 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40"
          />
          <div className="mt-4 flex justify-end">
            <Button size="sm" disabled={!newName.trim() || creating} onClick={() => void create()}>
              {creating ? "Opening…" : "Open the room"}
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="mt-8">
        {state === "loading" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <GlassCard key={index} tone="soft" className="p-5">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
              </GlassCard>
            ))}
          </div>
        )}

        {state === "error" && (
          <GlassCard tone="soft" className="p-8 text-center">
            <p className="text-sm text-gray-300">Couldn&apos;t load communities.</p>
            <button
              type="button"
              onClick={() => void load(query || undefined)}
              className="mt-2 text-xs text-emerald-400 transition hover:text-emerald-300"
            >
              Try again
            </button>
          </GlassCard>
        )}

        {state === "ready" && communities.length === 0 && (
          <EmptyState
            icon="users"
            title={query ? "No rooms match that" : "No rooms yet"}
            description={
              query
                ? "Try a different word — or start the room yourself."
                : "The first room starts with someone who cares about something. That could be you."
            }
            action={
              authenticated ? (
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                  Start a room
                </Button>
              ) : (
                <Button href="/login" variant="outline" size="sm">
                  Sign in to start one
                </Button>
              )
            }
          />
        )}

        {state === "ready" && communities.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {communities.map((community) => {
              const isMember = mineIds.has(community.id);
              return (
                <GlassCard key={community.id} tone="soft" hoverLift className="p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                        community.gradient ?? "bg-linear-to-br from-purple-500 to-emerald-400"
                      }`}
                    >
                      {community.emoji ?? "✦"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Text as="h3" variant="subsection">
                        {community.name}
                      </Text>
                      {community.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          {community.description}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-gray-600">
                        {community.memberCount} {community.memberCount === 1 ? "member" : "members"}
                        {community.visibility === "private" && " · private"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {authenticated ? (
                      <Button
                        size="sm"
                        variant={isMember ? "outline" : "primary"}
                        disabled={busyId === community.id}
                        onClick={() => void toggleMembership(community)}
                      >
                        {isMember ? "Member ✓" : "Join"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" href="/login">
                        Sign in to join
                      </Button>
                    )}
                    {isMember && (
                      <Link
                        href={`/communities/${community.slug}`}
                        className="text-[11px] text-gray-500 transition hover:text-emerald-200"
                      >
                        Open room →
                      </Link>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
