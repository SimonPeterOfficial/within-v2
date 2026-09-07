/**
 * LYRA — Action proposal & validation pipeline.
 *
 * The intelligence never mutates the world directly:
 *
 *   CONTEXT → PROPOSAL → SAFETY CHECK → PERMISSION CHECK
 *           → (authorized caller executes) → AUDIT
 *
 * This module owns the middle of that chain. `evaluateAction` is pure:
 * given a proposal and the acting user's real server context, it returns
 * an explicit decision. Execution itself stays with existing, authorized
 * services (content-service, studio, auth/server) — Lyra never touches
 * the database.
 */

import {
  getCapability,
  effectiveAutonomy,
  type AutonomyLevel,
  type Capability,
} from "@/lib/lyra/capabilities";
import { can } from "@/lib/auth/authorization";
import type { UserRole } from "@/lib/db/schema";

/** A proposed action, produced by reasoning — never executed unchecked. */
export type LyraActionProposal = {
  /** Capability this action claims to exercise. */
  capability: string;
  /** Human explanation of the intent — what would happen and why. */
  reason: string;
  /** Safe, structured payload — no credentials, no free-form secrets. */
  payload?: Record<string, unknown>;
};

/** The decision returned for every proposal. */
export type LyraActionDecision =
  | {
      allowed: true;
      capability: Capability;
      autonomy: AutonomyLevel;
      /** SAFE_AUTOMATIC actions may run unattended; others wait for the user. */
      requiresUserConsent: boolean;
      requiresAudit: boolean;
    }
  | { allowed: false; reason: string };

/** The acting user's real server context — resolved from the session, never the browser. */
export type ActingUser = {
  id: string;
  role: UserRole;
  /** Age-aware policy hook; "minor" restricts autonomous execution. */
  ageGroup?: "adult" | "minor";
  /** Account standing — suspended users have no capability at all. */
  status?: "active" | "suspended" | "deleted";
};

/** A conservative deny — every refusal explains itself. */
function deny(reason: string): LyraActionDecision {
  return { allowed: false, reason };
}

/**
 * Evaluates a proposal against the capability policy. Fails closed:
 * unknown capability, inactive user, missing permission, or human-only
 * autonomy all deny — never assume permission.
 */
export function evaluateAction(
  proposal: LyraActionProposal,
  user: ActingUser | null,
): LyraActionDecision {
  const capability = getCapability(proposal.capability);
  if (!capability) return deny("Unknown capability — not in the registry.");

  if (!user) return deny("No authenticated user — nothing acts anonymously.");

  if (user.status && user.status !== "active") {
    return deny("This account cannot exercise capabilities right now.");
  }

  // Permission check against the real role vocabulary.
  if (!can({ role: user.role }, capability.requiredPermission as Parameters<typeof can>[1])) {
    return deny("The user's role does not grant this capability.");
  }

  const autonomy = effectiveAutonomy(capability, user.ageGroup ?? "adult");

  if (autonomy === "HUMAN_ONLY") {
    return deny("This action belongs to the user alone — the intelligence may not execute it.");
  }

  return {
    allowed: true,
    capability,
    autonomy,
    // SUGGEST and USER_APPROVAL always wait for an explicit user decision.
    requiresUserConsent: autonomy === "SUGGEST" || autonomy === "USER_APPROVAL",
    requiresAudit: capability.audited,
  };
}

/**
 * One-line, human-safe description of a decision — for Auri to speak.
 * Never exposes thresholds or internal detection details.
 */
export function describeDecision(decision: LyraActionDecision): string {
  if (!decision.allowed) {
    return "I can't do that for you — it stays in your hands.";
  }
  if (decision.requiresUserConsent) {
    return "Here's what I'd suggest — you decide.";
  }
  return "Done, quietly.";
}
