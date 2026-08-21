"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  takeMeSomewhere,
  explore,
  addToJourney,
  reasonLabel,
  createExploreContext,
  AURI_SUGGESTIONS,
  type ExploreItem,
  type ExploreContext,
} from "@/lib/explore";
import DepthLayers from "@/components/effects/DepthLayers";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import GradientText from "@/components/ui/GradientText";

/* ── Message types ───────────────────────────────────────────────────── */

type MessageRole = "auri" | "user" | "system";

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  /** Optional discovery attached to this message */
  discovery?: ExploreItem;
  /** Optional suggested actions */
  actions?: { label: string; action: string }[];
  timestamp: number;
};

/* ── Auri's conversational responses ─────────────────────────────────── */

const AURI_RESPONSES: Record<string, string[]> = {
  calm: [
    "Then let's not search. Let's just… be here.",
    "I know a quiet place. Come with me.",
  ],
  curious: [
    "Curiosity is the best door.",
    "I've been saving something for this moment.",
  ],
  inspired: [
    "Let that fire lead somewhere.",
    "I know who might feed that feeling.",
  ],
  lost: [
    "Being lost is sometimes the point.",
    "I'll hold the light while you wander.",
  ],
  peaceful: [
    "Slow things are often the most beautiful.",
    "I found something gentle for you.",
  ],
  default: [
    "I'm listening.",
    "Take your time.",
    "There's no rush here.",
    "Let's see where this goes.",
  ],
};

function getAuriResponse(mood: string | null): string {
  const pool = AURI_RESPONSES[mood ?? ""] ?? AURI_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Suggestion chips ────────────────────────────────────────────────── */

function SuggestionChips({
  onSelect,
  visible,
}: {
  onSelect: (text: string) => void;
  visible: boolean;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  if (!visible) return null;

  const suggestions = AURI_SUGGESTIONS.slice(0, 6);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex flex-wrap justify-center gap-2"
    >
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.text)}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-gray-400 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
        >
          {s.text}
        </button>
      ))}
    </motion.div>
  );
}

/* ── Discovery card (inline) ─────────────────────────────────────────── */

function InlineDiscovery({ item }: { item: ExploreItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3"
    >
      <a
        href={item.destination}
        className="group block"
      >
        <GlassCard tone="soft" hoverLift className="p-4">
          {item.cover && (
            <div
              className={`mb-3 flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br ${item.cover.gradient} text-2xl`}
            >
              {item.cover.emoji}
            </div>
          )}
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              {item.type}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white/90 group-hover:text-white">
            {item.title}
          </h4>
          <p className="mt-1 text-[12px] text-gray-400/60 line-clamp-2">
            {item.description}
          </p>
          <p className="mt-2 text-[10px] font-medium text-emerald-400/45">
            {reasonLabel(item.reason)}
          </p>
        </GlassCard>
      </a>
    </motion.div>
  );
}

/* ── Chat bubble ─────────────────────────────────────────────────────── */

