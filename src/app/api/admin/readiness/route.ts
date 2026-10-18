/**
 * GET /api/admin/readiness
 *
 * Explainable platform readiness and risk assessment.
 *
 * Runs independent detectors and aggregates findings into a structured
 * assessment. Every finding is traceable to evidence; nothing is inferred
 * beyond what the data supports.
 *
 * Protected: requires a valid admin session.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";
import { assessPlatform, type PlatformAssessment } from "@/lib/admin/readiness";

export async function GET() {
  // Admin authorization — server-side session check.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!sessionCookie?.value) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }
  const session = await verifyAdminSession(sessionCookie.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }

  let assessment: PlatformAssessment;
  try {
    assessment = await assessPlatform();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Readiness assessment could not complete.",
        detail: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: assessment.status,
    assessedAt: assessment.assessedAt.toISOString(),
    summaryLine: assessment.summaryLine,
    summary: assessment.summary,
    findings: assessment.findings.map((f) => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      status: f.status,
      title: f.title,
      explanation: f.explanation,
      evidence: f.evidence,
      firstObserved: f.firstObserved?.toISOString() ?? null,
      lastObserved: f.lastObserved?.toISOString() ?? null,
      recommendedAction: f.recommendedAction,
      actionable: f.actionable,
      evidenceQuality: f.evidenceQuality,
    })),
  });
}
