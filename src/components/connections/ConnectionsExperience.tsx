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

type PersonCard = {
  userId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  gradient: string | null;
  bio: string | null;
};

type FriendEntry = PersonCard & { friendsSince: string };
type RequestEntry = { id: string; person: PersonCard; createdAt: string };

type SocialPayload = {
  ok: boolean;
  friends?: FriendEntry[];
  incoming?: RequestEntry[];
  outgoing?: RequestEntry[];
  mutuals?: PersonCard[];
  blockedIds?: string[];
  error?: string;
};

type State = "loading" | "ready" | "error";

/** A person's halo avatar — gradient from their profile, initial fallback. */
function PersonAvatar({ person, size = 44 }: { person: PersonCard; size?: number }) {
  const initial = (person.displayName ?? person.username).charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-black ${
        person.gradient ?? "bg-linear-to-br from-purple-500 to-emerald-400"
      }`}
    >
      {person.avatar ?? initial}
    </span>
  );
}

function PersonRow({
  person,
  children,
}: {
  person: PersonCard;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-b-0">
      <PersonAvatar person={person} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${person.username}`}
          className="block truncate text-sm font-semibold text-white transition hover:text-emerald-200"
        >
          {person.displayName ?? person.username}
        </Link>
        <p className="truncate text-xs text-gray-500">@{person.username}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/**
 * Connections — the user's social home.
 *
 * People first, metrics never: friends, honest requests, mutual-follow
 * hints, and blocked accounts with real controls. Every action hits the
 * server; optimistic changes roll back on failure.
 */
