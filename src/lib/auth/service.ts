/**
 * Client auth transport — speaks to the real server API.
 *
 * The `AuthService` interface is unchanged, so every form, page, and the
 * session provider keep working untouched. What changed is the truth:
 * identity now lives in Postgres, sessions are httpOnly signed cookies set
 * by the server, and this module is just the fetch client.
 *
 *   signIn/signUp      → POST /api/auth/{signin,signup}
 *   signOut            → POST /api/auth/signout
 *   fetchCurrentSession→ GET  /api/auth/me   (restores identity on mount)
 */

import type {
  AuthResult,
  AuthService,
  AuthSession,
  ResetResult,
  SignInInput,
  SignUpInput,
} from "./types";

const API = "/api/auth";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as T;
}

type ApiResult = { ok: true; session: AuthSession } | { ok: false; error: string };

function toAuthResult(result: ApiResult): AuthResult {
  return result.ok ? { ok: true, session: result.session } : { ok: false, error: result.error };
}

/** Legacy demo keys — cleared so no stale demo identity lingers. */
function clearLegacyStorage() {
  try {
    localStorage.removeItem("within:demo:users");
    localStorage.removeItem("within:demo:session");
    document.cookie = "within-session=; path=/; max-age=0; SameSite=Lax";
  } catch {
    /* ignore */
  }
}

/**
 * Result of restoring the session from the server after hydration.
 *
 *   - authenticated   → a valid session exists (legacy or Clerk-mapped)
 *   - linking_required → Clerk-authenticated but no local WITHIN mapping yet
 *   - unauthenticated → no valid session
 */
export type SessionRestoreResult =
  | { status: "authenticated"; session: AuthSession }
  | { status: "linking_required"; clerkUserId: string }
  | { status: "unauthenticated" };

/**
 * Restores the real session from the server after hydration.
 * Degrades gracefully to unauthenticated when the network is unreachable.
 */
export async function fetchCurrentSession(): Promise<SessionRestoreResult> {
  try {
    const response = await fetch(`${API}/me`, { cache: "no-store" });
    if (!response.ok) {
      // 401 with account_linking_required means Clerk-authenticated but unmapped.
      if (response.status === 401) {
        const data = (await response.json()) as {
          ok: boolean;
          error?: string;
          clerkUserId?: string;
        };
        if (data.error === "account_linking_required" && data.clerkUserId) {
          return { status: "linking_required", clerkUserId: data.clerkUserId };
        }
      }
      return { status: "unauthenticated" };
    }
    const data = (await response.json()) as { ok: boolean; session?: AuthSession };
    return data.ok && data.session
      ? { status: "authenticated", session: data.session }
      : { status: "unauthenticated" };
  } catch {
    return { status: "unauthenticated" };
  }
}

/** Kept for backward compatibility with old imports — legacy demo cleanup. */
export function getStoredSession(): AuthSession | null {
  clearLegacyStorage();
  return null;
}

export function clearStoredSession() {
  clearLegacyStorage();
}

export const authService: AuthService = {
  async signIn(input: SignInInput): Promise<AuthResult> {
    const result = await postJson<ApiResult>("/signin", input);
    return toAuthResult(result);
  },

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const result = await postJson<ApiResult>("/signup", input);
    return toAuthResult(result);
  },

  async requestPasswordReset(email: string): Promise<ResetResult> {
    // No email provider is connected yet — validate honestly and say so,
    // rather than pretending a reset link was sent.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { ok: false, error: "Enter a valid email address." };
    }
    return { ok: false, error: "Password reset isn't available yet — contact support." };
  },

  async signOut(): Promise<void> {
    await postJson<{ ok: boolean }>("/signout", {});
    clearLegacyStorage();
  },
};