"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import EmptyState from "@/components/ui/states/EmptyState";
import { Skeleton } from "@/components/ui/skeletons";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

type Partner = {
  userId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  gradient: string | null;
};

type ConversationSummary = {
  id: string;
  partner: Partner;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  unread: number;
  updatedAt: string;
};

type MessageView = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type State = "loading" | "ready" | "error";

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d`;
}

function PartnerAvatar({ partner, size = 44 }: { partner: Partner; size?: number }) {
  const initial = (partner.displayName ?? partner.username).charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-black ${
        partner.gradient ?? "bg-linear-to-br from-purple-500 to-emerald-400"
      }`}
    >
      {partner.avatar ?? initial}
    </span>
  );
}

/**
 * Conversations — WithIn's own messaging.
 *
 * Mobile-first: the list and the thread are one surface that slides; on
 * desktop they sit side by side. Polling is the transport for this
 * generation (gentle interval, only while a thread is open) — the API
 * already exposes `?since=` cursors so a real-time transport can replace
 * polling without a rewrite.
 */
export default function MessagingExperience() {
  const { status, user } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const withParam = searchParams.get("with");

  const [state, setState] = useState<State>("loading");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [threadState, setThreadState] = useState<State>("loading");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [opening, setOpening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const authenticated = status === "authenticated";
  const myId = user?.id ?? null;

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = (await res.json()) as { ok: boolean; conversations?: ConversationSummary[] };
      if (data.ok) {
        setConversations(data.conversations ?? []);
        setState("ready");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, []);

  const loadThread = useCallback(async (conversationId: string) => {
    setThreadState("loading");
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = (await res.json()) as { ok: boolean; messages?: MessageView[]; partner?: Partner };
      if (data.ok) {
        setMessages(data.messages ?? []);
        setActivePartner(data.partner ?? null);
        setThreadState("ready");
        // Mark read so the unread dot rests.
        void fetch(`/api/conversations/${conversationId}`, { method: "PATCH" }).catch(() => undefined);
      } else {
        setThreadState("error");
      }
    } catch {
      setThreadState("error");
    }
  }, []);

  // Initial load; also handles ?with=<userId> — open (or create) that DM.
  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(() => void loadConversations(), 0);
    return () => clearTimeout(timer);
  }, [authenticated, loadConversations]);

  useEffect(() => {
    if (!authenticated || !withParam || state !== "ready" || opening) return;
    setOpening(true);
    void (async () => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: withParam }),
        });
        const data = (await res.json()) as { ok: boolean; conversationId?: string; error?: string };
        if (data.ok && data.conversationId) {
          setActiveId(data.conversationId);
          await loadThread(data.conversationId);
          await loadConversations();
        } else {
          toast(data.error ?? "Couldn't open that conversation.", "error");
        }
      } finally {
        setOpening(false);
      }
    })();
  }, [authenticated, withParam, state, opening, loadConversations, loadThread, toast]);

  // Gentle polling while a thread is open — new messages arrive without a
  // refresh. 6s is calm; the ?since= cursor keeps payloads tiny.
  useEffect(() => {
    if (!activeId || threadState !== "ready") return;
    const id = window.setInterval(() => {
      void (async () => {
        const last = messages[messages.length - 1];
        if (!last) return;
        try {
          const res = await fetch(`/api/conversations/${activeId}?since=${encodeURIComponent(last.createdAt)}`);
          const data = (await res.json()) as { ok: boolean; messages?: MessageView[] };
          if (data.ok && data.messages && data.messages.length > 0) {
            setMessages((prev) => [...prev, ...(data.messages ?? [])]);
          }
        } catch {
          /* polling is best-effort; the next tick retries */
        }
      })();
    }, 6000);
    return () => clearInterval(id);
  }, [activeId, threadState, messages]);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return;
    const body = draft;
    setDraft("");
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        // Append the sent message locally; the poll reconciles the rest.
        setMessages((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            senderId: myId ?? "",
            senderName: user?.name ?? "",
            body,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setDraft(body); // restore the draft — nothing is lost
        toast(data.error ?? "Message didn't send.", "error");
      }
    } catch {
      setDraft(body);
      toast("Couldn't reach WithIn. Try again.", "error");
    } finally {
      setSending(false);
    }
  };

  if (!authenticated) {
    return (
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
        <GlassCard tone="soft" className="p-10 text-center">
          <Icon name="send" size={28} className="mx-auto text-emerald-300/70" />
          <Text as="h1" variant="sectionTitle" className="mt-4">
            Conversations
          </Text>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
            Quiet, direct conversations with your people. Sign in to see yours.
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
    <section className="relative mx-auto w-full max-w-4xl px-4 pb-24 pt-24 sm:px-6">
      <header className="hidden sm:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/70">
          Conversations
        </p>
        <Text as="h1" variant="sectionTitle" className="mt-2">
          Quiet, direct, yours
        </Text>
      </header>

      <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ── Conversation list ── */}
        <GlassCard tone="soft" className={`overflow-hidden ${activeId ? "hidden lg:block" : ""}`}>
          <p className="border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            Conversations
          </p>

          {state === "loading" && (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state === "error" && (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-300">Couldn&apos;t load conversations.</p>
              <button
                type="button"
                onClick={() => void loadConversations()}
                className="mt-2 text-xs text-emerald-400 transition hover:text-emerald-300"
              >
                Try again
              </button>
            </div>
          )}

          {state === "ready" && conversations.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon="send"
                title="No conversations yet"
                description="Conversations start from a person. Visit a profile you appreciate and say hello."
                action={
                  <Button href="/discover" variant="outline" size="sm">
                    Find people
                  </Button>
                }
              />
            </div>
          )}

          {state === "ready" &&
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveId(conversation.id);
                  void loadThread(conversation.id);
                }}
                className={`flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.04] ${
                  activeId === conversation.id ? "bg-white/[0.06]" : ""
                }`}
              >
                <PartnerAvatar partner={conversation.partner} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {conversation.partner.displayName ?? conversation.partner.username}
                    </p>
                    <span className="shrink-0 text-[10px] text-gray-600">
                      {conversation.lastMessage ? timeAgo(conversation.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {conversation.lastMessage?.body ?? "Say hello."}
                  </p>
                </div>
                {conversation.unread > 0 && (
                  <span
                    aria-label={`${conversation.unread} unread`}
                    className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-bold text-black"
                  >
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
        </GlassCard>

        {/* ── Active thread ── */}
        <GlassCard tone="soft" className={`flex min-h-[60vh] flex-col overflow-hidden ${activeId ? "" : "hidden lg:flex"}`}>
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                icon="send"
                title="Pick a conversation"
                description="Your threads live here — quiet, direct, and only between the two of you."
              />
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(null);
                    setActivePartner(null);
                  }}
                  aria-label="Back to conversations"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/5 hover:text-white lg:hidden"
                >
                  <Icon name="back" size={16} />
                </button>
                {activePartner && (
                  <>
                    <PartnerAvatar partner={activePartner} size={36} />
                    <Link
                      href={`/profile/${activePartner.username}`}
                      className="truncate text-sm font-semibold text-white transition hover:text-emerald-200"
                    >
                      {activePartner.displayName ?? activePartner.username}
                    </Link>
                  </>
                )}
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
                {threadState === "loading" && (
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <Skeleton key={index} className="h-10 w-2/3" />
                    ))}
                  </div>
                )}
                {threadState === "error" && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Couldn&apos;t load this conversation.
                  </p>
                )}
                {threadState === "ready" &&
                  messages.map((message) => {
                    const mine = message.senderId === myId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? "bg-linear-to-br from-purple-500 to-emerald-400 text-black"
                              : "border border-white/[0.06] bg-white/[0.05] text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <p className={`mt-1 text-[10px] ${mine ? "text-black/50" : "text-gray-600"}`}>
                            {timeAgo(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Composer */}
              <div className="border-t border-white/[0.06] p-3">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                  className="flex items-end gap-2"
                >
                  <label htmlFor="message-draft" className="sr-only">
                    Your message
                  </label>
                  <textarea
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    maxLength={4000}
                    placeholder="Write something true…"
                    className="max-h-32 flex-1 resize-none rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
                  />
                  <Button type="submit" size="sm" disabled={!draft.trim() || sending} ariaLabel="Send message">
                    <Icon name="send" size={14} />
                  </Button>
                </form>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
