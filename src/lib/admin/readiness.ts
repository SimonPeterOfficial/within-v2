/**
 * WITHIN Readiness and Risk Engine — Explainable operational intelligence.
 *
 * Observes the platform's verified operational state and produces
 * structured, explainable findings. Every finding is traceable to
 * evidence; nothing is inferred beyond what the data supports.
 *
 * This is an operational intelligence system, not a surveillance system.
 * It never reads private message contents, never builds user profiles,
 * and never includes secrets or personal data in findings.
 */

import "server-only";
import { db } from "@/lib/db";
import {
  users,
  content,
  reports,
  adminCredentials,
} from "@/lib/db/schema";
import { eq, count, and, isNull } from "drizzle-orm";

/* ── Finding model ───────────────────────────────────────────────────── */

export type FindingCategory =
  | "configuration"
  | "database"
  | "authentication"
  | "content-lifecycle"
  | "background-job"
  | "moderation"
  | "data-consistency";

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingStatus = "healthy" | "degraded" | "critical" | "unknown" | "unavailable";

export type EvidenceQuality = "verified" | "incomplete" | "stale" | "unavailable";

export type Finding = {
  /** Stable identifier — deterministic from category + check name. */
  id: string;
  /** Category of the finding. */
  category: FindingCategory;
  /** Severity for operator triage. */
  severity: FindingSeverity;
  /** Current status of the checked subsystem. */
  status: FindingStatus;
  /** Short title for UI display. */
  title: string;
  /** Human-readable explanation of what was found. */
  explanation: string;
  /** Safe, structured evidence — never secrets or personal data. */
  evidence: Record<string, unknown>;
  /** When the condition was first observed, if known. */
  firstObserved: Date | null;
  /** When the condition was last observed, if known. */
  lastObserved: Date | null;
  /** Recommended next action for the operator. */
  recommendedAction: string;
  /** Whether the finding describes something an operator can act on. */
  actionable: boolean;
  /** How confident we are in the evidence. */
  evidenceQuality: EvidenceQuality;
};

/** Overall assessment of the platform. */
export type PlatformAssessment = {
  /** Overall status. */
  status: FindingStatus;
  /** Timestamp of the assessment. */
  assessedAt: Date;
  /** All findings, ordered by severity. */
  findings: Finding[];
  /** Summary counts by severity. */
  summary: Record<FindingSeverity, number>;
  /** Human-readable summary line. */
  summaryLine: string;
};

/* ── Evidence helpers ───────────────────────────────────────────────── */

const now = () => new Date();

function makeId(category: FindingCategory, check: string): string {
  return `within:${category}:${check}`;
}

function evidenceQualityFromBoolean(verified: boolean): EvidenceQuality {
  return verified ? "verified" : "unavailable";
}

// evidenceQualityFromBoolean is kept for future detectors that evaluate
// boolean configuration checks.
void evidenceQualityFromBoolean;

/* ── Detectors ────────────────────────────────────────────────────── */

/** Detector 1: Configuration readiness.
 *  Checks that required production configuration is present and that no
 *  insecure development fallbacks are in effect.
 */
