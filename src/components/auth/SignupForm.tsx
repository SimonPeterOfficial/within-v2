"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import PasswordStrength from "@/components/auth/PasswordStrength";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";

type Errors = { name?: string; email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Create an account — validation, strength feedback, then straight to onboarding. */
export default function SignupForm() {
  const router = useRouter();
  const { signUp } = useSession();
  const errorRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">
          Create your place <GradientText>Within</GradientText>.
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-gray-400/70">
          A few quiet questions, then the world tunes itself to you.
        </p>
      </div>

      <AnimatePresence>
        {formError && (
          <div ref={errorRef} tabIndex={-1} className="outline-none">
            <FormStatus variant="error">{formError}</FormStatus>
          </div>
        )}
      </AnimatePresence>

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

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading && <Icon name="loader" size={15} className="mr-2 animate-spin" />}
        {loading ? "Creating your sanctuary…" : "Enter WithIn"}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white transition hover:text-emerald-300">
          Log in
        </Link>
      </p>
    </form>
  );
}
