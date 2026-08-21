import type { AuthResult, AuthService, AuthSession, ResetResult, UserRole } from "./types";

/**
 * Demo auth service — localStorage-backed, latency-simulated.
 *
 * This gives the product a REAL authentication experience end-to-end
 * (validation, wrong-password errors, duplicate-email errors, session
 * persistence, sign-out) without a backend. It is deliberately small and
 * clearly marked: passwords are hashed with a non-cryptographic hash for
 * demo purposes only, and everything lives in the browser.
 *
 * ── GOING PRODUCTION ─────────────────────────────────────────────────────
 * Implement the `AuthService` interface with Clerk (`@clerk/nextjs`) or your
 * API, then swap the export below (`authService`). No form, page, or
 * component changes are required — the entire app reads through this one
 * symbol.
 */

const USERS_KEY = "within:demo:users";
const SESSION_KEY = "within:demo:session";
const COOKIE_NAME = "within-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const LATENCY_MS = 850;

/** Admin email — the first account registered with this email gets admin role. */
const ADMIN_EMAIL = "admin@within.app";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  /** Demo-only hash — NOT secure, never ship as-is */
  passwordHash: string;
  role: UserRole;
  createdAt: number;
};

/** Tiny deterministic hash for demo password storage (not cryptographic). */
function hash(value: string): string {
  let result = 5381;
  for (let i = 0; i < value.length; i++) {
    result = (result * 33) ^ value.charCodeAt(i);
  }
  return (result >>> 0).toString(36);
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* storage unavailable — session simply won't persist */
  }
}

function createToken(): string {
  return `demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function toSession(user: StoredUser): AuthSession {
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    token: createToken(),
    createdAt: Date.now()
  };
}

/**
 * Set a session cookie that Next.js middleware can read for server-side
 * route protection. The cookie contains a base64-encoded session token —
 * NOT encrypted (demo only; production would use signed JWTs).
 */
function setSessionCookie(session: AuthSession) {
  try {
    const payload = btoa(JSON.stringify({ token: session.token, userId: session.user.id, role: session.user.role }));
    document.cookie = `${COOKIE_NAME}=${payload}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    /* storage unavailable */
  }
}

function clearSessionCookie() {
  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/** Reads the persisted session if one exists and is still valid. */
export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    const exists = readUsers().some((user) => user.id === session.user.id);
    if (!exists) return null;
    // Backfill role for sessions created before the role field existed
    const user = readUsers().find((u) => u.id === session.user.id);
    if (user && !session.user.role) {
      session.user.role = user.role;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export const authService: AuthService = {
  async signIn({ email, password, remember = true }): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    const normalized = email.trim().toLowerCase();
    const user = readUsers().find((candidate) => candidate.email === normalized);

    // Same message whether the account exists or not — never leak which.
    if (!user || user.passwordHash !== hash(password)) {
      return { ok: false, error: "Incorrect email or password." };
    }

    const session = toSession(user);
    if (remember) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        /* ignore */
      }
    }
    setSessionCookie(session);
    return { ok: true, session };
  },

  async signUp({ name, email, password }): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    const normalized = email.trim().toLowerCase();
    if (readUsers().some((user) => user.email === normalized)) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const user: StoredUser = {
      id: `user_${Date.now().toString(36)}`,
      name: name.trim(),
      email: normalized,
      passwordHash: hash(password),
      role: normalized === ADMIN_EMAIL ? "admin" : "user",
      createdAt: Date.now()
    };
    writeUsers([...readUsers(), user]);

    const session = toSession(user);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    setSessionCookie(session);
    return { ok: true, session };
  },

  async requestPasswordReset(email: string): Promise<ResetResult> {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    // Validate like a real pipeline would, but always report success — never
    // reveal whether an email is registered.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { ok: false, error: "Enter a valid email address." };
    }
    return { ok: true };
  },

  async signOut(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    clearStoredSession();
    clearSessionCookie();
  }
};