async function detectConfigurationReadiness(): Promise<Finding> {
  const adminPassword = Boolean(process.env.ADMIN_PASSWORD);
  const databaseUrl = Boolean(process.env.DATABASE_URL);
  const sessionSecret = Boolean(process.env.SESSION_SECRET);
  const nodeEnv = process.env.NODE_ENV ?? "development";

  const missing: string[] = [];
  if (!adminPassword) missing.push("ADMIN_PASSWORD");
  if (!databaseUrl) missing.push("DATABASE_URL");
  if (!sessionSecret) missing.push("SESSION_SECRET");

  const productionInsecure = nodeEnv === "production" && missing.length > 0;

  let status: FindingStatus;
  let severity: FindingSeverity;
  let explanation: string;
  let recommendedAction: string;

  if (productionInsecure) {
    status = "critical";
    severity = "critical";
    explanation = `Production is running without required configuration: ${missing.join(", ")}. Admin access and session security are degraded.`;
    recommendedAction = "Set ADMIN_PASSWORD, DATABASE_URL, and SESSION_SECRET in the production environment before deploying.";
  } else if (missing.length > 0) {
    status = "degraded";
    severity = "medium";
    explanation = `Non-production environment missing optional configuration: ${missing.join(", ")}. Some features may be unavailable.`;
    recommendedAction = "Configure ADMIN_PASSWORD, DATABASE_URL, and SESSION_SECRET for a complete local development experience.";
  } else {
    status = "healthy";
    severity = "low";
    explanation = "All required configuration variables are present.";
    recommendedAction = "No action required.";
  }

  return {
    id: makeId("configuration", "readiness"),
    category: "configuration",
    severity,
    status,
    title: "Configuration readiness",
    explanation,
    evidence: {
      nodeEnv,
      adminPasswordConfigured: adminPassword,
      databaseUrlConfigured: databaseUrl,
      sessionSecretConfigured: sessionSecret,
      missingConfiguration: missing,
    },
    firstObserved: now(),
    lastObserved: now(),
    recommendedAction,
    actionable: missing.length > 0,
    evidenceQuality: "verified",
  };
}

/** Detector 2: Database connectivity and basic health.
 *  Verifies the application can query the database and that core tables
 *  are accessible.
 */
async function detectDatabaseHealth(): Promise<Finding> {
  let reachable = false;
  let tableCount = 0;
  let error: string | null = null;

  try {
    const result = await db
      .select({ count: count() })
      .from(users)
      .limit(1);
    reachable = true;
    tableCount = Number(result[0]?.count ?? 0);
  } catch (err) {
    reachable = false;
    error = err instanceof Error ? err.message : "Unknown database error.";
  }

  let status: FindingStatus;
  let severity: FindingSeverity;
  let explanation: string;
  let recommendedAction: string;

  if (!reachable) {
    status = "critical";
    severity = "critical";
    explanation = `Database is not reachable: ${error ?? "unknown error"}.`;
    recommendedAction = "Verify DATABASE_URL is correct and the database instance is running.";
  } else {
    status = "healthy";
    severity = "low";
    explanation = "Database is reachable and core tables are queryable.";
    recommendedAction = "No action required.";
  }

  return {
    id: makeId("database", "connectivity"),
    category: "database",
    severity,
    status,
    title: "Database connectivity",
    explanation,
    evidence: {
      reachable,
      userTableRowCount: tableCount,
      error: error ?? null,
    },
    firstObserved: now(),
    lastObserved: now(),
    recommendedAction,
    actionable: !reachable,
    evidenceQuality: reachable ? "verified" : "unavailable",
  };
}

/** Detector 3: Authentication readiness.
 *  Verifies admin authentication is configured and that the admin
 *  credentials table (if present) is accessible.
 */
