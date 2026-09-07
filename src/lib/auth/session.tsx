"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { authService, fetchCurrentSession } from "@/lib/auth/service";
import type { AuthSession, AuthUser, SignInInput, SignUpInput } from "@/lib/auth/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionResult = { ok: true } | { ok: false; error: string };

type SessionContextValue = {
  status: SessionStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  signIn: (input: SignInInput) => Promise<SessionResult>;
  signUp: (input: SignUpInput) => Promise<SessionResult>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<SessionResult>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * App-wide session provider.
 *
 * Hydration-safe by design: `status` starts as `"loading"` on both the server
 * and the first client pass (identical SSR HTML), then the persisted session
 * is resolved inside an effect. Components branch on `status` only after
 * hydration, so redirects and user-dependent UI never mismatch.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  // Restore the real session from the server exactly once, after hydration.
  // Deferred into an animation frame + async fetch so the set-state-in-effect
  // rule stays satisfied while remaining hydration-safe — identical SSR HTML
  // on both passes, identity resolves from the httpOnly session cookie.
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      void fetchCurrentSession().then((stored) => {
        if (cancelled) return;
        setSession(stored);
        setStatus(stored ? "authenticated" : "unauthenticated");
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
    // The service owns persistence — it clears the stored session itself.
    await authService.signOut();
    applySession(null);
  }, [applySession]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<SessionResult> => authService.requestPasswordReset(email),
    []
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      signIn,
      signUp,
      signOut,
      requestPasswordReset
    }),
    [status, session, signIn, signUp, signOut, requestPasswordReset]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Reads the session state and auth actions. Must be used under <AuthProvider>. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an AuthProvider.");
  }
  return context;
}