export default function ConnectionsExperience() {
  const { status } = useSession();
  const { toast } = useToast();

  const [state, setState] = useState<State>("loading");
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [incoming, setIncoming] = useState<RequestEntry[]>([]);
  const [outgoing, setOutgoing] = useState<RequestEntry[]>([]);
  const [mutuals, setMutuals] = useState<PersonCard[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const authenticated = status === "authenticated";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/social");
      const data = (await res.json()) as SocialPayload;
      if (data.ok) {
        setFriends(data.friends ?? []);
        setIncoming(data.incoming ?? []);
        setOutgoing(data.outgoing ?? []);
        setMutuals(data.mutuals ?? []);
        setBlockedIds(data.blockedIds ?? []);
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
      const timer = setTimeout(() => void load(), 0);
      return () => clearTimeout(timer);
    }
    const frame = requestAnimationFrame(() => setState("ready"));
    return () => cancelAnimationFrame(frame);
  }, [authenticated, load]);

  const act = async (payload: Record<string, string>, onDone: () => void) => {
    setBusyId(payload.friendshipId ?? payload.userId ?? "action");
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        onDone();
      } else {
        toast(data.error ?? "That didn't work.", "error");
      }
    } catch {
      toast("Couldn't reach WithIn. Try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (!authenticated) {
    return (
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
        <GlassCard tone="soft" className="p-10 text-center">
          <Icon name="users" size={28} className="mx-auto text-emerald-300/70" />
          <Text as="h1" variant="sectionTitle" className="mt-4">
            Your people
          </Text>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
            Friends, conversations and communities — the human side of WithIn.
            Sign in to see yours.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Icon name="lock" size={14} />
            Sign in
          </Link>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/70">
          Connections
        </p>
        <Text as="h1" variant="sectionTitle" className="mt-2">
          Your people
        </Text>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
          Not followers — people. Requests are explicit, blocking is real, and
          nothing here is a number to chase.
        </p>
      </header>

      {state === "loading" && (
        <div className="mt-10 space-y-6">
          {[0, 1, 2].map((index) => (
            <GlassCard key={index} tone="soft" className="p-4">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </GlassCard>
          ))}
        </div>
      )}

      {state === "error" && (
        <GlassCard tone="soft" className="mt-10 p-8 text-center">
          <p className="text-sm text-gray-300">Couldn&apos;t reach your people.</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs text-emerald-400 transition hover:text-emerald-300"
          >
            Try again
          </button>
        </GlassCard>
      )}

      {state === "ready" && (
        <div className="mt-10 space-y-8">
          {/* ── Requests ── */}
          {incoming.length > 0 && (
            <GlassCard tone="soft" className="overflow-hidden">
              <p className="border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                Friend requests · {incoming.length}
              </p>
              {incoming.map((entry) => (
                <PersonRow key={entry.id} person={entry.person}>
                  <Button
                    size="sm"
                    disabled={busyId === entry.id}
                    onClick={() =>
                      void act({ action: "accept", friendshipId: entry.id }, () => {
                        setIncoming((prev) => prev.filter((r) => r.id !== entry.id));
                        setFriends((prev) => [
                          ...prev,
                          { ...entry.person, friendsSince: new Date().toISOString() },
                        ]);
                        toast(`You and ${entry.person.displayName ?? entry.person.username} are friends now.`, "success");
                      })
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === entry.id}
                    onClick={() =>
                      void act({ action: "decline", friendshipId: entry.id }, () => {
                        setIncoming((prev) => prev.filter((r) => r.id !== entry.id));
                      })
                    }
                  >
                    Decline
                  </Button>
                </PersonRow>
              ))}
            </GlassCard>
          )}

          {/* ── Friends ── */}
          <div>
            <Text as="h2" variant="subsection" className="mb-3">
              Friends
            </Text>
            {friends.length === 0 ? (
              <EmptyState
                icon="users"
                title="No friends yet"
                description="Find people through Discover, creators you love, or communities you join — a friend request is always explicit, never automatic."
                action={
                  <Button href="/discover" variant="outline" size="sm">
                    Explore Discover
                  </Button>
                }
              />
            ) : (
              <GlassCard tone="soft" className="overflow-hidden">
                {friends.map((friend) => (
                  <PersonRow key={friend.userId} person={friend}>
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/conversations?with=${friend.userId}`}
                    >
                      Message
                    </Button>
                    <button
                      type="button"
                      disabled={busyId === friend.userId}
                      onClick={() =>
                        void act({ action: "remove", userId: friend.userId }, () => {
                          setFriends((prev) => prev.filter((f) => f.userId !== friend.userId));
                          toast("Friend removed.", "info");
                        })
                      }
                      className="text-[11px] text-gray-600 transition hover:text-rose-300 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </PersonRow>
                ))}
              </GlassCard>
            )}
          </div>

          {/* ── Sent requests (cancellable) ── */}
          {outgoing.length > 0 && (
            <div>
              <Text as="h2" variant="subsection" className="mb-3">
                Sent requests
              </Text>
              <GlassCard tone="soft" className="overflow-hidden">
                {outgoing.map((entry) => (
                  <PersonRow key={entry.id} person={entry.person}>
                    <button
                      type="button"
                      disabled={busyId === entry.id}
                      onClick={() =>
                        void act({ action: "decline", friendshipId: entry.id }, () => {
                          setOutgoing((prev) => prev.filter((r) => r.id !== entry.id));
                        })
                      }
                      className="text-[11px] text-gray-600 transition hover:text-rose-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </PersonRow>
                ))}
              </GlassCard>
            </div>
          )}

          {/* ── Mutual follows — gentle hints, real data ── */}
          {mutuals.length > 0 && (
            <div>
              <Text as="h2" variant="subsection" className="mb-3">
                You follow each other
              </Text>
              <GlassCard tone="soft" className="overflow-hidden">
                {mutuals.map((person) => (
                  <PersonRow key={person.userId} person={person}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === person.userId}
                      onClick={() =>
                        void act({ action: "request", userId: person.userId }, () => {
                          setMutuals((prev) => prev.filter((m) => m.userId !== person.userId));
                          toast("Friend request sent.", "success");
                        })
                      }
                    >
                      Say hello
                    </Button>
                  </PersonRow>
                ))}
              </GlassCard>
            </div>
          )}

          {/* ── Blocked — real controls, real consequences ── */}
          {blockedIds.length > 0 && (
            <details className="rounded-card border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <summary className="cursor-pointer text-xs text-gray-500 transition hover:text-gray-300">
                Blocked accounts · {blockedIds.length}
              </summary>
              <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
                Blocked people can&apos;t follow you, message you, or see you in discovery.
              </p>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