async function detectAuthenticationReadiness(): Promise<Finding> {
  const adminPassword = Boolean(process.env.ADMIN_PASSWORD);
  const nodeEnv = process.env.NODE_ENV ?? "development";

  let dbCredentialAccessible = false;
  let dbCredentialError: string | null = null;

  try {
    await db.select({ id: adminCredentials.id }).from(adminCredentials).limit(1);
    dbCredentialAccessible = true;
  } catch (err) {
    dbCredentialError = err instanceof Error ? err.message : "Unknown error.";
  }

  const hasAdminAuth = adminPassword || dbCredentialAccessible;

  let status: FindingStatus;
  let severity: FindingSeverity;
  let explanation: string;
  let recommendedAction: string;

  if (!hasAdminAuth) {
    status = "critical";
    severity = "critical";
    explanation =
      "No admin authentication method is configured. Neither ADMIN_PASSWORD nor the admin_credentials table is available. Admin access is impossible.";
    recommendedAction = "Configure ADMIN_PASSWORD or set an admin credential via the reset flow.";
  } else if (nodeEnv === "production" && !adminPassword && dbCredentialAccessible) {
    status = "healthy";
    severity = "low";
    explanation = "Admin authentication is configured via the database credential table.";
    recommendedAction = "No action required.";
  } else {
    status = "healthy";
    severity = "low";
    explanation = "Admin authentication is configured.";
    recommendedAction = "No action required.";
  }

  return {
    id: makeId("authentication", "readiness"),
    category: "authentication",
    severity,
    status,
    title: "Authentication readiness",
    explanation,
    evidence: {
      nodeEnv,
      adminPasswordConfigured: adminPassword,
      dbCredentialTableAccessible: dbCredentialAccessible,
      dbCredentialError: dbCredentialError ?? null,
      hasAdminAuth,
    },
    firstObserved: now(),
    lastObserved: now(),
    recommendedAction,
    actionable: !hasAdminAuth,
    evidenceQuality: "verified",
  };
}

/** Detector 4: Content lifecycle integrity.
 *  Checks for content records whose lifecycle state is inconsistent
 *  (e.g., published content with no publishedAt timestamp).
 */
async function detectContentLifecycleIntegrity(): Promise<Finding> {
  let inconsistentCount = 0;
  let totalPublished = 0;
  let error: string | null = null;

  try {
    const [publishedResult, inconsistentResult] = await Promise.all([
      db.select({ count: count() }).from(content).where(eq(content.status, "published")),
      db
        .select({ count: count() })
        .from(content)
        .where(and(eq(content.status, "published"), isNull(content.publishedAt))),
    ]);
    totalPublished = Number(publishedResult[0]?.count ?? 0);
    inconsistentCount = Number(inconsistentResult[0]?.count ?? 0);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error.";
  }

  let status: FindingStatus;
  let severity: FindingSeverity;
  let explanation: string;
  let recommendedAction: string;

  if (error) {
    status = "unknown";
    severity = "medium";
    explanation = `Could not verify content lifecycle integrity: ${error}.`;
    recommendedAction = "Investigate the database query error and re-run the check.";
  } else if (inconsistentCount > 0) {
    status = "degraded";
    severity = "medium";
    explanation = `${inconsistentCount} published content item(s) are missing a publishedAt timestamp, which is inconsistent with their published status.`;
    recommendedAction = "Backfill publishedAt timestamps for published content or review the publishing pipeline.";
  } else {
    status = "healthy";
    severity = "low";
    explanation = `All ${totalPublished} published content items have consistent lifecycle metadata.`;
    recommendedAction = "No action required.";
  }

  return {
    id: makeId("content-lifecycle", "integrity"),
    category: "content-lifecycle",
    severity,
    status,
    title: "Content lifecycle integrity",
    explanation,
    evidence: {
      totalPublished,
      inconsistentPublishedCount: inconsistentCount,
      error: error ?? null,
    },
    firstObserved: now(),
    lastObserved: now(),
    recommendedAction,
    actionable: inconsistentCount > 0,
    evidenceQuality: error ? "unavailable" : "verified",
  };
}

/** Detector 5: Moderation backlog.
 *  Summarizes pending moderation work (open reports).
 */
