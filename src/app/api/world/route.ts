/**
 * GET /api/world — the world pulse: honest platform aggregates only.
 * Public-safe: no user data, no private rows, nothing sensitive.
 */

import { NextResponse } from "next/server";
import { getWorldPulse } from "@/lib/world";

export async function GET() {
  const pulse = await getWorldPulse();
  return NextResponse.json({ ok: true, pulse });
}
