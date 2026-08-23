"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";
import {
  getUniverseState,
  recordAuriEncounter,
} from "@/lib/universe/state";
import { getAuriContextualMessage } from "@/lib/universe/events";
import AuriOwl from "@/components/sanctuary/AuriOwl";

/**
 * AuriEncounter — rare atmospheric moments where Auri appears briefly.
 *
 * Unlike the normal Auri panel (AuriOrb), an encounter is:
 *   - Rare (happens maybe once every few sessions)
 *   - Atmospheric (not a conversation)
 *   - Brief (appears, says something, disappears)
 *   - Meaningful (the message is contextual to the user's journey)
 *
 * An encounter may appear as:
 *   - A small owl silhouette with a floating sentence
 *   - A distant light that resolves into a whisper
 *   - A tiny portal that offers a direction
 *
 * Some encounters lead somewhere. Others simply create atmosphere.
 */

type EncounterVisual = "silhouette" | "light" | "portal" | "constellation" | "whisper";

type AuriEncounterProps = {
  /** Whether the encounter should be active */
  active?: boolean;
  /** The message Auri whispers */
  message: string;
  /** Where the encounter leads (if any) */
  destination?: string;
  /** The visual variant */
  visual?: EncounterVisual;
  /** Callback when the encounter is dismissed */
  onDismiss?: () => void;
  /** Callback when the encounter leads somewhere */
  onNavigate?: (destination: string) => void;
};

const ENCOUNTER_COOLDOWN_KEY = "within:auri-encounter:cooldown";
const ENCOUNTER_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

function isInEncounterCooldown(): boolean {
  try {
    const raw = localStorage.getItem(ENCOUNTER_COOLDOWN_KEY);
    if (!raw) return false;
    const lastTime = Number(raw);
    return Date.now() - lastTime < ENCOUNTER_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function recordEncounterTime() {
  try {
    localStorage.setItem(ENCOUNTER_COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function useAuriEncounter() {
  const [encounter, setEncounter] = useState<{
    message: string;
    destination?: string;
    visual: EncounterVisual;
  } | null>(null);

  useEffect(() => {
    if (isInEncounterCooldown()) return;

    const state = getUniverseState();
    const contextualMessage = getAuriContextualMessage(state);

    if (contextualMessage) {
      const timer = setTimeout(() => {
        setEncounter({
          message: contextualMessage,
          destination: state.doorDiscovered ? "/explore" : undefined,
          visual: state.betweenVisited ? "portal" : "silhouette",
        });
        recordEncounterTime();
      }, 5000); // Appear after 5 seconds of page load

      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => setEncounter(null), []);

  const navigate = useCallback((dest: string) => {
    setEncounter(null);
    fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    window.location.href = dest;
  }, []);

  return { encounter, dismiss, navigate };
}

export default function AuriEncounter({
  active = true,
  message,
  destination,
  visual = "silhouette",
  onDismiss,
  onNavigate,
}: AuriEncounterProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    // Appear after a quiet delay
    const appearTimer = setTimeout(() => setVisible(true), 800);

    // Auto-dismiss after 8 seconds
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 800);
    }, 8000);

    return () => {
      clearTimeout(appearTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 500);
  }, [onDismiss]);

  const handleNavigate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    recordAuriEncounter();
    if (destination) {
      onNavigate?.(destination);
    } else {
      setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 500);
    }
  }, [destination, onNavigate, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="fixed inset-0 z-[75] flex items-end justify-center pb-32 sm:items-center sm:pb-0"
          role="status"
          aria-live="polite"
        >
          {/* Backdrop — extremely subtle */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            onClick={handleDismiss}
          />

          {/* The encounter */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : visual === "portal"
                ? { opacity: 0, scale: 0.8, filter: "blur(12px)" }
                : visual === "light"
                ? { opacity: 0, y: -20, filter: "blur(8px)" }
                : { opacity: 0, y: 20, filter: "blur(8px)" }
            }
            animate={
              exiting
                ? { opacity: 0, y: -10, filter: "blur(4px)" }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-6 max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Auri presence */}
            {(visual === "silhouette" || visual === "constellation") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4 flex justify-center"
              >
                <AuriOwl size={36} state="greeting" />
              </motion.div>
            )}

            {visual === "portal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-4 flex justify-center"
              >
                <div className="h-16 w-16 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm" />
              </motion.div>
            )}

            {visual === "light" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="mb-4 flex justify-center"
              >
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
              </motion.div>
            )}

            {/* The whisper */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-display text-[15px] leading-relaxed text-white/60 italic"
            >
              {message}
            </motion.p>

            {/* Action */}
            {destination && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                type="button"
                onClick={handleNavigate}
                className="mt-4 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] font-medium text-gray-400/60 transition-all duration-300 hover:border-[rgba(var(--mood-rgb),0.15)] hover:bg-white/[0.05] hover:text-gray-300/80"
              >
                Follow
              </motion.button>
            )}

            {/* Dismiss */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              type="button"
              onClick={handleDismiss}
              className="mt-3 block text-[10px] text-white/15 transition-colors hover:text-white/30"
            >
              Not now
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
