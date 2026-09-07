/**
 * LYRA — Capability registry & autonomy policy.
 *
 * Every capability the intelligence layer may ever exercise is declared
 * here with its risk level and autonomy boundary. Nothing in this file
 * executes anything: it is the policy layer that action proposals must
 * pass through before an executor may run them.
 *
 * Autonomy levels:
 *   0 OBSERVE          — understand context, change nothing
 *   1 SUGGEST          — recommend; the user decides
 *   2 SAFE_AUTOMATIC   — low-risk, predefined actions may run unattended
 *   3 USER_APPROVAL    — sensitive; requires an explicit user decision
 *   4 HUMAN_ONLY       — the intelligence may never execute this
 *
 * Safety invariants (enforced by `evaluateAction`, never assumed):
 *   • No financial, ownership, or account actions at any level.
 *   • No publishing, messaging, or relationship decisions.
 *   • No access beyond the acting user's own scope.
 *   • Age-restricted capabilities degrade to SUGGEST for younger users.
 */

/** Autonomy level — how much independence a capability may have. */
export type AutonomyLevel =
  | "OBSERVE"
  | "SUGGEST"
  | "SAFE_AUTOMATIC"
  | "USER_APPROVAL"
  | "HUMAN_ONLY";

/** Risk classes drive conservative defaults for unknown contexts. */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Who may execute a capability. */
export type CapabilityActor = "system" | "user" | "moderator";

/** A declared capability — policy data, never code. */
export type Capability = {
  name: string;
  description: string;
  risk: RiskLevel;
  autonomy: AutonomyLevel;
  /** Server permission (lib/auth/authorization vocabulary) it maps onto. */
  requiredPermission: string;
  actor: CapabilityActor;
  /** Whether the capability must respect age-aware restrictions. */
  ageAware: boolean;
  /** Every execution must leave an audit trail. */
  audited: boolean;
};

const CAPABILITIES = {
  /* Reading context — observe only. */
  READ_HOME_CONTEXT: {
    name: "READ_HOME_CONTEXT",
    description: "Read the signed-in user's own high-level home context (counts, statuses).",
    risk: "low",
    autonomy: "OBSERVE",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },
  READ_LIBRARY_CONTEXT: {
    name: "READ_LIBRARY_CONTEXT",
    description: "Read the user's own saved/in-progress library references.",
    risk: "low",
    autonomy: "OBSERVE",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },
  READ_CREATOR_CONTEXT: {
    name: "READ_CREATOR_CONTEXT",
    description: "Read the creator's own studio counts and content states.",
    risk: "low",
    autonomy: "OBSERVE",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },

  /* Generation — suggestions the user chooses to act on. */
  GENERATE_SUGGESTION: {
    name: "GENERATE_SUGGESTION",
    description: "Produce a suggestion the user may accept or ignore.",
    risk: "low",
    autonomy: "SUGGEST",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },
  GENERATE_SUMMARY: {
    name: "GENERATE_SUMMARY",
    description: "Summarize the user's own activity (while-you-were-away, notifications).",
    risk: "low",
    autonomy: "SAFE_AUTOMATIC",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },
  ORGANIZE_NOTIFICATIONS: {
    name: "ORGANIZE_NOTIFICATIONS",
    description: "Group and prioritize the user's own notification queue.",
    risk: "low",
    autonomy: "SAFE_AUTOMATIC",
    requiredPermission: "content.edit.own",
    actor: "system",
    ageAware: true,
    audited: false,
  },

  /* Mutations — always behind the user's own hand. */
  CREATE_DRAFT: {
    name: "CREATE_DRAFT",
    description: "Open a new draft owned by the user.",
    risk: "medium",
    autonomy: "USER_APPROVAL",
    requiredPermission: "content.create",
    actor: "user",
    ageAware: true,
    audited: true,
  },
  CHANGE_SAFE_ATMOSPHERE: {
    name: "CHANGE_SAFE_ATMOSPHERE",
    description: "Adjust the user's chosen atmosphere (mood/atmosphere preferences).",
    risk: "medium",
    autonomy: "USER_APPROVAL",
    requiredPermission: "content.edit.own",
    actor: "user",
    ageAware: true,
    audited: false,
  },

  /* Permanently human territory. */
  PUBLISH_CONTENT: {
    name: "PUBLISH_CONTENT",
    description: "Publish the creator's own approved content.",
    risk: "high",
    autonomy: "HUMAN_ONLY",
    requiredPermission: "content.publish.own",
    actor: "user",
    ageAware: true,
    audited: true,
  },
  SEND_MESSAGE: {
    name: "SEND_MESSAGE",
    description: "Send a message on the user's behalf.",
    risk: "high",
    autonomy: "HUMAN_ONLY",
    requiredPermission: "content.edit.own",
    actor: "user",
    ageAware: true,
    audited: true,
  },
  CHANGE_OWNERSHIP: {
    name: "CHANGE_OWNERSHIP",
    description: "Transfer account or content ownership.",
    risk: "critical",
    autonomy: "HUMAN_ONLY",
    requiredPermission: "settings.manage",
    actor: "moderator",
    ageAware: false,
    audited: true,
  },
  SPEND_MONEY: {
    name: "SPEND_MONEY",
    description: "Any financial action. Permanently outside the intelligence layer.",
    risk: "critical",
    autonomy: "HUMAN_ONLY",
    requiredPermission: "settings.manage",
    actor: "moderator",
    ageAware: false,
    audited: true,
  },
} as const satisfies Record<string, Capability>;

export type CapabilityName = keyof typeof CAPABILITIES;

/** The registry — read-only. */
export const CAPABILITY_REGISTRY: Readonly<Record<CapabilityName, Capability>> = CAPABILITIES;

/** Looks a capability up by name; unknown names are simply not capabilities. */
export function getCapability(name: string): Capability | null {
  return (CAPABILITIES as Record<string, Capability>)[name] ?? null;
}

/**
 * Age-aware degradation — for younger users, capabilities that would
 * create autonomous traces degrade from automatic to suggestion level.
 * This is a policy hook, applied wherever a caller knows the age group.
 */
export function effectiveAutonomy(capability: Capability, ageGroup: "adult" | "minor" = "adult"): AutonomyLevel {
  if (!capability.ageAware || ageGroup !== "minor") return capability.autonomy;
  if (capability.autonomy === "SAFE_AUTOMATIC") return "SUGGEST";
  return capability.autonomy;
}
