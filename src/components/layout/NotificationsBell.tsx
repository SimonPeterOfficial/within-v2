"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type NotificationEntry = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  href: string | null;
  actorName: string | null;
};

type State = "loading" | "ready" | "error";

/** Time formatting kept deliberately small — relative, warm, honest. */
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

/**
 * The notifications bell — a quiet door to the real notification queue.
 *
 * A small dot appears only when unread notifications exist. Opening the
 * panel fetches the live queue, marks everything seen, and links each
 * entry to its real destination. No invented activity, ever.
 */
export default function NotificationsBell() {
  const { status } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("loading");
  const [entries, setEntries] = useState<NotificationEntry[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const authenticated = status === "authenticated";

  // A light poll for the unread dot only — the panel fetches on open.
  useEffect(() => {
    if (!authenticated) return;
    let alive = true;
    const check = () => {
      void fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { ok: boolean; unread?: number } | null) => {
          if (alive && data?.ok) setHasUnread((data.unread ?? 0) > 0);
        })
        .catch(() => undefined);
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [authenticated]);

  const openPanel = useCallback(async () => {
    setOpen(true);
    setState("loading");
    try {
      const res = await fetch("/api/notifications");
      const data = (await res.json()) as { ok: boolean; entries?: NotificationEntry[]; error?: string };
      if (data.ok) {
        setEntries(data.entries ?? []);
        setState("ready");
        // Everything shown is now seen — the dot goes quiet.
        setHasUnread(false);
        void fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, []);

  // Escape closes; clicking outside closes; focus returns to the bell.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => buttonRef.current?.focus());
      }
    };
    const onClick = (event: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!authenticated) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : void openPanel())}
        aria-label={hasUnread ? "Notifications — new activity" : "Notifications"}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 shadow-dock backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white"
      >
        <Icon name="inbox" size={16} />
        {hasUnread && (
          <span
            aria-hidden
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Notifications"
            className="absolute bottom-12 right-0 z-[60] w-80 overflow-hidden rounded-modal border border-white/10 bg-[#0b0912]/95 shadow-soft backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                Notifications
              </p>
              <Link
                href="/home"
                onClick={() => setOpen(false)}
                className="text-[11px] text-gray-500 transition hover:text-white"
              >
                Home
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {state === "loading" && (
                <div className="space-y-3 p-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/[0.07]" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-white/[0.05]" />
                    </div>
                  ))}
                </div>
              )}

              {state === "error" && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-300">Couldn&apos;t reach your notifications.</p>
                  <button
                    type="button"
                    onClick={() => void openPanel()}
                    className="mt-2 text-xs text-emerald-400 transition hover:text-emerald-300"
                  >
                    Try again
                  </button>
                </div>
              )}

              {state === "ready" && entries.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-300">Nothing here yet.</p>
                  <p className="mt-1.5 text-xs text-gray-600">
                    When people follow you or creators you follow publish, it lands here.
                  </p>
                </div>
              )}

              {state === "ready" &&
                entries.map((entry) => {
                  const body = (
                    <>
                      <p className="text-[13px] leading-relaxed text-gray-200">{entry.message}</p>
                      <p className="mt-1 text-[11px] text-gray-600">{timeAgo(entry.createdAt)}</p>
                    </>
                  );
                  return entry.href ? (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/[0.04] px-4 py-3 transition last:border-b-0 hover:bg-white/[0.04]"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div key={entry.id} className="block border-b border-white/[0.04] px-4 py-3 last:border-b-0">
                      {body}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