function ChatBubble({ message }: { message: Message }) {
  const isAuri = message.role === "auri";
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        {/* Auri label */}
        {isAuri && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <AuriOwl size={16} particles={false} state="curious" />
            <span className="text-[10px] font-medium text-emerald-400/50">Auri</span>
          </div>
        )}

        {/* Message text */}
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
            isUser
              ? "rounded-tr-md border border-[rgba(var(--mood-rgb),0.12)] bg-[rgba(var(--mood-rgb),0.06)] text-white/85"
              : isAuri
              ? "rounded-tl-md border border-white/[0.05] bg-white/[0.025] text-gray-300/80"
              : "border border-white/[0.03] bg-white/[0.01] text-gray-500/60 text-center text-[12px] italic"
          }`}
        >
          {message.text}
        </div>

        {/* Inline discovery */}
        {message.discovery && <InlineDiscovery item={message.discovery} />}
      </div>
    </motion.div>
  );
}

/* ── Main experience ─────────────────────────────────────────────────── */

export default function WithinExperience() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [context, setContext] = useState<ExploreContext>(() => createExploreContext());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, prefersReducedMotion]);

  // Opening message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "opening",
          role: "auri",
          text: "You don't have to know where you're going.",
          timestamp: Date.now(),
        },
      ]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setShowSuggestions(false);
      setIsTyping(true);

      // Auri "thinks" for a moment
      const thinkDelay = prefersReducedMotion ? 300 : 800;

      setTimeout(() => {
        // Generate Auri's response
        const lower = text.toLowerCase();
        let discovery: ExploreItem | null = null;

        // Check if this is a "take me somewhere" request
        if (lower.includes("take me") || lower.includes("surprise") || lower.includes("wander")) {
          const result = takeMeSomewhere(context);
          discovery = result.items[0] ?? null;

          addToJourney({
            id: discovery?.id ?? `chat-${Date.now()}`,
            title: discovery?.title ?? text,
            type: discovery?.type ?? "auri-moment",
            destination: discovery?.destination ?? "/within",
            reason: discovery ? reasonLabel(discovery.reason) : "Conversation led here",
            parentId: null,
            cover: discovery?.cover,
          });

          setContext((prev) => ({
            ...prev,
            seen: [...prev.seen, discovery?.id ?? ""],
            depth: prev.depth + 1,
          }));
        }

        // Detect mood from text
        const moodKeywords: Record<string, string> = {
          calm: "calm", peaceful: "peaceful", quiet: "calm", relaxed: "calm",
          curious: "curious", wonder: "curious", explore: "curious",
          inspired: "inspired", motivated: "inspired", fire: "inspired",
          lost: "lost", sad: "lost", wandering: "lost",
          beautiful: "peaceful", gentle: "calm",
        };

        let detectedMood: string | null = null;
        for (const [keyword, mood] of Object.entries(moodKeywords)) {
          if (lower.includes(keyword)) {
            detectedMood = mood;
            break;
          }
        }

        // Special responses
        let responseText: string;
        if (discovery) {
          responseText = getAuriResponse(detectedMood);
        } else if (lower.includes("who") || lower.includes("discover")) {
          responseText = "Let me find someone you should meet.";
          // Also generate a discovery
          const result = explore({ ...context, depth: context.depth + 1 }, 1);
          discovery = result.items[0] ?? null;
        } else if (lower.includes("story") || lower.includes("read")) {
          responseText = "Stories are my favorite doors.";
          const result = explore({ ...context, depth: context.depth + 1, interests: [...context.interests, "stories"] }, 1);
          discovery = result.items[0] ?? null;
        } else if (lower.includes("music") || lower.includes("play") || lower.includes("listen")) {
          responseText = "Let the sound find you.";
          const result = explore({ ...context, depth: context.depth + 1, interests: [...context.interests, "music"] }, 1);
          discovery = result.items[0] ?? null;
        } else {
          responseText = getAuriResponse(detectedMood);
        }

        const auriMsg: Message = {
          id: `auri-${Date.now()}`,
          role: "auri",
          text: responseText,
          discovery: discovery ?? undefined,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, auriMsg]);
        setIsTyping(false);
      }, thinkDelay);
    },
    [context, prefersReducedMotion]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#02030a] text-white">
      <DepthLayers preset="sanctuary" particles={4} stars={10} fog={0.3} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.04] bg-[#02030a]/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <AuriOwl size={28} particles={false} state="curious" />
          <div>
            <h1 className="font-display text-lg font-medium tracking-[-0.01em]">
              <GradientText>Within</GradientText>
            </h1>
            <p className="text-[11px] text-gray-500/60">Talk. Wonder. Wander.</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-gray-500/50"
            >
              <AuriOwl size={16} particles={false} state="thinking" />
              <span className="text-[12px] italic">thinking…</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion chips */}
      {showSuggestions && messages.length > 0 && (
        <div className="relative z-10 px-6 pb-4">
          <div className="mx-auto max-w-2xl">
            <SuggestionChips onSelect={handleSuggestion} visible={showSuggestions} />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 border-t border-white/[0.04] bg-[#02030a]/80 px-6 py-4 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Say something…"
            className="flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-[13px] text-white placeholder-gray-500/50 outline-none transition-all duration-300 focus:border-[rgba(var(--mood-rgb),0.3)] focus:bg-white/[0.05]"
            aria-label="Message Auri"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(var(--mood-rgb),0.8)] text-black transition-all duration-300 hover:bg-[rgba(var(--mood-rgb),1)] disabled:opacity-30 disabled:hover:bg-[rgba(var(--mood-rgb),0.8)]"
            aria-label="Send message"
          >
            <Icon name="forward" size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
