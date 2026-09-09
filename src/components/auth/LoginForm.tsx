"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import GradientText from "@/components/ui/GradientText";
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
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[13px] font-medium text-white/70 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white active:scale-[0.98] disabled:opacity-40"
    >
      <span className="text-base">{icon}</span>
      Continue with {provider}
    </button>
  );
}

/** Divider between OAuth and email */
function AuthDivider() {
  return (
    <div className="relative flex items-center gap-4">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500/50">
        or
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
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

  const handleOAuth = (provider: string) => {
    setOauthLoading(provider);
    // OAuth is architecturally ready but not yet configured.
    // In a real implementation, this would redirect to the OAuth provider.
    setTimeout(() => {
      setFormError(`${provider} sign-in is coming soon. Use email for now.`);
      setOauthLoading(null);
      requestAnimationFrame(() => errorRef.current?.focus());
    }, 800);
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
        <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">
          Welcome <GradientText className="italic">back</GradientText>.
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-gray-400/70">
          Your universe is still here.
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
            className="text-center text-[11px] text-gray-500/50"
          >
            Connecting to {oauthLoading}…
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
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-emerald-400"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-gray-400 transition hover:text-emerald-300"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="crystal-press crystal-focus relative mt-2 w-full overflow-hidden rounded-2xl py-3.5 text-[13px] font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.75))",
          boxShadow: "0 8px 28px rgba(var(--mood-rgb),0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
            Entering…
          </span>
        ) : (
          "Enter WithIn"
        )}
      </button>

      <p className="text-center text-sm text-gray-400">
        New to WithIn?{" "}
        <Link href="/signup" className="font-semibold text-white transition hover:text-emerald-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}
