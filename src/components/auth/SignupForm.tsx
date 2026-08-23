"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import PasswordStrength from "@/components/auth/PasswordStrength";
import GradientText from "@/components/ui/GradientText";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Errors = { name?: string; email?: string; password?: string };

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

/** Create an account — validation, strength feedback, then straight to onboarding. */
export default function SignupForm() {
  const router = useRouter();
  const { signUp } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const errorRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (name.trim().length < 2) nextErrors.name = "Tell us a name (at least 2 characters).";
    if (!EMAIL_RE.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setLoading(true);
    const result = await signUp({ name, email, password });
    setLoading(false);

    if (!result.ok) {
      setFormError(result.error);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    router.push("/onboarding");
  };

  const handleOAuth = (provider: string) => {
    setOauthLoading(provider);
    setTimeout(() => {
      setFormError(`${provider} sign-up is coming soon. Use email for now.`);
      setOauthLoading(null);
      requestAnimationFrame(() => errorRef.current?.focus());
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Heading */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">
          Come a little further{" "}
          <GradientText className="italic">Within</GradientText>.
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-gray-400/70">
          A few quiet questions, then the world tunes itself to you.
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
        id="signup-name"
        label="Name"
        autoComplete="name"
        placeholder="Your name"
        required
        value={name}
        onChange={(value) => {
          setName(value);
          clearError("name");
          setFormError(null);
        }}
        error={errors.name}
      />
      <AuthInput
        id="signup-email"
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
      <div className="space-y-3">
        <AuthInput
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
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
        <PasswordStrength value={password} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 py-3.5 text-[13px] font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            Creating your sanctuary…
          </span>
        ) : (
          "Enter WithIn"
        )}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white transition hover:text-emerald-300">
          Log in
        </Link>
      </p>
    </form>
  );
}
