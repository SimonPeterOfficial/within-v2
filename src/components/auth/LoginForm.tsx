"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Log in — field validation, service round-trip, and a gentle way home. */
export default function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const errorRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Move focus to the banner so screen readers announce the failure.
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    router.push("/home");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome <GradientText>back</GradientText>.
        </h1>
        <p className="mt-2 text-sm text-gray-400">Log in to continue your story.</p>
      </div>

      <AnimatePresence>
        {formError && (
          <div ref={errorRef} tabIndex={-1} className="outline-none">
            <FormStatus variant="error">{formError}</FormStatus>
          </div>
        )}
      </AnimatePresence>

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

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading && <Icon name="loader" size={15} className="mr-2 animate-spin" />}
        {loading ? "Entering…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-gray-400">
        New to WithIn?{" "}
        <Link href="/signup" className="font-semibold text-white transition hover:text-emerald-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}
