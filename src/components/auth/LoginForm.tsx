"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** OAuth button — architecturally ready, clearly communicates availability. */
function OAuthButton({
  provider,
  icon,
  onClick,
  disabled,
}: {
  provider: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="pill-glass w-full px-5 py-3 text-[13px] font-medium disabled:opacity-40"
    >
      <span aria-hidden className="chip-glass h-7 w-7 text-[11px]">
        {icon}
      </span>
      Continue with {provider}
    </button>
  );
}

/** Divider between OAuth and email */
function AuthDivider() {
  return (
    <div className="relative flex items-center gap-4">
      <div className="h-px flex-1 bg-[#262143]/15" />
      <span className="tagline-caps text-[8.5px]">or</span>
      <div className="h-px flex-1 bg-[#262143]/15" />
    </div>
  );
}

/** Log in — field validation, service round-trip, and a gentle way home. */
export default function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const errorRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const clearError = (field: keyof Errors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Errors = {};
    if (!EMAIL_RE.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    const result = await signIn({ email, password, remember });
    setLoading(false);

    if (!result.ok) {
      setFormError(result.error);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";
    router.push(target);
  };

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider);
    try {
      const result = await fetch(`/api/auth/oauth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl: window.location.pathname }),
      });
      const data = (await result.json()) as { ok: boolean; error?: string };
      if (!result.ok || !data.ok) {
        setFormError(data.error ?? `${provider} sign-in is not available.`);
      }
    } catch {
      setFormError(`${provider} sign-in is not available.`);
    } finally {
      setOauthLoading(null);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Heading — contextual to login vs signup */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="font-display text-[30px] font-medium leading-[1.12] tracking-[-0.02em] ink-title">
          Return to your <span className="italic text-[#8a7bd6]">universe</span>.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed ink-body">
          It was never gone. It was keeping your place.
        </p>
      </motion.div>

      <AnimatePresence>
        {formError && (
          <div ref={errorRef} tabIndex={-1} className="outline-none">
            <FormStatus variant="error">{formError}</FormStatus>
          </div>
        )}
      </AnimatePresence>

      {/* OAuth buttons — architecturally ready */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2.5"
      >
        <OAuthButton
          provider="Google"
          icon="🌐"
          disabled={!!oauthLoading}
          onClick={() => handleOAuth("Google")}
        />
        <OAuthButton
          provider="Apple"
          icon="🍎"
          disabled={!!oauthLoading}
          onClick={() => handleOAuth("Apple")}
        />
        {oauthLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[11px] ink-faint"
          >
            Opening the {oauthLoading} gate…
          </motion.p>
        )}
      </motion.div>

      <AuthDivider />

      <AuthInput
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(value) => {
          setEmail(value);
          clearError("email");
          setFormError(null);
        }}
        error={errors.email}
      />
      <AuthInput
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearError("password");
          setFormError(null);
        }}
        error={errors.password}
        toggle
      />

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] ink-body">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded-full border-white/70 bg-white/60 accent-[#7c6ce0]"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-[13px] font-medium ink-body transition hover:text-[#7c6ce0]"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="pill-lit crystal-press crystal-focus relative mt-2 w-full py-3.5 text-[13px] font-semibold"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#392f66]/25 border-t-[#392f66]/85" />
            Entering…
          </span>
        ) : (
          "Enter WithIn"
        )}
      </button>

      <p className="text-center text-[13px] ink-body">
        New to WithIn?{" "}
        <Link href="/signup" className="font-semibold ink-title transition hover:text-[#7c6ce0]">
          Begin your story
        </Link>
      </p>
    </form>
  );
}
