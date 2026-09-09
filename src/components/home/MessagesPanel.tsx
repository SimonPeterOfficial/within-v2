"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";

/**
 * MessagesPanel — the home messages window, fed by the REAL conversations
 * API. No fabricated people: signed-out visitors see an honest invitation;
 * signed-in users see their actual conversations (or an honest empty state
 * when they have none). One-line previews, unread counts, time-ago stamps.
 */

type Conversation = {
  id: string;
  partner: { username: string; displayName: string | null; gradient: string | null };
  lastMessage: { body: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function MessagesPanel() {
  const { status } = useSession();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      fetch("/api/conversations", { cache: "no-store" })
        .then((res) => (res.ok ? (res.json() as Promise<{ ok: boolean; conversations?: Conversation[] }>) : null))
        .then((data) => {
          if (cancelled) return;
          if (data?.ok && data.conversations) setConversations(data.conversations);
          else setError(true);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [status]);

  return (
    <section
      aria-label="Messages"
      className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[26px] p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-medium text-[#2c2a48]">Messages</h2>
        <div className="flex items-center gap-1 text-[#8b8aa0]">
          <Link
            href="/conversations"
            aria-label="Search conversations"
            className="crystal-focus rounded-lg p-1.5 transition hover:bg-white/50"
          >
            <Icon name="search" size={14} />
          </Link>
          <Link
            href="/conversations"
            aria-label="Open messages"
            className="crystal-focus rounded-lg p-1.5 transition hover:bg-white/50"
          >
            <Icon name="dots" size={14} />
          </Link>
        </div>
      </div>

      <Link
        href="/conversations"
        className="crystal-focus mt-3 flex items-center gap-2 rounded-full bg-white/45 px-3.5 py-2 text-[12px] text-[#8b8aa0] ring-1 ring-white/60 transition hover:bg-white/70"
        aria-hidden
        tabIndex={-1}
      >
        <Icon name="search" size={12} />
        Search conversations…
      </Link>

      {/* The conversations — real data or honest states, never fake people */}
      <ul className="mt-3 flex flex-col gap-0.5">
        {status !== "authenticated" ? (
          <li className="py-6 text-center">
            <p className="text-[13px] font-medium text-[#44435e]">Your conversations live here.</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#8b8aa0]">
              Sign in to see the people you&apos;re talking with.
            </p>
            <Link
              href="/login"
              className="crystal-focus mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-white transition-transform hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, rgba(139,125,235,0.92), rgba(108,92,220,0.85))",
                boxShadow: "0 4px 16px rgba(120,100,230,0.35)",
              }}
            >
              Sign in
              <Icon name="forward" size={11} />
            </Link>
          </li>
        ) : conversations === null && !error ? (
          // Loading — quiet skeleton rows
          [0, 1, 2].map((row) => (
            <li key={row} className="flex items-center gap-3 px-1 py-2.5" aria-hidden>
              <span className="h-10 w-10 animate-pulse rounded-full bg-white/60" />
              <span className="flex-1">
                <span className="block h-2.5 w-24 animate-pulse rounded-full bg-white/60" />
                <span className="mt-1.5 block h-2 w-40 animate-pulse rounded-full bg-white/40" />
              </span>
            </li>
          ))
        ) : error ? (
          <li className="py-6 text-center text-[12.5px] text-[#8b8aa0]">
            Messages couldn&apos;t load just now.
            <Link href="/conversations" className="crystal-focus ml-1 font-semibold text-[#5b4bc4] hover:underline">
              Retry
            </Link>
          </li>
        ) : (conversations ?? []).length === 0 ? (
          <li className="py-6 text-center">
            <p className="text-[13px] font-medium text-[#44435e]">No conversations yet.</p>
            <p className="mt-1 text-[11.5px] text-[#8b8aa0]">
              When someone says hello, it lands here.
            </p>
          </li>
        ) : (
          (conversations ?? []).slice(0, 5).map((conversation) => {
            const name = conversation.partner.displayName ?? conversation.partner.username;
            const gradient = conversation.partner.gradient ?? "from-violet-400 to-indigo-500";
            return (
              <li key={conversation.id}>
                <Link
                  href={`/conversations?id=${conversation.id}`}
                  className="group flex items-center gap-3 rounded-2xl px-1.5 py-2.5 transition hover:bg-white/50"
                >
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-[13px] font-bold text-white ring-1 ring-white/70`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-[#2c2a48]">
                      {name}
                    </span>
                    <span className="block truncate text-[11.5px] text-[#8b8aa0]">
                      {conversation.lastMessage?.body ?? "A conversation waiting quietly."}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-[#8b8aa0]">
                      {timeAgo(conversation.updatedAt)}
                    </span>
                    {conversation.unread > 0 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(var(--mood-rgb),0.92)] px-1 text-[10px] font-bold text-white">
                        {conversation.unread}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
