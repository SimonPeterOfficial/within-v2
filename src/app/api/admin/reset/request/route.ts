/**
 * POST /api/admin/reset/request
 *
 * Request a password reset token. In development, the token is returned
 * directly in the response (since there's no email server). In production,
 * this would send an email with a reset link.
 *
 * SECURITY:
 *   - Rate limited to prevent abuse
 *   - Always returns success (never reveals if admin exists)
 *   - Token expires after 1 hour
 *   - Token is single-use (deleted on use)
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { adminResetTokens } from "@/lib/db/schema";
import { getDbAdminCredential } from "@/lib/admin/credentials";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 3 requests per hour per IP
  const clientKey = clientKeyFrom(request);
  const rateResult = rateLimit(`admin-reset:${clientKey}`, 3, 60 * 60 * 1000);
  if (!rateResult.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // An admin exists if EITHER a database-backed credential has been set
    // OR the legacy ADMIN_PASSWORD env credential is present. Never reveal
    // which source matched.
    const dbCredential = await getDbAdminCredential();
    const envCredential = process.env.ADMIN_PASSWORD;
    if (!dbCredential && !envCredential) {
      // Don't reveal whether admin exists — same response either way
      return NextResponse.json({
        ok: true,
        message: "If an admin account exists, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const token = randomBytes(32).toString("hex");

    // Store token with 1-hour expiry
    await db.insert(adminResetTokens).values({
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // In development, return the token directly
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        ok: true,
        message: "If an admin account exists, a reset link has been sent.",
        // Development-only: token returned for testing
        devToken: token,
        devResetUrl: `/admin/reset/confirm?token=${token}`,
      });
    }

    // In production, this would send an email
    // await sendAdminResetEmail(token);

    return NextResponse.json({
      ok: true,
      message: "If an admin account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[ADMIN RESET] Error requesting reset:", error);
    return NextResponse.json(
      { ok: false, error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
