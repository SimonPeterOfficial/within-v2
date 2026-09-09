"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEnvironment } from "@/lib/environment";
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
import { fireRipple } from "@/lib/ripple";
import { recordExplorationDepth, markWithinVisited, recordDiscovery, getUniverseState } from "@/lib/universe/state";
import { getAuriContextualMessage } from "@/lib/universe/events";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import Icon from "@/components/ui/Icon";
import WorldEnvironment from "@/components/within/crystal/WorldEnvironment";
import type { AuriState } from "@/lib/auri";

/* ── Message types ───────────────────────────────────────────────────── */

type MessageRole = "auri" | "user" | "system";

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  /** Optional discovery attached to this message — a door */
  discovery?: ExploreItem;
  /** Optional door to another place */
  door?: { label: string; destination: string; emoji: string };
  timestamp: number;
};

/* ── Auri's conversational responses — curated, not pattern-matched ──── */

const AURI_RESPONSES: Record<string, string[]> = {
  calm: [
    "Then let's not search. Let's just… be here.",
    "I know a quiet place. Come with me.",
    "The light is slower here. Stay as long as you need.",
    "Breathe. The room breathes with you.",
  ],
  curious: [
    "Curiosity is the best door.",
    "I've been saving something for this moment.",
    "Follow that thread. It leads somewhere good.",
    "You're asking the right question.",
    "Let's go a little deeper.",
  ],
  inspired: [
    "Let that fire lead somewhere.",
    "I know who might feed that feeling.",
    "When you're ready, there's a door open.",
    "Hold onto that — it's rare.",
  ],
  lost: [
    "Being lost is sometimes the point.",
    "I'll hold the light while you wander.",
    "There's no wrong path here — only different ones.",
    "Sometimes not knowing is the beginning.",
  ],
  peaceful: [
    "Slow things are often the most beautiful.",
    "I found something gentle for you.",
    "Let the world be quiet around you for a while.",
    "This is yours. Take it.",
  ],
  default: [
    "I'm listening.",
    "Take your time.",
    "There's no rush here.",
    "Let's see where this goes.",
    "I hear you.",
    "Stay for a moment.",
    "That's worth sitting with.",
  ],
};

