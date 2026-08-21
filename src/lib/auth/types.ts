/**
 * Auth contracts — the single source of truth for every authentication
 * surface in the app. Forms, the session provider, and any future backend
 * adapter (Clerk, REST API, etc.) all speak these types, so swapping the
 * implementation never touches UI code.
 */

export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  createdAt: number;
};

export type SignInInput = {
  email: string;
  password: string;
  /** Keep the session across browser restarts (vs. session-only) */
  remember?: boolean;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: string };

export type ResetResult = { ok: true } | { ok: false; error: string };

/**
 * The auth boundary. Implement this interface to plug in a real provider —
 * the demo implementation in `./service.ts` is already wired, and a Clerk or
 * API adapter just has to fulfill these four methods.
 */
export type AuthService = {
  signIn(input: SignInInput): Promise<AuthResult>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<ResetResult>;
  signOut(): Promise<void>;
};
