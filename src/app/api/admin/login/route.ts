/**
 * POST /api/admin/login
 *
 * Server-side admin authentication. Verifies the password against
 * the ADMIN_PASSWORD environment variable and creates a signed session cookie.
 *
 * SECURITY:
 *   - Password is compared server-side, never exposed to client
 *   - Session cookie is httpOnly + secure + signed
 *   - No admin credentials in client JavaScript
 *   - Timing-safe comparison prevents timing attacks
 */

import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSession,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { ok: false, error: "Password is required." },
        { status: 400 }
      );
    }

    // Verify against the environment variable — server-side only
    if (!verifyAdminCredentials(password)) {
      // Same error for wrong password and missing account — never leak which
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Create signed session cookie
    await createAdminSession();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Authentication failed." },
      { status: 500 }
    );
  }
}