function getAuriResponse(mood: string | null): string {
  const pool = AURI_RESPONSES[mood ?? ""] ?? AURI_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Ambient whispers — things Auri says between conversations ──────── */

const AMBIENT_WHISPERS = [
  "There's something nearby.",
  "You've been here before.",
  "Want to wander somewhere unexpected?",
  "I found a quieter place.",
  "The light is different tonight.",
  "There's a door you haven't opened.",
  "This room remembers you.",
  "You don't have to know where you're going.",
  "Stay as long as you need.",
  "There's more Within.",
];

function getRandomWhisper(): string {
  return AMBIENT_WHISPERS[Math.floor(Math.random() * AMBIENT_WHISPERS.length)];
}

/* ── Suggestion chips — ambient, not pushy ────────────────────────────── */

function AmbientSuggestions({
  onSelect,
  visible,
}: {
  onSelect: (text: string) => void;
  visible: boolean;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  const suggestions = useMemo(() => {
    const hour = new Date().getHours();
    const start = hour % Math.max(1, AURI_SUGGESTIONS.length - 4);
    return AURI_SUGGESTIONS.slice(start, start + 4);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap justify-center gap-2"
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.text)}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
          className="rounded-full border border-white/70 bg-white/45 px-4 py-2 text-[11px] font-medium text-[#6f6e88] transition-all duration-500 hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-white/75 hover:text-[#2c2a48]"
        >
          {s.text}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ── Discovery door (inline in a message) ─────────────────────────────── */

function DiscoveryDoor({ item }: { item: ExploreItem }) {
  const prefersReducedMotion = useReducedMotionSafe();

  const handleClick = (e: React.MouseEvent) => {
    fireRipple(e);
    addToJourney({
      id: item.id,
      title: item.title,
      type: item.type,
      destination: item.destination,
      reason: reasonLabel(item.reason),
      parentId: null,
      cover: item.cover,
    });
  };

  return (
    <motion.a
      href={item.destination}
      onClick={handleClick}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group mt-3 block overflow-hidden rounded-xl border border-white/60 bg-white/45 transition-all duration-500 hover:border-[rgba(var(--mood-rgb),0.35)] hover:bg-white/70"
    >
      {item.cover && (
        <div
          className={`flex h-14 w-full items-center justify-center bg-linear-to-br ${item.cover.gradient} text-2xl`}
          style={{ opacity: 0.9 }}
        >
          {item.cover.emoji}
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#5f5e74] ring-1 ring-white/80">
            {item.type}
          </span>
        </div>
        <h4 className="mt-1.5 text-[13px] font-medium text-[#2c2a48] group-hover:text-[#232136]">
          {item.title}
        </h4>
        <p className="mt-1 text-[11px] text-[#6f6e88] line-clamp-2">
          {item.description}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#5b4bc4] transition-colors">
          <span>Open this door</span>
          <Icon name="forward" size={8} />
        </div>
      </div>
    </motion.a>
  );
}

/* ── Navigation door (inline link to another place) ───────────────────── */

function NavDoor({ door }: { door: NonNullable<Message["door"]> }) {
  return (
    <a
      href={door.destination}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[11px] font-medium text-[#5f5e74] transition-all duration-300 hover:border-[rgba(var(--mood-rgb),0.35)] hover:bg-white/70 hover:text-[#2c2a48]"
    >
      <span>{door.emoji}</span>
      <span>{door.label}</span>
      <Icon name="forward" size={8} />
    </a>
  );
}

/* ── Message bubble — floating in space ──────────────────────────────── */

function MessageBubble({ message, auriState }: { message: Message; auriState: AuriState }) {
  const isAuri = message.role === "auri";
  const isUser = message.role === "user";
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        {isAuri && (
          <div className="mb-2 flex items-center gap-2">
            <AuriOwl size={18} particles={false} state={auriState} />
            <span className="text-[10px] font-medium tracking-wide text-[#7c6ce0]">Auri</span>
          </div>
        )}

        {/* The crystal room — Auri speaks as ink on light; the user's words
            carry a soft mood aura so ownership reads at a glance. */}
        <div
          className={`text-[13px] leading-relaxed ${
            isUser
              ? "ml-auto max-w-[85%] rounded-2xl bg-white/70 px-5 py-3.5 text-[#2c2a48] ring-1 ring-white/80 backdrop-blur"
              : isAuri
              ? "max-w-[92%] font-display text-[15px] italic leading-relaxed text-[#3d3a5e]"
              : "text-center text-[12px] italic text-[#8b8aa0]"
          }`}
        >
          {message.text}
        </div>

        {message.discovery && <DiscoveryDoor item={message.discovery} />}
        {message.door && <NavDoor door={message.door} />}
      </div>
    </motion.div>
  );
}

/* ── Auri ambient whisper — appears between conversations ─────────────── */

function AmbientWhisper({ visible }: { visible: boolean }) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [whisper, setWhisper] = useState<string | null>(null);
  const whisperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whisperHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
      if (whisperHideRef.current) clearTimeout(whisperHideRef.current);
      const frame = requestAnimationFrame(() => setWhisper(null));
      return () => cancelAnimationFrame(frame);
    }
    whisperTimerRef.current = setTimeout(() => {
      setWhisper(getRandomWhisper());
      whisperHideRef.current = setTimeout(() => setWhisper(null), 6000);
    }, 12000);
    return () => {
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
      if (whisperHideRef.current) clearTimeout(whisperHideRef.current);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {whisper && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute bottom-28 left-0 right-0 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-4 py-2 text-[11px] italic text-[#6f6e88] backdrop-blur-sm">
            <AuriOwl size={12} particles={false} state="sleeping" />
            {whisper}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Portal ripple — the door opening effect ─────────────────────────── */

function PortalRipple({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotionSafe();

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none fixed inset-0 z-[5]"
          aria-hidden
        >
          {/* Central light bloom */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 2.5], opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.3),transparent_70%)]"
          />
          {/* Concentric rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: [0, 1 + ring * 0.5], opacity: [0.3, 0] }}
              transition={{ duration: 1 + ring * 0.3, delay: ring * 0.1, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
              style={{ width: `${ring * 120}px`, height: `${ring * 120}px` }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main experience — the quiet room ─────────────────────────────────── */

export default function WithinExperience() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { moodId } = useEnvironment();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [context, setContext] = useState<ExploreContext>(() =>
    createExploreContext({ mood: moodId })
  );
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [auriState, setAuriState] = useState<AuriState>("idle");
  const [idle, setIdle] = useState(true);
  const [portalActive, setPortalActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  // Mark /within as visited and record depth
  useEffect(() => {
    markWithinVisited();
    recordExplorationDepth(context.depth);
  }, [context.depth]);

  // Opening message — the room greets you, contextually
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAuriState("greeting"));

    // Check if there's a contextual Auri message based on universe state
    const state = getUniverseState();
    const contextualMsg = getAuriContextualMessage(state);

    const timer = setTimeout(() => {
      setMessages([
        {
          id: "opening",
          role: "auri",
          text: contextualMsg ?? "You're inside now. The room knows you're here.",
          timestamp: Date.now(),
        },
      ]);
      setTimeout(() => setAuriState("observing"), 1500);
    }, 1200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  // Reset idle timer on user activity
  const resetIdle = useCallback(() => {
    requestAnimationFrame(() => setIdle(false));
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        setIdle(true);
        setAuriState("sleeping");
      });
    }, 30000);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setIdle(false));
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      resetIdle();
      setAuriState("listening");

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

      const thinkDelay = prefersReducedMotion ? 400 : 1000;

      setTimeout(() => {
        setAuriState("thinking");

        setTimeout(() => {
          const lower = text.toLowerCase();
          let discovery: ExploreItem | null = null;
          let door: Message["door"] = undefined;

          // "Take me somewhere" / "surprise me" / "wander"
          if (
            lower.includes("take me") ||
            lower.includes("surprise") ||
            lower.includes("wander") ||
            lower.includes("show me something") ||
            lower.includes("what's within")
          ) {
            // Portal effect
            setPortalActive(true);
            fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
            setTimeout(() => setPortalActive(false), 2000);

            const result = takeMeSomewhere(context);
            discovery = result.items[0] ?? null;

            if (discovery) {
              recordDiscovery(discovery.type);
              addToJourney({
                id: discovery.id,
                title: discovery.title,
                type: discovery.type,
                destination: discovery.destination,
                reason: reasonLabel(discovery.reason),
                parentId: null,
                cover: discovery.cover,
              });
            }

            setContext((prev) => ({
              ...prev,
              seen: [...prev.seen, discovery?.id ?? ""],
              depth: prev.depth + 1,
            }));
          }

          // Detect mood
          const moodKeywords: Record<string, string> = {
            calm: "calm",
            peaceful: "peaceful",
            quiet: "calm",
            curious: "curious",
            wonder: "curious",
            explore: "curious",
            inspired: "inspired",
            motivated: "inspired",
            lost: "lost",
            sad: "lost",
            beautiful: "peaceful",
            gentle: "calm",
          };

          let detectedMood: string | null = null;
          for (const [keyword, mood] of Object.entries(moodKeywords)) {
            if (lower.includes(keyword)) {
              detectedMood = mood;
              break;
            }
          }

          // Build response with optional door
          let responseText: string;

          if (discovery) {
            responseText = getAuriResponse(detectedMood);
          } else if (lower.includes("who") || lower.includes("discover")) {
            responseText = "Let me find someone you should meet.";
            const result = explore(
              { ...context, depth: context.depth + 1 },
              1
            );
            discovery = result.items[0] ?? null;
          } else if (lower.includes("story") || lower.includes("read")) {
            responseText = "Stories are my favorite doors.";
            const result = explore(
              {
                ...context,
                depth: context.depth + 1,
                interests: [...context.interests, "stories"],
              },
              1
            );
            discovery = result.items[0] ?? null;
          } else if (
            lower.includes("music") ||
            lower.includes("play") ||
            lower.includes("listen")
          ) {
            responseText = "Let the sound find you.";
            door = { label: "The music room", destination: "/music", emoji: "🎵" };
          } else if (lower.includes("book") || lower.includes("library")) {
            responseText = "Some pages understand you.";
            door = { label: "The library", destination: "/books", emoji: "📚" };
          } else if (lower.includes("community") || lower.includes("people")) {
            responseText = "There are kindred souls nearby.";
            door = {
              label: "Quiet rooms",
              destination: "/communities",
              emoji: "🤝",
            };
          } else if (lower.includes("photo") || lower.includes("image")) {
            responseText = "Light, held still for a moment.";
            door = {
              label: "The gallery",
              destination: "/photography",
              emoji: "📷",
            };
          } else if (
            lower.includes("original") ||
            lower.includes("film") ||
            lower.includes("movie")
          ) {
            responseText = "The originals are waiting.";
            door = {
              label: "WithIn Originals",
              destination: "/originals",
              emoji: "🎬",
            };
          } else if (lower.includes("journey") || lower.includes("map")) {
            responseText = "Your constellation is forming.";
            door = {
              label: "Your journey",
              destination: "/journey",
              emoji: "✨",
            };
          } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
            responseText = "Hello. I'm glad you're here.";
          } else if (lower.includes("thank")) {
            responseText = "Always. I'll be here when you need me.";
          } else if (lower.includes("who are you") || lower.includes("what are you")) {
            responseText = "I'm Auri — the guardian who keeps the light here. I watch how you feel and keep the corners ready.";
          } else {
            responseText = getAuriResponse(detectedMood);
          }

          const auriMsg: Message = {
            id: `auri-${Date.now()}`,
            role: "auri",
            text: responseText,
            discovery: discovery ?? undefined,
            door: door ?? undefined,
            timestamp: Date.now(),
          };

          setMessages((prev) => [...prev, auriMsg]);
          setIsTyping(false);
          setAuriState("responding");

          setTimeout(() => setAuriState("observing"), 2000);
        }, 600);
      }, thinkDelay);
    },
    [context, prefersReducedMotion, resetIdle]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const showAmbientWhisper = idle && messages.length > 0 && !isTyping;

  return (
    <div className="crystal-world relative flex min-h-screen flex-col overflow-hidden text-[#232136]">
      {/* Living atmosphere — the luminous crystal world, softer in this room */}
      <WorldEnvironment variant="calm" />

      {/* Soft light vignette — the room feels held, gently */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(235,235,248,0.4)_100%)]"
      />

      {/* Portal ripple effect */}
      <PortalRipple active={portalActive} />

      {/* The room — no header chrome, just space */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Opening — Auri's presence in the room */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center py-16"
              >
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }
                  }
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AuriOwl size={64} particles state={auriState} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-6 text-center text-[13px] italic text-[#8b8aa0]"
                >
                  Auri is here.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages — floating in space */}
          {messages.length > 0 && (
            <div className="space-y-5">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} auriState={auriState} />
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-[#8b8aa0]"
                >
                  <AuriOwl size={16} particles={false} state="thinking" />
                  <span className="text-[11px] italic">thinking…</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Ambient whisper — appears when the room is quiet */}
      <AmbientWhisper visible={showAmbientWhisper} />

      {/* Suggestions — ambient, not pushy */}
      {showSuggestions && messages.length > 0 && (
        <div className="relative z-10 px-6 pb-4">
          <div className="mx-auto max-w-xl">
            <AmbientSuggestions
              onSelect={handleSuggestion}
              visible={showSuggestions}
            />
          </div>
        </div>
      )}

      {/* Input — a listening surface, not a form. No bar, no border across
          the room: the field floats on the dark and warms when attended. */}
      <div className="relative z-10 px-6 pb-8">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(var(--mood-rgb),0.05),transparent_70%)] opacity-0 transition-opacity duration-700 focus-within:opacity-100"
            />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                resetIdle();
              }}
              onFocus={resetIdle}
              placeholder={messages.length <= 1 ? "Tell Auri what you're feeling…" : "Whisper something…"}
              className="relative w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-[13px] text-[#2c2a48] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder-[#8b8aa0] outline-none backdrop-blur-md transition-all duration-500 focus:border-[rgba(var(--mood-rgb),0.45)] focus:bg-white/80 focus:placeholder-[#6f6e88]"
              aria-label="Message Auri"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#5b4bc4] ring-1 ring-white/80 transition-all duration-300 hover:bg-white/90 disabled:opacity-30"
            aria-label="Send message"
          >
            <Icon name="forward" size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
