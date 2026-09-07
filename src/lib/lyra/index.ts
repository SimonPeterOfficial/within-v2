/**
 * LYRA — Within Intelligence (foundation).
 *
 * Lyra is the underlying intelligence architecture of WithIn. Auri is not
 * Lyra: Auri is the human-facing presence through which Lyra's approved
 * outputs reach the user. This module establishes the real seams Lyra will
 * grow along — context assembly, world state, memory contracts, policies,
 * approved actions — without pretending any autonomous intelligence exists
 * today. Every function is deterministic, least-privilege, and honest.
 *
 *   WITHIN (the world)
 *     └── LYRA (this module tree — context, state, memory, policy, actions)
 *           └── AURI (the presence — lib/auri.ts, components/auri/)
 *
 * What Lyra exposes TODAY (safe, real, no surveillance):
 *   • current WithIn state       → observeWorldState()
 *   • current real-world time    → observeTime()   (lib/within-time.ts)
 *   • explicitly permitted user context → observeUserContext()
 *   • event context              → observeEvents()
 *   • platform context           → observePlatform()
 *
 * What Lyra will expose LATER (declared, not faked):
 *   • orchestration of approved actions (policy-gated)
 *   • insight generation over a real memory backend
 *   • evaluation of its own suggestions
 */

import { getWithinTime, type WithinTimeContext } from "@/lib/within-time";
import { CAPABILITY_REGISTRY, getCapability, effectiveAutonomy, type Capability, type AutonomyLevel } from "@/lib/lyra/capabilities";
import { evaluateAction, describeDecision, type LyraActionProposal, type LyraActionDecision, type ActingUser } from "@/lib/lyra/actions";

export { CAPABILITY_REGISTRY, getCapability, effectiveAutonomy, evaluateAction, describeDecision };
export type { Capability, AutonomyLevel, LyraActionProposal, LyraActionDecision, ActingUser };

/* ── Context — what Lyra may know, nothing more ──────────────────────── */

/**
 * The context Lyra is permitted to read. Every field is either public
 * platform state or an explicit, local-only user choice. Nothing here is
 * inferred, nothing sensitive, nothing hidden: least privilege by design.
 */
export type LyraUserContext = {
  /** The user's chosen mood, if they set one — never an inferred emotion. */
  moodId: string | null;
  /** Interests the user explicitly picked during onboarding. */
  interests: string[];
  /** Whether a session exists (boolean only — never identity data here). */
  isAuthenticated: boolean;
  /** The current route — public navigation state. */
  pathname: string;
};

export type LyraContext = {
  platform: "web";
  time: WithinTimeContext;
  user: LyraUserContext | null;
};

/* ── World state — what WithIn looks like right now ──────────────────── */

export type LyraWorldState = {
  /** Which room of the universe is open. */
  room: string;
  /** The hour's period, when known. */
  period: WithinTimeContext["period"];
  /** The live mood light, if any. */
  moodId: string | null;
};

/* ── Approved actions — the contract future orchestration must satisfy ── */

export type LyraAction = {
  id: string;
  /** What the action does, in human language. */
  description: string;
  /** The policy gate an orchestrator must pass before running this. */
  requires: "none" | "user-consent" | "moderator" | "never-autonomous";
  run: () => void | Promise<void>;
};

/* ── Observers — the safe, real capabilities ─────────────────────────── */

/** The platform context — always available, never user-specific. */
export function observePlatform(): { platform: "web" } {
  return { platform: "web" };
}

/** Real-world time through Within Time. Null fields during SSR. */
export function observeTime(now: Date = new Date()): WithinTimeContext {
  return getWithinTime(now);
}

/**
 * Assembles the full context from explicitly permitted inputs.
 * `user` is null whenever no real context is handed in — Lyra never
 * guesses who is present.
 */
export function observeContext(user?: Partial<LyraUserContext> | null): LyraContext {
  return {
    platform: "web",
    time: observeTime(),
    user:
      user && (user.moodId != null || user.isAuthenticated != null || user.pathname != null)
        ? {
            moodId: user.moodId ?? null,
            interests: Array.isArray(user.interests) ? user.interests : [],
            isAuthenticated: user.isAuthenticated === true,
            pathname: user.pathname ?? "/",
          }
        : null,
  };
}

/** The current world state — deterministic from the context. */
export function observeWorldState(context: LyraContext): LyraWorldState {
  return {
    room: context.user?.pathname?.split("/")[1] || "landing",
    period: context.time.period,
    moodId: context.user?.moodId ?? null,
  };
}

/** Event context — the real-calendar event, when one exists. */
export function observeEvents(context: LyraContext): WithinTimeContext["event"] {
  return context.time.event;
}

/* ── Memory contract — the seam a real backend will satisfy ────────────
 * Today memory lives locally (lib/memory.ts). When a server-backed memory
 * arrives, implement this interface against it and every Lyra consumer
 * keeps working. Lyra never reads storage directly. */

export interface LyraMemory {
  get<T>(scope: "preferences" | "content" | "journey", key: string): Promise<T | null>;
  set<T>(scope: "preferences" | "content" | "journey", key: string, value: T): Promise<void>;
}

/* ── Policy — what Lyra may never do, stated in code ─────────────────── */

export const LYRA_POLICIES = {
  /** No hidden data collection, ever. */
  noCovertCollection: true,
  /** Emotional states are never asserted as facts — moods are user-chosen. */
  noEmotionalDiagnosis: true,
  /** Actions affecting the user's data always require explicit consent. */
  consentForUserData: true,
  /** Nothing runs autonomously without a policy gate. */
  noAutonomousExecution: true,
} as const;