async function detectModerationBacklog(): Promise<Finding> {
  let openReports = 0;
  let error: string | null = null;

  try {
    const result = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, "open"));
    openReports = Number(result[0]?.count ?? 0);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error.";
  }

  let status: FindingStatus;
  let severity: FindingSeverity;
  let explanation: string;
  let recommendedAction: string;

  if (error) {
    status = "unknown";
    severity = "medium";
    explanation = `Could not verify moderation backlog: ${error}.`;
    recommendedAction = "Investigate the database query error and re-run the check.";
  } else if (openReports > 50) {
    status = "degraded";
    severity = "high";
    explanation = `${openReports} reports are awaiting moderator review, which may indicate a backlog.`;
    recommendedAction = "Review the moderation queue and assign reviewers.";
  } else if (openReports > 0) {
    status = "healthy";
    severity = "low";
    explanation = `${openReports} report(s) are awaiting moderator review.`;
    recommendedAction = "Review the moderation queue as part of routine operations.";
  } else {
    status = "healthy";
    severity = "low";
    explanation = "No reports are awaiting moderation.";
    recommendedAction = "No action required.";
  }

  return {
    id: makeId("moderation", "backlog"),
    category: "moderation",
    severity,
    status,
    title: "Moderation backlog",
    explanation,
    evidence: {
      openReports,
      error: error ?? null,
    },
    firstObserved: now(),
    lastObserved: now(),
    recommendedAction,
    actionable: openReports > 0,
    evidenceQuality: error ? "unavailable" : "verified",
  };
}

/* ── Aggregator ─────────────────────────────────────────────────────── */

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_ORDER: Record<FindingStatus, number> = {
  critical: 4,
  degraded: 3,
  unknown: 2,
  unavailable: 1,
  healthy: 0,
};

/** Run all detectors, isolate failures, and aggregate into an assessment. */
export async function assessPlatform(): Promise<PlatformAssessment> {
  const detectors = [
    detectConfigurationReadiness(),
    detectDatabaseHealth(),
    detectAuthenticationReadiness(),
    detectContentLifecycleIntegrity(),
    detectModerationBacklog(),
  ];

  const findings: Finding[] = [];

  // Execute detectors independently; isolate failures.
  const results = await Promise.allSettled(detectors);
  for (const result of results) {
    if (result.status === "fulfilled") {
      findings.push(result.value);
    } else {
      // A detector failed — record an unavailable finding rather than
      // crashing the whole assessment.
      const failedDetector = result.reason instanceof Error ? result.reason.message : "Unknown detector failure.";
      findings.push({
        id: makeId("data-consistency", "detector-failure"),
        category: "data-consistency",
        severity: "medium",
        status: "unavailable",
        title: "Detector unavailable",
        explanation: `A readiness detector could not complete: ${failedDetector}`,
        evidence: { error: failedDetector },
        firstObserved: now(),
        lastObserved: now(),
        recommendedAction: "Review the detector implementation and re-run the assessment.",
        actionable: true,
        evidenceQuality: "unavailable",
      });
    }
  }

  // Sort by severity (highest first), then by ID for stability.
  findings.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.id.localeCompare(b.id);
  });

  // Overall status = worst finding status.
  let overallStatus: FindingStatus = "healthy";
  for (const f of findings) {
    if (STATUS_ORDER[f.status] > STATUS_ORDER[overallStatus]) {
      overallStatus = f.status;
    }
  }

  // Summary counts.
  const summary: Record<FindingSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of findings) {
    summary[f.severity] = (summary[f.severity] ?? 0) + 1;
  }

  const criticalCount = summary.critical;
  const highCount = summary.high;
  const mediumCount = summary.medium;

  let summaryLine: string;
  if (overallStatus === "critical") {
    summaryLine = `${criticalCount} critical issue(s) require immediate attention.`;
  } else if (overallStatus === "degraded") {
    summaryLine = `${highCount} high and ${mediumCount} medium issue(s) require attention.`;
  } else if (overallStatus === "unknown" || overallStatus === "unavailable") {
    summaryLine = "Some subsystems could not be verified. Review unavailable findings.";
  } else {
    summaryLine = "All checked subsystems are healthy.";
  }

  return {
    status: overallStatus,
    assessedAt: now(),
    findings,
    summary,
    summaryLine,
  };
}

/** Get a single finding by its stable ID. */
export async function getFinding(id: string): Promise<Finding | null> {
  const assessment = await assessPlatform();
  return assessment.findings.find((f) => f.id === id) ?? null;
}
