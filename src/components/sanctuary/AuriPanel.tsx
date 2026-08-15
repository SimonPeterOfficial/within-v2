"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { auriGreeting, auriReply, TIME_GREETINGS, type AuriContext, type AuriState } from "@/lib/auri";
import { getMood, moods } from "@/lib/mood";
import { moodGlow } from "@/lib/design";
import Icon from "@/components/ui/Icon";
import AuriOwl from "@/components/sanctuary/AuriOwl";

type Message = {
  id: number;
  role: "auri" | "user";
  text: string;
};

type AuriPanelProps = {
  context: AuriContext;
  moodId: string | null;
  onMoodSelect: (id: string | null) => void;
  onClose: () => void;
  /** Reports Auri's presence state as the conversation moves (thinking, responding…). */
  onPresenceChange?: (state: AuriState) => void;
};

let messageId = 0;
const nextId = () => ++messageId;

/** Auri's reply bubble — mounts fresh, "thinks" a moment before answering. */
function AuriBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-gray-200 backdrop-blur"
    >
      {text}
    </motion.div>
  );
}

/** The user's message — a soft mood-tinted glass bubble on the right. */
function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[85%] self-end rounded-2xl rounded-tr-md border border-[rgba(var(--mood-rgb),0.35)] bg-[rgba(var(--mood-rgb),0.14)] px-4 py-3 text-sm leading-relaxed text-white backdrop-blur"
    >
      {text}
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur"
      aria-label="Auri is thinking"
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: moodGlow(0.9) }}
        />
      ))}
    </motion.div>
  );
}

/**
 * Auri's chamber — an intimate glass conversation panel, deliberately NOT a
 * messaging app. One voice, a contextual greeting, mood that shapes the
 * light, and a quiet note that everything stays in the browser.
 */
export default function AuriPanel({ context, moodId, onMoodSelect, onClose, onPresenceChange }: AuriPanelProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const greeting = useMemo(() => auriGreeting(context), [context]);
  const selectedMood = getMood(moodId);
  const statusLine = `${TIME_GREETINGS[context.period]} — here with you.`;

  // Open with a contextual greeting — the panel always feels like a first
  // word. Captured once at mount: the conversation must never be reset when
  // the context evolves (mood chips, the hour turning) while she is open.
  // Deferred (async) so the effect body never sets state synchronously.
  const greetingRef = useRef(greeting);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMessages([{ id: nextId(), role: "auri", text: greetingRef.current }]);
      inputRef.current?.focus();
      onPresenceChange?.("greeting");
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest words in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, thinking, prefersReducedMotion]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setMessages((current) => [...current, { id: nextId(), role: "user", text }]);
    setInput("");
    setThinking(true);
    onPresenceChange?.("thinking");
    // Auri thinks for a heartbeat, then answers from the local engine.
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: nextId(), role: "auri", text: auriReply(text, context) }
      ]);
      setThinking(false);
      onPresenceChange?.("responding");
    }, 900 + Math.random() * 500);
  };

  const handleMood = (id: string) => {
    const next = moodId === id ? null : id;
    onMoodSelect(next);
    const mood = getMood(next);
    if (mood) {
      setMessages((current) => [
        ...current,
        { id: nextId(), role: "auri", text: `Tuned the light to ${mood.label.toLowerCase()} — ${mood.line}` }
      ]);
    }
  };

  const handleVoice = () => {
    setMessages((current) => [
      ...current,
      {
        id: nextId(),
        role: "auri",
        text: "My voice is still waking up. Write to me for now — or tap a mood and I'll set the light."
      }
    ]);
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Auri"
      aria-modal="false"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-[min(30rem,64dvh)] w-[min(23rem,calc(100vw-1.75rem))] flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0a0912]/85 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_40px_rgba(0,0,0,0.45)]"
    >
      {/* Top hairline light — glass catching the moon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${moodGlow(0.5)}, transparent)` }}
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="relative">
          <AuriOwl size={42} glow={false} particles={false} className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-medium tracking-tight text-white">Auri</p>
          <p className="truncate text-[11px] text-gray-500">{statusLine}</p>
        </div>
        {/* Memory indicator — honest: everything stays in this browser */}
        <span
          title="Auri keeps this conversation in your browser — nothing leaves."
          className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:inline-flex"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: moodGlow(0.8) }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: moodGlow(1) }}
            />
          </span>
          remembering
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Auri"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-white/25 hover:text-white"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* ── Conversation ── */}
      <div
        ref={scrollRef}
        className="auri-scroll flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        {messages.map((message) =>
          message.role === "auri" ? (
            <AuriBubble key={message.id} text={message.text} />
          ) : (
            <UserBubble key={message.id} text={message.text} />
          )
        )}
        <AnimatePresence>{thinking && <ThinkingDots />}</AnimatePresence>
      </div>

      {/* ── Mood chips — the light shapes the conversation ── */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {moods.map((mood) => {
          const active = moodId === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => handleMood(mood.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition duration-300 ${
                active
                  ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-white"
              }`}
            >
              <span className="mr-1" aria-hidden>
                {mood.emoji}
              </span>
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* ── Composer ── */}
      <div className="border-t border-white/10 px-4 pb-3 pt-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          {/* Voice placeholder — a real interaction, clearly marked */}
          <button
            type="button"
            onClick={handleVoice}
            aria-label="Voice message — not yet available"
            title="Voice is still waking up"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-white/25 hover:text-white"
          >
            <Icon name="mic" size={16} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => onPresenceChange?.("listening")}
            onBlur={() => {
              if (!thinking) onPresenceChange?.("idle");
            }}
            placeholder="Write to Auri…"
            aria-label="Message Auri"
            autoComplete="off"
            className="h-10 min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none backdrop-blur transition placeholder:text-gray-600 focus:border-[rgba(var(--mood-rgb),0.5)] focus:bg-white/[0.08]"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            style={{
              backgroundImage: `linear-gradient(135deg, ${moodGlow(0.95)}, #34d399)`
            }}
          >
            <Icon name="send" size={16} />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] tracking-wide text-gray-600">
          Auri&apos;s words stay in this browser. {selectedMood ? `The light answers ${selectedMood.label.toLowerCase()}.` : ""}
        </p>
      </div>
    </motion.div>
  );
}
