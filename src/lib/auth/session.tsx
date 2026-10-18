"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  authService,
  fetchCurrentSession,
  type SessionRestoreResult,
} from "@/lib/auth/service";
import type { AuthSession, AuthUser, SignInInput, SignUpInput } from "@/lib/auth/types";
import { useAuth } from "@clerk/nextjs";

type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "linking_required";

type SessionResult = { ok: true } | { ok: false; error: string };

type SessionContextValue = {
  status: SessionStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  /** Set when status is "linking_required" — Clerk user needs to link to a local WITHIN account. */
  clerkUserId: string | null;
  signIn: (input: SignInInput) => Promise<SessionResult>;
  signUp: (input: SignUpInput) => Promise<SessionResult>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<SessionResult>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Clerk-auth session wrapper — calls `useAuth()` unconditionally (satisfying
 * React's rules of hooks) and passes Clerk sign-out state to AuthProvider.
 * Only rendered when ClerkProvider is present in the tree.
 */
export function ClerkAuthWrapper({ children }: { children: ReactNode }) {
  const { signOut: clerkSignOut, isLoaded: clerkIsLoaded } = useAuth();
  return (
    <AuthProvider clerkSignOut={clerkSignOut} clerkIsLoaded={clerkIsLoaded}>
      {children}
    </AuthProvider>
  );
}

/**
 * App-wide session provider.
 *
 * Supports both authentication methods during the Clerk coexistence period:
 *   - Legacy custom session (within-session cookie)
 *   - Clerk authentication (resolved to local WITHIN user via /api/auth/me)
 *
 * Accepts optional Clerk sign-out and loaded state. When Clerk is not
 * configured, these are no-ops and the legacy system works unchanged.
 *
 * Hydration-safe by design: `status` starts as `"loading"` on both the server
 * and the first client pass (identical SSR HTML), then the persisted session
 * is resolved inside an effect. Components branch on `status` only after
 * hydration, so redirects and user-dependent UI never mismatch.
 */
export function AuthProvider({
  children,
  clerkSignOut,
  clerkIsLoaded = true,
}: {
  children: ReactNode;
  clerkSignOut?: () => Promise<void>;
  clerkIsLoaded?: boolean;
}) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [clerkUserId, setClerkUserId] = useState<string | null>(null);
  const router = useRouter();

  // Redirect to account linking when Clerk-authenticated but unmapped.
  useEffect(() => {
    if (status === "linking_required") {
      router.push("/account-link");
    }
  }, [status, router]);

  // Restore the real session from the server exactly once, after hydration.
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      void fetchCurrentSession().then((result: SessionRestoreResult) => {
        if (cancelled) return;
        if (result.status === "authenticated") {
          setSession(result.session);
          setStatus("authenticated");
          setClerkUserId(null);
        } else if (result.status === "linking_required") {
          setSession(null);
          setStatus("linking_required");
          setClerkUserId(result.clerkUserId);
        } else {
          setSession(null);
          setStatus("unauthenticated");
          setClerkUserId(null);
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  const applySession = useCallback((next: AuthSession | null) => {
    setSession(next);
    setStatus(next ? "authenticated" : "unauthenticated");
    setClerkUserId(null);
  }, []);

  const signIn = useCallback(
    async (input: SignInInput): Promise<SessionResult> => {
      const result = await authService.signIn(input);
      if (result.ok) applySession(result.session);
      return result;
    },
    [applySession]
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<SessionResult> => {
      const result = await authService.signUp(input);
      if (result.ok) applySession(result.session);
      return result;
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    // Sign out from both legacy and Clerk sessions.
    await authService.signOut();
    if (clerkSignOut) {
      try {
        await clerkSignOut();
      } catch {
        /* Clerk sign-out failure does not block legacy sign-out */
      }
    }
    applySession(null);
  }, [applySession, clerkSignOut]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<SessionResult> => authService.requestPasswordReset(email),
    []
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      clerkUserId,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
    }),
    [status, session, clerkUserId, signIn, signUp, signOut, requestPasswordReset]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Reads the session state and auth actions. Must be used within an AuthProvider or ClerkAuthWrapper. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an AuthProvider or ClerkAuthWrapper.");
  }
  return context;
}
