/**
 * POST /api/auth/oauth/[provider]
 *
 * OAuth sign-in/sign-up entry point for third-party providers (Google,
 * Apple, etc.). This route is intentionally not yet wired to any OAuth
 * provider — it returns an honest error so the frontend can surface it to
 * the user rather than pretending the flow works.
 *
 * To enable a provider:
 *   1. Register the application with the provider (Google Cloud Console,
 *      Apple Developer portal) to obtain a client ID and secret/key.
 *   2. Add the credentials to environment variables (GOOGLE_CLIENT_ID,
 *      GOOGLE_CLIENT_SECRET, APPLE_CLIENT_ID, APPLE_TEAM_ID, etc.).
 *   3. Implement the provider authorization URL redirect and callback
 *      exchange in this route.
 *   4. Create or link the WithIn account and issue a session cookie.
 *
 * Until then, email/password sign-up and sign-in remain the only
 * authentication methods.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const PROVIDER_DISPLAY_NAME: Record<string, string> = {
  google: "Google",
  apple: "Apple",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider } = await params;
  const body = await request.json().catch(() => ({}));

  // No OAuth provider is configured yet. Return an honest error so the
  // client can surface it to the user. Do not fabricate a redirect URL,
  // session, or user account — that would misrepresent the system's state.
  const displayName = PROVIDER_DISPLAY_NAME[provider] ?? provider;
  const callbackUrl =
    typeof body.callbackUrl === "string" ? body.callbackUrl : "/";

  return NextResponse.json(
    {
      ok: false,
      error: `Sign-up with ${displayName} is not yet configured. Use email to create your account instead.`,
      provider,
      callbackUrl,
    },
    { status: 400 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: "OAuth is not yet configured. Use email to sign in." },
    { status: 400 },
  );
}
